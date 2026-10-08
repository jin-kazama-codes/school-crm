/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  X, Printer, Edit, Copy, Check, User, Calendar, MapPin,
  Phone, Mail, Shield, School, Building, Briefcase, Clock, FileText, UserCheck
} from 'lucide-react';
import { Utility } from '../utility';
import { useNavigate } from '@/lib/routerAdapter';

const EmployeeDossierModal = ({
  open,
  setOpen,
  detail,
  countryData = [],
  stateData = [],
  cityData = [],
  rolePriority = 2,
}) => {
  const [copiedField, setCopiedField] = useState(null);

  const navigateTo = useNavigate();
  const { findById, capitalizeEveryWord, formatDate, getLocalStorage } = Utility();

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

  const employee = detail?.employeeData || {};
  const address = detail?.addressData || {};

  const authUser = getLocalStorage('auth') || {};
  const schoolName = authUser?.school || authUser?.school_name || 'Delhi Public School';
  const schoolCode = authUser?.school_code || '';

  // Age calculation
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

  const ageText = calculateAge(employee?.dob);

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
      stateName ? `${stateName} - ${address?.zipcode || ''}`.trim() : null,
      countryName
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'No address provided';
  }, [address, cityName, stateName, countryName]);

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
    if (employee?.id) {
      setOpen(false);
      navigateTo(`/employee/update/${employee.id}`, {
        state: { id: employee.id }
      });
    }
  };

  if (!open) return null;

  const isActive = (employee?.status || 'active').toLowerCase() === 'active';
  const genderDisplay = employee?.gender ? capitalizeEveryWord(employee.gender) : 'Not Specified';
  const roleDisplay = employee?.role ? capitalizeEveryWord(employee.role) : 'Support Staff';
  const fullName = `${capitalizeEveryWord(employee?.firstname) || ''} ${capitalizeEveryWord(employee?.lastname) || ''}`.trim() || 'Unnamed Employee';

  const initials = `${(employee?.firstname?.[0] || '').toUpperCase()}${(employee?.lastname?.[0] || '').toUpperCase()}` || 'EM';

  return (
    <>
      {/* GLOBAL PRINT STYLES FOR EMPLOYEE DOSSIER */}
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
          #employee-dossier-print-root,
          #employee-dossier-print-root * {
            visibility: visible !important;
          }
          #employee-dossier-print-root {
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
                      Official Employee Register
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white mt-1">
                    {schoolName}
                  </h1>
                  <p className="text-xs text-slate-300 flex items-center gap-2">
                    <span>Staff Role: <strong className="text-white">{roleDisplay}</strong></span>
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    <span>Employee ID: <strong className="text-white font-mono">#{employee?.id || '—'}</strong></span>
                  </p>
                </div>
              </div>

              {/* Quick Action Header Controls */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-md transition-all border border-white/15 cursor-pointer shadow-sm active:scale-95"
                  title="Print Official Employee Dossier"
                >
                  <Printer className="w-4 h-4 text-emerald-300" />
                  <span className="hidden sm:inline">Print Record</span>
                </button>

                {rolePriority > 1 && (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/30 cursor-pointer active:scale-95"
                    title="Edit Employee Profile"
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

          {/* HERO PROFILE SUMMARY CARD */}
          <div className="p-5 sm:p-6 bg-slate-50 dark:bg-[#111] border-b border-slate-200 dark:border-[#1e1e1e]">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">

              {/* Left: Avatar Monogram & Primary Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 w-full lg:w-auto flex-1 min-w-0">
                <div className="relative group shrink-0">
                  <div className="w-28 h-34 sm:w-32 sm:h-38 rounded-2xl overflow-hidden shadow-xl border-4 border-white dark:border-[#222] bg-gradient-to-br from-emerald-100 to-slate-200 dark:from-emerald-950/40 dark:to-slate-800 flex items-center justify-center relative">
                    <div className="text-3xl sm:text-4xl font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-display">
                      {initials}
                    </div>
                    {/* Ribbon Badge */}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-md">
                      Employee
                    </span>
                  </div>
                </div>

                {/* Title & Key Badges */}
                <div className="text-center sm:text-left space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <Briefcase className="w-3 h-3" />
                      {roleDisplay}
                    </span>

                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isActive
                        ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                        : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}>
                      {capitalizeEveryWord(employee?.status || 'Active')}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white capitalize truncate">
                    {fullName}
                  </h2>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {employee?.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {employee.email}
                      </span>
                    )}
                    {employee?.contact_no && (
                      <span className="inline-flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {String(employee.contact_no).split('.')[0]}
                      </span>
                    )}
                    {employee?.gender && (
                      <span className="inline-flex items-center gap-1 capitalize font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {employee.gender}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Quick Highlights Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
                {/* Staff Role */}
                <div
                  onClick={() => handleCopy(roleDisplay, 'role')}
                  className="p-3 bg-white dark:bg-[#161616] rounded-xl border border-slate-200/90 dark:border-[#262626] shadow-2xs hover:border-emerald-500/50 transition-all cursor-pointer group min-w-[120px]"
                  title="Click to copy Role"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <span>Role</span>
                    {copiedField === 'role' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </div>
                  <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                    {roleDisplay}
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="p-3 bg-white dark:bg-[#161616] rounded-xl border border-slate-200/90 dark:border-[#262626] shadow-2xs min-w-[110px]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    DOB
                  </div>
                  <div className="text-sm font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1 truncate">
                    {employee?.dob ? formatDate(employee.dob) : '—'}
                  </div>
                </div>

                {/* Registered Date */}
                <div className="p-3 bg-white dark:bg-[#161616] rounded-xl border border-slate-200/90 dark:border-[#262626] shadow-2xs col-span-2 sm:col-span-1 min-w-[130px]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Registered
                  </div>
                  <div className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1 truncate">
                    {employee?.created_at ? formatDate(employee.created_at) : '—'}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* SCROLLABLE DOSSIER BODY */}
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* CARD 1: PERSONAL PARTICULARS */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-slate-200/90 dark:border-[#282828] shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-[#242424]">
                  <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                    <User className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Personal Particulars & Identity
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Full Legal Name
                    </span>
                    <span className="block mt-0.5 font-bold text-slate-900 dark:text-slate-100">
                      {fullName}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Gender
                    </span>
                    <span className="block mt-0.5 font-semibold text-slate-800 dark:text-slate-200">
                      {genderDisplay}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Date of Birth (DOB)
                    </span>
                    <span className="block mt-0.5 font-semibold text-slate-800 dark:text-slate-200">
                      {employee?.dob ? `${formatDate(employee.dob)} ${ageText ? `(${ageText})` : ''}` : '—'}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Employment Status
                    </span>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-bold ${
                      isActive ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40' : 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40'
                    }`}>
                      {capitalizeEveryWord(employee?.status || 'Active')}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Primary Contact
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5 font-semibold font-mono text-slate-800 dark:text-slate-200">
                      <span>{employee?.contact_no || '—'}</span>
                      {employee?.contact_no && (
                        <button
                          onClick={() => handleCopy(employee?.contact_no, 'contact_no')}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          title="Copy Contact"
                        >
                          {copiedField === 'contact_no' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Registered Email
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5 font-medium text-slate-800 dark:text-slate-200 break-all">
                      <span>{employee?.email || '—'}</span>
                      {employee?.email && (
                        <button
                          onClick={() => handleCopy(employee?.email, 'email')}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          title="Copy Email"
                        >
                          {copiedField === 'email' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Created On
                    </span>
                    <span className="block mt-0.5 font-medium text-slate-600 dark:text-slate-400">
                      {employee?.created_at ? formatDate(employee.created_at) : '—'}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Last Updated
                    </span>
                    <span className="block mt-0.5 font-medium text-slate-600 dark:text-slate-400">
                      {employee?.updated_at ? formatDate(employee.updated_at) : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD 2: INSTITUTIONAL ROLE & ALLOCATION */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-slate-200/90 dark:border-[#282828] shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-[#242424]">
                  <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Institutional Role & Affiliation
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Designated Role / Occupation
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                        {roleDisplay}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Affiliated Institution / School
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5 font-medium text-slate-800 dark:text-slate-200">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{schoolName}</span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Internal Employee ID
                    </span>
                    <span className="block mt-0.5 font-mono text-slate-600 dark:text-slate-400">
                      #{employee?.id || '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD 3: RESIDENTIAL & MAILING ADDRESS (FULL WIDTH) */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#181818] border border-slate-200/90 dark:border-[#282828] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-[#242424]">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Residential & Mailing Address
                    </h3>
                  </div>

                  {fullAddress !== 'No address provided' && (
                    <button
                      onClick={() => handleCopy(fullAddress, 'address')}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#252525] rounded-lg transition-colors cursor-pointer"
                      title="Copy full address"
                    >
                      {copiedField === 'address' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Address</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Street Address
                    </span>
                    <span className="block mt-0.5 font-medium text-slate-800 dark:text-slate-200">
                      {address?.street || 'Not provided'}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Landmark
                    </span>
                    <span className="block mt-0.5 font-medium text-slate-800 dark:text-slate-200">
                      {address?.landmark || '—'}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Postal / Zip Code
                    </span>
                    <span className="block mt-0.5 font-semibold font-mono text-slate-800 dark:text-slate-200">
                      {address?.zipcode || '—'}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      City
                    </span>
                    <span className="block mt-0.5 font-semibold text-slate-800 dark:text-slate-200">
                      {cityName || '—'}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      State
                    </span>
                    <span className="block mt-0.5 font-semibold text-slate-800 dark:text-slate-200">
                      {stateName || '—'}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Country
                    </span>
                    <span className="block mt-0.5 font-semibold text-slate-800 dark:text-slate-200">
                      {countryName || 'India'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
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

      {/* DEDICATED FULL PRINTABLE A4 EMPLOYEE DOSSIER RECORD (VISIBLE ONLY ON PRINT) */}
      <div id="employee-dossier-print-root" className="hidden print:block w-full text-slate-900 bg-white font-sans text-xs">
        {/* OFFICIAL LETTERHEAD */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-xl border border-slate-400 flex items-center justify-center bg-slate-100 shrink-0">
              <School className="w-8 h-8 text-slate-800" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 block">
                Official Employee Register Dossier
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
              <div className="text-[8px] font-extrabold uppercase text-slate-500 tracking-wider">Employee ID</div>
              <div className="text-sm font-black font-mono text-slate-950">#{employee?.id || '—'}</div>
            </div>
          </div>
        </div>

        {/* PROFILE HERO */}
        <div className="border border-slate-300 rounded-xl p-3.5 mb-4 bg-slate-50/50 print-avoid-break">
          <div className="flex items-start gap-4">
            <div className="w-20 h-24 rounded-lg border-2 border-slate-400 bg-slate-200 shrink-0 flex items-center justify-center font-black text-2xl uppercase text-slate-700">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5 mb-2">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-slate-950 capitalize">
                    {fullName}
                  </h2>
                  <div className="text-[10px] text-slate-600 font-medium flex items-center gap-3 mt-0.5">
                    <span>Role: <strong className="text-slate-900">{roleDisplay}</strong></span>
                    <span>Status: <strong className="text-slate-900 uppercase">{employee?.status || 'Active'}</strong></span>
                    {employee?.gender && <span className="capitalize">Gender: <strong className="text-slate-900">{employee.gender}</strong></span>}
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-slate-900 text-white font-extrabold text-[10px] rounded-md uppercase tracking-wider">
                    {roleDisplay}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="border border-slate-200 rounded p-1.5 bg-white">
                  <span className="text-slate-500 block uppercase font-bold text-[8px]">Role</span>
                  <strong className="text-slate-900 font-bold text-[11px]">{roleDisplay}</strong>
                </div>
                <div className="border border-slate-200 rounded p-1.5 bg-white">
                  <span className="text-slate-500 block uppercase font-bold text-[8px]">Date of Birth</span>
                  <strong className="text-slate-900 font-mono text-[11px]">{employee?.dob ? formatDate(employee.dob) : '—'}</strong>
                </div>
                <div className="border border-slate-200 rounded p-1.5 bg-white">
                  <span className="text-slate-500 block uppercase font-bold text-[8px]">Contact</span>
                  <strong className="text-slate-900 font-mono text-[11px]">{employee?.contact_no || '—'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: PERSONAL PARTICULARS */}
        <div className="border border-slate-300 rounded-xl p-3 mb-3 print-avoid-break">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-700" />
            1. Personal Particulars & Identity
          </div>
          <table className="w-full text-[10px] text-left border-collapse">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-1 pr-2 text-slate-500 font-semibold w-1/4">Full Name:</td>
                <td className="py-1 text-slate-900 font-bold w-1/4">{fullName}</td>
                <td className="py-1 pr-2 text-slate-500 font-semibold w-1/4">Designated Role:</td>
                <td className="py-1 text-slate-900 font-bold w-1/4">{roleDisplay}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1 pr-2 text-slate-500 font-semibold">Date of Birth:</td>
                <td className="py-1 text-slate-900 font-bold">{employee?.dob ? `${formatDate(employee.dob)} ${ageText ? `(${ageText})` : ''}` : '—'}</td>
                <td className="py-1 pr-2 text-slate-500 font-semibold">Employment Status:</td>
                <td className="py-1 text-slate-900 font-bold uppercase">{employee?.status || 'Active'}</td>
              </tr>
              <tr>
                <td className="py-1 pr-2 text-slate-500 font-semibold">Primary Contact:</td>
                <td className="py-1 text-slate-900 font-bold font-mono">{employee?.contact_no || '—'}</td>
                <td className="py-1 pr-2 text-slate-500 font-semibold">Registered Email:</td>
                <td className="py-1 text-slate-900 font-bold">{employee?.email || '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 2: RESIDENTIAL ADDRESS */}
        <div className="border border-slate-300 rounded-xl p-3 mb-3 print-avoid-break">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-700" />
            2. Residential & Mailing Address
          </div>
          <table className="w-full text-[10px] text-left border-collapse">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-1 pr-2 text-slate-500 font-semibold w-1/4">Street Address:</td>
                <td className="py-1 text-slate-900 font-bold w-3/4" colSpan={3}>{address?.street || 'Not Provided'}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1 pr-2 text-slate-500 font-semibold">Landmark:</td>
                <td className="py-1 text-slate-900 font-bold">{address?.landmark || '—'}</td>
                <td className="py-1 pr-2 text-slate-500 font-semibold">Postal Code:</td>
                <td className="py-1 text-slate-900 font-bold font-mono">{address?.zipcode || '—'}</td>
              </tr>
              <tr>
                <td className="py-1 pr-2 text-slate-500 font-semibold">City:</td>
                <td className="py-1 text-slate-900 font-bold">{cityName || '—'}</td>
                <td className="py-1 pr-2 text-slate-500 font-semibold">State / Country:</td>
                <td className="py-1 text-slate-900 font-bold">{stateName ? `${stateName}, ${countryName}` : countryName}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 mt-3 pt-2 text-center text-[8px] text-slate-500 font-mono">
          CONFIDENTIAL & PROPRIETARY • AUTHENTICATED EMPLOYEE RECORD • ISSUED BY {schoolName || 'SCHOOL CRM'}
        </div>
      </div>
    </>
  );
};

EmployeeDossierModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  detail: PropTypes.object,
  countryData: PropTypes.array,
  stateData: PropTypes.array,
  cityData: PropTypes.array,
  rolePriority: PropTypes.number,
};

export default EmployeeDossierModal;
