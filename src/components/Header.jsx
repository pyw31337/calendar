import React from 'react';

export default function Header({
  activeCalendar,
  onOpenAdmin,
  onOpenShare
}) {
  return (
    <header className="header-card">
      <div className="header-title-section">
        <div>
          <div className="header-calendar-title">
            <span>{activeCalendar?.title || '사모임 일정 달력'}</span>
          </div>
          {activeCalendar?.description && (
            <p className="header-calendar-desc">{activeCalendar.description}</p>
          )}
        </div>
      </div>

      <div className="header-actions">
        {/* Share Button */}
        <button
          id="btn-share-calendar"
          className="btn btn-secondary"
          onClick={onOpenShare}
        >
          <span>공유</span>
        </button>

        {/* Admin Settings Button (styled same as secondary button) */}
        <button
          id="btn-admin-settings"
          className="btn btn-secondary"
          onClick={onOpenAdmin}
        >
          <span>어드민</span>
        </button>
      </div>
    </header>
  );
}
