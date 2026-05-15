import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

const Navbar = ({ t, currentLang, onToggleLanguage }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const nextFlag = currentLang === "en" ? "🇬🇷" : "🇬🇧";

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("nav-menu-open", menuOpen);
    return () => document.body.classList.remove("nav-menu-open");
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`navbar${menuOpen ? " navbar--open" : ""}`}>
      <div className="navbar-inner">
        <Link to="/" className="brand-wrap" onClick={closeMenu}>
          <span className="brand-logo-wrap">
            <img
              src={logo}
              alt="Stellas Travel Agency"
              className="brand-logo"
              width={80}
              height={80}
              decoding="async"
            />
          </span>
          <span className="brand-title">Stellas Travel Agency</span>
        </Link>

        <button
          type="button"
          className="nav-burger"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="nav-burger-bar" />
          <span className="nav-burger-bar" />
          <span className="nav-burger-bar" />
          <span className="sr-only">{menuOpen ? t.navCloseMenu : t.navOpenMenu}</span>
        </button>

        <nav id="main-nav" className={`nav-panel${menuOpen ? " nav-panel--open" : ""}`}>
          <ul className="nav-links">
            <li>
              <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
                {t.navHome}
              </NavLink>
            </li>
            <li>
              <NavLink to="/packages" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
                {t.navPackages}
              </NavLink>
            </li>
            <li>
              <NavLink to="/tickets" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
                {t.navTickets}
              </NavLink>
            </li>
            <li>
              <button
                type="button"
                className="lang-switch"
                onClick={() => {
                  onToggleLanguage();
                  closeMenu();
                }}
              >
                <span className="flag-icon" aria-hidden="true">
                  {nextFlag}
                </span>
                <span>{t.switchTo}</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
