/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import { useSelector, useDispatch } from "react-redux";

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
                validated:
                    formik.isSubmitting
                        ? Object.keys(formik.errors).length === 0
                        : false,
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

    const fieldClass = (field) =>
        `w-full px-4 py-2 bg-white dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-slate-700 dark:text-slate-300 ${
            formik.touched[field] && formik.errors[field]
                ? "border-red-500 focus:ring-red-500/50"
                : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500/50"
        }`;

    const displayClasses = classesList.length > 0 ? classesList : reduxClasses;
    const displaySections = sectionsList.length > 0 ? sectionsList : reduxSections;
    const displaySubjects = subjectsList.length > 0 ? subjectsList : reduxSubjects;

    return (
        <div className="p-6">
            <form ref={refId} onSubmit={formik.handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Title */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            autoComplete="off"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.title}
                            className={fieldClass("title")}
                        />
                        {formik.touched.title && formik.errors.title && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.title}</p>
                        )}
                    </div>

                    {/* Class */}
                    <div className="col-span-1 lg:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Class *
                        </label>
                        <select
                            name="class_id"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.class_id}
                            className={fieldClass("class_id")}
                        >
                            <option value="">Select Class</option>
                            {displayClasses.map(cls => {
                                const id = cls.id ?? cls.class_id;
                                const name = cls.name || cls.class_name || `Class ${id}`;
                                return (
                                    <option key={id} value={id}>
                                        {capitalizeEveryWord(String(name))}
                                    </option>
                                );
                            })}
                        </select>
                        {formik.touched.class_id && formik.errors.class_id && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.class_id}</p>
                        )}
                    </div>

                    {/* Section */}
                    <div className="col-span-1 lg:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Section *
                        </label>
                        <select
                            name="section_id"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.section_id}
                            className={fieldClass("section_id")}
                        >
                            <option value="">Select Section</option>
                            {displaySections.map(sec => {
                                const id = sec.id ?? sec.section_id;
                                const name = sec.name || sec.section_name || `Section ${id}`;
                                return (
                                    <option key={id} value={id}>
                                        {capitalizeEveryWord(String(name))}
                                    </option>
                                );
                            })}
                        </select>
                        {formik.touched.section_id && formik.errors.section_id && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.section_id}</p>
                        )}
                    </div>

                    {/* Subject */}
                    <div className="col-span-1 lg:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Subject *
                        </label>
                        <select
                            name="subject_id"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.subject_id}
                            className={fieldClass("subject_id")}
                        >
                            <option value="">Select Subject</option>
                            {displaySubjects.map(sub => {
                                const id = sub.id ?? sub.subject_id;
                                const name = sub.name || sub.subject_name || `Subject ${id}`;
                                return (
                                    <option key={id} value={id}>
                                        {capitalizeEveryWord(String(name))}
                                    </option>
                                );
                            })}
                        </select>
                        {formik.touched.subject_id && formik.errors.subject_id && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.subject_id}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div className="col-span-1 lg:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Status
                        </label>
                        <select
                            name="status"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.status}
                            className={fieldClass("status")}
                        >
                            {Object.keys(config.status).map(item => (
                                <option key={item} value={item}>{config.status[item]}</option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            rows="4"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.description}
                            className={`${fieldClass("description")} resize-y`}
                        />
                        {formik.touched.description && formik.errors.description && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.description}</p>
                        )}
                    </div>

                </div>
            </form>
        </div>
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
