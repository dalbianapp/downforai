"use client";

import { useState } from "react";

interface UptimeSlot {
  status: string;
  time: Date;
}

interface UptimeBarWithHoursProps {
  slots: UptimeSlot[];
  uptimePercent: number;
}

const statusColors: Record<string, string> = {
  OPERATIONAL: "#16a34a",
  DEGRADED: "#ca8a04",
  OUTAGE: "#dc2626",
  UNKNOWN: "#f5f5f5", // Very light gray to distinguish from missing data
};

const statusLabels: Record<string, string> = {
  OPERATIONAL: "Operational",
  DEGRADED: "Degraded",
  OUTAGE: "Outage",
  UNKNOWN: "No data",
};

export function UptimeBarWithHours({ slots, uptimePercent: _uptimePercent }: UptimeBarWithHoursProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Generate hour markers - every 3 hours for 24h (8 markers)
  const hourMarkers = [0, 6, 12, 18, 24, 30, 36, 42]; // Indices for 0h, 3h, 6h, 9h, 12h, 15h, 18h, 21h

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const formatTimeRange = (date: Date) => {
    const endDate = new Date(date.getTime() + 30 * 60 * 1000); // +30 min
    return `${formatTime(date)} – ${formatTime(endDate)}`;
  };

  return (
    <div>
      {/* Bar */}
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", gap: "2px", borderRadius: "6px", overflow: "hidden" }}>
          {slots.map((slot, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                flex: 1,
                height: "24px",
                backgroundColor: statusColors[slot.status] || "#e5e5e5",
                cursor: "pointer",
                position: "relative",
                // Subtle border for UNKNOWN status to show it's different from outages
                border: slot.status === "UNKNOWN" ? "1px solid #e5e5e5" : "none",
                opacity: slot.status === "UNKNOWN" ? 0.7 : 1,
              }}
            >
              {/* Tooltip */}
              {hoveredIndex === idx && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "32px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#171717",
                    color: "#ffffff",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    whiteSpace: "nowrap",
                    zIndex: 10,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: "2px" }}>
                    {formatTimeRange(slot.time)}
                  </div>
                  <div style={{ color: statusColors[slot.status] }}>
                    {statusLabels[slot.status]}
                  </div>
                  {/* Arrow */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-4px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 0,
                      height: 0,
                      borderLeft: "4px solid transparent",
                      borderRight: "4px solid transparent",
                      borderTop: "4px solid #171717",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Hour markers */}
        <div style={{ position: "relative", marginTop: "8px", height: "20px" }}>
          {hourMarkers.map((slotIndex) => {
            const slot = slots[slotIndex];
            if (!slot) return null;

            // Show actual clock time (local time)
            const hours = slot.time.getHours();
            const label = `${hours.toString().padStart(2, "0")}h`;

            return (
              <div
                key={slotIndex}
                style={{
                  position: "absolute",
                  left: `${(slotIndex / slots.length) * 100}%`,
                  transform: "translateX(-50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                }}
              >
                <div
                  style={{
                    width: "1px",
                    height: "4px",
                    background: "#d1d5db",
                  }}
                />
                <span style={{ fontSize: "10px", color: "#a3a3a3", fontFamily: "monospace" }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          marginTop: "16px",
          flexWrap: "wrap",
        }}
      >
        {Object.entries(statusLabels).map(([status, label]) => (
          <div
            key={status}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "2px",
                backgroundColor: statusColors[status],
                border: status === "UNKNOWN" ? "1px solid #e5e5e5" : "none",
                opacity: status === "UNKNOWN" ? 0.7 : 1,
              }}
            />
            <span style={{ fontSize: "12px", color: "#737373" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
