import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";

// Create and export a search client once.
export const {searchClient} = instantMeiliSearch(
  "https://kr-meilisearch.up.railway.app",
  "d3d50e5bf21ae299cede4e0e15f07f82b6e1d87712a66c68ed6bbadf0e5fb88f",
  {
    finitePagination: true,
    meiliSearchParams: {
      hitsPerPage: 10,
    },
  }
);


