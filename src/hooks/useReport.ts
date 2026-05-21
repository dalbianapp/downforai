"use client";

import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";

export type ReportType = "DOWN" | "SLOW" | "LOGIN" | "API_ERROR" | "OTHER";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useReport(serviceSlug: string, initialCount: number) {
  const [liveCount, setLiveCount] = useState(initialCount);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");
  const [surface, setSurface] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldownError, setCooldownError] = useState(false);

  const { data: stats } = useSWR(
    `/api/report/stats?service=${serviceSlug}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  useEffect(() => {
    if (stats?.total24h !== undefined) setLiveCount(stats.total24h);
  }, [stats]);

  const cooldownKey = `report-cooldown-${serviceSlug}`;

  const isOnCooldown = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    const end = localStorage.getItem(cooldownKey);
    return !!end && Date.now() < parseInt(end, 10);
  }, [cooldownKey]);

  const setCooldown = useCallback(() => {
    localStorage.setItem(cooldownKey, (Date.now() + 15 * 60 * 1000).toString());
  }, [cooldownKey]);

  const resetForm = useCallback(() => {
    setSelectedType(null);
    setComment("");
    setEmail("");
    setSurface("");
    setErrorMessage(null);
    setSuccess(false);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    resetForm();
  }, [resetForm]);

  // Main entry point: POST DOWN immediately, then open detail modal
  const reportNow = useCallback(async () => {
    if (isOnCooldown()) {
      setCooldownError(true);
      setTimeout(() => setCooldownError(false), 3000);
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceSlug, reportType: "DOWN" }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(
          res.status === 429
            ? "Rate limit exceeded. Please wait 15 minutes."
            : data.error || "Failed to submit report"
        );
        setSubmitting(false);
        return;
      }

      setCooldown();
      if (data.newCount !== undefined) setLiveCount(data.newCount);
      setSubmitting(false);
      resetForm();
      setShowModal(true);
    } catch {
      setErrorMessage("Network error. Please try again.");
      setSubmitting(false);
    }
  }, [isOnCooldown, setCooldown, serviceSlug, resetForm]);

  // Optional detail submission from inside the modal
  const handleAddDetails = useCallback(async () => {
    if (!selectedType && !comment && !email && !surface) {
      closeModal();
      return;
    }

    setSubmitting(true);
    try {
      await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug,
          reportType: selectedType || "DOWN",
          surfaceId: surface || undefined,
          email: email || undefined,
          comment: comment || undefined,
          isDetailUpdate: true,
        }),
      });
    } catch { /* detail update is non-critical */ }

    setSuccess(true);
    setSubmitting(false);
  }, [selectedType, comment, email, surface, serviceSlug, closeModal]);

  return {
    liveCount,
    stats,
    showModal,
    selectedType,
    comment,
    email,
    surface,
    submitting,
    success,
    errorMessage,
    cooldownError,
    reportNow,
    closeModal,
    handleAddDetails,
    setSelectedType,
    setComment,
    setEmail,
    setSurface,
  };
}
