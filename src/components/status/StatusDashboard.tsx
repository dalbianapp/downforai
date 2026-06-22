"use client";

import { useState, useMemo } from "react";
import { ServiceStatus, BadgeType } from "@prisma/client";
import { ServiceCard } from "./ServiceCard";
import { formatCategoryLabel } from "@/lib/utils";
import { type PerformanceLevel } from "@/lib/performance";

interface ServiceData {
  slug: string;
  name: string;
  description: string | null;
  category: string;
  status: ServiceStatus;
  badgeType: BadgeType;
  latencyMs?: number | null;
  sparklineData: number[];
  performanceLevel: PerformanceLevel;
}

interface StatusDashboardProps {
  services: ServiceData[];
}

const CATEGORIES = ["LLM", "IMAGE", "VIDEO", "AUDIO", "DEV", "INFRA", "SEARCH", "PRODUCTIVITY", "AGENTS", "THREE_D", "DESIGN", "MLOPS", "VECTOR_DB", "ROLEPLAY", "MARKETING", "SUPPORT", "EDUCATION", "HR_AI", "LEGAL_AI", "SPORTS_BETTING"];

export function StatusDashboard({ services }: StatusDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || s.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, selectedCategory]);

  const sorted = [...filtered].sort((a, b) => {
    const statusOrder: Record<string, number> = { OUTAGE: 0, DEGRADED: 1, UNKNOWN: 2, OPERATIONAL: 3 };
    return (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
  });

  // Grouper par catégorie pour l'affichage
  const grouped = useMemo(() => {
    if (selectedCategory || searchQuery) {
      // Si filtre actif, pas de groupement
      return null;
    }
    const groups: Record<string, typeof sorted> = {};
    for (const s of sorted) {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    }
    return groups;
  }, [sorted, selectedCategory, searchQuery]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
          All Services
        </h2>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            fontSize: '13px',
            color: '#0F172A',
            backgroundColor: '#ffffff',
            outline: 'none',
            width: '200px',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => setSelectedCategory(null)}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            backgroundColor: selectedCategory === null ? '#171717' : 'transparent',
            color: selectedCategory === null ? '#ffffff' : '#a3a3a3',
            transition: 'all 0.15s',
          }}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              backgroundColor: selectedCategory === cat ? '#171717' : 'transparent',
              color: selectedCategory === cat ? '#ffffff' : '#a3a3a3',
              transition: 'all 0.15s',
            }}
          >
            {formatCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Grille de services */}
      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#a3a3a3' }}>
          No services found
        </div>
      ) : grouped && !selectedCategory && !searchQuery ? (
        /* Affichage par catégorie */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {CATEGORIES.map((cat) => {
            const catServices = grouped[cat];
            if (!catServices || catServices.length === 0) return null;
            return (
              <div key={cat}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#64748B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {formatCategoryLabel(cat)}
                  <span className="mono" style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8', background: '#F1F5F9', padding: '1px 7px', borderRadius: '5px' }}>
                    {catServices.length}
                  </span>
                  {(() => {
                    const officialCount = catServices.filter(s => s.badgeType === 'STATUS_PAGE_SYNC').length;
                    return officialCount > 0 ? (
                      <span style={{ fontSize: '11px', fontWeight: 500, color: '#4F46E5', background: 'rgba(79,70,229,0.07)', border: '1px solid rgba(79,70,229,0.15)', padding: '1px 7px', borderRadius: '5px' }}>
                        {officialCount} official
                      </span>
                    ) : null;
                  })()}
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '8px',
                  }}
                >
                  {catServices.map((service) => (
                    <ServiceCard
                      key={service.slug}
                      slug={service.slug}
                      name={service.name}
                      category={service.category}
                      status={service.status}
                      sparklineData={service.sparklineData}
                      latencyMs={service.latencyMs}
                      performanceLevel={service.performanceLevel}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Affichage flat (avec filtre ou recherche) */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '8px',
          }}
        >
          {sorted.map((service) => (
            <ServiceCard
              key={service.slug}
              slug={service.slug}
              name={service.name}
              category={service.category}
              status={service.status}
              sparklineData={service.sparklineData}
              latencyMs={service.latencyMs}
              performanceLevel={service.performanceLevel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
