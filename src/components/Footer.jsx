import React from "react";
import { Link } from "react-router-dom";
import deverseLogo from "../assets/Deverse.png";

const Footer = ({ t }) => {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <section>
          <h3>Stellas Travel Agency</h3>
          <p>{t.footerAbout}</p>
        </section>

        <section>
          <h4>{t.footerGeneral}</h4>
          <ul className="footer-list footer-contact-list">
            <li>{t.addressLabel}: Ιωάννη Χριστίδη 1, Πτολεμαΐδα 502 00, Ελλάδα</li>
            <li className="footer-contact-line">
              <span className="footer-contact-ico" aria-hidden="true">
                ☎
              </span>
              <span>
                {t.footerTelLabel}{" "}
                <a href="tel:+302463028796">+30 2463028796</a>
              </span>
            </li>
            <li className="footer-contact-line">
              <span className="footer-contact-ico" aria-hidden="true">
                📱
              </span>
              <span>
                {t.footerMobLabel}{" "}
                <a href="tel:+306984553773">+30 6984553773</a>
              </span>
            </li>
            <li className="footer-contact-line">
              <span className="footer-contact-ico" aria-hidden="true">
                ✉
              </span>
              <span>
                {t.footerEmailLabel}{" "}
                <a href="mailto:estelsach@gmail.com">estelsach@gmail.com</a>
              </span>
            </li>
          </ul>
        </section>
      </div>

      <div className="footer-bar">
        <p className="footer-copy">
          © {new Date().getFullYear()} Stellas Travel Agency. {t.rights}{" "}
          <Link to="/privacy" className="footer-legal-link">
            {t.footerPrivacy}
          </Link>
        </p>
        <p className="footer-powered">
          <span>{t.footerPoweredBy}</span>{" "}
          <a
            href="https://deverse-pi.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-powered-link"
            aria-label={t.footerPoweredByLinkLabel}
          >
            <img src={deverseLogo} alt="" className="footer-powered-logo" />
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
