import React, { useEffect, useState } from "react";
import PackageInquiryModal from "../components/PackageInquiryModal";
import PriceRangeSlider from "../components/PriceRangeSlider";

const defaultApiBase = "http://localhost:5000/api";

/** API host for resolving `/uploads/...` paths (must not use the React dev server origin). */
function getApiOrigin() {
  try {
    const base = process.env.REACT_APP_API_URL || defaultApiBase;
    return new URL(base).origin;
  } catch {
    try {
      return new URL(defaultApiBase).origin;
    } catch {
      return "http://localhost:5000";
    }
  }
}

function resolveAnyUrl(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("//")) return `https:${s}`;
  if (s.startsWith("/")) {
    const origin = getApiOrigin();
    return `${origin.replace(/\/$/, "")}${s}`;
  }
  return s;
}

/** True only when a PDF was uploaded via the admin PDF field (not cover image). */
function hasPackagePdfUpload(pkg) {
  return Boolean(String(pkg?.pdf_url ?? pkg?.pdfUrl ?? "").trim());
}

/** Resolved PDF URL for View Details (admin `pdf_url` only). */
function getPackagePdfUrl(pkg) {
  if (!hasPackagePdfUpload(pkg)) return "";
  return resolveAnyUrl(pkg?.pdf_url ?? pkg?.pdfUrl ?? "");
}

/** Cover image for the card only (not used for View Details). Ignore PDF URLs in `image`. */
function getPackageCoverPhotoUrl(pkg) {
  const imageField = resolveAnyUrl(pkg?.image);
  if (!imageField) return "";
  if (/\.pdf($|\?)/i.test(imageField)) return "";
  return imageField;
}

const PRICE_SLIDER_MAX = 10000;

const PackagesPage = ({ t, packages, packagesError, packagesLoading, onRetryPackages }) => {
  const [country, setCountry] = useState("");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(PRICE_SLIDER_MAX);
  const [duration, setDuration] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [inquiryPackage, setInquiryPackage] = useState(null);
  const packagesPerPage = 6;

  const filteredPackages = packages.filter((pkg) => {
    const pkgCountry = (pkg.country ?? "").toLowerCase();
    const filterCountry = country.trim().toLowerCase();
    return (
      (filterCountry ? pkgCountry.includes(filterCountry) : true) &&
      Number(pkg.price) >= priceMin &&
      Number(pkg.price) <= priceMax &&
      (duration ? Number(pkg.duration) === parseInt(duration, 10) : true)
    );
  });

  const hasCountry = (pkg) => Boolean(String(pkg.country ?? "").trim());
  const hasDescription = (pkg) => Boolean(String(pkg.description ?? "").trim());
  const hasPrice = (pkg) => {
    const n = Number(pkg.price);
    return Number.isFinite(n) && n > 0;
  };
  const hasDuration = (pkg) => {
    const n = Number(pkg.duration);
    return Number.isFinite(n) && n > 0;
  };
  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / packagesPerPage));
  const startIdx = (currentPage - 1) * packagesPerPage;
  const visiblePackages = filteredPackages.slice(startIdx, startIdx + packagesPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [country, priceMin, priceMax, duration]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <section className="packages">
      <div className="section-header">
        <p className="eyebrow">{t.packagesEyebrow}</p>
        <h2>{t.packagesTitle}</h2>
        <p>{t.packagesText}</p>
      </div>

      <div className="filters">
        <label>
          {t.country}:
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder={t.enterCountry}
          />
        </label>

        <label className="filter-price-range">
          <span className="filter-price-range-heading">
            {t.price}
            <span className="filter-price-range-values">
              {t.currencySymbol}
              {priceMin.toLocaleString()}–{t.currencySymbol}
              {priceMax.toLocaleString()}
            </span>
          </span>
          <div className="filter-price-range-control">
            <PriceRangeSlider
              min={0}
              max={PRICE_SLIDER_MAX}
              step={50}
              valueMin={priceMin}
              valueMax={priceMax}
              onMinChange={setPriceMin}
              onMaxChange={setPriceMax}
              minAriaLabel={t.minPrice}
              maxAriaLabel={t.maxPrice}
            />
          </div>
        </label>

        <label>
          {t.duration}:
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder={t.enterDuration}
          />
        </label>
      </div>

      {packagesLoading ? (
        <p className="packages-status packages-status--loading">{t.packagesLoading}</p>
      ) : null}

      {packagesError ? (
        <div className="packages-status packages-status--error">
          <p>{packagesError}</p>
          {onRetryPackages ? (
            <button type="button" className="btn-secondary" onClick={onRetryPackages}>
              {t.packagesRetry}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="packages-list">
        {!packagesLoading && !packagesError && visiblePackages.length > 0 ? (
          visiblePackages.map((pkg) => {
            const pdfUrl = getPackagePdfUrl(pkg);
            const hasPdf = hasPackagePdfUpload(pkg);
            const coverUrl = getPackageCoverPhotoUrl(pkg);
            const showPlaceholder = !coverUrl && !hasPdf;

            return (
            <article className="package" key={pkg.id}>
              {coverUrl ? (
                <div className="package-cover-wrap">
                  <img src={coverUrl} alt={pkg.name} className="package-image" />
                </div>
              ) : showPlaceholder ? (
                <div className="package-pdf-placeholder">
                  <span>{t.packagePdfPlaceholder}</span>
                </div>
              ) : null}
              <h3>{pkg.name}</h3>
              {hasCountry(pkg) ? <p className="package-country">{pkg.country}</p> : null}
              {hasDescription(pkg) ? (
                <p className="package-description">{pkg.description}</p>
              ) : null}
              {hasPrice(pkg) || hasDuration(pkg) ? (
                <div className="package-meta">
                  {hasPrice(pkg) ? (
                    <span>
                      {t.currencySymbol}
                      {pkg.price}
                    </span>
                  ) : null}
                  {hasDuration(pkg) ? (
                    <span>
                      {pkg.duration} {t.days}
                    </span>
                  ) : null}
                </div>
              ) : null}
              <div className="package-card-actions">
                <button
                  type="button"
                  className="btn-primary package-request-btn"
                  onClick={() => setInquiryPackage(pkg)}
                >
                  {t.requestPackageInfo}
                </button>
                <button
                  type="button"
                  className="package-view-details btn-secondary"
                  disabled={!hasPdf}
                  title={!hasPdf ? t.viewDetailsNoPdf : undefined}
                  onClick={() => {
                    if (!pdfUrl) return;
                    window.open(pdfUrl, "_blank", "noopener,noreferrer");
                  }}
                >
                  {t.viewDetails}
                </button>
              </div>
            </article>
            );
          })
        ) : !packagesLoading && !packagesError ? (
          <p className="empty-state">{t.noPackages}</p>
        ) : null}
      </div>

      {!packagesError && filteredPackages.length > packagesPerPage ? (
        <div className="pagination">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            {t.previous}
          </button>
          <span className="pagination-label">
            {t.page} {currentPage} {t.of} {totalPages}
          </span>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            {t.next}
          </button>
        </div>
      ) : null}

      {inquiryPackage ? (
        <PackageInquiryModal
          t={t}
          pkg={inquiryPackage}
          onClose={() => setInquiryPackage(null)}
        />
      ) : null}
    </section>
  );
};

export default PackagesPage;
