const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

/** Normalize token from storage/state so stray whitespace does not break JWT verification. */
const bearerHeaders = (token) => {
  const trimmed = String(token ?? "").trim();
  return trimmed ? { Authorization: `Bearer ${trimmed}` } : {};
};

const request = async (path, options = {}) => {
  const headers = {
    ...(options.headers || {}),
  };
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message = data.message || message;
    } catch (_err) {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const loginAdmin = (username, password) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const getPackages = () => request("/packages");

export const createPackage = (payload, token) =>
  request("/packages", {
    method: "POST",
    headers: bearerHeaders(token),
    body: JSON.stringify(payload),
  });

export const updatePackage = (id, payload, token) =>
  request(`/packages/${id}`, {
    method: "PUT",
    headers: bearerHeaders(token),
    body: JSON.stringify(payload),
  });

export const deletePackage = (id, token) =>
  request(`/packages/${id}`, {
    method: "DELETE",
    headers: bearerHeaders(token),
  });

export const uploadPackageAsset = (file, token) => {
  const formData = new FormData();
  formData.append("file", file);
  return request("/uploads", {
    method: "POST",
    headers: bearerHeaders(token),
    body: formData,
  });
};

export const createTicketRequest = (payload) =>
  request("/tickets", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getTicketRequests = (token) =>
  request("/tickets", {
    method: "GET",
    headers: bearerHeaders(token),
  });

export const markTicketRequestChecked = (id, checked, token) =>
  request(`/tickets/${id}/check`, {
    method: "PUT",
    headers: bearerHeaders(token),
    body: JSON.stringify({ checked }),
  });

export const deleteTicketRequest = (id, token) =>
  request(`/tickets/${id}`, {
    method: "DELETE",
    headers: bearerHeaders(token),
  });
