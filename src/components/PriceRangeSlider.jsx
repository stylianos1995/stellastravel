import React from "react";

const PriceRangeSlider = ({
  min = 0,
  max = 10000,
  step = 50,
  valueMin,
  valueMax,
  onMinChange,
  onMaxChange,
  minAriaLabel,
  maxAriaLabel,
}) => {
  const safeMax = Math.max(min, max);
  const lo = Math.min(valueMin, valueMax);
  const hi = Math.max(valueMin, valueMax);
  const range = safeMax - min || 1;
  const fillLeft = ((lo - min) / range) * 100;
  const fillWidth = ((hi - lo) / range) * 100;

  return (
    <div className="dual-range">
      <div className="dual-range-track" aria-hidden="true">
        <span className="dual-range-track-bg" />
        <span
          className="dual-range-fill"
          style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }}
        />
      </div>
      <input
        type="range"
        className="dual-range-input dual-range-input--min"
        min={min}
        max={safeMax}
        step={step}
        value={lo}
        onChange={(e) => {
          const next = Number(e.target.value);
          onMinChange(Math.min(next, hi));
        }}
        aria-label={minAriaLabel}
        aria-valuemin={min}
        aria-valuemax={safeMax}
        aria-valuenow={lo}
      />
      <input
        type="range"
        className="dual-range-input dual-range-input--max"
        min={min}
        max={safeMax}
        step={step}
        value={hi}
        onChange={(e) => {
          const next = Number(e.target.value);
          onMaxChange(Math.max(next, lo));
        }}
        aria-label={maxAriaLabel}
        aria-valuemin={min}
        aria-valuemax={safeMax}
        aria-valuenow={hi}
      />
    </div>
  );
};

export default PriceRangeSlider;
