import React from "react";
import { useTranslation } from "react-i18next";
import { FaHeart, FaRegHeart, FaYoutube } from "react-icons/fa"; // Import hearts
import { Highlight, Snippet } from "react-instantsearch-dom";

import { useFavorites } from "../contexts/FavoritesContext"; // Our context

const HitItem = ({ hit }) => {
  const { t } = useTranslation();
  const { favorites, addFavorite, removeFavorite } = useFavorites();

  const isFavorited = favorites.some((f) => f.id === hit.id);

  const toggleFavorite = () => {
    if (isFavorited) {
      removeFavorite(hit.id);
    } else {
      // store partial info or entire 'hit'?
      addFavorite({
        id: hit.id,
        title: hit.title,
        singer: hit.singer,
        youtube_url: hit.youtube_url,
      });
    }
  };

  // Extract matched lyrics snippet
  const getMatchedLyricsSnippet = (highlightedLyrics) => {
    const snippet = highlightedLyrics.value;
    const highlightTagStart = snippet.indexOf("<mark>");
    const highlightTagEnd = snippet.indexOf("</mark>");

    if (highlightTagStart === -1 || highlightTagEnd === -1) {
      return null;
    }

    // Show ~30 chars before/after the highlight
    const contextRadius = 30;
    const startContext = Math.max(0, highlightTagStart - contextRadius);
    const endContext = Math.min(snippet.length, highlightTagEnd + 7 + contextRadius);
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

  // External search links
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

        {/* Favorite Heart Icon */}
        <span 
          onClick={toggleFavorite}
          style={{ cursor: "pointer", marginLeft: "8px" }}
          title={isFavorited ? t("Remove from favorites") : t("Add to favorites")}
        >
          {isFavorited ? (
            <FaHeart style={{ color: "red" }} />
          ) : (
            <FaRegHeart style={{ color: "gray" }} />
          )}
        </span>
      </div>
      <div className="hit-singer">
        <Snippet attribute="singer" hit={hit} tagName="mark" />
      </div>

      {/* Display the snippet if found */}
      {lyricsSnippet}

      {/* External search links */}
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

export default HitItem;
