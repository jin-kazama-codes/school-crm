/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { ChevronDown } from "lucide-react";

import API from "../../apis";
import config from "../config";
import homeworkValidation from "./Validation";
import { Utility } from "../utility";
import { setAllClasses } from "../../redux/actions/ClassAction";
import { setAllSections } from "../../redux/actions/SectionAction";
import { setAllSubjects } from "../../redux/actions/SubjectAction";

const initialValues = {
    title: "",
    description: "",
    class_id: "",
    section_id: "",
    subject_id: "",
    status: "active",
};

const HomeworkFormComponent = ({
    onChange,
    refId,
    setDirty,
    reset,
    setReset,
    updatedValues = null,
}) => {
    const [initialState, setInitialState] = useState(initialValues);
    const [classesList, setClassesList] = useState([]);
    const [sectionsList, setSectionsList] = useState([]);
    const [subjectsList, setSubjectsList] = useState([]);
    const [schoolClassData, setSchoolClassData] = useState([]);

    const dispatch = useDispatch();
    const { capitalizeEveryWord, createUniqueDataArray, getLocalStorage } = Utility();

    // Redux store fallbacks
    const reduxClasses = useSelector(state => state.allClasses?.listData?.rows || state.allClasses?.listData || []);
    const reduxSections = useSelector(state => state.allSections?.listData?.rows || state.allSections?.listData || []);
    const reduxSubjects = useSelector(state => state.allSubjects?.listData?.rows || state.allSubjects?.listData || []);

    const formik = useFormik({
        initialValues: initialState,
        validationSchema: homeworkValidation,
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
                // Bug #13 fix: formik.isSubmitting is false by the time onSubmit fires.
                validated: Object.keys(formik.errors).length === 0,
            });
        }
    };

    // Helper sort functions
    const sortClasses = (arr) => {
        return [...arr].sort((a, b) => {
            const idA = Number(a.id ?? a.class_id ?? 0);
            const idB = Number(b.id ?? b.class_id ?? 0);
            if (idA && idB) return idA - idB;
            return String(a.name || a.class_name || "").localeCompare(String(b.name || b.class_name || ""));
        });
    };

    const sortSections = (arr) => {
        return [...arr].sort((a, b) => {
            const idA = Number(a.id ?? a.section_id ?? 0);
            const idB = Number(b.id ?? b.section_id ?? 0);
            if (idA && idB) return idA - idB;
            return String(a.name || a.section_name || "").localeCompare(String(b.name || b.section_name || ""));
        });
    };

    const sortSubjects = (arr) => {
        return [...arr].sort((a, b) => {
            const idA = Number(a.id ?? a.subject_id ?? 0);
            const idB = Number(b.id ?? b.subject_id ?? 0);
            if (idA && idB) return idA - idB;
            return String(a.name || a.subject_name || "").localeCompare(String(b.name || b.subject_name || ""));
        });
    };

    // Load dynamic dropdown data on mount
    useEffect(() => {
        let isMounted = true;

        const loadDropdownData = async () => {
            try {
                const schoolInfo = getLocalStorage("schoolInfo");

                // 1. Fetch master classes, sections, and subjects
                const [classRes, secRes, subRes] = await Promise.all([
                    API.ClassAPI.getAll(false, 0, 100).catch(() => null),
                    API.SectionAPI.getAll(false, 0, 100).catch(() => null),
                    API.SubjectAPI.getAll(false, 0, 100).catch(() => null),
                ]);

                const masterClasses = sortClasses(classRes?.data?.rows || (Array.isArray(classRes?.data) ? classRes.data : []));
                const masterSections = sortSections(secRes?.data?.rows || (Array.isArray(secRes?.data) ? secRes.data : []));
                const masterSubjects = sortSubjects(subRes?.data?.rows || (Array.isArray(subRes?.data) ? subRes.data : []));

                if (masterClasses.length > 0) dispatch(setAllClasses(masterClasses));
                if (masterSections.length > 0) dispatch(setAllSections(masterSections));
                if (masterSubjects.length > 0) dispatch(setAllSubjects(masterSubjects));

                if (!isMounted) return;

                // 2. If a specific school is selected in the topbar, check for school-specific mappings
                let schoolData = [];
                if (schoolInfo && schoolInfo.encrypted_id) {
                    try {
                        const schoolRes = await API.SchoolAPI.getSchoolClasses();
                        if (schoolRes?.status === "Success" && Array.isArray(schoolRes.data) && schoolRes.data.length > 0) {
                            schoolData = schoolRes.data;
                        }
                    } catch {
                        // Fallback to all master data
                    }
                }

                if (schoolData.length > 0) {
                    // Specific school mappings exist
                    setSchoolClassData(schoolData);
                    const uniqueClasses = sortClasses(createUniqueDataArray(schoolData, "class_id", "class_name"));
                    const uniqueSections = sortSections(createUniqueDataArray(schoolData, "section_id", "section_name"));
                    setClassesList(uniqueClasses.length > 0 ? uniqueClasses : masterClasses);
                    setSectionsList(uniqueSections.length > 0 ? uniqueSections : masterSections);
                } else {
                    // All Schools view or no school filter: show all master classes (I through XIII, etc.)
                    setSchoolClassData([]);
                    setClassesList(masterClasses);
                    setSectionsList(masterSections);
                }

                setSubjectsList(masterSubjects);
            } catch (error) {
                console.error("Error loading dropdown data for homework:", error);
            }
        };

        loadDropdownData();

        return () => {
            isMounted = false;
        };
    }, []);

    // Filter sections when class is selected IF specific school mappings are present
    useEffect(() => {
        if (schoolClassData && schoolClassData.length > 0) {
            if (formik.values.class_id) {
                const currentClassId = parseInt(String(formik.values.class_id), 10);
                const classSections = schoolClassData.filter(item => item.class_id === currentClassId);
                const uniqueSecs = sortSections(createUniqueDataArray(classSections, "section_id", "section_name"));
                if (uniqueSecs.length > 0) {
                    setSectionsList(uniqueSecs);
                }
            } else {
                const allSchoolSecs = sortSections(createUniqueDataArray(schoolClassData, "section_id", "section_name"));
                if (allSchoolSecs.length > 0) {
                    setSectionsList(allSchoolSecs);
                }
            }
        }
    }, [formik.values.class_id, schoolClassData]);

    useEffect(() => {
        if (reset) {
            formik.resetForm();
            setReset(false);
        }
    }, [reset]);

    useEffect(() => {
        if (formik.dirty) setDirty(true);
    }, [formik.dirty]);

    useEffect(() => {
        if (updatedValues) setInitialState(updatedValues);
    }, [updatedValues]);

    const inputClass = (field) =>
        `w-full px-3.5 py-2.5 bg-white dark:bg-[#121212] border rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:outline-none focus:ring-2 transition-all ${
            formik.touched[field] && formik.errors[field]
                ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
                : "border-slate-300 dark:border-[#333] focus:ring-emerald-500/20 focus:border-emerald-500"
        }`;

    const selectClass = (field) =>
        `w-full px-3.5 py-2.5 bg-white dark:bg-[#121212] border rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:outline-none focus:ring-2 transition-all cursor-pointer appearance-none ${
            formik.touched[field] && formik.errors[field]
                ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
                : "border-slate-300 dark:border-[#333] focus:ring-emerald-500/20 focus:border-emerald-500"
        }`;

    const displayClasses = classesList.length > 0 ? classesList : reduxClasses;
    const displaySections = sectionsList.length > 0 ? sectionsList : reduxSections;
    const displaySubjects = subjectsList.length > 0 ? subjectsList : reduxSubjects;

    return (
        <form ref={refId} onSubmit={formik.handleSubmit}>
            {/* Engraved Card Container */}
            <div className="bg-white/95 dark:bg-[#161616]/90 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-slate-200/90 dark:border-[#282828] shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                    {/* Title */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-4 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Homework Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            autoComplete="off"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.title}
                            placeholder="e.g., Chapter 4 Exercise 4.2 Problem Set"
                            className={inputClass("title")}
                        />
                        {formik.touched.title && formik.errors.title && (
                            <p className="text-xs text-rose-500 font-medium">{formik.errors.title}</p>
                        )}
                    </div>

                    {/* Class */}
                    <div className="col-span-1 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Class <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                name="class_id"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.class_id}
                                className={selectClass("class_id")}
                            >
                                <option value="" className="bg-white dark:bg-[#161616]">Select Class</option>
                                {displayClasses.map(cls => {
                                    const id = cls.id ?? cls.class_id;
                                    const name = cls.name || cls.class_name || `Class ${id}`;
                                    return (
                                        <option key={id} value={id} className="bg-white dark:bg-[#161616]">
                                            {capitalizeEveryWord(String(name))}
                                        </option>
                                    );
                                })}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.class_id && formik.errors.class_id && (
                            <p className="text-xs text-rose-500 font-medium">{formik.errors.class_id}</p>
                        )}
                    </div>

                    {/* Section */}
                    <div className="col-span-1 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Section <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                name="section_id"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.section_id}
                                className={selectClass("section_id")}
                            >
                                <option value="" className="bg-white dark:bg-[#161616]">Select Section</option>
                                {displaySections.map(sec => {
                                    const id = sec.id ?? sec.section_id;
                                    const name = sec.name || sec.section_name || `Section ${id}`;
                                    return (
                                        <option key={id} value={id} className="bg-white dark:bg-[#161616]">
                                            {capitalizeEveryWord(String(name))}
                                        </option>
                                    );
                                })}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.section_id && formik.errors.section_id && (
                            <p className="text-xs text-rose-500 font-medium">{formik.errors.section_id}</p>
                        )}
                    </div>

                    {/* Subject */}
                    <div className="col-span-1 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Subject <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                name="subject_id"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.subject_id}
                                className={selectClass("subject_id")}
                            >
                                <option value="" className="bg-white dark:bg-[#161616]">Select Subject</option>
                                {displaySubjects.map(sub => {
                                    const id = sub.id ?? sub.subject_id;
                                    const name = sub.name || sub.subject_name || `Subject ${id}`;
                                    return (
                                        <option key={id} value={id} className="bg-white dark:bg-[#161616]">
                                            {capitalizeEveryWord(String(name))}
                                        </option>
                                    );
                                })}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.subject_id && formik.errors.subject_id && (
                            <p className="text-xs text-rose-500 font-medium">{formik.errors.subject_id}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div className="col-span-1 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Status
                        </label>
                        <div className="relative">
                            <select
                                name="status"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.status}
                                className={selectClass("status")}
                            >
                                {Object.keys(config.status).map(item => (
                                    <option key={item} value={item} className="bg-white dark:bg-[#161616]">
                                        {config.status[item]}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-4 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Homework Details & Instructions
                        </label>
                        <textarea
                            name="description"
                            rows={4}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.description}
                            placeholder="Provide comprehensive details, question numbers, textbook references or submission guidelines..."
                            className={`${inputClass("description")} resize-y custom-scrollbar`}
                        />
                        {formik.touched.description && formik.errors.description && (
                            <p className="text-xs text-rose-500 font-medium">{formik.errors.description}</p>
                        )}
                    </div>

                </div>
            </div>
        </form>
    );
};

HomeworkFormComponent.propTypes = {
    onChange: PropTypes.func,
    refId: PropTypes.shape({ current: PropTypes.any }),
    setDirty: PropTypes.func,
    reset: PropTypes.bool,
    setReset: PropTypes.func,
    updatedValues: PropTypes.object,
};

export default HomeworkFormComponent;
