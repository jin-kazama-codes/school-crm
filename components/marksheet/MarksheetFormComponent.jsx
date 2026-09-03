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
        validated: formik.isSubmitting
          ? Object.keys(formik.errors).length === 0
          : false,
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

  const inputClass = (fieldName) => `w-full px-4 py-2 bg-white dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
    formik.touched[fieldName] && formik.errors[fieldName] 
    ? 'border-red-500 focus:ring-red-500/50' 
    : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500/50'
  } text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500`;
  
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
  const errorClass = "mt-1 text-sm text-red-500";

  return (
    <div className="p-6">
      <form ref={refId} onSubmit={formik.handleSubmit}>
        
        {/* Top Details Section */}
        <div className="p-6 mb-8 border-2 border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl">
            <h3 className="text-xl font-bold text-indigo-800 dark:text-indigo-300 mb-6">Marksheet Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div>
                    <label className={labelClass}>Session</label>
                    <select
                        name="session"
                        value={formik.values.session}
                        onChange={(e) => formik.setFieldValue("session", e.target.value)}
                        className={inputClass("session")}
                    >
                        <option value="" disabled>Select Session</option>
                        {createSession().map((session) => (
                            <option value={session} key={session}>{session}</option>
                        ))}
                    </select>
                    {formik.touched.session && formik.errors.session && <p className={errorClass}>{formik.errors.session}</p>}
                </div>
                
                <div>
                    <label className={labelClass}>Class</label>
                    <input
                        type="text"
                        name="class"
                        value={formik.values.class || ""}
                        readOnly
                        disabled
                        className={`${inputClass("class")} bg-slate-100 dark:bg-slate-800 cursor-not-allowed`}
                    />
                </div>
                
                <div>
                    <label className={labelClass}>Section</label>
                    <input
                        type="text"
                        name="section"
                        value={formik.values.section || ""}
                        readOnly
                        disabled
                        className={`${inputClass("section")} bg-slate-100 dark:bg-slate-800 cursor-not-allowed`}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClass}>Term</label>
                    <select
                        name="term"
                        value={formik.values.term}
                        onChange={formik.handleChange}
                        className={inputClass("term")}
                    >
                        <option value="" disabled>Select Term</option>
                        {Object.keys(config.term).map(item => (
                            <option key={item} value={item}>{config.term[item]}</option>
                        ))}
                    </select>
                    {formik.touched.term && formik.errors.term && <p className={errorClass}>{formik.errors.term}</p>}
                </div>
                
                <div>
                    <label className={labelClass}>Student</label>
                    <select
                        name="student"
                        value={formik.values.student || ""}
                        onChange={(e) => formik.setFieldValue("student", e.target.value)}
                        className={inputClass("student")}
                    >
                        <option value="" disabled>Select Student</option>
                        {allStudents?.listData?.rows?.map((item) => (
                            <option value={item.id} key={item.id}>
                                {`${item.firstname.charAt(0).toUpperCase() + item.firstname.slice(1)} ${item.lastname.charAt(0).toUpperCase() + item.lastname.slice(1)}`}
                            </option>
                        ))}
                    </select>
                    {formik.touched.student && formik.errors.student && <p className={errorClass}>{formik.errors.student}</p>}
                </div>
            </div>
        </div>

        {/* Subjects Marks Section */}
        <div className="p-6 mb-8 border-2 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-2xl overflow-x-auto">
            <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-6">Subject Marks</h3>
            
            <div className="min-w-[800px]">
                {/* Header Row */}
                <div className="grid grid-cols-6 gap-4 mb-4 pb-2 border-b-2 border-emerald-200 dark:border-emerald-800 text-sm font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    <div className="col-span-1 flex items-center">Subject</div>
                    <div className="col-span-1">Marks Obtained</div>
                    <div className="col-span-1">Total Marks</div>
                    <div className="col-span-1">Grade</div>
                    <div className="col-span-1">Remark</div>
                    <div className="col-span-1">Result</div>
                </div>

                {/* Subject Rows */}
                {marksheetClassData?.selectedSubjects?.map((subject, index) => (
                    <div key={index} className="grid grid-cols-6 gap-4 mb-4 items-center">
                        <div className="col-span-1 font-medium text-slate-700 dark:text-slate-300">
                            {subject?.name}
                        </div>
                        
                        <div className="col-span-1">
                            <input
                                type="text"
                                name={`marks_obtained_${index}`}
                                placeholder="Marks"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values[`marks_obtained_${index}`] || ""}
                                className={inputClass(`marks_obtained_${index}`)}
                            />
                            {formik.touched[`marks_obtained_${index}`] && formik.errors[`marks_obtained_${index}`] && 
                                <p className={errorClass}>{formik.errors[`marks_obtained_${index}`]}</p>}
                        </div>

                        <div className="col-span-1">
                            <input
                                type="text"
                                name={`total_marks_${index}`}
                                placeholder="Total"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values[`total_marks_${index}`] || ""}
                                className={inputClass(`total_marks_${index}`)}
                            />
                            {formik.touched[`total_marks_${index}`] && formik.errors[`total_marks_${index}`] && 
                                <p className={errorClass}>{formik.errors[`total_marks_${index}`]}</p>}
                        </div>

                        <div className="col-span-1">
                            <input
                                type="text"
                                name={`grade_${index}`}
                                placeholder="Grade"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values[`grade_${index}`] || ""}
                                className={inputClass(`grade_${index}`)}
                            />
                            {formik.touched[`grade_${index}`] && formik.errors[`grade_${index}`] && 
                                <p className={errorClass}>{formik.errors[`grade_${index}`]}</p>}
                        </div>

                        <div className="col-span-1">
                            <input
                                type="text"
                                name={`remark_${index}`}
                                placeholder="Remark"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values[`remark_${index}`] || ""}
                                className={inputClass(`remark_${index}`)}
                            />
                            {formik.touched[`remark_${index}`] && formik.errors[`remark_${index}`] && 
                                <p className={errorClass}>{formik.errors[`remark_${index}`]}</p>}
                        </div>

                        <div className="col-span-1">
                            <select
                                name={`result_${index}`}
                                value={formik.values[`result_${index}`] || ""}
                                onChange={(e) => formik.setFieldValue(`result_${index}`, e.target.value)}
                                className={inputClass(`result_${index}`)}
                            >
                                <option value="" disabled>Select Result</option>
                                <option value="pass">Pass</option>
                                <option value="fail">Fail</option>
                            </select>
                            {formik.touched[`result_${index}`] && formik.errors[`result_${index}`] && 
                                <p className={errorClass}>{formik.errors[`result_${index}`]}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Final Result Section */}
        <div className="w-full md:w-1/3">
            <label className={labelClass}>Final Result</label>
            <select
                name="result"
                value={formik.values.result}
                onChange={formik.handleChange}
                className={inputClass("result")}
            >
                <option value="" disabled>Select Final Result</option>
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
            </select>
            {formik.touched.result && formik.errors.result && <p className={errorClass}>{formik.errors.result}</p>}
        </div>
      </form>
    </div>
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
