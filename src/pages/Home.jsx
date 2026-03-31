import React from "react";
import heroWallpaper from "../assets/hero.png";
import WeeklyHours from "../components/WeeklyHours";

const Home = ({ t }) => {
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
        <div>
          <p className="eyebrow">{t.aboutEyebrow}</p>
          <h2>{t.aboutTitle}</h2>
          <p>{t.aboutText}</p>
        </div>
        <div className="about-us-facts">
          <article>
            <h3>{t.aboutFact1Title}</h3>
            <p>{t.aboutFact1Text}</p>
          </article>
          <article>
            <h3>{t.aboutFact2Title}</h3>
            <p>{t.aboutFact2Text}</p>
          </article>
          <article>
            <h3>{t.aboutFact3Title}</h3>
            <p>{t.aboutFact3Text}</p>
          </article>
        </div>
      </section>

      <section className="highlights" id="why-us">
        <article className="highlight-card">
          <h3>{t.highlights1Title}</h3>
          <p>{t.highlights1Text}</p>
        </article>
        <article className="highlight-card">
          <h3>{t.highlights2Title}</h3>
          <p>{t.highlights2Text}</p>
        </article>
        <article className="highlight-card">
          <h3>{t.highlights3Title}</h3>
          <p>{t.highlights3Text}</p>
        </article>
      </section>

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
