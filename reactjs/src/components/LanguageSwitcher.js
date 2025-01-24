import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <select onChange={(e) => changeLanguage(e.target.value)} defaultValue={i18n.language}>
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
  );
};

export default LanguageSwitcher;
