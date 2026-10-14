import React from "react";
import PropTypes from "prop-types";
import { X, Printer } from "lucide-react";

const PaperPrintPreviewModal = ({
  isOpen,
  onClose,
  paper,
  schoolName = "School Examination Board",
  className = "",
  sectionName = "",
  subjectName = "",
}) => {
  if (!isOpen || !paper) return null;

  let sections = [];
  try {
    if (typeof paper.sections_json === "string") {
      sections = JSON.parse(paper.sections_json);
    } else if (Array.isArray(paper.sections)) {
      sections = paper.sections;
    }
  } catch (e) {
    sections = [];
  }

  const handlePrint = () => {
    window.print();
  };

  const renderPaperContent = () => (
    <div className="bg-white text-black font-serif leading-relaxed">
      {/* Top School Header */}
      <div className="text-center pb-4 border-b-2 border-black space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider font-sans text-black">
          {schoolName}
        </h1>
        <h2 className="text-base sm:text-lg font-bold tracking-wide uppercase font-sans text-black">
          {paper.title || "Periodic Examination"}
        </h2>
        <div className="pt-1.5 flex flex-wrap items-center justify-center gap-3 text-xs font-sans font-bold text-black">
          {className && <span>Class: {className}</span>}
          {className && sectionName && <span>•</span>}
          {sectionName && <span>Section: {sectionName}</span>}
          {subjectName && <span>•</span>}
          {subjectName && <span>Subject: {subjectName}</span>}
          <span>•</span>
          <span>Code: {paper.paper_code || "P-001"}</span>
        </div>
      </div>

      {/* Timing & Marks Bar */}
      <div className="py-2 border-b border-black flex items-center justify-between text-xs font-sans font-bold text-black">
        <div>
          <span>Time Allowed: </span>
          <span className="font-extrabold">{paper.duration_minutes || 60} Minutes</span>
        </div>
        <div>
          <span>Maximum Marks: </span>
          <span className="font-extrabold">{paper.max_marks || 100}</span>
        </div>
      </div>

      {/* General Instructions */}
      {paper.instructions && (
        <div className="my-4 p-3 rounded-lg border border-black text-xs font-sans text-black">
          <h3 className="font-bold uppercase tracking-wider text-[11px] mb-1 text-black">
            General Instructions:
          </h3>
          <p className="whitespace-pre-line leading-relaxed text-black text-[11px] sm:text-xs">
            {paper.instructions}
          </p>
        </div>
      )}

      {/* Sections & Questions */}
      <div className="space-y-6 mt-4">
        {sections.map((sec, sIdx) => {
          const secQuestions = sec.questions || sec.selectedQuestions || [];
          return (
            <div key={sec.id || sIdx} className="space-y-3 print-avoid-break">
              {/* Section Title Header */}
              <div className="text-center pb-1 border-b border-dashed border-black">
                <h3 className="text-sm font-black uppercase tracking-wider font-sans text-black">
                  {sec.title || `Section ${String.fromCharCode(65 + sIdx)}`}
                </h3>
                {sec.instructions && (
                  <p className="text-[11px] italic font-sans text-black mt-0.5">
                    ({sec.instructions})
                  </p>
                )}
              </div>

              {/* Question items */}
              <div className="space-y-4">
                {secQuestions.map((q, qIdx) => (
                  <div key={q.id || qIdx} className="space-y-1.5 text-xs sm:text-sm print-avoid-break">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-black flex-1 leading-snug">
                        <span className="font-bold font-sans mr-1.5">
                          Q{qIdx + 1}.
                        </span>
                        {q.question_text}
                      </p>
                      <span className="font-sans font-bold text-xs text-black shrink-0 ml-2">
                        [{q.max_marks || (q.mode === "MCQ" ? 1 : 5)}]
                      </span>
                    </div>

                    {/* MCQ Options */}
                    {q.mode === "MCQ" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 pl-5 pt-0.5 text-xs font-sans text-black">
                        {[
                          { label: "(A)", val: q.option_a },
                          { label: "(B)", val: q.option_b },
                          { label: "(C)", val: q.option_c },
                          { label: "(D)", val: q.option_d },
                        ]
                          .filter((o) => o.val)
                          .map((opt) => (
                            <div key={opt.label} className="flex items-start gap-1.5">
                              <span className="font-bold">{opt.label}</span>
                              <span>{opt.val}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Paper End Mark */}
      <div className="text-center pt-8 pb-4 text-xs font-sans font-bold text-black uppercase tracking-widest print-avoid-break">
        *** End of Question Paper ***
      </div>
    </div>
  );

  return (
    <>
      {/* ── GLOBAL PRINT CSS RULES (Hides all UI, Navbar, Sidebar, and Viewport) ── */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 15mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Completely hide entire app viewport (navbar, sidebar, cards, buttons) */
          body > * {
            visibility: hidden !important;
          }
          /* Show ONLY the isolated question paper print container */
          #exam-paper-print-root,
          #exam-paper-print-root * {
            visibility: visible !important;
          }
          #exam-paper-print-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .print-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* ── ON-SCREEN MODAL VIEW (COMPLETELY HIDDEN ON PRINT) ────────────────── */}
      <div className="print:hidden fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
        {/* Backdrop click to close */}
        <div
          className="fixed inset-0"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Container */}
        <div
          className="relative w-full max-w-4xl bg-white dark:bg-[#121212] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header Bar */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-[#181818]/90 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Official Examination Question Paper
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 font-mono">
                    {paper.paper_code || "EXAM-PAPER"}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {paper.title} • {schoolName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 cursor-pointer active:scale-95"
                title="Print this examination paper"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Paper</span>
              </button>
              <button
                onClick={onClose}
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                title="Close window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* On-screen Paper Preview Body */}
          <div className="p-8 sm:p-12 overflow-y-auto flex-1 bg-white text-slate-950 custom-scrollbar">
            {renderPaperContent()}
          </div>
        </div>
      </div>

      {/* ── PRINT-ONLY ISOLATED RENDER ROOT (SHOWN ONLY ON PRINT) ──────────── */}
      <div id="exam-paper-print-root" className="hidden print:block bg-white text-black p-0 m-0">
        {renderPaperContent()}
      </div>
    </>
  );
};

PaperPrintPreviewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  paper: PropTypes.object,
  schoolName: PropTypes.string,
  className: PropTypes.string,
  sectionName: PropTypes.string,
  subjectName: PropTypes.string,
};

export default PaperPrintPreviewModal;
