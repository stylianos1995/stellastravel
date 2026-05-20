const defaultApiBase = "http://localhost:5000/api";

/** API host for resolving `/uploads/...` paths (must not use the React dev server origin). */
export function getApiOrigin() {
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

export function resolveAnyUrl(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("//")) return `https:${s}`;
  if (s.startsWith("/") || /^uploads\//i.test(s)) {
    const origin = getApiOrigin().replace(/\/$/, "");
    const path = s.startsWith("/") ? s : `/${s}`;
    return `${origin}${path}`;
  }
  return s;
}

/** True when the stored path/URL points at a PDF file (admin `pdf_url` / `pdfUrl` only). */
export function isPdfAssetUrl(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return false;
  const path = s.split("?")[0].split("#")[0];
  return /\.pdf$/i.test(path);
}

export function getPackagePdfRaw(pkg) {
  return String(pkg?.pdf_url ?? pkg?.pdfUrl ?? "").trim();
}

/** True when the package record has a PDF path in the dedicated field. */
export function hasPackagePdfUpload(pkg) {
  const pdfRaw = getPackagePdfRaw(pkg);
  if (!isPdfAssetUrl(pdfRaw)) return false;
  const imageRaw = String(pkg?.image ?? "").trim();
  if (imageRaw && pdfRaw === imageRaw && !isPdfAssetUrl(imageRaw)) {
    return false;
  }
  return true;
}

/** Resolved PDF URL for View Details (always on the API host). */
export function getPackagePdfUrl(pkg) {
  if (!hasPackagePdfUpload(pkg)) return "";
  return resolveAnyUrl(getPackagePdfRaw(pkg));
}

/** View Details only when the API reports the file exists on disk. */
export function canViewPackagePdf(pkg) {
  if (!hasPackagePdfUpload(pkg)) return false;
  if (pkg?.pdf_available !== true) return false;
  return Boolean(getPackagePdfUrl(pkg));
}
