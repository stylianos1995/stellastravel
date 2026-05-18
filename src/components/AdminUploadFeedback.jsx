import React from "react";

function fileNameFromUrl(url) {
  const s = String(url || "").trim();
  if (!s) return "";
  const part = (s.split("/").pop() || "").split("?")[0];
  try {
    return decodeURIComponent(part);
  } catch {
    return part;
  }
}

/**
 * @param {{ status: 'loading'|'success'|'error'|'', message: string, fileName?: string }} feedback
 * @param {string} attachedUrl - current saved URL on the package form
 * @param {string} attachedLabel - e.g. "Saved cover"
 * @param {'image'|'pdf'} kind
 */
const AdminUploadFeedback = ({ feedback, attachedUrl, attachedLabel, kind, t }) => {
  const attachedName = fileNameFromUrl(attachedUrl);
  const showPreview = kind === "image" && attachedUrl && /^https?:\/\//i.test(attachedUrl);

  return (
    <div className="upload-feedback-wrap">
      {attachedUrl ? (
        <div className="upload-attached">
          <span className="upload-attached-label">{attachedLabel}</span>
          <span className="upload-attached-name" title={attachedUrl}>
            {attachedName || attachedUrl}
          </span>
          {showPreview ? (
            <img src={attachedUrl} alt="" className="upload-attached-preview" />
          ) : null}
          {kind === "pdf" && attachedUrl ? (
            <a className="upload-attached-link" href={attachedUrl} target="_blank" rel="noreferrer">
              {t?.adminOpenUploadedPdf || "Open PDF"}
            </a>
          ) : null}
        </div>
      ) : null}

      {feedback.status ? (
        <div
          className={`upload-feedback upload-feedback--${feedback.status}`}
          role={feedback.status === "error" ? "alert" : "status"}
        >
          {feedback.status === "loading" ? (
            <span className="upload-feedback-spinner" aria-hidden="true" />
          ) : (
            <span className="upload-feedback-icon" aria-hidden="true">
              {feedback.status === "success" ? "✓" : "!"}
            </span>
          )}
          <span className="upload-feedback-text">
            {feedback.message}
            {feedback.fileName && feedback.status === "success" ? (
              <strong className="upload-feedback-file"> {feedback.fileName}</strong>
            ) : null}
          </span>
        </div>
      ) : null}
    </div>
  );
};

export default AdminUploadFeedback;
