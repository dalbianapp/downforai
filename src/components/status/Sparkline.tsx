"use client";

interface SparklineProps {
  data: (number | null)[];
  color: string;
  width?: number;
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

export function Sparkline({ data, color, width = 80, height = 24 }: SparklineProps) {
  if (data.length === 0) return null;

  const validData = data.map(d => d ?? 0);
  const max = Math.max(...validData, 1);
  const min = Math.min(...validData);

  const points = validData.map((value, index) => ({
    x: (index / (validData.length - 1)) * width,
    y: height - ((value - min) / (max - min || 1)) * height,
  }));

  const smoothPath = createSmoothPath(points);

  return (
    <svg width={width} height={height} className="inline-block">
      <path
        d={smoothPath}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
}
