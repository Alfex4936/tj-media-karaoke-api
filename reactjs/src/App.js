import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import "instantsearch.css/themes/algolia-min.css";
import React from "react";
import { useTranslation } from 'react-i18next';
import { FaYoutube } from 'react-icons/fa';
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
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const queryHook = (query, refine) => {
    const segmentedQuery = segmentConsonants(query);
    // const finalQuery = filterLyrics ? `lyrics:${segmentedQuery}` : segmentedQuery;
    refine(segmentedQuery);
  };
  
  return (
    <div className="ais-InstantSearch">
      <div className="language-switcher">
        <select onChange={(e) => changeLanguage(e.target.value)} defaultValue={i18n.language}>
          <option value="ko">한국어</option>
          <option value="en">English</option>
          <option value="ru">Русский</option>
          <option value="ja">日本語</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
      </div>
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
          {t("welcome")}
        </a>
      </h1>
      <h2>
        {t("searchSong")}{" "}
        <span role="img" aria-label="emoji">
          🎤
        </span>
      </h2>
      <p>{t("description")}</p>
      <InstantSearch indexName="songs" searchClient={searchClient}>
        <div className="left-panel">
          {/* <ClearRefinements /> */}
          <SortBy
            defaultrefinement="songs"
            items={[{ value: "songs", label: t("relevancyLabel") }]}
          />
          <h2>{t("country")}</h2>
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
            placeholder={t("searchPlaceholder")}
            queryHook={queryHook}
          />
          <Hits hitComponent={Hit} />
          <Pagination showLast={true} totalPages={14} />
        </div>
      </InstantSearch>
      <footer className="footer">
        <p>Created by <a href="mailto:ikr@kakao.com">ikr@kakao.com</a></p>
      </footer>
    </div>
  );
};

const Hit = ({ hit }) => {
  const { t } = useTranslation();

  // Function to extract and display matched lyrics snippet
  const getMatchedLyricsSnippet = (highlightedLyrics) => {
    const snippet = highlightedLyrics.value;

    // Find the position of the highlighted tag
    const highlightTagStart = snippet.indexOf('<mark>');
    const highlightTagEnd = snippet.indexOf('</mark>', highlightTagStart) + 7; // length of </mark> is 7

    if (highlightTagStart === -1 || highlightTagEnd === -1) {
      return null;
    }

    // Extract the highlighted text
    const highlightedText = snippet.slice(highlightTagStart, highlightTagEnd);

    // Find word boundaries before and after the highlight to avoid cutting in the middle of words or tags
    const contextBeforeStart = snippet.lastIndexOf(' ', Math.max(0, highlightTagStart - 30));
    const contextBefore = snippet.slice(contextBeforeStart, highlightTagStart);

    const contextAfterEnd = snippet.indexOf(' ', Math.min(snippet.length, highlightTagEnd + 30));
    const contextAfter = snippet.slice(highlightTagEnd, contextAfterEnd);

    // Combine the context and the highlighted part
    const contextSnippet = `${t("lyrics")}: ... ${contextBefore} ${highlightedText} ${contextAfter} ...`;

    return (
      <div className="hit-lyrics-snippet">
        <span dangerouslySetInnerHTML={{ __html: contextSnippet }} />
      </div>
    );
  };

  const lyricsSnippet = hit._highlightResult && hit._highlightResult.lyrics ? getMatchedLyricsSnippet(hit._highlightResult.lyrics) : null;
  const genieSearchURL = `https://www.genie.co.kr/search/searchMain?query=${encodeURIComponent(hit.title)}%20${encodeURIComponent(hit.singer)}`;
  const melonSearchURL = `https://www.melon.com/search/total/index.htm?q=${encodeURIComponent(hit.title)}+${encodeURIComponent(hit.singer)}&section=&mwkLogType=T`;

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
            className="youtube-icon"
            target="_blank"
            rel="noopener noreferrer"
            title={`YouTube ${t("search")}`}
          >
            <FaYoutube size={24} />
          </a>
          <a
            href={genieSearchURL}
            className="genie-icon"
            target="_blank"
            rel="noopener noreferrer"
            title={`Genie Music ${t("search")}`}
            style={{ marginLeft: '10px' }}
          >
            <img src={`${process.env.PUBLIC_URL}/genie_logo.svg`} alt="Genie Music" style={{ width: '24px', height: '24px' }} />
          </a>
          <a
            href={melonSearchURL}
            className="melon-icon"
            target="_blank"
            rel="noopener noreferrer"
            title={`Melon Music ${t("search")}`}
            style={{ marginLeft: '10px' }}
          >
            <img src={`${process.env.PUBLIC_URL}/melon_logo.svg`} alt="Melon Music" style={{ width: '24px', height: '24px' }} />
          </a>
        </div>
      )}
    </div>
  );
};

export default App;
