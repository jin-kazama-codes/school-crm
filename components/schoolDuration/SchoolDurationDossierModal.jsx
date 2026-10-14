/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  X,
  Printer,
  Pencil,
  Copy,
  Check,
  School,
  Clock,
  Layers,
  Users,
  Building,
  Timer,
  Coffee,
  CheckCircle2,
  Calendar,
  Sparkles,
  Sun,
  Moon,
  AlertCircle,
  Shield,
  Award,
  Hash
} from 'lucide-react';
import { Utility } from '../utility';
import { useNavigate } from '@/lib/routerAdapter';
import dayjs from 'dayjs';

const formatTime = (time) => {
  if (!time) return '—';
  const d = dayjs(time);
  return d.isValid() ? d.format('hh:mm A') : '—';
};

const SchoolDurationDossierModal = ({
  open,
  isOpen,
  setOpen,
  onClose,
  detail = null,
  record = null,
  rolePriority = 2,
}) => {
  const isModalOpen = open !== undefined ? open : isOpen;
  const closeModal = () => {
    if (setOpen) setOpen(false);
    if (onClose) onClose();
  };

  const [copiedField, setCopiedField] = useState(null);

  const navigateTo = useNavigate();
  const { capitalizeEveryWord, getLocalStorage } = Utility();

  const allSchools = useSelector((state) => state.allSchools);
  const schoolInfo = getLocalStorage('schoolInfo') || {};
  const authInfo = getLocalStorage('auth') || {};

  const activeRecord = detail || record || {};

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    if (isModalOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  if (!isModalOpen || !activeRecord) return null;

  const {
    id,
    school_id,
    batch = 'both',
    period = 8,
    halves = 2,
    recess_time = 30,
    first_half_period_duration = 45,
    second_half_period_duration = 45,
    cutoff_time = 15,
    opening_time,
    closing_time,
    shifts = 'morning',
    eve_opening_time,
    eve_closing_time,
    employee_entry_time,
    employee_exit_time,
  } = activeRecord;

  // Resolved Active School
  const activeSchool =
    allSchools?.listData?.find(
      (s) => s.id === school_id || s.id === schoolInfo?.id
    ) ||
    schoolInfo ||
    allSchools?.listData?.[0];

  const schoolName =
    activeSchool?.name ||
    activeSchool?.school_name ||
    schoolInfo?.name ||
    schoolInfo?.school_name ||
    authInfo?.school ||
    'Delhi Public School';
  const schoolCode =
    activeSchool?.code ||
    activeSchool?.school_code ||
    schoolInfo?.code ||
    schoolInfo?.school_code ||
    '';

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    if (id) {
      closeModal();
      navigateTo(`/school-duration/update/${id}`, {
        state: { id },
      });
    }
  };

  const getBatchBadge = (b) => {
    const batchStr = (b || 'both').toLowerCase();
    if (batchStr === 'junior') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 capitalize shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400"></span>
          Junior Batch
        </span>
      );
    }
    if (batchStr === 'senior') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 capitalize shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
          Senior Batch
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-950 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 capitalize shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
        All Batches (Junior & Senior)
      </span>
    );
  };

  const getShiftBadge = (s) => {
    const shiftStr = (s || 'morning').toLowerCase();
    if (shiftStr === 'evening') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-950 border border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800 capitalize shadow-2xs">
          <Moon className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
          Evening Shift
        </span>
      );
    }
    if (shiftStr === 'both') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-950 border border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800 capitalize shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
          Dual Shift (Morning & Evening)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 capitalize shadow-2xs">
        <Sun className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
        Morning Shift
      </span>
    );
  };

  return (
    <>
      {/* GLOBAL PRINT STYLES FOR SCHOOL DURATION DOSSIER */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 12mm 12mm;
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body > * {
            visibility: hidden !important;
          }
          #school-duration-dossier-print-root,
          #school-duration-dossier-print-root * {
            visibility: visible !important;
          }
          #school-duration-dossier-print-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
            background: #ffffff !important;
            color: #0f172a !important;
          }
          .print-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* SCREEN MODAL VIEW (HIDDEN ON PRINT) */}
      <div className="print:hidden fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 lg:p-7 animate-in fade-in duration-200">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
          onClick={closeModal}
          aria-hidden="true"
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-5xl max-h-[92vh] bg-white dark:bg-[#0c0c0c] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-[#222] animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100 z-10">

          {/* TOP OFFICIAL SCHOOL LETTERHEAD BANNER (Identical to Student Dossier) */}
          <div className="relative bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-5 sm:p-6 overflow-hidden shrink-0">
            {/* Subtle Background Elements */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute left-1/3 top-0 w-32 h-32 bg-teal-400/10 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* School Branding */}
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg shadow-black/20 shrink-0">
                  <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                      Official Academic Timetable Master
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white mt-1">
                    {schoolName}
                  </h1>
                  <p className="text-xs text-slate-300 flex items-center gap-2">
                    <span>Batch: <strong className="text-white capitalize">{batch || 'Both'}</strong></span>
                    {schoolCode && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-emerald-400" />
                        <span>Code: <strong className="text-white font-mono">{schoolCode}</strong></span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Quick Action Header Controls */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-md transition-all border border-white/15 cursor-pointer shadow-sm active:scale-95"
                  title="Print Official School Schedule"
                >
                  <Printer className="w-4 h-4 text-emerald-300" />
                  <span className="hidden sm:inline">Print Schedule</span>
                </button>

                {rolePriority > 1 && (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/30 cursor-pointer active:scale-95"
                    title="Edit Schedule Timings"
                  >
                    <Pencil className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={closeModal}
                  className="p-2 hover:bg-white/20 text-white/80 hover:text-white rounded-xl transition-colors cursor-pointer border border-white/10"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* HERO DOSSIER CARD (Batch Badges & Quick Highlights) */}
          <div className="p-5 sm:p-6 bg-slate-50 dark:bg-[#111] border-b border-slate-200 dark:border-[#1e1e1e]">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">

              {/* Left: Schedule Primary Overview */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full lg:w-auto">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 shadow-sm shrink-0">
                  <Building className="w-8 h-8" />
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      {batch?.toLowerCase() === 'both' ? 'All Batches (Full School)' : `${capitalizeEveryWord(batch)} Batch`} Schedule
                    </h2>
                    {getBatchBadge(batch)}
                    {getShiftBadge(shifts)}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 flex items-center justify-center sm:justify-start gap-2 font-medium">
                    <span>Morning Bell: <strong className="text-slate-900 dark:text-slate-200 font-bold">{formatTime(opening_time)} – {formatTime(closing_time)}</strong></span>
                    <span className="w-1 h-1 rounded-full bg-slate-400" />
                    <span>Staff Hours: <strong className="text-slate-900 dark:text-slate-200 font-bold">{formatTime(employee_entry_time)} – {formatTime(employee_exit_time)}</strong></span>
                  </p>
                </div>
              </div>

              {/* Right: Quick Stats Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                <div className="p-3 bg-white dark:bg-[#161616] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-2xs text-center min-w-[100px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                    Periods/Day
                  </span>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {period || 0}
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-[#161616] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-2xs text-center min-w-[100px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                    Halves
                  </span>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {halves || 2}
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-[#161616] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-2xs text-center min-w-[100px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                    Recess Break
                  </span>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {recess_time || 0}m
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-[#161616] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-2xs text-center min-w-[100px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                    Grace Cutoff
                  </span>
                  <div className="text-lg font-black text-blue-600 dark:text-blue-400">
                    {cutoff_time || 0}m
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* SCROLLABLE DOSSIER BODY */}
          <div className="p-5 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-[#0c0c0c]">

            {/* Section 1: Academic Period Structure & Lecture Durations */}
            <div className="bg-slate-50/70 dark:bg-[#141414] border border-slate-200/80 dark:border-[#222] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-[#222]">
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Period Structure & Duration Breakdown
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Daily class slot allocations, recess duration, and lecture minutes
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoCard
                  label="1st Half Period Duration"
                  value={`${first_half_period_duration || '—'} Minutes`}
                  subValue="Morning Lecture Slots"
                  icon={Timer}
                  highlight="emerald"
                />

                <InfoCard
                  label="Recess / Lunch Interval"
                  value={`${recess_time || '—'} Minutes`}
                  subValue="Mid-day Meal Break"
                  icon={Coffee}
                  highlight="emerald"
                />

                <InfoCard
                  label="2nd Half Period Duration"
                  value={`${second_half_period_duration || '—'} Minutes`}
                  subValue="Post-recess Lecture Slots"
                  icon={Timer}
                  highlight="indigo"
                />

                <InfoCard
                  label="Attendance Grace Cutoff"
                  value={`${cutoff_time || 0} Minutes`}
                  subValue="Late Entry Threshold"
                  icon={Clock}
                  highlight="slate"
                />
              </div>
            </div>

            {/* Section 2: Shift Operating Hours & Gate Bells */}
            <div className="bg-slate-50/70 dark:bg-[#141414] border border-slate-200/80 dark:border-[#222] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-[#222]">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    School Shift Operating Hours & Gate Bells
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Primary morning and optional evening shift timings
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Morning Shift */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#181818] border border-amber-200/80 dark:border-amber-900/40 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-100 dark:border-amber-900/30">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-600" />
                      Morning Shift
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                      Standard Session
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-0.5">
                        Morning Opening Bell
                      </span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {formatTime(opening_time)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-0.5">
                        Morning Closing Bell
                      </span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {formatTime(closing_time)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Evening Shift */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#181818] border border-purple-200/80 dark:border-purple-900/40 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-purple-100 dark:border-purple-900/30">
                    <span className="text-xs font-bold text-purple-800 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Moon className="w-4 h-4 text-purple-600" />
                      Evening Shift
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">
                      {shifts === 'evening' || shifts === 'both' ? 'Active' : 'Optional'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-0.5">
                        Evening Opening Bell
                      </span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {formatTime(eve_opening_time)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-0.5">
                        Evening Closing Bell
                      </span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {formatTime(eve_closing_time)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Staff Timings & Biometric Punch Window */}
            <div className="bg-slate-50/70 dark:bg-[#141414] border border-slate-200/80 dark:border-[#222] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-[#222]">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Staff & Teacher Biometric Schedule
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Mandatory check-in and check-out parameters for faculty & administrative employees
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#181818] border border-slate-200/80 dark:border-[#262626] shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-xs border border-emerald-200 dark:border-emerald-800">
                      IN
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        Employee Entry Time
                      </span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {formatTime(employee_entry_time)}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Punch-in
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#181818] border border-slate-200/80 dark:border-[#262626] shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center font-black text-xs border border-rose-200 dark:border-rose-800">
                      OUT
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        Employee Exit Time
                      </span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {formatTime(employee_exit_time)}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
                    Punch-out
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* OFFICIAL FOOTER BAR (Same as Student Dossier) */}
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-[#222] bg-slate-50/90 dark:bg-[#111] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Official Timetable & Bell Schedule Record</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">ID: <strong className="font-mono text-slate-700 dark:text-slate-300">#{id || '—'}</strong></span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1c1c1c] border border-slate-300 dark:border-[#333] hover:bg-slate-100 dark:hover:bg-[#252525] rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                Close
              </button>

              {rolePriority > 1 && (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Schedule
                </button>
              )}
            </div>
          </div>

          {/* CONFIDENTIAL BRANDING FOOTER NOTE */}
          <div className="border-t border-slate-200/60 dark:border-[#1a1a1a] bg-white dark:bg-[#0c0c0c] py-1.5 text-center text-[9px] text-slate-400 dark:text-slate-600 font-mono tracking-wider">
            CONFIDENTIAL & PROPRIETARY • AUTHENTICATED SCHOOL MANAGEMENT INFORMATION SYSTEM RECORD • ISSUED BY {schoolName || 'SCHOOL CRM'}
          </div>

        </div>
      </div>

      {/* PRINTABLE DOSSIER (Rendered only on window.print()) */}
      <div id="school-duration-dossier-print-root" className="hidden">
        <div className="p-8 max-w-4xl mx-auto space-y-6 bg-white text-slate-900 font-sans">

          {/* Printable Letterhead Header */}
          <div className="border-b-2 border-emerald-800 pb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800">
                Official Academic Timetable Master
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5">
                {schoolName}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Schedule ID: #{id} • Batch: {capitalizeEveryWord(batch || 'Both')} • Shift: {capitalizeEveryWord(shifts || 'Morning')}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-700 block">Date of Issue:</span>
              <span className="text-xs font-mono text-slate-900">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Quick Metrics Table */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Periods</span>
              <span className="text-lg font-black text-slate-900">{period || 0} Periods</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Halves Count</span>
              <span className="text-lg font-black text-slate-900">{halves || 2} Halves</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Recess Break</span>
              <span className="text-lg font-black text-emerald-700">{recess_time || 0} Minutes</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Grace Cutoff</span>
              <span className="text-lg font-black text-blue-700">{cutoff_time || 0} Minutes</span>
            </div>
          </div>

          {/* Period Durations Breakdown */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
              Period Durations & Breakdown
            </h3>
            <div className="grid grid-cols-3 gap-4 pt-2 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">1st Half Period Duration:</span>
                <span className="font-bold text-slate-900">{first_half_period_duration || '—'} Minutes</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Recess / Lunch Interval:</span>
                <span className="font-bold text-slate-900">{recess_time || '—'} Minutes</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">2nd Half Period Duration:</span>
                <span className="font-bold text-slate-900">{second_half_period_duration || '—'} Minutes</span>
              </div>
            </div>
          </div>

          {/* Shift Operating Hours */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
              Shift Operating Hours & Gate Bells
            </h3>
            <div className="grid grid-cols-2 gap-6 pt-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-amber-800 block mb-1">Morning Shift:</span>
                <div className="flex justify-between">
                  <span>Opening Bell: <strong>{formatTime(opening_time)}</strong></span>
                  <span>Closing Bell: <strong>{formatTime(closing_time)}</strong></span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-purple-800 block mb-1">Evening Shift:</span>
                <div className="flex justify-between">
                  <span>Eve Opening: <strong>{formatTime(eve_opening_time)}</strong></span>
                  <span>Eve Closing: <strong>{formatTime(eve_closing_time)}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Timings */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
              Staff & Biometric Schedule
            </h3>
            <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Employee Entry Time:</span>
                <span className="font-bold text-slate-900">{formatTime(employee_entry_time)}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Employee Exit Time:</span>
                <span className="font-bold text-slate-900">{formatTime(employee_exit_time)}</span>
              </div>
            </div>
          </div>

          {/* Printable Footer */}
          <div className="border-t border-slate-300 pt-3 text-center text-[9px] text-slate-500 font-mono">
            CONFIDENTIAL & PROPRIETARY • AUTHENTICATED SCHOOL MANAGEMENT INFORMATION SYSTEM RECORD • ISSUED BY {schoolName || 'SCHOOL CRM'}
          </div>

        </div>
      </div>
    </>
  );
};

// Helper Card Subcomponent
const InfoCard = ({ label, value, subValue, icon: Icon, highlight = 'slate' }) => {
  const highlightStyles = {
    slate: 'border-slate-200/80 dark:border-[#222]',
    emerald: 'border-emerald-300/80 dark:border-emerald-800/50 bg-emerald-50/40 dark:bg-emerald-950/10',
    indigo: 'border-indigo-300/80 dark:border-indigo-800/50 bg-indigo-50/40 dark:bg-indigo-950/10',
    rose: 'border-rose-300/80 dark:border-rose-800/50 bg-rose-50/40 dark:bg-rose-950/10',
  };

  return (
    <div
      className={`p-4 bg-white dark:bg-[#161616] rounded-2xl border ${highlightStyles[highlight] || highlightStyles.slate
        } shadow-2xs space-y-1`}
    >
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        {Icon && <Icon className="w-3.5 h-3.5 opacity-80" />}
      </div>
      <div className="text-sm font-extrabold text-slate-900 dark:text-white capitalize">
        {value || '—'}
      </div>
      {subValue && (
        <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          {subValue}
        </div>
      )}
    </div>
  );
};

SchoolDurationDossierModal.propTypes = {
  open: PropTypes.bool,
  isOpen: PropTypes.bool,
  setOpen: PropTypes.func,
  onClose: PropTypes.func,
  detail: PropTypes.object,
  record: PropTypes.object,
  rolePriority: PropTypes.number,
};

export default SchoolDurationDossierModal;
