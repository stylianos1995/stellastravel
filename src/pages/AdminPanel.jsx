import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createPackage,
  deletePackageInquiry,
  deleteTicketRequest,
  deletePackage,
  getPackageInquiries,
  getTicketRequests,
  loginAdmin,
  markPackageInquiryChecked,
  markTicketRequestChecked,
  updatePackage,
  uploadPackageAsset,
} from "../api";
import { formatTravelDateDisplay } from "../utils/formatTravelDateDisplay";
import { isAdminRequestOverdue } from "../utils/isAdminRequestOverdue";
import {
  AirplaneCategoryIcon,
  BoatCategoryIcon,
  OtherCategoryIcon,
} from "../components/TicketCategoryIcons";
import AdminUploadFeedback from "../components/AdminUploadFeedback";

const emptyUploadFeedback = () => ({ status: "", message: "", fileName: "" });
import {
  AdminHomeIcon,
  AdminInquiryIcon,
  AdminLogoutIcon,
  AdminPackageIcon,
  AdminTicketIcon,
} from "../components/AdminNavIcons";

const TICKETS_PER_CATEGORY_PAGE = 5;

function paginateCategoryItems(items, page) {
  const totalPages = Math.max(1, Math.ceil(items.length / TICKETS_PER_CATEGORY_PAGE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * TICKETS_PER_CATEGORY_PAGE;
  return {
    pageItems: items.slice(start, start + TICKETS_PER_CATEGORY_PAGE),
    totalPages,
    safePage,
  };
}

const emptyForm = {
  name: "",
  country: "",
  price: "",
  duration: "",
  image: "",
  pdfUrl: "",
  description: "",
};

const AdminPanel = ({ t, packages, setPackages, onPackagesError }) => {
  const navigate = useNavigate();

  const handleBackHome = (event) => {
    event.preventDefault();
    if (!window.confirm(t.adminLeaveConfirm)) {
      return;
    }
    navigate("/");
  };
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [token, setToken] = useState(localStorage.getItem("stella_admin_token") || "");
  const [authError, setAuthError] = useState("");
  const [formError, setFormError] = useState("");
  const [coverUpload, setCoverUpload] = useState(emptyUploadFeedback);
  const [pdfUpload, setPdfUpload] = useState(emptyUploadFeedback);
  const [ticketRequests, setTicketRequests] = useState([]);
  const [packageInquiries, setPackageInquiries] = useState([]);
  const [activeSection, setActiveSection] = useState("packages");
  const [ticketQuery, setTicketQuery] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("all");
  const [airplaneTicketPage, setAirplaneTicketPage] = useState(1);
  const [boatTicketPage, setBoatTicketPage] = useState(1);
  const [inquiryQuery, setInquiryQuery] = useState("");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState("all");

  useEffect(() => {
    setAirplaneTicketPage(1);
    setBoatTicketPage(1);
  }, [ticketQuery, ticketStatusFilter]);

  const loadInbox = async (authToken) => {
    try {
      const [tickets, inquiries] = await Promise.all([
        getTicketRequests(authToken),
        getPackageInquiries(authToken),
      ]);
      setTicketRequests(tickets);
      setPackageInquiries(inquiries);
    } catch (_err) {
      // Keep page usable even if inbox fetch fails.
    }
  };

  useEffect(() => {
    if (!token) return;
    loadInbox(token);
  }, [token]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setFormError("");
    setCoverUpload(emptyUploadFeedback());
    setPdfUpload(emptyUploadFeedback());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const parseOptionalInt = (raw) => {
      if (raw === "" || raw === undefined || raw === null) {
        return 0;
      }
      const n = Number(raw);
      return Number.isFinite(n) ? n : 0;
    };

    const nextPackage = {
      id: editingId ?? Date.now(),
      name: formData.name.trim(),
      country: formData.country.trim(),
      price: parseOptionalInt(formData.price),
      duration: parseOptionalInt(formData.duration),
      image: formData.image.trim(),
      pdfUrl: formData.pdfUrl.trim(),
      description: formData.description.trim(),
    };

    if (!nextPackage.name) {
      setFormError(t.adminPackageNameRequired);
      return;
    }

    try {
      if (editingId) {
        const updated = await updatePackage(editingId, nextPackage, token);
        setPackages((prev) => prev.map((pkg) => (pkg.id === editingId ? updated : pkg)));
      } else {
        const created = await createPackage(nextPackage, token);
        setPackages((prev) => [created, ...prev]);
      }
      setFormError("");
      onPackagesError("");
      resetForm();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleEdit = (pkg) => {
    setEditingId(pkg.id);
    setFormData({
      name: pkg.name ?? "",
      country: pkg.country ?? "",
      price: String(pkg.price ?? ""),
      duration: String(pkg.duration ?? ""),
      image: pkg.image ?? "",
      pdfUrl: pkg.pdf_url ?? "",
      description: pkg.description ?? "",
    });
    setCoverUpload(emptyUploadFeedback());
    setPdfUpload(emptyUploadFeedback());
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.adminDeleteConfirm)) {
      return;
    }
    try {
      await deletePackage(id, token);
      setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
      onPackagesError("");
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const result = await loginAdmin(authForm.username.trim(), authForm.password);
      localStorage.setItem("stella_admin_token", result.token);
      setToken(result.token);
      await loadInbox(result.token);
      setAuthError("");
      setAuthForm({ username: "", password: "" });
    } catch (_err) {
      setAuthError(t.adminInvalidCredentials);
    }
  };

  const handleBrochurePdfUpload = async (event) => {
    const file = event.target.files?.[0];
    const input = event.target;
    if (!file) return;
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name || "");
    if (!isPdf) {
      setPdfUpload({ status: "error", message: t.adminPdfOnly, fileName: "" });
      input.value = "";
      return;
    }
    try {
      setPdfUpload({ status: "loading", message: t.uploadingFile, fileName: file.name });
      const result = await uploadPackageAsset(file, token);
      setFormData((prev) => ({ ...prev, pdfUrl: result.url }));
      setPdfUpload({ status: "success", message: t.uploadSuccessPdf, fileName: file.name });
    } catch (err) {
      setPdfUpload({ status: "error", message: err.message, fileName: "" });
    }
    input.value = "";
  };

  const handleCoverImageUpload = async (event) => {
    const file = event.target.files?.[0];
    const input = event.target;
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      setCoverUpload({ status: "error", message: t.adminImageOnly, fileName: "" });
      input.value = "";
      return;
    }
    try {
      setCoverUpload({ status: "loading", message: t.uploadingFile, fileName: file.name });
      const result = await uploadPackageAsset(file, token);
      if (result.kind !== "image") {
        setCoverUpload({ status: "error", message: t.adminImageOnly, fileName: "" });
        input.value = "";
        return;
      }
      setFormData((prev) => ({ ...prev, image: result.url }));
      setCoverUpload({ status: "success", message: t.uploadSuccessCover, fileName: file.name });
    } catch (err) {
      setCoverUpload({ status: "error", message: err.message, fileName: "" });
    }
    input.value = "";
  };

  const handleLogout = () => {
    if (!window.confirm(t.adminLogoutConfirm)) {
      return;
    }
    localStorage.removeItem("stella_admin_token");
    setToken("");
    resetForm();
  };

  const handleTicketChecked = async (id) => {
    try {
      const current = ticketRequests.find((item) => item.id === id);
      const updated = await markTicketRequestChecked(id, !Boolean(current?.is_checked), token);
      setTicketRequests((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleTicketDelete = async (id) => {
    if (!window.confirm(t.ticketDeleteConfirm)) {
      return;
    }
    try {
      await deleteTicketRequest(id, token);
      setTicketRequests((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleInquiryChecked = async (id) => {
    try {
      const current = packageInquiries.find((item) => item.id === id);
      const updated = await markPackageInquiryChecked(id, !Boolean(current?.is_checked), token);
      setPackageInquiries((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleInquiryDelete = async (id) => {
    if (!window.confirm(t.packageInquiryDeleteConfirm)) {
      return;
    }
    try {
      await deletePackageInquiry(id, token);
      setPackageInquiries((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setFormError(err.message);
    }
  };

  if (!token) {
    return (
      <section className="admin-panel">
        <p className="admin-back-home-wrap">
          <Link to="/" className="admin-side-btn admin-side-btn--home" onClick={handleBackHome}>
            <span className="admin-side-btn-label">
              <AdminHomeIcon className="admin-side-icon" />
              <span>{t.adminBackHome}</span>
            </span>
          </Link>
        </p>
        <div className="section-header">
          <p className="eyebrow">CMS</p>
          <h2>{t.adminLoginTitle}</h2>
        </div>
        <form className="admin-form" onSubmit={handleLogin}>
          <label>
            {t.adminUsername}
            <input
              value={authForm.username}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, username: e.target.value }))}
              required
            />
          </label>
          <label>
            {t.adminPassword}
            <input
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
          </label>
          <div className="admin-actions admin-span-2">
            <button type="submit" className="btn-primary">
              {t.adminLoginButton}
            </button>
          </div>
          {authError ? <p className="admin-error admin-span-2">{authError}</p> : null}
        </form>
      </section>
    );
  }

  const filteredTickets = ticketRequests.filter((item) => {
    const query = ticketQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      `${item.first_name} ${item.last_name}`.toLowerCase().includes(query) ||
      `${item.mobile_country_code} ${item.mobile_number}`.toLowerCase().includes(query);
    const matchesStatus =
      ticketStatusFilter === "all" ||
      (ticketStatusFilter === "checked" && Boolean(item.is_checked)) ||
      (ticketStatusFilter === "pending" && !item.is_checked);
    return matchesQuery && matchesStatus;
  });

  const airplaneTickets = filteredTickets.filter((item) => item.transport_type === "airplane");
  const boatTickets = filteredTickets.filter((item) => item.transport_type === "boat");
  const otherTickets = filteredTickets.filter(
    (item) => item.transport_type !== "airplane" && item.transport_type !== "boat"
  );

  const airplanePaginated = paginateCategoryItems(airplaneTickets, airplaneTicketPage);
  const boatPaginated = paginateCategoryItems(boatTickets, boatTicketPage);

  const pendingTicketCount = ticketRequests.filter((item) => !item.is_checked).length;
  const pendingInquiryCount = packageInquiries.filter((item) => !item.is_checked).length;

  const filteredInquiries = packageInquiries.filter((item) => {
    const query = inquiryQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      `${item.first_name} ${item.last_name}`.toLowerCase().includes(query) ||
      `${item.mobile_country_code} ${item.mobile_number}`.toLowerCase().includes(query) ||
      String(item.package_name || "").toLowerCase().includes(query);
    const matchesStatus =
      inquiryStatusFilter === "all" ||
      (inquiryStatusFilter === "checked" && Boolean(item.is_checked)) ||
      (inquiryStatusFilter === "pending" && !item.is_checked);
    return matchesQuery && matchesStatus;
  });

  const renderTicketItem = (item, { showTransportType = false } = {}) => {
    const overdue = isAdminRequestOverdue(item);
    return (
    <article
      className={`admin-item ${item.is_checked ? "ticket-checked" : ""}${overdue ? " ticket-overdue" : ""}`}
      key={item.id}
    >
      <div>
        {overdue ? <p className="ticket-overdue-badge">{t.ticketOverdue}</p> : null}
        <strong>
          {item.first_name} {item.last_name}
        </strong>
        <p>
          {showTransportType && item.transport_type ? `${item.transport_type} | ` : null}
          {t.passengers}: {item.people_count}
        </p>
        <p>
          {t.fromDestination}: {item.from_destination || "-"} | {t.toDestination}:{" "}
          {item.to_destination || "-"}
        </p>
        <p>
          {t.adults}: {item.adults_count ?? item.people_count ?? 0} | {t.children}:{" "}
          {item.children_count ?? 0} | {t.babies}: {item.babies_count ?? 0}
        </p>
        {item.notes ? (
          <p>
            {t.notesDetails}: {item.notes}
          </p>
        ) : null}
        <p>
          {t.mobile}: {item.mobile_country_code} {item.mobile_number}
        </p>
        <p>
          {t.travelDate}: {formatTravelDateDisplay(item.travel_date)}
          {item.return_date
            ? ` | ${t.returnDate}: ${formatTravelDateDisplay(item.return_date)}`
            : ""}
        </p>
        <p>
          {item.transport_type === "airplane"
            ? `${t.withSuitcase}: ${item.airplane_luggage ? t.yes : t.no}`
            : `${t.withCar}: ${item.boat_has_car ? t.yes : t.no}`}
        </p>
        <p>{t.adminRequestedAt}: {new Date(item.created_at).toLocaleString()}</p>
        <p>
          {t.status}:{" "}
          {overdue ? (
            <span className="ticket-overdue-label">{t.ticketOverdue}</span>
          ) : item.is_checked ? (
            t.ticketChecked
          ) : (
            t.ticketPending
          )}
        </p>
      </div>
      <div className="admin-item-actions">
        <button type="button" className="btn-secondary" onClick={() => handleTicketChecked(item.id)}>
          {item.is_checked ? t.markUnchecked : t.markChecked}
        </button>
        <button type="button" className="btn-secondary" onClick={() => handleTicketDelete(item.id)}>
          {t.adminDelete}
        </button>
      </div>
    </article>
    );
  };

  const renderCategoryPagination = (totalPages, currentPage, setPage) => {
    if (totalPages <= 1) return null;
    const page = Math.min(currentPage, totalPages);
    return (
      <div className="pagination admin-category-pagination">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
        >
          {t.previous}
        </button>
        <span className="pagination-label">
          {t.page} {page} {t.of} {totalPages}
        </span>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={page === totalPages}
        >
          {t.next}
        </button>
      </div>
    );
  };

  return (
    <section className="admin-panel">
      <div className="section-header">
        <p className="eyebrow">CMS</p>
        <h2>{t.adminTitle}</h2>
        <p>{t.adminSubtitle}</p>
      </div>

      <div className="admin-dashboard">
        <aside className="admin-sidebar">
          <nav className="admin-nav" aria-label={t.adminTitle}>
          <Link to="/" className="admin-side-btn admin-side-btn--home" onClick={handleBackHome}>
            <span className="admin-side-btn-label">
              <AdminHomeIcon className="admin-side-icon" />
              <span>{t.adminBackHome}</span>
            </span>
          </Link>
          <button
            type="button"
            className={`admin-side-btn ${activeSection === "packages" ? "active" : ""}`}
            onClick={() => setActiveSection("packages")}
          >
            <span className="admin-side-btn-label">
              <AdminPackageIcon className="admin-side-icon" />
              <span>{t.adminNavAddPackage}</span>
            </span>
          </button>
          <button
            type="button"
            className={`admin-side-btn ${activeSection === "tickets" ? "active" : ""}`}
            onClick={() => setActiveSection("tickets")}
          >
            <span className="admin-side-btn-label">
              <AdminTicketIcon className="admin-side-icon" />
              <span>{t.adminNavTicketRequests}</span>
            </span>
            <span className="admin-nav-badge" aria-label={t.adminNavPendingCount}>
              {pendingTicketCount}
            </span>
          </button>
          <button
            type="button"
            className={`admin-side-btn ${activeSection === "packageInquiries" ? "active" : ""}`}
            onClick={() => setActiveSection("packageInquiries")}
          >
            <span className="admin-side-btn-label">
              <AdminInquiryIcon className="admin-side-icon" />
              <span>{t.adminNavPackageInquiries}</span>
            </span>
            <span className="admin-nav-badge" aria-label={t.adminNavPendingCount}>
              {pendingInquiryCount}
            </span>
          </button>
          <button type="button" className="admin-side-btn admin-side-btn--logout" onClick={handleLogout}>
            <span className="admin-side-btn-label">
              <AdminLogoutIcon className="admin-side-icon" />
              <span>{t.adminLogout}</span>
            </span>
          </button>
          </nav>
        </aside>

        <div className="admin-content">
          {activeSection === "packages" ? (
            <>
              <form className="admin-form" onSubmit={handleSubmit}>
                <label>
                  {t.adminName}
                  <input
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </label>
                <label>
                  {t.adminCountry}
                  <input
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                  />
                </label>
                <label>
                  {t.adminPrice}
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                  />
                </label>
                <label>
                  {t.adminDuration}
                  <input
                    type="number"
                    min="0"
                    value={formData.duration}
                    onChange={(e) => handleChange("duration", e.target.value)}
                  />
                </label>
                <label className="admin-span-2 admin-upload-field">
                  {t.adminUploadCoverImage}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                  />
                  <AdminUploadFeedback
                    feedback={coverUpload}
                    attachedUrl={formData.image}
                    attachedLabel={t.adminUploadAttachedCover}
                    kind="image"
                    t={t}
                  />
                </label>
                <label className="admin-span-2 admin-upload-field">
                  {t.adminUploadPdf}
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleBrochurePdfUpload}
                  />
                  <AdminUploadFeedback
                    feedback={pdfUpload}
                    attachedUrl={formData.pdfUrl}
                    attachedLabel={t.adminUploadAttachedPdf}
                    kind="pdf"
                    t={t}
                  />
                </label>
                <label className="admin-span-2">
                  {t.adminDescription}
                  <textarea
                    rows="4"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
                </label>
                <div className="admin-actions admin-span-2">
                  <button type="submit" className="btn-primary">
                    {editingId ? t.adminUpdate : t.adminCreate}
                  </button>
                  {editingId ? (
                    <button type="button" className="btn-secondary" onClick={resetForm}>
                      {t.adminCancel}
                    </button>
                  ) : null}
                </div>
                {formError ? <p className="admin-error admin-span-2">{formError}</p> : null}
              </form>

              <div className="admin-list">
                <h3>{t.adminManageTitle}</h3>
                {packages.map((pkg) => (
                  <article className="admin-item" key={pkg.id}>
                    <div>
                      <strong>{pkg.name}</strong>
                      <p>
                        {pkg.country} | {t.currencySymbol}{pkg.price} | {pkg.duration} {t.days}
                      </p>
                    </div>
                    <div className="admin-item-actions">
                      <button type="button" className="btn-secondary" onClick={() => handleEdit(pkg)}>
                        {t.adminEdit}
                      </button>
                      <button type="button" className="btn-secondary" onClick={() => handleDelete(pkg.id)}>
                        {t.adminDelete}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : activeSection === "tickets" ? (
            <div className="admin-list">
              <h3>{t.adminTicketRequests}</h3>
              <div className="admin-ticket-tools">
                <input
                  placeholder={t.adminSearchTickets}
                  value={ticketQuery}
                  onChange={(e) => setTicketQuery(e.target.value)}
                />
                <select value={ticketStatusFilter} onChange={(e) => setTicketStatusFilter(e.target.value)}>
                  <option value="all">{t.all}</option>
                  <option value="pending">{t.ticketPending}</option>
                  <option value="checked">{t.ticketChecked}</option>
                </select>
              </div>
              {filteredTickets.length > 0 ? (
                <div className="admin-ticket-categories">
                  <div className="admin-ticket-category">
                    <h4 className="admin-ticket-category-title">
                      <AirplaneCategoryIcon className="admin-ticket-category-icon" />
                      <span>{t.airplane}</span>
                    </h4>
                    {airplaneTickets.length > 0 ? (
                      <>
                        {airplanePaginated.pageItems.map((item) => renderTicketItem(item))}
                        {renderCategoryPagination(
                          airplanePaginated.totalPages,
                          airplanePaginated.safePage,
                          setAirplaneTicketPage
                        )}
                      </>
                    ) : (
                      <p className="admin-ticket-category-empty">{t.adminTicketsNoneInCategory}</p>
                    )}
                  </div>
                  <div className="admin-ticket-category">
                    <h4 className="admin-ticket-category-title">
                      <BoatCategoryIcon className="admin-ticket-category-icon" />
                      <span>{t.boat}</span>
                    </h4>
                    {boatTickets.length > 0 ? (
                      <>
                        {boatPaginated.pageItems.map((item) => renderTicketItem(item))}
                        {renderCategoryPagination(
                          boatPaginated.totalPages,
                          boatPaginated.safePage,
                          setBoatTicketPage
                        )}
                      </>
                    ) : (
                      <p className="admin-ticket-category-empty">{t.adminTicketsNoneInCategory}</p>
                    )}
                  </div>
                  {otherTickets.length > 0 ? (
                    <div className="admin-ticket-category">
                      <h4 className="admin-ticket-category-title">
                        <OtherCategoryIcon className="admin-ticket-category-icon" />
                        <span>{t.adminTicketsCategoryOther}</span>
                      </h4>
                      {otherTickets.map((item) => renderTicketItem(item, { showTransportType: true }))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <p>{t.noTicketRequests}</p>
              )}
            </div>
          ) : (
            <div className="admin-list">
              <h3>{t.adminPackageInquiries}</h3>
              <div className="admin-ticket-tools">
                <input
                  placeholder={t.adminSearchPackageInquiries}
                  value={inquiryQuery}
                  onChange={(e) => setInquiryQuery(e.target.value)}
                />
                <select
                  value={inquiryStatusFilter}
                  onChange={(e) => setInquiryStatusFilter(e.target.value)}
                >
                  <option value="all">{t.all}</option>
                  <option value="pending">{t.ticketPending}</option>
                  <option value="checked">{t.ticketChecked}</option>
                </select>
              </div>
              {filteredInquiries.length > 0 ? (
                filteredInquiries.map((item) => (
                  <article
                    className={`admin-item ${item.is_checked ? "ticket-checked" : ""}`}
                    key={item.id}
                  >
                    <div>
                      <strong>
                        {item.first_name} {item.last_name}
                      </strong>
                      <p>
                        {t.inquiryPackageLabel}: {item.package_name}
                      </p>
                      <p>
                        {t.passengers}: {item.people_count} ({t.adults}: {item.adults_count ?? 0} |{" "}
                        {t.children}: {item.children_count ?? 0} | {t.babies}: {item.babies_count ?? 0})
                      </p>
                      {item.preferred_travel_date ? (
                        <p>
                          {t.preferredTravelDate}: {formatTravelDateDisplay(item.preferred_travel_date)}
                        </p>
                      ) : null}
                      {item.email ? (
                        <p>
                          {t.email}: {item.email}
                        </p>
                      ) : null}
                      {item.notes ? (
                        <p>
                          {t.notesDetails}: {item.notes}
                        </p>
                      ) : null}
                      <p>
                        {t.mobile}: {item.mobile_country_code} {item.mobile_number}
                      </p>
                      <p>{t.adminRequestedAt}: {new Date(item.created_at).toLocaleString()}</p>
                      <p>
                        {t.status}: {item.is_checked ? t.ticketChecked : t.ticketPending}
                      </p>
                    </div>
                    <div className="admin-item-actions">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleInquiryChecked(item.id)}
                      >
                        {item.is_checked ? t.markUnchecked : t.markChecked}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleInquiryDelete(item.id)}
                      >
                        {t.adminDelete}
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <p>{t.noPackageInquiries}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminPanel;
