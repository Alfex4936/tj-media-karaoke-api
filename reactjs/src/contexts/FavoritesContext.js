import React, { createContext, useContext, useEffect, useState } from "react";

const key = "myFavSongs";
const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  // On mount, load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (error) {
        // If parse fails, fallback to empty
        console.error("Error parsing localStorage favorites:", error);
      }
    }
  }, []);

  // Save to localStorage whenever `favorites` changes
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (song) => {
    // If song is already in favorites, skip
    if (favorites.some((fav) => fav.id === song.id)) return;
    setFavorites((prev) => [...prev, song]);
  };

  const removeFavorite = (songId) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== songId));
  };

  const removeAllFavorites = () => {
    setFavorites([]);
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, removeAllFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

// convenience hook
export const useFavorites = () => {
  return useContext(FavoritesContext);
};
