/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import dayjs from "dayjs";
import { ChevronDown, Plus, Trash2, UserCheck, BookOpen, Layers } from "lucide-react";

import teacherValidation from "./Validation";

import { setSchoolClasses } from "../../redux/actions/ClassAction";
import { setSchoolSections } from "../../redux/actions/SectionAction";
import { setSchoolSubjects } from "../../redux/actions/SubjectAction";
import { Utility } from "../utility";
import config from "../config";

const initialValues = {
  firstname: "",
  lastname: "",
  email: "",
  contact_no: "",
  dob: null,
  age: "",
  nationality: "indian",
  religion: "",
  blood_group: "",
  qualification: "",
  achievements: "",
  experience: "",
  classes: [],
  sections: [],
  subjects: [[]],
  grade: "",
  is_specially_abled: false,
  is_class_teacher: false,
  class: "",
  section: "",
  caste_group: "",
  gender: "",
  status: "active",
};

const TeacherFormComponent = ({
  onChange,
  refId,
  setDirty,
  reset,
  setReset,
  classData,
  setClassData,
  allSubjects,
  allSections,
  updatedValues = null,
}) => {
  const [initialState, setInitialState] = useState(initialValues);
  const schoolClasses = useSelector((state) => state.schoolClasses);
  const schoolSections = useSelector((state) => state.schoolSections);
  const schoolSubjects = useSelector((state) => state.schoolSubjects);

  const dispatch = useDispatch();
  const { fetchAndSetSchoolData, getLocalStorage, findMultipleById } = Utility();

  const formik = useFormik({
    initialValues: initialState,
    validationSchema: teacherValidation,
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

  const getAndSetSubjects = () => {
    const sectionSubjects = {};
    classData.forEach((obj) => {
      if (
        (formik.values.classes.includes(`${obj.class_id}`) || formik.values.classes.includes(obj.class_id)) &&
        formik.values.sections.some((sectionArray) =>
          sectionArray.some(
            (sectionObj) => sectionObj.section_id === obj.section_id
          )
        )
      ) {
        if (!sectionSubjects[obj.class_id]) {
          sectionSubjects[obj.class_id] = {};
        }
        const selectedSubjects = findMultipleById(obj.subject_ids, allSubjects);
        sectionSubjects[obj.class_id][obj.section_id] = selectedSubjects;
      }
    });
    dispatch(setSchoolSubjects(sectionSubjects));
  };

  const getAndSetSections = () => {
    const selectedSectionsSet = new Set();
    for (const obj of classData) {
      if (
        (formik.values.classes.length &&
          formik.values.classes.includes(
            initialState?.sections?.length ? `${obj.class_id}` : obj.class_id
          )) ||
        (!formik.values.classes.length && obj.class_id === formik.values.class)
      ) {
        selectedSectionsSet.add({
          section_id: obj.section_id,
          section_name: obj.section_name,
        });
      }
    }
    const selectedSectionsArray = Array.from(selectedSectionsSet);
    const filteredSections = allSections.filter((section) =>
      selectedSectionsArray.some(
        (selectedSection) => selectedSection.section_id === section.section_id
      )
    );
    dispatch(setSchoolSections(filteredSections));
  };

  useEffect(() => {
    if (
      formik.values.sections.some((innerArray) => innerArray.length > 0) &&
      classData.length
    ) {
      getAndSetSubjects();
    }
  }, [formik.values?.sections, classData.length]);

  useEffect(() => {
    if ((formik.values?.classes || formik.values?.class) && classData.length) {
      getAndSetSections();
    }
  }, [formik.values?.classes, formik.values?.class, classData.length]);

  useEffect(() => {
    if (
      getLocalStorage("schoolInfo") &&
      (!schoolSubjects?.listData?.length ||
        !schoolClasses?.listData?.length ||
        !schoolSections?.listData?.length)
    ) {
      fetchAndSetSchoolData(
        dispatch,
        setSchoolClasses,
        setSchoolSections,
        setClassData
      );
    }
  }, [classData.length]);

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
    if (updatedValues) {
      const splittedArray = updatedValues.selectedClass.reduce((acc, obj) => {
        const key = obj.class_id;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
      }, {});

      const hasData = splittedArray && Object.keys(splittedArray).length > 0;

      const assignUpdatedSections = (sectionData) => {
        let filteredSectionArray = [];
        sectionData.map((sections) => {
          let filteredSection = allSections?.filter((obj) =>
            sections.some((sect) => sect.section_id === obj.section_id)
          );
          filteredSectionArray.push(filteredSection);
        });
        return filteredSectionArray;
      };

      const assignUpdatedSubjects = (splittedArray) => {
        const subArr = [[]];
        Object.keys(splittedArray).map((field, index) => {
          Object.values(splittedArray)[index].map((section, sectionIndex) => {
            const value = findMultipleById(section.subject_ids, allSubjects);
            if (index > 0 && sectionIndex === 0) {
              subArr[index] = [];
            }
            subArr[index][sectionIndex] = value;
          });
        });
        return subArr;
      };

      setInitialState({
        ...initialState,
        ...updatedValues.teacherData,
        classes: hasData ? Object.keys(splittedArray) : [],
        sections: hasData
          ? assignUpdatedSections(Object.values(splittedArray))
          : [],
        subjects: hasData ? assignUpdatedSubjects(splittedArray) : [[]],
      });
    }
  }, [updatedValues]);

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    return dayjs(dateValue).format('YYYY-MM-DD');
  };

  const handleDateChange = (field, e) => {
    const val = e.target.value;
    formik.setFieldValue(field, val ? dayjs(val) : null);
  };

  const inputClasses =
    "w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2e2e2e] rounded-xl shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500";

  const selectClasses =
    "w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2e2e2e] rounded-xl shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all outline-none text-slate-900 dark:text-slate-100 cursor-pointer appearance-none";

  const multiSelectClasses =
    "w-full px-3 py-2 text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2e2e2e] rounded-xl shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all outline-none text-slate-900 dark:text-slate-100";

  const labelClasses =
    "block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5";

  const errorClasses = "text-rose-500 text-xs mt-1 ml-0.5 font-medium";

  return (
    <form ref={refId} onSubmit={formik.handleSubmit} className="space-y-6">
      
      {/* ── CARD 1: Basic Information ────────────────────────────────────────── */}
      <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#222]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Basic Information & Profile
          </h3>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Teacher Identity & Personal Details
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* First Name */}
          <div className="lg:col-span-2">
            <label className={labelClasses}>Firstname*</label>
            <input
              type="text"
              name="firstname"
              placeholder="Enter first name"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.firstname}
              className={`${inputClasses} ${
                formik.touched.firstname && formik.errors.firstname
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
              }`}
            />
            {formik.touched.firstname && formik.errors.firstname && (
              <p className={errorClasses}>{formik.errors.firstname}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="lg:col-span-2">
            <label className={labelClasses}>Lastname*</label>
            <input
              type="text"
              name="lastname"
              placeholder="Enter last name"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.lastname}
              className={`${inputClasses} ${
                formik.touched.lastname && formik.errors.lastname
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
              }`}
            />
            {formik.touched.lastname && formik.errors.lastname && (
              <p className={errorClasses}>{formik.errors.lastname}</p>
            )}
          </div>

          {/* Email */}
          <div className="lg:col-span-2">
            <label className={labelClasses}>Email*</label>
            <input
              type="email"
              name="email"
              placeholder="teacher@school.com"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.email}
              className={`${inputClasses} ${
                formik.touched.email && formik.errors.email
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
              }`}
            />
            {formik.touched.email && formik.errors.email && (
              <p className={errorClasses}>{formik.errors.email}</p>
            )}
          </div>

          {/* Contact Number */}
          <div className="lg:col-span-2">
            <label className={labelClasses}>Contact Number*</label>
            <input
              type="text"
              name="contact_no"
              placeholder="10-digit mobile number"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.contact_no}
              className={`${inputClasses} ${
                formik.touched.contact_no && formik.errors.contact_no
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
              }`}
            />
            {formik.touched.contact_no && formik.errors.contact_no && (
              <p className={errorClasses}>{formik.errors.contact_no}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className={labelClasses}>Date Of Birth*</label>
            <input
              type="date"
              name="dob"
              onBlur={formik.handleBlur}
              onChange={(e) => handleDateChange("dob", e)}
              value={formatDateForInput(formik.values.dob)}
              className={`${inputClasses} ${
                formik.touched.dob && formik.errors.dob
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
              }`}
            />
            {formik.touched.dob && formik.errors.dob && (
              <p className={errorClasses}>{formik.errors.dob}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className={labelClasses}>Gender</label>
            <div className="relative">
              <select
                name="gender"
                value={formik.values.gender}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`${selectClasses} pr-9 ${
                  formik.touched.gender && formik.errors.gender
                    ? "border-rose-400 ring-1 ring-rose-400"
                    : ""
                }`}
              >
                <option value="" disabled>Select Gender</option>
                {Object.keys(config.gender).map((item) => (
                  <option key={item} value={item}>{config.gender[item]}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {formik.touched.gender && formik.errors.gender && (
              <p className={errorClasses}>{formik.errors.gender}</p>
            )}
          </div>

          {/* Blood Group */}
          <div>
            <label className={labelClasses}>Blood Group</label>
            <div className="relative">
              <select
                name="blood_group"
                value={formik.values.blood_group}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`${selectClasses} pr-9 ${
                  formik.touched.blood_group && formik.errors.blood_group
                    ? "border-rose-400 ring-1 ring-rose-400"
                    : ""
                }`}
              >
                <option value="" disabled>Select Blood Group</option>
                {Object.keys(config.bloodGroups).map((bloodGroup) => (
                  <option key={bloodGroup} value={bloodGroup}>{config.bloodGroups[bloodGroup]}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {formik.touched.blood_group && formik.errors.blood_group && (
              <p className={errorClasses}>{formik.errors.blood_group}</p>
            )}
          </div>

          {/* Nationality */}
          <div>
            <label className={labelClasses}>Nationality</label>
            <div className="relative">
              <select
                name="nationality"
                value={formik.values.nationality}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`${selectClasses} pr-9 ${
                  formik.touched.nationality && formik.errors.nationality
                    ? "border-rose-400 ring-1 ring-rose-400"
                    : ""
                }`}
              >
                {Object.keys(config.nationality).map((casteGroup) => (
                  <option key={casteGroup} value={casteGroup}>
                    {config.nationality[casteGroup]}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {formik.touched.nationality && formik.errors.nationality && (
              <p className={errorClasses}>{formik.errors.nationality}</p>
            )}
          </div>

          {/* Religion */}
          <div>
            <label className={labelClasses}>Religion</label>
            <input
              type="text"
              name="religion"
              placeholder="e.g. Hindu, Muslim, Christian"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.religion}
              className={`${inputClasses} ${
                formik.touched.religion && formik.errors.religion
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
              }`}
            />
            {formik.touched.religion && formik.errors.religion && (
              <p className={errorClasses}>{formik.errors.religion}</p>
            )}
          </div>

          {/* Caste Group */}
          <div>
            <label className={labelClasses}>Caste Group</label>
            <div className="relative">
              <select
                name="caste_group"
                value={formik.values.caste_group}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`${selectClasses} pr-9 ${
                  formik.touched.caste_group && formik.errors.caste_group
                    ? "border-rose-400 ring-1 ring-rose-400"
                    : ""
                }`}
              >
                <option value="" disabled>Select Caste Group</option>
                <option value="general">General</option>
                <option value="obc">OBC</option>
                <option value="sc">SC</option>
                <option value="st">ST</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {formik.touched.caste_group && formik.errors.caste_group && (
              <p className={errorClasses}>{formik.errors.caste_group}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className={labelClasses}>Status</label>
            <div className="relative">
              <select
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`${selectClasses} pr-9 ${
                  formik.touched.status && formik.errors.status
                    ? "border-rose-400 ring-1 ring-rose-400"
                    : ""
                }`}
              >
                {Object.keys(config.status).map((item) => (
                  <option key={item} value={item}>{config.status[item]}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {formik.touched.status && formik.errors.status && (
              <p className={errorClasses}>{formik.errors.status}</p>
            )}
          </div>

          {/* Is Specially Abled */}
          <div className="lg:col-span-4 p-4 rounded-xl border border-slate-200/80 dark:border-[#262626] bg-slate-50/50 dark:bg-[#181818]/60">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_specially_abled"
                checked={formik.values.is_specially_abled}
                onChange={(e) => formik.setFieldValue("is_specially_abled", e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500/20 border-slate-300 dark:border-slate-600 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
                  Specially Abled Teacher
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                  Check if faculty requires special educational or accessibility accommodations
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* ── CARD 2: Professional & Academic Qualifications ───────────────────── */}
      <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#222]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Professional & Academic Details
          </h3>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Educational Credentials & Experience
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Qualification */}
          <div>
            <label className={labelClasses}>Qualification</label>
            <input
              type="text"
              name="qualification"
              placeholder="e.g. M.Sc, B.Ed, PhD"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.qualification}
              className={`${inputClasses} ${
                formik.touched.qualification && formik.errors.qualification
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
              }`}
            />
            {formik.touched.qualification && formik.errors.qualification && (
              <p className={errorClasses}>{formik.errors.qualification}</p>
            )}
          </div>

          {/* Experience */}
          <div>
            <label className={labelClasses}>Experience</label>
            <input
              type="text"
              name="experience"
              placeholder="e.g. 5 Years"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.experience}
              className={`${inputClasses} ${
                formik.touched.experience && formik.errors.experience
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
              }`}
            />
            {formik.touched.experience && formik.errors.experience && (
              <p className={errorClasses}>{formik.errors.experience}</p>
            )}
          </div>

          {/* Grade */}
          <div className="lg:col-span-2">
            <label className={labelClasses}>Grade / Designation</label>
            <div className="relative">
              <select
                name="grade"
                value={formik.values.grade}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`${selectClasses} pr-9 ${
                  formik.touched.grade && formik.errors.grade
                    ? "border-rose-400 ring-1 ring-rose-400"
                    : ""
                }`}
              >
                <option value="" disabled>Select Grade</option>
                {Object.keys(config.grade).map((grade) => (
                  <option key={grade} value={grade}>{config.grade[grade]}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {formik.touched.grade && formik.errors.grade && (
              <p className={errorClasses}>{formik.errors.grade}</p>
            )}
          </div>

          {/* Achievements */}
          <div className="lg:col-span-4">
            <label className={labelClasses}>Achievements & Certifications</label>
            <input
              type="text"
              name="achievements"
              placeholder="e.g. State Best Teacher Award 2024, Published Research in Science Education"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.achievements}
              className={`${inputClasses} ${
                formik.touched.achievements && formik.errors.achievements
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
              }`}
            />
            {formik.touched.achievements && formik.errors.achievements && (
              <p className={errorClasses}>{formik.errors.achievements}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── CARD 3: Teaching Allocation & Class Teacher Role ─────────────────── */}
      <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#222]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Teaching Allocation & Roles
          </h3>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Class Teacher Assignment & Subject Mapping
          </span>
        </div>

        <div className="space-y-6">
          {/* Class Teacher Role Strip */}
          <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_class_teacher"
                checked={formik.values.is_class_teacher}
                onChange={(e) => formik.setFieldValue("is_class_teacher", e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500/20 border-slate-300 dark:border-slate-600 cursor-pointer"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                Appoint as Class Teacher
              </span>
            </label>

            {formik.values.is_class_teacher && (
              <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-900/40 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                <div>
                  <label className={labelClasses}>Assigned Class*</label>
                  <div className="relative">
                    <select
                      name="class"
                      value={formik.values.class}
                      onChange={(e) => {
                        formik.setFieldValue("class", e.target.value);
                        if (formik.values.section) formik.setFieldValue("section", "");
                      }}
                      onBlur={formik.handleBlur}
                      className={`${selectClasses} pr-9 ${
                        formik.touched.class && formik.errors.class
                          ? "border-rose-400 ring-1 ring-rose-400"
                          : ""
                      }`}
                    >
                      <option value="" disabled>Select Class</option>
                      {schoolClasses?.listData?.map((cls) => (
                        <option value={cls.class_id} key={cls.class_id}>{cls.class_name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {formik.touched.class && formik.errors.class && (
                    <p className={errorClasses}>{formik.errors.class}</p>
                  )}
                </div>

                <div>
                  <label className={labelClasses}>Assigned Section*</label>
                  <div className="relative">
                    <select
                      name="section"
                      value={formik.values.section}
                      onChange={(e) => formik.setFieldValue("section", e.target.value)}
                      onBlur={formik.handleBlur}
                      className={`${selectClasses} pr-9 ${
                        formik.touched.section && formik.errors.section
                          ? "border-rose-400 ring-1 ring-rose-400"
                          : ""
                      }`}
                    >
                      <option value="" disabled>Select Section</option>
                      {schoolSections?.listData?.map((section) => (
                        <option value={section.section_id} key={section.section_id}>{section.section_name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {formik.touched.section && formik.errors.section && (
                    <p className={errorClasses}>{formik.errors.section}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Validation summary error for classes/sections */}
          {((formik.touched.classes && formik.errors.classes) || (formik.touched.sections && formik.errors.sections)) && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {formik.errors.classes || formik.errors.sections}
            </div>
          )}

          {/* Allocated Classes List */}
          <div className="space-y-5">
            {formik.values.classes.map((field, index) => {
              const key = index + 1;
              return (
                <div
                  key={key}
                  className="p-5 rounded-2xl bg-slate-50/80 dark:bg-[#181818] border border-slate-200/80 dark:border-[#282828] space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-[#282828]">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                        {key}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Class Allocation #{key}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newClasses = formik.values.classes.filter((_, i) => i !== index);
                        const newSections = formik.values.sections.filter((_, i) => i !== index);
                        const newSubjects = formik.values.subjects.filter((_, i) => i !== index);
                        formik.setFieldValue("classes", newClasses);
                        formik.setFieldValue("sections", newSections);
                        formik.setFieldValue("subjects", newSubjects.length ? newSubjects : [[]]);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClasses}>Select Class*</label>
                      <div className="relative">
                        <select
                          name={`classes.${key}`}
                          value={formik.values.classes[index]}
                          onChange={(e) => {
                            const subArr = [...formik.values.classes];
                            subArr[index] = e.target.value;
                            formik.setFieldValue("classes", subArr);
                            if (!updatedValues) {
                              if (formik.values.sections) formik.setFieldValue("sections", []);
                              if (formik.values.subjects) formik.setFieldValue("subjects", [[]]);
                            }
                          }}
                          className={`${selectClasses} pr-9`}
                        >
                          <option value="" disabled>Select Class</option>
                          {schoolClasses?.listData?.map((cls) => (
                            <option value={cls.class_id} key={cls.class_id}>{cls.class_name}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Select Sections*
                        </label>
                        <span className="text-[10px] text-slate-400 font-medium">Ctrl/Cmd click to select multiple</span>
                      </div>
                      <select
                        multiple
                        name={`sections.${key}`}
                        value={(formik.values.sections[index] || []).map(s => s.section_id)}
                        onChange={(e) => {
                          const selectedOptions = Array.from(e.target.selectedOptions);
                          const selectedValues = selectedOptions.map(option => {
                            return (schoolSections?.listData || []).find(sec => sec.section_id == option.value);
                          }).filter(Boolean);
                          
                          const sectArr = [...formik.values.sections];
                          sectArr[index] = selectedValues;
                          formik.setFieldValue("sections", sectArr);
                        }}
                        className={`${multiSelectClasses} h-24`}
                      >
                        {schoolSections?.listData?.map((section) => (
                          <option value={section.section_id} key={section.section_id} className="py-1 px-1.5 rounded">
                            {section.section_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Section Subjects Allocation */}
                  {formik?.values?.sections[index]?.map((section, sectionIndex) => (
                    <div
                      key={`${key}-${sectionIndex}`}
                      className="p-4 rounded-xl bg-white/70 dark:bg-[#121212]/70 border border-slate-200/70 dark:border-[#252525] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          Subjects for Section {section.section_name}
                        </label>
                        <span className="text-[10px] text-slate-400 font-medium">Ctrl/Cmd click to multiselect</span>
                      </div>
                      <select
                        multiple
                        name={`subjects.${index}.${sectionIndex}`}
                        value={(formik.values.subjects[index] ? formik.values.subjects[index][sectionIndex] || [] : []).map(s => s.id)}
                        onChange={(e) => {
                          const selectedOptions = Array.from(e.target.selectedOptions);
                          const availableSubjects = schoolSubjects?.listData?.[formik.values.classes[index]]?.[section.section_id] || [];
                          const selectedValues = selectedOptions.map(option => {
                            return availableSubjects.find(sub => sub.id == option.value);
                          }).filter(Boolean);

                          const subArr = [...formik.values.subjects];
                          if (index > 0 && sectionIndex === 0) {
                            subArr[index] = [];
                          }
                          if (!subArr[index]) subArr[index] = [];
                          subArr[index][sectionIndex] = selectedValues;
                          formik.setFieldValue("subjects", subArr);
                        }}
                        className={`${multiSelectClasses} h-24`}
                      >
                        {(schoolSubjects?.listData?.[formik.values.classes[index]]?.[section.section_id] || []).map((sub) => (
                          <option value={sub.id} key={sub.id} className="py-1 px-1.5 rounded">
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Add Another Class Allocation Block */}
            <div className="p-5 rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5" />
                </span>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Add Additional Class Allocation
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClasses}>Assign Class</label>
                  <div className="relative">
                    <select
                      value=""
                      onChange={(e) => {
                        const subArr = [...formik.values.classes];
                        subArr[formik.values.classes.length] = e.target.value;
                        formik.setFieldValue("classes", subArr);
                      }}
                      className={`${selectClasses} pr-9`}
                    >
                      <option value="" disabled>Select Class to Allocate</option>
                      {schoolClasses?.listData?.filter(cls => !formik.values.classes.includes(cls.class_id)).map((cls) => (
                        <option value={cls.class_id} key={cls.class_id}>{cls.class_name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>Section (Select Class First)</label>
                  <select
                    multiple
                    value={[]}
                    disabled
                    className={`${multiSelectClasses} h-20 opacity-50 cursor-not-allowed`}
                  >
                    <option disabled>Select Class First to View Sections</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </form>
  );
};

TeacherFormComponent.propTypes = {
  onChange: PropTypes.func,
  refId: PropTypes.shape({
    current: PropTypes.any,
  }),
  setDirty: PropTypes.func,
  reset: PropTypes.bool,
  setReset: PropTypes.func,
  classData: PropTypes.array,
  setClassData: PropTypes.func,
  allSubjects: PropTypes.array,
  allSections: PropTypes.array,
  updatedValues: PropTypes.object,
};

export default TeacherFormComponent;
