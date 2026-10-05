/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 */

import React from "react";
import { Loader2 } from "lucide-react";

const Loader = ({ text = "Processing, please wait...", subtext = "Saving your changes securely" }) => {
    return (
        <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-white/95 dark:bg-[#151515]/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="relative flex items-center justify-center mb-4">
                <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 dark:border-emerald-400/15 border-t-emerald-600 dark:border-t-emerald-400 animate-spin" />
                <div className="absolute w-8 h-8 rounded-full border-3 border-emerald-400/30 border-b-emerald-500 animate-spin [animation-direction:reverse] [animation-duration:1.2s]" />
                <Loader2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 absolute animate-pulse" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                {text}
            </h4>
            {subtext && (
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 text-center leading-relaxed">
                    {subtext}
                </p>
            )}
        </div>
    );
};

export default Loader;
