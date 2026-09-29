/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import { Castle, UserCircle, Users, Paintbrush, ChevronDown } from "lucide-react";

import API from "../../apis";
import config from "../config";
import SchoolHouseValidation from "./Validation";

import { setSchoolClasses } from "../../redux/actions/ClassAction";
import { setSchoolSections } from "../../redux/actions/SectionAction";
import { setAllStudents, setStudents } from "../../redux/actions/StudentAction";
import { setAllTeachers } from "../../redux/actions/TeacherAction";
import { Utility } from "../utility";
import { useCommon } from "../hooks/common";

const initialValues = {
    name: "",
    color_code: "",
    captain: "",
    captainClassId: "",
    captainSectionId: "",
    vice_captain: "",
    viceCaptainClassId: "",
    viceCaptainSectionId: "",
    teacher_incharge: "",
    strength: "",
    status: "active"
};
let sectionObj = {};

const SchoolHouseFormComponent = ({
    onChange,
    refId,
    setDirty,
    reset,
    setReset,
    updatedValues = null
}) => {
    const [initialState, setInitialState] = useState(initialValues);
    const [classData, setClassData] = useState([]);
    
    const schoolClasses = useSelector(state => state.schoolClasses);
    const schoolSections = useSelector(state => state.schoolSections);
    const allFormStudents = useSelector(state => state.allStudents);
    const allStudents = useSelector(state => state.allFormStudents);
    const allTeachers = useSelector(state => state.allFormTeachers);

    const dispatch = useDispatch();
    const { fetchAndSetSchoolData } = Utility();
    const { getStudents, getPaginatedData } = useCommon();

    const formik = useFormik({
        initialValues: initialState,
        validationSchema: SchoolHouseValidation,
        enableReinitialize: true,
        onSubmit: () => watchForm()
    });

    React.useImperativeHandle(refId, () => ({
        Submit: async () => {
            await formik.submitForm();
        }
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

    const getAndSetSections = (classId) => {
        const classSections = classData?.filter(obj => obj.class_id === classId) || [];
        const selectedSections = classSections.map(({ section_id, section_name }) => ({ section_id, section_name }));
        sectionObj = {
            ...sectionObj,
            [classId]: selectedSections
        };
        dispatch(setSchoolSections(sectionObj));
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
        if (!allTeachers?.listData?.rows?.length) {
            getPaginatedData(0, 40, setAllTeachers, API.TeacherAPI);
        }
    }, []);

    useEffect(() => {
        if (!schoolClasses?.listData?.length || !schoolSections?.listData?.length) {
            fetchAndSetSchoolData(dispatch, setSchoolClasses, setSchoolSections, setClassData);
        }
    }, []);

    useEffect(() => {
        if (formik.values.captainClassId && formik.values.captainSectionId) {
            getStudents(formik.values.captainClassId, formik.values.captainSectionId, setAllStudents, API);
        }
    }, [formik.values.captainClassId, formik.values.captainSectionId]);

    useEffect(() => {
        getAndSetSections(formik.values.captainClassId);
    }, [formik.values.captainClassId, classData?.length]);

    useEffect(() => {
        if (formik.values.viceCaptainClassId && formik.values.viceCaptainSectionId) {
            getStudents(formik.values.viceCaptainClassId, formik.values.viceCaptainSectionId, setStudents, API);
        }
    }, [formik.values.viceCaptainClassId, formik.values.viceCaptainSectionId]);

    useEffect(() => {
        getAndSetSections(formik.values.viceCaptainClassId);
    }, [formik.values.viceCaptainClassId, classData?.length]);

    const inputClasses =
        "w-full pl-10 pr-3.5 py-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2e2e2e] rounded-xl shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500";

    const selectClasses =
        "w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2e2e2e] rounded-xl shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all outline-none text-slate-900 dark:text-slate-100 cursor-pointer appearance-none";

    const labelClasses =
        "block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5";

    const errorClasses = "text-rose-500 text-xs mt-1 ml-0.5 font-medium";

    return (
        <form ref={refId} onSubmit={formik.handleSubmit} className="space-y-6">
            
            {/* ── CARD 1: House Identity & Details ──────────────────────────────── */}
            <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#222]">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        House Information & Identity
                    </h3>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        House branding, faculty incharge & capacity
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Name */}
                    <div>
                        <label className={labelClasses}>House Name*</label>
                        <div className="relative">
                            <Castle className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                name="name"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.name}
                                className={`${inputClasses} ${
                                    formik.touched.name && formik.errors.name
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                                placeholder="e.g., Red Tigers, Gryffindor"
                            />
                        </div>
                        {formik.touched.name && formik.errors.name && (
                            <p className={errorClasses}>{formik.errors.name}</p>
                        )}
                    </div>

                    {/* Color Code */}
                    <div>
                        <label className={labelClasses}>Color Code</label>
                        <div className="relative">
                            <Paintbrush className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                name="color_code"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.color_code}
                                className={`${inputClasses} ${
                                    formik.touched.color_code && formik.errors.color_code
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                                placeholder="e.g., #FF5733"
                            />
                        </div>
                        {formik.touched.color_code && formik.errors.color_code && (
                            <p className={errorClasses}>{formik.errors.color_code}</p>
                        )}
                    </div>

                    {/* Strength */}
                    <div>
                        <label className={labelClasses}>Student Strength</label>
                        <div className="relative">
                            <Users className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                name="strength"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.strength}
                                className={`${inputClasses} ${
                                    formik.touched.strength && formik.errors.strength
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                                placeholder="e.g., 250"
                            />
                        </div>
                        {formik.touched.strength && formik.errors.strength && (
                            <p className={errorClasses}>{formik.errors.strength}</p>
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
                                {Object.keys(config.status).map(item => (
                                    <option key={item} value={item}>
                                        {config.status[item]}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.status && formik.errors.status && (
                            <p className={errorClasses}>{formik.errors.status}</p>
                        )}
                    </div>

                    {/* Teacher Incharge Name */}
                    <div className="md:col-span-2">
                        <label className={labelClasses}>Teacher Incharge Name</label>
                        <div className="relative">
                            <select
                                name="teacher_incharge"
                                value={formik.values.teacher_incharge || ''}
                                onChange={event => formik.setFieldValue("teacher_incharge", event.target.value)}
                                onBlur={formik.handleBlur}
                                className={`${selectClasses} pr-9 ${
                                    formik.touched.teacher_incharge && formik.errors.teacher_incharge
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                            >
                                <option value="" disabled>Select Teacher Incharge</option>
                                {allTeachers?.listData?.rows?.map(item => (
                                    <option value={item.id} key={item.id}>
                                        {`${item.teacherName}`}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.teacher_incharge && formik.errors.teacher_incharge && (
                            <p className={errorClasses}>{formik.errors.teacher_incharge}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── CARD 2: Captain Leadership ───────────────────────────────────── */}
            <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#222]">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        House Captain Leadership
                    </h3>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        Class, section & student selection
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Captain Class */}
                    <div>
                        <label className={labelClasses}>Class</label>
                        <div className="relative">
                            <select
                                name="captainClassId"
                                value={formik.values.captainClassId}
                                onChange={event => {
                                    formik.setFieldValue("captainClassId", event.target.value);
                                    if (formik.values.captainSectionId) {
                                        formik.setFieldValue("captainSectionId", '');
                                    }
                                    if (formik.values.captain) {
                                        formik.setFieldValue("captain", '');
                                    }
                                }}
                                onBlur={formik.handleBlur}
                                className={`${selectClasses} pr-9 ${
                                    formik.touched.captainClassId && formik.errors.captainClassId
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                            >
                                <option value="" disabled>Select Class</option>
                                {schoolClasses?.listData?.map(cls => (
                                    <option value={cls.class_id} key={cls.class_id}>
                                        {cls.class_name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.captainClassId && formik.errors.captainClassId && (
                            <p className={errorClasses}>{formik.errors.captainClassId}</p>
                        )}
                    </div>

                    {/* Captain Section */}
                    <div>
                        <label className={labelClasses}>Section</label>
                        <div className="relative">
                            <select
                                name="captainSectionId"
                                value={formik.values.captainSectionId}
                                onChange={event => {
                                    formik.setFieldValue("captainSectionId", event.target.value);
                                    if (formik.values.captain) {
                                        formik.setFieldValue("captain", '');
                                    }
                                }}
                                onBlur={formik.handleBlur}
                                className={`${selectClasses} pr-9 ${
                                    formik.touched.captainSectionId && formik.errors.captainSectionId
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                            >
                                <option value="" disabled>Select Section</option>
                                {schoolSections?.listData?.[formik.values.captainClassId]?.map(section => (
                                    <option value={section.section_id} key={section.section_id}>
                                        {section.section_name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.captainSectionId && formik.errors.captainSectionId && (
                            <p className={errorClasses}>{formik.errors.captainSectionId}</p>
                        )}
                    </div>

                    {/* Captain Name */}
                    <div>
                        <label className={labelClasses}>Captain Name</label>
                        <div className="relative">
                            <select
                                name="captain"
                                value={formik.values.captain}
                                onChange={event => formik.setFieldValue("captain", event.target.value)}
                                onBlur={formik.handleBlur}
                                className={`${selectClasses} pr-9 ${
                                    formik.touched.captain && formik.errors.captain
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                            >
                                <option value="" disabled>Select Captain</option>
                                {allStudents?.listData?.rows?.map(item => (
                                    <option value={item.id} key={item.id}>
                                        {`${item.firstname.charAt(0).toUpperCase() + item.firstname.slice(1)} ${item.lastname.charAt(0).toUpperCase() + item.lastname.slice(1)}`}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.captain && formik.errors.captain && (
                            <p className={errorClasses}>{formik.errors.captain}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── CARD 3: Vice Captain Leadership ───────────────────────────────── */}
            <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#222]">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        House Vice Captain Leadership
                    </h3>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        Class, section & student selection
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Vice Captain Class */}
                    <div>
                        <label className={labelClasses}>Class</label>
                        <div className="relative">
                            <select
                                name="viceCaptainClassId"
                                value={formik.values.viceCaptainClassId}
                                onChange={event => {
                                    formik.setFieldValue("viceCaptainClassId", event.target.value);
                                    if (formik.values.viceCaptainSectionId) {
                                        formik.setFieldValue("viceCaptainSectionId", '');
                                    }
                                    if (formik.values.vice_captain) {
                                        formik.setFieldValue("vice_captain", '');
                                    }
                                }}
                                onBlur={formik.handleBlur}
                                className={`${selectClasses} pr-9 ${
                                    formik.touched.viceCaptainClassId && formik.errors.viceCaptainClassId
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                            >
                                <option value="" disabled>Select Class</option>
                                {schoolClasses?.listData?.map(cls => (
                                    <option value={cls.class_id} key={cls.class_id}>
                                        {cls.class_name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.viceCaptainClassId && formik.errors.viceCaptainClassId && (
                            <p className={errorClasses}>{formik.errors.viceCaptainClassId}</p>
                        )}
                    </div>

                    {/* Vice Captain Section */}
                    <div>
                        <label className={labelClasses}>Section</label>
                        <div className="relative">
                            <select
                                name="viceCaptainSectionId"
                                value={formik.values.viceCaptainSectionId}
                                onChange={event => {
                                    formik.setFieldValue("viceCaptainSectionId", event.target.value);
                                    if (formik.values.vice_captain) {
                                        formik.setFieldValue("vice_captain", '');
                                    }
                                }}
                                onBlur={formik.handleBlur}
                                className={`${selectClasses} pr-9 ${
                                    formik.touched.viceCaptainSectionId && formik.errors.viceCaptainSectionId
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                            >
                                <option value="" disabled>Select Section</option>
                                {schoolSections?.listData?.[formik.values.viceCaptainClassId]?.map(section => (
                                    <option value={section.section_id} key={section.section_id}>
                                        {section.section_name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.viceCaptainSectionId && formik.errors.viceCaptainSectionId && (
                            <p className={errorClasses}>{formik.errors.viceCaptainSectionId}</p>
                        )}
                    </div>

                    {/* Vice Captain Name */}
                    <div>
                        <label className={labelClasses}>Vice Captain Name</label>
                        <div className="relative">
                            <select
                                name="vice_captain"
                                value={formik.values.vice_captain}
                                onChange={event => formik.setFieldValue("vice_captain", event.target.value)}
                                onBlur={formik.handleBlur}
                                className={`${selectClasses} pr-9 ${
                                    formik.touched.vice_captain && formik.errors.vice_captain
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                            >
                                <option value="" disabled>Select Vice Captain</option>
                                {allFormStudents?.listData?.rows?.map(item => (
                                    <option value={item.id} key={item.id}>
                                        {`${item.firstname.charAt(0).toUpperCase() + item.firstname.slice(1)} ${item.lastname.charAt(0).toUpperCase() + item.lastname.slice(1)}`}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.vice_captain && formik.errors.vice_captain && (
                            <p className={errorClasses}>{formik.errors.vice_captain}</p>
                        )}
                    </div>
                </div>
            </div>

        </form>
    );
};

SchoolHouseFormComponent.propTypes = {
    onChange: PropTypes.func,
    refId: PropTypes.shape({
        current: PropTypes.any
    }),
    setDirty: PropTypes.func,
    reset: PropTypes.bool,
    setReset: PropTypes.func,
    updatedValues: PropTypes.object
};

export default SchoolHouseFormComponent;
