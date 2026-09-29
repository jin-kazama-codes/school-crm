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
      let subjectIds = [];
      updatedValues.marksheetMappingData.map((sub, index) => {
        formik.setFieldValue(`marks_obtained_${index}`, sub.marks_obtained);
        formik.setFieldValue(`total_marks_${index}`, sub.total_marks);
        formik.setFieldValue(`grade_${index}`, sub.grade);
        formik.setFieldValue(`remark_${index}`, sub.remark);
        formik.setFieldValue(`result_${index}`, sub.result);
        formik.setFieldValue(`dbId_${index}`, sub.id);
        subjectIds.push(sub.subject_id.toString());
      });
      let classSubjects;
      if (subjectIds?.length) {
        classSubjects = findMultipleById(subjectIds.join(","), allSubjects?.listData);
      }
      formik.setFieldValue("session", updatedValues.marksheetData[0]?.session);
      formik.setFieldValue("student", updatedValues.marksheetData[0]?.student_id);
      formik.setFieldValue("term", updatedValues.marksheetData[0]?.term);
      formik.setFieldValue("result", updatedValues.marksheetData[0]?.result);

      dispatch(
        setMarksheetClassData({
          ...marksheetClassData,
          selectedSubjects: classSubjects,
        })
      );
    }
  }, [updatedValues]);

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
            Per-subject scores, total points, grades, remarks & pass/fail
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
                  onBlur={formik.handleBlur}
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
                  onBlur={formik.handleBlur}
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

      {/* ── CARD 3: Final Evaluation ─────────────────────────────────────────── */}
      <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-[#222]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Final Marksheet Result
          </h3>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Overall promotion & performance status
          </span>
        </div>

        <div className="max-w-xs">
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
