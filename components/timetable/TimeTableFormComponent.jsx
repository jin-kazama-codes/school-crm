/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { useFormik } from "formik";

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
                validated: formik.isSubmitting
                    ? Object.keys(formik.errors).length === 0
                    : false
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
                                setSchoolId(seniorRow || [])
                            } else {
                                setSchoolId(juniorRow || [])
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
                
                {/* Configuration Section */}
                <div className="p-6 mb-8 border-2 border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl">
                    <h3 className="text-xl font-bold text-indigo-800 dark:text-indigo-300 mb-6">Timetable Configuration</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className={labelClass}>Class</label>
                            <select
                                name="class"
                                value={formik.values.class}
                                onChange={event => {
                                    formik.setFieldValue("class", event.target.value);
                                    if (formik.values.section) formik.setFieldValue("section", '');
                                    if (formik.values.subject) formik.setFieldValue("subject", []);
                                }}
                                className={inputClass("class")}
                            >
                                <option value="" disabled>Select Class</option>
                                {teacherClasses?.listData?.map(cls => (
                                    <option value={cls.class_id} key={cls.class_id}>{cls.class_name}</option>
                                ))}
                            </select>
                            {formik.touched.class && formik.errors.class && <p className={errorClass}>{formik.errors.class}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Section</label>
                            <select
                                name="section"
                                value={formik.values.section}
                                onChange={event => {
                                    formik.setFieldValue("section", event.target.value);
                                    if (formik.values.subject) formik.setFieldValue("subject", '');
                                }}
                                className={inputClass("section")}
                            >
                                <option value="" disabled>Select Section</option>
                                {teacherSections?.listData?.map(section => (
                                    <option value={section.section_id} key={section.section_id}>{section.section_name}</option>
                                ))}
                            </select>
                            {formik.touched.section && formik.errors.section && <p className={errorClass}>{formik.errors.section}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Day</label>
                            <select
                                name="day"
                                value={formik.values.day}
                                onChange={formik.handleChange}
                                className={inputClass("day")}
                            >
                                <option value="" disabled>Select Day</option>
                                {Object.keys(config.day).map(item => (
                                    <option key={item} value={item}>{config.day[item]}</option>
                                ))}
                            </select>
                            {formik.touched.day && formik.errors.day && <p className={errorClass}>{formik.errors.day}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Batch</label>
                            <select
                                name="batch"
                                value={formik.values.batch || ''}
                                onChange={event => formik.setFieldValue("batch", event.target.value)}
                                className={inputClass("batch")}
                            >
                                <option value="" disabled>Select Batch</option>
                                {schoolDuration?.listData?.rows?.map(item => (
                                    <option value={item.batch} key={item.id}>{item.batch}</option>
                                ))}
                            </select>
                            {formik.touched.batch && formik.errors.batch && <p className={errorClass}>{formik.errors.batch}</p>}
                        </div>
                    </div>
                </div>

                {/* Warning message if schoolDuration missing */}
                {schoolId?.length === 0 && (
                    <div className="flex justify-center mb-8 overflow-hidden py-4">
                        <div 
                            style={{ transform: `scale(${scale})`, transition: 'transform 0.6s ease-in-out' }}
                            className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold uppercase tracking-widest px-8 py-4 rounded-xl border-2 border-red-200 dark:border-red-800 shadow-sm"
                        >
                            CREATE A SCHOOL DURATION FIRST
                        </div>
                    </div>
                )}

                {/* Periods Section (First Half) */}
                {schoolId?.period > 0 && (
                    <div className="mb-8">
                        <div className="bg-white/50 dark:bg-[#1a1a1a]/50 backdrop-blur rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-3">
                                <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                                First Half
                                <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                            </h3>
                            
                            <div className="space-y-4">
                                {[...Array((schoolId?.period) / 2)].map((_, index) => {
                                    let key = index + 1;
                                    let fieldName = `subject${key}`;
                                    return (
                                        <div key={index} className="flex flex-col md:flex-row items-center gap-4 md:gap-8 p-4 bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex-1 text-center md:text-left">
                                                <span className="text-lg font-bold text-slate-700 dark:text-slate-300">Period {key}</span>
                                            </div>
                                            
                                            <div className="flex-1 text-center">
                                                <span className="inline-flex px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-lg font-semibold text-sm border border-blue-200 dark:border-blue-500/30">
                                                    {firstHalfDuration[index]}
                                                </span>
                                            </div>
                                            
                                            <div className="flex-[2] w-full">
                                                <select
                                                    name={fieldName}
                                                    value={formik.values[fieldName] || ""}
                                                    onChange={event => formik.setFieldValue(fieldName, event.target.value)}
                                                    className={inputClass(fieldName)}
                                                >
                                                    <option value="" disabled>Select Subject</option>
                                                    {teacherSubjects?.listData?.map(subject => (
                                                        <option value={subject.id} key={subject.id}>{subject.name}</option>
                                                    ))}
                                                </select>
                                                {formik.touched[fieldName] && formik.errors[fieldName] && <p className={errorClass}>{formik.errors[fieldName]}</p>}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Recess Divider */}
                {schoolId?.period > 0 && (
                    <div className="flex items-center gap-4 my-8">
                        <div className="h-px bg-amber-200 dark:bg-amber-900/50 flex-1"></div>
                        <div className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold uppercase tracking-widest px-6 py-2.5 rounded-full border border-amber-200 dark:border-amber-500/30 text-sm shadow-sm">
                            Recess Time {schoolId?.recess_time} min
                        </div>
                        <div className="h-px bg-amber-200 dark:bg-amber-900/50 flex-1"></div>
                    </div>
                )}

                {/* Periods Section (Second Half) */}
                {(schoolId?.period) / 2 > 0 && (
                    <div className="mb-8">
                        <div className="bg-white/50 dark:bg-[#1a1a1a]/50 backdrop-blur rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-3">
                                <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                                Second Half
                                <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                            </h3>
                            
                            <div className="space-y-4">
                                {[...Array((schoolId?.period) / 2)].map((_, index) => {
                                    let condition = (schoolId?.period) / 2 + 1;
                                    let key = index + condition;
                                    let fieldName = `subject${key}`;

                                    return (
                                        <div key={index} className="flex flex-col md:flex-row items-center gap-4 md:gap-8 p-4 bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex-1 text-center md:text-left">
                                                <span className="text-lg font-bold text-slate-700 dark:text-slate-300">Period {key}</span>
                                            </div>
                                            
                                            <div className="flex-1 text-center">
                                                <span className="inline-flex px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-lg font-semibold text-sm border border-indigo-200 dark:border-indigo-500/30">
                                                    {secondHalfDuration[index]}
                                                </span>
                                            </div>
                                            
                                            <div className="flex-[2] w-full">
                                                <select
                                                    name={fieldName}
                                                    value={formik.values[fieldName] || ""}
                                                    onChange={event => formik.setFieldValue(fieldName, event.target.value)}
                                                    className={inputClass(fieldName)}
                                                >
                                                    <option value="" disabled>Select Subject</option>
                                                    {teacherSubjects?.listData?.map(subject => (
                                                        <option value={subject.id} key={subject.id}>{subject.name}</option>
                                                    ))}
                                                </select>
                                                {formik.touched[fieldName] && formik.errors[fieldName] && <p className={errorClass}>{formik.errors[fieldName]}</p>}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
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
