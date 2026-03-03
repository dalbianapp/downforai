import { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { ReportForm } from "@/components/status/ReportForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Report an Issue — DownForAI",
  description:
    "Report issues with AI services. Help us monitor problems with ChatGPT, Claude, Midjourney, and other AI platforms.",
  alternates: {
    canonical: "/report",
  },
};

async function getServices() {
  const services = await prisma.service.findMany({
    select: { id: true, slug: true, name: true },
    orderBy: { name: "asc" },
  });

  return services;
}

function ReportFormWrapper({ services }: { services: Array<{id: string; slug: string; name: string}> }) {
  return <ReportForm services={services} />;
}

export default async function ReportPage() {
  const services = await getServices();

  return (
    <div style={{ maxWidth: "672px", display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h1 style={{ fontSize: "36px", fontWeight: 800, color: "#171717", marginBottom: "8px", letterSpacing: "-1px" }}>
          Report an Issue
        </h1>
        <p style={{ fontSize: "16px", color: "#737373" }}>
          Help us understand what's happening with AI services
        </p>
      </div>

      <Suspense fallback={<div>Loading form...</div>}>
        <ReportFormWrapper services={services} />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle>How does reporting work?</CardTitle>
          <CardDescription>
            Learn about community reporting
          </CardDescription>
        </CardHeader>
        <CardContent style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "14px", color: "#525252" }}>
          <div>
            <h4 style={{ fontWeight: 600, color: "#171717", marginBottom: "8px" }}>Your Privacy</h4>
            <p>
              Reports are anonymous. We only store your IP address (hashed) to prevent spam.
            </p>
          </div>

          <div>
            <h4 style={{ fontWeight: 600, color: "#171717", marginBottom: "8px" }}>Rate Limiting</h4>
            <p>
              You can submit at most 1 report per service every 15 minutes, and 5 reports total every 15 minutes.
            </p>
          </div>

          <div>
            <h4 style={{ fontWeight: 600, color: "#171717", marginBottom: "8px" }}>Impact</h4>
            <p>
              If we receive 10+ reports for a service within 30 minutes, we'll create an incident.
              When reports drop below 3, we resolve the incident.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
