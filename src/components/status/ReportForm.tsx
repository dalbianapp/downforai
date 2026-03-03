"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

interface ReportFormProps {
  services: Array<{ id: string; slug: string; name: string }>;
}

const reportTypes = [
  { value: "DOWN", label: "Service is down" },
  { value: "SLOW", label: "Slow performance" },
  { value: "LOGIN", label: "Login issues" },
  { value: "API_ERROR", label: "API errors" },
  { value: "OTHER", label: "Other issue" },
];

export function ReportForm({ services }: ReportFormProps) {
  const searchParams = useSearchParams();
  const defaultService = searchParams.get("service") || "";

  const [service, setService] = useState(defaultService);
  const [reportType, setReportType] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!service || !reportType) {
      setStatus("error");
      setMessage("Please fill in all fields");
      return;
    }

    setLoading(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug: service,
          reportType,
        }),
      });

      if (response.status === 429) {
        setStatus("error");
        setMessage(
          "Too many reports. Please wait a few minutes before reporting again."
        );
      } else if (response.ok) {
        setStatus("success");
        setMessage("Thank you! Your report has been submitted.");
        setService("");
        setReportType("");
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setMessage("Failed to submit report. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report an Issue</CardTitle>
        <CardDescription>
          Help us understand what's happening with your service
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Service
            </label>
            <Select
              value={service}
              onChange={(e) => setService(e.target.value)}
              disabled={loading}
            >
              <option value="">Select a service...</option>
              {services.map((s) => (
                <option key={s.id} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Issue Type
            </label>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              disabled={loading}
            >
              <option value="">Select an issue type...</option>
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </div>

          {status === "success" && (
            <div className="rounded-lg bg-green-50 border border-green-300 p-3 text-sm text-green-800">
              {message}
            </div>
          )}

          {status === "error" && (
            <div className="rounded-lg bg-red-50 border border-red-300 p-3 text-sm text-red-800">
              {message}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !service || !reportType}
          >
            {loading ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
