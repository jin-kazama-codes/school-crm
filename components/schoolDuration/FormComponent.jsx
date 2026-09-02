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
import dayjs from "dayjs";

import API from "../../apis";
import Loader from "../common/Loader";
import Toast from "../common/Toast";
import SchoolDurationFormComponent from "./SchoolDurationFormComponent";

import { setMenuItem } from "../../redux/actions/NavigationAction";
import { tokens, themeSettings } from "../../theme";
import { Utility } from "../utility";

import formBg from "../assets/formBg.png";

const FormComponent = () => {
    const [title, setTitle] = useState("Create");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        schoolDurationData: { values: null, validated: false }
    });
    const [updatedValues, setUpdatedValues] = useState(null);
    const [dirty, setDirty] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [reset, setReset] = useState(false);

    //  const subjectsInRedux = useSelector(state => state.allSubjects);
    const selected = useSelector(state => state.menuItems.selected);
    const toastInfo = useSelector(state => state.toastInfo);

    const schoolDurationFormRef = useRef();


    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const userParams = useParams();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { typography } = themeSettings(theme.palette.mode);
    const { state } = useLocation();
    const { toastAndNavigate, getLocalStorage } = Utility();

    //after page refresh the id in router state becomes undefined, so getting SchoolDuration id from url params
    let id = state?.id || userParams?.id;

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        dispatch(setMenuItem(selectedMenu.selected));
    }, []);

    const updateSchoolDuration = useCallback(formData => {
        const dataFields = [
            { ...formData.schoolDurationData.values },
        ];
        const paths = ["/update-school-duration"];
        setLoading(true);

        API.CommonAPI.multipleAPICall("PATCH", paths, dataFields)
            .then(responses => {
                let status = true;
                responses.forEach(response => {
                    if (response.data.status !== "Success") {
                        status = false;
                    }
                });
                if (status) {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "info", "Successfully Updated", navigateTo, `/school-duration/listing`);
                }
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg);
                throw err;
            });
    }, [formData]);

    const populateSchoolDurationData = useCallback(id => {
        setLoading(true);
        const paths = [`/get-by-pk/school_duration/${id}`];
        API.CommonAPI.multipleAPICall("GET", paths)
            .then(response => {
                if (response[0]?.data?.data) {
                    response[0].data.data.opening_time = dayjs(response[0].data.data.opening_time);
                    response[0].data.data.closing_time = dayjs(response[0].data.data.closing_time);
                    response[0].data.data.eve_opening_time = dayjs(response[0].data.data.eve_opening_time);
                    response[0].data.data.eve_closing_time = dayjs(response[0].data.data.eve_closing_time);
                    response[0].data.data.employee_entry_time = dayjs(response[0].data.data.opening_time);
                    response[0].data.data.employee_exit_time = dayjs(response[0].data.data.employee_exit_time);
                }
                const dataObj = {
                    schoolDurationData: response[0].data.data,
                };
                setUpdatedValues(dataObj);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg);
            });
    },[id]);


    const createSchoolDuration = useCallback(formData => {
        setLoading(true);
        API.SchoolDurationAPI.createSchoolDuration({ ...formData.schoolDurationData.values })
            .then(({ data: schoolDuration }) => {
                if (schoolDuration?.status === 'Success') {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "success", "Successfully Created", navigateTo, `/school-duration/listing`);
                }
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg);
            });
    },[formData]);

    //Create/Update/Populate SchoolDuration
    useEffect(() => {
        if (id && !submitted) {
            setTitle("Update");
            populateSchoolDurationData(id);
        }
        if (formData.schoolDurationData.validated) {
            formData.schoolDurationData.values?.id ? updateSchoolDuration(formData) : createSchoolDuration(formData);
        } else {
            setSubmitted(false);
        }
    }, [id, submitted]);

    const handleSubmit = async () => {
        await schoolDurationFormRef.current.Submit();
        setSubmitted(true);
    };

    const handleFormChange = (data, form) => {
        form == 'schoolDuration' ? setFormData({ ...formData, schoolDurationData: data }) : '';
    }

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
            <SchoolDurationFormComponent
                onChange={(data) => {
                    handleFormChange(data, 'schoolDuration');
                }}
                refId={schoolDurationFormRef}
                setDirty={setDirty}
                reset={reset}
                setReset={setReset}
                userId={id}
                updatedValues={updatedValues?.schoolDurationData}
            />

            <Box display="flex" justifyContent="end" m="20px">
                {   //hide reset button on SchoolDuration update
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
                    onClick={() => navigateTo(`/school-duration/listing/${getLocalStorage('class') || ''}`)}>
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
