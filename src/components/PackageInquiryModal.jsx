import React, { useEffect, useState } from "react";
import { createPackageInquiry } from "../api";

const initialForm = {
  firstName: "",
  lastName: "",
  mobileCountryCode: "+30",
  mobileNumber: "",
  email: "",
  preferredTravelDate: "",
  adultsCount: 1,
  childrenCount: 0,
  babiesCount: 0,
  notes: "",
};

function formatLocalDateInput(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const PackageInquiryModal = ({ t, pkg, onClose }) => {
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const todayInput = formatLocalDateInput(new Date());
  const totalPassengers =
    Number(formData.adultsCount || 0) +
    Number(formData.childrenCount || 0) +
    Number(formData.babiesCount || 0);

  useEffect(() => {
    setSubmitted(false);
    setStatus("");
    setStatusType("");
    setFormData(initialForm);
  }, [pkg?.id]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const adjustCount = (field, delta) => {
    setFormData((prev) => {
      const current = Number(prev[field] || 0);
      const min = field === "adultsCount" ? 1 : 0;
      const next = Math.max(min, current + delta);
      return { ...prev, [field]: next };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!pkg?.id) return;

    setSubmitting(true);
    setStatus("");
    setSubmitted(false);
    try {
      await createPackageInquiry({
        packageId: pkg.id,
        packageName: pkg.name,
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobileCountryCode: formData.mobileCountryCode,
        mobileNumber: formData.mobileNumber,
        email: formData.email.trim(),
        preferredTravelDate: formData.preferredTravelDate,
        adultsCount: Number(formData.adultsCount),
        childrenCount: Number(formData.childrenCount),
        babiesCount: Number(formData.babiesCount),
        notes: formData.notes.trim(),
      });
      setStatus(t.requestReceived);
      setStatusType("success");
      setFormData(initialForm);
      setSubmitted(true);
    } catch (err) {
      setStatus(err.message || t.packageInquiryError);
      setStatusType("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!pkg) return null;

  return (
    <div className="inquiry-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="inquiry-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="package-inquiry-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="inquiry-modal-close" onClick={onClose} aria-label={t.close}>
          ×
        </button>
        <div className="inquiry-modal-header">
          <p className="eyebrow">{t.packageInquiryEyebrow}</p>
          <h2 id="package-inquiry-title">{t.packageInquiryTitle}</h2>
          <p className="inquiry-modal-package-name">{pkg.name}</p>
          <p>{t.packageInquirySubtitle}</p>
        </div>

        {submitted ? (
          <div className="form-success-panel inquiry-modal-success" role="status">
            <p className="form-success-message">{t.requestReceived}</p>
            <button type="button" className="btn-primary" onClick={onClose}>
              {t.close}
            </button>
          </div>
        ) : (
        <form className="admin-form inquiry-modal-form" onSubmit={handleSubmit}>
          <label>
            {t.firstName}
            <input
              value={formData.firstName}
              onChange={(e) => setField("firstName", e.target.value)}
              required
            />
          </label>
          <label>
            {t.lastName}
            <input
              value={formData.lastName}
              onChange={(e) => setField("lastName", e.target.value)}
              required
            />
          </label>
          <label>
            {t.mobileCode}
            <select
              value={formData.mobileCountryCode}
              onChange={(e) => setField("mobileCountryCode", e.target.value)}
              required
            >
              <option value="+30">+30 (GR)</option>
              <option value="+44">+44 (UK)</option>
              <option value="+39">+39 (IT)</option>
              <option value="+49">+49 (DE)</option>
              <option value="+33">+33 (FR)</option>
              <option value="+34">+34 (ES)</option>
              <option value="+90">+90 (TR)</option>
              <option value="+1">+1 (US/CA)</option>
            </select>
          </label>
          <label>
            {t.mobileNumber}
            <input
              value={formData.mobileNumber}
              onChange={(e) => setField("mobileNumber", e.target.value)}
              required
            />
          </label>
          <label>
            {t.emailOptional}
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setField("email", e.target.value)}
              autoComplete="email"
            />
          </label>
          <label>
            {t.preferredTravelDate}
            <input
              type="date"
              value={formData.preferredTravelDate}
              min={todayInput}
              onChange={(e) => setField("preferredTravelDate", e.target.value)}
            />
          </label>

          <div className="admin-span-2 passenger-counters">
            <p className="passenger-counters-label">{t.howManyPeople}</p>
            <div className="passenger-counter">
              <span>{t.adults}</span>
              <div className="counter-controls">
                <button
                  type="button"
                  className="counter-btn"
                  onClick={() => adjustCount("adultsCount", -1)}
                  disabled={Number(formData.adultsCount) <= 1}
                >
                  -
                </button>
                <strong>{formData.adultsCount}</strong>
                <button type="button" className="counter-btn" onClick={() => adjustCount("adultsCount", 1)}>
                  +
                </button>
              </div>
            </div>
            <div className="passenger-counter">
              <span>{t.children}</span>
              <div className="counter-controls">
                <button
                  type="button"
                  className="counter-btn"
                  onClick={() => adjustCount("childrenCount", -1)}
                  disabled={Number(formData.childrenCount) <= 0}
                >
                  -
                </button>
                <strong>{formData.childrenCount}</strong>
                <button type="button" className="counter-btn" onClick={() => adjustCount("childrenCount", 1)}>
                  +
                </button>
              </div>
            </div>
            <div className="passenger-counter">
              <span>{t.babies}</span>
              <div className="counter-controls">
                <button
                  type="button"
                  className="counter-btn"
                  onClick={() => adjustCount("babiesCount", -1)}
                  disabled={Number(formData.babiesCount) <= 0}
                >
                  -
                </button>
                <strong>{formData.babiesCount}</strong>
                <button type="button" className="counter-btn" onClick={() => adjustCount("babiesCount", 1)}>
                  +
                </button>
              </div>
            </div>
          </div>
          <p className="admin-span-2 passenger-total">
            {t.passengers}: {totalPassengers}
          </p>

          <label className="admin-span-2">
            {t.notesDetails}
            <textarea
              rows="4"
              value={formData.notes}
              onChange={(e) => setField("notes", e.target.value)}
            />
          </label>

          <div className="admin-actions admin-span-2">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {t.submitPackageInquiry}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t.close}
            </button>
          </div>

          {status && statusType === "error" ? (
            <p className="admin-span-2 inquiry-modal-status inquiry-modal-status--error">
              {status}
            </p>
          ) : null}
        </form>
        )}
      </div>
    </div>
  );
};

export default PackageInquiryModal;