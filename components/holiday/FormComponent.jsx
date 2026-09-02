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
import HolidayFormComponent from "./HolidayFormComponent";

import { setMenuItem } from "../../redux/actions/NavigationAction";
import { tokens, themeSettings } from "../../theme";
import { Utility } from "../utility";

import formBg from "../assets/formBg.png";

const FormComponent = () => {
    const [title, setTitle] = useState("Create");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        holidayData: { values: null, validated: false },
    });
    const [updatedValues, setUpdatedValues] = useState(null);
    const [dirty, setDirty] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [reset, setReset] = useState(false);

    const selected = useSelector(state => state.menuItems.selected);
    const toastInfo = useSelector(state => state.toastInfo);

    const holidayFormRef = useRef();

    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const userParams = useParams();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { typography } = themeSettings(theme.palette.mode);
    const { state } = useLocation();
    const { toastAndNavigate, getLocalStorage } = Utility();

    //after page refresh the id in router state becomes undefined, so getting Holiday id from url params
    let id = state?.id || userParams?.id;

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        dispatch(setMenuItem(selectedMenu.selected));
    }, []);

    const updateHoliday = useCallback(formData => {

        const dataFields = [
            { ...formData.holidayData.values }
        ];
        const paths = ["/update-holiday"];
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
                    toastAndNavigate(dispatch, true, "info", "Successfully Updated", navigateTo, `/holiday/listing/${getLocalStorage('class') || ''}`);
                }
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg);
                throw err;
            });
    }, [formData]);

    const populateHolidayData = useCallback(id => {
        setLoading(true);
        const paths = [`/get-by-pk/holiday/${id}`];
        API.CommonAPI.multipleAPICall("GET", paths)
            .then(responses => {
                if (responses[0].data.data) {
                    responses[0].data.data.startDate = dayjs(responses[0]?.data?.data?.startDate);
                    responses[0].data.data.endDate = dayjs(responses[0]?.data?.data?.endDate);
                }
                const dataObj = {
                    holidayData: responses[0].data.data
                };
                setUpdatedValues(dataObj);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg);
                throw err;
            });
    },[id]);

    const createHoliday = useCallback(formData => {
        setLoading(true);
        API.HolidayAPI.createHoliday({ ...formData.holidayData.values })
            .then(() => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "success", "Successfully Created", navigateTo, `/holiday/listing`);
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg);
                throw err;
            });
    },[formData]);

    //Create/Update/Populate Holiday
    useEffect(() => {
        if (id && !submitted) {
            setTitle("Update");
            populateHolidayData(id);
        }
        if (formData.holidayData.validated) {
            formData.holidayData.values?.id ? updateHoliday(formData) : createHoliday(formData);
        } else {
            setSubmitted(false);
        }
    }, [id, submitted]);

    const handleSubmit = async () => {
        await holidayFormRef.current.Submit();
        setSubmitted(true);
    };

    const handleFormChange = (data, form) => {
        if (form === 'holiday') {
            setFormData({ ...formData, holidayData: data });
        }
    };

    return (
        <Box m="10px"
            sx={{
                backgroundImage: theme.palette.mode == "light" ?` linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${formBg})`
                    :` linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.9)), url(${formBg})`,
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
            <HolidayFormComponent
                onChange={(data) => {
                    handleFormChange(data, 'holiday');
                }}
                refId={holidayFormRef}
                setDirty={setDirty}
                reset={reset}
                setReset={setReset}
                userId={id}
                updatedValues={updatedValues?.holidayData}
            />

            <Box display="flex" justifyContent="end" m="20px">
                {   //hide reset button on Holiday update
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
                    onClick={() => navigateTo(`/holiday/listing/${getLocalStorage('class') || ''}`)}>
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

export default FormComponent;
