/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  X, Printer, Edit, Copy, Check, Bus,
  User, IdCard, Navigation, Users, Radio
} from 'lucide-react';
import { Utility } from '../utility';
import { useNavigate } from '@/lib/routerAdapter';

const BusDossierModal = ({
  open,
  setOpen,
  detail,
  rolePriority = 2,
}) => {
  const [copiedField, setCopiedField] = useState(null);

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

  const bus = detail?.busData || {};

  const authUser = getLocalStorage('auth') || {};
  const schoolName = authUser?.school || authUser?.school_name || 'School Fleet Portal';
  const schoolCode = authUser?.school_code || '';

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
    if (bus?.id) {
      setOpen(false);
      navigateTo(`/bus/update/${bus.id}`, {
        state: { id: bus.id }
      });
    }
  };

  if (!open) return null;

  const isActive = bus?.status === 'active';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#262626] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-800 p-6 sm:p-8 text-white shrink-0">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner shrink-0">
                <Bus className="w-9 h-9 sm:w-11 sm:h-11 text-amber-200" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400 text-amber-950 shadow-xs">
                    Fleet Dossier
                  </span>
                  <span className="text-xs font-semibold text-amber-100/90 font-mono">
                    {schoolName} {schoolCode ? `• ${schoolCode}` : ''}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1 font-mono">
                  {bus?.registration_no || 'Registration Pending'}
                </h2>
                <p className="text-xs sm:text-sm text-amber-100/80 font-medium flex items-center gap-1.5 mt-0.5">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Route: {bus?.route ? capitalizeEveryWord(bus.route) : 'General School Route'}</span>
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={handlePrint}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md transition-all border border-white/15 cursor-pointer shadow-xs"
                title="Print Bus Dossier"
              >
                <Printer className="w-4 h-4" />
              </button>

              {rolePriority > 1 && (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white text-amber-900 hover:bg-amber-50 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer"
                  title="Edit Bus"
                >
                  <Edit className="w-3.5 h-3.5 text-amber-700" />
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
          
          {/* Status & Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#262626] flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fleet Status</span>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  isActive 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/40' 
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-300/60 dark:border-rose-800/40'
                }`}>
                  {isActive ? 'Active Service' : 'Out of Service'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#262626] flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Seating Capacity</span>
              <div className="mt-2 font-mono text-sm font-black text-slate-800 dark:text-slate-100">
                {bus?.capacity ? `${bus.capacity} Seats` : 'Standard'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#262626] flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned Route</span>
              <div className="mt-2 font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                {bus?.route ? capitalizeEveryWord(bus.route) : 'Standard Route'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#262626] flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">GPS Tracker ID</span>
              <div className="mt-2 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">
                {bus?.gps_device_id || 'Not Installed'}
              </div>
            </div>
          </div>

          {/* 2-Column Core Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Driver Profile Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-[#262626] shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-[#282828]">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                    Primary Driver Information
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">Licensed driver & contact records</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-semibold">Driver Name:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {capitalizeEveryWord(bus?.driver) || '—'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-semibold">Phone Contact:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 dark:text-slate-100">
                    {bus?.driver_contact ? (
                      <>
                        <a href={`tel:${bus.driver_contact}`} className="hover:text-amber-600 underline">
                          {bus.driver_contact}
                        </a>
                        <button
                          onClick={() => handleCopy(bus.driver_contact, 'driver_phone')}
                          className="p-1 text-slate-400 hover:text-amber-600 rounded cursor-pointer"
                          title="Copy Phone"
                        >
                          {copiedField === 'driver_phone' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </>
                    ) : '—'}
                  </div>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-semibold">Driving License:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 dark:text-slate-100">
                    <span>{bus?.driver_license || '—'}</span>
                    {bus?.driver_license && (
                      <button
                        onClick={() => handleCopy(bus.driver_license, 'license')}
                        className="p-1 text-slate-400 hover:text-amber-600 rounded cursor-pointer"
                        title="Copy License"
                      >
                        {copiedField === 'license' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Conductor Profile Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-[#262626] shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-[#282828]">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                  <IdCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                    Conductor & Assistant Details
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">On-board transport assistant</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-semibold">Conductor Name:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {capitalizeEveryWord(bus?.conductor) || '—'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-semibold">Phone Contact:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 dark:text-slate-100">
                    {bus?.conductor_contact ? (
                      <>
                        <a href={`tel:${bus.conductor_contact}`} className="hover:text-indigo-600 underline">
                          {bus.conductor_contact}
                        </a>
                        <button
                          onClick={() => handleCopy(bus.conductor_contact, 'cond_phone')}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"
                          title="Copy Phone"
                        >
                          {copiedField === 'cond_phone' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </>
                    ) : '—'}
                  </div>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-semibold">Aadhaar / Gov ID:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 dark:text-slate-100">
                    <span>{bus?.conductor_aadhaar || '—'}</span>
                    {bus?.conductor_aadhaar && (
                      <button
                        onClick={() => handleCopy(bus.conductor_aadhaar, 'aadhaar')}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"
                        title="Copy Aadhaar"
                      >
                        {copiedField === 'aadhaar' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#151515] border-t border-slate-200/80 dark:border-[#242424] flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="font-mono">Verified School CRM Fleet Record</span>
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

BusDossierModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  detail: PropTypes.object,
  rolePriority: PropTypes.number
};

export default BusDossierModal;
