/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useCallback, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "@/lib/routerAdapter";
import { useDispatch, useSelector } from "react-redux";

import { Box, Button, Typography, useTheme } from "@mui/material";

import API from "../../apis";
import Loader from "../common/Loader";
import Toast from "../common/Toast";
import MarksheetFormComponent from "./MarksheetFormComponent";

import { setMenuItem } from "../../redux/actions/NavigationAction";
import { tokens, themeSettings } from "../../theme";
import { Utility } from "../utility";

import formBg from "../assets/formBg.png";

const FormComponent = () => {
    const [title, setTitle] = useState("Create");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        marksheetData: { values: null, validated: false }
    });
    const [updatedValues, setUpdatedValues] = useState(null);
    const [dirty, setDirty] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [reset, setReset] = useState(false);

    const { marksheetClassData } = useSelector(state => state.allMarksheets);
    const selected = useSelector((state) => state.menuItems.selected);
    const toastInfo = useSelector((state) => state.toastInfo);
    const marksheetFormRef = useRef();

    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const userParams = useParams();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { typography } = themeSettings(theme.palette.mode);
    const { state } = useLocation();
    const { toastAndNavigate, getLocalStorage } = Utility();

    let student_id = state?.student_id || userParams?.student_id;
    let term = state?.term;
    let marksheet_id = state?.id;



    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        dispatch(setMenuItem(selectedMenu.selected));
    }, []);

    // const updateMarksheet = useCallback(formData => {
    //     let promises = [];
    //     setLoading(true);
    //     let payload = {
    //         session: formData.marksheetData.values.session,
    //         student_id: formData.marksheetData.values.student,
    //         class_id: marksheetClassData.classDataObj.class_id,
    //         section_id: marksheetClassData.classDataObj.section_id,
    //         term: formData.marksheetData.values.term
    //     };

    //     promises = formData.marksheetData.values.subjects.map((subjectId, index) => {
    //         payload = {
    //             ...payload,
    //             subject_id: subjectId,
    //             id: formData.marksheetData.values[`dbId_${index}`],
    //             marks_obtained: formData.marksheetData.values[`marks_obtained_${index}`],
    //             total_marks: formData.marksheetData.values[`total_marks_${index}`],
    //             grade: formData.marksheetData.values[`grade_${index}`],
    //             remark: formData.marksheetData.values[`remark_${index}`],
    //             result: formData.marksheetData.values[`result_${index}`]
    //         }
    //         API.MarksheetAPI.updateMarksheet(payload);
    //     });

    //     return Promise.all(promises)
    //         .then(() => {
    //             setLoading(false);
    //             toastAndNavigate(dispatch, true, "info", "Successfully Updated", navigateTo, '/marksheet/listing');
    //         })
    //         .catch(err => {
    //             setLoading(false);
    //             toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
    //             console.log("error updating marksheet", err);
    //         });
    // }, [formData]);

    const populateMarksheetData = useCallback((student_id, term, marksheet_id) => {
        setLoading(true);
        const path = [`/get-marksheet/?page=0&size=10&student=${student_id}&term=${term}`, `/get-marksheet-data/${marksheet_id}`];

        API.CommonAPI.multipleAPICall("GET", path)
            .then(response => {
                if (response[0].data.status === 'Success') {
                    const dataObj = {
                        marksheetData: response[0].data.data.rows,
                        marksheetMappingData: response[1].data.data
                    };
                    setUpdatedValues(dataObj);
                    setLoading(false);
                }
            })
            .catch((err) => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
                throw err;
            });
    }, [student_id, term, marksheet_id]);

    const handleMarksheet = useCallback((formData, studentId) => {
        let promise;
        setLoading(true);
        let payload = {
            session: formData.marksheetData.values.session,
            student_id: formData.marksheetData.values.student,
            class_id: marksheetClassData.classDataObj.class_id,
            section_id: marksheetClassData.classDataObj.section_id,
            term: formData.marksheetData.values.term,
            result: formData.marksheetData.values.result
        };
        if (!studentId) {
            // Create a new marksheet record if studentId is not provided
            promise = API.MarksheetAPI.createMarksheet(payload);
        } else {
            payload = {
                ...payload,
                id: marksheet_id
            }
            // Update an existing marksheet record if studentId is provided
            promise = API.MarksheetAPI.updateMarksheet(payload);
        }

        promise
            .then(async marksheet => {
                // Deletes all the records on update from mapping table and insert new records
                if (studentId) {
                    await API.MarksheetAPI.deleteFromMappingTable({ marksheet_id: marksheet_id });
                }
                formData.marksheetData.values.subjects.map((subjectId, index) => {
                    let payload2 = {
                        marksheet_id: !studentId ? marksheet.data.data.id : marksheet_id,
                        subject_id: subjectId,
                        marks_obtained: formData.marksheetData.values[`marks_obtained_${index}`],
                        total_marks: formData.marksheetData.values[`total_marks_${index}`],
                        grade: formData.marksheetData.values[`grade_${index}`],
                        remark: formData.marksheetData.values[`remark_${index}`],
                        result: formData.marksheetData.values[`result_${index}`]
                    }
                    // if update it runs create after delete mapping table and if create it do not run any delete and create into mapping table 
                    API.MarksheetAPI.insertIntoMappingTable(payload2)
                        .then(() => {
                            setLoading(false);
                            toastAndNavigate(dispatch, true, !studentId ? "success" : "info", !studentId ? "Successfully Created" : "Successfully Updated", navigateTo, '/marksheet/listing');
                        })
                        .catch(err => {
                            setLoading(false);
                            toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
                        });
                })
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
            });
    }, [formData]);

    //Create/Update/Populate marksheet
    useEffect(() => {
        if (student_id && !submitted) {
            setTitle("Update");
            populateMarksheetData(student_id, term, marksheet_id);
        }
        if (formData.marksheetData.validated) {
            handleMarksheet(formData, student_id)
        } else {
            setSubmitted(false);
        }
    }, [submitted, student_id, term]);

    const handleSubmit = async () => {
        await marksheetFormRef.current.Submit();
        setSubmitted(true);
    };

    const handleFormChange = (data, form) => {
        form === "marksheet" ? setFormData({ ...formData, marksheetData: data }) : null;
    };

    return (
        <Box m="10px"
            sx={{
                backgroundImage: theme.palette.mode == "light" ? `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${formBg})`
                    : `linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.9)), url(${formBg})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "start",
                backgroundSize: "cover",
                backgroundAttachment: "fixed"
            }}
        >
            <Typography
                fontFamily={typography.fontFamily}
                fontSize={typography.h2.fontSize}
                color={colors.grey[100]}
                fontWeight="bold"
                display="inline-block"
                marginLeft="20px"
            >
                {`${title} ${selected}`}
            </Typography>
            <MarksheetFormComponent
                onChange={(data) => {
                    handleFormChange(data, "marksheet");
                }}
                refId={marksheetFormRef}
                setDirty={setDirty}
                reset={reset}
                setReset={setReset}
                updatedValues={updatedValues}
            />
            <Box display="flex" justifyContent="end" m="20px 20px 70px 0" >
                {title === "Update" ? null : (
                    <Button type="reset" color="warning" variant="contained" sx={{ mr: 3 }} disabled={!dirty || submitted}
                        onClick={() => {
                            if (window.confirm("Do You Really Want To Reset?")) {
                                setReset(true);
                            }
                        }}
                    >
                        Reset
                    </Button>
                )}
                <Button color="error" variant="contained" sx={{ mr: 3 }}
                    onClick={() => navigateTo(`/marksheet/listing`)}
                >
                    Cancel
                </Button>
                <Button variant="contained" type="submit"
                    onClick={() => handleSubmit()} disabled={!dirty}
                    color={title === "Update" ? "info" : "success"}
                >
                    Submit
                </Button>
                <Toast
                    alerting={toastInfo.toastAlert}
                    severity={toastInfo.toastSeverity}
                    message={toastInfo.toastMessage}
                />
            </Box>
            {loading === true ? <Loader /> : null}
        </Box>
    );
};

export default FormComponent;
