package korfilter

import (
	"fmt"
	"regexp"

	"github.com/blevesearch/bleve/v2/analysis"
	"github.com/blevesearch/bleve/v2/registry"
)

const CharFilterName = "korean_char_filter"

type KoreanCharFilter struct {
	r           *regexp.Regexp
	replacement []byte
}

func NewKoreanCharFilter(r *regexp.Regexp, replacement []byte) *KoreanCharFilter {
	return &KoreanCharFilter{
		r:           r,
		replacement: replacement,
	}
}

func (s *KoreanCharFilter) Filter(input []byte) []byte {
	return s.r.ReplaceAll(input, s.replacement)
}

func KoreanCharFilterConstructor(config map[string]interface{}, cache *registry.Cache) (analysis.CharFilter, error) {
	regexpStr, ok := config["regexp"].(string)
	if !ok {
		return nil, fmt.Errorf("must specify regexp")
	}
	r, err := regexp.Compile(regexpStr)
	if err != nil {
		return nil, fmt.Errorf("unable to build regexp char filter: %v", err)
	}
	replaceBytes := []byte(" ")
	replaceStr, ok := config["replace"].(string)
	if ok {
		replaceBytes = []byte(replaceStr)
	}
	return NewKoreanCharFilter(r, replaceBytes), nil
}

func init() {
	registry.RegisterCharFilter(CharFilterName, KoreanCharFilterConstructor)
}
