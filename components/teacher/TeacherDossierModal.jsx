import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  X, Printer, Edit, Copy, Check, School, User, Calendar, MapPin,
  Phone, Mail, Shield, BookOpen, Award, FileText, CheckCircle2,
  GraduationCap, Briefcase, Sparkles, ExternalLink, Users, Layers, Heart
} from 'lucide-react';
import { Utility } from '../utility';
import { useNavigate } from '@/lib/routerAdapter';

const TeacherDossierModal = ({
  open,
  setOpen,
  detail,
  countryData = [],
  stateData = [],
  cityData = [],
  allClasses = [],
  allSections = [],
  allSubjects = [],
  classData = [],
  rolePriority = 2,
}) => {
  const [activeTab, setActiveTab] = useState('register');
  const [copiedField, setCopiedField] = useState(null);

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
    }
  }, [open]);

  const teacher = detail?.teacherData || {};
  const address = detail?.addressData || {};
  const teacherImages = detail?.imageData || [];
  const selectedClassMappings = detail?.selectedClass || [];

  const teacherImgSrc = Array.isArray(teacherImages)
    ? teacherImages[0]?.image_src
    : (teacherImages?.image_src || null);

  const authUser = getLocalStorage('auth') || {};
  const schoolName = authUser?.school || authUser?.school_name || '';
  const schoolCode = authUser?.school_code || '';

  // Format qualification neatly (e.g. phd -> Ph.D, msc -> M.Sc)
  const formatQualification = (q) => {
    if (!q) return 'Not Specified';
    const str = String(q).trim();
    const lower = str.toLowerCase();
    if (lower === 'phd' || lower === 'ph.d') return 'Ph.D';
    if (lower === 'msc' || lower === 'm.sc') return 'M.Sc';
    if (lower === 'bsc' || lower === 'b.sc') return 'B.Sc';
    if (lower === 'bed' || lower === 'b.ed') return 'B.Ed';
    if (lower === 'med' || lower === 'm.ed') return 'M.Ed';
    if (lower === 'btech' || lower === 'b.tech') return 'B.Tech';
    if (lower === 'mtech' || lower === 'm.tech') return 'M.Tech';
    if (lower === 'ma' || lower === 'm.a') return 'M.A';
    if (lower === 'ba' || lower === 'b.a') return 'B.A';
    return capitalizeEveryWord(str.replace(/_/g, ' '));
  };

  // Format grade neatly (e.g. post_graduate_teacher -> PGT / Post Graduate)
  const formatGrade = (g) => {
    if (!g) return 'Standard';
    const str = String(g).trim();
    const lower = str.toLowerCase();
    if (lower.includes('post_graduate') || lower.includes('pgt')) return 'PGT (Post Grad)';
    if (lower.includes('trained_graduate') || lower.includes('tgt')) return 'TGT (Trained Grad)';
    if (lower.includes('primary') || lower.includes('prt')) return 'PRT (Primary)';
    return capitalizeEveryWord(str.replace(/_/g, ' '));
  };

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

  // Class Teacher Assigned Class & Section
  const classTeacherClass = useMemo(() => {
    if (!teacher?.class) return null;
    const found = allClasses.find((c) => (c.class_id ?? c.id) == teacher.class);
    const rawName = found?.class_name ?? found?.name ?? String(teacher.class);
    return !isNaN(Number(rawName)) && rawName !== ''
      ? `Class ${appendSuffix(rawName)}`
      : rawName.toLowerCase().startsWith('class')
        ? capitalizeEveryWord(rawName)
        : `Class ${capitalizeEveryWord(rawName)}`;
  }, [teacher?.class, allClasses]);

  const classTeacherSection = useMemo(() => {
    if (!teacher?.section) return null;
    const found = allSections.find((s) => (s.section_id ?? s.id) == teacher.section);
    const rawName = found?.section_name ?? found?.name ?? String(teacher.section);
    return rawName ? (rawName.toLowerCase().startsWith('sec') ? capitalizeEveryWord(rawName) : `Section ${capitalizeEveryWord(rawName)}`) : `Section ${teacher.section}`;
  }, [teacher?.section, allSections]);

  // Formatted Dates & Age
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

  const ageText = calculateAge(teacher?.dob);

  // Resolved Allocated Class-Section-Subject List
  const resolvedAllocations = useMemo(() => {
    if (!selectedClassMappings || selectedClassMappings.length === 0) return [];

    // Group mappings by class_id
    const grouped = {};
    selectedClassMappings.forEach((mapping) => {
      const cId = mapping.class_id ?? mapping.id;
      if (!grouped[cId]) {
        const foundClass = allClasses.find((c) => (c.class_id ?? c.id) == cId);
        const rawClassName = foundClass?.class_name ?? foundClass?.name ?? `Class ${cId}`;
        grouped[cId] = {
          classId: cId,
          className: !isNaN(Number(rawClassName)) ? `Class ${appendSuffix(rawClassName)}` : capitalizeEveryWord(rawClassName),
          sections: []
        };
      }

      const sId = mapping.section_id;
      const foundSection = allSections.find((s) => (s.section_id ?? s.id) == sId);
      const sectionName = foundSection?.section_name ?? foundSection?.name ?? (sId ? `Section ${sId}` : 'All Sections');

      // Resolved subjects for this section
      let subjectList = [];
      if (mapping.subject_ids) {
        let subIds = [];
        if (Array.isArray(mapping.subject_ids)) {
          subIds = mapping.subject_ids;
        } else if (typeof mapping.subject_ids === 'string') {
          subIds = mapping.subject_ids.split(',').map((id) => parseInt(id.trim(), 10)).filter((n) => !isNaN(n));
        }

        subjectList = subIds.map((subId) => {
          const foundSub = allSubjects.find((s) => (s.id ?? s.subject_id) == subId);
          return capitalizeEveryWord(foundSub?.name || foundSub?.subject_name || `Subject ${subId}`);
        });
      }

      grouped[cId].sections.push({
        sectionId: sId,
        sectionName,
        subjects: subjectList
      });
    });

    return Object.values(grouped);
  }, [selectedClassMappings, allClasses, allSections, allSubjects]);

  // Copy helper
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
    if (teacher?.id) {
      setOpen(false);
      navigateTo(`/teacher/update/${teacher.id}`, { state: { id: teacher.id } });
    }
  };

  if (!open) return null;

  return (
    <>
      {/* GLOBAL PRINT STYLES FOR TEACHER DOSSIER */}
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
          #teacher-dossier-print-root,
          #teacher-dossier-print-root * {
            visibility: visible !important;
          }
          #teacher-dossier-print-root {
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
        <div className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-[#0c0c0c] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-[#222] animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100 my-auto">

          {/* TOP OFFICIAL SCHOOL LETTERHEAD BANNER */}
          <div className="relative bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-5 sm:p-6 overflow-hidden shrink-0">
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
                      Official Faculty Register
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white mt-1">
                    {schoolName}
                  </h1>
                  <p className="text-xs text-slate-300 flex items-center gap-2">
                    <span>Faculty Role: <strong className="text-white">Teaching Staff</strong></span>
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    <span>Teacher ID: <strong className="text-white font-mono">#{teacher?.id || '—'}</strong></span>
                  </p>
                </div>
              </div>

              {/* Quick Action Header Controls */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-md transition-all border border-white/15 cursor-pointer shadow-sm active:scale-95"
                  title="Print Official Faculty Dossier"
                >
                  <Printer className="w-4 h-4 text-emerald-300" />
                  <span className="hidden sm:inline">Print Record</span>
                </button>

                {rolePriority > 1 && (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/30 cursor-pointer active:scale-95"
                    title="Edit Teacher Profile"
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

          {/* HERO DOSSIER CARD */}
          <div className="p-5 sm:p-6 bg-slate-50 dark:bg-[#111] border-b border-slate-200 dark:border-[#1e1e1e]">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">

              {/* Left: Photo & Primary Name */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 w-full lg:w-auto flex-1 min-w-0">
                <div className="relative group shrink-0">
                  <div className="w-28 h-34 sm:w-32 sm:h-38 rounded-2xl overflow-hidden shadow-xl border-4 border-white dark:border-[#222] bg-gradient-to-br from-emerald-100 to-slate-200 dark:from-emerald-950/40 dark:to-slate-800 flex items-center justify-center relative">
                    {teacherImgSrc ? (
                      <img
                        src={teacherImgSrc}
                        alt={`${teacher?.firstname} photo`}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-2 text-center">
                        <GraduationCap className="w-10 h-10 text-emerald-600/50 dark:text-emerald-400/50 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">No Faculty Photo</span>
                      </div>
                    )}
                    {/* Ribbon Badge */}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-md">
                      Teacher
                    </span>
                  </div>
                </div>

                {/* Title & Key Badges */}
                <div className="text-center sm:text-left space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    {teacher?.is_class_teacher && classTeacherClass ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {classTeacherClass} {classTeacherSection && `• ${classTeacherSection}`}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Subject Faculty
                      </span>
                    )}

                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      teacher?.status === 'active' || !teacher?.status
                        ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                        : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}>
                      {capitalizeEveryWord(teacher?.status || 'Active')}
                    </span>

                    {teacher?.blood_group && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                        Blood: {formatBloodGroup(teacher.blood_group)}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white capitalize truncate">
                    {teacher?.firstname} {teacher?.lastname || ''}
                  </h2>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {teacher?.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {teacher.email}
                      </span>
                    )}
                    {teacher?.contact_no && (
                      <span className="inline-flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {String(teacher.contact_no).split('.')[0]}
                      </span>
                    )}
                    {teacher?.gender && (
                      <span className="inline-flex items-center gap-1 capitalize font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {teacher.gender}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Quick Highlights Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
                {/* Qualification */}
                <div
                  onClick={() => handleCopy(teacher?.qualification, 'qualification')}
                  className="p-3 bg-white dark:bg-[#161616] rounded-xl border border-slate-200/90 dark:border-[#262626] shadow-2xs hover:border-emerald-500/50 transition-all cursor-pointer group min-w-[120px]"
                  title="Click to copy Qualification"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <span>Qualification</span>
                    {copiedField === 'qualification' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </div>
                  <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                    {formatQualification(teacher?.qualification)}
                  </div>
                </div>

                {/* Experience */}
                <div className="p-3 bg-white dark:bg-[#161616] rounded-xl border border-slate-200/90 dark:border-[#262626] shadow-2xs min-w-[110px]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Experience
                  </div>
                  <div className="text-sm font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1 truncate">
                    {teacher?.experience ? `${teacher.experience} Years` : '—'}
                  </div>
                </div>

                {/* Pay Grade */}
                <div className="p-3 bg-white dark:bg-[#161616] rounded-xl border border-slate-200/90 dark:border-[#262626] shadow-2xs col-span-2 sm:col-span-1 min-w-[130px]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Faculty Grade
                  </div>
                  <div className="text-sm font-black font-mono text-slate-800 dark:text-slate-200 mt-1 truncate">
                    {formatGrade(teacher?.grade)}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* TAB NAVIGATION HEADER */}
          <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-[#1e1e1e] bg-white dark:bg-[#0c0c0c] overflow-x-auto custom-scrollbar shrink-0">
            {[
              { id: 'register', label: 'Identity & Register', icon: FileText },
              { id: 'qualifications', label: 'Qualifications & Background', icon: GraduationCap },
              { id: 'allocations', label: 'Teaching Allocations', icon: Layers },
              { id: 'address', label: 'Address & Contact', icon: MapPin },
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
                  <InfoCard label="Full Legal Name" value={`${teacher?.firstname || ''} ${teacher?.lastname || ''}`.trim() || 'N/A'} icon={User} />
                  <InfoCard
                    label="Date of Birth (DOB)"
                    value={formatDate(teacher?.dob)}
                    subValue={ageText ? `Age: ${ageText}` : null}
                    icon={Calendar}
                  />
                  <InfoCard label="Gender" value={capitalizeEveryWord(teacher?.gender || 'N/A')} icon={User} />
                  <InfoCard label="Blood Group" value={formatBloodGroup(teacher?.blood_group)} icon={Heart} highlight="rose" />
                  <InfoCard label="Nationality" value={capitalizeEveryWord(teacher?.nationality || 'Indian')} icon={School} />
                  <InfoCard label="Religion" value={capitalizeEveryWord(teacher?.religion || 'N/A')} icon={Award} />
                  <InfoCard label="Caste Group" value={String(teacher?.caste_group || 'General').toUpperCase()} icon={Users} />
                  <InfoCard label="Faculty Role Status" value={capitalizeEveryWord(teacher?.status || 'Active')} icon={Shield} highlight="emerald" />
                  
                  <div className="p-4 bg-slate-50/80 dark:bg-[#141414] rounded-2xl border border-slate-200/80 dark:border-[#222] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Specially Abled
                      </span>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                        {teacher?.is_specially_abled ? 'Yes (Assistance Required)' : 'No'}
                      </p>
                    </div>
                    <span className={`w-3 h-3 rounded-full ${teacher?.is_specially_abled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                  </div>
                </div>
              </div>
            )}

            {/* 2. QUALIFICATIONS & BACKGROUND TAB */}
            {activeTab === 'qualifications' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InfoCard label="Academic Qualification" value={formatQualification(teacher?.qualification)} icon={GraduationCap} highlight="emerald" />
                  <InfoCard label="Years of Experience" value={teacher?.experience ? `${teacher.experience} Years` : '—'} icon={Briefcase} highlight="indigo" />
                  <InfoCard label="Appointed Grade" value={formatGrade(teacher?.grade)} icon={Award} />
                </div>

                {/* Achievements Card */}
                <div className="p-5 bg-slate-50/80 dark:bg-[#141414] rounded-2xl border border-slate-200/80 dark:border-[#222] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Special Achievements, Certifications & Recognition
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                    {teacher?.achievements || 'No specific accolades or special achievements recorded in profile.'}
                  </p>
                </div>
              </div>
            )}

            {/* 3. TEACHING ALLOCATIONS TAB */}
            {activeTab === 'allocations' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Class Teacher Overview */}
                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                        Class Teacher Responsibility
                      </h4>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {teacher?.is_class_teacher && classTeacherClass
                          ? `Assigned Class Teacher for ${classTeacherClass} ${classTeacherSection && `(${classTeacherSection})`}`
                          : 'Not Assigned as Class Teacher'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Allocated Classes Breakdown */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    Assigned Classes & Subject Curriculum
                  </h3>

                  {resolvedAllocations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {resolvedAllocations.map((alloc) => (
                        <div
                          key={`alloc-${alloc.classId}`}
                          className="p-5 bg-slate-50/90 dark:bg-[#141414] rounded-2xl border border-slate-200/90 dark:border-[#222] space-y-3 shadow-2xs"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-[#222]">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                              {alloc.className}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                              {alloc.sections.length} {alloc.sections.length === 1 ? 'Section' : 'Sections'}
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {alloc.sections.map((sec, sIdx) => (
                              <div key={`sec-${alloc.classId}-${sec.sectionId || sIdx}`} className="p-3 bg-white dark:bg-[#1c1c1c] rounded-xl border border-slate-200/70 dark:border-[#262626]">
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                                  {sec.sectionName}
                                </span>
                                {sec.subjects.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {sec.subjects.map((sub, subIdx) => (
                                      <span
                                        key={`sub-${subIdx}`}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/40"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        {sub}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-slate-400 italic">General Class Curriculum</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center border border-dashed border-slate-300 dark:border-[#2e2e2e] rounded-2xl">
                      <p className="text-xs text-slate-400 italic">No class teaching allocations configured for this faculty member.</p>
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

          </div>

          {/* FOOTER BAR */}
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

      {/* DEDICATED FULL PRINTABLE A4 TEACHER DOSSIER RECORD (VISIBLE ONLY ON PRINT) */}
      <div id="teacher-dossier-print-root" className="hidden print:block w-full text-slate-900 bg-white font-sans text-xs">
        
        {/* OFFICIAL LETTERHEAD */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-xl border border-slate-400 flex items-center justify-center bg-slate-100 shrink-0">
              <School className="w-8 h-8 text-slate-800" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 block">
                Official Faculty & Staff Register Dossier
              </span>
              <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase leading-none mt-0.5">
                {schoolName || 'School CRM Educational Institute'}
              </h1>
              <p className="text-[10px] text-slate-600 mt-1 font-medium">
                {schoolCode ? `School Code: ${schoolCode} • ` : ''}
                Printed on: <span className="font-mono">{new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="border border-slate-900 px-3 py-1.5 rounded-lg bg-slate-50 inline-block text-center">
              <div className="text-[8px] font-extrabold uppercase text-slate-500 tracking-wider">Teacher ID</div>
              <div className="text-sm font-black font-mono text-slate-950">#{teacher?.id || '—'}</div>
            </div>
          </div>
        </div>

        {/* TOP PROFILE HERO: TEACHER PHOTO + SPECS */}
        <div className="border border-slate-300 rounded-xl p-3.5 mb-4 bg-slate-50/50 print-avoid-break">
          <div className="flex items-start gap-4">
            
            {/* Teacher Photo */}
            <div className="w-24 h-30 rounded-lg border-2 border-slate-400 overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center">
              {teacherImgSrc ? (
                <img
                  src={teacherImgSrc}
                  alt={`${teacher?.firstname} photo`}
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
                    {teacher?.firstname} {teacher?.lastname || ''}
                  </h2>
                  <div className="text-[10px] text-slate-600 font-medium flex items-center gap-3 mt-0.5">
                    {teacher?.gender && <span className="capitalize">Gender: <strong className="text-slate-900">{teacher.gender}</strong></span>}
                    {teacher?.blood_group && <span>Blood Group: <strong className="text-slate-900">{formatBloodGroup(teacher.blood_group)}</strong></span>}
                    <span>Status: <strong className="text-slate-900 uppercase">{teacher?.status || 'Active'}</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  {teacher?.is_class_teacher && classTeacherClass ? (
                    <span className="inline-block px-2.5 py-1 bg-slate-900 text-white font-extrabold text-[10px] rounded-md uppercase tracking-wider">
                      Class Teacher: {classTeacherClass}
                    </span>
                  ) : (
                    <span className="inline-block px-2.5 py-1 bg-slate-200 text-slate-800 font-bold text-[10px] rounded-md uppercase tracking-wider">
                      Faculty Member
                    </span>
                  )}
                </div>
              </div>

              {/* ID & Qualification Grid */}
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="border border-slate-200 rounded p-1.5 bg-white">
                  <span className="text-slate-500 block uppercase font-bold text-[8px]">Qualification</span>
                  <strong className="text-slate-900 font-bold text-[11px]">{formatQualification(teacher?.qualification)}</strong>
                </div>
                <div className="border border-slate-200 rounded p-1.5 bg-white">
                  <span className="text-slate-500 block uppercase font-bold text-[8px]">Experience</span>
                  <strong className="text-slate-900 font-mono text-[11px]">{teacher?.experience ? `${teacher.experience} Yrs` : '—'}</strong>
                </div>
                <div className="border border-slate-200 rounded p-1.5 bg-white">
                  <span className="text-slate-500 block uppercase font-bold text-[8px]">Appointed Grade</span>
                  <strong className="text-slate-900 font-mono text-[11px]">{formatGrade(teacher?.grade)}</strong>
                </div>
              </div>

              {/* Contact Row */}
              <div className="mt-2 text-[10px] text-slate-700 flex flex-wrap items-center gap-4">
                {teacher?.email && <span>Email: <strong className="font-medium text-slate-900">{teacher.email}</strong></span>}
                {teacher?.contact_no && <span>Phone: <strong className="font-mono text-slate-900">{String(teacher.contact_no).split('.')[0]}</strong></span>}
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 1: PERSONAL PARTICULARS */}
        <div className="border border-slate-300 rounded-xl p-3 mb-3 print-avoid-break">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-700" />
            1. Personal & Identity Particulars
          </div>
          <table className="w-full text-[10px] text-left border-collapse">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-1 pr-2 text-slate-500 font-semibold w-1/4">Date of Birth (DOB):</td>
                <td className="py-1 text-slate-900 font-bold w-1/4">{formatDate(teacher?.dob)} {ageText ? `(${ageText})` : ''}</td>
                <td className="py-1 pr-2 text-slate-500 font-semibold w-1/4">Blood Group:</td>
                <td className="py-1 text-slate-900 font-bold w-1/4">{formatBloodGroup(teacher?.blood_group)}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1 pr-2 text-slate-500 font-semibold">Nationality:</td>
                <td className="py-1 text-slate-900 font-bold capitalize">{teacher?.nationality || 'Indian'}</td>
                <td className="py-1 pr-2 text-slate-500 font-semibold">Religion:</td>
                <td className="py-1 text-slate-900 font-bold capitalize">{teacher?.religion || 'N/A'}</td>
              </tr>
              <tr>
                <td className="py-1 pr-2 text-slate-500 font-semibold">Caste Category:</td>
                <td className="py-1 text-slate-900 font-bold uppercase">{teacher?.caste_group || 'General'}</td>
                <td className="py-1 pr-2 text-slate-500 font-semibold">Specially Abled:</td>
                <td className="py-1 text-slate-900 font-bold">{teacher?.is_specially_abled ? 'Yes (Assistance Required)' : 'No'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 2: QUALIFICATIONS & TEACHING ALLOCATIONS */}
        <div className="border border-slate-300 rounded-xl p-3 mb-3 print-avoid-break">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-700" />
            2. Teaching Allocations & Assigned Curriculum
          </div>

          {resolvedAllocations.length > 0 ? (
            <div className="space-y-2">
              {resolvedAllocations.map((alloc) => (
                <div key={`print-alloc-${alloc.classId}`} className="border border-slate-200 rounded-lg p-2 bg-slate-50/40">
                  <div className="font-bold text-[10px] text-slate-950 mb-1">
                    {alloc.className}
                  </div>
                  <div className="space-y-1">
                    {alloc.sections.map((sec, sIdx) => (
                      <div key={`print-sec-${alloc.classId}-${sIdx}`} className="text-[9px] flex items-start gap-2">
                        <span className="font-bold text-slate-700 min-w-[70px]">{sec.sectionName}:</span>
                        <div className="flex flex-wrap gap-1">
                          {sec.subjects.length > 0 ? (
                            sec.subjects.map((sub, subIdx) => (
                              <span key={`print-sub-${subIdx}`} className="border border-slate-300 bg-white px-1.5 py-0.5 rounded text-[8px] font-semibold text-slate-800">
                                {sub}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">General Curriculum</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[9px] text-slate-400 italic">No class teaching allocations configured in register.</p>
          )}
        </div>

        {/* SECTION 3: RESIDENTIAL ADDRESS & ACHIEVEMENTS */}
        <div className="grid grid-cols-2 gap-3 mb-4 print-avoid-break">
          {/* Address Box */}
          <div className="border border-slate-300 rounded-xl p-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-700" />
              3. Residential Address
            </div>
            <p className="text-[10px] text-slate-800 font-semibold leading-normal">
              {fullAddress}
            </p>
            <div className="grid grid-cols-4 gap-1 mt-2 pt-1 border-t border-slate-100 text-[8px]">
              <div><span className="text-slate-400 block">City</span><strong className="text-slate-900">{cityName || '—'}</strong></div>
              <div><span className="text-slate-400 block">State</span><strong className="text-slate-900">{stateName || '—'}</strong></div>
              <div><span className="text-slate-400 block">Country</span><strong className="text-slate-900">{countryName || 'India'}</strong></div>
              <div><span className="text-slate-400 block">PIN</span><strong className="text-slate-900 font-mono">{address?.zipcode || '—'}</strong></div>
            </div>
          </div>

          {/* Achievements Box */}
          <div className="border border-slate-300 rounded-xl p-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-slate-700" />
              4. Achievements & Accolades
            </div>
            <p className="text-[9px] text-slate-700 leading-relaxed font-medium">
              {teacher?.achievements || 'No specific achievements or honors recorded in staff profile.'}
            </p>
          </div>
        </div>

        {/* SECTION 4: OFFICIAL VERIFICATION & SIGNATURES */}
        <div className="border-2 border-slate-900 rounded-xl p-3 mt-4 print-avoid-break bg-slate-50/30">
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-800 text-center mb-6">
            Official Institution Authorization & Staff Record Verification
          </div>

          <div className="grid grid-cols-3 gap-6 text-center text-[10px]">
            {/* Faculty Signature */}
            <div className="flex flex-col justify-end">
              <div className="border-b border-dashed border-slate-800 pb-1 mb-1 font-bold text-slate-900 font-mono">
                &nbsp;
              </div>
              <span className="font-bold text-slate-900">Faculty Member Signature</span>
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
            CONFIDENTIAL & PROPRIETARY • AUTHENTICATED FACULTY RECORD • ISSUED BY {schoolName || 'SCHOOL CRM'}
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
    indigo: 'border-indigo-300/80 dark:border-indigo-800/50 bg-indigo-50/40 dark:bg-indigo-950/10',
    emerald: 'border-emerald-300/80 dark:border-emerald-800/50 bg-emerald-50/40 dark:bg-emerald-950/10',
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

TeacherDossierModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  detail: PropTypes.object,
  countryData: PropTypes.array,
  stateData: PropTypes.array,
  cityData: PropTypes.array,
  allClasses: PropTypes.array,
  allSections: PropTypes.array,
  allSubjects: PropTypes.array,
  classData: PropTypes.array,
  rolePriority: PropTypes.number,
};

export default TeacherDossierModal;
