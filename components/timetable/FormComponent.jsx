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
import TimeTableFormComponent from "./TimeTableFormComponent";

import { setAllSubjects } from "../../redux/actions/SubjectAction";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { tokens, themeSettings } from "../../theme";
import { Utility } from "../utility";

import formBg from "../assets/formBg.png";

const FormComponent = () => {
    const [title, setTitle] = useState("Create");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        timeTableData: { values: null, validated: false }
    });
    const [updatedValues, setUpdatedValues] = useState(null);
    const [dirty, setDirty] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [reset, setReset] = useState(false);
    const [classData, setClassData] = useState([]);

    const allSubjects = useSelector(state => state.allSubjects);
    const selected = useSelector(state => state.menuItems.selected);
    const toastInfo = useSelector(state => state.toastInfo);
    
    const timeTableFormRef = useRef();

    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const userParams = useParams();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { typography } = themeSettings(theme.palette.mode);
    const { state } = useLocation();
    const { getLocalStorage, fetchAndSetAll, toastAndNavigate } = Utility();

    let class_id = state?.class_id || userParams?.class_id;
    let section_id = state?.section_id || userParams?.section_id;
    let day = state?.day;
    let batch = state?.batch;

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        dispatch(setMenuItem(selectedMenu.selected));
    }, []);

    const updateTimeTable = useCallback(formData => {
        let promises = [];
        setLoading(true);
        let payloadBase = {
            day: formData.timeTableData.values.day,
            class_id: formData.timeTableData.values.class,
            section_id: formData.timeTableData.values.section,
            batch: formData.timeTableData.values.batch
        };

        promises = formData.timeTableData.values.period.map((item, index) => {
            const payload = {
                ...payloadBase,
                period: item,
                id: formData.timeTableData.values[`dbId_${index}`],
                duration: formData.timeTableData.values.duration[index],
                subject_id: formData.timeTableData.values[`subject${index + 1}`],
            };
            API.TimeTableAPI.updateTimeTable(payload);
        });

        return Promise.all(promises)
            .then(() => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "info", "Successfully updated");
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
                console.log("error updating time table", err);
            });
    }, [formData]);


    const populateTimeTableData = useCallback((class_id, section_id, day, batch) => {
        setLoading(true);
        const path = [`/get-time-tables/?page=0&size=12&classId=${class_id}&section=${section_id}&day=${day}&batch=${batch}`];

        API.CommonAPI.multipleAPICall("GET", path)
            .then(response => {
                if (response[0].data.status === 'Success') {
                    const dataObj = {
                        timeTableData: response[0].data.data.rows
                    };
                    setUpdatedValues(dataObj);
                    setLoading(false);
                }
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
            });
    }, [class_id, section_id, day, batch]);

    const createTimeTable = useCallback(formData => {
        let promises = [];
        setLoading(true);
        let payloadBase = {
            day: formData.timeTableData.values.day,
            class_id: formData.timeTableData.values.class,
            section_id: formData.timeTableData.values.section,
            batch: formData.timeTableData.values.batch
        };

        promises = formData.timeTableData.values.period.map((item, index) => {
            const payload = {
                ...payloadBase,
                period: item,
                duration: formData.timeTableData.values.duration[index],
                subject_id: formData.timeTableData.values[`subject${index + 1}`]
            }
            API.TimeTableAPI.createTimeTable(payload);
        });

        return Promise.all(promises)
            .then(() => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "success", "Successfully Created", navigateTo, `/time-table/listing`, true);
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
                console.log("error creating time table", err);
            });
    }, [formData]);

    useEffect(() => {
        if (!allSubjects?.listData?.length) {
            fetchAndSetAll(dispatch, setAllSubjects, API.SubjectAPI);
        }
    }, [allSubjects?.listData?.length]);

    //Create/Update/Populate TimeTable
    useEffect(() => {
        if (class_id && section_id && !submitted) {
            setTitle("Update");
            populateTimeTableData(class_id, section_id, day, batch);
        }
        if (formData.timeTableData.validated) {
            (class_id && section_id) ? updateTimeTable(formData) : createTimeTable(formData);
        } else {
            setSubmitted(false);
        }
    }, [submitted, class_id, section_id, day, batch]);

    const handleSubmit = async () => {
        await timeTableFormRef.current.Submit();
        setSubmitted(true);
    };

    const handleFormChange = (data, form) => {
        form == 'timeTable' ? setFormData({ ...formData, timeTableData: data }) : null;
    };

    return (
        <Box m="10px"
            sx={{
                backgroundImage: theme.palette.mode == "light" ? `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${formBg})`
                    : `linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.9)), url(${formBg})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "start",
                backgroundSize: "cover",
                backgroundAttachment: "fixed",
                height: "100%"
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
            <TimeTableFormComponent
                onChange={(data) => {
                    handleFormChange(data, 'timeTable');
                }}
                refId={timeTableFormRef}
                setDirty={setDirty}
                reset={reset}
                setReset={setReset}
                classData={classData}
                setClassData={setClassData}
                allSubjects={allSubjects?.listData}
                updatedValues={updatedValues?.timeTableData}
            />

            <Box display="flex" justifyContent="end" m="20px">
                {   //hide reset button on TimeTable update
                    title === "Update" ? null :
                        <Button type="reset" color="warning" variant="contained" sx={{ mr: 3 }}
                            disabled={!dirty || submitted}
                            onClick={() => {
                                if (window.confirm("Do You Really Want To Reset?")) {
                                    setReset(true);
                                }
                            }}
                        >
                            Reset
                        </Button>
                }
                <Button color="error" variant="contained" sx={{ mr: 3 }}
                    onClick={() => navigateTo(`/time-table/listing`)}>
                    Cancel
                </Button>
                <Button type="submit" onClick={() => handleSubmit()} disabled={!dirty}
                    color={title === "Update" ? "info" : "success"} variant="contained"
                >
                    Submit
                </Button>
                <Toast alerting={toastInfo.toastAlert}
                    severity={toastInfo.toastSeverity}
                    message={toastInfo.toastMessage}
                />
            </Box>
            {loading === true ? <Loader /> : null}
        </Box>
    );
};

export default FormComponent;
