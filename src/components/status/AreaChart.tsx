"use client";

interface AreaChartProps {
  data: (number | null)[];
  color: string;
  height?: number;
}

// Generate smooth curve using cardinal spline
function createSmoothPath(points: { x: number; y: number }[], tension = 0.3): string {
  if (points.length < 2) return '';

  const path: string[] = [`M${points[0].x},${points[0].y}`];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6 * tension;
    const cp1y = p1.y + (p2.y - p0.y) / 6 * tension;
    const cp2x = p2.x - (p3.x - p1.x) / 6 * tension;
    const cp2y = p2.y - (p3.y - p1.y) / 6 * tension;

    path.push(`C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`);
  }

  return path.join(' ');
}

export function AreaChart({ data, color, height = 80 }: AreaChartProps) {
  const validData = data.filter((d): d is number => d !== null);

  if (validData.length === 0) {
    return null;
  }

  const min = Math.min(...validData);
  const max = Math.max(...validData);
  const range = max - min || 1;

  // Convert data to points
  const points = validData.map((value, index) => ({
    x: (index / (validData.length - 1)) * 100,
    y: height - ((value - min) / range) * height,
  }));

  // Generate smooth curve path
  const smoothPath = createSmoothPath(points);

  // Create gradient ID based on color
  const gradientId = `area-gradient-${color.replace('#', '')}`;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path
        d={`${smoothPath} L100,${height} L0,${height} Z`}
        fill={`url(#${gradientId})`}
      />

      {/* Top line */}
      <path
        d={smoothPath}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
