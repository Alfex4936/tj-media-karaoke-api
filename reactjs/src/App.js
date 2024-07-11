import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import "instantsearch.css/themes/algolia-min.css";
import React from "react";
import {
  Configure,
  Highlight,
  Hits,
  InstantSearch,
  Pagination,
  RefinementList,
  SearchBox,
  Snippet,
  SortBy,
} from "react-instantsearch";
import "./App.css";
import "./Modal.css";

const { searchClient } = instantMeiliSearch(
  "https://csw-meilisearch.up.railway.app",
  "40db54d9ebd0d8808f4a1d3583422d15530936254ee7dd7c2ce81c96299c27be",
  {
    finitePagination: true,
  }
);

const refreshPage = () => {
  window.location.reload();
};

const validInitialConsonants = new Set([
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
]);

const doubleConsonants = {
  ㄳ: ["ㄱ", "ㅅ"],
  ㄵ: ["ㄴ", "ㅈ"],
  ㄶ: ["ㄴ", "ㅎ"],
  ㄺ: ["ㄹ", "ㄱ"],
  ㄻ: ["ㄹ", "ㅁ"],
  ㄼ: ["ㄹ", "ㅂ"],
  ㄽ: ["ㄹ", "ㅅ"],
  ㄾ: ["ㄹ", "ㅌ"],
  ㄿ: ["ㄹ", "ㅍ"],
  ㅀ: ["ㄹ", "ㅎ"],
  ㅄ: ["ㅂ", "ㅅ"],
};

const segmentConsonants = input => {
  const result = [];

  for (const r of input) {
    if (validInitialConsonants.has(r)) {
      result.push(r);
    } else if (doubleConsonants[r]) {
      result.push(...doubleConsonants[r]);
    } else {
      result.push(r);
    }
  }

  return result.join("");
};


const App = () => {
  // const [filterLyrics, setFilterLyrics] = useState(false);

  const queryHook = (query, refine) => {
    const segmentedQuery = segmentConsonants(query);
    // const finalQuery = filterLyrics ? `lyrics:${segmentedQuery}` : segmentedQuery;
    refine(segmentedQuery);
  };
  
  return (
    <div className="ais-InstantSearch">
      <h1>
        <a
          href="#"
          onClick={refreshPage}
          style={{
            cursor: "pointer",
            color: "inherit",
            textDecoration: "inherit",
          }}
        >
          TJ미디어 노래 검색 Demo
        </a>
      </h1>
      <h2>
        노래 검색{" "}
        <span role="img" aria-label="emoji">
          🎤
        </span>
      </h2>
      <p>
        TJ미디어 노래들을 검색해보세요. (정확하지 않을 수 있음, 2024년 7월까지)
      </p>
      <InstantSearch indexName="songs" searchClient={searchClient}>
        <div className="left-panel">
          {/* <ClearRefinements /> */}
          <SortBy
            defaultrefinement="songs"
            items={[{ value: "songs", label: "관련순" }]}
          />
          <h2>국가</h2>
          <RefinementList attribute="country" />
          <Configure
            hitsPerPage={8}
            attributesToSnippet={["description:50"]}
            snippetEllipsisText={"..."}
            // filters={filterLyrics ? 'lyrics != ""' : ''}
          />
          {/* <button onClick={() => setFilterLyrics(!filterLyrics)}>
            {filterLyrics ? "Show All Results" : "Show Only Lyrics Matches"}
          </button> */}
        </div>
        <div className="right-panel">
          <SearchBox
            autoFocus
            placeholder={"노래를 검색해보세요..."}
            queryHook={queryHook}
          />
          <Hits hitComponent={Hit} />
          <Pagination showLast={true} totalPages={14} />
        </div>
      </InstantSearch>
    </div>
  );
};

const Hit = ({ hit }) => {
  // Function to extract and display matched lyrics snippet
  const getMatchedLyricsSnippet = (highlightedLyrics) => {
    const snippet = highlightedLyrics.value;

    // Find the position of the highlighted tag
    const highlightTagStart = snippet.indexOf('<mark>');
    const highlightTagEnd = snippet.indexOf('</mark>', highlightTagStart) + 7; // length of </mark> is 7

    if (highlightTagStart === -1 || highlightTagEnd === -1) {
      return null;
    }

    // Extract the context around the highlighted part
    const contextBefore = snippet.slice(Math.max(0, highlightTagStart - 30), highlightTagStart);
    const highlightedText = snippet.slice(highlightTagStart, highlightTagEnd);
    const contextAfter = snippet.slice(highlightTagEnd, Math.min(snippet.length, highlightTagEnd + 30));

    // Combine the context and the highlighted part
    const contextSnippet = `가사: ... ${contextBefore} ${highlightedText} ${contextAfter} ...`;

    return (
      <div className="hit-lyrics-snippet">
        <span dangerouslySetInnerHTML={{ __html: contextSnippet }} />
      </div>
    );
  };

  const lyricsSnippet = hit._highlightResult && hit._highlightResult.lyrics ? getMatchedLyricsSnippet(hit._highlightResult.lyrics) : null;

  return (
    <div key={hit.id}>
      <div className="hit-title">
        <span>({hit.id}) </span>
        <Highlight attribute="title" hit={hit} tagName="mark" />
      </div>
      <div className="hit-singer">
        <Snippet attribute="singer" hit={hit} tagName="mark" />
      </div>
      {lyricsSnippet}
      {hit.youtube_url && (
        <div className="hit-info">
          <a
            href={hit.youtube_url}
            className="custom-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            @YouTube 검색
          </a>
        </div>
      )}
    </div>
  );
};

export default App;
