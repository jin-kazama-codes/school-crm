import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  X, Printer, Edit, Copy, Check, School, User, Calendar, MapPin,
  Phone, Mail, Shield, BookOpen, Bus, Heart, Users, Award,
  FileText, Sparkles, AlertCircle, CheckCircle2, ChevronRight, ExternalLink
} from 'lucide-react';
import { Utility } from '../utility';
import { useNavigate } from '@/lib/routerAdapter';

const StudentDossierModal = ({
  open,
  setOpen,
  detail,
  countryData = [],
  stateData = [],
  cityData = [],
  allClasses = [],
  allSections = [],
  allSubjects = [],
  allHouses = [],
  classData = [],
  rolePriority = 2,
}) => {
  const [activeTab, setActiveTab] = useState('register');
  const [copiedField, setCopiedField] = useState(null);
  const [activePhoto, setActivePhoto] = useState('student'); // 'student' | 'parent'

  const navigateTo = useNavigate();
  const { findById, formatBloodGroup, appendSuffix, capitalizeEveryWord, getLocalStorage } = Utility();

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

  // Reset tab on open
  useEffect(() => {
    if (open) {
      setActiveTab('register');
      setActivePhoto('student');
    }
  }, [open]);

  const student = detail?.studentData || {};
  const address = detail?.addressData || {};
  const studentImages = detail?.imageData || [];
  const parentImages = detail?.parentImageData || [];

  const studentImgSrc = studentImages[0]?.image_src || null;
  const parentImgSrc = parentImages[0]?.image_src || null;

  const authUser = getLocalStorage('auth') || {};
  const schoolName = authUser?.school || authUser?.school_name || '';
  const schoolCode = authUser?.school_code || '';

  // Resolved Location Names
  const countryName = findById(address?.country, countryData)?.name || address?.country || 'India';
  const stateName = findById(address?.state, stateData)?.name || address?.state || '';
  const cityName = findById(address?.city, cityData)?.name || address?.city || '';

  // Formatted Full Address
  const fullAddress = useMemo(() => {
    const parts = [
      address?.street,
      address?.landmark ? `Near ${address.landmark}` : null,
      cityName,
      stateName,
      countryName,
      address?.zipcode ? `PIN: ${address.zipcode}` : null
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Address not provided';
  }, [address, cityName, stateName, countryName]);

  // Resolved Class & Section
  const resolvedClass = useMemo(() => {
    if (!student?.class) return 'N/A';
    const found = allClasses.find((c) => (c.class_id ?? c.id) == student.class);
    const rawName = found?.class_name ?? found?.name ?? String(student.class);
    return !isNaN(Number(rawName)) && rawName !== ''
      ? `Class ${appendSuffix(rawName)}`
      : rawName.toLowerCase().startsWith('class')
        ? capitalizeEveryWord(rawName)
        : `Class ${capitalizeEveryWord(rawName)}`;
  }, [student?.class, allClasses]);

  const resolvedSection = useMemo(() => {
    if (!student?.section) return '';
    const found = allSections.find((s) => (s.section_id ?? s.id) == student.section);
    const rawName = found?.section_name ?? found?.name ?? String(student.section);
    return rawName ? (rawName.toLowerCase().startsWith('sec') ? capitalizeEveryWord(rawName) : `Section ${capitalizeEveryWord(rawName)}`) : `Section ${student.section}`;
  }, [student?.section, allSections]);

  // Resolved School House
  const resolvedHouse = useMemo(() => {
    if (student?.house_name) return capitalizeEveryWord(student.house_name);
    if (!student?.house) return 'Not Assigned';
    const found = allHouses.find((h) => String(h.id) === String(student.house) || h.name?.toLowerCase() === String(student.house).toLowerCase());
    if (found?.name) return capitalizeEveryWord(found.name);
    return !isNaN(Number(student.house)) ? `House ${student.house}` : capitalizeEveryWord(String(student.house));
  }, [student?.house, student?.house_name, allHouses]);

  // Resolved Subjects List
  const resolvedSubjectList = useMemo(() => {
    // 1. If backend already returned resolved_subjects
    if (Array.isArray(student?.resolved_subjects) && student.resolved_subjects.length > 0) {
      return student.resolved_subjects.map((s) => ({
        id: s.id,
        name: capitalizeEveryWord(s.name || s.subject_name)
      }));
    }

    // 2. Extract ID list from student.subjects (array or comma-separated string)
    let idList = [];
    if (Array.isArray(student?.subjects)) {
      idList = student.subjects.map((s) => typeof s === 'object' ? (s.id ?? s.subject_id) : parseInt(String(s), 10)).filter((n) => !isNaN(n));
    } else if (typeof student?.subjects === 'string' && student.subjects.trim()) {
      const parts = student.subjects.split(',').map((p) => p.trim());
      const areNumbers = parts.every((p) => !isNaN(parseInt(p, 10)));
      if (areNumbers) {
        idList = parts.map((p) => parseInt(p, 10));
      } else {
        return parts.map((name, idx) => ({ id: `sub-${idx}`, name: capitalizeEveryWord(name) }));
      }
    }

    // 3. If idList is empty, look up in classData (school_class_data) for class & section
    if (idList.length === 0 && student?.class && classData?.length) {
      const match = classData.find((cd) => (cd.class_id ?? cd.id) == student.class && (!student.section || (cd.section_id ?? cd.id) == student.section));
      if (match?.subject_ids) {
        idList = String(match.subject_ids).split(',').map((p) => parseInt(p.trim(), 10)).filter((n) => !isNaN(n));
      }
    }

    // 4. Map IDs to human-readable names from allSubjects
    if (idList.length > 0 && allSubjects?.length) {
      return idList.map((subId) => {
        const found = allSubjects.find((s) => (s.id ?? s.subject_id) == subId);
        return {
          id: subId,
          name: capitalizeEveryWord(found?.name || found?.subject_name || `Subject ${subId}`)
        };
      });
    }

    if (idList.length > 0) {
      return idList.map((subId) => ({ id: subId, name: `Subject ${subId}` }));
    }

    return [];
  }, [student?.resolved_subjects, student?.subjects, student?.class, student?.section, classData, allSubjects]);

  // Formatted Dates & Age Calculation
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const calculateAge = (dobStr) => {
    if (!dobStr) return null;
    const dob = new Date(dobStr);
    if (isNaN(dob.getTime())) return null;
    const now = new Date();
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < dob.getDate())) {
      years--;
      months += 12;
    }
    return `${years} Years${months > 0 ? ` ${months} Months` : ''}`;
  };

  const ageText = calculateAge(student?.dob);

  // Copy helper
  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    if (student?.id) {
      setOpen(false);
      navigateTo(`/student/update/${student.id}`, { state: { id: student.id } });
    }
  };

  if (!open) return null;

  return (
    <>
      {/* GLOBAL PRINT STYLES FOR DOSSIER */}
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
          /* Hide all app wrapper elements and show only printable dossier */
          body > * {
            visibility: hidden !important;
          }
          #student-dossier-print-root,
          #student-dossier-print-root * {
            visibility: visible !important;
          }
          #student-dossier-print-root {
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
          onClick={handleClose}
          aria-hidden="true"
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-5xl max-h-[92vh] bg-white dark:bg-[#0c0c0c] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-[#222] animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100">

          {/* TOP OFFICIAL SCHOOL LETTERHEAD BANNER */}
          <div className="relative bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-5 sm:p-6 overflow-hidden shrink-0">
            {/* Subtle Background Elements */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute left-1/3 top-0 w-32 h-32 bg-teal-400/10 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* School Branding */}
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg shadow-black/20 shrink-0">
                  <School className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                      Official Student Register
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white mt-1">
                    {schoolName}
                  </h1>
                  <p className="text-xs text-slate-300 flex items-center gap-2">
                    <span>Academic Session: <strong className="text-white font-mono">{student?.session || '2025-2026'}</strong></span>
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    <span>Student ID: <strong className="text-white font-mono">#{student?.id || '—'}</strong></span>
                  </p>
                </div>
              </div>

              {/* Quick Action Header Controls */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-md transition-all border border-white/15 cursor-pointer shadow-sm active:scale-95"
                  title="Print Official Student Dossier"
                >
                  <Printer className="w-4 h-4 text-emerald-300" />
                  <span className="hidden sm:inline">Print Record</span>
                </button>

                {rolePriority > 1 && (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/30 cursor-pointer active:scale-95"
                    title="Edit Student Information"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 hover:bg-white/20 text-white/80 hover:text-white rounded-xl transition-colors cursor-pointer border border-white/10"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* HERO DOSSIER CARD (Student + Parent Dual Portrait & Quick Specs) */}
          <div className="p-5 sm:p-6 bg-slate-50 dark:bg-[#111] border-b border-slate-200 dark:border-[#1e1e1e]">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">

              {/* Left: Dual Photos & Primary Name */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 w-full lg:w-auto">
                {/* Photo Frame with Toggle if Parent Photo exists */}
                <div className="relative group shrink-0">
                  <div className="w-28 h-34 sm:w-32 sm:h-38 rounded-2xl overflow-hidden shadow-xl border-4 border-white dark:border-[#222] bg-gradient-to-br from-emerald-100 to-slate-200 dark:from-emerald-950/40 dark:to-slate-800 flex items-center justify-center relative">
                    {activePhoto === 'student' ? (
                      studentImgSrc ? (
                        <img
                          src={studentImgSrc}
                          alt={`${student?.firstname} photo`}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-2 text-center">
                          <User className="w-10 h-10 text-emerald-600/50 dark:text-emerald-400/50 mb-1" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">No Student Photo</span>
                        </div>
                      )
                    ) : (
                      parentImgSrc ? (
                        <img
                          src={parentImgSrc}
                          alt="Parent photo"
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-2 text-center">
                          <Users className="w-10 h-10 text-purple-600/50 dark:text-purple-400/50 mb-1" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">No Parent Photo</span>
                        </div>
                      )
                    )}

                    {/* Ribbon Badge */}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-md">
                      {activePhoto === 'student' ? 'Student' : 'Parent'}
                    </span>
                  </div>

                  {/* Photo Switcher Pill */}
                  {parentImgSrc && (
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <button
                        type="button"
                        onClick={() => setActivePhoto('student')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${activePhoto === 'student'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-[#222] text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                      >
                        Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePhoto('parent')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${activePhoto === 'parent'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-[#222] text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                      >
                        Parent
                      </button>
                    </div>
                  )}
                </div>

                {/* Title & Key Tags */}
                <div className="text-center sm:text-left space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {resolvedClass} {resolvedSection && `• ${resolvedSection}`}
                    </span>

                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${student?.status === 'active' || !student?.status
                      ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                      : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}>
                      {capitalizeEveryWord(student?.status || 'Active')}
                    </span>

                    {student?.blood_group && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                        Blood: {formatBloodGroup(student.blood_group)}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white capitalize">
                    {student?.firstname} {student?.lastname || ''}
                  </h2>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {student?.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {student.email}
                      </span>
                    )}
                    {student?.contact_no && (
                      <span className="inline-flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {String(student.contact_no).split('.')[0]}
                      </span>
                    )}
                    {student?.gender && (
                      <span className="inline-flex items-center gap-1 capitalize font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {student.gender}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Official Enrollment Badge Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
                {/* Enrollment Number */}
                <div
                  onClick={() => handleCopy(student?.enrollment_no, 'enrollment')}
                  className="p-3 bg-white dark:bg-[#161616] rounded-xl border border-slate-200/90 dark:border-[#262626] shadow-2xs hover:border-emerald-500/50 transition-all cursor-pointer group"
                  title="Click to copy Enrollment No"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <span>Enrollment No</span>
                    {copiedField === 'enrollment' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </div>
                  <div className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                    {student?.enrollment_no ? `#${student.enrollment_no}` : 'Pending'}
                  </div>
                </div>

                {/* Roll Number */}
                <div
                  onClick={() => handleCopy(student?.roll_no, 'roll')}
                  className="p-3 bg-white dark:bg-[#161616] rounded-xl border border-slate-200/90 dark:border-[#262626] shadow-2xs hover:border-emerald-500/50 transition-all cursor-pointer group"
                  title="Click to copy Roll No"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <span>Roll Number</span>
                    {copiedField === 'roll' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </div>
                  <div className="text-sm font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1 truncate">
                    {student?.roll_no ? `#${String(student.roll_no).padStart(2, '0')}` : '—'}
                  </div>
                </div>

                {/* Admission Date */}
                <div className="p-3 bg-white dark:bg-[#161616] rounded-xl border border-slate-200/90 dark:border-[#262626] shadow-2xs col-span-2 sm:col-span-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Admitted On
                  </div>
                  <div className="text-sm font-black font-mono text-slate-800 dark:text-slate-200 mt-1 truncate">
                    {formatDate(student?.admission_date)}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* TAB NAVIGATION HEADER */}
          <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-[#1e1e1e] bg-white dark:bg-[#0c0c0c] overflow-x-auto custom-scrollbar shrink-0">
            {[
              { id: 'register', label: 'Identity & Register', icon: FileText },
              { id: 'academics', label: 'Academics & House', icon: BookOpen },
              { id: 'parents', label: 'Parents & Guardians', icon: Users },
              { id: 'address', label: 'Address & Contact', icon: MapPin },
              { id: 'fees', label: 'Fees & Concessions', icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${isActive
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT BODY */}
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">

            {/* 1. IDENTITY & REGISTER TAB */}
            {activeTab === 'register' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoCard label="Full Legal Name" value={`${student?.firstname || ''} ${student?.lastname || ''}`.trim() || 'N/A'} icon={User} />
                  <InfoCard
                    label="Date of Birth (DOB)"
                    value={formatDate(student?.dob)}
                    subValue={ageText ? `Age: ${ageText}` : null}
                    icon={Calendar}
                  />
                  <InfoCard label="Gender" value={capitalizeEveryWord(student?.gender || 'N/A')} icon={User} />
                  <InfoCard label="Blood Group" value={formatBloodGroup(student?.blood_group)} icon={Heart} highlight="rose" />
                  <InfoCard
                    label="Student Aadhaar No"
                    value={student?.aadhaar_no ? String(student.aadhaar_no).replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : 'Not Provided'}
                    icon={Shield}
                  />
                  <InfoCard label="Nationality" value={capitalizeEveryWord(student?.nationality || 'Indian')} icon={School} />
                  <InfoCard label="Religion" value={capitalizeEveryWord(student?.religion || 'N/A')} icon={Award} />
                  <InfoCard label="Caste Group" value={String(student?.caste_group || 'General').toUpperCase()} icon={Users} />
                  <InfoCard label="Admission Type" value={capitalizeEveryWord(student?.admission_type || 'Regular')} icon={BookOpen} />

                  <div className="md:col-span-2 lg:col-span-2 p-4 bg-slate-50/80 dark:bg-[#141414] rounded-2xl border border-slate-200/80 dark:border-[#222]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Visible Identification Mark
                    </span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                      {student?.birth_mark || 'No specific identification mark recorded in register.'}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50/80 dark:bg-[#141414] rounded-2xl border border-slate-200/80 dark:border-[#222] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Specially Abled
                      </span>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                        {student?.is_specially_abled ? 'Yes (Assistance Required)' : 'No'}
                      </p>
                    </div>
                    <span className={`w-3 h-3 rounded-full ${student?.is_specially_abled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                  </div>
                </div>
              </div>
            )}

            {/* 2. ACADEMICS & HOUSE TAB */}
            {activeTab === 'academics' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InfoCard label="Assigned Class" value={resolvedClass} icon={BookOpen} highlight="emerald" />
                  <InfoCard label="Assigned Section" value={resolvedSection || 'General'} icon={BookOpen} highlight="indigo" />
                  <InfoCard label="Academic Session" value={student?.session || '2025-2026'} icon={Calendar} />
                  <InfoCard label="School House" value={resolvedHouse} icon={Award} />
                  <InfoCard label="Bus / Transport Service" value={student?.is_taking_bus ? (student?.bus ? `Bus #${student.bus}` : 'Opted for School Bus') : 'Self Transport (No Bus)'} icon={Bus} />
                  <InfoCard label="Student Role / Head Status" value={student?.head ? 'School Head Representative' : 'Standard Student'} icon={Shield} />
                </div>

                <div className="p-5 bg-slate-50/80 dark:bg-[#141414] rounded-2xl border border-slate-200/80 dark:border-[#222] space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-500" />
                      Enrolled Subjects & Curriculum
                    </h3>
                  </div>

                  {resolvedSubjectList.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {resolvedSubjectList.map((sub, idx) => (
                        <span
                          key={`sub-${sub.id || idx}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-[#1c1c1c] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#2a2a2a] shadow-2xs"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No subjects currently assigned for this class curriculum.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 3. PARENTS & GUARDIANS TAB */}
            {activeTab === 'parents' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Father Card */}
                  <div className="p-5 bg-slate-50/90 dark:bg-[#141414] rounded-2xl border border-slate-200/90 dark:border-[#222] space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-[#222]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                          F
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
                          Father's Information
                        </h4>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40">
                        Primary
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Full Name</span>
                        <strong className="text-slate-900 dark:text-white text-sm font-bold capitalize">
                          {capitalizeEveryWord(student?.father_name || 'Not Provided')}
                        </strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block mb-0.5">Contact Number</span>
                        <strong className="text-slate-900 dark:text-white font-mono text-sm font-bold flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-blue-500" />
                          {student?.father_contact_no ? String(student.father_contact_no).split('.')[0] : 'N/A'}
                        </strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block mb-0.5">Aadhaar Number</span>
                        <strong className="text-slate-900 dark:text-white font-mono text-sm">
                          {student?.father_aadhar ? String(student.father_aadhar).split('.')[0] : 'N/A'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Mother Card */}
                  <div className="p-5 bg-slate-50/90 dark:bg-[#141414] rounded-2xl border border-slate-200/90 dark:border-[#222] space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-[#222]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-xs">
                          M
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
                          Mother's Information
                        </h4>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 border border-pink-200/60 dark:border-pink-800/40">
                        Primary
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Full Name</span>
                        <strong className="text-slate-900 dark:text-white text-sm font-bold capitalize">
                          {capitalizeEveryWord(student?.mother_name || 'Not Provided')}
                        </strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block mb-0.5">Contact Number</span>
                        <strong className="text-slate-900 dark:text-white font-mono text-sm font-bold flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-pink-500" />
                          {student?.mother_contact_no ? String(student.mother_contact_no).split('.')[0] : 'N/A'}
                        </strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block mb-0.5">Aadhaar Number</span>
                        <strong className="text-slate-900 dark:text-white font-mono text-sm">
                          {student?.mother_aadhar ? String(student.mother_aadhar).split('.')[0] : 'N/A'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Guardian Card (if provided) */}
                  {(student?.guardian_name || student?.guardian_contact_no) && (
                    <div className="p-5 bg-slate-50/90 dark:bg-[#141414] rounded-2xl border border-slate-200/90 dark:border-[#222] space-y-4 shadow-2xs md:col-span-2">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-[#222]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                            G
                          </div>
                          <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
                            Guardian's Information
                          </h4>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40">
                          Optional Contact
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block mb-0.5">Guardian Name</span>
                          <strong className="text-slate-900 dark:text-white text-sm font-bold capitalize">
                            {capitalizeEveryWord(student?.guardian_name || 'N/A')}
                          </strong>
                        </div>

                        <div>
                          <span className="text-slate-400 block mb-0.5">Contact Number</span>
                          <strong className="text-slate-900 dark:text-white font-mono text-sm font-bold">
                            {student?.guardian_contact_no ? String(student.guardian_contact_no).split('.')[0] : 'N/A'}
                          </strong>
                        </div>

                        <div>
                          <span className="text-slate-400 block mb-0.5">Aadhaar Number</span>
                          <strong className="text-slate-900 dark:text-white font-mono text-sm">
                            {student?.guardian_aadhar ? String(student.guardian_aadhar).split('.')[0] : 'N/A'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. ADDRESS & CONTACT TAB */}
            {activeTab === 'address' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="p-5 bg-slate-50/90 dark:bg-[#141414] rounded-2xl border border-slate-200/90 dark:border-[#222] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-[#222]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      Residential & Permanent Postal Address
                    </h4>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      View on Map <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-slate-200/80 dark:border-[#262626]">
                    {fullAddress}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 bg-white dark:bg-[#181818] rounded-xl border border-slate-200/60 dark:border-[#242424]">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Street</span>
                      <strong className="text-xs font-bold text-slate-800 dark:text-white">{address?.street || '—'}</strong>
                    </div>
                    <div className="p-3 bg-white dark:bg-[#181818] rounded-xl border border-slate-200/60 dark:border-[#242424]">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">City / Town</span>
                      <strong className="text-xs font-bold text-slate-800 dark:text-white">{cityName || '—'}</strong>
                    </div>
                    <div className="p-3 bg-white dark:bg-[#181818] rounded-xl border border-slate-200/60 dark:border-[#242424]">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">State</span>
                      <strong className="text-xs font-bold text-slate-800 dark:text-white">{stateName || '—'}</strong>
                    </div>
                    <div className="p-3 bg-white dark:bg-[#181818] rounded-xl border border-slate-200/60 dark:border-[#242424]">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Postal Code</span>
                      <strong className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">{address?.zipcode || '—'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. FEES & CONCESSIONS TAB */}
            {activeTab === 'fees' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InfoCard
                    label="Fee Waiver Status"
                    value={student?.is_fee_waiver ? 'Active Concession' : 'Standard Tuition (No Waiver)'}
                    icon={Award}
                    highlight={student?.is_fee_waiver ? 'emerald' : 'slate'}
                  />

                  <InfoCard
                    label="Waiver Category"
                    value={capitalizeEveryWord(student?.fee_waiver_type || 'None')}
                    icon={Award}
                  />

                  <InfoCard
                    label="Waived Amount (₹)"
                    value={student?.waived_fees ? `₹ ${student.waived_fees.toLocaleString('en-IN')}` : '₹ 0.00'}
                    icon={Award}
                    highlight="emerald"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <strong className="font-bold text-slate-900 dark:text-white block mb-0.5">Official Fee Record Status</strong>
                    Fee calculations and invoice generation automatically apply the registered concessions configured above for this student.
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* FOOTER BAR (Official Record Seal & Close Button) */}
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#111] border-t border-slate-200 dark:border-[#1e1e1e] flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-mono">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Authenticated School CRM Register Entry</span>
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

      {/* DEDICATED FULL PRINTABLE A4 STUDENT DOSSIER RECORD (VISIBLE ONLY ON PRINT) */}
      <div id="student-dossier-print-root" className="hidden print:block w-full text-slate-900 bg-white font-sans text-xs">
        
        {/* OFFICIAL LETTERHEAD */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-xl border border-slate-400 flex items-center justify-center bg-slate-100 shrink-0">
              <School className="w-8 h-8 text-slate-800" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 block">
                Official Student Cumulative Register & Dossier
              </span>
              <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase leading-none mt-0.5">
                {schoolName || 'School CRM Educational Institute'}
              </h1>
              <p className="text-[10px] text-slate-600 mt-1 font-medium">
                {schoolCode ? `School Code: ${schoolCode} • ` : ''}
                Academic Session: <strong className="text-slate-950">{student?.session || '2025-2026'}</strong> • 
                Printed on: <span className="font-mono">{new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="border border-slate-900 px-3 py-1.5 rounded-lg bg-slate-50 inline-block text-center">
              <div className="text-[8px] font-extrabold uppercase text-slate-500 tracking-wider">Student ID</div>
              <div className="text-sm font-black font-mono text-slate-950">#{student?.id || '—'}</div>
            </div>
          </div>
        </div>

        {/* TOP PROFILE HERO: STUDENT PHOTO + KEY IDENTIFIERS */}
        <div className="border border-slate-300 rounded-xl p-3.5 mb-4 bg-slate-50/50 print-avoid-break">
          <div className="flex items-start gap-4">
            
            {/* Student Photo */}
            <div className="w-24 h-30 rounded-lg border-2 border-slate-400 overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center">
              {studentImgSrc ? (
                <img
                  src={studentImgSrc}
                  alt={`${student?.firstname} photo`}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="text-center p-1">
                  <User className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                  <span className="text-[8px] font-bold text-slate-500 uppercase block">No Photo</span>
                </div>
              )}
            </div>

            {/* Core Specs */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5 mb-2">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-slate-950 capitalize">
                    {student?.firstname} {student?.lastname || ''}
                  </h2>
                  <div className="text-[10px] text-slate-600 font-medium flex items-center gap-3 mt-0.5">
                    {student?.gender && <span className="capitalize">Gender: <strong className="text-slate-900">{student.gender}</strong></span>}
                    {student?.blood_group && <span>Blood Group: <strong className="text-slate-900">{formatBloodGroup(student.blood_group)}</strong></span>}
                    <span>Status: <strong className="text-slate-900 uppercase">{student?.status || 'Active'}</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-slate-900 text-white font-extrabold text-[11px] rounded-md uppercase tracking-wider">
                    {resolvedClass} {resolvedSection && `• ${resolvedSection}`}
                  </span>
                </div>
              </div>

              {/* ID Grid */}
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="border border-slate-200 rounded p-1.5 bg-white">
                  <span className="text-slate-500 block uppercase font-bold text-[8px]">Enrollment No</span>
                  <strong className="text-slate-900 font-mono text-[11px]">#{student?.enrollment_no || 'Pending'}</strong>
                </div>
                <div className="border border-slate-200 rounded p-1.5 bg-white">
                  <span className="text-slate-500 block uppercase font-bold text-[8px]">Roll Number</span>
                  <strong className="text-slate-900 font-mono text-[11px]">#{student?.roll_no ? String(student.roll_no).padStart(2, '0') : '—'}</strong>
                </div>
                <div className="border border-slate-200 rounded p-1.5 bg-white">
                  <span className="text-slate-500 block uppercase font-bold text-[8px]">Admission Date</span>
                  <strong className="text-slate-900 font-mono text-[11px]">{formatDate(student?.admission_date)}</strong>
                </div>
              </div>

              {/* Contact Row */}
              <div className="mt-2 text-[10px] text-slate-700 flex flex-wrap items-center gap-4">
                {student?.email && <span>Email: <strong className="font-medium text-slate-900">{student.email}</strong></span>}
                {student?.contact_no && <span>Phone: <strong className="font-mono text-slate-900">{String(student.contact_no).split('.')[0]}</strong></span>}
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 1: PERSONAL & REGISTER PARTICULARS */}
        <div className="border border-slate-300 rounded-xl p-3 mb-3 print-avoid-break">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-700" />
            1. Personal & Identity Particulars
          </div>
          <table className="w-full text-[10px] text-left border-collapse">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-1 pr-2 text-slate-500 font-semibold w-1/4">Date of Birth (DOB):</td>
                <td className="py-1 text-slate-900 font-bold w-1/4">{formatDate(student?.dob)} {ageText ? `(${ageText})` : ''}</td>
                <td className="py-1 pr-2 text-slate-500 font-semibold w-1/4">Student Aadhaar No:</td>
                <td className="py-1 text-slate-900 font-mono font-bold w-1/4">{student?.aadhaar_no ? String(student.aadhaar_no).replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : 'Not Provided'}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1 pr-2 text-slate-500 font-semibold">Nationality:</td>
                <td className="py-1 text-slate-900 font-bold capitalize">{student?.nationality || 'Indian'}</td>
                <td className="py-1 pr-2 text-slate-500 font-semibold">Religion:</td>
                <td className="py-1 text-slate-900 font-bold capitalize">{student?.religion || 'N/A'}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1 pr-2 text-slate-500 font-semibold">Caste Category:</td>
                <td className="py-1 text-slate-900 font-bold uppercase">{student?.caste_group || 'General'}</td>
                <td className="py-1 pr-2 text-slate-500 font-semibold">Admission Type:</td>
                <td className="py-1 text-slate-900 font-bold capitalize">{student?.admission_type || 'Regular'}</td>
              </tr>
              <tr>
                <td className="py-1 pr-2 text-slate-500 font-semibold">Specially Abled:</td>
                <td className="py-1 text-slate-900 font-bold">{student?.is_specially_abled ? 'Yes (Assistance Required)' : 'No'}</td>
                <td className="py-1 pr-2 text-slate-500 font-semibold">Identification Mark:</td>
                <td className="py-1 text-slate-900 font-medium">{student?.birth_mark || 'None recorded'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 2: ACADEMICS, HOUSE & ENROLLED CURRICULUM */}
        <div className="border border-slate-300 rounded-xl p-3 mb-3 print-avoid-break">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-700" />
            2. Academic Record & Curriculum Subjects
          </div>
          <table className="w-full text-[10px] text-left border-collapse mb-2.5">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-1 pr-2 text-slate-500 font-semibold w-1/4">Class & Section:</td>
                <td className="py-1 text-slate-900 font-bold w-1/4">{resolvedClass} {resolvedSection && `(${resolvedSection})`}</td>
                <td className="py-1 pr-2 text-slate-500 font-semibold w-1/4">School House:</td>
                <td className="py-1 text-slate-900 font-bold w-1/4">{resolvedHouse}</td>
              </tr>
              <tr>
                <td className="py-1 pr-2 text-slate-500 font-semibold">Transport Facility:</td>
                <td className="py-1 text-slate-900 font-bold">{student?.is_taking_bus ? (student?.bus ? `School Bus #${student.bus}` : 'Opted for Bus') : 'Self Transport (No Bus)'}</td>
                <td className="py-1 pr-2 text-slate-500 font-semibold">Student Leadership:</td>
                <td className="py-1 text-slate-900 font-bold">{student?.head ? 'School Head Representative' : 'Standard Student'}</td>
              </tr>
            </tbody>
          </table>

          {/* Subject Pills */}
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Enrolled Curriculum Subjects ({resolvedSubjectList.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {resolvedSubjectList.length > 0 ? (
                resolvedSubjectList.map((sub, idx) => (
                  <span
                    key={`print-sub-${sub.id || idx}`}
                    className="border border-slate-400 bg-slate-50 text-slate-900 px-2 py-0.5 rounded text-[9px] font-bold"
                  >
                    {sub.name}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 italic text-[9px]">Standard class curriculum assigned.</span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: PARENTS & GUARDIANS DETAILS (WITH PARENT PHOTO) */}
        <div className="border border-slate-300 rounded-xl p-3 mb-3 print-avoid-break">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-700" />
              <span>3. Parents & Guardians Particulars</span>
            </div>
            {parentImgSrc && (
              <span className="text-[8px] font-extrabold uppercase text-slate-500">Parent Photo Attached</span>
            )}
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-1 grid grid-cols-2 gap-2 text-[10px]">
              {/* Father Box */}
              <div className="border border-slate-200 rounded-lg p-2 bg-slate-50/40">
                <span className="text-[8px] font-black uppercase text-slate-500 block mb-0.5">Father's Information</span>
                <div className="font-bold text-slate-950 capitalize">{capitalizeEveryWord(student?.father_name || 'Not Provided')}</div>
                <div className="text-slate-600 mt-0.5">Phone: <strong className="text-slate-900 font-mono">{student?.father_contact_no ? String(student.father_contact_no).split('.')[0] : 'N/A'}</strong></div>
                <div className="text-slate-600">Aadhaar: <strong className="text-slate-900 font-mono">{student?.father_aadhar ? String(student.father_aadhar).split('.')[0] : 'N/A'}</strong></div>
              </div>

              {/* Mother Box */}
              <div className="border border-slate-200 rounded-lg p-2 bg-slate-50/40">
                <span className="text-[8px] font-black uppercase text-slate-500 block mb-0.5">Mother's Information</span>
                <div className="font-bold text-slate-950 capitalize">{capitalizeEveryWord(student?.mother_name || 'Not Provided')}</div>
                <div className="text-slate-600 mt-0.5">Phone: <strong className="text-slate-900 font-mono">{student?.mother_contact_no ? String(student.mother_contact_no).split('.')[0] : 'N/A'}</strong></div>
                <div className="text-slate-600">Aadhaar: <strong className="text-slate-900 font-mono">{student?.mother_aadhar ? String(student.mother_aadhar).split('.')[0] : 'N/A'}</strong></div>
              </div>

              {/* Guardian Box (if present) */}
              {(student?.guardian_name || student?.guardian_contact_no) && (
                <div className="col-span-2 border border-slate-200 rounded-lg p-2 bg-slate-50/40">
                  <span className="text-[8px] font-black uppercase text-slate-500 block mb-0.5">Guardian's Information</span>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-950 capitalize">{capitalizeEveryWord(student?.guardian_name || 'N/A')}</span>
                    <span className="text-slate-600">Phone: <strong className="text-slate-900 font-mono">{student?.guardian_contact_no ? String(student.guardian_contact_no).split('.')[0] : 'N/A'}</strong></span>
                    <span className="text-slate-600">Aadhaar: <strong className="text-slate-900 font-mono">{student?.guardian_aadhar ? String(student.guardian_aadhar).split('.')[0] : 'N/A'}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Parent Photo Frame (if exists) */}
            {parentImgSrc && (
              <div className="w-20 h-25 rounded-lg border border-slate-400 overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center">
                <img
                  src={parentImgSrc}
                  alt="Parent photo"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: RESIDENTIAL ADDRESS & FEES SUMMARY (SIDE BY SIDE) */}
        <div className="grid grid-cols-3 gap-3 mb-4 print-avoid-break">
          {/* Address Box */}
          <div className="col-span-2 border border-slate-300 rounded-xl p-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-700" />
              4. Residential & Permanent Address
            </div>
            <p className="text-[10px] text-slate-800 font-semibold leading-normal">
              {fullAddress}
            </p>
            <div className="grid grid-cols-4 gap-1.5 mt-2 pt-1 border-t border-slate-100 text-[9px]">
              <div><span className="text-slate-400 block">City</span><strong className="text-slate-900">{cityName || '—'}</strong></div>
              <div><span className="text-slate-400 block">State</span><strong className="text-slate-900">{stateName || '—'}</strong></div>
              <div><span className="text-slate-400 block">Country</span><strong className="text-slate-900">{countryName || 'India'}</strong></div>
              <div><span className="text-slate-400 block">Postal PIN</span><strong className="text-slate-900 font-mono">{address?.zipcode || '—'}</strong></div>
            </div>
          </div>

          {/* Fees Summary Box */}
          <div className="border border-slate-300 rounded-xl p-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-1.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-slate-700" />
              5. Fee Concessions
            </div>
            <div className="space-y-1.5 text-[10px]">
              <div>
                <span className="text-slate-500 block text-[8px] uppercase font-bold">Waiver Status</span>
                <strong className="text-slate-900">{student?.is_fee_waiver ? 'Active Concession' : 'Standard Tuition'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[8px] uppercase font-bold">Category</span>
                <strong className="text-slate-900 capitalize">{student?.fee_waiver_type || 'None'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[8px] uppercase font-bold">Waived Amount</span>
                <strong className="text-slate-900 font-mono">{student?.waived_fees ? `₹ ${student.waived_fees.toLocaleString('en-IN')}` : '₹ 0.00'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: OFFICIAL VERIFICATION & AUTHORIZATION SIGNATURES */}
        <div className="border-2 border-slate-900 rounded-xl p-3 mt-4 print-avoid-break bg-slate-50/30">
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-800 text-center mb-6">
            Official Institution Authorization & Register Verification
          </div>

          <div className="grid grid-cols-3 gap-6 text-center text-[10px]">
            {/* Class Teacher */}
            <div className="flex flex-col justify-end">
              <div className="border-b border-dashed border-slate-800 pb-1 mb-1 font-bold text-slate-900 font-mono">
                &nbsp;
              </div>
              <span className="font-bold text-slate-900">Class Teacher Signature</span>
              <span className="text-[8px] text-slate-500">Date: ____________</span>
            </div>

            {/* School Seal / Stamp */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-12 border border-slate-400 rounded-lg flex items-center justify-center text-[8px] uppercase font-bold text-slate-400 bg-white">
                School Stamp
              </div>
              <span className="text-[8px] text-slate-500 mt-1 font-semibold">Institutional Seal</span>
            </div>

            {/* Principal */}
            <div className="flex flex-col justify-end">
              <div className="border-b border-dashed border-slate-800 pb-1 mb-1 font-bold text-slate-900 font-mono">
                &nbsp;
              </div>
              <span className="font-bold text-slate-900">Principal / Headmaster</span>
              <span className="text-[8px] text-slate-500">Authorized Signatory</span>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-3 pt-2 text-center text-[8px] text-slate-500 font-mono">
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
    <div className={`p-4 bg-slate-50/90 dark:bg-[#141414] rounded-2xl border ${highlightStyles[highlight] || highlightStyles.slate} shadow-2xs space-y-1`}>
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        <span>{label}</span>
        {Icon && <Icon className="w-3.5 h-3.5 opacity-60" />}
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

StudentDossierModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  detail: PropTypes.object,
  countryData: PropTypes.array,
  stateData: PropTypes.array,
  cityData: PropTypes.array,
  allClasses: PropTypes.array,
  allSections: PropTypes.array,
  allSubjects: PropTypes.array,
  allHouses: PropTypes.array,
  classData: PropTypes.array,
  rolePriority: PropTypes.number,
};

export default StudentDossierModal;
