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
  SortBy
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

const App = () => (
  <div className="ais-InstantSearch">
    <h1>
      <a
      href="https://my-karaoke.github.io/"
      target="_blank"
      rel="noopener noreferrer"
    >TJ미디어 노래 검색 Demo</a>
    </h1>
    <h2>
      노래 검색{" "}
      <span role="img" aria-label="emoji">
        🎤
      </span>
    </h2>
    <p>TJ미디어 노래들을 검색해보세요. (정확하지 않을 수 있음, 2024년 7월까지)</p>
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
        />
      </div>
      <div className="right-panel">
        <SearchBox />
        <Hits hitComponent={Hit} />
        <Pagination showLast={true} />
      </div>
    </InstantSearch>
  </div>
);

const Hit = ({ hit }) => {
  return (
    <div key={hit.id}>
      <div className="hit-title">
        <span>({hit.id}) </span>
        <Highlight attribute="title" hit={hit} tagName="mark" />
      </div>
      <div className="hit-singer">
        <Snippet attribute="singer" hit={hit} tagName="mark" />
      </div>
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
