import React from "react";
import { useTranslation } from "react-i18next"; // <-- IMPORTANT
import { FaTimes, FaTrash } from "react-icons/fa";
import { useFavorites } from "../contexts/FavoritesContext";

const FavoritesPanel = () => {
  const { t } = useTranslation(); // <-- get t() from i18n
  const { favorites, removeFavorite, removeAllFavorites } = useFavorites();

  if (favorites.length === 0) {
    return (
      <div style={{ fontStyle: "italic" }}>
        <br />
        {t("noFavoritesYet")}
      </div>
    );
  }

  return (
    <div className="favorites-panel">
      <h3>
        {t("myFavorites")}
        {/* Minimal icon button for removing all favorites */}
        <button
          onClick={removeAllFavorites}
          className="icon-button"
          title={t("removeAllFavorites")}
          style={{ marginLeft: "10px" }}
        >
          <FaTrash />
        </button>
      </h3>

      <ul>
        {favorites.map((song) => (
          <li key={song.id} style={{ marginBottom: "8px" }}>
            <strong>({song.id})</strong> {song.title} - {song.singer}
            <button
              onClick={() => removeFavorite(song.id)}
              className="icon-button"
              title={t("removeThisFavorite")}
              style={{ marginLeft: "10px" }}
            >
              <FaTimes />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FavoritesPanel;
