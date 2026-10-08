import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from "@/lib/routerAdapter";
import { Pencil, Eye, FileText } from 'lucide-react';
import { Utility } from "../utility";

const NotesCell = ({ title, notes, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 340, placement: 'top' });
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);
  const { capitalizeEveryWord } = Utility();

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = Math.min(380, Math.max(280, window.innerWidth - 32));
    
    // Horizontal centering clamped to viewport margins
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));

    // Vertical placement: prefer top if space available, otherwise bottom
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const placement = spaceAbove > 200 || spaceAbove >= spaceBelow ? 'top' : 'bottom';
    const top = placement === 'top' ? rect.top - 8 : rect.bottom + 8;

    setCoords({ top, left, width: tooltipWidth, placement });
  };

  const handleMouseEnter = () => {
    if (!notes) return;
    clearTimeout(timeoutRef.current);
    updatePosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleTooltipMouseEnter = () => {
    clearTimeout(timeoutRef.current);
  };

  const handleTooltipMouseLeave = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  if (!notes) {
    return <span className="text-slate-400 dark:text-zinc-500 italic">—</span>;
  }

  const formattedNotes = capitalizeEveryWord(notes);

  return (
    <div className="relative inline-flex items-center max-w-full group">
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="truncate block max-w-[100px] sm:max-w-[130px] md:max-w-[160px] text-xs font-medium text-slate-700 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors cursor-pointer select-none underline decoration-dotted decoration-slate-300 dark:decoration-zinc-600 underline-offset-2"
      >
        {formattedNotes}
      </span>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          style={{
            position: 'fixed',
            ...(coords.placement === 'top' 
              ? { bottom: `${window.innerHeight - coords.top}px` } 
              : { top: `${coords.top}px` }),
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            zIndex: 99999,
          }}
          className="p-4 bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-md border border-slate-200/90 dark:border-zinc-700/80 rounded-2xl shadow-2xl shadow-slate-900/15 dark:shadow-black/60 text-left animate-in fade-in zoom-in-95 duration-150 pointer-events-auto"
        >
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {title ? capitalizeEveryWord(title) : 'Holiday Instructions'}
              </span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex-shrink-0">
              Notes
            </span>
          </div>

          <div className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed max-h-56 overflow-y-auto custom-scrollbar font-normal whitespace-pre-wrap break-words">
            {notes}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export const datagridColumns = (rolePriority = null, setOpen = null, setSelectedId = null) => {
  const { capitalizeEveryWord, formatDate } = Utility();
  const navigateTo = useNavigate();

  const handleActionEdit = (id) => {
    navigateTo(`/holiday/update/${id}`, { state: { id: id } });
  };

  const handleActionShow = (id) => {
    if (setSelectedId) setSelectedId(id);
    if (setOpen) setOpen(true);
  };

  const columns = [
    {
      field: "title",
      headerName: "Holiday Title",
      headerAlign: "left",
      align: "left",
      flex: 1.2,
      minWidth: 140,
      renderCell: ({ row: { title } }) => (
        <span className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate block max-w-[160px] sm:max-w-[200px]">
          {capitalizeEveryWord(title) || "—"}
        </span>
      ),
    },
    {
      field: "startDate",
      headerName: "From Date",
      headerAlign: "center",
      align: "center",
      flex: 0.9,
      minWidth: 110,
      renderCell: ({ row: { startDate } }) => (
        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
          {startDate ? formatDate(startDate) : "—"}
        </span>
      )
    },
    {
      field: "endDate",
      headerName: "To Date",
      headerAlign: "center",
      align: "center",
      flex: 0.9,
      minWidth: 110,
      renderCell: ({ row: { endDate } }) => (
        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
          {endDate ? formatDate(endDate) : "—"}
        </span>
      )
    },
    {
      field: "duration",
      headerName: "Duration",
      headerAlign: "center",
      align: "center",
      flex: 0.8,
      minWidth: 100,
      renderCell: ({ row: { startDate, endDate } }) => {
        if (!startDate || !endDate) return <span className="text-slate-400 font-medium">—</span>;
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return <span className="text-slate-400 font-medium">—</span>;
        
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        return (
          <div className="flex justify-center items-center w-full h-full">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 whitespace-nowrap">
              {days} {days === 1 ? 'Day' : 'Days'}
            </span>
          </div>
        );
      }
    },
    {
      field: "type",
      headerName: "Closure Type",
      headerAlign: "center",
      align: "center",
      flex: 1.1,
      minWidth: 130,
      renderCell: ({ row: { type } }) => {
        if (!type) return <span className="text-slate-400 font-medium">—</span>;
        const nameParts = type.split("_");
        const capitalizedParts = nameParts.map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        );
        const typeAll = capitalizedParts.join(" ");
        
        let bgColors = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30";
        if (type === "school_closure") {
            bgColors = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30";
        } else if (type === "partial_closure") {
            bgColors = "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30";
        }

        return (
          <div className="flex justify-center items-center w-full h-full">
            <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase shadow-2xs border whitespace-nowrap ${bgColors}`}>
              {typeAll}
            </div>
          </div>
        );
      },
    },
    {
      field: "notes",
      headerName: "Instructions / Notes",
      headerAlign: "left",
      align: "left",
      flex: 1,
      minWidth: 120,
      renderCell: ({ row }) => (
        <NotesCell
          title={row?.title}
          notes={row?.notes}
          type={row?.type}
        />
      ),
    },
    rolePriority !== 1 && {
      field: "action",
      headerName: "Action",
      headerAlign: "center",
      align: "center",
      flex: 0.9,
      minWidth: 90,
      renderCell: ({ row: { id } }) => {
        return (
          <div className="flex justify-center items-center gap-1.5 w-full h-full">
            <button
              onClick={() => handleActionShow(id)}
              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/50 cursor-pointer shadow-2xs"
              title="View Holiday Circular"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleActionEdit(id)}
              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer shadow-2xs"
              title="Edit Holiday"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ].filter(Boolean);
  
  return columns;
};
