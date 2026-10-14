/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  X, Printer, Pencil, Copy, Check, Castle, Shield, Award,
  Users, UserCheck, GraduationCap, School, Phone, Mail,
  Calendar, CheckCircle2, ChevronRight, Sparkles, Hash, BookOpen
} from 'lucide-react';
import { Utility } from '../utility';
import { useNavigate } from '@/lib/routerAdapter';

const SchoolHouseDossierModal = ({
  open,
  setOpen,
  detail = null,
  allClasses = [],
  allSections = [],
  rolePriority = 2,
}) => {
  const [copiedField, setCopiedField] = useState(null);

  const navigateTo = useNavigate();
  const { findById, appendSuffix, capitalizeEveryWord, formatDate, getLocalStorage } = Utility();

  const allSchools = useSelector((state) => state.allSchools);
  const schoolInfo = getLocalStorage('schoolInfo') || {};
  const authInfo = getLocalStorage('auth') || {};

  const handleClose = () => {
    setOpen(false);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    if (open) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const house = detail || {};
  const colorCode = house?.color_code || '#6366f1';
  const isActive = (house?.status || 'active').toLowerCase() === 'active';

  // Resolved Active School
  const activeSchool = allSchools?.listData?.find(
    (s) => s.id === house?.school_id || s.id === schoolInfo?.id
  ) || schoolInfo || allSchools?.listData?.[0];

  const schoolName = activeSchool?.name || activeSchool?.school_name || schoolInfo?.name || schoolInfo?.school_name || authInfo?.school || 'Delhi Public School';
  const schoolAddress = activeSchool?.address || schoolInfo?.address || '';
  const schoolCode = activeSchool?.code || activeSchool?.school_code || schoolInfo?.code || schoolInfo?.school_code || '';

  // Helper to format Class and Section
  const formatClassSection = (classId, sectionId) => {
    if (!classId && !sectionId) return '—';
    let cName = '';
    let sName = '';

    if (classId) {
      const foundC = findById(classId, allClasses);
      const rawC = foundC?.name || foundC?.class_name || String(classId);
      cName = !isNaN(Number(rawC)) ? appendSuffix(rawC) : rawC;
      if (!cName.toLowerCase().startsWith('class') && !cName.toLowerCase().startsWith('grade')) {
        cName = `Class ${cName}`;
      }
    }

    if (sectionId) {
      const foundS = findById(sectionId, allSections);
      const rawS = foundS?.name || foundS?.section_name || String(sectionId);
      sName = rawS.toLowerCase().startsWith('sec') ? rawS : `Sec ${rawS}`;
    }

    return [cName, sName].filter(Boolean).join(' • ') || '—';
  };

  // Leadership details
  const captain = house?.captain_details || {};
  const captainName = house?.captainName || house?.captain_name || (captain?.firstname ? `${captain.firstname} ${captain.lastname || ''}`.trim() : null);
  const captainClassSec = formatClassSection(captain?.class, captain?.section);

  const viceCaptain = house?.vice_captain_details || {};
  const viceCaptainName = house?.viceCaptainName || house?.viceCaptainNname || house?.vice_captain_name || (viceCaptain?.firstname ? `${viceCaptain.firstname} ${viceCaptain.lastname || ''}`.trim() : null);
  const viceCaptainClassSec = formatClassSection(viceCaptain?.class, viceCaptain?.section);

  const teacher = house?.teacher_details || {};
  const teacherName = house?.teacherName || house?.teacher_name || house?.teacher_incharge_name || (teacher?.firstname ? `${teacher.firstname} ${teacher.lastname || ''}`.trim() : null);

  const studentMembers = house?.student_members || [];
  const totalEnrolled = house?.actual_strength || studentMembers.length || 0;
  const configuredCapacity = house?.strength || 0;

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
    if (house?.id) {
      setOpen(false);
      navigateTo(`/school-house/update/${house.id}`, {
        state: { id: house.id }
      });
    }
  };

  if (!open) return null;

  return (
    <>
      {/* ── GLOBAL PRINT CSS RULES FOR SCHOOL HOUSE DOSSIER ───────────── */}
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
          /* Hide all app wrapper elements and show ONLY the house dossier print root */
          body > * {
            visibility: hidden !important;
          }
          #school-house-dossier-print-root,
          #school-house-dossier-print-root * {
            visibility: visible !important;
          }
          #school-house-dossier-print-root {
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
          table, tr, td, th {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* ── ON-SCREEN MODAL VIEW (HIDDEN ON PRINT) ──────────────────────── */}
      <div className="print:hidden fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 lg:p-7 animate-in fade-in duration-200">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
          aria-hidden="true"
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-5xl max-h-[92vh] bg-white dark:bg-[#0e0e0e] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-[#222] animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100 z-10">

          {/* ── Top Official House Letterhead Banner ─────────────────────── */}
          <div 
            className="relative text-white p-5 sm:p-6 overflow-hidden shrink-0 border-b border-black/10"
            style={{
              background: `linear-gradient(135deg, ${colorCode}ee 0%, #1e1b4b 60%, #0f172a 100%)`
            }}
          >
            {/* Subtle decorative elements */}
            <div className="absolute -right-12 -bottom-12 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute left-1/4 top-0 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* House Branding */}
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg shadow-black/20 shrink-0"
                  style={{ boxShadow: `0 8px 24px -4px ${colorCode}66` }}
                >
                  <Castle className="w-8 h-8 sm:w-9 sm:h-9 text-white drop-shadow" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-white/20 text-white border border-white/30 backdrop-blur-xs">
                      Official House Dossier
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      isActive 
                        ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40' 
                        : 'bg-rose-500/30 text-rose-200 border border-rose-400/40'
                    }`}>
                      {isActive ? 'Active House' : 'Inactive'}
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white mt-1 capitalize flex items-center gap-2.5">
                    {house?.name || 'School House'}
                    <span 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm inline-block shrink-0"
                      style={{ backgroundColor: colorCode }}
                      title={`House Color: ${colorCode}`}
                    />
                  </h1>

                  <p className="text-xs text-slate-200 flex items-center gap-2 flex-wrap mt-0.5">
                    <span>{schoolName}</span>
                    <span className="w-1 h-1 rounded-full bg-white/60" />
                    <span>House Code: <strong className="text-white font-mono">#{house?.id || '—'}</strong></span>
                    <span className="w-1 h-1 rounded-full bg-white/60" />
                    <span>Color: <strong className="text-white font-mono uppercase">{colorCode}</strong></span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold backdrop-blur-md transition-all border border-white/20 cursor-pointer shadow-sm active:scale-95"
                  title="Print Official House Dossier"
                >
                  <Printer className="w-4 h-4 text-white" />
                  <span className="hidden sm:inline">Print Record</span>
                </button>

                {rolePriority > 1 && (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer active:scale-95"
                    title="Edit House Information"
                  >
                    <Pencil className="w-4 h-4 text-slate-900" />
                    <span className="hidden sm:inline">Edit House</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 hover:bg-white/20 text-white/80 hover:text-white rounded-xl transition-colors cursor-pointer border border-white/15"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Modal Scrollable Body ───────────────────────────────────── */}
          <div className="overflow-y-auto p-5 sm:p-6 lg:p-8 space-y-6 flex-1 bg-slate-50/50 dark:bg-[#0e0e0e]">

            {/* ── 1. KPI Metric Summary Cards ────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 bg-white dark:bg-[#141414] rounded-2xl border border-slate-200/80 dark:border-[#222] shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <span>House Strength</span>
                  <Users className="w-3.5 h-3.5 text-indigo-500 opacity-70" />
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  {configuredCapacity > 0 ? configuredCapacity : (totalEnrolled > 0 ? totalEnrolled : '—')}
                </div>
                <div className="text-[11px] font-semibold text-slate-500">
                  {totalEnrolled > 0 ? `${totalEnrolled} active members` : 'Capacity limit'}
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-[#141414] rounded-2xl border border-slate-200/80 dark:border-[#222] shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <span>House Color</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 opacity-70" />
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase font-mono">
                  <span 
                    className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0" 
                    style={{ backgroundColor: colorCode }}
                  />
                  {colorCode}
                </div>
                <div className="text-[11px] font-semibold text-slate-500">
                  Official livery theme
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-[#141414] rounded-2xl border border-slate-200/80 dark:border-[#222] shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <span>House Master</span>
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-500 opacity-70" />
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white capitalize truncate" title={teacherName || 'Not Assigned'}>
                  {teacherName || 'Not Assigned'}
                </div>
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {teacher?.email || 'Teacher Incharge'}
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-[#141414] rounded-2xl border border-slate-200/80 dark:border-[#222] shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <span>House Status</span>
                  <Shield className="w-3.5 h-3.5 text-blue-500 opacity-70" />
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {capitalizeEveryWord(house?.status) || 'Active'}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-500">
                  Institutional register
                </div>
              </div>
            </div>

            {/* ── 2. Faculty Incharge & Student Leadership Grid ─────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* Teacher Incharge Card */}
              <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-slate-200/80 dark:border-[#222] shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#202020]">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Teacher Incharge
                      </h3>
                      <p className="text-[10px] text-slate-400">House Master / Mentor</p>
                    </div>
                  </div>
                  {teacherName && (
                    <button
                      type="button"
                      onClick={() => handleCopy(teacherName, 'teacherName')}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#202020] rounded-lg transition-colors cursor-pointer"
                      title="Copy Name"
                    >
                      {copiedField === 'teacherName' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {teacherName ? (
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white capitalize">
                        {teacherName}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Teacher ID</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                          {house?.teacher_incharge ? `#${house.teacher_incharge}` : '—'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Qualification</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                          {teacher?.qualification || 'Faculty Member'}
                        </p>
                      </div>
                    </div>

                    {teacher?.email && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{teacher.email}</span>
                      </div>
                    )}

                    {teacher?.contact_no && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{teacher.contact_no}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs italic">
                    No teacher incharge assigned to this house.
                  </div>
                )}
              </div>

              {/* House Captain Card */}
              <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-slate-200/80 dark:border-[#222] shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#202020]">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        House Captain
                      </h3>
                      <p className="text-[10px] text-slate-400">Head Student Leader</p>
                    </div>
                  </div>
                  {captainName && (
                    <button
                      type="button"
                      onClick={() => handleCopy(captainName, 'captainName')}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#202020] rounded-lg transition-colors cursor-pointer"
                      title="Copy Name"
                    >
                      {copiedField === 'captainName' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {captainName ? (
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Candidate Name</span>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white capitalize">
                        {captainName}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Class & Section</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                          {captainClassSec}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Enrollment No</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                          {captain?.enrollment_no ? `Enroll: ${captain.enrollment_no}` : (captain?.roll_no ? `Roll: ${captain.roll_no}` : (house?.captain ? `#${house.captain}` : '—'))}
                        </p>
                      </div>
                    </div>

                    {captain?.contact_no && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{captain.contact_no}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs italic">
                    No house captain appointed.
                  </div>
                )}
              </div>

              {/* Vice Captain Card */}
              <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-slate-200/80 dark:border-[#222] shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#202020]">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Vice Captain
                      </h3>
                      <p className="text-[10px] text-slate-400">Deputy Student Leader</p>
                    </div>
                  </div>
                  {viceCaptainName && (
                    <button
                      type="button"
                      onClick={() => handleCopy(viceCaptainName, 'viceCaptainName')}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#202020] rounded-lg transition-colors cursor-pointer"
                      title="Copy Name"
                    >
                      {copiedField === 'viceCaptainName' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {viceCaptainName ? (
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Candidate Name</span>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white capitalize">
                        {viceCaptainName}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Class & Section</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                          {viceCaptainClassSec}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Enrollment No</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                          {viceCaptain?.enrollment_no ? `Enroll: ${viceCaptain.enrollment_no}` : (viceCaptain?.roll_no ? `Roll: ${viceCaptain.roll_no}` : (house?.vice_captain ? `#${house.vice_captain}` : '—'))}
                        </p>
                      </div>
                    </div>

                    {viceCaptain?.contact_no && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{viceCaptain.contact_no}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs italic">
                    No vice captain appointed.
                  </div>
                )}
              </div>

            </div>

            {/* ── 3. House Guidelines & Inter-House Competitions Notice ─────── */}
            <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-slate-200/80 dark:border-[#222] shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#202020]">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  House Code & Institutional Standards
                </h3>
                <span className="text-[10px] font-semibold text-slate-400 font-mono">
                  {house?.created_at ? `Established: ${formatDate(house.created_at)}` : 'Active Session Standard'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#181818] border border-slate-100 dark:border-[#242424] space-y-1">
                  <strong className="text-slate-900 dark:text-white block text-xs font-bold">1. Inter-House Competitions</strong>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    House members actively represent this house in sports, debate, science fairs, and cultural events.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#181818] border border-slate-100 dark:border-[#242424] space-y-1">
                  <strong className="text-slate-900 dark:text-white block text-xs font-bold">2. Leadership & Discipline</strong>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    Captain and Vice Captain assist faculty in morning assembly, student discipline, and house drills.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#181818] border border-slate-100 dark:border-[#242424] space-y-1">
                  <strong className="text-slate-900 dark:text-white block text-xs font-bold">3. House Points & Trophy</strong>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    Scholastic excellence and co-curricular awards directly tally towards the Annual Champion House Trophy.
                  </p>
                </div>
              </div>
            </div>

            {/* ── 4. Allocated Student Members Preview (if available) ───────── */}
            {studentMembers.length > 0 && (
              <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-slate-200/80 dark:border-[#222] shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#202020]">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    House Student Cadre ({studentMembers.length} Members)
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-400">Verified Roster</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[10px] font-bold uppercase text-slate-400 bg-slate-50 dark:bg-[#181818]">
                      <tr>
                        <th className="p-2 rounded-l-lg">#</th>
                        <th className="p-2">Student Name</th>
                        <th className="p-2">Enrollment No</th>
                        <th className="p-2">Class & Section</th>
                        <th className="p-2 rounded-r-lg">Gender</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#202020]">
                      {studentMembers.slice(0, 10).map((s, idx) => (
                        <tr key={s.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-[#181818]/50">
                          <td className="p-2 font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-2 font-bold text-slate-900 dark:text-white capitalize">
                            {s.firstname} {s.lastname || ''}
                          </td>
                          <td className="p-2 font-mono text-slate-600 dark:text-slate-400">
                            {s.enrollment_no ? s.enrollment_no : (s.roll_no ? `Roll ${s.roll_no}` : '—')}
                          </td>
                          <td className="p-2 text-slate-600 dark:text-slate-400">{formatClassSection(s.class, s.section)}</td>
                          <td className="p-2 capitalize text-slate-500">{s.gender || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {studentMembers.length > 10 && (
                    <p className="text-[10px] text-center text-slate-400 pt-2 italic">
                      Showing first 10 of {studentMembers.length} registered house members.
                    </p>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* ── Modal Footer Bar ────────────────────────────────────────── */}
          <div className="p-4 sm:p-5 bg-white dark:bg-[#101010] border-t border-slate-200/80 dark:border-[#222] flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-mono">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Verified School House Register • {schoolName}</span>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-[#202020] dark:hover:bg-[#282828] text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Close Dossier
            </button>
          </div>

        </div>
      </div>

      {/* ── DEDICATED FULL PRINTABLE A4 HOUSE DOSSIER (VISIBLE ONLY ON PRINT) ── */}
      <div id="school-house-dossier-print-root" className="hidden print:block w-full text-slate-900 bg-white font-sans text-xs">
        <div className="border-2 border-slate-900 rounded-xl p-6 bg-white space-y-4">
          
          {/* Print 1: Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4 print-avoid-break">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-xl border border-slate-400 flex items-center justify-center bg-slate-100 shrink-0">
                <Castle className="w-8 h-8 text-slate-800" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 block">
                  Official House Register & Leadership Dossier
                </span>
                <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase leading-none mt-0.5">
                  {schoolName}
                </h1>
                <p className="text-[10px] text-slate-600 mt-1 font-medium">
                  {schoolAddress || 'Affiliated to CBSE / State Education Board'} • 
                  Printed on: <span className="font-mono">{new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded border border-slate-900 text-slate-900 font-black text-xs uppercase tracking-wider">
                {house?.name || 'School House'}
              </span>
              <p className="text-[9px] text-slate-500 mt-1 font-mono uppercase">
                Color: {colorCode}
              </p>
            </div>
          </div>

          {/* Print 2: House Identity & Details Grid */}
          <div className="grid grid-cols-4 gap-3 py-3 border-b border-slate-300 print-avoid-break">
            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">House Name</span>
              <p className="font-extrabold text-slate-950 text-sm capitalize">
                {house?.name || '—'}
              </p>
            </div>

            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">House Theme</span>
              <p className="font-bold text-slate-950 uppercase font-mono">
                {colorCode}
              </p>
            </div>

            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Strength / Cadre</span>
              <p className="font-bold text-slate-950">
                {configuredCapacity > 0 ? `${configuredCapacity} Students` : (totalEnrolled > 0 ? `${totalEnrolled} Students` : '—')}
              </p>
            </div>

            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Registration Status</span>
              <span className="inline-block px-2 py-0.5 rounded font-black text-[10px] uppercase tracking-wider bg-slate-100 border border-slate-300">
                {capitalizeEveryWord(house?.status) || 'ACTIVE'}
              </span>
            </div>
          </div>

          {/* Print 3: Leadership Command Structure */}
          <div className="space-y-2 print-avoid-break">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-800" />
              House Leadership & Faculty Incharge
            </h4>

            <div className="grid grid-cols-3 gap-3">
              {/* Teacher Incharge */}
              <div className="p-3 rounded-lg border border-slate-300 bg-slate-50/60 space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Teacher Incharge (House Master)</span>
                <p className="font-black text-slate-900 text-xs capitalize">{teacherName || 'Not Assigned'}</p>
                <p className="text-[10px] text-slate-600">{teacher?.qualification || 'Faculty Member'}</p>
                {teacher?.contact_no && <p className="text-[10px] text-slate-600">Tel: {teacher.contact_no}</p>}
                {teacher?.email && <p className="text-[10px] text-slate-600 truncate">{teacher.email}</p>}
              </div>

              {/* Captain */}
              <div className="p-3 rounded-lg border border-slate-300 bg-slate-50/60 space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">House Captain (Student Head)</span>
                <p className="font-black text-slate-900 text-xs capitalize">{captainName || 'Not Appointed'}</p>
                <p className="text-[10px] text-slate-600">{captainClassSec}</p>
                {captain?.enrollment_no ? (
                  <p className="text-[10px] text-slate-600 font-mono">Enroll: {captain.enrollment_no}</p>
                ) : (
                  captain?.roll_no && <p className="text-[10px] text-slate-600 font-mono">Roll No: {captain.roll_no}</p>
                )}
                {captain?.contact_no && <p className="text-[10px] text-slate-600">Tel: {captain.contact_no}</p>}
              </div>

              {/* Vice Captain */}
              <div className="p-3 rounded-lg border border-slate-300 bg-slate-50/60 space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Vice Captain (Student Deputy)</span>
                <p className="font-black text-slate-900 text-xs capitalize">{viceCaptainName || 'Not Appointed'}</p>
                <p className="text-[10px] text-slate-600">{viceCaptainClassSec}</p>
                {viceCaptain?.enrollment_no ? (
                  <p className="text-[10px] text-slate-600 font-mono">Enroll: {viceCaptain.enrollment_no}</p>
                ) : (
                  viceCaptain?.roll_no && <p className="text-[10px] text-slate-600 font-mono">Roll No: {viceCaptain.roll_no}</p>
                )}
                {viceCaptain?.contact_no && <p className="text-[10px] text-slate-600">Tel: {viceCaptain.contact_no}</p>}
              </div>
            </div>
          </div>

          {/* Print 4: House Rules & Operational Directives */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-300 text-xs space-y-1 print-avoid-break">
            <span className="uppercase text-[9px] tracking-wider text-slate-950 font-black block">Institutional House Directives:</span>
            <p className="text-slate-700 italic font-medium leading-relaxed text-[11px]">
              The House Captain and Vice Captain, under the guidance of the Teacher Incharge, are authorized to conduct house assemblies, lead representation in athletic & academic events, and maintain high standards of institutional discipline.
            </p>
          </div>

          {/* Print 5: Official Signatures & Verification Seal */}
          <div className="grid grid-cols-3 gap-6 pt-6 mt-4 border-t-2 border-slate-900 text-center text-xs print-avoid-break">
            <div className="space-y-1">
              <div className="h-6 border-b border-dashed border-slate-400"></div>
              <span className="font-bold text-slate-900 block uppercase tracking-wider text-[10px]">House Captain</span>
              <span className="text-[9px] text-slate-500">Signature</span>
            </div>

            <div className="space-y-1">
              <div className="h-6 border-b border-dashed border-slate-400"></div>
              <span className="font-bold text-slate-900 block uppercase tracking-wider text-[10px]">Teacher Incharge</span>
              <span className="text-[9px] text-slate-500">Signature</span>
            </div>

            <div className="space-y-1">
              <div className="h-6 border-b border-dashed border-slate-400 flex items-center justify-center">
                <span className="text-[8px] font-bold text-slate-900 uppercase tracking-widest">[ OFFICIAL SEAL ]</span>
              </div>
              <span className="font-extrabold text-slate-950 block uppercase tracking-wider text-[10px]">Principal / Administrator</span>
              <span className="text-[9px] text-slate-600">Issued by {schoolName}</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

SchoolHouseDossierModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  detail: PropTypes.object,
  allClasses: PropTypes.array,
  allSections: PropTypes.array,
  rolePriority: PropTypes.number,
};

export default SchoolHouseDossierModal;
