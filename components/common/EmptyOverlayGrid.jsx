/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React from "react";
import { FolderOpen } from "lucide-react";

export default function EmptyOverlayGrid({ selected }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#222] rounded-2xl flex items-center justify-center text-slate-400 dark:text-gray-500 mb-3 shadow-xs">
        <FolderOpen className="w-7 h-7 stroke-[1.5]" />
      </div>
      <h3 className="text-sm font-bold font-display text-slate-700 dark:text-gray-200">
        No {selected ? `${selected} Records` : "Records Found"}
      </h3>
      <p className="text-xs text-slate-400 dark:text-gray-500 mt-1 max-w-sm">
        There are currently no rows available in this view. New records will appear here once created.
      </p>
    </div>
  );
}
