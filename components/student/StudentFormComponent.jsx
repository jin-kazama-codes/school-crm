/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import dayjs from "dayjs";

import API from "../../apis";
import Toast from "../common/Toast";
import studentValidation from "./Validation";

import { setSchoolClasses } from "../../redux/actions/ClassAction";
import { setSchoolSections } from "../../redux/actions/SectionAction";
import { setSchoolSubjects } from "../../redux/actions/SubjectAction";
import { setBuses } from "../../redux/actions/BusAction";
import { setListingSchoolHouses } from "../../redux/actions/SchoolHouseAction";

import { Utility } from "../utility";
import { useCommon } from "../hooks/common";
import config from "../config";

const initialValues = {
  session: "",
  firstname: "",
  lastname: "",
  mother_name: "",
  mother_contact_no: "",
  mother_aadhar: "",
  father_name: "",
  father_contact_no: "",
  father_aadhar: "",
  guardian_name: "",
  guardian_contact_no: "",
  guardian_aadhar: "",
  house: "",
  contact_no: "",
  email: "",
  class: "",
  section: "",
  subjects: [],
  dob: null,
  admission_date: null,
  admission_type: "regular",
  is_specially_abled: false,
  is_taking_bus: false,
  bus: "",
  blood_group: "",
  birth_mark: "",
  religion: "",
  nationality: "indian",
  age: "",
  aadhaar_no: "",
  caste_group: "",
  gender: "",
  head: 0,
  status: "active",
  is_fee_waiver: false,
  fee_waiver_type: "",
  waived_fees: "",
};

const StudentFormComponent = ({
  onChange,
  refId,
  setDirty,
  reset,
  setReset,
  classData,
  iCardDetails,
  setICardDetails,
  setClassData,
  allSubjects,
  userId,
  updatedValues = null,
}) => {
  const [initialState, setInitialState] = useState(initialValues);
  const schoolClasses = useSelector((state) => state.schoolClasses);
  const schoolSections = useSelector((state) => state.schoolSections);
  const schoolSubjects = useSelector((state) => state.schoolSubjects);
  const toastInfo = useSelector((state) => state.toastInfo);
  const allBuses = useSelector((state) => state.allBuses);
  const listingSchoolHouses = useSelector((state) => state.listingSchoolHouses);

  const dispatch = useDispatch();
  const genderRef = useRef();

  const { getPaginatedData } = useCommon();
  const {
    createSession,
    fetchAndSetSchoolData,
    getLocalStorage,
    getValuesFromArray,
    toastAndNavigate,
  } = Utility();

  const formik = useFormik({
    initialValues: initialState,
    validationSchema: studentValidation,
    enableReinitialize: true,
    validateOnBlur: true,
    validateOnChange: true,
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
        dirty: formik.dirty
      });
    }
  };

  const validateHead = () => {
    const condition = { gender: formik.values.gender };
    API.StudentAPI.getAll(condition)
      .then((res) => {
        if (res.status === "Success") {
          toastAndNavigate(
            dispatch,
            true,
            "warning",
            `Can not appoint Head ${formik.values.gender}`
          );
        }
      })
      .catch((err) => {
        console.error("An error occurred in validate head function: ", err);
      });
  };

  const getAndSetSubjects = () => {
    const sectionSubjects = classData?.filter(
      (obj) =>
        obj.class_id === formik.values.class &&
        obj.section_id === formik.values?.section
    );
    const selectedSubjects = sectionSubjects
      ? getValuesFromArray(sectionSubjects[0]?.subject_ids, allSubjects)
      : [];
    dispatch(setSchoolSubjects(selectedSubjects));
  };

  const getAndSetSections = () => {
    const classSections =
      classData?.filter((obj) => obj.class_id === formik.values.class) || [];
    const selectedSections = classSections.map(
      ({ section_id, section_name }) => ({ section_id, section_name })
    );
    dispatch(setSchoolSections(selectedSections));
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
    if (updatedValues) {
      setInitialState(updatedValues);
    }
  }, [updatedValues]);

  useEffect(() => {
    if (!allBuses?.listData?.rows?.length) {
      getPaginatedData(0, 40, setBuses, API.BusAPI);
    }
  }, []);

  useEffect(() => {
    if (!listingSchoolHouses?.listData?.rows?.length) {
      getPaginatedData(0, 40, setListingSchoolHouses, API.SchoolHouseAPI);
    }
  }, []);

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
  }, []);

  useEffect(() => {
    if (formik.values) {
      setICardDetails({
        ...iCardDetails,
        ...formik.values,
      });
    }
  }, [formik.values]);

  useEffect(() => {
    const selectedClassId = parseInt(getLocalStorage("class"));
    if (selectedClassId) {
      formik.setFieldValue("class", selectedClassId);
    }
  }, [getLocalStorage("class")]);

  useEffect(() => {
    if (formik.values.section) {
      getAndSetSubjects();
    }
  }, [formik.values?.section]);

  useEffect(() => {
    if (formik.values.class) {
      getAndSetSections();
    }
  }, [formik.values?.class, classData?.length]);

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    return dayjs(dateValue).format('YYYY-MM-DD');
  };

  const handleDateChange = (field, e) => {
    const val = e.target.value;
    formik.setFieldValue(field, val ? dayjs(val) : null);
  };

  const handleSubjectsChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedValues = selectedOptions.map(option => {
        return (schoolSubjects?.listData || []).find(sub => sub.id == option.value);
    }).filter(Boolean);
    formik.setFieldValue("subjects", selectedValues);
  };

  const inputClass = (fieldName) =>
    `w-full px-4 py-2.5 bg-white dark:bg-[#1e1e1e] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
      formik.touched[fieldName] && formik.errors[fieldName]
        ? 'border-red-400 focus:ring-red-500/40 bg-red-50/30 dark:bg-red-900/10'
        : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500/40 hover:border-slate-300 dark:hover:border-slate-600'
    }`;

  const selectClass = (fieldName) =>
    `${inputClass(fieldName)} appearance-none cursor-pointer`;

  const labelClass = "block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5";
  const errorClass = "mt-1 text-xs text-red-500 font-medium";

  const SectionHeader = ({ icon, title, subtitle }) => (
    <div className="col-span-1 md:col-span-2 flex items-center gap-3 pt-2 pb-1">
      <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-base">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800 ml-2" />
    </div>
  );

  return (
    <div className="p-6 md:p-8">
      <form ref={refId} onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* ── Section: Personal Information ─────────────────────────── */}
          <SectionHeader icon="👤" title="Personal Information" subtitle="Basic student identity details" />

          <div className="col-span-1">
            <label className={labelClass}>Session*</label>
            <select
              name="session"
              value={formik.values.session}
              onChange={(e) => formik.setFieldValue("session", e.target.value)}
              onBlur={formik.handleBlur}
              className={inputClass("session")}
            >
              <option value="" disabled>Select Session</option>
              {createSession().map((session) => (
                <option value={session} key={session}>{session}</option>
              ))}
            </select>
            {formik.touched.session && formik.errors.session && <p className={errorClass}>{formik.errors.session}</p>}
          </div>

          {/* First Name */}
          <div className="col-span-1">
            <label className={labelClass}>Firstname*</label>
            <input
              type="text"
              name="firstname"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.firstname}
              className={inputClass("firstname")}
            />
            {formik.touched.firstname && formik.errors.firstname && <p className={errorClass}>{formik.errors.firstname}</p>}
          </div>

          {/* Last Name */}
          <div className="col-span-1">
            <label className={labelClass}>Lastname*</label>
            <input
              type="text"
              name="lastname"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.lastname}
              className={inputClass("lastname")}
            />
            {formik.touched.lastname && formik.errors.lastname && <p className={errorClass}>{formik.errors.lastname}</p>}
          </div>

          {/* Contact Number */}
          <div className="col-span-1">
            <label className={labelClass}>Contact Number*</label>
            <input
              type="text"
              name="contact_no"
              placeholder="e.g. 9876543210"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.contact_no}
              className={inputClass("contact_no")}
            />
            {formik.touched.contact_no && formik.errors.contact_no && <p className={errorClass}>{formik.errors.contact_no}</p>}
          </div>

          {/* Email */}
          <div className="col-span-1">
            <label className={labelClass}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="student@example.com"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.email}
              className={inputClass("email")}
            />
            {formik.touched.email && formik.errors.email && <p className={errorClass}>{formik.errors.email}</p>}
          </div>

          {/* Aadhaar Number */}
          <div className="col-span-1 md:col-span-2">
            <label className={labelClass}>Aadhaar Number*</label>
            <input
              type="text"
              name="aadhaar_no"
              placeholder="12-digit Aadhaar number"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.aadhaar_no}
              className={inputClass("aadhaar_no")}
            />
            {formik.touched.aadhaar_no && formik.errors.aadhaar_no && <p className={errorClass}>{formik.errors.aadhaar_no}</p>}
          </div>

          {/* Is Specially Abled */}
          <div className="col-span-1 flex items-center">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors w-full">
              <input
                type="checkbox"
                name="is_specially_abled"
                checked={formik.values.is_specially_abled}
                onChange={(e) => formik.setFieldValue("is_specially_abled", e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Specially Abled</span>
                <p className="text-xs text-slate-400">Check if applicable</p>
              </div>
            </label>
          </div>

          {/* Gender */}
          <div className="col-span-1">
            <label className={labelClass}>Gender</label>
            <select
              ref={genderRef}
              name="gender"
              value={formik.values.gender}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={selectClass("gender")}
            >
              <option value="" disabled>Select Gender</option>
              {Object.keys(config.gender).map((item) => (
                <option key={item} value={item}>{config.gender[item]}</option>
              ))}
            </select>
            {formik.touched.gender && formik.errors.gender && <p className={errorClass}>{formik.errors.gender}</p>}
          </div>

          {/* ── Section: Academic Details ──────────────────────────────── */}
          <SectionHeader icon="🎓" title="Academic Details" subtitle="Class, section and enrollment info" />

          {userId && (
            <div className="col-span-1 md:col-span-2">
              <label className={labelClass}>
                {updatedValues?.gender === "male" ? "Head Boy" : updatedValues?.gender === "female" ? "Head Girl" : "Head of School"}
              </label>
              <select
                name="head"
                value={formik.values.head}
                onChange={(e) => {
                  if (formik.values.gender) {
                    formik.setFieldValue("head", e.target.value);
                    if (e.target.value == 1) { validateHead(); }
                  } else {
                    toastAndNavigate(dispatch, true, "info", "Please Select Gender");
                  }
                }}
                onBlur={formik.handleBlur}
                className={selectClass("head")}
              >
                {Object.keys(config.head).map((item) => (
                  <option key={item} value={item}>{config.head[item]}</option>
                ))}
              </select>
              {formik.touched.head && formik.errors.head && <p className={errorClass}>{formik.errors.head}</p>}
            </div>
          )}

          {/* DOB */}
          <div className="col-span-1">
            <label className={labelClass}>Date Of Birth*</label>
            <input
              type="date"
              name="dob"
              onBlur={formik.handleBlur}
              onChange={(e) => handleDateChange("dob", e)}
              value={formatDateForInput(formik.values.dob)}
              className={inputClass("dob")}
            />
            {formik.touched.dob && formik.errors.dob && <p className={errorClass}>{formik.errors.dob}</p>}
          </div>

          {/* Admission Date */}
          <div className="col-span-1">
            <label className={labelClass}>Admission Date*</label>
            <input
              type="date"
              name="admission_date"
              onBlur={formik.handleBlur}
              onChange={(e) => handleDateChange("admission_date", e)}
              value={formatDateForInput(formik.values.admission_date)}
              className={inputClass("admission_date")}
            />
            {formik.touched.admission_date && formik.errors.admission_date && <p className={errorClass}>{formik.errors.admission_date}</p>}
          </div>

          {/* Admission Type */}
          <div className="col-span-1">
            <label className={labelClass}>Admission Type*</label>
            <select
              name="admission_type"
              value={formik.values.admission_type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={selectClass("admission_type")}
            >
              {Object.keys(config.admission_type).map((item) => (
                <option key={item} value={item}>{config.admission_type[item]}</option>
              ))}
            </select>
            {formik.touched.admission_type && formik.errors.admission_type && <p className={errorClass}>{formik.errors.admission_type}</p>}
          </div>

          {/* Class */}
          <div className="col-span-1">
            <label className={labelClass}>Class*</label>
            <select
              name="class"
              value={formik.values.class}
              onChange={(e) => {
                formik.setFieldValue("class", e.target.value);
                if (formik.values.section) formik.setFieldValue("section", "");
                if (formik.values.subjects) formik.setFieldValue("subjects", []);
              }}
              onBlur={formik.handleBlur}
              className={selectClass("class")}
            >
              <option value="" disabled>Select Class</option>
              {schoolClasses?.listData?.map((cls) => (
                <option value={cls.class_id} key={cls.class_id}>{cls.class_name}</option>
              ))}
            </select>
            {formik.touched.class && formik.errors.class && <p className={errorClass}>{formik.errors.class}</p>}
          </div>

          {/* Section */}
          <div className="col-span-1">
            <label className={labelClass}>Section*</label>
            <select
              name="section"
              value={formik.values.section}
              onChange={(e) => {
                formik.setFieldValue("section", e.target.value);
                if (formik.values.subjects) formik.setFieldValue("subjects", []);
              }}
              onBlur={formik.handleBlur}
              className={selectClass("section")}
            >
              <option value="" disabled>Select Section</option>
              {schoolSections?.listData?.map((section) => (
                <option value={section.section_id} key={section.section_id}>{section.section_name}</option>
              ))}
            </select>
            {formik.touched.section && formik.errors.section && <p className={errorClass}>{formik.errors.section}</p>}
          </div>

          {/* Subjects */}
          <div className="col-span-1 md:col-span-2">
            <label className={labelClass}>Subjects*</label>
            <select
              multiple
              name="subjects"
              value={formik.values.subjects.map(s => s.id)}
              onChange={handleSubjectsChange}
              onBlur={formik.handleBlur}
              className={`${inputClass("subjects")} h-28`}
            >
              {schoolSubjects?.listData?.map((sub) => (
                <option value={sub.id} key={sub.id}>{sub.name}</option>
              ))}
            </select>
            {formik.touched.subjects && formik.errors.subjects && <p className={errorClass}>{formik.errors.subjects}</p>}
            <p className="text-xs text-slate-400 mt-1">💡 Hold Ctrl (or ⌘) to select multiple subjects</p>
          </div>

          {/* ── Section: Additional Details ────────────────────────────── */}
          <SectionHeader icon="📋" title="Additional Details" subtitle="Blood group, house, status and more" />

          {/* Blood Group */}
          <div className="col-span-1">
            <label className={labelClass}>Blood Group</label>
            <select
              name="blood_group"
              value={formik.values.blood_group}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={selectClass("blood_group")}
            >
              <option value="" disabled>Select Blood Group</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                <option value={bg} key={bg}>{bg}</option>
              ))}
            </select>
            {formik.touched.blood_group && formik.errors.blood_group && <p className={errorClass}>{formik.errors.blood_group}</p>}
          </div>

          {/* Birth Mark */}
          <div className="col-span-1">
            <label className={labelClass}>Birth Mark</label>
            <input
              type="text"
              name="birth_mark"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.birth_mark}
              className={inputClass("birth_mark")}
            />
            {formik.touched.birth_mark && formik.errors.birth_mark && <p className={errorClass}>{formik.errors.birth_mark}</p>}
          </div>

          {/* Religion */}
          <div className="col-span-1">
            <label className={labelClass}>Religion</label>
            <input
              type="text"
              name="religion"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.religion}
              className={inputClass("religion")}
            />
            {formik.touched.religion && formik.errors.religion && <p className={errorClass}>{formik.errors.religion}</p>}
          </div>

          {/* Nationality */}
          <div className="col-span-1">
            <label className={labelClass}>Nationality</label>
            <select
              name="nationality"
              value={formik.values.nationality}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={selectClass("nationality")}
            >
              <option value="indian">Indian</option>
              <option value="nri">NRI</option>
            </select>
            {formik.touched.nationality && formik.errors.nationality && <p className={errorClass}>{formik.errors.nationality}</p>}
          </div>

          {/* Caste Group */}
          <div className="col-span-1">
            <label className={labelClass}>Caste Group</label>
            <select
              name="caste_group"
              value={formik.values.caste_group}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={selectClass("caste_group")}
            >
              <option value="" disabled>Select Caste</option>
              <option value="general">General</option>
              <option value="obc">OBC</option>
              <option value="sc">SC</option>
              <option value="st">ST</option>
            </select>
            {formik.touched.caste_group && formik.errors.caste_group && <p className={errorClass}>{formik.errors.caste_group}</p>}
          </div>

          {/* Student House */}
          <div className="col-span-1">
            <label className={labelClass}>Student House</label>
            <select
              name="house"
              value={formik.values.house || ""}
              onChange={(e) => formik.setFieldValue("house", e.target.value)}
              onBlur={formik.handleBlur}
              className={selectClass("house")}
            >
              <option value="" disabled>Select House</option>
              {!listingSchoolHouses?.listData?.rows?.length ? (
                <option disabled>No House Created</option>
              ) : (
                listingSchoolHouses.listData.rows.map(item => (
                  <option value={item.id} key={item.id}>{item.name}</option>
                ))
              )}
            </select>
            {formik.touched.house && formik.errors.house && <p className={errorClass}>{formik.errors.house}</p>}
          </div>

          {/* Status */}
          <div className="col-span-1">
            <label className={labelClass}>Status</label>
            <select
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={selectClass("status")}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {formik.touched.status && formik.errors.status && <p className={errorClass}>{formik.errors.status}</p>}
          </div>

          {/* Bus Checkbox and Selector */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-900/10 flex flex-col md:flex-row items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer shrink-0">
              <input
                type="checkbox"
                name="is_taking_bus"
                checked={formik.values.is_taking_bus}
                onChange={(e) => formik.setFieldValue("is_taking_bus", e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">Bus Required</span>
            </label>
            {formik.values.is_taking_bus && (
              <div className="w-full md:w-64">
                <label className={labelClass}>Bus Number</label>
                <select
                  name="bus"
                  value={formik.values.bus || ""}
                  onChange={(e) => formik.setFieldValue("bus", e.target.value)}
                  onBlur={formik.handleBlur}
                  className={inputClass("bus")}
                >
                  <option value="" disabled>Select Bus</option>
                  {allBuses?.listData?.rows?.map((item) => (
                    <option value={item.id} key={item.id}>{item.registration_no}</option>
                  ))}
                </select>
                {formik.touched.bus && formik.errors.bus && <p className={errorClass}>{formik.errors.bus}</p>}
              </div>
            )}
          </div>

          {/* Fee Waiver Checkbox and Selectors */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-900/10 flex flex-col md:flex-row items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer shrink-0">
              <input
                type="checkbox"
                name="is_fee_waiver"
                checked={formik.values.is_fee_waiver}
                onChange={(e) => {
                  formik.setFieldValue("is_fee_waiver", e.target.checked);
                  if (e.target.checked) {
                    formik.setFieldValue("fee_waiver_type", "");
                    formik.setFieldValue("waived_fees", "");
                  }
                }}
                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">Is Fee Waiver</span>
            </label>
            {formik.values.is_fee_waiver && (
              <div className="w-full md:w-48">
                <label className={labelClass}>Fee Waiver Type</label>
                <select
                  name="fee_waiver_type"
                  value={formik.values.fee_waiver_type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={inputClass("fee_waiver_type")}
                >
                  <option value="" disabled>Select Type</option>
                  <option value="partial">Partial</option>
                  <option value="full">Full</option>
                </select>
                {formik.touched.fee_waiver_type && formik.errors.fee_waiver_type && <p className={errorClass}>{formik.errors.fee_waiver_type}</p>}
              </div>
            )}
            {formik.values.fee_waiver_type === "partial" && formik.values.is_fee_waiver && (
              <div className="w-full md:w-64">
                <label className={labelClass}>Waived Fees (in rupees)</label>
                <input
                  type="text"
                  name="waived_fees"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.waived_fees}
                  className={inputClass("waived_fees")}
                />
                {formik.touched.waived_fees && formik.errors.waived_fees && <p className={errorClass}>{formik.errors.waived_fees}</p>}
              </div>
            )}
          </div>

          {/* Mother's Details */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 mt-4">
            <fieldset className="border-2 border-emerald-500/30 rounded-2xl p-6 bg-emerald-50/30 dark:bg-emerald-900/10">
              <legend className="text-emerald-700 dark:text-emerald-400 font-bold px-3 text-lg">Mother's Details</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Mother's Name*</label>
                  <input
                    type="text"
                    name="mother_name"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.mother_name}
                    className={inputClass("mother_name")}
                  />
                  {formik.touched.mother_name && formik.errors.mother_name && <p className={errorClass}>{formik.errors.mother_name}</p>}
                </div>
                <div>
                  <label className={labelClass}>Mother Contact Number*</label>
                  <input
                    type="number"
                    name="mother_contact_no"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.mother_contact_no}
                    className={inputClass("mother_contact_no")}
                  />
                  {formik.touched.mother_contact_no && formik.errors.mother_contact_no && <p className={errorClass}>{formik.errors.mother_contact_no}</p>}
                </div>
                <div>
                  <label className={labelClass}>Mother Aadhar*</label>
                  <input
                    type="number"
                    name="mother_aadhar"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.mother_aadhar}
                    className={inputClass("mother_aadhar")}
                  />
                  {formik.touched.mother_aadhar && formik.errors.mother_aadhar && <p className={errorClass}>{formik.errors.mother_aadhar}</p>}
                </div>
              </div>
            </fieldset>
          </div>

          {/* Father's Details */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4">
            <fieldset className="border-2 border-blue-500/30 rounded-2xl p-6 bg-blue-50/30 dark:bg-blue-900/10">
              <legend className="text-blue-700 dark:text-blue-400 font-bold px-3 text-lg">Father's Details</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Father's Name*</label>
                  <input
                    type="text"
                    name="father_name"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.father_name}
                    className={inputClass("father_name")}
                  />
                  {formik.touched.father_name && formik.errors.father_name && <p className={errorClass}>{formik.errors.father_name}</p>}
                </div>
                <div>
                  <label className={labelClass}>Father's Contact Number*</label>
                  <input
                    type="number"
                    name="father_contact_no"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.father_contact_no}
                    className={inputClass("father_contact_no")}
                  />
                  {formik.touched.father_contact_no && formik.errors.father_contact_no && <p className={errorClass}>{formik.errors.father_contact_no}</p>}
                </div>
                <div>
                  <label className={labelClass}>Father's Aadhar*</label>
                  <input
                    type="number"
                    name="father_aadhar"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.father_aadhar}
                    className={inputClass("father_aadhar")}
                  />
                  {formik.touched.father_aadhar && formik.errors.father_aadhar && <p className={errorClass}>{formik.errors.father_aadhar}</p>}
                </div>
              </div>
            </fieldset>
          </div>

          {/* Guardian's Details */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4">
            <fieldset className="border-2 border-purple-500/30 rounded-2xl p-6 bg-purple-50/30 dark:bg-purple-900/10">
              <legend className="text-purple-700 dark:text-purple-400 font-bold px-3 text-lg">Guardian's Details (if any)</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Guardian's Name</label>
                  <input
                    type="text"
                    name="guardian_name"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.guardian_name}
                    className={inputClass("guardian_name")}
                  />
                  {formik.touched.guardian_name && formik.errors.guardian_name && <p className={errorClass}>{formik.errors.guardian_name}</p>}
                </div>
                <div>
                  <label className={labelClass}>Guardian's Contact Number</label>
                  <input
                    type="number"
                    name="guardian_contact_no"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.guardian_contact_no}
                    className={inputClass("guardian_contact_no")}
                  />
                  {formik.touched.guardian_contact_no && formik.errors.guardian_contact_no && <p className={errorClass}>{formik.errors.guardian_contact_no}</p>}
                </div>
                <div>
                  <label className={labelClass}>Guardian's Aadhar</label>
                  <input
                    type="number"
                    name="guardian_aadhar"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.guardian_aadhar}
                    className={inputClass("guardian_aadhar")}
                  />
                  {formik.touched.guardian_aadhar && formik.errors.guardian_aadhar && <p className={errorClass}>{formik.errors.guardian_aadhar}</p>}
                </div>
              </div>
            </fieldset>
          </div>

        </div>
      </form>
      <Toast
        alerting={toastInfo.toastAlert}
        severity={toastInfo.toastSeverity}
        message={toastInfo.toastMessage}
      />
    </div>
  );
};

StudentFormComponent.propTypes = {
  onChange: PropTypes.func,
  refId: PropTypes.shape({
    current: PropTypes.any,
  }),
  setDirty: PropTypes.func,
  reset: PropTypes.bool,
  setReset: PropTypes.func,
  classData: PropTypes.array,
  setClassData: PropTypes.func,
  setFormikData: PropTypes.func,
  allSubjects: PropTypes.array,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  updatedValues: PropTypes.object,
  iCardDetails: PropTypes.object,
  setICardDetails: PropTypes.func,
};

export default StudentFormComponent;
