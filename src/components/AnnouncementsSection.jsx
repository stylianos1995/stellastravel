import React from "react";
import PackageDescription from "./PackageDescription";
import { resolveAnyUrl } from "../utils/packagePdf";

function formatAnnouncementDate(iso, lang) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(lang === "el" ? "el-GR" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

const AnnouncementsSection = ({ t, lang, announcements, loading }) => {
  const items = Array.isArray(announcements) ? announcements : [];

  return (
    <section className="announcements-section" id="announcements" aria-labelledby="announcements-heading">
      <p className="eyebrow">{t.announcementsEyebrow}</p>
      <h2 id="announcements-heading">{t.announcementsTitle}</h2>
      {loading ? (
        <p className="announcements-status">{t.announcementsLoading}</p>
      ) : items.length === 0 ? (
        <p className="announcements-status">{t.announcementsEmpty}</p>
      ) : (
      <ul className="announcements-list">
        {items.map((item) => {
          const imageUrl = resolveAnyUrl(item.image);
          const dateLabel = formatAnnouncementDate(item.created_at ?? item.createdAt, lang);

          return (
            <li key={item.id}>
              <article className="announcement-card">
                {imageUrl ? (
                  <div className="announcement-image-wrap">
                    <img src={imageUrl} alt="" className="announcement-image" loading="lazy" />
                  </div>
                ) : null}
                <div className="announcement-content">
                  <div className="announcement-header">
                    <h3>{item.title}</h3>
                    {dateLabel ? <time dateTime={item.created_at ?? item.createdAt}>{dateLabel}</time> : null}
                  </div>
                  <PackageDescription
                    text={item.body}
                    readMoreLabel={t.readMore}
                    readLessLabel={t.readLess}
                  />
                </div>
              </article>
            </li>
          );
        })}
      </ul>
      )}
    </section>
  );
};

export default AnnouncementsSection;
