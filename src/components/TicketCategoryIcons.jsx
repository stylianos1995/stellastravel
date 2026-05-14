import React from "react";
import airplaneIcon from "../assets/airplane.svg";
import shipIcon from "../assets/ship.png";

/** Admin ticket category visuals from bundled assets (`airplane.svg`, `ship.png`). */

export function AirplaneCategoryIcon({ className }) {
  return (
    <img
      src={airplaneIcon}
      alt=""
      className={className}
      aria-hidden="true"
      draggable={false}
    />
  );
}

export function BoatCategoryIcon({ className }) {
  return (
    <img
      src={shipIcon}
      alt=""
      className={className}
      aria-hidden="true"
      draggable={false}
    />
  );
}

export function OtherCategoryIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5" cy="12" r="2" fill="currentColor" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="19" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}
