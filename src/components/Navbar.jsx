import React from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo.png";

const Navbar = ({ t, currentLang, onToggleLanguage }) => {
  const nextFlag = currentLang === "en" ? "🇬🇷" : "🇬🇧";

  return (
    <header className="navbar">
      <div className="brand-wrap">
        <span className="brand-logo-wrap">
          <img
            src={logo}
            alt="Stellas Travel Agency logo"
            className="brand-logo"
            width={80}
            height={80}
            decoding="async"
          />
        </span>
        <Link to="/" className="brand-title">Stellas Travel Agency</Link>
      </div>
      <nav>
        <ul className="nav-links">
          <li>
            <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
              {t.navHome}
            </NavLink>
          </li>
          <li>
            <NavLink to="/packages" className={({ isActive }) => (isActive ? "active" : "")}>
              {t.navPackages}
            </NavLink>
          </li>
          <li>
            <NavLink to="/tickets" className={({ isActive }) => (isActive ? "active" : "")}>
              {t.navTickets}
            </NavLink>
          </li>
          <li>
            <button type="button" className="lang-switch" onClick={onToggleLanguage}>
              <span className="flag-icon" aria-hidden="true">{nextFlag}</span>
              <span>{t.switchTo}</span>
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
