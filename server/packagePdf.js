const path = require("path");
const fs = require("fs");

/**
 * @param {string} uploadsDir absolute path to uploads folder
 * @param {string} pdfUrlStored value from packages.pdf_url
 */
function packagePdfAvailable(uploadsDir, pdfUrlStored) {
  const s = String(pdfUrlStored ?? "").trim();
  if (!s) return false;

  const pathPart = s.split("?")[0].split("#")[0];
  if (!/\.pdf$/i.test(pathPart)) return false;

  const match = pathPart.match(/\/uploads\/([^/]+)$/i);
  const filename = match ? match[1] : null;

  if (!filename) {
    return false;
  }

  return fs.existsSync(path.join(uploadsDir, filename));
}

function enrichPackageRow(uploadsDir, row) {
  if (!row) return row;
  return {
    ...row,
    pdf_available: packagePdfAvailable(uploadsDir, row.pdf_url),
  };
}

module.exports = { packagePdfAvailable, enrichPackageRow };
