/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  X, Printer, Edit, Calendar, Clock, Sparkles,
  School, AlertCircle, FileText, CheckCircle2, ArrowRight
} from 'lucide-react';
import { Utility } from '../utility';
import { useNavigate } from '@/lib/routerAdapter';

const HolidayDossierModal = ({
  open,
  setOpen,
  detail,
  rolePriority = 2,
}) => {
  const navigateTo = useNavigate();
  const { capitalizeEveryWord, formatDate, getLocalStorage } = Utility();

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

  const holiday = detail?.holidayData || detail || {};

  const authUser = getLocalStorage('auth') || {};
  const schoolName = authUser?.school || authUser?.school_name || 'Academic Calendar Notice';
  const schoolCode = authUser?.school_code || '';

  // Calculate Duration in Days & Reopening Date
  const { totalDays, reopeningDate } = useMemo(() => {
    if (!holiday?.startDate || !holiday?.endDate) {
      return { totalDays: 1, reopeningDate: 'Next Working Day' };
    }
    const start = new Date(holiday.startDate);
    const end = new Date(holiday.endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { totalDays: 1, reopeningDate: 'Next Working Day' };
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const reopen = new Date(end);
    reopen.setDate(reopen.getDate() + 1);

    return {
      totalDays: diffDays > 0 ? diffDays : 1,
      reopeningDate: formatDate(reopen.toISOString())
    };
  }, [holiday?.startDate, holiday?.endDate, formatDate]);

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    if (holiday?.id) {
      setOpen(false);
      navigateTo(`/holiday/update/${holiday.id}`, {
        state: { id: holiday.id }
      });
    }
  };

  if (!open) return null;

  const type = holiday?.type || 'school_closure';
  const typeFormatted = type.split('_').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

  let typeBadgeStyle = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/50';
  if (type === 'partial_closure') {
    typeBadgeStyle = 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/50';
  } else if (type === 'staff_only') {
    typeBadgeStyle = 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/50';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#262626] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Banner */}
        <div className="relative bg-gradient-to-r from-rose-600 via-rose-700 to-amber-700 p-6 sm:p-8 text-white shrink-0">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner shrink-0">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-amber-200" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400 text-amber-950 shadow-xs">
                    Holiday Circular
                  </span>
                  <span className="text-xs font-semibold text-rose-100/90 font-mono">
                    {schoolName} {schoolCode ? `• ${schoolCode}` : ''}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                  {capitalizeEveryWord(holiday?.title) || 'Scheduled Holiday'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${typeBadgeStyle}`}>
                    {typeFormatted}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={handlePrint}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md transition-all border border-white/15 cursor-pointer shadow-xs"
                title="Print Circular"
              >
                <Printer className="w-4 h-4" />
              </button>

              {rolePriority > 1 && (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white text-rose-900 hover:bg-rose-50 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer"
                  title="Edit Holiday"
                >
                  <Edit className="w-3.5 h-3.5 text-rose-700" />
                  <span>Edit</span>
                </button>
              )}

              <button
                onClick={handleClose}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md transition-all border border-white/15 cursor-pointer shadow-xs ml-1"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-100">
          
          {/* Calendar Duration Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#262626] flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                From Date
              </span>
              <div className="mt-2 font-mono text-sm font-black text-slate-800 dark:text-slate-100">
                {holiday?.startDate ? formatDate(holiday.startDate) : '—'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#262626] flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                To Date
              </span>
              <div className="mt-2 font-mono text-sm font-black text-slate-800 dark:text-slate-100">
                {holiday?.endDate ? formatDate(holiday.endDate) : '—'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#262626] flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Total Duration
              </span>
              <div className="mt-2 font-black text-sm text-amber-700 dark:text-amber-400">
                {totalDays} {totalDays === 1 ? 'Day' : 'Days'} Break
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#262626] flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-emerald-500" />
                School Reopens
              </span>
              <div className="mt-2 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 truncate">
                {reopeningDate}
              </div>
            </div>

          </div>

          {/* Core Notice Instructions Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-[#262626] shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-[#282828]">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                  Official Notice & Administrative Notes
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Instructions for students, teachers, and parents</p>
              </div>
            </div>

            <div className="pt-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-line bg-slate-50/70 dark:bg-[#141414] p-4 rounded-xl border border-slate-100 dark:border-[#222]">
              {holiday?.notes || 'No special administrative notes recorded for this holiday.'}
            </div>
          </div>

          {/* Applicable Audience Guidance */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#262626] flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-slate-800 dark:text-slate-200">Applicability Policy:</span>
              <p>
                {type === 'school_closure' && 'All academic classes, school transport buses, and administrative offices remain completely closed.'}
                {type === 'partial_closure' && 'Applies to designated batches or senior classes. Verify with the respective class coordinators.'}
                {type === 'staff_only' && 'Holiday for students only. All academic and administrative staff must report for duty / training sessions.'}
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#151515] border-t border-slate-200/80 dark:border-[#242424] flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="font-mono">Official School Calendar Schedule</span>
          <button
            onClick={handleClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-[#282828] dark:hover:bg-[#333] text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

HolidayDossierModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  detail: PropTypes.object,
  rolePriority: PropTypes.number
};

export default HolidayDossierModal;
