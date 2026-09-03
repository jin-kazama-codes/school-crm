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
        validated: formik.isSubmitting
          ? Object.keys(formik.errors).length === 0
          : false,
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

  const inputClass = (fieldName) => `w-full px-4 py-2 bg-white dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
    formik.touched[fieldName] && formik.errors[fieldName] 
    ? 'border-red-500 focus:ring-red-500/50' 
    : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500/50'
  } text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500`;
  
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
  const errorClass = "mt-1 text-sm text-red-500";

  return (
    <div className="p-6">
      <form ref={refId} onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* First Name */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2">
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
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
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

          {/* Email */}
          <div className="col-span-1 lg:col-span-2">
            <label className={labelClass}>Email*</label>
            <input
              type="email"
              name="email"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.email}
              className={inputClass("email")}
            />
            {formik.touched.email && formik.errors.email && <p className={errorClass}>{formik.errors.email}</p>}
          </div>

          {/* Contact Number */}
          <div className="col-span-1 lg:col-span-2">
            <label className={labelClass}>Contact Number*</label>
            <input
              type="text"
              name="contact_no"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.contact_no}
              className={inputClass("contact_no")}
            />
            {formik.touched.contact_no && formik.errors.contact_no && <p className={errorClass}>{formik.errors.contact_no}</p>}
          </div>

          {/* Nationality */}
          <div className="col-span-1">
            <label className={labelClass}>Nationality</label>
            <select
              name="nationality"
              value={formik.values.nationality}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass("nationality")}
            >
              {Object.keys(config.nationality).map((casteGroup) => (
                <option key={casteGroup} value={casteGroup}>
                  {config.nationality[casteGroup]}
                </option>
              ))}
            </select>
            {formik.touched.nationality && formik.errors.nationality && <p className={errorClass}>{formik.errors.nationality}</p>}
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

          {/* Blood Group */}
          <div className="col-span-1">
            <label className={labelClass}>Blood Group</label>
            <select
              name="blood_group"
              value={formik.values.blood_group}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass("blood_group")}
            >
              <option value="" disabled>Select Blood Group</option>
              {Object.keys(config.bloodGroups).map((bloodGroup) => (
                <option key={bloodGroup} value={bloodGroup}>{config.bloodGroups[bloodGroup]}</option>
              ))}
            </select>
            {formik.touched.blood_group && formik.errors.blood_group && <p className={errorClass}>{formik.errors.blood_group}</p>}
          </div>

          {/* Qualification */}
          <div className="col-span-1">
            <label className={labelClass}>Qualification</label>
            <input
              type="text"
              name="qualification"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.qualification}
              className={inputClass("qualification")}
            />
            {formik.touched.qualification && formik.errors.qualification && <p className={errorClass}>{formik.errors.qualification}</p>}
          </div>

          {/* Achievements */}
          <div className="col-span-1 lg:col-span-2">
            <label className={labelClass}>Achievements</label>
            <input
              type="text"
              name="achievements"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.achievements}
              className={inputClass("achievements")}
            />
            {formik.touched.achievements && formik.errors.achievements && <p className={errorClass}>{formik.errors.achievements}</p>}
          </div>

          {/* Experience */}
          <div className="col-span-1 lg:col-span-2">
            <label className={labelClass}>Experience</label>
            <input
              type="text"
              name="experience"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.experience}
              className={inputClass("experience")}
            />
            {formik.touched.experience && formik.errors.experience && <p className={errorClass}>{formik.errors.experience}</p>}
          </div>

          {/* Grade */}
          <div className="col-span-1">
            <label className={labelClass}>Grade</label>
            <select
              name="grade"
              value={formik.values.grade}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass("grade")}
            >
              <option value="" disabled>Select Grade</option>
              {Object.keys(config.grade).map((grade) => (
                <option key={grade} value={grade}>{config.grade[grade]}</option>
              ))}
            </select>
            {formik.touched.grade && formik.errors.grade && <p className={errorClass}>{formik.errors.grade}</p>}
          </div>

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
              required
            />
            {formik.touched.dob && formik.errors.dob && <p className={errorClass}>{formik.errors.dob}</p>}
          </div>

          {/* Is Specially Abled */}
          <div className="col-span-1 flex flex-col justify-center">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_specially_abled"
                checked={formik.values.is_specially_abled}
                onChange={(e) => formik.setFieldValue("is_specially_abled", e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">Is Specially Abled</span>
            </label>
          </div>

          {/* Is Class Teacher */}
          <div className="col-span-1 flex flex-col justify-center">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_class_teacher"
                checked={formik.values.is_class_teacher}
                onChange={(e) => formik.setFieldValue("is_class_teacher", e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">Is Class Teacher</span>
            </label>
          </div>

          {/* Class Teacher specific fields */}
          {formik.values.is_class_teacher && (
            <>
              <div className="col-span-1">
                <label className={labelClass}>Class</label>
                <select
                  name="class"
                  value={formik.values.class}
                  onChange={(e) => {
                    formik.setFieldValue("class", e.target.value);
                    if (formik.values.section) formik.setFieldValue("section", "");
                  }}
                  onBlur={formik.handleBlur}
                  className={inputClass("class")}
                >
                  <option value="" disabled>Select Class</option>
                  {schoolClasses?.listData?.map((cls) => (
                    <option value={cls.class_id} key={cls.class_id}>{cls.class_name}</option>
                  ))}
                </select>
                {formik.touched.class && formik.errors.class && <p className={errorClass}>{formik.errors.class}</p>}
              </div>

              <div className="col-span-1">
                <label className={labelClass}>Section</label>
                <select
                  name="section"
                  value={formik.values.section}
                  onChange={(e) => formik.setFieldValue("section", e.target.value)}
                  onBlur={formik.handleBlur}
                  className={inputClass("section")}
                >
                  <option value="" disabled>Select Section</option>
                  {schoolSections?.listData?.map((section) => (
                    <option value={section.section_id} key={section.section_id}>{section.section_name}</option>
                  ))}
                </select>
                {formik.touched.section && formik.errors.section && <p className={errorClass}>{formik.errors.section}</p>}
              </div>
            </>
          )}

          {/* Caste Group */}
          <div className="col-span-1">
            <label className={labelClass}>Caste Group</label>
            <select
              name="caste_group"
              value={formik.values.caste_group}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass("caste_group")}
            >
              <option value="" disabled>Select Caste Group</option>
              <option value="general">General</option>
              <option value="obc">OBC</option>
              <option value="sc">SC</option>
              <option value="st">ST</option>
            </select>
            {formik.touched.caste_group && formik.errors.caste_group && <p className={errorClass}>{formik.errors.caste_group}</p>}
          </div>

          {/* Gender */}
          <div className="col-span-1">
            <label className={labelClass}>Gender</label>
            <select
              name="gender"
              value={formik.values.gender}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass("gender")}
            >
              <option value="" disabled>Select Gender</option>
              {Object.keys(config.gender).map((item) => (
                <option key={item} value={item}>{config.gender[item]}</option>
              ))}
            </select>
            {formik.touched.gender && formik.errors.gender && <p className={errorClass}>{formik.errors.gender}</p>}
          </div>

          {/* Status */}
          <div className="col-span-1">
            <label className={labelClass}>Status</label>
            <select
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass("status")}
            >
              {Object.keys(config.status).map((item) => (
                <option key={item} value={item}>{config.status[item]}</option>
              ))}
            </select>
            {formik.touched.status && formik.errors.status && <p className={errorClass}>{formik.errors.status}</p>}
          </div>

        </div>

        {/* Classes, Sections, and Subjects Allocation */}
        <div className="mt-8 p-6 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-900/10 space-y-6">
          <h3 className="text-xl font-bold text-indigo-800 dark:text-indigo-300">Teaching Allocation</h3>
          
          {formik.values.classes.map((field, index) => {
            const key = index + 1;
            return (
              <div key={key} className="space-y-4 pb-6 border-b border-indigo-200 dark:border-indigo-800 last:border-0 last:pb-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Class</label>
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
                      className={inputClass("classes")}
                    >
                      <option value="" disabled>Select Class</option>
                      {schoolClasses?.listData?.map((cls) => (
                        <option value={cls.class_id} key={cls.class_id}>{cls.class_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Sections (Ctrl/Cmd to select multiple)</label>
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
                      className={`${inputClass("sections")} h-24`}
                    >
                      {schoolSections?.listData?.map((section) => (
                        <option value={section.section_id} key={section.section_id}>{section.section_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {formik?.values?.sections[index]?.map((section, sectionIndex) => (
                  <div key={`${key}-${sectionIndex}`} className="mt-4 pl-4 border-l-2 border-indigo-300 dark:border-indigo-700">
                    <label className={labelClass}>Subjects For Section {section.section_name}</label>
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
                      className={`${inputClass("subjects")} h-24`}
                    >
                      {(schoolSubjects?.listData?.[formik.values.classes[index]]?.[section.section_id] || []).map((sub) => (
                        <option value={sub.id} key={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            );
          })}

          <div key={formik.values.classes.length + 1} className="space-y-4 pt-4 border-t-2 border-dashed border-indigo-200 dark:border-indigo-800">
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Add Another Class</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Class</label>
                <select
                  value=""
                  onChange={(e) => {
                    const subArr = [...formik.values.classes];
                    subArr[formik.values.classes.length] = e.target.value;
                    formik.setFieldValue("classes", subArr);
                  }}
                  className={inputClass("classes")}
                >
                  <option value="" disabled>Select Class</option>
                  {schoolClasses?.listData?.filter(cls => !formik.values.classes.includes(cls.class_id)).map((cls) => (
                    <option value={cls.class_id} key={cls.class_id}>{cls.class_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Section (Select class first)</label>
                <select
                  multiple
                  value={[]}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions);
                    const selectedValues = selectedOptions.map(option => {
                      return (schoolSections?.listData || []).find(sec => sec.section_id == option.value);
                    }).filter(Boolean);

                    const sectArr = [...formik.values.sections];
                    sectArr[formik.values.classes.length] = selectedValues;
                    formik.setFieldValue("sections", sectArr);
                  }}
                  className={`${inputClass("sections")} h-24`}
                  disabled
                >
                  <option disabled>Select Class First</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
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
