import React, { Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Configure, Hits, InstantSearch, Pagination, RefinementList, SearchBox, SortBy } from "react-instantsearch-dom";
import { queryHook } from "./utils/koreanConsonants";
import { searchClient } from "./utils/meilisearchClient";
// import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";

import FavoritesPanel from "./components/FavoritesPanel";
import Footer from "./components/Footer";
import HitItem from "./components/HitItem";
import LanguageSwitcher from "./components/LanguageSwitcher";

import "instantsearch.css/themes/algolia-min.css";
import "./App.css";
import "./Modal.css";

// const { searchClient } = instantMeiliSearch(
//   "https://kr-meilisearch.up.railway.app",
//   "d3d50e5bf21ae299cede4e0e15f07f82b6e1d87712a66c68ed6bbadf0e5fb88f",
//   {
//     finitePagination: true,
//     meiliSearchParams: {
//       hitsPerPage: 10,
//     },
//   }
// );
const monthKey = 1;
const year = 2025;

const App = () => {
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // Refresh the entire page (or you could reset search state in a more graceful way)
  const handleTitleClick = () => {
    window.location.reload();
  };

  // Simulate a short loading delay
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Suspense fallback={<div>Loading translations...</div>}>
      <div className="ais-InstantSearch">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Title */}
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
            month: t(`months.${monthKey}`),
            year,
          })}
        </p>

        {/* instructions */}
        <p>
          [ FR=France, ITA=Italy, DE=Germany, ES=Spain, PHL=Philippines, ROU=Romania, PRT=Portugal, CN=Chinese ]
        </p>

        <InstantSearch indexName="songs" searchClient={searchClient}>
          <div className="left-panel">
            <SortBy
              defaultRefinement="songs"
              items={[{ value: "songs", label: t("relevancyLabel") }]}
            />
            <h2>{t("country")}</h2>
            <RefinementList attribute="country" />
            <Configure
              hitsPerPage={8}
              attributesToSnippet={["description:50"]}
              snippetEllipsisText={"..."}
            />

            {/* Favorites panel (optional) */}
            <FavoritesPanel />
          </div>

          <div className="right-panel">
            <SearchBox
              autoFocus
              placeholder={t("searchPlaceholder")}
              queryHook={queryHook}
            />
            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : (
              <>
                <Hits hitComponent={HitItem} />
                <Pagination showLast={true} totalPages={10} />
              </>
            )}
          </div>
        </InstantSearch>

        {/* Footer */}
        <Footer />
      </div>
    </Suspense>
  );
};

export default App;
