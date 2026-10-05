/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import dayjs from "dayjs";
import { ChevronDown, Bus, Award, User, Users, HeartHandshake, ShieldCheck } from "lucide-react";

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
      const errors = await formik.validateForm();
      formik.setTouched(
        Object.keys(formik.values).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {})
      );
      await formik.submitForm();
      return errors;
    },
    validate: async () => {
      const errors = await formik.validateForm();
      formik.setTouched(
        Object.keys(formik.values).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {})
      );
      return errors;
    },
    formik,
  }));

  const watchForm = () => {
    if (onChange) {
      onChange({
        values: formik.values,
        validated: Object.keys(formik.errors).length === 0,
        dirty: formik.dirty,
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
            `Cannot appoint Head ${formik.values.gender}`
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
        (obj.class_id ?? obj.id) == formik.values.class &&
        (obj.section_id ?? obj.id) == formik.values?.section
    );
    const selectedSubjects = sectionSubjects
      ? getValuesFromArray(sectionSubjects[0]?.subject_ids, allSubjects)
      : [];
    dispatch(setSchoolSubjects(selectedSubjects));
  };

  const getAndSetSections = () => {
    const classSections =
      classData?.filter(
        (obj) => (obj.class_id ?? obj.id) == formik.values.class
      ) || [];
    const selectedSections = classSections.map(
      ({ section_id, section_name, id, name }) => ({
        section_id: section_id ?? id,
        section_name: section_name ?? name,
      })
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
      const normalized = { ...initialValues, ...updatedValues };
      if (normalized.blood_group) {
        const bgMap = { A_POS: "A+", A_NEG: "A-", B_POS: "B+", B_NEG: "B-", AB_POS: "AB+", AB_NEG: "AB-", O_POS: "O+", O_NEG: "O-" };
        normalized.blood_group = bgMap[normalized.blood_group] || normalized.blood_group;
      }
      [
        "mother_contact_no",
        "mother_aadhar",
        "father_contact_no",
        "father_aadhar",
        "guardian_contact_no",
        "guardian_aadhar",
        "contact_no",
        "aadhaar_no",
      ].forEach((field) => {
        if (normalized[field] !== undefined && normalized[field] !== null) {
          normalized[field] = String(normalized[field]).split(".")[0];
        }
      });

      // Replace all null / undefined properties so formik inputs are always controlled strings/booleans/arrays
      Object.keys(initialValues).forEach((key) => {
        if (key === "dob" || key === "admission_date") {
          return;
        }
        if (typeof initialValues[key] === "boolean") {
          normalized[key] = Boolean(normalized[key]);
        } else if (Array.isArray(initialValues[key])) {
          normalized[key] = Array.isArray(normalized[key]) ? normalized[key] : [];
        } else if (typeof initialValues[key] === "number") {
          normalized[key] = Number(normalized[key]) || 0;
        } else {
          normalized[key] = normalized[key] !== null && normalized[key] !== undefined ? String(normalized[key]) : "";
        }
      });

      setInitialState(normalized);
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
        !schoolSections?.listData?.length ||
        !classData?.length)
    ) {
      fetchAndSetSchoolData(
        dispatch,
        setSchoolClasses,
        setSchoolSections,
        setClassData
      );
    }
  }, [classData?.length]);

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
    if (formik.values.section && classData?.length) {
      getAndSetSubjects();
    }
  }, [formik.values?.section, classData]);

  useEffect(() => {
    if (formik.values.class && classData?.length) {
      getAndSetSections();
    }
  }, [formik.values?.class, classData]);

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    return dayjs(dateValue).format("YYYY-MM-DD");
  };

  const handleDateChange = (field, e) => {
    const val = e.target.value;
    formik.setFieldValue(field, val ? dayjs(val) : null);
  };

  const handleSubjectsChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedValues = selectedOptions
      .map((option) => {
        return (schoolSubjects?.listData || []).find(
          (sub) => sub.id == option.value
        );
      })
      .filter(Boolean);
    formik.setFieldValue("subjects", selectedValues);
  };

  const renderRequiredLabel = (text) => (
    <span>
      {text.replace(/[*]|(?:\*\s*\(Mandatory\))/g, "").trim()}{" "}
      <span className="text-[#e05353] dark:text-[#f87171] text-[11px] font-medium tracking-[0.2px] normal-case ml-0.5">
        * (Mandatory)
      </span>
    </span>
  );

  const inputClasses =
    "w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2e2e2e] rounded-xl shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500";

  const selectClasses =
    "w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2e2e2e] rounded-xl shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all outline-none text-slate-900 dark:text-slate-100 cursor-pointer appearance-none";

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
            Basic Information
          </h3>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Student Profile & Identity Details
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Session */}
          <div>
            <label className={labelClasses}>{renderRequiredLabel("Session")}</label>
            <div className="relative">
              <select
                name="session"
                value={formik.values.session}
                onChange={(e) => formik.setFieldValue("session", e.target.value)}
                onBlur={formik.handleBlur}
                className={`${selectClasses} pr-9 ${formik.touched.session && formik.errors.session
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
                  }`}
              >
                <option value="" disabled>Select Session</option>
                {createSession().map((session) => (
                  <option value={session} key={session}>
                    {session}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {formik.touched.session && formik.errors.session && (
              <p className={errorClasses}>{formik.errors.session}</p>
            )}
          </div>

          {/* First Name */}
          <div>
            <label className={labelClasses}>{renderRequiredLabel("Firstname")}</label>
            <input
              type="text"
              name="firstname"
              placeholder="Enter first name"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.firstname}
              className={`${inputClasses} ${formik.touched.firstname && formik.errors.firstname
                ? "border-rose-400 ring-1 ring-rose-400"
                : ""
                }`}
            />
            {formik.touched.firstname && formik.errors.firstname && (
              <p className={errorClasses}>{formik.errors.firstname}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className={labelClasses}>{renderRequiredLabel("Lastname")}</label>
            <input
              type="text"
              name="lastname"
              placeholder="Enter last name"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.lastname}
              className={`${inputClasses} ${formik.touched.lastname && formik.errors.lastname
                ? "border-rose-400 ring-1 ring-rose-400"
                : ""
                }`}
            />
            {formik.touched.lastname && formik.errors.lastname && (
              <p className={errorClasses}>{formik.errors.lastname}</p>
            )}
          </div>

          {/* Contact Number */}
          <div>
            <label className={labelClasses}>{renderRequiredLabel("Contact Number")}</label>
            <input
              type="text"
              name="contact_no"
              placeholder="Primary contact number"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.contact_no}
              className={`${inputClasses} ${formik.touched.contact_no && formik.errors.contact_no
                ? "border-rose-400 ring-1 ring-rose-400"
                : ""
                }`}
            />
            {formik.touched.contact_no && formik.errors.contact_no && (
              <p className={errorClasses}>{formik.errors.contact_no}</p>
            )}
          </div>

          {/* Email */}
          <div className="lg:col-span-2">
            <label className={labelClasses}>{renderRequiredLabel("Email")}</label>
            <input
              type="email"
              name="email"
              placeholder="student@example.com"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.email}
              className={`${inputClasses} ${formik.touched.email && formik.errors.email
                ? "border-rose-400 ring-1 ring-rose-400"
                : ""
                }`}
            />
            {formik.touched.email && formik.errors.email && (
              <p className={errorClasses}>{formik.errors.email}</p>
            )}
          </div>

          {/* Aadhaar Number */}
          <div>
            <label className={labelClasses}>{renderRequiredLabel("Aadhaar Number")}</label>
            <input
              type="text"
              name="aadhaar_no"
              placeholder="12-digit Aadhaar number"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.aadhaar_no}
              className={`${inputClasses} ${formik.touched.aadhaar_no && formik.errors.aadhaar_no
                ? "border-rose-400 ring-1 ring-rose-400"
                : ""
                }`}
            />
            {formik.touched.aadhaar_no && formik.errors.aadhaar_no && (
              <p className={errorClasses}>{formik.errors.aadhaar_no}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className={labelClasses}>Gender</label>
            <div className="relative">
              <select
                ref={genderRef}
                name="gender"
                value={formik.values.gender}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`${selectClasses} pr-9 ${formik.touched.gender && formik.errors.gender
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
                  }`}
              >
                <option value="" disabled>Select Gender</option>
                {Object.keys(config.gender).map((item) => (
                  <option key={item} value={item}>
                    {config.gender[item]}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {formik.touched.gender && formik.errors.gender && (
              <p className={errorClasses}>{formik.errors.gender}</p>
            )}
          </div>

          {/* Is Specially Abled */}
          <div className="lg:col-span-4 pt-1">
            <label className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200 dark:border-[#2e2e2e] bg-slate-50/50 dark:bg-[#141414] hover:bg-slate-100/50 dark:hover:bg-[#1a1a1a] transition-all cursor-pointer shadow-2xs">
              <input
                type="checkbox"
                name="is_specially_abled"
                checked={formik.values.is_specially_abled}
                onChange={(e) =>
                  formik.setFieldValue("is_specially_abled", e.target.checked)
                }
                className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Specially Abled Student
                </span>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Check if candidate requires special educational or accessibility accommodations
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* ── CARD 2: Academic Details ────────────────────────────────────────── */}
      <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#222]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Academic Details
          </h3>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Class, Section, Subjects & Enrollment
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Class */}
          <div>
            <label className={labelClasses}>{renderRequiredLabel("Class")}</label>
            <div className="relative">
              <select
                name="class"
                value={formik.values.class}
                onChange={(e) => {
                  formik.setFieldValue("class", e.target.value);
                  if (formik.values.section) formik.setFieldValue("section", "");
                  if (formik.values.subjects) formik.setFieldValue("subjects", []);
                }}
                onBlur={formik.handleBlur}
                className={`${selectClasses} pr-9 ${formik.touched.class && formik.errors.class
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
                  }`}
              >
                <option value="" disabled>Select Class</option>
                {schoolClasses?.listData?.map((cls) => (
                  <option value={cls.class_id} key={cls.class_id}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {formik.touched.class && formik.errors.class && (
              <p className={errorClasses}>{formik.errors.class}</p>
            )}
          </div>

          {/* Section */}
          <div>
            <label className={labelClasses}>{renderRequiredLabel("Section")}</label>
            <div className="relative">
              <select
                name="section"
                value={formik.values.section}
                onChange={(e) => {
                  formik.setFieldValue("section", e.target.value);
                  if (formik.values.subjects) formik.setFieldValue("subjects", []);
                }}
                onBlur={formik.handleBlur}
                className={`${selectClasses} pr-9 ${formik.touched.section && formik.errors.section
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
                  }`}
              >
                <option value="" disabled>Select Section</option>
                {schoolSections?.listData?.map((section) => (
                  <option value={section.section_id} key={section.section_id}>
                    {section.section_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {formik.touched.section && formik.errors.section && (
              <p className={errorClasses}>{formik.errors.section}</p>
            )}
          </div>

          {/* Date Of Birth */}
          <div>
            <label className={labelClasses}>{renderRequiredLabel("Date Of Birth")}</label>
            <input
              type="date"
              name="dob"
              max={dayjs().subtract(10, "year").format("YYYY-MM-DD")}
              onBlur={formik.handleBlur}
              onChange={(e) => handleDateChange("dob", e)}
              value={formatDateForInput(formik.values.dob)}
              className={`${inputClasses} ${formik.touched.dob && formik.errors.dob
                ? "border-rose-400 ring-1 ring-rose-400"
                : ""
                }`}
            />
            {formik.touched.dob && formik.errors.dob && (
              <p className={errorClasses}>{formik.errors.dob}</p>
            )}
          </div>

          {/* Admission Date */}
          <div>
            <label className={labelClasses}>{renderRequiredLabel("Admission Date")}</label>
            <input
              type="date"
              name="admission_date"
              max={dayjs().format("YYYY-MM-DD")}
              onBlur={formik.handleBlur}
              onChange={(e) => handleDateChange("admission_date", e)}
              value={formatDateForInput(formik.values.admission_date)}
              className={`${inputClasses} ${formik.touched.admission_date && formik.errors.admission_date
                ? "border-rose-400 ring-1 ring-rose-400"
                : ""
                }`}
            />
            {formik.touched.admission_date && formik.errors.admission_date && (
              <p className={errorClasses}>{formik.errors.admission_date}</p>
            )}
          </div>

          {/* Admission Type */}
          <div>
            <label className={labelClasses}>{renderRequiredLabel("Admission Type")}</label>
            <div className="relative">
              <select
                name="admission_type"
                value={formik.values.admission_type}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`${selectClasses} pr-9 ${formik.touched.admission_type && formik.errors.admission_type
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
                  }`}
              >
                {Object.keys(config.admission_type).map((item) => (
                  <option key={item} value={item}>
                    {config.admission_type[item]}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {formik.touched.admission_type && formik.errors.admission_type && (
              <p className={errorClasses}>{formik.errors.admission_type}</p>
            )}
          </div>

          {/* Head Position (Edit Mode Only) */}
          {userId && (
            <div>
              <label className={labelClasses}>
                {updatedValues?.gender === "male"
                  ? "Head Boy"
                  : updatedValues?.gender === "female"
                    ? "Head Girl"
                    : "Head of School"}
              </label>
              <div className="relative">
                <select
                  name="head"
                  value={formik.values.head}
                  onChange={(e) => {
                    if (formik.values.gender) {
                      formik.setFieldValue("head", e.target.value);
                      if (e.target.value == 1) {
                        validateHead();
                      }
                    } else {
                      toastAndNavigate(dispatch, true, "info", "Please Select Gender");
                    }
                  }}
                  onBlur={formik.handleBlur}
                  className={`${selectClasses} pr-9 ${formik.touched.head && formik.errors.head
                    ? "border-rose-400 ring-1 ring-rose-400"
                    : ""
                    }`}
                >
                  {Object.keys(config.head).map((item) => (
                    <option key={item} value={item}>
                      {config.head[item]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {formik.touched.head && formik.errors.head && (
                <p className={errorClasses}>{formik.errors.head}</p>
              )}
            </div>
          )}

          {/* Subjects (Multiple Select) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4">
            <label className={labelClasses}>{renderRequiredLabel("Enrolled Subjects")}</label>
            <select
              multiple
              name="subjects"
              value={formik.values.subjects.map((s) => s.id)}
              onChange={handleSubjectsChange}
              onBlur={formik.handleBlur}
              className={`${inputClasses} h-28 custom-scrollbar`}
            >
              {schoolSubjects?.listData?.map((sub) => (
                <option value={sub.id} key={sub.id} className="py-1 px-1.5 rounded">
                  {sub.name}
                </option>
              ))}
            </select>
            {formik.touched.subjects && formik.errors.subjects && (
              <p className={errorClasses}>{formik.errors.subjects}</p>
            )}
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              💡 Hold Ctrl (or ⌘ on Mac) to select multiple subjects assigned to this class section
            </p>
          </div>
        </div>
      </div>

      {/* ── CARD 3: Additional & Transportation Details ──────────────────────── */}
      <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#222]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Additional & Transportation Details
          </h3>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Blood Group, House, Bus Facility & Fee Waiver
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Blood Group */}
          <div>
            <label className={labelClasses}>Blood Group</label>
            <div className="relative">
              <select
                name="blood_group"
                value={formik.values.blood_group}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`${selectClasses} pr-9 ${formik.touched.blood_group && formik.errors.blood_group
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
                  }`}
              >
                <option value="" disabled>Select Blood Group</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option value={bg} key={bg}>
                    {bg}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {formik.touched.blood_group && formik.errors.blood_group && (
              <p className={errorClasses}>{formik.errors.blood_group}</p>
            )}
          </div>

          {/* Birth Mark */}
          <div>
            <label className={labelClasses}>Birth Mark</label>
            <input
              type="text"
              name="birth_mark"
              placeholder="Identification mark"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.birth_mark}
              className={`${inputClasses} ${formik.touched.birth_mark && formik.errors.birth_mark
                ? "border-rose-400 ring-1 ring-rose-400"
                : ""
                }`}
            />
            {formik.touched.birth_mark && formik.errors.birth_mark && (
              <p className={errorClasses}>{formik.errors.birth_mark}</p>
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
              className={`${inputClasses} ${formik.touched.religion && formik.errors.religion
                ? "border-rose-400 ring-1 ring-rose-400"
                : ""
                }`}
            />
            {formik.touched.religion && formik.errors.religion && (
              <p className={errorClasses}>{formik.errors.religion}</p>
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
                className={`${selectClasses} pr-9 ${formik.touched.nationality && formik.errors.nationality
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
                  }`}
              >
                <option value="indian">Indian</option>
                <option value="nri">NRI</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {formik.touched.nationality && formik.errors.nationality && (
              <p className={errorClasses}>{formik.errors.nationality}</p>
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
                className={`${selectClasses} pr-9 ${formik.touched.caste_group && formik.errors.caste_group
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
                  }`}
              >
                <option value="" disabled>Select Caste</option>
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

          {/* Student House */}
          <div>
            <label className={labelClasses}>Student House</label>
            <div className="relative">
              <select
                name="house"
                value={formik.values.house || ""}
                onChange={(e) => formik.setFieldValue("house", e.target.value)}
                onBlur={formik.handleBlur}
                className={`${selectClasses} pr-9 ${formik.touched.house && formik.errors.house
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
                  }`}
              >
                <option value="" disabled>Select House</option>
                {!listingSchoolHouses?.listData?.rows?.length ? (
                  <option disabled>No House Created</option>
                ) : (
                  listingSchoolHouses.listData.rows.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.name}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {formik.touched.house && formik.errors.house && (
              <p className={errorClasses}>{formik.errors.house}</p>
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
                className={`${selectClasses} pr-9 ${formik.touched.status && formik.errors.status
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
                  }`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {formik.touched.status && formik.errors.status && (
              <p className={errorClasses}>{formik.errors.status}</p>
            )}
          </div>

          {/* Empty spacer for grid alignment */}
          <div className="hidden lg:block"></div>

          {/* Bus Checkbox and Selector Strip */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 p-4 rounded-xl border border-slate-200 dark:border-[#2e2e2e] bg-slate-50/50 dark:bg-[#141414] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <label className="flex items-center gap-3 cursor-pointer shrink-0">
              <input
                type="checkbox"
                name="is_taking_bus"
                checked={formik.values.is_taking_bus}
                onChange={(e) =>
                  formik.setFieldValue("is_taking_bus", e.target.checked)
                }
                className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <Bus className="w-3.5 h-3.5 text-blue-500" />
                  Bus Facility Required
                </span>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Assign school transportation route
                </p>
              </div>
            </label>
            {formik.values.is_taking_bus && (
              <div className="w-full sm:w-48 relative shrink-0">
                <select
                  name="bus"
                  value={formik.values.bus || ""}
                  onChange={(e) => formik.setFieldValue("bus", e.target.value)}
                  onBlur={formik.handleBlur}
                  className={`${selectClasses} text-xs py-2 pr-8 ${formik.touched.bus && formik.errors.bus
                    ? "border-rose-400 ring-1 ring-rose-400"
                    : ""
                    }`}
                >
                  <option value="" disabled>Select Bus</option>
                  {allBuses?.listData?.rows?.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.registration_no}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                {formik.touched.bus && formik.errors.bus && (
                  <p className={errorClasses}>{formik.errors.bus}</p>
                )}
              </div>
            )}
          </div>

          {/* Fee Waiver Checkbox and Selectors Strip */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 p-4 rounded-xl border border-slate-200 dark:border-[#2e2e2e] bg-slate-50/50 dark:bg-[#141414] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
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
                className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  Fee Waiver / Concession
                </span>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Scholarship or fee discount grant
                </p>
              </div>
            </label>
            {formik.values.is_fee_waiver && (
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <div className="w-full sm:w-36 relative">
                  <select
                    name="fee_waiver_type"
                    value={formik.values.fee_waiver_type}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`${selectClasses} text-xs py-2 pr-8 ${formik.touched.fee_waiver_type && formik.errors.fee_waiver_type
                      ? "border-rose-400 ring-1 ring-rose-400"
                      : ""
                      }`}
                  >
                    <option value="" disabled>Select Type</option>
                    <option value="partial">Partial</option>
                    <option value="full">Full</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formik.values.fee_waiver_type === "partial" && (
                  <div className="w-full sm:w-36">
                    <input
                      type="text"
                      name="waived_fees"
                      placeholder="Amount (₹)"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.waived_fees}
                      className={`${inputClasses} text-xs py-2 ${formik.touched.waived_fees && formik.errors.waived_fees
                        ? "border-rose-400 ring-1 ring-rose-400"
                        : ""
                        }`}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CARD 4: Parent & Guardian Details ─────────────────────────────────── */}
      <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#222]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Parent & Guardian Records
          </h3>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Family Contacts & Verification Records
          </span>
        </div>

        {/* Mother's Details */}
        <div className="p-4 md:p-5 rounded-xl border border-slate-200/80 dark:border-[#282828] bg-slate-50/40 dark:bg-[#131313] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-[#222]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Mother's Information
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelClasses}>{renderRequiredLabel("Mother's Name")}</label>
              <input
                type="text"
                name="mother_name"
                placeholder="Enter mother's name"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.mother_name}
                className={`${inputClasses} ${formik.touched.mother_name && formik.errors.mother_name
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
                  }`}
              />
              {formik.touched.mother_name && formik.errors.mother_name && (
                <p className={errorClasses}>{formik.errors.mother_name}</p>
              )}
            </div>
            <div>
              <label className={labelClasses}>{renderRequiredLabel("Mother Contact Number")}</label>
              <input
                type="text"
                name="mother_contact_no"
                maxLength={10}
                placeholder="10-digit mobile number"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.mother_contact_no}
                className={`${inputClasses} ${formik.touched.mother_contact_no && formik.errors.mother_contact_no
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
                  }`}
              />
              {formik.touched.mother_contact_no && formik.errors.mother_contact_no && (
                <p className={errorClasses}>{formik.errors.mother_contact_no}</p>
              )}
            </div>
            <div>
              <label className={labelClasses}>{renderRequiredLabel("Mother Aadhar")}</label>
              <input
                type="text"
                name="mother_aadhar"
                maxLength={12}
                placeholder="12-digit Aadhaar number"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.mother_aadhar}
                className={`${inputClasses} ${formik.touched.mother_aadhar && formik.errors.mother_aadhar
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
                  }`}
              />
              {formik.touched.mother_aadhar && formik.errors.mother_aadhar && (
                <p className={errorClasses}>{formik.errors.mother_aadhar}</p>
              )}
            </div>
          </div>
        </div>

        {/* Father's Details */}
        <div className="p-4 md:p-5 rounded-xl border border-slate-200/80 dark:border-[#282828] bg-slate-50/40 dark:bg-[#131313] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-[#222]">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Father's Information
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelClasses}>{renderRequiredLabel("Father's Name")}</label>
              <input
                type="text"
                name="father_name"
                placeholder="Enter father's name"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.father_name}
                className={`${inputClasses} ${formik.touched.father_name && formik.errors.father_name
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
                  }`}
              />
              {formik.touched.father_name && formik.errors.father_name && (
                <p className={errorClasses}>{formik.errors.father_name}</p>
              )}
            </div>
            <div>
              <label className={labelClasses}>{renderRequiredLabel("Father's Contact Number")}</label>
              <input
                type="text"
                name="father_contact_no"
                maxLength={10}
                placeholder="10-digit mobile number"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.father_contact_no}
                className={`${inputClasses} ${formik.touched.father_contact_no && formik.errors.father_contact_no
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
                  }`}
              />
              {formik.touched.father_contact_no && formik.errors.father_contact_no && (
                <p className={errorClasses}>{formik.errors.father_contact_no}</p>
              )}
            </div>
            <div>
              <label className={labelClasses}>{renderRequiredLabel("Father's Aadhar")}</label>
              <input
                type="text"
                name="father_aadhar"
                maxLength={12}
                placeholder="12-digit Aadhaar number"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.father_aadhar}
                className={`${inputClasses} ${formik.touched.father_aadhar && formik.errors.father_aadhar
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
                  }`}
              />
              {formik.touched.father_aadhar && formik.errors.father_aadhar && (
                <p className={errorClasses}>{formik.errors.father_aadhar}</p>
              )}
            </div>
          </div>
        </div>

        {/* Guardian's Details */}
        <div className="p-4 md:p-5 rounded-xl border border-slate-200/80 dark:border-[#282828] bg-slate-50/40 dark:bg-[#131313] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-[#222]">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Guardian's Details (Optional)
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelClasses}>Guardian's Name</label>
              <input
                type="text"
                name="guardian_name"
                placeholder="Enter guardian's name"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.guardian_name}
                className={`${inputClasses} ${formik.touched.guardian_name && formik.errors.guardian_name
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
                  }`}
              />
              {formik.touched.guardian_name && formik.errors.guardian_name && (
                <p className={errorClasses}>{formik.errors.guardian_name}</p>
              )}
            </div>
            <div>
              <label className={labelClasses}>Guardian's Contact Number</label>
              <input
                type="text"
                name="guardian_contact_no"
                maxLength={10}
                placeholder="10-digit mobile number"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.guardian_contact_no}
                className={`${inputClasses} ${formik.touched.guardian_contact_no && formik.errors.guardian_contact_no
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
                  }`}
              />
              {formik.touched.guardian_contact_no && formik.errors.guardian_contact_no && (
                <p className={errorClasses}>{formik.errors.guardian_contact_no}</p>
              )}
            </div>
            <div>
              <label className={labelClasses}>Guardian's Aadhar</label>
              <input
                type="text"
                name="guardian_aadhar"
                maxLength={12}
                placeholder="12-digit Aadhaar number"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.guardian_aadhar}
                className={`${inputClasses} ${formik.touched.guardian_aadhar && formik.errors.guardian_aadhar
                  ? "border-rose-400 ring-1 ring-rose-400"
                  : ""
                  }`}
              />
              {formik.touched.guardian_aadhar && formik.errors.guardian_aadhar && (
                <p className={errorClasses}>{formik.errors.guardian_aadhar}</p>
              )}
            </div>
          </div>
        </div>

      </div>

      <Toast
        alerting={toastInfo.toastAlert}
        severity={toastInfo.toastSeverity}
        message={toastInfo.toastMessage}
      />
    </form>
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
