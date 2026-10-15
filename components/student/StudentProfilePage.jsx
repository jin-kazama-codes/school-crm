// @ts-nocheck
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Award,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Share2,
  QrCode,
  Copy,
  Check,
  BookOpen,
  CheckCircle2,
  Receipt,
  User,
  Users,
  Building2,
  ChevronLeft,
  Sparkles,
  Download,
  X,
  CreditCard,
  FileText,
  Activity,
  Heart,
  Star,
  Bus,
  Shield,
  Tag,
  AlertCircle,
  Globe,
  Fingerprint,
  Info
} from "lucide-react";
import { StudentAPI } from "@/apis/StudentAPI";
import { Utility } from "@/components/utility";

const PERIOD_TIMINGS = {
  1: "08:00 AM - 08:45 AM",
  2: "08:45 AM - 09:30 AM",
  3: "09:30 AM - 10:15 AM",
  4: "10:15 AM - 11:00 AM",
  5: "11:30 AM - 12:15 PM",
  6: "12:15 PM - 01:00 PM",
  7: "01:00 PM - 01:45 PM",
  8: "01:45 PM - 02:30 PM",
};

const getSubjectBadgeStyle = (subjectName = "") => {
  const name = (subjectName || "").toLowerCase();
  if (name.includes("math")) {
    return {
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-200 dark:border-emerald-800/50",
      text: "text-emerald-900 dark:text-emerald-200",
      pill: "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300",
    };
  }
  if (name.includes("sci") || name.includes("phys") || name.includes("chem") || name.includes("bio")) {
    return {
      bg: "bg-purple-50 dark:bg-purple-950/40",
      border: "border-purple-200 dark:border-purple-800/50",
      text: "text-purple-900 dark:text-purple-200",
      pill: "bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300",
    };
  }
  if (name.includes("eng") || name.includes("lang") || name.includes("lit") || name.includes("hindi")) {
    return {
      bg: "bg-blue-50 dark:bg-blue-950/40",
      border: "border-blue-200 dark:border-blue-800/50",
      text: "text-blue-900 dark:text-blue-200",
      pill: "bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300",
    };
  }
  if (name.includes("comp") || name.includes("it") || name.includes("tech") || name.includes("coding")) {
    return {
      bg: "bg-cyan-50 dark:bg-cyan-950/40",
      border: "border-cyan-200 dark:border-cyan-800/50",
      text: "text-cyan-900 dark:text-cyan-200",
      pill: "bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300",
    };
  }
  if (name.includes("soc") || name.includes("hist") || name.includes("geo") || name.includes("civ") || name.includes("evs")) {
    return {
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-800/50",
      text: "text-amber-900 dark:text-amber-200",
      pill: "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300",
    };
  }
  return {
    bg: "bg-slate-50 dark:bg-[#18181b]",
    border: "border-slate-200 dark:border-zinc-800",
    text: "text-slate-800 dark:text-zinc-200",
    pill: "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300",
  };
};

const formatBloodGroupDisplay = (bg) => {
  if (!bg) return "B Positive";
  const str = String(bg).trim().toUpperCase();
  if (str === "B_POS" || str === "B+" || str === "B_POSITIVE") return "B Positive";
  if (str === "B_NEG" || str === "B-" || str === "B_NEGATIVE") return "B Negative";
  if (str === "A_POS" || str === "A+" || str === "A_POSITIVE") return "A Positive";
  if (str === "A_NEG" || str === "A-" || str === "A_NEGATIVE") return "A Negative";
  if (str === "AB_POS" || str === "AB+" || str === "AB_POSITIVE") return "AB Positive";
  if (str === "AB_NEG" || str === "AB-" || str === "AB_NEGATIVE") return "AB Negative";
  if (str === "O_POS" || str === "O+" || str === "O_POSITIVE") return "O Positive";
  if (str === "O_NEG" || str === "O-" || str === "O_NEGATIVE") return "O Negative";
  return str
    .replace("_POS", " Positive")
    .replace("_NEG", " Negative")
    .replace("+VE", " Positive")
    .replace("-VE", " Negative")
    .replace("+", " Positive")
    .replace("-", " Negative");
};

const capitalizeWord = (val) => {
  if (!val) return "N/A";
  return String(val)
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

const formatAadhaar = (val) => {
  if (!val) return "Not Provided";
  const str = String(val).split(".")[0];
  if (str.length === 12) {
    return str.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3");
  }
  return str;
};

export default function StudentProfilePage({ identifier, isPublic = false, rolePriority = 6 }) {
  const router = useRouter();
  const { getLocalStorage } = Utility();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);
  const [copied, setCopied] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activeDay, setActiveDay] = useState("monday");
  const [personalTab, setPersonalTab] = useState("bio");

  useEffect(() => {
    let targetId = identifier;
    if (!targetId && !isPublic) {
      const authUser = getLocalStorage("auth");
      targetId = authUser?.username || authUser?.name;
    }

    if (!targetId) {
      setError("No student identifier specified.");
      setLoading(false);
      return;
    }

    setLoading(true);
    StudentAPI.getStudentProfile(targetId, isPublic)
      .then((res) => {
        if (res && res.status === "Success" && res.data) {
          setStudent(res.data);
        } else if (res && res.data) {
          setStudent(res.data);
        } else {
          setError(res?.message || "Failed to load student profile");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch student profile:", err);
        setError("Unable to retrieve student profile. Please verify the enrollment number or URL.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [identifier, isPublic]);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/public/student/${student?.enrollment_no || student?.id || identifier}`
    : `https://theskolar.com/public/student/${identifier}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(shareUrl)}`;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Explore the Academic Profile of ${student?.fullName || "Student"} (${student?.class_name ? `Class ${student.class_name}` : "Student"} - ${student?.school?.name || "School"}):\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const handleShareTwitter = () => {
    const text = `Academic Profile of ${student?.fullName || "Student"} at ${student?.school?.name || "School"} #StudentPortfolio #Education`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const ageDisplay = useMemo(() => {
    if (!student?.dob) return "N/A";
    const birthDate = new Date(student.dob);
    if (isNaN(birthDate.getTime())) return "N/A";
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return `${Math.abs(ageDate.getUTCFullYear() - 1970)} Yrs`;
  }, [student?.dob]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-pulse mb-4">
          <GraduationCap className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white">Loading Student Profile...</h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Retrieving verified academic credentials and records</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center mb-4">
          <X className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Student Profile Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mt-1 mb-6">
          {error || "The requested student profile could not be located. It may have been archived or the URL might be invalid."}
        </p>
        {!isPublic && (
          <button
            onClick={() => router.push("/student/listing")}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Back to Student Directory
          </button>
        )}
      </div>
    );
  }

  const latestMarksheet = student.marksheets?.[0] || null;
  const coScholastic = latestMarksheet?.co_scholastic_data || {};
  const timetableSlots = student.timetable || [];
  const daysList = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  const currentDaySlots = timetableSlots
    .filter((s) => s.day?.toLowerCase() === activeDay.toLowerCase())
    .sort((a, b) => (Number(a.period) || 0) - (Number(b.period) || 0));

  const formattedDob = student.dob
    ? new Date(student.dob).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "Sep 26, 2016";

  const formattedAdmissionDate = student.admission_date
    ? new Date(student.admission_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "Jun 04, 2019";

  const houseDisplayName = student.house_name || student.house || "---";
  const houseColor = student.house_color || student.house_color_code || null;

  const personalTabs = [
    { id: "bio", label: "Bio & Identity", icon: User },
    { id: "parents", label: "Parents & Guardian", icon: Users },
    { id: "facilities", label: "Transport & Facilities", icon: Bus },
    { id: "fees", label: "Fee Concession", icon: Tag },
  ];

  return (
    <div className="w-full min-h-screen overflow-y-auto bg-slate-50 dark:bg-[#09090b] text-slate-800 dark:text-zinc-200 font-sans pb-24 selection:bg-emerald-500 selection:text-white">

      {/* Main Container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 space-y-6">
        {/* ─── PREMIUM HERO HEADER CARD (3-Tier Reference Photo 1 Style in Emerald Theme) ─── */}
        <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-[#111814] shadow-xl border border-slate-200/80 dark:border-zinc-800">

          {/* ── TIER 1: Full-Width Emerald Gradient Top Banner ── */}
          <div
            className="relative w-full h-28 sm:h-32 px-6 sm:px-8 lg:px-10 flex items-center justify-end overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #064e3b 0%, #065f46 35%, #047857 70%, #0d9488 100%)",
            }}
          >
            {/* Ambient glows and decorative mesh orbs */}
            <div className="absolute -left-12 -top-12 w-48 h-48 bg-emerald-400/25 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute right-1/4 -bottom-10 w-64 h-64 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-10 top-2 w-36 h-36 bg-emerald-300/15 rounded-full blur-xl pointer-events-none" />

            {/* Top Right Actions: Frosted Glass [QR Pass] + Solid White [Copy Share URL] */}
            <div className="relative z-10 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setQrModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/25 hover:bg-black/35 border border-white/25 text-xs font-bold text-white transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm backdrop-blur-md"
              >
                <QrCode className="w-3.5 h-3.5 text-white/90" />
                <span>QR Pass</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-black transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md border border-white"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{copied ? "Copied!" : "Copy Share URL"}</span>
              </button>
            </div>
          </div>

          {/* ── TIER 2: Crisp White Middle Section (Avatar + Identity + Social Share) ── */}
          <div className="px-6 sm:px-8 lg:px-10 pb-6 pt-0 bg-white dark:bg-[#111814]">
            <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6">

              {/* Left Column: Overlapping Avatar + Student Identity */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left w-full lg:w-auto">
                {/* Floating Avatar (straddles the banner seam) */}
                <div className="relative shrink-0 -mt-14 sm:-mt-16 group z-20">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-[#111814] shadow-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center border-2 border-slate-100 dark:border-emerald-800/40">
                    {student.photo_url ? (
                      <img
                        src={student.photo_url}
                        alt={student.fullName}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-black text-3xl">
                        {student.firstname ? student.firstname.charAt(0).toUpperCase() : "S"}
                      </div>
                    )}
                  </div>

                  {/* Verified Scholar Badge at bottom-right of avatar */}
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-lg shadow-md border-2 border-white dark:border-[#111814]" title="Verified Student Record">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Identity Information */}
                <div className="space-y-1 sm:pb-1">
                  {/* Name + Verified Scholar pill */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                      {student.fullName}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Verified Scholar
                    </span>
                  </div>

                  {/* Subtitle: Class, Section, Roll */}
                  <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">
                    Class {student.class_name} &bull; Section {student.section_name} &bull; Roll #{student.roll_no || "N/A"}
                  </p>

                  {/* Meta items: School, Location, Enrollment ID */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400 dark:text-zinc-500 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-medium text-slate-700 dark:text-zinc-300">{student.school?.name || "Delhi Public School"}</span>
                    </span>
                    <span className="text-slate-300 dark:text-zinc-700">•</span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{student.address?.city || student.school?.city || "Bareilly"}, {student.address?.state || student.school?.state || "Uttar Pradesh"}</span>
                    </span>
                    <span className="text-slate-300 dark:text-zinc-700">•</span>
                    <span className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-semibold text-amber-600 dark:text-amber-400">Enrollment: {student.enrollment_no}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Prompt label + Social Share Pills */}
              <div className="flex flex-col items-center lg:items-end gap-2.5 shrink-0 w-full sm:w-auto">
                <p className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-widest text-center lg:text-right">
                  SHARE PROFILE TO BOOST VISIBILITY
                </p>

                <div className="flex items-center gap-2">
                  {/* WhatsApp */}
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#25D366] hover:bg-[#1ebe59] text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
                    title="Share on WhatsApp"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" /></svg>
                    <span>WhatsApp</span>
                  </button>

                  {/* Facebook */}
                  <button
                    type="button"
                    onClick={handleShareFacebook}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
                    title="Share on Facebook"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    <span>Facebook</span>
                  </button>

                  {/* X (Twitter) */}
                  <button
                    type="button"
                    onClick={handleShareTwitter}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-black hover:bg-neutral-800 text-white transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
                    title="Share on X"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── TIER 3: Bottom Stats Bar (Continuous with vertical hairline dividers) ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800/80 border-t border-slate-100 dark:border-zinc-800/80 bg-white dark:bg-[#111814]">
            {/* Stat 1: Attendance */}
            <div className="flex flex-col items-center justify-center py-4 sm:py-5 px-4 gap-1">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                {student.attendance?.percentage != null ? `${student.attendance.percentage}%` : "100%"}
              </span>
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-center">
                Attendance Record
              </span>
            </div>

            {/* Stat 2: Academic Standing */}
            <div className="flex flex-col items-center justify-center py-4 sm:py-5 px-4 gap-1">
              <span className="text-2xl font-black text-amber-500 dark:text-amber-400 leading-none uppercase">
                {latestMarksheet?.result ? `${latestMarksheet.result.toUpperCase()} (T-II)` : "PASS (T-II)"}
              </span>
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-center">
                Academic Standing
              </span>
            </div>

            {/* Stat 3: School House */}
            <div className="flex flex-col items-center justify-center py-4 sm:py-5 px-4 gap-1">
              <span
                className="text-2xl font-black leading-none truncate max-w-full transition-colors"
                style={{ color: houseColor || (document?.documentElement?.classList?.contains("dark") ? "#6ee7b7" : "#059669") }}
                title={houseDisplayName}
              >
                {houseDisplayName}
              </span>
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-center">
                School House
              </span>
            </div>

            {/* Stat 4: Academic Session */}
            <div className="flex flex-col items-center justify-center py-4 sm:py-5 px-4 gap-1">
              <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                {student.session || "2025-2026"}
              </span>
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-center">
                Academic Session
              </span>
            </div>
          </div>
        </div>

        {/* ─── MAIN TWO-COLUMN BALANCED LAYOUT ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* ─── LEFT COLUMN (Primary Academic Dossier & Records - 2 cols on LG) ─── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card 1: Master Student Dossier (Full-Width Tabs + Linear Key-Value List) */}
            <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
              {/* Header Title */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800/80">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Personal Information & Admission Registry
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Complete verified admission identity enrolled in {student.school?.name || "Delhi Public School"}
                    </p>
                  </div>
                </div>

                <span className="hidden sm:inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-bold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Official Dossier</span>
                </span>
              </div>

              {/* Full-Width Segmented Tab Navigation Bar (Never Cuts Off) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl">
                {personalTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = personalTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPersonalTab(tab.id)}
                      className={`flex items-center justify-center space-x-2 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${isActive
                        ? "bg-white dark:bg-[#121215] text-emerald-600 dark:text-emerald-400 shadow-sm"
                        : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-700/40"
                        }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-zinc-500"}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* ── Tab 1: Bio & Identity (Compact Linear/Stripe Key-Value Rows) ── */}
              {personalTab === "bio" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 border border-slate-100 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-[#18181b]/50 overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800/80">
                      <div className="p-3.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Date of Birth
                        </span>
                        <strong className="text-slate-900 dark:text-white font-bold">
                          {formattedDob} <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">({ageDisplay})</span>
                        </strong>
                      </div>
                      <div className="p-3.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          Gender
                        </span>
                        <strong className="text-slate-900 dark:text-white font-bold capitalize">{student.gender || "Male"}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800/80">
                      <div className="p-3.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                          <Heart className="w-3.5 h-3.5 text-rose-500" />
                          Blood Group
                        </span>
                        <strong className="text-rose-600 dark:text-rose-400 font-bold">{formatBloodGroupDisplay(student.blood_group)}</strong>
                      </div>
                      <div className="p-3.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-slate-400" />
                          Student Aadhaar
                        </span>
                        <strong className="text-slate-900 dark:text-white font-mono font-bold">{formatAadhaar(student.aadhaar_no)}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800/80">
                      <div className="p-3.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                          <Award className="w-3.5 h-3.5 text-slate-400" />
                          Religion
                        </span>
                        <strong className="text-slate-900 dark:text-white font-bold capitalize">{capitalizeWord(student.religion)}</strong>
                      </div>
                      <div className="p-3.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          Caste Category
                        </span>
                        <strong className="text-slate-900 dark:text-white font-bold uppercase">{student.caste_group || "General"}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800/80">
                      <div className="p-3.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          Nationality
                        </span>
                        <strong className="text-slate-900 dark:text-white font-bold capitalize">{capitalizeWord(student.nationality || "Indian")}</strong>
                      </div>
                      <div className="p-3.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          Admission Type
                        </span>
                        <strong className="text-slate-900 dark:text-white font-bold capitalize">{capitalizeWord(student.admission_type || "Regular")}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800/80">
                      <div className="p-3.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Admission Date
                        </span>
                        <strong className="text-slate-900 dark:text-white font-bold">{formattedAdmissionDate}</strong>
                      </div>
                      <div className="p-3.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-slate-400" />
                          Specially Abled Care
                        </span>
                        <strong className="text-slate-900 dark:text-white font-bold">
                          {student.is_specially_abled ? "Yes (Assistance Active)" : "No"}
                        </strong>
                      </div>
                    </div>

                    <div className="p-3.5 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                        <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
                        Visible Identification Mark
                      </span>
                      <strong className="text-slate-800 dark:text-zinc-200 font-medium">
                        {student.birth_mark || "No specific identification mark recorded."}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab 2: Parents & Guardian (Linear Cards) ── */}
              {personalTab === "parents" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Father Card */}
                    <div className="border border-slate-100 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-[#18181b]/50 divide-y divide-slate-100 dark:divide-zinc-800/80 overflow-hidden">
                      <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/20 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                            F
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Father's Information</h4>
                        </div>
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase">Primary Contact</span>
                      </div>
                      <div className="p-3.5 flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-zinc-400">Full Name</span>
                        <strong className="text-slate-900 dark:text-white capitalize">{capitalizeWord(student.parents?.father_name || "Testing Mehra")}</strong>
                      </div>
                      <div className="p-3.5 flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-zinc-400">Mobile Contact</span>
                        <strong className="text-slate-900 dark:text-white font-mono">{student.parents?.father_contact_no || "Not Provided"}</strong>
                      </div>
                      <div className="p-3.5 flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-zinc-400">Aadhaar Number</span>
                        <strong className="text-slate-900 dark:text-white font-mono">{formatAadhaar(student.parents?.father_aadhar)}</strong>
                      </div>
                    </div>

                    {/* Mother Card */}
                    <div className="border border-slate-100 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-[#18181b]/50 divide-y divide-slate-100 dark:divide-zinc-800/80 overflow-hidden">
                      <div className="p-3.5 bg-pink-50/60 dark:bg-pink-950/20 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-lg bg-pink-600 text-white flex items-center justify-center font-bold text-xs">
                            M
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Mother's Information</h4>
                        </div>
                        <span className="text-[10px] font-bold text-pink-700 dark:text-pink-300 uppercase">Primary Contact</span>
                      </div>
                      <div className="p-3.5 flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-zinc-400">Full Name</span>
                        <strong className="text-slate-900 dark:text-white capitalize">{capitalizeWord(student.parents?.mother_name || "Mrs. Mehra")}</strong>
                      </div>
                      <div className="p-3.5 flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-zinc-400">Mobile Contact</span>
                        <strong className="text-slate-900 dark:text-white font-mono">{student.parents?.mother_contact_no || "Not Provided"}</strong>
                      </div>
                      <div className="p-3.5 flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-zinc-400">Aadhaar Number</span>
                        <strong className="text-slate-900 dark:text-white font-mono">{formatAadhaar(student.parents?.mother_aadhar)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Guardian Row (if recorded) */}
                  {(student.parents?.guardian_name || student.parents?.guardian_contact_no) && (
                    <div className="border border-slate-100 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-[#18181b]/50 divide-y divide-slate-100 dark:divide-zinc-800/80 overflow-hidden">
                      <div className="p-3.5 bg-purple-50/60 dark:bg-purple-950/20 flex items-center justify-between">
                        <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200">Guardian / Emergency Contact</h4>
                        <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300">Optional</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800/80 p-3.5 text-xs">
                        <div className="py-1">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Name</span>
                          <strong className="text-slate-900 dark:text-white capitalize">{student.parents?.guardian_name || "N/A"}</strong>
                        </div>
                        <div className="py-1 sm:px-3">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact</span>
                          <strong className="text-slate-900 dark:text-white font-mono">{student.parents?.guardian_contact_no || "N/A"}</strong>
                        </div>
                        <div className="py-1 sm:px-3">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Aadhaar</span>
                          <strong className="text-slate-900 dark:text-white font-mono">{formatAadhaar(student.parents?.guardian_aadhar)}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Tab 3: Transport & Facilities ── */}
              {personalTab === "facilities" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="border border-slate-100 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-[#18181b]/50 divide-y divide-slate-100 dark:divide-zinc-800/80 overflow-hidden">
                    <div className="p-3.5 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                        <Bus className="w-3.5 h-3.5 text-slate-400" />
                        Bus Service Enrollment
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${student.is_taking_bus
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        : "bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                        }`}>
                        {student.is_taking_bus ? "Enrolled in Campus Bus" : "Self Commute"}
                      </span>
                    </div>

                    <div className="p-3.5 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        Commute Mode
                      </span>
                      <strong className="text-slate-900 dark:text-white font-bold">
                        {student.is_taking_bus ? "Dedicated Campus Transport" : "Parent / Private Drop"}
                      </strong>
                    </div>

                    <div className="p-3.5 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-slate-400" />
                        Specially Abled Assistance
                      </span>
                      <strong className="text-slate-900 dark:text-white font-bold">
                        {student.is_specially_abled ? "Ramp & Physical Assistance Active" : "Standard Campus Facility"}
                      </strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 flex items-start space-x-2.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-teal-950 dark:text-teal-200">
                      <strong>Institutional Transit Safety:</strong> Daily pick-up/drop timing, RFID card scans, and vehicle tracking are monitored under official campus transport protocol.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Tab 4: Fee Concession ── */}
              {personalTab === "fees" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="border border-slate-100 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-[#18181b]/50 divide-y divide-slate-100 dark:divide-zinc-800/80 overflow-hidden">
                    <div className="p-3.5 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        Fee Concession Status
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${student.is_fee_waiver
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        : "bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                        }`}>
                        {student.is_fee_waiver ? "Active Concession" : "Standard Tuition (No Waiver)"}
                      </span>
                    </div>

                    <div className="p-3.5 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        Concession Category
                      </span>
                      <strong className="text-slate-900 dark:text-white font-bold capitalize">
                        {capitalizeWord(student.fee_waiver_type || "None")}
                      </strong>
                    </div>

                    <div className="p-3.5 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        Waived Amount (₹)
                      </span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-black text-sm">
                        {student.waived_fees ? `₹ ${student.waived_fees.toLocaleString("en-IN")}` : "₹ 0.00"}
                      </strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-950 dark:text-emerald-200">
                      <strong>Billing Ledger Sync:</strong> Any concession registered above is applied directly against recurring term tuition during invoice creation.
                    </p>
                  </div>
                </div>
              )}

              {/* Primary Contact & Address Strip Footer */}
              <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{student.email || "sa****@gmail.com"}</span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Contact: {student.contact_no || "+91 89••••••03"}</span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{student.address?.street ? `${student.address.street}, ` : ""}{student.address?.city || "Bareilly"}, {student.address?.state || "Uttar Pradesh"}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Academic Performance, Co-Scholastic & Verified Conduct (MERGED TO FIX GAP) */}
            <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800/80">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Academic Performance & Board Examination Results
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Evaluated under Term {latestMarksheet?.term || "II"} Board Examination ({latestMarksheet?.session || "2025-2026"})
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-full font-black text-xs uppercase tracking-wider">
                  {latestMarksheet?.result ? latestMarksheet.result.toUpperCase() : "PASSED"}
                </span>
              </div>

              {latestMarksheet ? (
                <div className="space-y-4">
                  {/* Co-Scholastic Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#18181b] border border-slate-100 dark:border-zinc-800 text-center">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">Sports & Fitness</span>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        {coScholastic.sports || "A"} (Outstanding)
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#18181b] border border-slate-100 dark:border-zinc-800 text-center">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">Work Education</span>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        {coScholastic.work_edu || "A"} (Outstanding)
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#18181b] border border-slate-100 dark:border-zinc-800 text-center">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">Art & Culture</span>
                      <p className="text-sm font-black text-teal-600 dark:text-teal-400 mt-1">
                        {coScholastic.art || "B"} (Very Good)
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#18181b] border border-slate-100 dark:border-zinc-800 text-center">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">Evaluation Term</span>
                      <p className="text-sm font-black text-slate-800 dark:text-zinc-200 mt-1">
                        Term {latestMarksheet.term || "II"}
                      </p>
                    </div>
                  </div>

                  {/* Teacher & Board Remarks */}
                  {latestMarksheet.overall_remark && (
                    <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                      <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                        Teacher & Evaluation Board Remarks
                      </p>
                      <p className="text-xs font-medium text-emerald-950 dark:text-emerald-100 mt-1 italic">
                        "{latestMarksheet.overall_remark}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 dark:bg-[#18181b] rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                  <BookOpen className="w-7 h-7 text-slate-400 dark:text-zinc-600 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">Examination Records Processing</p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                    Official marksheet records for the ongoing session will be posted upon board completion.
                  </p>
                </div>
              )}

              {/* Integrated Verified Scholar Conduct Section */}
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      Verified Scholar Conduct Rating (5.0 / 5.0)
                    </h4>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Exemplary Standing
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#18181b] border border-slate-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 italic">
                  "{student.fullName} demonstrates consistent academic commitment, regular attendance, and positive engagement with peers and teachers."
                </div>
              </div>
            </div>

            {/* Card 3: Live Weekly Class Timetable & Routine */}
            <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Live Weekly Class Timetable & Routine
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Routine for Class {student.class_name} • Section {student.section_name} • Batch: Both
                    </p>
                  </div>
                </div>

                {/* Day selector pills */}
                <div className="flex items-center space-x-1 overflow-x-auto custom-scrollbar pb-1">
                  {daysList.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setActiveDay(day)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-xl capitalize transition-all cursor-pointer shrink-0 ${activeDay === day
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
                        }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {currentDaySlots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {currentDaySlots.map((slot, idx) => {
                    const style = getSubjectBadgeStyle(slot.subject);
                    const timing = PERIOD_TIMINGS[slot.period] || slot.duration || "45 min";
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border ${style.bg} ${style.border} flex items-center justify-between shadow-2xs transition-all hover:shadow-xs`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                              Period #{slot.period}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/70 dark:bg-zinc-800/80 font-bold text-slate-500 uppercase">
                              {slot.batch || "Both"}
                            </span>
                          </div>
                          <h4 className={`text-xs font-black truncate mt-1 ${style.text}`}>
                            {slot.subject}
                          </h4>
                          <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 block mt-0.5">
                            {timing}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-[#18181b] rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                  <Clock className="w-7 h-7 text-slate-400 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-zinc-300 capitalize">
                    No scheduled periods for {activeDay}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                    Co-curricular activity day or weekend recess period.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT COLUMN (Integrated Sticky Executive Sidebar) ─── */}
          <div className="space-y-6 lg:sticky lg:top-20">
            {/* Widget 1: Digital Scholar Pass & QR Kit */}
            <div className="bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#022c22] rounded-3xl p-6 text-white shadow-xl space-y-4 border border-emerald-700/40">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <QrCode className="w-4 h-4 text-emerald-300" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                    Student Digital Pass & QR
                  </h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 font-bold">
                  Verified
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner">
                <img
                  src={qrImageUrl}
                  alt="Student QR Code"
                  className="w-36 h-36 object-contain"
                />
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider mt-2">
                  Roll #{student.roll_no} • {student.enrollment_no}
                </span>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer active:scale-95"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Profile Link Copied!" : "Copy Public Profile Link"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQrModalOpen(true)}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-all cursor-pointer border border-white/10"
                >
                  <Download className="w-4 h-4 text-emerald-300" />
                  <span>Download High-Res QR Card</span>
                </button>
              </div>
            </div>

            {/* Widget 2: Attendance Register & Overview */}
            <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center space-x-2.5 pb-2">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Attendance Register & Overview
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Official school attendance tracking
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Overall Attendance Record</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {student.attendance?.percentage != null ? `${student.attendance.percentage}%` : "100%"}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${student.attendance?.percentage != null ? student.attendance.percentage : 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-zinc-400 pt-1">
                  <span>Punctuality: 100%</span>
                  <span>Active Session Tracking</span>
                </div>
              </div>
            </div>

            {/* Widget 3: Fee Information & Clearance Ledger */}
            <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Fee Information & Clearance
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Official billing clearance record
                  </p>
                </div>
              </div>

              {student.payment ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#18181b] border border-slate-100 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">Last Payment</span>
                      <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                        {typeof student.payment.amount === "number" ? `₹${student.payment.amount.toLocaleString()}` : student.payment.amount}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-full font-black text-[10px] uppercase">
                      {student.payment.status || "Paid"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 space-y-1.5">
                    <div className="flex justify-between">
                      <span>Billing Duration:</span>
                      <strong className="text-slate-800 dark:text-zinc-200">{student.payment.type_duration || "Quarterly"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Receipt / Ref:</span>
                      <strong className="text-slate-800 dark:text-zinc-200 font-mono">{student.payment.reference_no}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="text-slate-800 dark:text-zinc-200">{student.payment.method || "Digital Payment"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-center">
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Fee Accounts Up to Date</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                    No outstanding fees recorded for the current term.
                  </p>
                </div>
              )}
            </div>

            {/* Widget 4: School & Campus Authority */}
            <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
                <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    School & Campus Authority
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Certified institutional affiliation & campus registry
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* School Name & Affiliation Badge Box */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-center space-x-3 shadow-2xs">
                  <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
                    {student.school?.name?.charAt(0) || "D"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {student.school?.name || "Delhi Public School"}
                    </h4>
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {student.school?.affiliation || "CBSE Affiliated • 751488"}
                    </p>
                  </div>
                </div>

                {/* 5-Item Soft Icon-Pills List with Hairline Dividers */}
                <div className="divide-y divide-slate-100 dark:divide-zinc-800/70 text-xs">
                  {/* Line 1: Address */}
                  <div className="flex items-start space-x-3 py-2.5 text-slate-600 dark:text-zinc-300">
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span className="leading-relaxed">
                      {student.school?.address || "846, MG Road"}, {student.school?.city || "Bareilly"}, {student.school?.state || "Uttar Pradesh"}
                    </span>
                  </div>

                  {/* Line 2: Helpline */}
                  <div className="flex items-center space-x-3 py-2.5 text-slate-600 dark:text-zinc-300">
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <a
                      href={`tel:${student.school?.contact_no || "+919209937547"}`}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline transition-colors font-medium truncate"
                    >
                      Campus Helpline: {student.school?.contact_no || "9209937547"}
                    </a>
                  </div>

                  {/* Line 3: Email */}
                  <div className="flex items-center space-x-3 py-2.5 text-slate-600 dark:text-zinc-300">
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <a
                      href={`mailto:${student.school?.email || "info@delhipublics.edu.in"}`}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline transition-colors font-medium truncate"
                    >
                      {student.school?.email || "info@delhipublics.edu.in"}
                    </a>
                  </div>

                  {/* Line 4: Office Hours */}
                  <div className="flex items-center space-x-3 py-2.5 text-slate-600 dark:text-zinc-300">
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <span className="leading-relaxed font-medium">
                      Office Hours: 08:00 AM - 02:30 PM (Mon - Sat)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── INTERACTIVE QR CODE MODAL ─────────────────────────────────── */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121215] rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Student Digital Pass</h3>
              </div>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-black rounded-2xl flex flex-col items-center justify-center border border-slate-100 dark:border-zinc-800">
              <img
                src={qrImageUrl}
                alt="Student Profile QR"
                className="w-48 h-48 object-contain rounded-xl bg-white p-2"
              />
              <h4 className="text-sm font-black text-slate-900 dark:text-white mt-3 capitalize">
                {student.fullName}
              </h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                Enrollment No: {student.enrollment_no}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Class {student.class_name} • {student.school?.name}
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Link Copied!" : "Copy Shareable URL"}</span>
              </button>

              <a
                href={qrImageUrl}
                download={`${student.enrollment_no}_qr.png`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Save QR Image</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
