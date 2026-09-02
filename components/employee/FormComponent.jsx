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
import AddressFormComponent from "../address/AddressFormComponent";
import Loader from "../common/Loader";
import Toast from "../common/Toast";
import EmployeeFormComponent from "./EmployeeFormComponent";

import { setMenuItem } from "../../redux/actions/NavigationAction";
import { tokens, themeSettings } from "../../theme";
import { Utility } from "../utility";

import formBg from "../assets/formBg.png";

const FormComponent = () => {
    const [title, setTitle] = useState("Create");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        employeeData: { values: null, validated: false },
        addressData: { values: null, validated: false },
        imageData: { values: null, validated: true }
    });
    const [updatedValues, setUpdatedValues] = useState(null);
    const [dirty, setDirty] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [reset, setReset] = useState(false);

    const selected = useSelector(state => state.menuItems.selected);
    const toastInfo = useSelector(state => state.toastInfo);

    const employeeFormRef = useRef();
    const addressFormRef = useRef();

    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const userParams = useParams();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { typography } = themeSettings(theme.palette.mode);
    const { state } = useLocation();
    const { toastAndNavigate, getLocalStorage } = Utility();

    //after page refresh the id in router state becomes undefined, so getting employee id from url params
    let id = state?.id || userParams?.id;

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        dispatch(setMenuItem(selectedMenu.selected));
    }, []);

    const updateEmployeeAndAddress = useCallback(
        async (formData) => {
          setLoading(true);
          const paths = [];
          const dataFields = [];
    
          //   [      { ...formData.employeerData.values },
          //         { ...formData.addressData.values },
          //       ];
    
          try {
            if (formData.employeeData.dirty) {
              paths.push("/update-employee");
              dataFields.push(formData.employeeData.values);
            }
            if (formData.addressData.dirty) {
              paths.push("/update-address");
              dataFields.push(formData.addressData.values);
            }
            const responses = await API.CommonAPI.multipleAPICall(
              "PATCH",
              paths,
              dataFields
            );
            if (responses) {
              toastAndNavigate(
                dispatch,
                true,
                "info",
                "Successfully Updated",
                navigateTo,
                `/employee/listing/${getLocalStorage("class") || ""}`
              );
            }
            setLoading(false);
          } catch (err) {
            setLoading(false);
            toastAndNavigate(
              dispatch,
              true,
              "error",
              err ? err?.response?.data?.msg : "An Error Occurred",
              navigateTo,
              0
            );
            throw err;
          }
        },
        [formData]
      );
    const populateEmployeeData = useCallback(id => {
        setLoading(true);
        const paths = [`/get-by-pk/employee/${id}`, `/get-address/employee/${id}`];
        API.CommonAPI.multipleAPICall("GET", paths)
            .then(responses => {
                if (responses[0].data.data) {
                    // responses[0].data.data.subjects = findMultipleById(responses[0].data.data.subjects, subjectsInRedux?.listData?.rows)
                    responses[0].data.data.dob = dayjs(responses[0].data.data.dob);
                    responses[0].data.data.admission_date = dayjs(responses[0].data.data.admission_date);
                }
                const dataObj = {
                    employeeData: responses[0].data.data,
                    addressData: responses[1]?.data?.data
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

    const createEmployee = (formData => {
        setLoading(true);
        API.EmployeeAPI.createEmployee({ ...formData.employeeData.values })
            .then(({ data: employee }) => {
                if (employee?.status === 'Success') {
                    API.AddressAPI.createAddress({
                        ...formData.addressData.values,
                        parent_id: employee.data.id,
                        parent: 'employee',
                    })
                        .then(() => {
                            setLoading(false);
                            toastAndNavigate(dispatch, true, "success", "Successfully Created", navigateTo, `/employee/listing`);
                        })
                        .catch(err => {
                            setLoading(false);
                            toastAndNavigate(dispatch, true, err ? err : "An Error Occurred");
                            throw err;
                        });
                }
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg);
                throw err;
            });
    },[formData]);

    //Create/Update/Populate employee
    useEffect(() => {
        if (id && !submitted) {
            setTitle("Update");
            populateEmployeeData(id);
        }
        if (formData.employeeData.validated && formData.addressData.validated) {
            formData.employeeData.values?.id ? updateEmployeeAndAddress(formData) : createEmployee(formData);
        } else {
            setSubmitted(false);
        }
    }, [id, submitted]);

    const handleSubmit = async () => {
        await employeeFormRef.current.Submit();
        await addressFormRef.current.Submit();
        setSubmitted(true);
    };

    const handleFormChange = (data, form) => {
        if (form === 'employee') {
            setFormData({ ...formData, employeeData: data });
        } else if (form === 'address') {
            setFormData({ ...formData, addressData: data });
        }
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
            <EmployeeFormComponent
                onChange={(data) => {
                    handleFormChange(data, 'employee');
                }}
                refId={employeeFormRef}
                setDirty={setDirty}
                reset={reset}
                setReset={setReset}
                userId={id}
                updatedValues={updatedValues?.employeeData}
            />
            <AddressFormComponent
                onChange={(data) => {
                    handleFormChange(data, 'address');
                }}
                refId={addressFormRef}
                update={id ? true : false}
                setDirty={setDirty}
                reset={reset}
                setReset={setReset}
                updatedValues={updatedValues?.addressData}
            />

            <Box display="flex" justifyContent="end" m="20px">
                {   //hide reset button on employee update
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
                    onClick={() => navigateTo(`/employee/listing/${getLocalStorage('class') || ''}`)}>
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
