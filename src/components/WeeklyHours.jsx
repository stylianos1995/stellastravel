import React from "react";

const WeeklyHours = ({ t }) => {
  return (
    <section className="weekly-hours-section">
      <div className="weekly-hours-card">
        <h3>{t.weeklyHoursTitle}</h3>
        <ul className="hours-list">
          <li><span>{t.monday}</span><span>9:00 a.m. - 6:00 p.m.</span></li>
          <li><span>{t.tuesday}</span><span>9:00 a.m. - 6:00 p.m.</span></li>
          <li><span>{t.wednesday}</span><span>9:00 a.m. - 6:00 p.m.</span></li>
          <li><span>{t.thursday}</span><span>9:00 a.m. - 6:00 p.m.</span></li>
          <li><span>{t.friday}</span><span>9:00 a.m. - 6:00 p.m.</span></li>
          <li><span>{t.saturday}</span><span>9:00 a.m. - 3:00 p.m.</span></li>
          <li><span>{t.sunday}</span><span>{t.closed}</span></li>
        </ul>
        <p className="hours-note">{t.holidayNote}</p>
      </div>
    </section>
  );
};

export default WeeklyHours;
