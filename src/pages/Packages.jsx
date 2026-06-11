import React, { useEffect, useState } from "react";
import PackageDescription from "../components/PackageDescription";
import PackageInquiryModal from "../components/PackageInquiryModal";
import PackagesLoadingScreen from "../components/PackagesLoadingScreen";
import PriceRangeSlider from "../components/PriceRangeSlider";
import { canViewPackagePdf, getPackagePdfUrl, resolveAnyUrl } from "../utils/packagePdf";

/** Cover image for the card only (not used for View Details). Ignore PDF URLs in `image`. */
function getPackageCoverPhotoUrl(pkg) {
  const imageField = resolveAnyUrl(pkg?.image);
  if (!imageField) return "";
  if (/\.pdf($|\?)/i.test(imageField)) return "";
  return imageField;
}

const PRICE_SLIDER_MAX = 10000;

/** Packages are fetched on app load (often before this page opens), so keep the loader visible briefly here. */
const PACKAGES_LOADER_MIN_MS = 900;

const PackagesPage = ({ t, packages, packagesError, packagesLoading, onRetryPackages }) => {
  const [country, setCountry] = useState("");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(PRICE_SLIDER_MAX);
  const [duration, setDuration] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [inquiryPackage, setInquiryPackage] = useState(null);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const packagesPerPage = 8;

  useEffect(() => {
    if (packagesLoading) {
      setShowLoadingScreen(true);
      return;
    }
    const timer = window.setTimeout(() => setShowLoadingScreen(false), PACKAGES_LOADER_MIN_MS);
    return () => window.clearTimeout(timer);
  }, [packagesLoading]);

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

      {showLoadingScreen ? (
        <PackagesLoadingScreen message={t.packagesLoading} />
      ) : (
        <>
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
        {!showLoadingScreen && !packagesError && visiblePackages.length > 0 ? (
          visiblePackages.map((pkg) => {
            const pdfUrl = getPackagePdfUrl(pkg);
            const canViewPdf = canViewPackagePdf(pkg);
            const coverUrl = getPackageCoverPhotoUrl(pkg);

            return (
            <article className="package" key={pkg.id}>
              {coverUrl ? (
                <div className="package-cover-wrap">
                  <img src={coverUrl} alt={pkg.name} className="package-image" />
                </div>
              ) : null}
              <h3>{pkg.name}</h3>
              {hasCountry(pkg) ? <p className="package-country">{pkg.country}</p> : null}
              {hasDescription(pkg) ? (
                <PackageDescription
                  text={pkg.description}
                  readMoreLabel={t.readMore}
                  readLessLabel={t.readLess}
                />
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
                  disabled={!canViewPdf}
                  aria-disabled={!canViewPdf}
                  onClick={() => {
                    if (!canViewPdf || !pdfUrl) return;
                    window.open(pdfUrl, "_blank", "noopener,noreferrer");
                  }}
                >
                  {t.viewDetails}
                </button>
              </div>
            </article>
            );
          })
        ) : !showLoadingScreen && !packagesError ? (
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
        </>
      )}

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
