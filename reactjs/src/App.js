import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import "instantsearch.css/themes/algolia-min.css";
import React, { Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaYoutube } from "react-icons/fa";
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
  "https://kr-meilisearch.up.railway.app",
  "d3d50e5bf21ae299cede4e0e15f07f82b6e1d87712a66c68ed6bbadf0e5fb88f",
  {
    finitePagination: true,
    meiliSearchParams: {
      hitsPerPage: 10,
    },
  }
);

const monthKey = 1;
const year = 2025;

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

const App = () => {
  // const [filterLyrics, setFilterLyrics] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const { t, i18n } = useTranslation();

  const changeLanguage = lng => {
    i18n.changeLanguage(lng);
  };

  // Segment Korean consonants in the query before sending to Meilisearch
  const queryHook = (query, refine) => {
    const segmentedQuery = segmentConsonants(query);
    refine(segmentedQuery);
  };

  // More graceful way to "refresh" — just reset the search state if needed
  const handleTitleClick = () => {
    window.location.reload();
  };

  // Use effect to set loading to false after the initial load
  useEffect(() => {
    // Simulate a tiny loading step
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Suspense fallback={<div>Loading translations...</div>}>
      <div className="ais-InstantSearch">
        {/* Language Switcher */}
        <div className="language-switcher">
          <select
            onChange={e => changeLanguage(e.target.value)}
            defaultValue={i18n.language}
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="de">Germany</option>
            <option value="es">Español</option>
            <option value="ru">Русский</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
          </select>
        </div>
        <h1>
          <button
            onClick={handleTitleClick}
            style={{
              cursor: "pointer",
              color: "inherit",
              background: "none",
              border: "none",
              fontSize: "1em",
              textDecoration: "overline",
            }}
          >
            {t("welcome")}
          </button>
        </h1>

        <h2>
          {t("searchSong")}{" "}
          <span role="img" aria-label="emoji">
            🎤
          </span>
        </h2>

        <p>
          {t("description", {
            month: t(`months.${monthKey}`), // e.g. "1월" in Korean, "January" in English
            year,
          })}
        </p>

        {/* Additional helpful instructions or disclaimers */}
        <p>
          [ FR=France, ITA=Italy, DE=Germany, ES=Spain, PHL=Philippines, ROU=Romania, PRT=Portugal, CN=Chinese ]
        </p>

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
            {loading ? (
              <div className="loading-spinner">Loading...</div> // loading
            ) : (
              <>
                <Hits hitComponent={Hit} />
                <Pagination showLast={true} totalPages={10} />
              </>
            )}
          </div>
        </InstantSearch>
        
        <footer className="footer">
          <p>
            Created by{" "}
            <a href="mailto:ikr@kakao.com">
              ikr@kakao.com (Seok)
            </a>
          </p>
        </footer>
      </div>
    </Suspense>
  );
};

const Hit = ({ hit }) => {
  const { t } = useTranslation();

  // Function to extract and display matched lyrics snippet
  const getMatchedLyricsSnippet = (highlightedLyrics) => {
    const snippet = highlightedLyrics.value;

    const highlightTagStart = snippet.indexOf("<mark>");
    const highlightTagEnd = snippet.indexOf("</mark>");

    if (highlightTagStart === -1 || highlightTagEnd === -1) {
      return null;
    }

    // We can show ~30 chars before/after the highlight
    const contextRadius = 30;

    // Start context
    const startContext = Math.max(0, highlightTagStart - contextRadius);
    // End context (add 7 for the length of "</mark>")
    const endContext = Math.min(snippet.length, highlightTagEnd + 7 + contextRadius);

    // Combine snippet with context
    const contextSnippet = snippet.slice(startContext, endContext);

    return (
      <div className="hit-lyrics-snippet">
        <span
          dangerouslySetInnerHTML={{
            __html: `${t("lyrics")}: ...${contextSnippet}...`,
          }}
        />
      </div>
    );
  };

  // Build external links
  const genieSearchURL = `https://www.genie.co.kr/search/searchMain?query=${encodeURIComponent(
    hit.title
  )}%20${encodeURIComponent(hit.singer)}`;
  const melonSearchURL = `https://www.melon.com/search/total/index.htm?q=${encodeURIComponent(
    hit.title
  )}+${encodeURIComponent(hit.singer)}&section=&mwkLogType=T`;

  const lyricsSnippet =
    hit._highlightResult && hit._highlightResult.lyrics
      ? getMatchedLyricsSnippet(hit._highlightResult.lyrics)
      : null;

  return (
    <article className="hit-item" key={hit.id}>
      <div className="hit-title">
        <span>({hit.id}) </span>
        <Highlight attribute="title" hit={hit} tagName="mark" />
      </div>
      <div className="hit-singer">
        <Snippet attribute="singer" hit={hit} tagName="mark" />
      </div>

      {/* Display the snippet if found */}
      {lyricsSnippet}

      {/* External search links, if available */}
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
            style={{ marginLeft: "10px" }}
          >
            <img
              src={`${process.env.PUBLIC_URL}/genie_logo.svg`}
              alt="Genie Music"
              style={{ width: "24px", height: "24px" }}
            />
          </a>
          <a
            href={melonSearchURL}
            className="melon-icon"
            target="_blank"
            rel="noopener noreferrer"
            title={`Melon Music ${t("search")}`}
            style={{ marginLeft: "10px" }}
          >
            <img
              src={`${process.env.PUBLIC_URL}/melon_logo.svg`}
              alt="Melon Music"
              style={{ width: "24px", height: "24px" }}
            />
          </a>
        </div>
      )}
    </article>
  );
};

export default App;
