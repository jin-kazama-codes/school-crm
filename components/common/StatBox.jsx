import React from "react";
import PropTypes from "prop-types";
import ProgressCircle from "./ProgressCircle";

const StatBox = ({ title, subtitle, icon, progress, increase, role, showPercentage, color = "emerald", subtext }) => {
  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[11px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider">
          {subtitle}
        </span>
        <div className="p-2 bg-slate-50 dark:bg-[#141414] rounded-xl border border-slate-100 dark:border-[#222] text-slate-600 dark:text-gray-300">
          {icon}
        </div>
      </div>
      
      <div className="my-1.5">
        <h4 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-800 dark:text-white tracking-tight">
          {title}
        </h4>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-[#1a1a1a] text-xs mt-2">
        <span className="text-slate-400 dark:text-gray-500 font-medium text-[11px]">
          {subtext || "Active directory count"}
        </span>
        {role !== 1 && showPercentage && increase && (
          <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full text-[11px]">
            {increase}
          </span>
        )}
      </div>
    </div>
  );
};

StatBox.propTypes = {
  title: PropTypes.oneOfType([PropTypes.number, PropTypes.array, PropTypes.string]),
  subtitle: PropTypes.string,
  icon: PropTypes.object,
  increase: PropTypes.string,
  progress: PropTypes.string,
  role: PropTypes.number,
  showPercentage: PropTypes.bool,
  color: PropTypes.string,
  subtext: PropTypes.string
};

export default StatBox;
