import React from "react";

const Footer = ({ t }) => {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <section>
          <h3>Stella's Travel Agency</h3>
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
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a
              href="https://www.facebook.com/stellastravelagency/"
              target="_blank"
              rel="noreferrer"
            >
              Facebook
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer">
              X / Twitter
            </a>
          </div>
        </section>
      </div>

      <p className="footer-copy">
        © {new Date().getFullYear()} Stella's Travel Agency. {t.rights}
      </p>
    </footer>
  );
};

export default Footer;
