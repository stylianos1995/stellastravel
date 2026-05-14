import React, { useState } from "react";
import heroWallpaper from "../assets/hero.png";
import brandLogo from "../assets/logo.png";
import WeeklyHours from "../components/WeeklyHours";
import { partnerAgencies } from "../Data/partnerAgencies";

const base = (process.env.PUBLIC_URL || "").replace(/\/$/, "");
const STELLA_PROFILE_PATH = `${base}/stella-profile.jpg`;

function partnerWebsiteHref(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("//")) return `https:${s}`;
  return `https://${s}`;
}

const Home = ({ t }) => {
  const [profileFallback, setProfileFallback] = useState(false);
  const profileSrc = profileFallback ? brandLogo : STELLA_PROFILE_PATH;

  return (
    <section className="home">
      <div className="hero-section">
        <img
          src={heroWallpaper}
          alt="Stella's Travel Agency hero wallpaper"
          className="hero-bg-image"
        />
      </div>

      <section className="about-us" id="about-us">
        <div className="about-us-layout">
          <div className="about-us-intro">
            <p className="eyebrow">{t.aboutEyebrow}</p>
            <h2>{t.aboutTitle}</h2>
            <div className="about-us-body">
              <p>{t.aboutBody1}</p>
              <p>{t.aboutBody2}</p>
            </div>
          </div>
          <figure className="about-us-profile">
            <img
              src={profileSrc}
              alt={t.aboutProfileAlt}
              className={`about-profile-img${profileFallback ? " about-profile-img--logo" : ""}`}
              width={280}
              height={280}
              loading="lazy"
              decoding="async"
              onError={() => {
                if (!profileFallback) setProfileFallback(true);
              }}
            />
            <figcaption className="about-profile-caption" aria-hidden="true">
              {t.aboutProfileCaption}
            </figcaption>
          </figure>
        </div>
      </section>

      {partnerAgencies.length > 0 ? (
        <section className="partners-section" id="partners" aria-labelledby="partners-heading">
          <p className="eyebrow">{t.partnersEyebrow}</p>
          <h2 id="partners-heading">{t.partnersTitle}</h2>
          <p className="partners-intro">{t.partnersIntro}</p>
          <ul className="partners-grid">
            {partnerAgencies.map((p, i) => {
              const href = partnerWebsiteHref(p.website);
              const key = `${p.name}-${i}`;
              const logoEl =
                p.logo != null ? (
                  <span className="partner-logo-wrap">
                    <img src={p.logo} alt="" className="partner-logo" />
                  </span>
                ) : null;
              if (href) {
                return (
                  <li key={key}>
                    <a
                      className="partner-card partner-card--link"
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {logoEl}
                      <span className="partner-name">{p.name}</span>
                    </a>
                  </li>
                );
              }
              return (
                <li key={key}>
                  <span className="partner-card">
                    {logoEl}
                    <span className="partner-name">{p.name}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="location-reviews">
        <div className="location-block">
          <p className="eyebrow">{t.locationTitle}</p>
          <p>{t.locationSubtitle}</p>
          <div className="map-embed">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3033.3143784284625!2d21.67807217796688!3d40.51254187142404!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13577d36b00597fd%3A0x992739deb2db7d1a!2sStellas%20Travel%20Agency!5e0!3m2!1sel!2snl!4v1774987882186!5m2!1sel!2snl"
              width="600"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Stella's Travel Agency location"
            />
          </div>
        </div>

        <div className="reviews-block">
          <p className="eyebrow">{t.googleReviewsTitle}</p>
          <div className="reviews-grid">
            <article className="review-card">
              <strong>{t.reviewOneName}</strong>
              <p>★★★★★</p>
              <p>{t.reviewOneText}</p>
            </article>
            <article className="review-card">
              <strong>{t.reviewTwoName}</strong>
              <p>★★★★★</p>
              <p>{t.reviewTwoText}</p>
            </article>
            <article className="review-card">
              <strong>{t.reviewThreeName}</strong>
              <p>★★★★★</p>
              <p>{t.reviewThreeText}</p>
            </article>
          </div>
          <a
            className="btn-secondary"
            href="https://www.google.com/maps/place/Stellas+Travel+Agency/@40.514422,21.6784493,17.5z/data=!4m17!1m8!3m7!1s0x13577d36b00597fd:0x992739deb2db7d1a!2sStellas+Travel+Agency!8m2!3d40.5125419!4d21.6806471!10e1!16s%2Fg%2F11h0xf5p6t!3m7!1s0x13577d36b00597fd:0x992739deb2db7d1a!8m2!3d40.5125419!4d21.6806471!9m1!1b1!16s%2Fg%2F11h0xf5p6t?entry=ttu&g_ep=EgoyMDI2MDMyOS4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noreferrer"
          >
            {t.googleReviewsCta}
          </a>
        </div>
      </section>

      <WeeklyHours t={t} />
    </section>
  );
};

export default Home;
