/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, BookOpen, Award, CheckCircle2 } from "lucide-react";

import API from "../../apis";
import config from "../config";
import marksheetValidation from "./Validation";
import { setMarksheetClassData } from "../../redux/actions/MarksheetAction";
import { setAllSubjects } from "../../redux/actions/SubjectAction";
import { setAllStudents } from "../../redux/actions/StudentAction";
import { Utility } from "../utility";
import { useCommon } from "../hooks/common";

const initialValues = {
  dbId: "",
  session: "",
  student: "",
  class: "",
  section: "",
  term: "",
  result: "",
  subjects: [],
  marks_obtained: "",
  total_marks: "",
  grade: "",
  remark: "",
  co_work_edu: "",
  co_art: "",
  co_sports: "",
  co_gk: "",
  dis_punctuality: "",
  dis_behavior: "",
  dis_attitude: "",
  dis_attendance: "",
  overall_remark: "Demonstrates consistent scholastic aptitude, good participation, and disciplined conduct.",
};

export const calcGradeAndResult = (obtained, max) => {
  const numObt = parseFloat(obtained);
  const numMax = parseFloat(max);
  if (isNaN(numObt) || isNaN(numMax) || numMax <= 0) return { grade: "", result: "" };
  const pct = (numObt / numMax) * 100;
  if (pct >= 91) return { grade: "A+", result: "pass" };
  if (pct >= 81) return { grade: "A", result: "pass" };
  if (pct >= 71) return { grade: "B", result: "pass" };
  if (pct >= 61) return { grade: "C", result: "pass" };
  if (pct >= 51) return { grade: "D", result: "pass" };
  if (pct >= 33) return { grade: "E", result: "pass" };
  return { grade: "F", result: "fail" };
};

const MarksheetFormComponent = ({
  onChange,
  refId,
  setDirty,
  reset,
  setReset,
  updatedValues = null,
}) => {
  const allSubjects = useSelector((state) => state.allSubjects);
  const allStudents = useSelector((state) => state.allFormStudents);
  const { marksheetClassData } = useSelector((state) => state.allMarksheets);

  const dispatch = useDispatch();
  const { getStudents } = useCommon();
  const { createSession, findMultipleById, fetchAndSetAll } = Utility();

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: marksheetValidation,
    enableReinitialize: true,
    onSubmit: () => watchForm(),
  });

  React.useImperativeHandle(refId, () => ({
    Submit: async () => {
      await formik.submitForm();
    },
  }));

  const watchForm = () => {
    if (onChange) {
      onChange({
        values: formik.values,
        validated: Object.keys(formik.errors).length === 0,
        dirty: formik.dirty
      });
    }
  };

  useEffect(() => {
    if (reset) {
      formik.resetForm();
      setReset(false);
    }
  }, [reset]);

  useEffect(() => {
    if (formik.dirty) {
      setDirty(true);
    }
  }, [formik.dirty]);

  useEffect(() => {
    if (!allSubjects?.listData?.length) {
      fetchAndSetAll(dispatch, setAllSubjects, API.SubjectAPI);
    }
  }, []);

  useEffect(() => {
    // this will run when creating marksheet
    if (marksheetClassData?.classDataObj) {
      formik.setFieldValue("class", marksheetClassData.classDataObj.class_name);
      formik.setFieldValue(
        "section",
        marksheetClassData.classDataObj.section_name
      );
      formik.setFieldValue(
        "subjects",
        marksheetClassData.classDataObj.subject_ids.split(",")
      );
      getStudents(
        marksheetClassData.classDataObj.class_id,
        marksheetClassData.classDataObj.section_id,
        setAllStudents,
        API
      );
    }
  }, [marksheetClassData?.classDataObj]);

  useEffect(() => {
    if (updatedValues) {
      const header = updatedValues.marksheetData?.[0];
      const classSubjectIds = marksheetClassData?.classDataObj?.subject_ids
        ? marksheetClassData.classDataObj.subject_ids.split(",")
        : (updatedValues.marksheetMappingData || []).map(s => String(s.subject_id));

      const fullClassSubjects = findMultipleById(classSubjectIds.join(","), allSubjects?.listData);

      formik.setFieldValue("subjects", classSubjectIds);

      // Populate class and section name in case marksheetClassData.classDataObj wasn't preset
      if (header?.class_name) {
        formik.setFieldValue("class", header.class_name);
      } else if (header?.class_id && !formik.values.class) {
        formik.setFieldValue("class", `Class ${header.class_id}`);
      }

      if (header?.section_name) {
        formik.setFieldValue("section", header.section_name);
      } else if (header?.section_id && !formik.values.section) {
        formik.setFieldValue("section", `Section ${header.section_id}`);
      }

      // Fetch student list for class/section if not already loaded
      if (header?.class_id && header?.section_id && (!allStudents?.listData?.rows || allStudents.listData.rows.length === 0)) {
        getStudents(header.class_id, header.section_id, setAllStudents, API);
      }

      // Populate values matched by subject_id
      (updatedValues.marksheetMappingData || []).forEach((sub) => {
        const subIndex = classSubjectIds.findIndex(id => String(id) === String(sub.subject_id));
        if (subIndex !== -1) {
          const marksObtainedVal = sub.marks_obtained !== undefined && sub.marks_obtained !== null 
            ? sub.marks_obtained 
            : (sub.marks !== undefined && sub.marks !== null ? sub.marks : "");
          const totalMarksVal = sub.total_marks !== undefined && sub.total_marks !== null 
            ? sub.total_marks 
            : (sub.max_marks !== undefined && sub.max_marks !== null ? sub.max_marks : "");

          formik.setFieldValue(`marks_obtained_${subIndex}`, marksObtainedVal !== null ? String(marksObtainedVal) : "");
          formik.setFieldValue(`total_marks_${subIndex}`, totalMarksVal !== null ? String(totalMarksVal) : "");
          formik.setFieldValue(`grade_${subIndex}`, sub.grade ?? "");
          formik.setFieldValue(`remark_${subIndex}`, sub.remark ?? "");
          formik.setFieldValue(`result_${subIndex}`, sub.result ?? "");
          formik.setFieldValue(`dbId_${subIndex}`, sub.id);
        }
      });

      if (header?.session) formik.setFieldValue("session", header.session);
      if (header?.student_id) formik.setFieldValue("student", header.student_id);
      if (header?.term) formik.setFieldValue("term", header.term);
      if (header?.result) formik.setFieldValue("result", header.result);

      if (header?.co_scholastic_data) {
        let co = header.co_scholastic_data;
        if (typeof co === "string") {
          try { co = JSON.parse(co); } catch { co = {}; }
        }
        formik.setFieldValue("co_work_edu", co?.work_edu ?? "");
        formik.setFieldValue("co_art", co?.art ?? "");
        formik.setFieldValue("co_sports", co?.sports ?? "");
        formik.setFieldValue("co_gk", co?.gk ?? "");
      }

      if (header?.discipline_data) {
        let dis = header.discipline_data;
        if (typeof dis === "string") {
          try { dis = JSON.parse(dis); } catch { dis = {}; }
        }
        formik.setFieldValue("dis_punctuality", dis?.punctuality ?? "");
        formik.setFieldValue("dis_behavior", dis?.behavior ?? "");
        formik.setFieldValue("dis_attitude", dis?.attitude ?? "");
        formik.setFieldValue("dis_attendance", dis?.attendance ?? "");
      }

      if (header?.overall_remark !== undefined && header?.overall_remark !== null) {
        formik.setFieldValue("overall_remark", header.overall_remark);
      }

      if (fullClassSubjects?.length) {
        dispatch(
          setMarksheetClassData({
            ...marksheetClassData,
            selectedSubjects: fullClassSubjects,
          })
        );
      }
    }
  }, [updatedValues, allSubjects?.listData]);

  // Live calculation of totals, percentage, grade, and suggested result
  const subjectStats = React.useMemo(() => {
    const subjects = marksheetClassData?.selectedSubjects || [];
    let totalObtained = 0;
    let totalMax = 0;
    let evaluatedCount = 0;
    let failedSubjects = 0;
    let passedSubjects = 0;
    let hasAnyData = false;

    subjects.forEach((_, index) => {
      const obtainedRaw = formik.values[`marks_obtained_${index}`];
      const maxRaw = formik.values[`total_marks_${index}`];
      const resultVal = formik.values[`result_${index}`];

      const obtained = parseFloat(obtainedRaw);
      const max = parseFloat(maxRaw);

      const hasMarks = !isNaN(obtained) && obtainedRaw !== "" && obtainedRaw !== null;
      const hasMax = !isNaN(max) && maxRaw !== "" && maxRaw !== null;

      if (hasMarks || hasMax || (resultVal && resultVal !== "")) {
        hasAnyData = true;
      }

      if (hasMarks && hasMax && max > 0) {
        evaluatedCount++;
        totalObtained += obtained;
        totalMax += max;

        const subjectPercent = (obtained / max) * 100;
        if (resultVal === "fail" || subjectPercent < 33) {
          failedSubjects++;
        } else {
          passedSubjects++;
        }
      } else if (resultVal === "fail") {
        evaluatedCount++;
        failedSubjects++;
      } else if (resultVal === "pass") {
        evaluatedCount++;
        passedSubjects++;
      }
    });

    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : null;
    
    // Overall grade calculation
    let grade = "—";
    if (percentage !== null) {
      if (percentage >= 90) grade = "A+";
      else if (percentage >= 80) grade = "A";
      else if (percentage >= 70) grade = "B";
      else if (percentage >= 60) grade = "C";
      else if (percentage >= 50) grade = "D";
      else if (percentage >= 33) grade = "E";
      else grade = "F";
    }

    // Auto-suggested Result based on overall aggregate percentage (>= 33%)
    let suggestedResult = "";
    if (evaluatedCount > 0 && percentage !== null) {
      if (percentage >= 33) {
        suggestedResult = "pass";
      } else {
        suggestedResult = "fail";
      }
    }

    return {
      hasAnyData,
      totalObtained,
      totalMax,
      percentage,
      evaluatedCount,
      passedSubjects,
      failedSubjects,
      grade,
      suggestedResult,
    };
  }, [formik.values, marksheetClassData?.selectedSubjects]);

  // Auto-suggest overall result when subjects are evaluated and result isn't manually locked
  useEffect(() => {
    if (subjectStats.suggestedResult && (!formik.values.result || formik.values.result === "pass" || formik.values.result === "fail")) {
      // If result is empty, or aligns with standard calculation
      if (!formik.values.result) {
        formik.setFieldValue("result", subjectStats.suggestedResult);
      }
    }
  }, [subjectStats.suggestedResult]);

  const handleSubjectMarksBlur = (index, field) => (e) => {
    formik.handleBlur(e);
    const val = e.target.value;
    const obtainedRaw = field === "marks_obtained" ? val : formik.values[`marks_obtained_${index}`];
    const totalRaw = field === "total_marks" ? val : formik.values[`total_marks_${index}`];

    if (obtainedRaw !== "" && obtainedRaw !== null && obtainedRaw !== undefined &&
        totalRaw !== "" && totalRaw !== null && totalRaw !== undefined) {
      const { grade, result } = calcGradeAndResult(obtainedRaw, totalRaw);
      const currentGrade = formik.values[`grade_${index}`];
      const currentResult = formik.values[`result_${index}`];

      if (grade && (!currentGrade || ["A+", "A", "B", "C", "D", "E", "F"].includes(currentGrade))) {
        formik.setFieldValue(`grade_${index}`, grade);
      }
      if (result && (!currentResult || ["pass", "fail"].includes(currentResult))) {
        formik.setFieldValue(`result_${index}`, result);
      }
    }
  };

  const inputClasses =
    "w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2e2e2e] rounded-xl shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500";

  const selectClasses =
    "w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2e2e2e] rounded-xl shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all outline-none text-slate-900 dark:text-slate-100 cursor-pointer appearance-none";

  const labelClasses =
    "block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5";

  const errorClasses = "text-rose-500 text-xs mt-1 ml-0.5 font-medium";

  return (
    <form ref={refId} onSubmit={formik.handleSubmit} className="space-y-6">
      
      {/* ── CARD 1: Marksheet Details ─────────────────────────────────────────── */}
      <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#222]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Marksheet Details & Student Assignment
          </h3>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Session, term & candidate allocation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
          {/* Session */}
          <div>
            <label className={labelClasses}>Session*</label>
            <div className="relative">
              <select
                name="session"
                value={formik.values.session}
                onChange={(e) => formik.setFieldValue("session", e.target.value)}
                onBlur={formik.handleBlur}
                className={`${selectClasses} pr-9 ${
                  formik.touched.session && formik.errors.session
                    ? "border-rose-400 ring-1 ring-rose-400"
                    : ""
                }`}
              >
                <option value="" disabled>Select Session</option>
                {createSession().map((session) => (
                  <option value={session} key={session}>{session}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {formik.touched.session && formik.errors.session && (
              <p className={errorClasses}>{formik.errors.session}</p>
            )}
          </div>

          {/* Class (Read-only) */}
          <div>
            <label className={labelClasses}>Class</label>
            <input
              type="text"
              name="class"
              value={formik.values.class || ""}
              readOnly
              disabled
              className={`${inputClasses} bg-slate-50 dark:bg-[#1a1a1a] cursor-not-allowed opacity-90 font-semibold`}
            />
          </div>

          {/* Section (Read-only) */}
          <div>
            <label className={labelClasses}>Section</label>
            <input
              type="text"
              name="section"
              value={formik.values.section || ""}
              readOnly
              disabled
              className={`${inputClasses} bg-slate-50 dark:bg-[#1a1a1a] cursor-not-allowed opacity-90 font-semibold`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100 dark:border-[#222]">
          {/* Term */}
          <div>
            <label className={labelClasses}>Term*</label>
            <div className="relative">
              <select
                name="term"
                value={formik.values.term}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`${selectClasses} pr-9 ${
                  formik.touched.term && formik.errors.term
                    ? "border-rose-400 ring-1 ring-rose-400"
                    : ""
                }`}
              >
                <option value="" disabled>Select Term</option>
                {Object.keys(config.term).map(item => (
                  <option key={item} value={item}>{config.term[item]}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {formik.touched.term && formik.errors.term && (
              <p className={errorClasses}>{formik.errors.term}</p>
            )}
          </div>

          {/* Student */}
          <div>
            <label className={labelClasses}>Student*</label>
            <div className="relative">
              <select
                name="student"
                value={formik.values.student || ""}
                onChange={(e) => formik.setFieldValue("student", e.target.value)}
                onBlur={formik.handleBlur}
                className={`${selectClasses} pr-9 ${
                  formik.touched.student && formik.errors.student
                    ? "border-rose-400 ring-1 ring-rose-400"
                    : ""
                }`}
              >
                <option value="" disabled>Select Student</option>
                {allStudents?.listData?.rows?.map((item) => (
                  <option value={item.id} key={item.id}>
                    {`${item.firstname.charAt(0).toUpperCase() + item.firstname.slice(1)} ${item.lastname.charAt(0).toUpperCase() + item.lastname.slice(1)}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {formik.touched.student && formik.errors.student && (
              <p className={errorClasses}>{formik.errors.student}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── CARD 2: Subject Marks ─────────────────────────────────────────────── */}
      <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200 overflow-x-auto">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#222]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Subject Marks & Academic Evaluation
          </h3>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Auto-calculates grade & result on marks blur (editable)
          </span>
        </div>

        <div className="min-w-[760px] space-y-3">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200/70 dark:border-[#282828] text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            <div className="col-span-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
              Subject
            </div>
            <div className="col-span-1">Marks Obtained</div>
            <div className="col-span-1">Total Marks</div>
            <div className="col-span-1">Grade</div>
            <div className="col-span-1">Remark</div>
            <div className="col-span-1">Result</div>
          </div>

          {/* Subject Rows */}
          {marksheetClassData?.selectedSubjects?.map((subject, index) => (
            <div 
              key={index} 
              className="grid grid-cols-6 gap-3 p-3 rounded-xl bg-white/60 dark:bg-[#141414]/60 border border-slate-200/80 dark:border-[#262626] items-center hover:bg-slate-50/80 dark:hover:bg-[#181818] transition-colors"
            >
              <div className="col-span-1 font-semibold text-xs text-slate-800 dark:text-slate-200 truncate pr-2">
                {subject?.name}
              </div>

              {/* Marks Obtained */}
              <div className="col-span-1">
                <input
                  type="text"
                  name={`marks_obtained_${index}`}
                  placeholder="Marks"
                  onBlur={handleSubjectMarksBlur(index, "marks_obtained")}
                  onChange={formik.handleChange}
                  value={formik.values[`marks_obtained_${index}`] || ""}
                  className={`${inputClasses} ${
                    formik.touched[`marks_obtained_${index}`] && formik.errors[`marks_obtained_${index}`]
                      ? "border-rose-400 ring-1 ring-rose-400"
                      : ""
                  }`}
                />
                {formik.touched[`marks_obtained_${index}`] && formik.errors[`marks_obtained_${index}`] && (
                  <p className={errorClasses}>{formik.errors[`marks_obtained_${index}`]}</p>
                )}
              </div>

              {/* Total Marks */}
              <div className="col-span-1">
                <input
                  type="text"
                  name={`total_marks_${index}`}
                  placeholder="Total"
                  onBlur={handleSubjectMarksBlur(index, "total_marks")}
                  onChange={formik.handleChange}
                  value={formik.values[`total_marks_${index}`] || ""}
                  className={`${inputClasses} ${
                    formik.touched[`total_marks_${index}`] && formik.errors[`total_marks_${index}`]
                      ? "border-rose-400 ring-1 ring-rose-400"
                      : ""
                  }`}
                />
                {formik.touched[`total_marks_${index}`] && formik.errors[`total_marks_${index}`] && (
                  <p className={errorClasses}>{formik.errors[`total_marks_${index}`]}</p>
                )}
              </div>

              {/* Grade */}
              <div className="col-span-1">
                <input
                  type="text"
                  name={`grade_${index}`}
                  placeholder="Grade"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values[`grade_${index}`] || ""}
                  className={`${inputClasses} ${
                    formik.touched[`grade_${index}`] && formik.errors[`grade_${index}`]
                      ? "border-rose-400 ring-1 ring-rose-400"
                      : ""
                  }`}
                />
                {formik.touched[`grade_${index}`] && formik.errors[`grade_${index}`] && (
                  <p className={errorClasses}>{formik.errors[`grade_${index}`]}</p>
                )}
              </div>

              {/* Remark */}
              <div className="col-span-1">
                <input
                  type="text"
                  name={`remark_${index}`}
                  placeholder="Remark"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values[`remark_${index}`] || ""}
                  className={`${inputClasses} ${
                    formik.touched[`remark_${index}`] && formik.errors[`remark_${index}`]
                      ? "border-rose-400 ring-1 ring-rose-400"
                      : ""
                  }`}
                />
                {formik.touched[`remark_${index}`] && formik.errors[`remark_${index}`] && (
                  <p className={errorClasses}>{formik.errors[`remark_${index}`]}</p>
                )}
              </div>

              {/* Result */}
              <div className="col-span-1">
                <div className="relative">
                  <select
                    name={`result_${index}`}
                    value={formik.values[`result_${index}`] || ""}
                    onChange={(e) => formik.setFieldValue(`result_${index}`, e.target.value)}
                    onBlur={formik.handleBlur}
                    className={`${selectClasses} pr-7 ${
                      formik.touched[`result_${index}`] && formik.errors[`result_${index}`]
                        ? "border-rose-400 ring-1 ring-rose-400"
                        : ""
                    }`}
                  >
                    <option value="" disabled>Select Result</option>
                    <option value="pass">Pass</option>
                    <option value="fail">Fail</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formik.touched[`result_${index}`] && formik.errors[`result_${index}`] && (
                  <p className={errorClasses}>{formik.errors[`result_${index}`]}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CARD 3: Co-Scholastic & Discipline Evaluation ─────────────────── */}
      <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#222]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Part II: Co-Scholastic & Part III: Discipline & Attendance
          </h3>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Holistic assessment, activities & student conduct
          </span>
        </div>

        {/* Section 1: Co-Scholastic Areas */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            Part II: Co-Scholastic Activities (3-Point Grading Scale A - C)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelClasses}>Work Education</label>
              <div className="relative">
                <select
                  name="co_work_edu"
                  value={formik.values.co_work_edu || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${selectClasses} pr-8`}
                >
                  <option value="">Select Grade</option>
                  <option value="A">Grade A (Excellent)</option>
                  <option value="B">Grade B (Good)</option>
                  <option value="C">Grade C (Satisfactory)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Art Education</label>
              <div className="relative">
                <select
                  name="co_art"
                  value={formik.values.co_art || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${selectClasses} pr-8`}
                >
                  <option value="">Select Grade</option>
                  <option value="A">Grade A (Excellent)</option>
                  <option value="B">Grade B (Good)</option>
                  <option value="C">Grade C (Satisfactory)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Health & Physical Education</label>
              <div className="relative">
                <select
                  name="co_sports"
                  value={formik.values.co_sports || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${selectClasses} pr-8`}
                >
                  <option value="">Select Grade</option>
                  <option value="A">Grade A (Excellent)</option>
                  <option value="B">Grade B (Good)</option>
                  <option value="C">Grade C (Satisfactory)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={labelClasses}>General Knowledge & Social</label>
              <div className="relative">
                <select
                  name="co_gk"
                  value={formik.values.co_gk || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${selectClasses} pr-8`}
                >
                  <option value="">Select Grade</option>
                  <option value="A">Grade A (Excellent)</option>
                  <option value="B">Grade B (Good)</option>
                  <option value="C">Grade C (Satisfactory)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Discipline & Attendance */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#222]">
          <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Part III: Discipline & Attendance Evaluation
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelClasses}>Regularity & Punctuality</label>
              <div className="relative">
                <select
                  name="dis_punctuality"
                  value={formik.values.dis_punctuality || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${selectClasses} pr-8`}
                >
                  <option value="">Select Assessment</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Satisfactory">Satisfactory</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Sincerity & Values</label>
              <div className="relative">
                <select
                  name="dis_behavior"
                  value={formik.values.dis_behavior || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${selectClasses} pr-8`}
                >
                  <option value="">Select Grade</option>
                  <option value="Grade A">Grade A</option>
                  <option value="Grade B">Grade B</option>
                  <option value="Grade C">Grade C</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Attitude towards Peers/Teachers</label>
              <div className="relative">
                <select
                  name="dis_attitude"
                  value={formik.values.dis_attitude || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${selectClasses} pr-8`}
                >
                  <option value="">Select Assessment</option>
                  <option value="Courteous">Courteous</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Session Attendance (%)</label>
              <input
                type="text"
                name="dis_attendance"
                placeholder="e.g. 94.5"
                value={formik.values.dis_attendance || ""}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={inputClasses}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 4: Final Evaluation, Remarks & Live Performance Stats (At Bottom) ─────────────────────────────────────────── */}
      <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-[#222]">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Final Marksheet Result, Cumulative Remarks & Live Performance
            </h3>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
              Live aggregate percentage, overall promotion decision & printed report card remarks
            </p>
          </div>
          {subjectStats.percentage !== null && (
            <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              subjectStats.suggestedResult === "pass"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40"
                : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40"
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Suggested: {subjectStats.suggestedResult === "pass" ? "Pass" : "Fail"}</span>
            </div>
          )}
        </div>

        {/* Live Calculation Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Total Marks */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#1a1a1a]/80 border border-slate-200/70 dark:border-[#282828] space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Score
            </span>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">
              {subjectStats.evaluatedCount > 0 ? `${subjectStats.totalObtained} / ${subjectStats.totalMax}` : "—"}
            </p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
              {subjectStats.evaluatedCount} subject{subjectStats.evaluatedCount === 1 ? '' : 's'} evaluated
            </span>
          </div>

          {/* Percentage */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#1a1a1a]/80 border border-slate-200/70 dark:border-[#282828] space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Aggregate %
            </span>
            <p className={`text-lg font-extrabold ${
              subjectStats.percentage === null
                ? "text-slate-900 dark:text-white"
                : subjectStats.percentage >= 33
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}>
              {subjectStats.percentage !== null ? `${subjectStats.percentage.toFixed(1)}%` : "—"}
            </p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
              Min. 33% required to pass
            </span>
          </div>

          {/* Grade */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#1a1a1a]/80 border border-slate-200/70 dark:border-[#282828] space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Calculated Grade
            </span>
            <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
              {subjectStats.grade}
            </p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
              Standard grading scale
            </span>
          </div>

          {/* Subject Breakdown */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#1a1a1a]/80 border border-slate-200/70 dark:border-[#282828] space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Subject Status
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 pt-1">
              <span className="text-emerald-600 dark:text-emerald-400">{subjectStats.passedSubjects} Pass</span>
              {subjectStats.failedSubjects > 0 && (
                <span className="text-rose-600 dark:text-rose-400 ml-2">/ {subjectStats.failedSubjects} Fail</span>
              )}
            </p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
              Individual outcomes
            </span>
          </div>
        </div>

        {/* Result & Cumulative Remarks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {/* Overall Result Dropdown */}
          <div className="col-span-1">
            <label className={labelClasses}>Overall Result*</label>
            <div className="relative">
              <select
                name="result"
                value={formik.values.result}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`${selectClasses} pr-9 ${
                  formik.touched.result && formik.errors.result
                    ? "border-rose-400 ring-1 ring-rose-400"
                    : ""
                }`}
              >
                <option value="" disabled>Select Final Result</option>
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {formik.touched.result && formik.errors.result && (
              <p className={errorClasses}>{formik.errors.result}</p>
            )}
          </div>

          {/* Class Teacher's Cumulative Remarks */}
          <div className="col-span-1 md:col-span-2">
            <label className={labelClasses}>
              Class Teacher's Cumulative Remarks (Printed on Report Card)
            </label>
            <textarea
              rows={2}
              name="overall_remark"
              value={formik.values.overall_remark || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g. Demonstrates consistent scholastic aptitude, good participation, and disciplined conduct."
              className={`${inputClasses} resize-none py-2`}
            />
          </div>
        </div>
      </div>

    </form>
  );
};

MarksheetFormComponent.propTypes = {
  onChange: PropTypes.func,
  refId: PropTypes.shape({
    current: PropTypes.any,
  }),
  setDirty: PropTypes.func,
  reset: PropTypes.bool,
  setReset: PropTypes.func,
  userId: PropTypes.number,
  studentId: PropTypes.number,
  updatedValues: PropTypes.array,
};

export default MarksheetFormComponent;
