/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Calendar,
  Clock,
  Printer,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  BookOpen,
  Coffee,
  CheckCircle2,
  Layers,
  ChevronDown,
  Sparkles,
  School,
  Loader2,
  RefreshCw
} from "lucide-react";
import dayjs from "dayjs";
import PropTypes from "prop-types";

import API from "../../apis";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { setAllClasses, setSchoolClasses } from "../../redux/actions/ClassAction";
import { setAllSections, setSchoolSections } from "../../redux/actions/SectionAction";
import { setAllSubjects } from "../../redux/actions/SubjectAction";
import { Utility } from "../utility";
import TimetableSlotModal from "./TimetableSlotModal";

const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const getSubjectColorStyle = (subjectName = "") => {
  const name = subjectName.toLowerCase();
  if (name.includes("math")) {
    return {
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-200 dark:border-emerald-800/50",
      text: "text-emerald-900 dark:text-emerald-200",
      badge: "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300",
    };
  }
  if (name.includes("sci") || name.includes("phys") || name.includes("chem") || name.includes("bio")) {
    return {
      bg: "bg-purple-50 dark:bg-purple-950/40",
      border: "border-purple-200 dark:border-purple-800/50",
      text: "text-purple-900 dark:text-purple-200",
      badge: "bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300",
    };
  }
  if (name.includes("eng") || name.includes("lang") || name.includes("lit") || name.includes("hindi")) {
    return {
      bg: "bg-blue-50 dark:bg-blue-950/40",
      border: "border-blue-200 dark:border-blue-800/50",
      text: "text-blue-900 dark:text-blue-200",
      badge: "bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300",
    };
  }
  if (name.includes("comp") || name.includes("it") || name.includes("tech") || name.includes("coding")) {
    return {
      bg: "bg-cyan-50 dark:bg-cyan-950/40",
      border: "border-cyan-200 dark:border-cyan-800/50",
      text: "text-cyan-900 dark:text-cyan-200",
      badge: "bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300",
    };
  }
  if (name.includes("soc") || name.includes("hist") || name.includes("geo") || name.includes("civ") || name.includes("evs")) {
    return {
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-800/50",
      text: "text-amber-900 dark:text-amber-200",
      badge: "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300",
    };
  }
  if (name.includes("art") || name.includes("music") || name.includes("sport") || name.includes("pe") || name.includes("game")) {
    return {
      bg: "bg-rose-50 dark:bg-rose-950/40",
      border: "border-rose-200 dark:border-rose-800/50",
      text: "text-rose-900 dark:text-rose-200",
      badge: "bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300",
    };
  }
  return {
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    border: "border-indigo-200 dark:border-indigo-800/50",
    text: "text-indigo-900 dark:text-indigo-200",
    badge: "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300",
  };
};

const ListingComponent = ({ rolePriority = null }) => {
  const dispatch = useDispatch();
  const {
    getLocalStorage,
    fetchAndSetAll,
    fetchAndSetSchoolData,
    findMultipleById,
    appendSuffix,
    capitalizeEveryWord,
  } = Utility();

  const authInfo = getLocalStorage("auth") || {};
  const schoolInfo = getLocalStorage("schoolInfo") || {};
  const schoolName = schoolInfo?.name || schoolInfo?.school_name || authInfo?.school || "Delhi Public School";

  // Redux Data Stores
  const schoolClasses = useSelector((state) => state.schoolClasses);
  const allClasses = useSelector((state) => state.allClasses);
  const schoolSections = useSelector((state) => state.schoolSections);
  const allSections = useSelector((state) => state.allSections);
  const allSubjects = useSelector((state) => state.allSubjects);

  // Local Master Data
  const [classData, setClassData] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  // School Duration / Schedule Timings Master
  const [schoolDuration, setSchoolDuration] = useState(null);

  // Timetable Slots List
  const [timetableRows, setTimetableRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotLoading, setSlotLoading] = useState(false);

  // Week Navigator Offset (0 = current week)
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    dispatch(setMenuItem("Time Table"));
  }, [dispatch]);

  // Load School Class/Section Data using proven Marksheet pattern
  useEffect(() => {
    if (!getLocalStorage("schoolInfo")) {
      if (!allClasses?.listData?.length) {
        fetchAndSetAll(dispatch, setAllClasses, API.ClassAPI);
      }
      if (!allSections?.listData?.length) {
        fetchAndSetAll(dispatch, setAllSections, API.SectionAPI);
      }
    } else {
      if (!schoolClasses?.listData?.length || !schoolSections?.listData?.length || !classData?.length) {
        fetchAndSetSchoolData(
          dispatch,
          setSchoolClasses,
          setSchoolSections,
          setClassData
        );
      }
    }
  }, [dispatch]);

  // Load Subjects and School Duration Masters
  useEffect(() => {
    if (!allSubjects?.listData?.length) {
      fetchAndSetAll(dispatch, setAllSubjects, API.SubjectAPI);
    }

    const loadDuration = async () => {
      try {
        const durationRes = await API.SchoolDurationAPI.getAll(false, 0, 10);
        const durationList = durationRes?.data?.rows || durationRes?.data || [];
        if (durationList.length > 0) {
          setSchoolDuration(durationList[0]);
        }
      } catch (err) {
        console.error("Error loading school duration:", err);
      }
    };
    loadDuration();
  }, [dispatch]);

  // Deduplicated Class List matching marksheet logic
  const classList = useMemo(() => {
    const raw = (schoolClasses?.listData?.length ? schoolClasses.listData : allClasses?.listData) || [];
    const seen = new Set();
    const list = [];
    raw.forEach((item) => {
      const id = item?.class_id ?? item?.id;
      const rawName = item?.class_name ?? item?.name ?? "";
      if (id !== undefined && id !== null && !seen.has(String(id))) {
        seen.add(String(id));
        const formattedName =
          !isNaN(Number(rawName)) && rawName !== ""
            ? `Class ${appendSuffix(rawName)}`
            : rawName.toLowerCase().startsWith("class")
              ? capitalizeEveryWord(rawName)
              : `Class ${capitalizeEveryWord(rawName)}`;
        list.push({ id: Number(id), name: formattedName || `Class ${id}` });
      }
    });
    return list;
  }, [schoolClasses?.listData, allClasses?.listData]);

  // Dynamic Section List matching marksheet logic
  const sectionList = useMemo(() => {
    if (selectedClass && classData?.length) {
      const classSections = classData.filter((obj) => String(obj.class_id) === String(selectedClass));
      if (classSections.length > 0) {
        const seen = new Set();
        const list = [];
        classSections.forEach((item) => {
          const id = item?.section_id ?? item?.id;
          const rawName = item?.section_name ?? item?.name ?? "";
          if (id !== undefined && id !== null && !seen.has(String(id))) {
            seen.add(String(id));
            const formattedName = rawName
              ? rawName.toLowerCase().startsWith("sec")
                ? capitalizeEveryWord(rawName)
                : `Section ${capitalizeEveryWord(rawName)}`
              : `Section ${id}`;
            list.push({ id: Number(id), name: formattedName });
          }
        });
        if (list.length > 0) return list;
      }
    }
    const raw = (schoolSections?.listData?.length ? schoolSections.listData : allSections?.listData) || [];
    const seen = new Set();
    const list = [];
    raw.forEach((item) => {
      const id = item?.section_id ?? item?.id;
      const rawName = item?.section_name ?? item?.name ?? "";
      if (id !== undefined && id !== null && !seen.has(String(id))) {
        seen.add(String(id));
        const formattedName = rawName
          ? rawName.toLowerCase().startsWith("sec")
            ? capitalizeEveryWord(rawName)
            : `Section ${capitalizeEveryWord(rawName)}`
          : `Section ${id}`;
        list.push({ id: Number(id), name: formattedName });
      }
    });
    return list;
  }, [selectedClass, classData, schoolSections?.listData, allSections?.listData]);

  // Filter subjects for the selected class & section from school_class_data
  const filteredSubjects = useMemo(() => {
    if (!selectedClass || !classData?.length || !allSubjects?.listData?.length) {
      return allSubjects?.listData || [];
    }

    // Match exact class_id and section_id in school_class_data
    const matchingRow = classData.find(
      (obj) =>
        String(obj.class_id) === String(selectedClass) &&
        (selectedSection ? String(obj.section_id) === String(selectedSection) : true)
    );

    if (matchingRow?.subject_ids) {
      const matched = findMultipleById(String(matchingRow.subject_ids), allSubjects.listData);
      if (matched.length > 0) return matched;
    }

    // Fallback: check all rows for this class and aggregate subject_ids
    const classRows = classData.filter((obj) => String(obj.class_id) === String(selectedClass));
    const allSubjectIdSet = new Set();
    classRows.forEach((row) => {
      if (row.subject_ids) {
        String(row.subject_ids)
          .split(",")
          .forEach((idStr) => {
            const trimmed = idStr.trim();
            if (trimmed) allSubjectIdSet.add(trimmed);
          });
      }
    });

    if (allSubjectIdSet.size > 0) {
      return allSubjects.listData.filter((sub) => allSubjectIdSet.has(String(sub.id)));
    }

    return allSubjects.listData;
  }, [selectedClass, selectedSection, classData, allSubjects?.listData, findMultipleById]);

  // Automatically select first class and section when loaded
  useEffect(() => {
    if (classList.length > 0 && !selectedClass) {
      setSelectedClass(String(classList[0].id));
    }
  }, [classList, selectedClass]);

  useEffect(() => {
    if (sectionList.length > 0) {
      const currentValid = sectionList.some((s) => String(s.id) === String(selectedSection));
      if (!selectedSection || !currentValid) {
        setSelectedSection(String(sectionList[0].id));
      }
    }
  }, [sectionList, selectedSection]);

  // Fetch Timetable data whenever selected class or section changes
  const fetchTimetableData = useCallback(async () => {
    if (!selectedClass || !selectedSection) return;
    setLoading(true);
    try {
      const res = await API.TimeTableAPI.getAll({
        class_id: selectedClass,
        section_id: selectedSection,
        size: 300,
      });
      const rows = res?.data?.rows || res?.data || [];
      setTimetableRows(rows);
    } catch (err) {
      console.error("Error fetching timetable:", err);
      setTimetableRows([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    fetchTimetableData();
  }, [fetchTimetableData]);

  // Calculate Week Date Range (Monday to Saturday) based on weekOffset
  const weekDates = useMemo(() => {
    const today = dayjs().add(weekOffset * 7, "day");
    const dayOfWeek = today.day(); // 0 = Sun, 1 = Mon ...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = today.add(diffToMonday, "day");

    const days = [];
    for (let i = 0; i < 6; i++) {
      const d = monday.add(i, "day");
      days.push({
        name: DAYS_OF_WEEK[i],
        label: d.format("dddd").toUpperCase(),
        dateFormatted: d.format("MMM D"),
        dayNumber: d.format("D/M"),
        fullDate: d.format("YYYY-MM-DD"),
      });
    }
    return {
      startDate: monday.format("MMM D"),
      endDate: monday.add(5, "day").format("MMM D, YYYY"),
      days,
    };
  }, [weekOffset]);

  // Compute Grid Columns (Periods + Recess Break) from School Duration Master
  const periodColumns = useMemo(() => {
    const totalPeriods = schoolDuration?.period || 8;
    const firstHalfDuration = schoolDuration?.first_half_period_duration || 45;
    const secondHalfDuration = schoolDuration?.second_half_period_duration || 45;
    const recessMins = schoolDuration?.recess_time || 30;
    const halves = schoolDuration?.halves || 2;
    const halfPeriodCount = Math.floor(totalPeriods / halves);

    let baseTime = schoolDuration?.opening_time
      ? dayjs(schoolDuration.opening_time)
      : dayjs().hour(8).minute(0).second(0);

    const cols = [];

    for (let i = 1; i <= totalPeriods; i++) {
      const isFirstHalf = i <= halfPeriodCount;
      const duration = isFirstHalf ? firstHalfDuration : secondHalfDuration;
      const startTime = baseTime.format("hh:mm A");
      const endTimeTime = baseTime.add(duration, "minute");
      const endTime = endTimeTime.format("hh:mm A");

      cols.push({
        type: "period",
        periodNumber: i,
        title: `Period ${i}`,
        timeRange: `${startTime} - ${endTime}`,
        duration: duration,
      });

      baseTime = endTimeTime;

      // Insert Recess Break after the first half
      if (i === halfPeriodCount && recessMins > 0) {
        const recessStart = baseTime.format("hh:mm A");
        const recessEndTime = baseTime.add(recessMins, "minute");
        const recessEnd = recessEndTime.format("hh:mm A");

        cols.push({
          type: "recess",
          title: "RECESS / LUNCH",
          timeRange: `${recessStart} - ${recessEnd}`,
          duration: recessMins,
        });

        baseTime = recessEndTime;
      }
    }

    return cols;
  }, [schoolDuration]);

  // Lookup map: [day][periodNumber] -> slot record
  const slotLookup = useMemo(() => {
    const map = {};
    DAYS_OF_WEEK.forEach((d) => {
      map[d] = {};
    });

    timetableRows.forEach((row) => {
      const dayKey = String(row.day || "").toLowerCase();
      const periodNum = parseInt(String(row.period), 10);
      if (map[dayKey] && !isNaN(periodNum)) {
        map[dayKey][periodNum] = row;
      }
    });

    return map;
  }, [timetableRows]);

  // Selected Class & Section Display Names
  const selectedClassName = useMemo(() => {
    const found = classList.find((c) => String(c.id) === String(selectedClass));
    return found ? found.name : `Class ${selectedClass}`;
  }, [classList, selectedClass]);

  const selectedSectionName = useMemo(() => {
    const found = sectionList.find((s) => String(s.id) === String(selectedSection));
    return found ? found.name : `Section ${selectedSection}`;
  }, [sectionList, selectedSection]);

  // Slot Click Handler (Open in-place editor modal)
  const handleSlotClick = (dayName, col) => {
    if (col.type !== "period") return;
    const existing = slotLookup[dayName]?.[col.periodNumber] || null;

    setSelectedSlot({
      id: existing?.id,
      class_id: parseInt(selectedClass, 10),
      section_id: parseInt(selectedSection, 10),
      className: selectedClassName,
      sectionName: selectedSectionName,
      day: dayName,
      periodNumber: col.periodNumber,
      timeRange: col.timeRange,
      slotDuration: col.duration,
      subject_id: existing?.subject_id,
      batch: existing?.batch || "both",
      duration: existing?.duration || `${col.duration} min`,
    });
    setSlotModalOpen(true);
  };

  // Save Slot (Create or Update)
  const handleSaveSlot = async (slotPayload) => {
    setSlotLoading(true);
    try {
      if (slotPayload.id) {
        await API.TimeTableAPI.updateTimeTable(slotPayload);
      } else {
        await API.TimeTableAPI.createTimeTable(slotPayload);
      }
      setSlotModalOpen(false);
      fetchTimetableData();
    } catch (err) {
      console.error("Error saving slot:", err);
      alert(err?.response?.data?.msg || "Failed to save period slot");
    } finally {
      setSlotLoading(false);
    }
  };

  // Delete Slot
  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm("Are you sure you want to clear this period slot?")) return;
    setSlotLoading(true);
    try {
      await API.TimeTableAPI.deleteTimeTable(slotId);
      setSlotModalOpen(false);
      fetchTimetableData();
    } catch (err) {
      console.error("Error deleting slot:", err);
      alert(err?.response?.data?.msg || "Failed to remove slot");
    } finally {
      setSlotLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* GLOBAL PRINT STYLES */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm 10mm 10mm 10mm;
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
          #timetable-design-print-root,
          #timetable-design-print-root * {
            visibility: visible !important;
          }
          #timetable-design-print-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            display: block !important;
            background: #ffffff !important;
          }
        }
      `}</style>

      {/* SCREEN VIEW */}
      <div className="print:hidden p-4 sm:p-6 lg:p-8 space-y-6 w-full animate-in fade-in duration-200">

        {/* TOP CONTROL BAR: Date Nav + Class/Sec Filters + Print */}
        <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-200/80 dark:border-[#1a1a1a] shadow-xs p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">

          {/* Week Date Navigator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#181818] hover:bg-slate-100 dark:hover:bg-[#222] border border-slate-200 dark:border-[#2a2a2a] rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${weekOffset === 0
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-slate-50 dark:bg-[#181818] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#2a2a2a]"
                }`}
            >
              Current Week
            </button>
            <button
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#181818] hover:bg-slate-100 dark:hover:bg-[#222] border border-slate-200 dark:border-[#2a2a2a] rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Date Range Badge */}
            <div className="hidden lg:flex items-center gap-2 ml-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#262626] text-slate-700 dark:text-slate-300 text-xs font-extrabold font-mono shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{weekDates.startDate} — {weekDates.endDate}</span>
            </div>
          </div>

          {/* Class & Section Selectors + Print Button */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">

            {/* Class Dropdown */}
            <div className="relative flex items-center min-w-[170px] w-full sm:w-auto">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 pointer-events-none z-10" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer shadow-2xs appearance-none"
              >
                <option value="" className="bg-white dark:bg-[#161616] text-slate-500 font-medium">Select Class</option>
                {classList.map((cls) => (
                  <option
                    value={cls.id}
                    key={`class-${cls.id}`}
                    className="bg-white dark:bg-[#161616] text-slate-800 dark:text-slate-100 font-medium py-1"
                  >
                    {cls.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 pointer-events-none z-10" />
            </div>

            {/* Section Dropdown */}
            <div className="relative flex items-center min-w-[170px] w-full sm:w-auto">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 pointer-events-none z-10" />
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={!selectedClass || sectionList.length === 0}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer shadow-2xs appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" className="bg-white dark:bg-[#161616] text-slate-500 font-medium">Select Section</option>
                {sectionList.map((sec) => (
                  <option
                    value={sec.id}
                    key={`section-${sec.id}`}
                    className="bg-white dark:bg-[#161616] text-slate-800 dark:text-slate-100 font-medium py-1"
                  >
                    {sec.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 pointer-events-none z-10" />
            </div>

            {/* Print Timetable Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-emerald-600/20 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              Print Timetable
            </button>
          </div>
        </div>

        {/* HERO HEADER BANNER (Light "Shade of White" Theme) */}
        <div className="bg-white dark:bg-[#0f0f0f] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-[#1a1a1a] shadow-xs space-y-4 text-center relative overflow-hidden">

          {/* Delicate Decorative Accent Blobs */}
          <div className="absolute -left-12 -top-12 w-48 h-48 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white uppercase">
              {schoolName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono pt-1">
              TIME TABLE — {selectedClassName.toUpperCase()} • {selectedSectionName.toUpperCase()} • BATCH: BOTH • {weekDates.startDate.toUpperCase()} — {weekDates.endDate.toUpperCase()}
            </p>
          </div>
        </div>

        {/* WEEKLY TIMETABLE GRID (Light Theme) */}
        <div className="bg-white dark:bg-[#0e0e0e] rounded-3xl border border-slate-200/80 dark:border-[#222] shadow-xs overflow-hidden">

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse text-center min-w-[950px]">

              {/* Header Row: Periods & Recess Columns */}
              <thead>
                <tr className="bg-slate-50 dark:bg-[#161616] text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 w-32 border-r border-slate-200 dark:border-slate-800 shrink-0">
                    DAY / TIME
                  </th>
                  {periodColumns.map((col, idx) => {
                    if (col.type === "recess") {
                      return (
                        <th
                          key={`recess-col-${idx}`}
                          className="p-3 text-[11px] font-extrabold tracking-wider bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border-r border-slate-200 dark:border-slate-800 w-28 uppercase"
                        >
                          <div className="flex flex-col items-center justify-center gap-0.5">
                            <Coffee className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>RECESS</span>
                            <span className="text-[10px] font-mono text-amber-800/80 dark:text-amber-200/80 font-medium">
                              {col.timeRange}
                            </span>
                          </div>
                        </th>
                      );
                    }
                    return (
                      <th
                        key={`period-col-${col.periodNumber}`}
                        className="p-3.5 text-xs font-extrabold tracking-wider border-r border-slate-200 dark:border-slate-800 min-w-[145px]"
                      >
                        <div className="space-y-0.5">
                          <span className="text-emerald-700 dark:text-emerald-400 font-black block">{col.title}</span>
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-medium block">
                            {col.timeRange}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Table Body: 6 Days (Monday - Saturday) */}
              <tbody className="divide-y divide-slate-100 dark:divide-[#1e1e1e]">
                {loading ? (
                  <tr>
                    <td colSpan={periodColumns.length + 1} className="py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                        <span className="text-xs font-semibold">Loading weekly timetable matrix...</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  weekDates.days.map((dayObj) => {
                    const dayKey = dayObj.name;

                    return (
                      <tr key={dayKey} className="hover:bg-slate-50/60 dark:hover:bg-[#141414] transition-colors">

                        {/* Day Label Column */}
                        <td className="p-4 border-r border-slate-200 dark:border-[#202020] bg-slate-50/90 dark:bg-[#121212] font-black text-slate-800 dark:text-slate-100 text-xs text-center uppercase tracking-wider">
                          <div className="space-y-0.5">
                            <span>{dayObj.label}</span>
                            <span className="block text-[11px] text-slate-400 font-mono font-medium">
                              {dayObj.dayNumber}
                            </span>
                          </div>
                        </td>

                        {/* Period & Recess Cells */}
                        {periodColumns.map((col, cIdx) => {
                          if (col.type === "recess") {
                            return (
                              <td
                                key={`cell-recess-${dayKey}-${cIdx}`}
                                className="p-2 border-r border-slate-200 dark:border-[#202020] bg-amber-50/40 dark:bg-amber-950/10 text-center"
                              >
                                <div className="flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest py-2">
                                  <span>RECESS</span>
                                </div>
                              </td>
                            );
                          }

                          const slot = slotLookup[dayKey]?.[col.periodNumber];

                          if (slot) {
                            const subjectStyle = getSubjectColorStyle(slot.subject_name || "");

                            return (
                              <td
                                key={`cell-slot-${dayKey}-${col.periodNumber}`}
                                className="p-2 border-r border-slate-200 dark:border-[#202020] align-top text-left"
                              >
                                <div
                                  onClick={() => handleSlotClick(dayKey, col)}
                                  className={`p-3 rounded-2xl border ${subjectStyle.bg} ${subjectStyle.border} shadow-2xs hover:shadow-md transition-all cursor-pointer relative group flex flex-col justify-between min-h-[92px]`}
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-start justify-between gap-1">
                                      <span className={`text-xs font-black tracking-tight ${subjectStyle.text} line-clamp-2`}>
                                        {slot.subject_name || `Subject #${slot.subject_id}`}
                                      </span>
                                      <span className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/10 rounded-md text-slate-600 dark:text-slate-300">
                                        <Pencil className="w-3 h-3" />
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-[10px]">
                                    <span className={`font-extrabold px-2 py-0.5 rounded-md ${subjectStyle.badge}`}>
                                      {slot.duration || `${col.duration} min`}
                                    </span>
                                    <span className="text-slate-500 dark:text-slate-400 capitalize font-bold">
                                      {slot.batch || "Both"}
                                    </span>
                                  </div>
                                </div>
                              </td>
                            );
                          }

                          // Empty Cell (Assignable slot)
                          return (
                            <td
                              key={`cell-empty-${dayKey}-${col.periodNumber}`}
                              className="p-2 border-r border-slate-200 dark:border-[#202020] align-middle"
                            >
                              <div
                                onClick={() => handleSlotClick(dayKey, col)}
                                className="w-full h-full min-h-[92px] rounded-2xl border-2 border-dashed border-slate-200 dark:border-[#252525] hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10 transition-all flex flex-col items-center justify-center gap-1 text-slate-300 dark:text-zinc-700 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer group"
                              >
                                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-extrabold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                                  Assign
                                </span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Slot Modal */}
        <TimetableSlotModal
          isOpen={slotModalOpen}
          onClose={() => {
            setSlotModalOpen(false);
            setSelectedSlot(null);
          }}
          slotData={selectedSlot}
          allSubjects={filteredSubjects}
          onSave={handleSaveSlot}
          onDelete={handleDeleteSlot}
          loading={slotLoading}
        />
      </div>

      {/* PRINTABLE VIEW (A4 Landscape Layout) */}
      <div id="timetable-design-print-root" className="hidden">
        <div className="p-6 max-w-6xl mx-auto space-y-4 bg-white text-slate-900 font-sans">

          {/* Printable Official Header */}
          <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              {schoolName}
            </h1>
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-800">
              OFFICIAL CLASS TIMETABLE SCHEDULE
            </h2>
            <p className="text-xs text-slate-700 font-mono">
              CLASS: <strong>{selectedClassName}</strong> • SECTION: <strong>{selectedSectionName}</strong> • WEEK: <strong>{weekDates.startDate} — {weekDates.endDate}</strong>
            </p>
          </div>

          {/* Printable Table */}
          <table className="w-full border-collapse text-center text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-900 border-b border-slate-300">
                <th className="p-2 font-bold border-r border-slate-300 w-24">DAY</th>
                {periodColumns.map((col, idx) => (
                  <th key={`print-col-${idx}`} className="p-2 font-bold border-r border-slate-300">
                    <div>{col.title}</div>
                    <div className="text-[9px] font-normal font-mono">{col.timeRange}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {weekDates.days.map((dayObj) => (
                <tr key={`print-row-${dayObj.name}`}>
                  <td className="p-2.5 font-bold border-r border-slate-300 bg-slate-50 uppercase">
                    {dayObj.name}
                  </td>
                  {periodColumns.map((col, cIdx) => {
                    if (col.type === "recess") {
                      return (
                        <td key={`print-recess-${cIdx}`} className="p-2 border-r border-slate-300 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                          RECESS
                        </td>
                      );
                    }
                    const slot = slotLookup[dayObj.name]?.[col.periodNumber];
                    return (
                      <td key={`print-slot-${cIdx}`} className="p-2 border-r border-slate-300 font-semibold text-slate-900">
                        {slot ? (
                          <div>
                            <div className="font-bold text-xs">{slot.subject_name || `Subject #${slot.subject_id}`}</div>
                            <div className="text-[9px] text-slate-500">{slot.duration}</div>
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Printable Footer */}
          <div className="pt-4 flex items-center justify-between text-[9px] text-slate-500 border-t border-slate-200">
            <span>ISSUED BY: {schoolName}</span>
            <span>ACADEMIC SESSION 2025-2026</span>
            <span>GENERATED ON: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
          </div>
        </div>
      </div>
    </>
  );
};

ListingComponent.propTypes = {
  rolePriority: PropTypes.number,
};

export default ListingComponent;
