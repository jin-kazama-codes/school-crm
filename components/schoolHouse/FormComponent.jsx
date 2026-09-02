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
import SchoolHouseFormComponent from "./SchoolHouseFormComponent";

import { setMenuItem } from "../../redux/actions/NavigationAction";
import { tokens, themeSettings } from "../../theme";
import { Utility } from "../utility";

import formBg from "../assets/formBg.png";

const FormComponent = () => {
    const [title, setTitle] = useState("Create");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        schoolHouseData: { values: null, validated: false }
    });
    const [updatedValues, setUpdatedValues] = useState(null);
    const [dirty, setDirty] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [reset, setReset] = useState(false);

    const selected = useSelector(state => state.menuItems.selected);
    const toastInfo = useSelector(state => state.toastInfo);
    const schoolHouseFormRef = useRef();

    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const userParams = useParams();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { state } = useLocation();
    const { typography } = themeSettings(theme.palette.mode);
    const { toastAndNavigate, getLocalStorage } = Utility();

    //after page refresh the id in router state becomes undefined, so getting schoolHouse id from url params
    let id = state?.id || userParams?.id;

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        dispatch(setMenuItem(selectedMenu.selected));
    }, []);

    const updateSchoolHouse = useCallback(formData => {
        setLoading(true);
        // eslint-disable-next-line no-unused-vars
        const { captainClassId, captainSectionId, viceCaptainClassId, viceCaptainSectionId, ...modifiedObj } = formData.schoolHouseData.values;

        API.SchoolHouseAPI.updateSchoolHouse(modifiedObj)
            .then(({ data: updatedData }) => {
                if (updatedData.status === 'Success') {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "info", "Successfully Updated", navigateTo, "/school-house/listing");
                }
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, `/school-house/update/${id}`);
                console.log('error updating school house', err);
            });
    }, [formData]);

    const populateSchoolHouseData = useCallback(id => {
        setLoading(true);
        const paths = [`/get-by-pk/school_house/${id}`];

        API.CommonAPI.multipleAPICall("GET", paths)
            .then(response => {
                if (response[0].data.status === 'Success') {
                    const captainId = response[0].data.data.captain;
                    const viceCaptainId = response[0].data.data.vice_captain;

                    Promise.all([
                        API.StudentAPI.getClassOfStudent(captainId),
                        API.StudentAPI.getClassOfStudent(viceCaptainId)
                    ])
                        .then(results => {
                            const [captainResult, viceCaptainResult] = results;
                            const dataObj = {
                                ...response[0].data.data,
                                captainClassId: captainResult.data.class,
                                captainSectionId: captainResult.data.section,
                                viceCaptainClassId: viceCaptainResult.data.class,
                                viceCaptainSectionId: viceCaptainResult.data.section
                            };
                            setUpdatedValues(dataObj);
                            setLoading(false);
                        })
                        .catch(error => {
                            console.error("Error in API calls of populating school house:", error);
                        });
                }
            })
            .catch(commonAPIError => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", commonAPIError ? commonAPIError?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
            });
    }, [id]);

    const createSchoolHouse = useCallback(formData => {
        setLoading(true);
        // eslint-disable-next-line no-unused-vars
        const { captainClassId, captainSectionId, viceCaptainClassId, viceCaptainSectionId, ...modifiedObj } = formData.schoolHouseData.values;

        API.SchoolHouseAPI.createSchoolHouse(modifiedObj)
            .then(({ data: schoolHouse }) => {
                if (schoolHouse.status === 'Success') {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "success", "Successfully Created", navigateTo, '/school-house/listing');
                }
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, err ? err.response?.data?.msg : "An Error Occurred");
                console.log('error creating school house', err);
            });
    }, [formData]);

    //Create/Update/Populate schoolHouse
    useEffect(() => {
        if (id && !submitted) {
            setTitle("Update");
            populateSchoolHouseData(id);
        }
        if (formData.schoolHouseData.validated) {
            formData.schoolHouseData.values?.id ? updateSchoolHouse(formData) : createSchoolHouse(formData);
        } else {
            setSubmitted(false);
        }
    }, [id, submitted]);

    const handleSubmit = async () => {
        await schoolHouseFormRef.current.Submit();
        setSubmitted(true);
    };

    const handleFormChange = (data, form) => {
        form == 'schoolHouse' ? setFormData({ ...formData, schoolHouseData: data }) : '';
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
            <SchoolHouseFormComponent
                onChange={(data) => {
                    handleFormChange(data, 'schoolHouse');
                }}
                refId={schoolHouseFormRef}
                setDirty={setDirty}
                reset={reset}
                setReset={setReset}
                updatedValues={updatedValues}
            />

            <Box display="flex" justifyContent="end" m="20px">
                {   //hide reset button on schoolHouse update
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
                    onClick={() => navigateTo('/school-house/listing')}>
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
