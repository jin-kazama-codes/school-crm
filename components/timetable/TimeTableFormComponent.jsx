/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import { ChevronDown, Clock, AlertTriangle, BookOpen, Sparkles } from "lucide-react";

import API from "../../apis";
import config from "../config";
import TimeTableValidation from "./Validation";

import { setSchoolClasses, setTeacherClasses } from "../../redux/actions/ClassAction";
import { setSchoolSections, setTeacherSections } from "../../redux/actions/SectionAction";
import { setSchoolSubjects, setTeacherSubjects } from "../../redux/actions/SubjectAction";
import { setSchoolDurations } from "../../redux/actions/SchoolDurationAction";
import { Utility } from "../utility";
import { useCommon } from "../hooks/common";

const initialValues = {
    dbId: "",
    period: [],
    day: "",
    class: "",
    section: "",
    batch: "",
    subject: [],
    duration: []
};

const TimeTableFormComponent = ({
    onChange,
    refId,
    setDirty,
    reset,
    setReset,
    classData = null,
    setClassData = null,
    allSubjects,
    updatedValues = null
}) => {

    const [schoolId, setSchoolId] = useState([]);
    const [scale, setScale] = useState(1);
    
    const teacherClasses = useSelector(state => state.teacherClasses);
    const teacherSections = useSelector(state => state.teacherSections);
    const teacherSubjects = useSelector(state => state.teacherSubjects);
    const schoolDuration = useSelector(state => state.allSchoolDurations);

    const dispatch = useDispatch();
    const { getPaginatedData } = useCommon();
    const { fetchAndSetSchoolData, getLocalStorage, findMultipleById, fetchAndSetTeacherData } = Utility();

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: TimeTableValidation,
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

    const openingTime = new Date(schoolId?.opening_time ? schoolId?.opening_time : schoolId?.eve_opening_time).toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });

    function convertToAMPM(timeString) {
        if(!timeString) return "";
        const [hours, minutes] = timeString.split(':');

        if (isNaN(hours) || isNaN(minutes)) {
            return "Invalid time format";
        }

        const parsedHours = parseInt(hours, 10);
        const parsedMinutes = parseInt(minutes, 10);

        if (parsedHours < 0 || parsedHours > 23 || parsedMinutes < 0 || parsedMinutes > 59) {
            return "Invalid time value";
        }

        const date = new Date();
        date.setHours(parsedHours);
        date.setMinutes(parsedMinutes);

        const options = { hour: 'numeric', minute: 'numeric', hour12: true };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    }

    const schoolPeriodDuration = (hours = 0, minutes = 0, condition, half_duration) => {
        const timeslots = [];
        const startTime = new Date();
        startTime.setHours(hours, minutes, 0); 

        for (let i = 0; i < condition; i++) {
            let slotFrom = `${startTime.getHours()}:${startTime.getMinutes() == 0 ? '00' : startTime.getMinutes()}`;
            startTime.setMinutes(startTime.getMinutes() + half_duration);
            let slotTo = `${startTime.getHours()}:${startTime.getMinutes() == 0 ? '00' : startTime.getMinutes()}`;
            timeslots.push(`${convertToAMPM(slotFrom)}-${convertToAMPM(slotTo)}`);
        }
        return timeslots;
    };

    let firstHalfDuration = [];
    if(schoolId?.period && openingTime && openingTime !== "Invalid Date") {
        try {
            firstHalfDuration = schoolPeriodDuration(openingTime.slice(0, 2).replace(':', '').padStart(2, '0'), openingTime.slice(2, 5).replace(':', ''), schoolId?.period / schoolId?.halves, schoolId?.first_half_period_duration);
        } catch(e) {}
    }
    
    let secondHalfDuration = [];
    let totalDuration = [];

    if (firstHalfDuration.length) {
        let openingTimes = firstHalfDuration[firstHalfDuration.length - 1];
        let secondOpeningTimeHr = openingTimes.split('-').splice(1).join('').slice(0, 2).replace(':', '').padStart(2, '0');
        let secondOpeningTimeMi = openingTimes.split('-').splice(1).join('').slice(2, 5).replace(':', '');

        let secondMinTotal = parseInt(secondOpeningTimeMi, 10) + parseInt(schoolId?.recess_time, 10);
        secondHalfDuration = schoolPeriodDuration(secondOpeningTimeHr, secondMinTotal, schoolId?.period / schoolId?.halves, schoolId?.second_half_period_duration);
        if (secondHalfDuration.length) {
            totalDuration = [...firstHalfDuration, ...secondHalfDuration];
        }
    }

    useEffect(() => {
        if (formik.values.class && classData?.length) {
            const classSections = classData?.filter(obj => obj.class_id === formik.values.class) || [];
            const seenSections = new Set();
            const uniqueSections = classSections.filter(({ section_id }) => {
                if (seenSections.has(section_id)) {
                    return false;
                }
                seenSections.add(section_id);
                return true;
            });
            const selectedSections = uniqueSections.map(({ section_id, section_name }) => ({ section_id, section_name }));
            dispatch(setTeacherSections(selectedSections));
        }
    }, [formik.values?.class, classData?.length]);

    useEffect(() => {
        if (formik.values.section && classData?.length) {
            const sectionSubjects = classData.filter(obj => obj.class_id === formik.values.class && obj.section_id === formik.values.section);
            
            let allSubjectIds = [];
            sectionSubjects.forEach(subject => {
                if (subject.subject_ids) {
                    allSubjectIds = allSubjectIds.concat(subject.subject_ids.split(','));
                }
            });
    
            const uniqueSubjectIds = [...new Set(allSubjectIds)];
            const uniqueSubjectIdsString = uniqueSubjectIds.join(',');
            const selectedSubjects = uniqueSubjectIds.length ? findMultipleById(uniqueSubjectIdsString, allSubjects) : [];
            dispatch(setTeacherSubjects(selectedSubjects));
        }
    }, [formik.values?.class, formik.values?.section, classData?.length, allSubjects]);

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
            updatedValues?.map((period, index) => {
                formik.setFieldValue(`period${index + 1}`, period?.period);
                formik.setFieldValue(`duration${index + 1}`, period?.duration);
                formik.setFieldValue(`subject${index + 1}`, period?.subject_id);
                formik.setFieldValue(`dbId_${index}`, period?.id);
            });
            formik.setFieldValue(`class`, updatedValues[0]?.class_id);
            formik.setFieldValue(`section`, updatedValues[0]?.section_id);
            formik.setFieldValue(`day`, updatedValues[0]?.day);
            formik.setFieldValue(`batch`, updatedValues[0]?.batch);
        }
    }, [updatedValues]);

    useEffect(() => {
        if (getLocalStorage("schoolInfo") && (!teacherSubjects?.listData?.length || !teacherClasses?.listData?.length || !teacherSections?.listData?.length)) {
            fetchAndSetTeacherData(dispatch, setTeacherClasses, setTeacherSections, setClassData);
        }
    }, []);

    useEffect(() => {
        let schoolInfo = getLocalStorage("schoolInfo");
        if (!schoolDuration?.listData?.rows?.length) {
            getPaginatedData(0, 5, setSchoolDurations, API.SchoolDurationAPI);
        }
        if (schoolInfo?.encrypted_id) {
            API.CommonAPI.decryptText(schoolInfo)
                .then(result => {
                    if (result.status === 'Success') {
                        const schoolObj = schoolDuration?.listData?.rows?.filter(obj => `${obj.school_id}` === result.data);
                        if (formik.values.batch == "both") {
                            setSchoolId(schoolObj?.[0] || []);
                        } else if (schoolObj?.length > 0) {
                            const seniorRow = schoolObj.find(obj => obj.batch === "senior");
                            const juniorRow = schoolObj.find(obj => obj.batch === "junior");

                            if (formik.values.batch == "senior") {
                                setSchoolId(seniorRow || []);
                            } else {
                                setSchoolId(juniorRow || []);
                            }
                        }
                    } 
                });
        }
    }, [schoolDuration?.listData?.rows?.length, formik.values.batch]);

    useEffect(() => {
        if (totalDuration?.length && !formik?.values?.duration?.length) {
            formik.setFieldValue('duration', totalDuration);
        }
    }, [totalDuration]);

    useEffect(() => {
        if (schoolId?.period) {
            const totalPeriodArray = Array.from({ length: schoolId.period }, (_, index) => index + 1);
            formik.setFieldValue('period', totalPeriodArray);
        }
    }, [schoolId]);

    useEffect(() => {
        let count = 0;
        const maxCount = 10;
        const interval = 400;

        const intervalId = setInterval(() => {
            setScale((prevScale) => (prevScale === 1 ? 1.05 : 1));
            count += 1;
            if (count >= maxCount) {
                clearInterval(intervalId);
                setScale(1); 
            }
        }, interval);

        return () => clearInterval(intervalId);
    }, []);

    const selectClasses =
        "w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2e2e2e] rounded-xl shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all outline-none text-slate-900 dark:text-slate-100 cursor-pointer appearance-none";

    const labelClasses =
        "block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5";

    const errorClasses = "text-rose-500 text-xs mt-1 ml-0.5 font-medium";

    return (
        <form ref={refId} onSubmit={formik.handleSubmit} className="space-y-6">
            
            {/* ── CARD 1: Configuration Section ─────────────────────────────────── */}
            <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#222]">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        Timetable Allocation Criteria
                    </h3>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        Class, section, day & batch settings
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Class */}
                    <div>
                        <label className={labelClasses}>Class*</label>
                        <div className="relative">
                            <select
                                name="class"
                                value={formik.values.class}
                                onChange={event => {
                                    formik.setFieldValue("class", event.target.value);
                                    if (formik.values.section) formik.setFieldValue("section", '');
                                    if (formik.values.subject) formik.setFieldValue("subject", []);
                                }}
                                onBlur={formik.handleBlur}
                                className={`${selectClasses} pr-9 ${
                                    formik.touched.class && formik.errors.class
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                            >
                                <option value="" disabled>Select Class</option>
                                {teacherClasses?.listData?.map(cls => (
                                    <option value={cls.class_id} key={cls.class_id}>{cls.class_name}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.class && formik.errors.class && <p className={errorClasses}>{formik.errors.class}</p>}
                    </div>

                    {/* Section */}
                    <div>
                        <label className={labelClasses}>Section*</label>
                        <div className="relative">
                            <select
                                name="section"
                                value={formik.values.section}
                                onChange={event => {
                                    formik.setFieldValue("section", event.target.value);
                                    if (formik.values.subject) formik.setFieldValue("subject", '');
                                }}
                                onBlur={formik.handleBlur}
                                className={`${selectClasses} pr-9 ${
                                    formik.touched.section && formik.errors.section
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                            >
                                <option value="" disabled>Select Section</option>
                                {teacherSections?.listData?.map(section => (
                                    <option value={section.section_id} key={section.section_id}>{section.section_name}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.section && formik.errors.section && <p className={errorClasses}>{formik.errors.section}</p>}
                    </div>

                    {/* Day */}
                    <div>
                        <label className={labelClasses}>Day*</label>
                        <div className="relative">
                            <select
                                name="day"
                                value={formik.values.day}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`${selectClasses} pr-9 ${
                                    formik.touched.day && formik.errors.day
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                            >
                                <option value="" disabled>Select Day</option>
                                {Object.keys(config.day).map(item => (
                                    <option key={item} value={item}>{config.day[item]}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.day && formik.errors.day && <p className={errorClasses}>{formik.errors.day}</p>}
                    </div>

                    {/* Batch */}
                    <div>
                        <label className={labelClasses}>Batch*</label>
                        <div className="relative">
                            <select
                                name="batch"
                                value={formik.values.batch || ''}
                                onChange={event => formik.setFieldValue("batch", event.target.value)}
                                onBlur={formik.handleBlur}
                                className={`${selectClasses} pr-9 ${
                                    formik.touched.batch && formik.errors.batch
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                            >
                                <option value="" disabled>Select Batch</option>
                                {schoolDuration?.listData?.rows?.map(item => (
                                    <option value={item.batch} key={item.id}>{item.batch}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.batch && formik.errors.batch && <p className={errorClasses}>{formik.errors.batch}</p>}
                    </div>
                </div>
            </div>

            {/* Warning alert if schoolDuration missing */}
            {schoolId?.length === 0 && (
                <div className="flex justify-center my-6">
                    <div 
                        style={{ transform: `scale(${scale})`, transition: 'transform 0.6s ease-in-out' }}
                        className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs uppercase tracking-wider px-6 py-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-sm"
                    >
                        <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                        <span>Please configure School Duration settings first to generate period slots</span>
                    </div>
                </div>
            )}

            {/* ── CARD 2: Periods Section (First Half) ─────────────────────────── */}
            {schoolId?.period > 0 && (
                <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
                    <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#222]">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            First Half Schedule
                        </h3>
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                            Morning sessions & subject assignments
                        </span>
                    </div>
                    
                    <div className="space-y-3">
                        {[...Array((schoolId?.period) / 2)].map((_, index) => {
                            let key = index + 1;
                            let fieldName = `subject${key}`;
                            return (
                                <div key={index} className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-slate-50/70 dark:bg-[#151515] rounded-xl border border-slate-200/70 dark:border-[#252525] hover:border-slate-300 dark:hover:border-[#333] transition-all">
                                    <div className="w-full sm:w-28 flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                                            {key}
                                        </span>
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Period {key}
                                        </span>
                                    </div>
                                    
                                    <div className="w-full sm:w-48 text-left">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg font-semibold text-xs border border-emerald-200/80 dark:border-emerald-800/50">
                                            <Clock className="w-3.5 h-3.5" />
                                            {firstHalfDuration[index] || "Timing Slot"}
                                        </span>
                                    </div>
                                    
                                    <div className="flex-1 w-full">
                                        <div className="relative">
                                            <select
                                                name={fieldName}
                                                value={formik.values[fieldName] || ""}
                                                onChange={event => formik.setFieldValue(fieldName, event.target.value)}
                                                onBlur={formik.handleBlur}
                                                className={`${selectClasses} pr-9 ${
                                                    formik.touched[fieldName] && formik.errors[fieldName]
                                                        ? "border-rose-400 ring-1 ring-rose-400"
                                                        : ""
                                                }`}
                                            >
                                                <option value="" disabled>Select Subject Allocated</option>
                                                {teacherSubjects?.listData?.map(subject => (
                                                    <option value={subject.id} key={subject.id}>{subject.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                        {formik.touched[fieldName] && formik.errors[fieldName] && <p className={errorClasses}>{formik.errors[fieldName]}</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recess Divider */}
            {schoolId?.period > 0 && (
                <div className="flex items-center justify-center my-4">
                    <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider px-5 py-2 rounded-full border border-amber-200 dark:border-amber-800/50 text-xs shadow-xs">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Recess Intermission ({schoolId?.recess_time} mins)</span>
                    </div>
                </div>
            )}

            {/* ── CARD 3: Periods Section (Second Half) ────────────────────────── */}
            {(schoolId?.period) / 2 > 0 && (
                <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
                    <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#222]">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Second Half Schedule
                        </h3>
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                            Afternoon sessions & subject assignments
                        </span>
                    </div>
                    
                    <div className="space-y-3">
                        {[...Array((schoolId?.period) / 2)].map((_, index) => {
                            let condition = (schoolId?.period) / 2 + 1;
                            let key = index + condition;
                            let fieldName = `subject${key}`;

                            return (
                                <div key={index} className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-slate-50/70 dark:bg-[#151515] rounded-xl border border-slate-200/70 dark:border-[#252525] hover:border-slate-300 dark:hover:border-[#333] transition-all">
                                    <div className="w-full sm:w-28 flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                                            {key}
                                        </span>
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Period {key}
                                        </span>
                                    </div>
                                    
                                    <div className="w-full sm:w-48 text-left">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-lg font-semibold text-xs border border-blue-200/80 dark:border-blue-800/50">
                                            <Clock className="w-3.5 h-3.5" />
                                            {secondHalfDuration[index] || "Timing Slot"}
                                        </span>
                                    </div>
                                    
                                    <div className="flex-1 w-full">
                                        <div className="relative">
                                            <select
                                                name={fieldName}
                                                value={formik.values[fieldName] || ""}
                                                onChange={event => formik.setFieldValue(fieldName, event.target.value)}
                                                onBlur={formik.handleBlur}
                                                className={`${selectClasses} pr-9 ${
                                                    formik.touched[fieldName] && formik.errors[fieldName]
                                                        ? "border-rose-400 ring-1 ring-rose-400"
                                                        : ""
                                                }`}
                                            >
                                                <option value="" disabled>Select Subject Allocated</option>
                                                {teacherSubjects?.listData?.map(subject => (
                                                    <option value={subject.id} key={subject.id}>{subject.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                        {formik.touched[fieldName] && formik.errors[fieldName] && <p className={errorClasses}>{formik.errors[fieldName]}</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </form>
    );
};

TimeTableFormComponent.propTypes = {
    onChange: PropTypes.func,
    refId: PropTypes.shape({
        current: PropTypes.any
    }),
    setDirty: PropTypes.func,
    reset: PropTypes.bool,
    setReset: PropTypes.func,
    classData: PropTypes.array,
    setClassData: PropTypes.func,
    allSubjects: PropTypes.array,
    updatedValues: PropTypes.object
};

export default TimeTableFormComponent;
