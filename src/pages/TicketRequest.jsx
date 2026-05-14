import React, { useState } from "react";
import { createTicketRequest } from "../api";
import { formatTravelDateDisplay } from "../utils/formatTravelDateDisplay";

const airplaneOptionsEn = [
  "Athens Airport (ATH)",
  "Thessaloniki Airport (SKG)",
  "Heraklion Airport (HER)",
  "Santorini Airport (JTR)",
  "Mykonos Airport (JMK)",
  "Rhodes Airport (RHO)",
  "Corfu Airport (CFU)",
  "Chania Airport (CHQ)",
  "Kefalonia Airport (EFL)",
  "Zakynthos Airport (ZTH)",
];

const boatOptionsEn = [
  "Patras Port",
  "Piraeus Port",
  "Rafina Port",
  "Lavrio Port",
  "Igoumenitsa Port",
  "Volos Port",
  "Heraklion Port",
  "Santorini Port (Athinios)",
  "Mykonos Port",
  "Thessaloniki Port",
];

const airplaneOptionsEl = [
  "Αεροδρόμιο Αθήνας (ATH)",
  "Αεροδρόμιο Θεσσαλονίκης (SKG)",
  "Αεροδρόμιο Ηρακλείου (HER)",
  "Αεροδρόμιο Σαντορίνης (JTR)",
  "Αεροδρόμιο Μυκόνου (JMK)",
  "Αεροδρόμιο Ρόδου (RHO)",
  "Αεροδρόμιο Κέρκυρας (CFU)",
  "Αεροδρόμιο Χανίων (CHQ)",
  "Αεροδρόμιο Κεφαλονιάς (EFL)",
  "Αεροδρόμιο Ζακύνθου (ZTH)",
];

const boatOptionsEl = [
  "Λιμάνι Πάτρας",
  "Λιμάνι Πειραιά",
  "Λιμάνι Ραφήνας",
  "Λιμάνι Λαυρίου",
  "Λιμάνι Ηγουμενίτσας",
  "Λιμάνι Βόλου",
  "Λιμάνι Ηρακλείου",
  "Λιμάνι Σαντορίνης (Αθηνιός)",
  "Λιμάνι Μυκόνου",
  "Λιμάνι Θεσσαλονίκης",
];

/** Today's date in local time, YYYY-MM-DD — for `<input type="date" />` constraints */
function formatLocalDateInput(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const initialForm = {
  firstName: "",
  lastName: "",
  mobileCountryCode: "+30",
  mobileNumber: "",
  dateOfBirth: "",
  travelDate: "",
  returnDate: "",
  fromDestination: "",
  toDestination: "",
  hasReturn: false,
  transportType: "",
  adultsCount: 1,
  childrenCount: 0,
  babiesCount: 0,
  notes: "",
  airplaneLuggage: false,
  boatHasCar: false,
};

const TicketRequest = ({ t, lang }) => {
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");
  const totalPassengers =
    Number(formData.adultsCount || 0) +
    Number(formData.childrenCount || 0) +
    Number(formData.babiesCount || 0);

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isGreek = lang === "el";
  const airplaneOptions = isGreek ? airplaneOptionsEl : airplaneOptionsEn;
  const boatOptions = isGreek ? boatOptionsEl : boatOptionsEn;
  const transportChosen =
    formData.transportType === "airplane" || formData.transportType === "boat";
  const destinationOptions =
    formData.transportType === "boat" ? boatOptions : airplaneOptions;

  const todayInput = formatLocalDateInput(new Date());
  const travelDateMin = todayInput;
  const returnDateMin =
    formData.travelDate && formData.travelDate >= todayInput
      ? formData.travelDate
      : todayInput;

  const handleTravelDateChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => {
      const next = { ...prev, travelDate: value };
      if (
        prev.hasReturn &&
        prev.returnDate &&
        value &&
        prev.returnDate < value
      ) {
        next.returnDate = value;
      }
      return next;
    });
  };

  const handleHasReturnChange = (e) => {
    const checked = e.target.checked;
    setFormData((prev) => {
      const low = prev.travelDate && prev.travelDate >= todayInput ? prev.travelDate : todayInput;
      if (!checked) {
        return { ...prev, hasReturn: false };
      }
      let returnDate = prev.returnDate;
      if (!returnDate || returnDate < low) {
        returnDate = low;
      }
      return { ...prev, hasReturn: true, returnDate };
    });
  };

  const adjustCount = (field, delta) => {
    setFormData((prev) => {
      const current = Number(prev[field] || 0);
      const next = Math.max(0, current + delta);
      return { ...prev, [field]: next };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await createTicketRequest({
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobileCountryCode: formData.mobileCountryCode,
        mobileNumber: formData.mobileNumber,
        dateOfBirth: formData.dateOfBirth,
        travelDate: formData.travelDate,
        returnDate: formData.hasReturn ? formData.returnDate : "",
        fromDestination: formData.fromDestination,
        toDestination: formData.toDestination,
        transportType: formData.transportType,
        adultsCount: Number(formData.adultsCount),
        childrenCount: Number(formData.childrenCount),
        babiesCount: Number(formData.babiesCount),
        peopleCount:
          Number(formData.adultsCount) +
          Number(formData.childrenCount) +
          Number(formData.babiesCount),
        notes: formData.notes.trim(),
        airplaneLuggage: formData.transportType === "airplane" ? formData.airplaneLuggage : null,
        boatHasCar: formData.transportType === "boat" ? formData.boatHasCar : null,
      });
      setStatus(t.ticketSuccess);
      setStatusType("success");
      setFormData(initialForm);
    } catch (err) {
      setStatus(err.message || t.ticketError);
      setStatusType("error");
    }
  };

  return (
    <section className="admin-panel">
      <div className="section-header">
        <p className="eyebrow">{t.ticketEyebrow}</p>
        <h2>{t.ticketTitle}</h2>
        <p>{t.ticketSubtitle}</p>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
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

        <div
          className={`ticket-travel-block admin-span-2${formData.hasReturn ? " has-return" : ""}`}
        >
          <label className="ticket-travel-field">
            {t.travelDate}
            <input
              type="date"
              value={formData.travelDate}
              min={travelDateMin}
              onChange={handleTravelDateChange}
              required
            />
            {formData.travelDate ? (
              <span className="ticket-date-dmy">{formatTravelDateDisplay(formData.travelDate)}</span>
            ) : null}
          </label>
          {formData.hasReturn ? (
            <label className="ticket-return-date">
              {t.returnDate}
              <input
                type="date"
                value={formData.returnDate}
                min={returnDateMin}
                onChange={(e) => setField("returnDate", e.target.value)}
                required={formData.hasReturn}
              />
              {formData.returnDate ? (
                <span className="ticket-date-dmy">{formatTravelDateDisplay(formData.returnDate)}</span>
              ) : null}
            </label>
          ) : null}
          <label className="checkbox-row ticket-return-check">
            <input
              type="checkbox"
              checked={formData.hasReturn}
              onChange={handleHasReturnChange}
            />
            <span>{t.returnTicket}</span>
          </label>
        </div>

        <div className="admin-span-2 ticket-transport-block">
          <span className="ticket-transport-label">{t.transportType}</span>
          <div className="transport-choice-row" role="group" aria-label={t.transportType}>
            <button
              type="button"
              className={`transport-choice-btn ${formData.transportType === "airplane" ? "selected" : ""}`}
              onClick={() => setField("transportType", "airplane")}
            >
              {t.airplane}
            </button>
            <button
              type="button"
              className={`transport-choice-btn ${formData.transportType === "boat" ? "selected" : ""}`}
              onClick={() => setField("transportType", "boat")}
            >
              {t.boat}
            </button>
          </div>
          {!transportChosen ? <p className="transport-hint">{t.chooseTransportFirst}</p> : null}
        </div>

        {transportChosen ? (
          <>
            <label className="admin-span-2 ticket-dob-field">
              {t.dateOfBirth}
              <input
                type="date"
                value={formData.dateOfBirth}
                max={todayInput}
                onChange={(e) => setField("dateOfBirth", e.target.value)}
                required
              />
            </label>

            <label>
              {t.fromDestination}
              <input
                value={formData.fromDestination}
                onChange={(e) => setField("fromDestination", e.target.value)}
                list="destination-options"
                placeholder={formData.transportType === "boat" ? t.fromPlaceholderBoat : t.fromPlaceholderAir}
                required
              />
            </label>
            <label>
              {t.toDestination}
              <input
                value={formData.toDestination}
                onChange={(e) => setField("toDestination", e.target.value)}
                list="destination-options"
                placeholder={formData.transportType === "boat" ? t.toPlaceholderBoat : t.toPlaceholderAir}
                required
              />
            </label>
            <datalist id="destination-options">
              {destinationOptions.map((option) => (
                <option value={option} key={option} />
              ))}
            </datalist>

            <div className="admin-span-2 passenger-grid">
              <div className="passenger-counter">
                <span>{t.adults}</span>
                <div className="counter-controls">
                  <button
                    type="button"
                    className="counter-btn"
                    onClick={() => adjustCount("adultsCount", -1)}
                    disabled={Number(formData.adultsCount) <= 0}
                  >
                    -
                  </button>
                  <strong>{formData.adultsCount}</strong>
                  <button
                    type="button"
                    className="counter-btn"
                    onClick={() => adjustCount("adultsCount", 1)}
                  >
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
                  <button
                    type="button"
                    className="counter-btn"
                    onClick={() => adjustCount("childrenCount", 1)}
                  >
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
                  <button
                    type="button"
                    className="counter-btn"
                    onClick={() => adjustCount("babiesCount", 1)}
                  >
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

            {formData.transportType === "airplane" ? (
              <label className="checkbox-row admin-span-2">
                <input
                  type="checkbox"
                  checked={formData.airplaneLuggage}
                  onChange={(e) => setField("airplaneLuggage", e.target.checked)}
                />
                <span>{t.withSuitcase}</span>
              </label>
            ) : (
              <label className="checkbox-row admin-span-2">
                <input
                  type="checkbox"
                  checked={formData.boatHasCar}
                  onChange={(e) => setField("boatHasCar", e.target.checked)}
                />
                <span>{t.withCar}</span>
              </label>
            )}

            <div className="admin-actions admin-span-2">
              <button type="submit" className="btn-primary">
                {t.submitTicketRequest}
              </button>
            </div>
          </>
        ) : null}

        {status ? (
          <p className={`admin-span-2 ${statusType === "success" ? "admin-success" : "admin-error"}`}>
            {status}
          </p>
        ) : null}
      </form>
    </section>
  );
};

export default TicketRequest;
