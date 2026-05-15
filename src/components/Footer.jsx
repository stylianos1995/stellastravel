import React from "react";
import { Link } from "react-router-dom";
import { FacebookIcon, InstagramIcon } from "./SocialIcons";

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

        <section>
          <h4>{t.footerFollow}</h4>
          <div className="social-links">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label={t.footerInstagram}
            >
              <InstagramIcon />
            </a>
            <a
              href="https://www.facebook.com/stellastravelagency/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label={t.footerFacebook}
            >
              <FacebookIcon />
            </a>
          </div>
        </section>
      </div>

      <p className="footer-copy">
        © {new Date().getFullYear()} Stellas Travel Agency. {t.rights}{" "}
        <Link to="/privacy" className="footer-legal-link">
          {t.footerPrivacy}
        </Link>
      </p>
    </footer>
  );
};

export default Footer;
