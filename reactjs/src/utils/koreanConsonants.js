/**
 * Utility for segmenting Korean consonants (initials + double consonants)
 * so the search can handle partial matches on Hangul.
 */

export const validInitialConsonants = new Set([
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
  
  export const doubleConsonants = {
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
  
  export const segmentConsonants = (input) => {
    const result = [];
    for (const ch of input) {
      if (validInitialConsonants.has(ch)) {
        result.push(ch);
      } else if (doubleConsonants[ch]) {
        result.push(...doubleConsonants[ch]);
      } else {
        result.push(ch);
      }
    }
    return result.join("");
  };
  
  /**
   * Hook for query transformation: segments Korean consonants
   * before passing to the Meilisearch refine function.
   */
  export const queryHook = (query, refine) => {
    const segmentedQuery = segmentConsonants(query);
    refine(segmentedQuery);
  };
  