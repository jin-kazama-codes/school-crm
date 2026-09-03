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
import { Castle, UserCircle, Users, Activity, Paintbrush, BookOpen } from "lucide-react";

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
                validated: formik.isSubmitting
                    ? Object.keys(formik.errors).length === 0
                    : false
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

    const inputClass = (touched, error) => `w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all pl-11 ${
        touched && error 
        ? 'border-red-500 focus:ring-red-500/50' 
        : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/50'
    } text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500`;

    const selectClass = (touched, error) => `w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
        touched && error 
        ? 'border-red-500 focus:ring-red-500/50' 
        : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/50'
    } text-slate-800 dark:text-slate-100`;

    const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";
    const errorClass = "mt-1.5 text-sm text-red-500 font-medium";
    
    const fieldsetLegendClass = "flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100 mb-6";
    const fieldsetClass = "p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 mt-8";

    return (
        <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 w-full animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Castle className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">House Details</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Basic house configuration</p>
                </div>
            </div>

            <form ref={refId} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex flex-col">
                        <label className={labelClass}>Name*</label>
                        <div className="relative">
                            <Castle className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                name="name"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.name}
                                className={inputClass(formik.touched.name, formik.errors.name)}
                                placeholder="e.g., Gryffindor"
                            />
                        </div>
                        {formik.touched.name && formik.errors.name && (
                            <p className={errorClass}>{formik.errors.name}</p>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <label className={labelClass}>Color Code</label>
                        <div className="relative">
                            <Paintbrush className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                name="color_code"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.color_code}
                                className={inputClass(formik.touched.color_code, formik.errors.color_code)}
                                placeholder="e.g., #FF0000"
                            />
                        </div>
                        {formik.touched.color_code && formik.errors.color_code && (
                            <p className={errorClass}>{formik.errors.color_code}</p>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <label className={labelClass}>Strength</label>
                        <div className="relative">
                            <Users className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                name="strength"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.strength}
                                className={inputClass(formik.touched.strength, formik.errors.strength)}
                                placeholder="e.g., 250"
                            />
                        </div>
                        {formik.touched.strength && formik.errors.strength && (
                            <p className={errorClass}>{formik.errors.strength}</p>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <label className={labelClass}>Status</label>
                        <div className="relative">
                            <select
                                name="status"
                                value={formik.values.status}
                                onChange={formik.handleChange}
                                className={selectClass(formik.touched.status, formik.errors.status)}
                            >
                                {Object.keys(config.status).map(item => (
                                    <option key={item} value={item}>
                                        {config.status[item]}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {formik.touched.status && formik.errors.status && (
                            <p className={errorClass}>{formik.errors.status}</p>
                        )}
                    </div>

                    <div className="flex flex-col md:col-span-2">
                        <label className={labelClass}>Teacher Incharge Name</label>
                        <div className="relative">
                            <select
                                name="teacher_incharge"
                                value={formik.values.teacher_incharge || ''}
                                onChange={event => formik.setFieldValue("teacher_incharge", event.target.value)}
                                className={selectClass(formik.touched.teacher_incharge, formik.errors.teacher_incharge)}
                            >
                                <option value="" disabled>Select Teacher</option>
                                {allTeachers?.listData?.rows?.map(item => (
                                    <option value={item.id} key={item.id}>
                                        {`${item.teacherName}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {formik.touched.teacher_incharge && formik.errors.teacher_incharge && (
                            <p className={errorClass}>{formik.errors.teacher_incharge}</p>
                        )}
                    </div>
                </div>

                <div className={fieldsetClass}>
                    <h3 className={fieldsetLegendClass}>
                        <UserCircle className="w-6 h-6 text-emerald-500" />
                        Captain
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col">
                            <label className={labelClass}>Class</label>
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
                                className={selectClass(formik.touched.captainClassId, formik.errors.captainClassId)}
                            >
                                <option value="" disabled>Select Class</option>
                                {schoolClasses?.listData?.map(cls => (
                                    <option value={cls.class_id} key={cls.class_id}>
                                        {cls.class_name}
                                    </option>
                                ))}
                            </select>
                            {formik.touched.captainClassId && formik.errors.captainClassId && (
                                <p className={errorClass}>{formik.errors.captainClassId}</p>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <label className={labelClass}>Section</label>
                            <select
                                name="captainSectionId"
                                value={formik.values.captainSectionId}
                                onChange={event => {
                                    formik.setFieldValue("captainSectionId", event.target.value);
                                    if (formik.values.captain) {
                                        formik.setFieldValue("captain", '');
                                    }
                                }}
                                className={selectClass(formik.touched.captainSectionId, formik.errors.captainSectionId)}
                            >
                                <option value="" disabled>Select Section</option>
                                {schoolSections?.listData?.[formik.values.captainClassId]?.map(section => (
                                    <option value={section.section_id} key={section.section_id}>
                                        {section.section_name}
                                    </option>
                                ))}
                            </select>
                            {formik.touched.captainSectionId && formik.errors.captainSectionId && (
                                <p className={errorClass}>{formik.errors.captainSectionId}</p>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <label className={labelClass}>Name</label>
                            <select
                                name="captain"
                                value={formik.values.captain}
                                onChange={event => formik.setFieldValue("captain", event.target.value)}
                                className={selectClass(formik.touched.captain, formik.errors.captain)}
                            >
                                <option value="" disabled>Select Captain</option>
                                {allStudents?.listData?.rows?.map(item => (
                                    <option value={item.id} key={item.id}>
                                        {`${item.firstname.charAt(0).toUpperCase() + item.firstname.slice(1)} ${item.lastname.charAt(0).toUpperCase() + item.lastname.slice(1)}`}
                                    </option>
                                ))}
                            </select>
                            {formik.touched.captain && formik.errors.captain && (
                                <p className={errorClass}>{formik.errors.captain}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className={fieldsetClass}>
                    <h3 className={fieldsetLegendClass}>
                        <UserCircle className="w-6 h-6 text-indigo-500" />
                        Vice Captain
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col">
                            <label className={labelClass}>Class</label>
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
                                className={selectClass(formik.touched.viceCaptainClassId, formik.errors.viceCaptainClassId)}
                            >
                                <option value="" disabled>Select Class</option>
                                {schoolClasses?.listData?.map(cls => (
                                    <option value={cls.class_id} key={cls.class_id}>
                                        {cls.class_name}
                                    </option>
                                ))}
                            </select>
                            {formik.touched.viceCaptainClassId && formik.errors.viceCaptainClassId && (
                                <p className={errorClass}>{formik.errors.viceCaptainClassId}</p>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <label className={labelClass}>Section</label>
                            <select
                                name="viceCaptainSectionId"
                                value={formik.values.viceCaptainSectionId}
                                onChange={event => {
                                    formik.setFieldValue("viceCaptainSectionId", event.target.value);
                                    if (formik.values.vice_captain) {
                                        formik.setFieldValue("vice_captain", '');
                                    }
                                }}
                                className={selectClass(formik.touched.viceCaptainSectionId, formik.errors.viceCaptainSectionId)}
                            >
                                <option value="" disabled>Select Section</option>
                                {schoolSections?.listData?.[formik.values.viceCaptainClassId]?.map(section => (
                                    <option value={section.section_id} key={section.section_id}>
                                        {section.section_name}
                                    </option>
                                ))}
                            </select>
                            {formik.touched.viceCaptainSectionId && formik.errors.viceCaptainSectionId && (
                                <p className={errorClass}>{formik.errors.viceCaptainSectionId}</p>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <label className={labelClass}>Name</label>
                            <select
                                name="vice_captain"
                                value={formik.values.vice_captain}
                                onChange={event => formik.setFieldValue("vice_captain", event.target.value)}
                                className={selectClass(formik.touched.vice_captain, formik.errors.vice_captain)}
                            >
                                <option value="" disabled>Select Vice Captain</option>
                                {allFormStudents?.listData?.rows?.map(item => (
                                    <option value={item.id} key={item.id}>
                                        {`${item.firstname.charAt(0).toUpperCase() + item.firstname.slice(1)} ${item.lastname.charAt(0).toUpperCase() + item.lastname.slice(1)}`}
                                    </option>
                                ))}
                            </select>
                            {formik.touched.vice_captain && formik.errors.vice_captain && (
                                <p className={errorClass}>{formik.errors.vice_captain}</p>
                            )}
                        </div>
                    </div>
                </div>

            </form>
        </div>
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
