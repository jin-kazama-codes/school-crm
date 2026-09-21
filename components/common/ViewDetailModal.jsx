import React, { useEffect } from 'react';
import PropTypes from "prop-types";
import { X, Info } from 'lucide-react';

import '../models/styles.css';
import { Utility } from '../utility';

const { capitalizeEveryWord } = Utility();

const ViewDetailModal = ({
  open,
  setOpen,
  title,
  name,
  horizontalData,
  verticalData,
  detail,
  countryData,
  stateData,
  cityData
}) => {
  const { findById } = Utility();

  const countryName = findById(detail?.addressData?.country, countryData)?.name;
  const stateName = findById(detail?.addressData?.state, stateData)?.name;
  const cityName = findById(detail?.addressData?.city, cityData)?.name;

  const handleClose = () => {
    setOpen(false);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    if (open) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0f0f0f] rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-150 border border-slate-100 dark:border-[#1a1a1a] custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-md border-b border-slate-100 dark:border-[#1a1a1a]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-800 dark:text-white tracking-tight leading-tight">
                {title}
              </h2>
              <p className="text-xs text-slate-400 dark:text-gray-500">
                Detailed profile record
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] rounded-xl transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-6 bg-slate-50/70 dark:bg-[#141414] rounded-2xl p-5 border border-slate-100 dark:border-[#1a1a1a]">
            {/* Image */}
            <div className="shrink-0 flex justify-center">
              {detail?.imageData && detail?.imageData[0]?.image_src ? (
                <img
                  className="w-36 h-44 object-cover rounded-xl shadow-md border-2 border-emerald-500/20"
                  src={detail.imageData[0].image_src}
                  alt={name}
                />
              ) : (
                <div className="w-36 h-44 rounded-xl shadow-md border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-50 to-slate-100 dark:from-emerald-950/30 dark:to-slate-800 flex flex-col items-center justify-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <svg className="w-9 h-9 text-emerald-400 dark:text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                    </svg>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">No Photo</span>
                </div>
              )}
            </div>

            {/* Horizontal Data & Address */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 items-center text-xs">
              {Object.keys(horizontalData).map((key, index) => (
                horizontalData[key] && (
                  <React.Fragment key={index}>
                    <span className="text-slate-400 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="text-slate-800 dark:text-gray-100 font-semibold break-words">
                      {/* Don't capitalize dates, blood groups, emails — just display as-is */}
                      {/[0-9]{2}\s[A-Z][a-z]+\s[0-9]{4}|[A-Z0-9+−]{2,4}|@/.test(String(horizontalData[key]))
                        ? horizontalData[key]
                        : capitalizeEveryWord(horizontalData[key])}
                    </span>
                  </React.Fragment>
                )
              ))}

              <span className="text-slate-400 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap self-start mt-0.5">
                Address:
              </span>
              <span className="text-slate-800 dark:text-gray-100 font-semibold break-words leading-relaxed">
                {detail?.addressData?.street ? `${detail?.addressData?.street}, ` : ''}
                {detail?.addressData?.landmark ? `${detail?.addressData?.landmark}, ` : ''}
                {cityName ? `${cityName}, ` : ''}
                {stateName ? `${stateName}, ` : ''}
                {countryName ? `${countryName} ` : ''}
                {detail?.addressData?.zipcode ? `- ${detail?.addressData?.zipcode}` : ''}
              </span>
            </div>
          </div>

          {/* Vertical Data Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-slate-50/70 dark:bg-[#141414] rounded-2xl p-5 border border-slate-100 dark:border-[#1a1a1a]">
            {Object.keys(verticalData).map((key, index) => (
              verticalData[key] && (
                <div key={index} className="flex flex-col space-y-1">
                  <span className="text-slate-400 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="text-slate-800 dark:text-gray-100 font-bold text-xs truncate">
                    {capitalizeEveryWord(verticalData[key])}
                  </span>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/50 dark:bg-[#141414] border-t border-slate-100 dark:border-[#1a1a1a] flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 dark:text-gray-200 bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-[#222] rounded-xl hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

ViewDetailModal.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  title: PropTypes.string,
  name: PropTypes.string,
  horizontalData: PropTypes.object.isRequired,
  verticalData: PropTypes.object.isRequired,
  detail: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  countryData: PropTypes.array.isRequired,
  stateData: PropTypes.array.isRequired,
  cityData: PropTypes.array.isRequired
};

export default ViewDetailModal;
