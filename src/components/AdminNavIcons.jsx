import React from "react";
import airplaneIcon from "../assets/airplane.svg";

/** Sidebar icons for the admin panel navigation. */

export function AdminHomeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
    </svg>
  );
}

export function AdminPackageIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3 20 7v10l-8 4-8-4V7l8-4Z" strokeLinejoin="round" />
      <path d="M12 11v10M4 7l8 4 8-4" strokeLinejoin="round" />
    </svg>
  );
}

export function AdminTicketIcon({ className }) {
  return (
    <img src={airplaneIcon} alt="" className={className} aria-hidden="true" draggable={false} />
  );
}

export function AdminAnnouncementIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 10v4M8 8v8M12 6v12M16 8v8M20 10v4" strokeLinecap="round" />
    </svg>
  );
}

export function AdminInquiryIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 9h8M8 13h5" strokeLinecap="round" />
    </svg>
  );
}

export function AdminLogoutIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" />
      <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
