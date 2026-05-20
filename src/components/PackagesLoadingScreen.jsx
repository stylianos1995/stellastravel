import React from "react";
import airplaneIcon from "../assets/airplane.svg";

const PackagesLoadingScreen = ({ message }) => {
  return (
    <div className="packages-loading-screen" role="status" aria-live="polite" aria-busy="true">
      <div className="packages-loading-orbit" aria-hidden="true">
        <div className="packages-loading-ring" />
        <div className="packages-loading-plane-track">
          <img src={airplaneIcon} alt="" className="packages-loading-plane" draggable={false} />
        </div>
      </div>
      <p className="packages-loading-message">{message}</p>
    </div>
  );
};

export default PackagesLoadingScreen;
