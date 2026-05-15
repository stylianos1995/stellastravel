import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { COOKIE_CONSENT_KEY } from "../legal/privacyContent";

const CookieConsent = ({ t }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(COOKIE_CONSENT_KEY) !== "accepted");
    } catch (_err) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      document.body.classList.add("cookie-banner-open");
    } else {
      document.body.classList.remove("cookie-banner-open");
    }
    return () => document.body.classList.remove("cookie-banner-open");
  }, [visible]);

  const accept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    } catch (_err) {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-labelledby="cookie-banner-title" aria-live="polite">
      <div className="cookie-banner-inner">
        <p id="cookie-banner-title" className="cookie-banner-text">
          {t.cookieBannerText}{" "}
          <Link to="/privacy" className="cookie-banner-link">
            {t.privacyPolicyLink}
          </Link>
          .
        </p>
        <div className="cookie-banner-actions">
          <button type="button" className="btn-primary" onClick={accept}>
            {t.cookieAccept}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
