import React, { useEffect, useState } from "react";

const PackagesPage = ({ t, packages, packagesError }) => {
  const [country, setCountry] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [duration, setDuration] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const packagesPerPage = 6;

  const filteredPackages = packages.filter((pkg) => {
    return (
      (country ? pkg.country.toLowerCase().includes(country.toLowerCase()) : true) &&
      (priceMin ? pkg.price >= parseInt(priceMin) : true) &&
      (priceMax ? pkg.price <= parseInt(priceMax) : true) &&
      (duration ? pkg.duration === parseInt(duration) : true)
    );
  });

  const isPdfAsset = (url = "") => /\.pdf($|\?)/i.test(url);
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

        <label>
          {t.price}:
          <input
            type="number"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            placeholder={t.minPrice}
          />
          <span className="range-separator">{t.to}</span>
          <input
            type="number"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder={t.maxPrice}
          />
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

      {packagesError ? <p className="empty-state">{packagesError}</p> : null}

      <div className="packages-list">
        {!packagesError && visiblePackages.length > 0 ? (
          visiblePackages.map((pkg) => (
            <article className="package" key={pkg.id}>
              {pkg.image ? (
                isPdfAsset(pkg.image) ? (
                  <div className="package-pdf-preview">
                    <span>PDF</span>
                    <a href={pkg.image} target="_blank" rel="noreferrer">
                      {t.openPdf}
                    </a>
                  </div>
                ) : (
                  <img src={pkg.image} alt={pkg.name} className="package-image" />
                )
              ) : null}
              <h3>{pkg.name}</h3>
              <p className="package-country">{pkg.country}</p>
              <p className="package-description">
                {pkg.description || t.packageDescriptionFallback}
              </p>
              <div className="package-meta">
                <span>{t.currencySymbol}{pkg.price}</span>
                <span>{pkg.duration} {t.days}</span>
              </div>
              <button type="button" className="btn-secondary">
                {t.viewDetails}
              </button>
            </article>
          ))
        ) : !packagesError ? (
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
    </section>
  );
};

export default PackagesPage;
