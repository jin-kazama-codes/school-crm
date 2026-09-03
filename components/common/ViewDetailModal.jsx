import React, { useEffect } from 'react';
import PropTypes from "prop-types";
import { X, Info } from 'lucide-react';

import '../models/styles.css';
import { Utility } from '../utility';
import listBg from "../assets/listBG.jpg";

const ENV = process.env;
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#121212] rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-[#2a2a2a]"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url(${listBg?.src || listBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-emerald-600/90 backdrop-blur-md border-b border-white/10 shadow-sm rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-800 rounded-full flex items-center justify-center shadow-inner">
              <Info className="w-5 h-5 text-emerald-100" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              {title}
            </h2>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8 mb-8 bg-white/5 rounded-xl p-4 border border-white/10">
            {/* Image */}
            {detail?.imageData && detail?.imageData[0]?.image_src && (
              <div className="flex-shrink-0">
                <img
                  className="w-48 h-56 object-cover rounded-xl shadow-lg border-2 border-emerald-500/50"
                  src={detail.imageData[0].image_src}
                  alt={name}
                />
              </div>
            )}

            {/* Horizontal Data & Address */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-x-4 gap-y-3 items-center">
              {Object.keys(horizontalData).map((key, index) => (
                horizontalData[key] && (
                  <React.Fragment key={index}>
                    <span className="text-emerald-300 font-semibold uppercase tracking-wider text-sm whitespace-nowrap">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="text-slate-100 font-medium break-words">
                      {capitalizeEveryWord(horizontalData[key])}
                    </span>
                  </React.Fragment>
                )
              ))}

              <span className="text-emerald-300 font-semibold uppercase tracking-wider text-sm whitespace-nowrap self-start mt-1">
                Address:
              </span>
              <span className="text-slate-100 font-medium break-words leading-relaxed">
                {detail?.addressData?.street}, {detail?.addressData?.landmark},{" "}
                {cityName}, {stateName}, {countryName} - {detail?.addressData?.zipcode}
              </span>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent my-6" />

          {/* Vertical Data Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 bg-white/5 rounded-xl p-6 border border-white/10">
            {Object.keys(verticalData).map((key, index) => (
              verticalData[key] && (
                <div key={index} className="flex flex-col gap-1">
                  <span className="text-emerald-300/80 font-semibold uppercase tracking-wider text-[11px]">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="text-slate-100 font-medium truncate">
                    {capitalizeEveryWord(verticalData[key])}
                  </span>
                </div>
              )
            ))}
          </div>
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
