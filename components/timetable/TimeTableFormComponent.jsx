/* eslint-disable react-hooks/exhaustive-deps */
// /**
//  * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
//  *
//  * This software is the confidential information of School CRM Inc., and is licensed as
//  * restricted rights software. The use,reproduction, or disclosure of this software is subject to
//  * restrictions set forth in your license agreement with School CRM.
// */

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { Box, useMediaQuery, FormControl, InputLabel, Select, MenuItem, FormHelperText, Divider, Chip } from "@mui/material";
import { useFormik } from "formik";

import API from "../../apis";
import config from "../config";
import TimeTableValidation from "./Validation";

import { setSchoolClasses } from "../../redux/actions/ClassAction";
import { setTeacherClasses } from "../../redux/actions/ClassAction";

import { setSchoolSections } from "../../redux/actions/SectionAction";
import { setTeacherSections } from "../../redux/actions/SectionAction";

import { setSchoolSubjects } from "../../redux/actions/SubjectAction";
import { setTeacherSubjects } from "../../redux/actions/SubjectAction";

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
    const schoolClasses = useSelector(state => state.schoolClasses);
    const teacherClasses = useSelector(state => state.teacherClasses);

    const schoolSections = useSelector(state => state.schoolSections);
    const teacherSections = useSelector(state => state.teacherSections);


    const teacherSubjects = useSelector(state => state.teacherSubjects);
    const schoolDuration = useSelector(state => state.allSchoolDurations);

    const dispatch = useDispatch();
    const isNonMobile = useMediaQuery("(min-width:600px)");
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
        const [hours, minutes] = timeString.split(':');

        // Check if hours and minutes are valid numbers
        if (isNaN(hours) || isNaN(minutes)) {
            return "Invalid time format";
        }

        const parsedHours = parseInt(hours, 10);
        const parsedMinutes = parseInt(minutes, 10);

        // Check if hours and minutes are within valid range
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
        startTime.setHours(hours, minutes, 0); // set hours, minutes and seconds

        for (let i = 0; i < condition; i++) {
            let slotFrom = `${startTime.getHours()}:${startTime.getMinutes() == 0 ? '00' : startTime.getMinutes()}`;
            startTime.setMinutes(startTime.getMinutes() + half_duration);
            let slotTo = `${startTime.getHours()}:${startTime.getMinutes() == 0 ? '00' : startTime.getMinutes()}`;
            timeslots.push(`${convertToAMPM(slotFrom)}-${convertToAMPM(slotTo)}`);
        }
        return timeslots;
    };

    const firstHalfDuration = schoolPeriodDuration(openingTime.slice(0, 2).replace(':', '').padStart(2, '0'), openingTime.slice(2, 5).replace(':', ''), schoolId?.period / schoolId?.halves, schoolId?.first_half_period_duration);
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
            // Filter classData to get objects matching the selected class and section
            const sectionSubjects = classData.filter(obj => obj.class_id === formik.values.class && obj.section_id === formik.values.section);
            
            // Collect all subject_ids and split them into individual IDs
            let allSubjectIds = [];
            sectionSubjects.forEach(subject => {
                if (subject.subject_ids) {
                    allSubjectIds = allSubjectIds.concat(subject.subject_ids.split(','));
                }
            });
    
            // Remove duplicate subject IDs
            const uniqueSubjectIds = [...new Set(allSubjectIds)];
    
            // Convert the array of unique subject IDs back to a comma-separated string
            const uniqueSubjectIdsString = uniqueSubjectIds.join(',');
    
            // Pass the unique subject IDs string to findMultipleById
            const selectedSubjects = uniqueSubjectIds.length ? findMultipleById(uniqueSubjectIdsString, allSubjects) : [];
    
            // Dispatch the selected subjects
            dispatch(setTeacherSubjects(selectedSubjects));
        }
    }, [formik.values?.class, formik.values?.section, classData.length, allSubjects]);
        
    console.log("classDaata>>", classData);


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
                            setSchoolId(schoolObj[0]);
                        } else if (schoolObj?.length > 0) {

                            const seniorRow = schoolObj.find(obj => obj.batch === "senior");
                            const juniorRow = schoolObj.find(obj => obj.batch === "junior");

                            if (formik.values.batch == "senior") {
                                setSchoolId(seniorRow)
                            } else {
                                setSchoolId(juniorRow)
                            }
                        }

                    } else if (result.status === 'Error') {
                        console.log('Error Decrypting Data');
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
        const interval = 400; // Interval between scale changes

        const intervalId = setInterval(() => {
            setScale((prevScale) => (prevScale === 1 ? 1.2 : 1));
            count += 1;
            if (count >= maxCount) {
                clearInterval(intervalId);
                setScale(1); // Reset scale to 1 at the end
            }
        }, interval);

        // Cleanup function to clear the interval if the component unmounts
        return () => clearInterval(intervalId);
    }, []);

    console.log("schoolId", schoolId);

    return (
        <Box m="20px">
            <form ref={refId}>
                <Box
                    display="grid"
                    gap="30px"
                    gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                    sx={{
                        "& > div": { gridColumn: isNonMobile ? undefined : "span 4" }, marginBottom: "50px"
                    }}
                >
                    <FormControl variant="filled" sx={{ minWidth: 120 }}
                        error={!!formik.touched.class && !!formik.errors.class}
                    >
                        <InputLabel id="classField">Class</InputLabel>
                        <Select
                            variant="filled"
                            labelId="classField"
                            name="class"
                            value={formik.values.class}
                            onChange={event => {
                                formik.setFieldValue("class", event.target.value);
                                if (formik.values.section) {        //if old values are there, clean them according to change
                                    formik.setFieldValue("section", '');
                                }
                                if (formik.values.subject) {
                                    formik.setFieldValue("subject", []);
                                }
                            }}
                        >
                            {!teacherClasses?.listData?.length ? null :
                                teacherClasses.listData.map(cls => (
                                    <MenuItem value={cls.class_id} name={cls.class_name} key={cls.class_id}>
                                        {cls.class_name}
                                    </MenuItem>
                                ))}
                        </Select>
                        <FormHelperText>{formik.touched.class && formik.errors.class}</FormHelperText>
                    </FormControl>

                    <FormControl variant="filled" sx={{ minWidth: 120 }}
                        error={!!formik.touched.section && !!formik.errors.section}
                    >
                        <InputLabel id="sectionField">Section</InputLabel>
                        <Select
                            variant="filled"
                            labelId="sectionField"
                            name="section"
                            value={formik.values.section}
                            onChange={event => {
                                formik.setFieldValue("section", event.target.value);
                                if (formik.values.subject) {
                                    formik.setFieldValue("subject", '');
                                }
                            }}
                        >
                            {!teacherSections?.listData?.length ? null :
                                teacherSections.listData.map(section => (
                                    <MenuItem value={section.section_id} name={section.section_name} key={section.section_id}>
                                        {section.section_name}
                                    </MenuItem>
                                ))}
                        </Select>
                        <FormHelperText>{formik.touched.section && formik.errors.section}</FormHelperText>
                    </FormControl>

                    <FormControl variant="filled" sx={{ minWidth: 120 }}
                        error={!!formik.touched.day && !!formik.errors.day}
                    >
                        <InputLabel id="dayField">Day</InputLabel>
                        <Select
                            variant="filled"
                            name="day"
                            value={formik.values.day}
                            onChange={formik.handleChange}
                        >
                            {Object.keys(config.day).map(item => (
                                <MenuItem key={item} value={item}>
                                    {config.day[item]}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>{formik.touched.day && formik.errors.day}</FormHelperText>
                    </FormControl>

                    <FormControl variant="filled" sx={{ minWidth: 120 }}
                        error={!!formik.touched.batch && !!formik.errors.batch}
                    >
                        <InputLabel>Batch</InputLabel>
                        <Select
                            name="batch"
                            value={formik.values.batch || ''}
                            onChange={event => formik.setFieldValue("batch", event.target.value)}
                        >
                            {!schoolDuration?.listData?.rows ? null :
                                schoolDuration?.listData?.rows?.map(item => (
                                    <MenuItem value={item.batch} name={item.batch} key={item.id}>
                                        {item.batch}
                                    </MenuItem>
                                ))}
                        </Select>
                        <FormHelperText>{formik.touched.batch && formik.errors.batch}</FormHelperText>
                    </FormControl>

                </Box>

                {schoolId?.period > 0 && (
                    <>
                        {[...Array((schoolId?.period) / 2)].map((_, index) => {
                            let key = index + 1;
                            return (
                                <Box key={index} style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', margin: '0px 100px 20px 100px ', justifyItems: "center", alignItems: "center" }}>
                                    <Box sx={{ fontWeight: "600", fontSize: "20px" }}>Period {key}</Box>

                                    <Box sx={{ fontWeight: "500", fontSize: "15px" }}>{firstHalfDuration[index]}</Box>

                                    <FormControl variant="filled" sx={{ minWidth: 120 }}
                                        error={!!formik.touched[`subject${key}`] && !!formik.errors[`subject${key}`]}
                                    >
                                        <InputLabel id="subjectField">Subject</InputLabel>
                                        <Select
                                            sx={{ minWidth: "280px" }}
                                            variant="filled"
                                            name={`subject${key}`}
                                            value={formik.values[`subject${index + 1}`] || null}
                                            onChange={event => formik.setFieldValue(`subject${index + 1}`, event.target.value)}
                                        >
                                            {!teacherSubjects?.listData?.length ? null :
                                                teacherSubjects.listData.map(subject => (
                                                    <MenuItem value={subject.id} name={subject.name} key={subject.id}>
                                                        {subject.name}
                                                    </MenuItem>
                                                ))}
                                        </Select>
                                        <FormHelperText>{formik.touched[`subject${key}`] && formik.errors[`subject${key}`]} </FormHelperText>
                                    </FormControl>
                                </Box>
                            )
                        }
                        )}

                    </>
                )}

                {schoolId && <Divider sx={{ width: '99%', marginBottom: "20px" }}>
                    <Chip color='info' label={`Recess Time ${schoolId?.recess_time} min`}
                        sx={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.2em', padding: '12px' }}
                    />
                </Divider>}
                {schoolId?.length === 0 &&
                    <Divider sx={{ width: '99%', marginBottom: "20px" }}>
                        <Chip
                            color='error' label={`CREATE A SCHOOL DURATION FIRST`}
                            maxWidth={false}
                            sx={{
                                fontSize: '13px', fontWeight: '600', letterSpacing: '0.2em', padding: '12px', width: "800px",
                                transform: `scale(${scale})`,
                                transition: 'transform 0.6s ease-in-out'
                            }}
                        />
                    </Divider>
                }
                {(schoolId?.period) / 2 > 0 && (
                    <>
                        {[...Array((schoolId?.period) / 2)].map((_, index) => {
                            let condition = (schoolId?.period) / 2 + 1;

                            return (
                                <Box key={index} sx={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', margin: '0px 100px 20px 100px ', justifyItems: "center", alignItems: "center" }}>
                                    <Box sx={{ fontWeight: "600", fontSize: "20px" }}>Period {index + condition}</Box>

                                    <Box sx={{ fontWeight: "500", fontSize: "15px" }}>{secondHalfDuration[index]}</Box>

                                    <FormControl variant="filled" sx={{ minWidth: 120 }}
                                        error={!!formik.touched[`subject${index + condition}`] && !!formik.errors[`subject${index + condition}`]}
                                    >
                                        <InputLabel id="subjectField">Subject</InputLabel>
                                        <Select
                                            sx={{ minWidth: "280px" }}
                                            variant="filled"
                                            name={`subject${index + condition}`}
                                            value={formik.values[`subject${index + condition}`] || null}
                                            onChange={event => formik.setFieldValue(`subject${index + condition}`, event.target.value)}
                                        >
                                            {!teacherSubjects?.listData?.length ? null :
                                                teacherSubjects.listData.map(subject => (
                                                    <MenuItem value={subject.id} name={subject.name} key={subject.id}>
                                                        {subject.name}
                                                    </MenuItem>
                                                ))}
                                        </Select>
                                        <FormHelperText>{formik.touched[`subject${index + condition}`] && formik.errors[`subject${index + condition}`]} </FormHelperText>
                                    </FormControl>
                                </Box>
                            )
                        }
                        )}
                    </>
                )}


            </form >
        </Box >
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
