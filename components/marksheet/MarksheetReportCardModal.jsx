import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  X, Printer, Award, BookOpen, School, Loader2,
  FileSpreadsheet, ShieldCheck
} from 'lucide-react';
import API from '../../apis';
import { Utility } from '../utility';

const MarksheetReportCardModal = ({
  open,
  setOpen,
  detail = null,
  allSubjects = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [mappingData, setMappingData] = useState([]);

  const allSchools = useSelector((state) => state.allSchools);
  const { findById, appendSuffix, capitalizeEveryWord, getLocalStorage } = Utility();
  const schoolInfo = getLocalStorage('schoolInfo') || {};
  const authInfo = getLocalStorage('auth') || {};

  const activeSchool = allSchools?.listData?.find(
    (s) => s.id === detail?.school_id || s.id === schoolInfo?.id
  ) || schoolInfo || allSchools?.listData?.[0];

  const schoolName = activeSchool?.name || activeSchool?.school_name || schoolInfo?.name || schoolInfo?.school_name || authInfo?.school || 'School Name';
  const schoolAddress = activeSchool?.address || schoolInfo?.address || '';

  const coData = useMemo(() => {
    if (!detail?.co_scholastic_data) return {};
    if (typeof detail.co_scholastic_data === 'string') {
      try {
        return JSON.parse(detail.co_scholastic_data);
      } catch {
        return {};
      }
    }
    return detail.co_scholastic_data || {};
  }, [detail?.co_scholastic_data]);

  const disData = useMemo(() => {
    if (!detail?.discipline_data) return {};
    if (typeof detail.discipline_data === 'string') {
      try {
        return JSON.parse(detail.discipline_data);
      } catch {
        return {};
      }
    }
    return detail.discipline_data || {};
  }, [detail?.discipline_data]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  useEffect(() => {
    if (open && detail?.id) {
      setLoading(true);
      API.MarksheetAPI.getMarksheetData(detail.id)
        .then((res) => {
          setMappingData(res?.data || res || []);
          setLoading(false);
        })
        .catch(() => {
          setMappingData([]);
          setLoading(false);
        });
    } else {
      setMappingData([]);
    }
  }, [open, detail?.id]);

  const stats = useMemo(() => {
    let totalObtained = 0;
    let totalMax = 0;
    let evaluatedCount = 0;
    let passedCount = 0;
    let failedCount = 0;

    (mappingData || []).forEach((row) => {
      const obtained = parseFloat(row.marks_obtained ?? row.marks);
      const max = parseFloat(row.total_marks ?? row.max_marks);
      const hasMarks = !isNaN(obtained);
      const hasMax = !isNaN(max) && max > 0;

      if (hasMarks && hasMax) {
        evaluatedCount++;
        totalObtained += obtained;
        totalMax += max;
        const percentage = (obtained / max) * 100;
        if (row.result === 'fail' || percentage < 33) {
          failedCount++;
        } else {
          passedCount++;
        }
      }
    });

    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : null;

    let calculatedGrade = '—';
    if (percentage !== null) {
      if (percentage >= 90) calculatedGrade = 'A+';
      else if (percentage >= 80) calculatedGrade = 'A';
      else if (percentage >= 70) calculatedGrade = 'B';
      else if (percentage >= 60) calculatedGrade = 'C';
      else if (percentage >= 50) calculatedGrade = 'D';
      else if (percentage >= 33) calculatedGrade = 'E';
      else calculatedGrade = 'F';
    }

    return {
      totalObtained,
      totalMax,
      percentage,
      evaluatedCount,
      passedCount,
      failedCount,
      calculatedGrade,
    };
  }, [mappingData]);

  const handlePrint = () => {
    window.print();
  };

  if (!open) return null;

  const rawClassName = detail?.class_name || (detail?.class_id ? `Class ${detail.class_id}` : '');
  const formattedClass = rawClassName
    ? !isNaN(Number(rawClassName))
      ? appendSuffix(rawClassName)
      : rawClassName
    : '—';
  const rawSectionName = detail?.section_name || (detail?.section_id ? `Sec ${detail.section_id}` : '');
  const formattedSection = rawSectionName
    ? rawSectionName.toLowerCase().startsWith('sec')
      ? rawSectionName
      : `Sec ${rawSectionName}`
    : '';

  const issueDateFormatted = detail?.created_at
    ? new Date(detail.created_at).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    : new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const isPass = (detail?.result || '').toLowerCase() === 'pass';

  const cumulativeRemark =
    detail?.overall_remark ||
    detail?.remark ||
    mappingData?.find((m) => m.remark)?.remark ||
    'Demonstrates consistent scholastic aptitude, good participation, and disciplined conduct.';

  return (
    <>
      {/* ── GLOBAL PRINT CSS RULES ─────────────────────────────────────── */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          body {
            background: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide all app wrapper elements and show ONLY the marksheet print root */
          body > * {
            visibility: hidden !important;
          }
          #marksheet-report-card-print-root,
          #marksheet-report-card-print-root * {
            visibility: visible !important;
          }
          #marksheet-report-card-print-root {
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
      <div className="print:hidden fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
        {/* Backdrop click to close */}
        <div
          className="fixed inset-0"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-4xl bg-white dark:bg-[#121212] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 z-10">

          {/* Modal Header Bar */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-[#181818]/90 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Official Academic Marksheet & Report Card
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                    {detail?.session || 'Current Session'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Verified candidate performance transcript & grade distribution
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-600/20 cursor-pointer active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
              <button
                onClick={() => setOpen(false)}
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Modal Content */}
          <div className="overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 flex-1 bg-slate-50/50 dark:bg-[#101010]">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-xs font-semibold">Generating Academic Report Card...</p>
              </div>
            ) : (
              /* Report Card Sheet */
              <div className="bg-white text-slate-900 border-2 border-indigo-950/40 rounded-xl p-6 sm:p-8 shadow-sm">

                {/* 1. School Header */}
                <div className="text-center pb-4 border-b-2 border-indigo-950/80 space-y-1">
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <div className="w-12 h-12 rounded-full border-2 border-indigo-900 flex items-center justify-center text-indigo-900 font-extrabold text-xl bg-indigo-50 shrink-0">
                      <School className="w-7 h-7" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-indigo-950 leading-tight">
                        {schoolName}
                      </h1>
                      <p className="text-[11px] font-semibold tracking-wider text-slate-600 uppercase">
                        {schoolAddress || 'Affiliated to CBSE / State Education Board'}
                      </p>
                    </div>
                  </div>

                  <div className="inline-block px-4 py-1 rounded-full bg-indigo-900 text-white text-xs font-extrabold uppercase tracking-wider mt-1">
                    Academic Report Card & Evaluation Record ({detail?.session || '2025-2026'})
                  </div>
                </div>

                {/* 2. Candidate Profile */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs border-b border-indigo-900/30">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Candidate Name</span>
                    <p className="font-extrabold text-slate-900 text-sm capitalize">
                      {detail?.student_name || detail?.studentName || `Student #${detail?.student_id}`}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Class & Section</span>
                    <p className="font-bold text-slate-900">
                      {formattedClass} {formattedSection ? `• ${formattedSection}` : ''}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Roll No & Enrollment</span>
                    <p className="font-bold text-slate-900 leading-tight">
                      {detail?.roll_no && <span className="block">Roll No: {detail.roll_no}</span>}
                      {detail?.enrollment_no && <span className="block text-slate-600 font-semibold text-[11px]">Enroll: {detail.enrollment_no}</span>}
                      {!detail?.roll_no && !detail?.enrollment_no && <span>{detail?.student_id ? `ID: #${detail.student_id}` : '—'}</span>}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Examination Term</span>
                    <span className="inline-block px-2.5 py-0.5 bg-indigo-100 text-indigo-900 rounded font-extrabold text-xs">
                      Term {detail?.term || 'I'}
                    </span>
                  </div>
                </div>

                {/* 3. Part I Scholastic Performance */}
                <div className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-700" />
                      Part I: Scholastic Performance & Evaluation
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-500">Max Score Standard: 100 Marks</span>
                  </div>

                  <table className="w-full text-xs text-left border border-indigo-950/40 rounded-lg overflow-hidden">
                    <thead className="bg-indigo-900 text-white font-bold text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="p-2.5 border-r border-indigo-800 w-12 text-center">#</th>
                        <th className="p-2.5 border-r border-indigo-800">Subject</th>
                        <th className="p-2.5 border-r border-indigo-800 text-center w-28">Marks Obtained</th>
                        <th className="p-2.5 border-r border-indigo-800 text-center w-24">Max Marks</th>
                        <th className="p-2.5 border-r border-indigo-800 text-center w-20">Grade</th>
                        <th className="p-2.5 border-r border-indigo-800">Teacher Remarks</th>
                        <th className="p-2.5 text-center w-20">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-900/20 font-medium">
                      {mappingData && mappingData.length > 0 ? (
                        mappingData.map((row, idx) => {
                          const subjectObj = findById(row.subject_id, allSubjects);
                          const subjectName = subjectObj?.name || `Subject ${row.subject_id}`;
                          const obtained = row.marks_obtained ?? row.marks;
                          const max = row.total_marks ?? row.max_marks;
                          const grade = row.grade || '—';
                          const remark = row.remark || '—';
                          const res = (row.result || '').toLowerCase();

                          return (
                            <tr key={row.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-indigo-50/40'}>
                              <td className="p-2.5 text-center font-bold text-slate-500 border-r border-indigo-900/20">
                                {idx + 1}
                              </td>
                              <td className="p-2.5 font-bold text-slate-900 border-r border-indigo-900/20">
                                {subjectName}
                              </td>
                              <td className="p-2.5 text-center font-extrabold text-indigo-950 border-r border-indigo-900/20">
                                {obtained !== null && obtained !== undefined ? obtained : '—'}
                              </td>
                              <td className="p-2.5 text-center text-slate-600 border-r border-indigo-900/20">
                                {max !== null && max !== undefined ? max : '—'}
                              </td>
                              <td className="p-2.5 text-center font-black text-indigo-700 border-r border-indigo-900/20">
                                <span className="inline-block px-2 py-0.5 bg-indigo-100 rounded text-indigo-900">
                                  {grade}
                                </span>
                              </td>
                              <td className="p-2.5 text-slate-700 italic border-r border-indigo-900/20 truncate max-w-[180px]">
                                {remark}
                              </td>
                              <td className="p-2.5 text-center font-bold">
                                {res === 'pass' ? (
                                  <span className="text-emerald-700 font-extrabold">PASS</span>
                                ) : res === 'fail' ? (
                                  <span className="text-rose-700 font-extrabold">FAIL</span>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" className="p-6 text-center text-slate-400 italic">
                            No subject marks recorded for this marksheet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 4. Grand Aggregate Summary Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-indigo-50/70 border border-indigo-900/30 my-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Grand Total</span>
                    <p className="text-base font-black text-indigo-950">
                      {stats.evaluatedCount > 0 ? `${stats.totalObtained} / ${stats.totalMax}` : '—'}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Aggregate %</span>
                    <p className={`text-base font-black ${stats.percentage !== null && stats.percentage >= 33 ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                      {stats.percentage !== null ? `${stats.percentage.toFixed(1)}%` : '—'}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Overall Grade</span>
                    <p className="text-base font-black text-indigo-900">
                      {stats.calculatedGrade}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Final Outcome</span>
                    <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${isPass
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}>
                      {detail?.result ? capitalizeEveryWord(detail.result) : (isPass ? 'PASS' : 'FAIL')}
                    </span>
                  </div>
                </div>

                {/* 5. Co-Scholastic & Discipline Areas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                  {/* Co-Scholastic Table */}
                  <div className="border border-indigo-950/40 rounded-lg overflow-hidden">
                    <div className="bg-indigo-900 text-white font-bold text-[10px] uppercase tracking-wider p-2 flex justify-between">
                      <span>Part II: Co-Scholastic Areas (3-Point Scale A-C)</span>
                      <span>Grade</span>
                    </div>
                    <table className="w-full text-xs divide-y divide-indigo-900/10 font-medium">
                      <tbody>
                        <tr className="bg-white">
                          <td className="p-2 text-slate-800 border-r border-indigo-900/10">Work Education (Cookery/Craft)</td>
                          <td className="p-2 text-center font-bold text-indigo-900 w-16">{coData?.work_edu || '—'}</td>
                        </tr>
                        <tr className="bg-indigo-50/30">
                          <td className="p-2 text-slate-800 border-r border-indigo-900/10">Art & Cultural Education</td>
                          <td className="p-2 text-center font-bold text-indigo-900 w-16">{coData?.art || '—'}</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="p-2 text-slate-800 border-r border-indigo-900/10">Health & Physical Education (Sports)</td>
                          <td className="p-2 text-center font-bold text-indigo-900 w-16">{coData?.sports || '—'}</td>
                        </tr>
                        <tr className="bg-indigo-50/30">
                          <td className="p-2 text-slate-800 border-r border-indigo-900/10">General Knowledge & Social Skills</td>
                          <td className="p-2 text-center font-bold text-indigo-900 w-16">{coData?.gk || '—'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Discipline & Attendance */}
                  <div className="border border-indigo-950/40 rounded-lg overflow-hidden">
                    <div className="bg-indigo-900 text-white font-bold text-[10px] uppercase tracking-wider p-2 flex justify-between">
                      <span>Part III: Discipline & Attendance Record</span>
                      <span>Assessment</span>
                    </div>
                    <table className="w-full text-xs divide-y divide-indigo-900/10 font-medium">
                      <tbody>
                        <tr className="bg-white">
                          <td className="p-2 text-slate-800 border-r border-indigo-900/10">Regularity & Punctuality</td>
                          <td className="p-2 text-center font-bold text-emerald-800 w-28">{disData?.punctuality || '—'}</td>
                        </tr>
                        <tr className="bg-indigo-50/30">
                          <td className="p-2 text-slate-800 border-r border-indigo-900/10">Sincerity, Behavior & Values</td>
                          <td className="p-2 text-center font-bold text-emerald-800 w-28">{disData?.behavior || '—'}</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="p-2 text-slate-800 border-r border-indigo-900/10">Attitude towards Teachers & Peers</td>
                          <td className="p-2 text-center font-bold text-emerald-800 w-28">{disData?.attitude || '—'}</td>
                        </tr>
                        <tr className="bg-indigo-50/30">
                          <td className="p-2 text-slate-800 border-r border-indigo-900/10">Session Attendance</td>
                          <td className="p-2 text-center font-bold text-indigo-900 w-28">
                            {disData?.attendance ? (String(disData.attendance).includes('%') ? disData.attendance : `${disData.attendance}%`) : '—'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 6. Cumulative Remarks */}
                <div className="p-3.5 bg-slate-50 border border-indigo-900/20 rounded-lg text-xs space-y-1.5 my-3">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="uppercase text-[10px] tracking-wider text-indigo-950 font-black">Class Teacher's Cumulative Remarks:</span>
                    <span className="text-[10px] font-semibold text-emerald-700">
                      {isPass ? 'PROMOTED TO NEXT ACADEMIC CLASS' : 'NEEDS IMPROVEMENT / DETAINED'}
                    </span>
                  </div>
                  <p className="text-slate-700 italic font-medium pl-1 border-l-2 border-indigo-600">
                    {cumulativeRemark}
                  </p>
                </div>

                {/* 7. Standard Grading Legend */}
                <div className="pt-2 pb-4 text-[10px] text-slate-600">
                  <div className="font-bold uppercase tracking-wider text-slate-500 mb-1">Standard Grading Reference Scale:</div>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 text-center font-semibold">
                    <div className="p-1 bg-slate-100 rounded border border-slate-200">91-100: A+</div>
                    <div className="p-1 bg-slate-100 rounded border border-slate-200">81-90: A</div>
                    <div className="p-1 bg-slate-100 rounded border border-slate-200">71-80: B</div>
                    <div className="p-1 bg-slate-100 rounded border border-slate-200">61-70: C</div>
                    <div className="p-1 bg-slate-100 rounded border border-slate-200">51-60: D</div>
                    <div className="p-1 bg-slate-100 rounded border border-slate-200">33-50: E</div>
                    <div className="p-1 bg-slate-100 rounded border border-slate-200">&lt;33: Fail</div>
                  </div>
                </div>

                {/* 8. Official Signatures & Seal */}
                <div className="grid grid-cols-3 gap-6 pt-10 mt-6 border-t-2 border-indigo-950/30 text-center text-xs">
                  <div className="space-y-1">
                    <div className="h-8 border-b border-dashed border-slate-400"></div>
                    <span className="font-bold text-slate-800 block uppercase tracking-wider text-[11px]">Class Teacher</span>
                    <span className="text-[10px] text-slate-400">Signature</span>
                  </div>

                  <div className="space-y-1">
                    <div className="h-8 border-b border-dashed border-slate-400"></div>
                    <span className="font-bold text-slate-800 block uppercase tracking-wider text-[11px]">Parent / Guardian</span>
                    <span className="text-[10px] text-slate-400">Signature</span>
                  </div>

                  <div className="space-y-1">
                    <div className="h-8 border-b border-dashed border-slate-400 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-indigo-900/60 uppercase tracking-widest">[ OFFICIAL SEAL ]</span>
                    </div>
                    <span className="font-extrabold text-indigo-950 block uppercase tracking-wider text-[11px]">Principal / Exam Controller</span>
                    <span className="text-[10px] text-slate-500">Issued Date: {issueDateFormatted}</span>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── DEDICATED FULL PRINTABLE A4 MARKSHEET (VISIBLE ONLY ON PRINT) ─── */}
      <div id="marksheet-report-card-print-root" className="hidden print:block w-full text-slate-900 bg-white font-sans text-xs">
        <div className="border-2 border-indigo-950 rounded-xl p-6 bg-white space-y-4">

          {/* Print 1: School Header with Crest */}
          <div className="text-center pb-3 border-b-2 border-indigo-950 space-y-1 print-avoid-break">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-full border-2 border-indigo-900 flex items-center justify-center text-indigo-900 font-extrabold text-xl bg-indigo-50 shrink-0">
                <School className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight uppercase text-indigo-950 leading-tight">
                  {schoolName}
                </h1>
                <p className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">
                  {schoolAddress || 'Affiliated to CBSE / State Education Board'}
                </p>
              </div>
            </div>

            <div className="inline-block px-4 py-1 rounded-full bg-indigo-950 text-white text-xs font-black uppercase tracking-wider mt-1">
              Academic Report Card & Evaluation Record ({detail?.session || '2025-2026'})
            </div>
          </div>

          {/* Print 2: Candidate Profile Grid */}
          <div className="grid grid-cols-4 gap-3 py-3 text-xs border-b border-indigo-950/40 print-avoid-break">
            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Candidate Name</span>
              <p className="font-extrabold text-slate-950 text-sm capitalize">
                {detail?.student_name || detail?.studentName || `Student #${detail?.student_id}`}
              </p>
            </div>

            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Class & Section</span>
              <p className="font-bold text-slate-950">
                {formattedClass} {formattedSection ? `• ${formattedSection}` : ''}
              </p>
            </div>

            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Roll No & Enrollment</span>
              <p className="font-bold text-slate-950 leading-tight">
                {detail?.roll_no && <span className="block">Roll No: {detail.roll_no}</span>}
                {detail?.enrollment_no && <span className="block text-slate-700 font-bold text-[10px]">Enroll: {detail.enrollment_no}</span>}
                {!detail?.roll_no && !detail?.enrollment_no && <span>{detail?.student_id ? `ID: #${detail.student_id}` : '—'}</span>}
              </p>
            </div>

            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Examination Term</span>
              <span className="inline-block px-2.5 py-0.5 bg-indigo-100 text-indigo-950 rounded font-black text-xs">
                Term {detail?.term || 'I'}
              </span>
            </div>
          </div>

          {/* Print 3: Scholastic Performance Table */}
          <div className="space-y-1.5 print-avoid-break">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-800" />
                Part I: Scholastic Performance & Evaluation
              </h4>
              <span className="text-[10px] font-bold text-slate-600">Standard Max Score: 100 Marks</span>
            </div>

            <table className="w-full text-xs text-left border border-indigo-950 rounded-lg overflow-hidden">
              <thead className="bg-indigo-950 text-white font-bold text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="p-2 border-r border-indigo-800 w-10 text-center">#</th>
                  <th className="p-2 border-r border-indigo-800">Subject</th>
                  <th className="p-2 border-r border-indigo-800 text-center w-24">Marks Obtained</th>
                  <th className="p-2 border-r border-indigo-800 text-center w-20">Max Marks</th>
                  <th className="p-2 border-r border-indigo-800 text-center w-16">Grade</th>
                  <th className="p-2 border-r border-indigo-800">Teacher Remarks</th>
                  <th className="p-2 text-center w-16">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-950/20 font-medium">
                {mappingData && mappingData.length > 0 ? (
                  mappingData.map((row, idx) => {
                    const subjectObj = findById(row.subject_id, allSubjects);
                    const subjectName = subjectObj?.name || `Subject ${row.subject_id}`;
                    const obtained = row.marks_obtained ?? row.marks;
                    const max = row.total_marks ?? row.max_marks;
                    const grade = row.grade || '—';
                    const remark = row.remark || '—';
                    const res = (row.result || '').toLowerCase();

                    return (
                      <tr key={row.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="p-2 text-center font-bold text-slate-600 border-r border-indigo-950/20">
                          {idx + 1}
                        </td>
                        <td className="p-2 font-bold text-slate-950 border-r border-indigo-950/20">
                          {subjectName}
                        </td>
                        <td className="p-2 text-center font-black text-indigo-950 border-r border-indigo-950/20">
                          {obtained !== null && obtained !== undefined ? obtained : '—'}
                        </td>
                        <td className="p-2 text-center text-slate-700 font-bold border-r border-indigo-950/20">
                          {max !== null && max !== undefined ? max : '—'}
                        </td>
                        <td className="p-2 text-center font-black text-indigo-950 border-r border-indigo-950/20">
                          <span className="inline-block px-1.5 py-0.5 bg-indigo-100 rounded text-indigo-950 font-black">
                            {grade}
                          </span>
                        </td>
                        <td className="p-2 text-slate-800 italic border-r border-indigo-950/20">
                          {remark}
                        </td>
                        <td className="p-2 text-center font-black">
                          {res === 'pass' ? (
                            <span className="text-emerald-800 font-black">PASS</span>
                          ) : res === 'fail' ? (
                            <span className="text-rose-800 font-black">FAIL</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="p-4 text-center text-slate-500 italic">
                      No subject marks recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Print 4: Grand Aggregate Summary Bar */}
          <div className="grid grid-cols-4 gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-950/30 print-avoid-break">
            <div>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider block">Grand Total</span>
              <p className="text-sm font-black text-indigo-950">
                {stats.evaluatedCount > 0 ? `${stats.totalObtained} / ${stats.totalMax}` : '—'}
              </p>
            </div>

            <div>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider block">Aggregate %</span>
              <p className="text-sm font-black text-emerald-800">
                {stats.percentage !== null ? `${stats.percentage.toFixed(1)}%` : '—'}
              </p>
            </div>

            <div>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider block">Overall Grade</span>
              <p className="text-sm font-black text-indigo-950">
                {stats.calculatedGrade}
              </p>
            </div>

            <div>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider block">Final Outcome</span>
              <span className="inline-block px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                {detail?.result ? capitalizeEveryWord(detail.result) : (isPass ? 'PASS' : 'FAIL')}
              </span>
            </div>
          </div>

          {/* Print 5: Co-Scholastic & Discipline Sections */}
          <div className="grid grid-cols-2 gap-3 print-avoid-break">
            {/* Co-Scholastic Table */}
            <div className="border border-indigo-950/40 rounded-lg overflow-hidden">
              <div className="bg-indigo-950 text-white font-bold text-[9px] uppercase tracking-wider p-1.5 flex justify-between">
                <span>Part II: Co-Scholastic Areas (A-C)</span>
                <span>Grade</span>
              </div>
              <table className="w-full text-xs divide-y divide-indigo-950/20 font-medium">
                <tbody>
                  <tr className="bg-white">
                    <td className="p-1.5 text-slate-900 border-r border-indigo-950/20">Work Education (Cookery/Craft)</td>
                    <td className="p-1.5 text-center font-black text-indigo-950 w-14">{coData?.work_edu || '—'}</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-1.5 text-slate-900 border-r border-indigo-950/20">Art & Cultural Education</td>
                    <td className="p-1.5 text-center font-black text-indigo-950 w-14">{coData?.art || '—'}</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-1.5 text-slate-900 border-r border-indigo-950/20">Health & Physical Education (Sports)</td>
                    <td className="p-1.5 text-center font-black text-indigo-950 w-14">{coData?.sports || '—'}</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-1.5 text-slate-900 border-r border-indigo-950/20">General Knowledge & Social Skills</td>
                    <td className="p-1.5 text-center font-black text-indigo-950 w-14">{coData?.gk || '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Discipline & Attendance Table */}
            <div className="border border-indigo-950/40 rounded-lg overflow-hidden">
              <div className="bg-indigo-950 text-white font-bold text-[9px] uppercase tracking-wider p-1.5 flex justify-between">
                <span>Part III: Discipline & Attendance Record</span>
                <span>Assessment</span>
              </div>
              <table className="w-full text-xs divide-y divide-indigo-950/20 font-medium">
                <tbody>
                  <tr className="bg-white">
                    <td className="p-1.5 text-slate-900 border-r border-indigo-950/20">Regularity & Punctuality</td>
                    <td className="p-1.5 text-center font-bold text-emerald-800 w-24">{disData?.punctuality || '—'}</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-1.5 text-slate-900 border-r border-indigo-950/20">Sincerity, Behavior & Values</td>
                    <td className="p-1.5 text-center font-bold text-emerald-800 w-24">{disData?.behavior || '—'}</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-1.5 text-slate-900 border-r border-indigo-950/20">Attitude towards Teachers & Peers</td>
                    <td className="p-1.5 text-center font-bold text-emerald-800 w-24">{disData?.attitude || '—'}</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-1.5 text-slate-900 border-r border-indigo-950/20">Session Attendance</td>
                    <td className="p-1.5 text-center font-bold text-indigo-950 w-24">
                      {disData?.attendance ? (String(disData.attendance).includes('%') ? disData.attendance : `${disData.attendance}%`) : '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Print 6: Cumulative Remarks */}
          <div className="p-2.5 bg-slate-50 border border-indigo-950/30 rounded-lg text-xs space-y-1 print-avoid-break">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span className="uppercase text-[9px] tracking-wider text-indigo-950 font-black">Class Teacher's Cumulative Remarks:</span>
              <span className="text-[9px] font-black text-emerald-800">
                {isPass ? 'PROMOTED TO NEXT ACADEMIC CLASS' : 'NEEDS IMPROVEMENT / DETAINED'}
              </span>
            </div>
            <p className="text-slate-800 italic font-medium pl-1 border-l-2 border-indigo-900">
              {cumulativeRemark}
            </p>
          </div>

          {/* Print 7: Standard Grading Legend */}
          <div className="pt-1 text-[9px] text-slate-600 print-avoid-break">
            <div className="font-bold uppercase tracking-wider text-slate-600 mb-1">Standard Grading Reference Scale:</div>
            <div className="grid grid-cols-7 gap-1 text-center font-bold">
              <div className="p-1 bg-slate-100 rounded border border-slate-300">91-100: A+</div>
              <div className="p-1 bg-slate-100 rounded border border-slate-300">81-90: A</div>
              <div className="p-1 bg-slate-100 rounded border border-slate-300">71-80: B</div>
              <div className="p-1 bg-slate-100 rounded border border-slate-300">61-70: C</div>
              <div className="p-1 bg-slate-100 rounded border border-slate-300">51-60: D</div>
              <div className="p-1 bg-slate-100 rounded border border-slate-300">33-50: E</div>
              <div className="p-1 bg-slate-100 rounded border border-slate-300">&lt;33: Fail</div>
            </div>
          </div>

          {/* Print 8: Signatures & Seal */}
          <div className="grid grid-cols-3 gap-6 pt-6 mt-4 border-t-2 border-indigo-950/40 text-center text-xs print-avoid-break">
            <div className="space-y-1">
              <div className="h-6 border-b border-dashed border-slate-500"></div>
              <span className="font-bold text-slate-900 block uppercase tracking-wider text-[10px]">Class Teacher</span>
              <span className="text-[9px] text-slate-500">Signature</span>
            </div>

            <div className="space-y-1">
              <div className="h-6 border-b border-dashed border-slate-500"></div>
              <span className="font-bold text-slate-900 block uppercase tracking-wider text-[10px]">Parent / Guardian</span>
              <span className="text-[9px] text-slate-500">Signature</span>
            </div>

            <div className="space-y-1">
              <div className="h-6 border-b border-dashed border-slate-500 flex items-center justify-center">
                <span className="text-[8px] font-bold text-indigo-950 uppercase tracking-widest">[ OFFICIAL SEAL ]</span>
              </div>
              <span className="font-extrabold text-indigo-950 block uppercase tracking-wider text-[10px]">Principal / Exam Controller</span>
              <span className="text-[9px] text-slate-600">Issued Date: {issueDateFormatted}</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

MarksheetReportCardModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  detail: PropTypes.object,
  allSubjects: PropTypes.array,
};

export default MarksheetReportCardModal;

