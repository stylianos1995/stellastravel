import React, { useState } from "react";
import { createTicketRequest } from "../api";

const initialForm = {
  firstName: "",
  lastName: "",
  mobileCountryCode: "+30",
  mobileNumber: "",
  dateOfBirth: "",
  travelDate: "",
  returnDate: "",
  hasReturn: false,
  transportType: "airplane",
  peopleCount: 1,
  airplaneLuggage: false,
  boatHasCar: false,
};

const TicketRequest = ({ t }) => {
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
        transportType: formData.transportType,
        peopleCount: Number(formData.peopleCount),
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
        <label>
          {t.dateOfBirth}
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setField("dateOfBirth", e.target.value)}
            required
          />
        </label>
        <label>
          {t.travelDate}
          <input
            type="date"
            value={formData.travelDate}
            onChange={(e) => setField("travelDate", e.target.value)}
            required
          />
        </label>

        <label className="checkbox-row admin-span-2">
          <input
            type="checkbox"
            checked={formData.hasReturn}
            onChange={(e) => setField("hasReturn", e.target.checked)}
          />
          <span>{t.returnTicket}</span>
        </label>

        {formData.hasReturn ? (
          <label className="admin-span-2">
            {t.returnDate}
            <input
              type="date"
              value={formData.returnDate}
              onChange={(e) => setField("returnDate", e.target.value)}
              required={formData.hasReturn}
            />
          </label>
        ) : null}

        <label>
          {t.transportType}
          <select
            value={formData.transportType}
            onChange={(e) => setField("transportType", e.target.value)}
          >
            <option value="airplane">{t.airplane}</option>
            <option value="boat">{t.boat}</option>
          </select>
        </label>
        <label>
          {t.howManyPeople}
          <input
            type="number"
            min="1"
            value={formData.peopleCount}
            onChange={(e) => setField("peopleCount", e.target.value)}
            required
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
