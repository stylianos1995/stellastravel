import React, { useEffect, useRef, useState } from "react";

const PackageDescription = ({ text, readMoreLabel, readLessLabel }) => {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el || expanded) return;

    const measure = () => {
      setIsTruncated(el.scrollHeight > el.clientHeight + 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, expanded]);

  return (
    <div className="package-description-wrap">
      <p
        ref={textRef}
        className={`package-description${
          expanded ? " package-description--expanded" : " package-description--clamped"
        }`}
      >
        {text}
      </p>
      {isTruncated || expanded ? (
        <button
          type="button"
          className="package-description-toggle"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          {expanded ? readLessLabel : readMoreLabel}
        </button>
      ) : null}
    </div>
  );
};

export default PackageDescription;
