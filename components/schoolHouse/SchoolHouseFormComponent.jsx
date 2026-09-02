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

import { Box, TextField, useMediaQuery, FormControl, InputLabel, Select, MenuItem, FormHelperText, useTheme } from "@mui/material";
import { useFormik } from "formik";

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
    const theme = useTheme();
    const isNonMobile = useMediaQuery("(min-width:600px)");
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
        // cloning existing sectionObj, then updating sections according to classId before dispatching
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

    // to bring all teachers of the school
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

    // to bring students for selected class & section for captain
    useEffect(() => {
        if (formik.values.captainClassId && formik.values.captainSectionId) {
            getStudents(formik.values.captainClassId, formik.values.captainSectionId, setAllStudents, API);
        }
    }, [formik.values.captainClassId, formik.values.captainSectionId]);

    useEffect(() => {
        getAndSetSections(formik.values.captainClassId);
    }, [formik.values.captainClassId, classData?.length]);


    // to bring students for selected class & section for viceCaptain
    useEffect(() => {
        if (formik.values.viceCaptainClassId && formik.values.viceCaptainSectionId) {
            getStudents(formik.values.viceCaptainClassId, formik.values.viceCaptainSectionId, setStudents, API);
        }
    }, [formik.values.viceCaptainClassId, formik.values.viceCaptainSectionId]);

    useEffect(() => {
        getAndSetSections(formik.values.viceCaptainClassId);
    }, [formik.values.viceCaptainClassId, classData?.length]);

    return (
        <Box m="20px">
            <form ref={refId}>
                <Box
                    display="grid"
                    gap="30px"
                    gridTemplateColumns="repeat(3, minmax(0, 1fr))"
                    sx={{
                        "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                        marginBottom: '40px'
                    }}
                >
                    <TextField
                        variant="filled"
                        type="text"
                        name="name"
                        label="Name*"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.name}
                        error={!!formik.touched.name && !!formik.errors.name}
                        helperText={formik.touched.name && formik.errors.name}
                    />
                    <TextField
                        variant="filled"
                        type="text"
                        name="color_code"
                        label="Color Code"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.color_code}
                        error={!!formik.touched.color_code && !!formik.errors.color_code}
                        helperText={formik.touched.color_code && formik.errors.color_code}
                    />
                    <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        name="strength"
                        label="Strength"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.strength}
                        error={!!formik.touched.strength && !!formik.errors.strength}
                        helperText={formik.touched.strength && formik.errors.strength}
                    />
                    <FormControl variant="filled" sx={{ minWidth: 120 }}
                        error={!!formik.touched.status && !!formik.errors.status}
                    >
                        <InputLabel id="statusField">Status</InputLabel>
                        <Select
                            variant="filled"
                            name="status"
                            value={formik.values.status}
                            onChange={formik.handleChange}
                        >
                            {Object.keys(config.status).map(item => (
                                <MenuItem key={item} value={item}>
                                    {config.status[item]}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>{formik.touched.status && formik.errors.status}</FormHelperText>
                    </FormControl>

                    <FormControl variant="filled" sx={{ minWidth: 120 }}
                        error={!!formik.touched.teacher_incharge && !!formik.errors.teacher_incharge}
                    >
                        <InputLabel id="teacherInchargeField">Teacher Incharge Name</InputLabel>
                        <Select
                            labelId="teacherInchargeField"
                            name="teacher_incharge"
                            value={formik.values.teacher_incharge || ''}
                            onChange={event => formik.setFieldValue("teacher_incharge", event.target.value)}
                        >
                            {!allTeachers?.listData?.rows?.length ? null :
                                allTeachers.listData.rows.map(item => (
                                    <MenuItem value={item.id} name={`${item.teacherName}`} key={item.id}>
                                        {`${item.teacherName}`}
                                    </MenuItem>
                                ))}
                        </Select>
                        <FormHelperText>{formik.touched.teacher_incharge && formik.errors.teacher_incharge}</FormHelperText>
                    </FormControl>
                </Box>

                <fieldset style={{
                    border: theme.palette.mode === 'light' ? "2px solid rgb(0 165 201)" : "2px solid #BADFE7",
                    borderRadius: "10px",
                    padding: "10px",
                    margin: "20px 0px 20px 0px"
                }}>
                    <legend style={{
                        color: theme.palette.mode === 'light' ? "rgb(0 165 201)" : "#BADFE7",
                        fontWeight: "bold",
                        padding: "5px",
                        fontSize: "larger"
                    }}>
                        Captain
                    </legend>
                    <Box
                        display='grid'
                        gap="30px"
                        gridTemplateColumns="repeat(3, minmax(0, 1fr))"
                    >
                        <FormControl variant="filled" sx={{ minWidth: 120 }}
                            error={!!formik.touched.captainClassId && !!formik.errors.captainClassId}
                        >
                            <InputLabel>Class</InputLabel>
                            <Select
                                variant="filled"
                                name="captainClassId"
                                value={formik.values.captainClassId}
                                onChange={event => {
                                    formik.setFieldValue("captainClassId", event.target.value);
                                    if (formik.values.captainSectionId) {            //if old values are, clean them according to change
                                        formik.setFieldValue("captainSectionId", '');
                                    }
                                    if (formik.values.captain) {
                                        formik.setFieldValue("captain", '');
                                    }
                                }}
                            >
                                {!schoolClasses?.listData?.length ? null :
                                    schoolClasses.listData.map(cls => (
                                        <MenuItem value={cls.class_id} name={cls.class_name} key={cls.class_name}>
                                            {cls.class_name}
                                        </MenuItem>
                                    ))}
                            </Select>
                            <FormHelperText>{formik.touched.captainClassId && formik.errors.captainClassId}</FormHelperText>
                        </FormControl>
                        <FormControl variant="filled" sx={{ minWidth: 120 }}
                            error={!!formik.touched.captainSectionId && !!formik.errors.captainSectionId}
                        >
                            <InputLabel>Section</InputLabel>
                            <Select
                                variant="filled"
                                name="captainSectionId"
                                value={formik.values.captainSectionId}
                                onChange={event => {
                                    formik.setFieldValue("captainSectionId", event.target.value);
                                    if (formik.values.captain) {
                                        formik.setFieldValue("captain", '');
                                    }
                                }}
                            >
                                {!schoolSections?.listData[formik.values.captainClassId]?.length ? null :
                                    schoolSections.listData[formik.values.captainClassId].map(section => (
                                        <MenuItem value={section.section_id} name={section.section_name} key={section.section_id}>
                                            {section.section_name}
                                        </MenuItem>
                                    ))}
                            </Select>
                            <FormHelperText>{formik.touched.captainSectionId && formik.errors.captainSectionId}</FormHelperText>
                        </FormControl>
                        <FormControl variant="filled" sx={{ minWidth: 220 }}
                            error={!!formik.touched.captain && !!formik.errors.captain}
                        >
                            <InputLabel>Name</InputLabel>
                            <Select
                                variant="filled"
                                name="captain"
                                value={formik.values.captain}
                                onChange={event => formik.setFieldValue("captain", event.target.value)}
                            >
                                {!allStudents?.listData?.rows?.length ? null :
                                    allStudents.listData.rows.map(item => (
                                        <MenuItem value={item.id} name={`${item.firstname} ${item.lastname}`} key={item.id}>
                                            {`${item.firstname.charAt(0).toUpperCase() + item.firstname.slice(1)} ${item.lastname.charAt(0).toUpperCase() + item.lastname.slice(1)}`}
                                        </MenuItem>
                                    ))}
                            </Select>
                            <FormHelperText>{formik.touched.captain && formik.errors.captain}</FormHelperText>
                        </FormControl>
                    </Box>
                </fieldset>

                <fieldset style={{
                    border: theme.palette.mode === 'light' ? "2px solid rgb(0 165 201)" : "2px solid #BADFE7",
                    borderRadius: "10px",
                    padding: "10px",
                    margin: "10px 0px 10px 0px"
                }}>
                    <legend style={{
                        color: theme.palette.mode === 'light' ? "rgb(0 165 201)" : "#BADFE7",
                        fontWeight: "bold",
                        padding: "5px",
                        fontSize: "larger"
                    }}>
                        Vice Captain
                    </legend>
                    <Box
                        display='grid'
                        gap="30px"
                        gridTemplateColumns="repeat(3, minmax(0, 1fr))"
                    >
                        <FormControl variant="filled" sx={{ minWidth: 120 }}
                            error={!!formik.touched.viceCaptainClassId && !!formik.errors.viceCaptainClassId}
                        >
                            <InputLabel>Class</InputLabel>
                            <Select
                                variant="filled"
                                name="viceCaptainClassId"
                                value={formik.values.viceCaptainClassId}
                                onChange={event => {
                                    formik.setFieldValue("viceCaptainClassId", event.target.value);
                                    if (formik.values.viceCaptainSectionId) {       // If old values are, clean them according to change
                                        formik.setFieldValue("viceCaptainSectionId", '');
                                    }
                                    if (formik.values.vice_captain) {
                                        formik.setFieldValue("vice_captain", '');
                                    }
                                }}
                            >
                                {!schoolClasses?.listData?.length ? null :
                                    schoolClasses.listData.map(cls => (
                                        <MenuItem value={cls.class_id} name={cls.class_name} key={cls.class_name}>
                                            {cls.class_name}
                                        </MenuItem>
                                    ))}
                            </Select>
                            <FormHelperText>{formik.touched.viceCaptainClassId && formik.errors.viceCaptainClassId}</FormHelperText>
                        </FormControl>
                        <FormControl variant="filled" sx={{ minWidth: 120 }}
                            error={!!formik.touched.viceCaptainSectionId && !!formik.errors.viceCaptainSectionId}
                        >
                            <InputLabel>Section</InputLabel>
                            <Select
                                variant="filled"
                                name="viceCaptainSectionId"
                                value={formik.values.viceCaptainSectionId}
                                onChange={event => {
                                    formik.setFieldValue("viceCaptainSectionId", event.target.value);
                                    if (formik.values.vice_captain) {
                                        formik.setFieldValue("vice_captain", '');
                                    }
                                }}
                            >
                                {!schoolSections?.listData[formik.values.viceCaptainClassId]?.length ? null :
                                    schoolSections.listData[formik.values.viceCaptainClassId].map(section => (
                                        <MenuItem value={section.section_id} name={section.section_name} key={section.section_id}>
                                            {section.section_name}
                                        </MenuItem>
                                    ))}
                            </Select>
                            <FormHelperText>{formik.touched.viceCaptainSectionId && formik.errors.viceCaptainSectionId}</FormHelperText>
                        </FormControl>
                        <FormControl variant="filled" sx={{ minWidth: 220 }}
                            error={!!formik.touched.vice_captain && !!formik.errors.vice_captain}
                        >
                            <InputLabel>Name</InputLabel>
                            <Select
                                variant="filled"
                                name="vice_captain"
                                value={formik.values.vice_captain}
                                onChange={event => formik.setFieldValue("vice_captain", event.target.value)}
                            >
                                {!allFormStudents?.listData?.rows?.length ? null :
                                    allFormStudents.listData.rows.map(item => (
                                        <MenuItem value={item.id} name={`${item.firstname} ${item.lastname}`} key={item.id}>
                                            {`${item.firstname.charAt(0).toUpperCase() + item.firstname.slice(1)} ${item.lastname.charAt(0).toUpperCase() + item.lastname.slice(1)}`}
                                        </MenuItem>
                                    ))}
                            </Select>
                            <FormHelperText>{formik.touched.vice_captain && formik.errors.vice_captain}</FormHelperText>
                        </FormControl>
                    </Box>
                </fieldset>
            </form>
        </Box>
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
