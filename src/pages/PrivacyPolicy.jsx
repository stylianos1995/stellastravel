import React from "react";
import { Link } from "react-router-dom";
import { privacySections } from "../legal/privacyContent";

const PrivacyPolicy = ({ t, lang }) => {
  const sections = privacySections[lang] || privacySections.en;

  return (
    <section className="legal-page">
      <div className="section-header">
        <p className="eyebrow">{t.privacyEyebrow}</p>
        <h1>{t.privacyTitle}</h1>
        <p className="legal-updated">{t.privacyLastUpdated}</p>
      </div>

      <nav className="legal-toc" aria-label={t.privacyTocLabel}>
        <ul>
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>{section.title}</a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="legal-sections">
        {sections.map((section) => (
          <article className="legal-section" id={section.id} key={section.id}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </article>
        ))}
      </div>

      <p className="legal-back">
        <Link to="/">{t.privacyBackHome}</Link>
      </p>
    </section>
  );
};

export default PrivacyPolicy;
