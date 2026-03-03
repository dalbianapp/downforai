"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";

interface WorldReportMapProps {
  serviceSlug: string;
}

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  BE: "Belgium",
  CH: "Switzerland",
  AU: "Australia",
  NZ: "New Zealand",
  JP: "Japan",
  KR: "South Korea",
  CN: "China",
  IN: "India",
  BR: "Brazil",
  MX: "Mexico",
  AR: "Argentina",
  CL: "Chile",
  RU: "Russia",
  PL: "Poland",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  SG: "Singapore",
  HK: "Hong Kong",
  TW: "Taiwan",
  TH: "Thailand",
  ID: "Indonesia",
  PH: "Philippines",
  MY: "Malaysia",
  VN: "Vietnam",
  ZA: "South Africa",
  EG: "Egypt",
  NG: "Nigeria",
  AE: "UAE",
  SA: "Saudi Arabia",
  IL: "Israel",
  TR: "Turkey",
  GR: "Greece",
  PT: "Portugal",
  IE: "Ireland",
  AT: "Austria",
  CZ: "Czech Republic",
  HU: "Hungary",
  RO: "Romania",
  BG: "Bulgaria",
};

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  GB: "🇬🇧",
  CA: "🇨🇦",
  DE: "🇩🇪",
  FR: "🇫🇷",
  IT: "🇮🇹",
  ES: "🇪🇸",
  NL: "🇳🇱",
  BE: "🇧🇪",
  CH: "🇨🇭",
  AU: "🇦🇺",
  NZ: "🇳🇿",
  JP: "🇯🇵",
  KR: "🇰🇷",
  CN: "🇨🇳",
  IN: "🇮🇳",
  BR: "🇧🇷",
  MX: "🇲🇽",
  AR: "🇦🇷",
  CL: "🇨🇱",
  RU: "🇷🇺",
  PL: "🇵🇱",
  SE: "🇸🇪",
  NO: "🇳🇴",
  DK: "🇩🇰",
  FI: "🇫🇮",
  SG: "🇸🇬",
  HK: "🇭🇰",
  TW: "🇹🇼",
  TH: "🇹🇭",
  ID: "🇮🇩",
  PH: "🇵🇭",
  MY: "🇲🇾",
  VN: "🇻🇳",
  ZA: "🇿🇦",
  EG: "🇪🇬",
  NG: "🇳🇬",
  AE: "🇦🇪",
  SA: "🇸🇦",
  IL: "🇮🇱",
  TR: "🇹🇷",
  GR: "🇬🇷",
  PT: "🇵🇹",
  IE: "🇮🇪",
  AT: "🇦🇹",
  CZ: "🇨🇿",
  HU: "🇭🇺",
  RO: "🇷🇴",
  BG: "🇧🇬",
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function WorldReportMap({ serviceSlug }: WorldReportMapProps) {
  const { data: stats, error } = useSWR(
    `/api/report/stats?service=${serviceSlug}`,
    fetcher,
    { refreshInterval: 30000 } // refresh every 30s
  );

  const [isPulse, setIsPulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulse((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const byCountry = stats?.byCountry || {};
  const countryEntries = Object.entries(byCountry)
    .map(([code, count]) => ({
      code,
      count: count as number,
      name: COUNTRY_NAMES[code] || code,
      flag: COUNTRY_FLAGS[code] || "🌍",
    }))
    .sort((a, b) => b.count - a.count);

  const maxCount = countryEntries.length > 0 ? countryEntries[0].count : 1;

  // Don't show if no reports
  if (!stats || countryEntries.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "24px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", margin: 0 }}>
          Report Map
        </h2>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#16a34a",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "6px",
            padding: "4px 10px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#16a34a",
              opacity: isPulse ? 1 : 0.5,
              transition: "opacity 0.5s",
            }}
          />
          LIVE
        </div>
      </div>

      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px" }}>
        Reports from the last 24 hours by country
      </p>

      {/* Country List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {countryEntries.slice(0, 10).map((country) => {
          const percentage = (country.count / maxCount) * 100;
          return (
            <div key={country.code} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ fontSize: "20px", minWidth: "24px" }}>{country.flag}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", color: "#171717", fontWeight: 500, marginBottom: "4px" }}>
                  {country.name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      flex: 1,
                      height: "6px",
                      background: "#f3f4f6",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #3b82f6, #2563eb)",
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, minWidth: "30px" }}>
                    {country.count}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {countryEntries.length > 10 && (
        <div style={{ marginTop: "12px", fontSize: "12px", color: "#9ca3af", textAlign: "center" }}>
          +{countryEntries.length - 10} more countries
        </div>
      )}

      {error && (
        <div style={{ fontSize: "12px", color: "#dc2626", marginTop: "12px", textAlign: "center" }}>
          Failed to load report map
        </div>
      )}
    </div>
  );
}
