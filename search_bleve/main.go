package main

import (
	"fmt"
	"log"
	"os"
	"sort"
	"strings"
	"sync"
	"time"
	gounicode "unicode"

	"github.com/goccy/go-json"

	"github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/analysis/analyzer/custom"
	_ "github.com/blevesearch/bleve/v2/analysis/char/html"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/cjk"
	"github.com/blevesearch/bleve/v2/analysis/lang/en"
	"github.com/blevesearch/bleve/v2/analysis/token/edgengram"
	"github.com/blevesearch/bleve/v2/analysis/token/lowercase"
	_ "github.com/blevesearch/bleve/v2/analysis/token/ngram"
	"github.com/blevesearch/bleve/v2/analysis/token/unicodenorm"
	"github.com/blevesearch/bleve/v2/analysis/tokenizer/unicode"
	_ "github.com/blevesearch/bleve/v2/index/upsidedown/store/boltdb"
	bleve_search "github.com/blevesearch/bleve/v2/search"
	"github.com/blevesearch/bleve/v2/search/highlight/format/html"
	"github.com/blevesearch/bleve/v2/search/query"

	_ "github.com/go-sql-driver/mysql"
)

type Song struct {
	Number                    string `json:"number"`
	Title                     string `json:"title"`
	Singer                    string `json:"singer"`
	Lyricist                  string `json:"lyricist"`
	Composer                  string `json:"composer"`
	Service                   string `json:"service"`
	Full                      string `json:"full"`     // title-singer
	InitialConsonantsOfTitle  string `json:"icTitle"`  // 초성 제목
	InitialConsonantsOfSinger string `json:"icSinger"` // 초성 가수
	Country                   string `json:"country"`  // KOR or POP
}

func main() {
	songs, err := getSongsFromJson("songs.json")
	if err != nil {
		log.Fatalf("Error creating : %v", err)
	}

	// Create a new Bleve index
	indexPath := "songs.bleve"

	// Define custom mapping
	indexMapping := bleve.NewIndexMapping()
	err = indexMapping.AddCustomTokenFilter("edge_ngram_min_1_max_4",
		map[string]interface{}{
			"type": edgengram.Name,
			"min":  1.0,
			"max":  4.0,
		})
	if err != nil {
		log.Fatalf("Error creating custom analyzer: %v", err)
	}

	err = indexMapping.AddCustomTokenFilter("unicodeNormalizer",
		map[string]interface{}{
			"type": unicodenorm.Name,
			"form": unicodenorm.NFKC,
		})
	if err != nil {
		log.Fatalf("Error creating custom token filter: %v", err)
	}

	// Korean analyzer: normalize -> lowercase -> CJK bigrams -> edge ngrams
	err = indexMapping.AddCustomAnalyzer("koCJKEdgeNgram",
		map[string]interface{}{
			"type":         custom.Name,
			"tokenizer":    unicode.Name,
			"char_filters": []string{html.Name},
			"token_filters": []string{
				"unicodeNormalizer",
				lowercase.Name,
				"cjk_bigram",
				"edge_ngram_min_1_max_4",
			},
		})
	if err != nil {
		log.Fatalf("Error creating custom analyzer: %v", err)
	}

	// English analyzer
	err = indexMapping.AddCustomAnalyzer("enEdgeNgram",
		map[string]interface{}{
			"type":         custom.Name,
			"tokenizer":    unicode.Name,
			"char_filters": []string{html.Name},
			"token_filters": []string{
				"unicodeNormalizer",
				lowercase.Name,
				"edge_ngram_min_1_max_4",
				en.StopName,
			},
		})
	if err != nil {
		log.Fatalf("Error creating custom analyzer: %v", err)
	}

	// indexing start
	songMapping := bleve.NewDocumentMapping()

	// Number mapping (common for all)
	numberMapping := bleve.NewTextFieldMapping()
	numberMapping.Analyzer = "koCJKEdgeNgram"
	numberMapping.Store = true
	numberMapping.IncludeTermVectors = true
	songMapping.AddFieldMappingsAt("number", numberMapping)

	// Dynamic analyzer mappings for Korean and English
	koreanTextFieldMapping := bleve.NewTextFieldMapping()
	koreanTextFieldMapping.Analyzer = "koCJKEdgeNgram"
	koreanTextFieldMapping.Store = true
	koreanTextFieldMapping.IncludeTermVectors = true

	englishTextFieldMapping := bleve.NewTextFieldMapping()
	englishTextFieldMapping.Analyzer = "enEdgeNgram"
	englishTextFieldMapping.Store = true
	englishTextFieldMapping.IncludeTermVectors = true

	// Add mappings based on language
	songMapping.AddFieldMappingsAt("title_kor", koreanTextFieldMapping)
	songMapping.AddFieldMappingsAt("title_eng", englishTextFieldMapping)
	songMapping.AddFieldMappingsAt("singer_kor", koreanTextFieldMapping)
	songMapping.AddFieldMappingsAt("singer_eng", englishTextFieldMapping)
	songMapping.AddFieldMappingsAt("lyricist_kor", koreanTextFieldMapping)
	songMapping.AddFieldMappingsAt("lyricist_eng", englishTextFieldMapping)
	songMapping.AddFieldMappingsAt("composer_kor", koreanTextFieldMapping)
	songMapping.AddFieldMappingsAt("composer_eng", englishTextFieldMapping)
	songMapping.AddFieldMappingsAt("full_kor", koreanTextFieldMapping)
	songMapping.AddFieldMappingsAt("full_eng", englishTextFieldMapping)
	songMapping.AddFieldMappingsAt("icTitle_kor", koreanTextFieldMapping)
	songMapping.AddFieldMappingsAt("icTitle_eng", englishTextFieldMapping)
	songMapping.AddFieldMappingsAt("icSinger_kor", koreanTextFieldMapping)
	songMapping.AddFieldMappingsAt("icSinger_eng", englishTextFieldMapping)

	indexMapping.AddDocumentMapping("song", songMapping)

	// finalize
	indexMapping.AddDocumentMapping("song", songMapping)

	log.Printf("Starting..")

	// Create a new Bleve index with custom settings
	index, err := bleve.New(indexPath, indexMapping)
	if err != nil {
		if len(os.Args) < 2 {
			search("바라")
		} else {
			searchTerm := strings.Join(os.Args[1:], " ")
			search(searchTerm)
		}

		log.Fatalf("Error creating index: %v", err)
	}

	// Index songs in batches with concurrency
	batchSize := 500
	numWorkers := 4
	songChannel := make(chan Song, len(songs))
	for _, song := range songs {
		songChannel <- song
	}
	close(songChannel)

	var wg sync.WaitGroup
	wg.Add(numWorkers)
	for i := 0; i < numWorkers; i++ {
		go func() {
			defer wg.Done()
			batch := index.NewBatch()
			count := 0
			for song := range songChannel {
				// Add space before parentheses
				song.Title = addSpaceBeforeParentheses(song.Title) // ex. Eminem(feat...)
				song.Singer = addSpaceBeforeParentheses(song.Singer)

				numbers := strings.Split(song.Number, ",")
				for _, number := range numbers {
					// log.Printf("🌍 %s : %s", song.Title, song.Singer)
					song.Full = getFullText(song)

					if song.Country == "KOR" {
						song.InitialConsonantsOfTitle = extractInitialConsonants(song.Title, "kor")
						song.InitialConsonantsOfSinger = extractInitialConsonants(song.Singer, "kor")
						err = batch.Index(number, map[string]interface{}{
							"title_kor":    song.Title,
							"singer_kor":   song.Singer,
							"lyricist_kor": song.Lyricist,
							"composer_kor": song.Composer,
							"full_kor":     song.Full,
							"icTitle_kor":  song.InitialConsonantsOfTitle,
							"icSinger_kor": song.InitialConsonantsOfSinger,
							"number":       song.Number,
							"country":      song.Country,
						})
						if err != nil {
							log.Fatalf("Error indexing document: %v", err)
						}
					} else {
						song.InitialConsonantsOfTitle = extractInitialConsonants(song.Title, "eng")
						song.InitialConsonantsOfSinger = extractInitialConsonants(song.Singer, "eng")
						err = batch.Index(number, map[string]interface{}{
							"title_eng":    song.Title,
							"singer_eng":   song.Singer,
							"lyricist_eng": song.Lyricist,
							"composer_eng": song.Composer,
							"full_eng":     song.Full,
							"icTitle_eng":  song.InitialConsonantsOfTitle,
							"icSinger_eng": song.InitialConsonantsOfSinger,
							"number":       song.Number,
							"country":      song.Country,
						})
						if err != nil {
							log.Fatalf("Error indexing document: %v", err)
						}
					}

					count++
					if count >= batchSize {
						err = index.Batch(batch)
						if err != nil {
							log.Fatalf("Error indexing batch: %v", err)
						}
						batch = index.NewBatch()
						count = 0
					}
				}
			}
			if count > 0 {
				err = index.Batch(batch)
				if err != nil {
					log.Fatalf("Error indexing batch: %v", err)
				}
			}
		}()
	}
	wg.Wait()

	log.Println("Indexing completed")
	index.Close()

	// Perform a search using DisjunctionQuery for more comprehensive matching
	search("Eminem")
}

func search(t string) {
	index, _ := bleve.Open("songs.bleve")
	defer index.Close()

	start := time.Now()

	terms := strings.Fields(strings.ToLower(t))
	results := make(chan *bleve.SearchResult, len(terms))
	done := make(chan struct{})

	// Use a worker pool pattern
	workerCount := 5
	var wg sync.WaitGroup
	wg.Add(workerCount)
	termChan := make(chan string, len(terms))

	for i := 0; i < workerCount; i++ {
		go func() {
			defer wg.Done()
			for term := range termChan {
				results <- performSearch(index, term)
			}
		}()
	}

	for _, term := range terms {
		termChan <- term
	}
	close(termChan)

	go func() {
		wg.Wait()
		close(results)
		done <- struct{}{}
	}()

	uniqueSongs := make(map[string]*bleve_search.DocumentMatch)
	for searchResult := range results {
		if searchResult != nil {
			consolidateResults(searchResult, uniqueSongs)
		}
	}
	<-done

	if len(uniqueSongs) > 0 {
		log.Printf("💖 found %d unique songs", len(uniqueSongs))

		// Convert the map to a slice and sort it by score
		sortedResults := make([]*bleve_search.DocumentMatch, 0, len(uniqueSongs))
		for _, hit := range uniqueSongs {
			sortedResults = append(sortedResults, hit)
		}
		sort.Slice(sortedResults, func(i, j int) bool {
			return sortedResults[i].Score > sortedResults[j].Score
		})

		// Print sorted results
		for _, hit := range sortedResults {
			log.Printf("Full 노래: %v", extractFullSong(hit))
		}
	} else {
		log.Println("No search results found")
	}

	end := time.Now()
	duration := end.Sub(start)
	log.Printf("Function runtime: %v", duration)
}

func performSearch(index bleve.Index, term string) *bleve.SearchResult {
	var subQueries []query.Query

	// number
	exactMatchQueryNumber := query.NewTermQuery(term)
	exactMatchQueryNumber.SetField("number")
	exactMatchQueryNumber.SetBoost(20.0)
	subQueries = append(subQueries, exactMatchQueryNumber)

	matchQueryNumber := query.NewMatchQuery(term)
	matchQueryNumber.SetField("number")
	matchQueryNumber.Analyzer = "koCJKEdgeNgram"
	matchQueryNumber.SetBoost(10.0)
	subQueries = append(subQueries, matchQueryNumber)

	wildcardQueryNumber := query.NewWildcardQuery("*" + term + "*")
	wildcardQueryNumber.SetField("number")
	wildcardQueryNumber.SetBoost(5.0)
	subQueries = append(subQueries, wildcardQueryNumber)

	// Korean and English titles
	subQueries = append(subQueries, buildHigherQueries(term, "title_kor", "koCJKEdgeNgram")...)
	subQueries = append(subQueries, buildHigherQueries(term, "title_eng", "enEdgeNgram")...)

	// Korean and English singers
	subQueries = append(subQueries, buildHigherQueries(term, "singer_kor", "koCJKEdgeNgram")...)
	subQueries = append(subQueries, buildHigherQueries(term, "singer_eng", "enEdgeNgram")...)

	// Full (Korean and English)
	subQueries = append(subQueries, buildQueries(term, "full_kor", "koCJKEdgeNgram")...)
	subQueries = append(subQueries, buildQueries(term, "full_eng", "enEdgeNgram")...)

	// Initial consonants (Korean and English)
	subQueries = append(subQueries, buildQueries(term, "icTitle_kor", "koCJKEdgeNgram")...)
	subQueries = append(subQueries, buildQueries(term, "icTitle_eng", "enEdgeNgram")...)
	subQueries = append(subQueries, buildQueries(term, "icSinger_kor", "koCJKEdgeNgram")...)
	subQueries = append(subQueries, buildQueries(term, "icSinger_eng", "enEdgeNgram")...)

	disjunctionQuery := bleve.NewDisjunctionQuery(subQueries...)
	searchRequest := bleve.NewSearchRequest(disjunctionQuery)
	searchRequest.Fields = []string{"*"}
	searchRequest.Size = 15 // Limit the number of results

	// Add sorting by score and number
	searchRequest.SortBy([]string{"-_score", "number"})

	searchResult, err := index.Search(searchRequest)
	if err != nil {
		log.Printf("Error performing search for term '%s': %v", term, err)
		return nil
	}
	return searchResult
}

func buildHigherQueries(term, field, analyzer string) []query.Query {

	termQuery := query.NewTermQuery(term)
	termQuery.SetField(field)
	termQuery.SetBoost(30.0)

	matchQuery := query.NewMatchQuery(term)
	matchQuery.SetField(field)
	matchQuery.Analyzer = analyzer
	matchQuery.SetBoost(20.0)

	wildQuery := query.NewWildcardQuery("*" + term + "*")
	wildQuery.SetField(field)
	wildQuery.SetBoost(15.0)

	return []query.Query{
		termQuery,
		matchQuery,
		wildQuery,
	}
}

func buildQueries(term, field, analyzer string) []query.Query {
	termQuery := query.NewTermQuery(term)
	termQuery.SetField(field)
	termQuery.SetBoost(20.0)

	matchQuery := query.NewMatchQuery(term)
	matchQuery.SetField(field)
	matchQuery.Analyzer = analyzer
	matchQuery.SetBoost(10.0)

	wildQuery := query.NewWildcardQuery("*" + term + "*")
	wildQuery.SetField(field)
	wildQuery.SetBoost(5.0)

	return []query.Query{
		termQuery,
		matchQuery,
		wildQuery,
	}
}

func consolidateResults(searchResult *bleve.SearchResult, uniqueSongs map[string]*bleve_search.DocumentMatch) {
	for _, hit := range searchResult.Hits {
		title, singer := extractTitleAndSinger(hit)
		key := fmt.Sprintf("%s-%s", title, singer)
		if existingHit, exists := uniqueSongs[key]; exists {
			existingNumbers := existingHit.Fields["number"].(string)
			newNumber := hit.Fields["number"].(string)
			existingHit.Fields["number"] = fmt.Sprintf("%s,%s", existingNumbers, newNumber)
		} else {
			uniqueSongs[key] = hit
		}
	}
}

func extractTitleAndSinger(hit *bleve_search.DocumentMatch) (string, string) {
	title := ""
	singer := ""
	if val, ok := hit.Fields["title_kor"]; ok {
		title = val.(string)
	} else if val, ok := hit.Fields["title_eng"]; ok {
		title = val.(string)
	}
	if val, ok := hit.Fields["singer_kor"]; ok {
		singer = val.(string)
	} else if val, ok := hit.Fields["singer_eng"]; ok {
		singer = val.(string)
	}
	return title, singer
}

func extractFullSong(hit *bleve_search.DocumentMatch) string {
	if full, ok := hit.Fields["full_kor"]; ok {
		return full.(string)
	}
	if full, ok := hit.Fields["full_eng"]; ok {
		return full.(string)
	}
	return ""
}

func getFullText(song Song) string {
	return fmt.Sprintf("%s: %s - %s | Lyricist: %s | Composer: %s",
		song.Number, song.Title, song.Singer, song.Lyricist, song.Composer)
}

func getSongsFromJson(filepath string) ([]Song, error) {
	var songs []Song

	file, err := os.Open(filepath)
	if err != nil {
		return songs, err
	}
	defer file.Close()

	decoder := json.NewDecoder(file)
	err = decoder.Decode(&songs)
	if err != nil {
		return songs, err
	}

	return songs, nil
}

// Map of Hangul initial consonant Unicode values to their corresponding Korean consonants.
var initialConsonantMap = map[rune]rune{
	0x1100: 'ㄱ', 0x1101: 'ㄲ', 0x1102: 'ㄴ', 0x1103: 'ㄷ', 0x1104: 'ㄸ',
	0x1105: 'ㄹ', 0x1106: 'ㅁ', 0x1107: 'ㅂ', 0x1108: 'ㅃ', 0x1109: 'ㅅ',
	0x110A: 'ㅆ', 0x110B: 'ㅇ', 0x110C: 'ㅈ', 0x110D: 'ㅉ', 0x110E: 'ㅊ',
	0x110F: 'ㅋ', 0x1110: 'ㅌ', 0x1111: 'ㅍ', 0x1112: 'ㅎ',
}

// extractInitialConsonants extracts the initial consonants from a Korean string or the first letter from each word in an English string.
// For Korean (code == "kor"), it extracts initial consonants as in "부산 해운대구 좌동 1395" -> "ㅂㅅㅎㅇㄷㄱㅈㄷ".
// For English (code == "eng"), it extracts the first letter of each word as in "I do current thing" -> "idct".
func extractInitialConsonants(s, code string) string {
	var initials []rune
	if code == "kor" {
		for _, r := range s {
			if gounicode.Is(gounicode.Hangul, r) {
				initial := (r - 0xAC00) / 28 / 21
				if mapped, exists := initialConsonantMap[0x1100+initial]; exists {
					initials = append(initials, mapped)
				}
			}
		}
	} else { // eng
		words := strings.Fields(s)
		for _, word := range words {
			initials = append(initials, rune(word[0]))
		}
	}
	return string(initials)
}

func addSpaceBeforeParentheses(s string) string {
	return strings.ReplaceAll(s, "(", " (")
}

/*
json looks like

[
    {
        "number": "91315,12345",
        "title": "그자리그대로",
        "singer": "카더가든",
        "lyricist": "카더가든",
        "composer": "카더가든,김영호,U-TURN,유현욱,전진호,채지호",
        "service": ""
    },
    {
        "number": "86975",
        "title": "이젠안녕(남은인생 10년 X 카더가든)",
        "singer": "카더가든",
        "lyricist": "한준",
        "composer": "서재하",
        "service": ""
    },
	...
]
*/
