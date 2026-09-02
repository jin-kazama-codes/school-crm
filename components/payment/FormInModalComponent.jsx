/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import PropTypes from "prop-types";

import { useCallback, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "@/lib/routerAdapter";

import { Box, Button, Dialog, Divider, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import API from "../../apis";
import Loader from "../common/Loader";
import PaymentFormComponent from "./PaymentFormComponent";
import Toast from "../common/Toast";

import { setMenuItem } from "../../redux/actions/NavigationAction";
import { tokens, themeSettings } from "../../theme";
import { Utility } from "../utility";

import formBg from "../assets/formBg.png";
import PaymentDataTable from "./PaymentDataTable";

const FormComponent = ({ openDialog, setOpenDialog }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    // const fullScreen = useMediaQuery(theme.breakpoints.down("lg"));
    const isMobile = useMediaQuery("(max-width:480px)");
    const isTab = useMediaQuery("(max-width:920px)");

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    //form component starts
    const [title, setTitle] = useState("Create");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        paymentData: { values: null, validated: false }
    });
    const [dirty, setDirty] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [reset, setReset] = useState(false);

    const selected = useSelector((state) => state.menuItems.selected);
    const toastInfo = useSelector((state) => state.toastInfo);
    const navigateTo = useNavigate();
    const paymentFormRef = useRef();

    const dispatch = useDispatch();
    const { state } = useLocation();
    const { typography } = themeSettings(theme.palette.mode);
    const { capitalizeEveryWord, toastAndNavigate, getLocalStorage } = Utility();
    const studentName = state?.lastname ? `${state?.firstname} ${state?.lastname}` : state?.firstname;

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        dispatch(setMenuItem(selectedMenu.selected));
    }, []);

    const createPayment = useCallback(formData => {
        setLoading(true);
        // eslint-disable-next-line no-unused-vars
        const { current_date, class_fee_by_mapping, ...modifiedObj } = formData.paymentData.values;

        API.PaymentAPI.createPayment(modifiedObj)
            .then(({ data: payment }) => {
                if (payment.status === 'Success') {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "success", "Successfully Created", navigateTo, '#', true);
                }
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, '#', true);
                console.log('Error in Creating Payment:', err);
            });
    }, [formData]);

    // Create Payment
    useEffect(() => {
        if (formData.paymentData.validated) {
            createPayment(formData);
        } else {
            // setSubmitted(false);
        }
    }, [submitted]);

    const handleSubmit = async () => {
        await paymentFormRef.current.Submit();
        setSubmitted(true);
    };

    const handleFormChange = (data, form) => {
        form === 'payment' ? setFormData({ ...formData, paymentData: data }) : null;
    };

    return (
        <Dialog
            open={openDialog}
            onClose={handleDialogClose}
            aria-labelledby="responsive-dialog-title"
            fullWidth
            maxWidth='xl'
            PaperProps={{
                sx: {
                    minHeight: '96%'
                }
            }}
            sx={{
                top: isMobile ? "13%" : isTab ? "5%" : "0%",
                height: isMobile ? "79%" : isTab ? "69%" : "90%",
                "& .MuiDialog-container": {
                    height: '95vh',
                },
                "& .MuiPaper-root": {
                    backgroundImage: theme.palette.mode == "light" ?
                        `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${formBg})`
                        : `linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.9)), url(${formBg})`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "cover"
                }
            }}
        >
            <Typography
                fontFamily={typography.fontFamily}
                fontSize={typography.h2.fontSize}
                color={colors.grey[100]}
                fontWeight="600"
                display="inline-block"
                textAlign="center"
                margin="10px auto 10px auto"
            >
                {`${selected} History for ${studentName ? capitalizeEveryWord(studentName) : ''}`}
            </Typography>
            <PaymentDataTable />

            <Typography
                fontFamily={typography.fontFamily}
                fontSize={typography.h2.fontSize}
                color={colors.grey[100]}
                fontWeight="600"
                display="inline-block"
                textAlign="center"
                margin="20px auto 10px auto"
            >
                {`${title} ${selected} for ${studentName ? capitalizeEveryWord(studentName) : ''}`}
            </Typography>
            <PaymentFormComponent
                onChange={(data) => {
                    handleFormChange(data, 'payment');
                }}
                refId={paymentFormRef}
                setDirty={setDirty}
                reset={reset}
                setReset={setReset}
            />
            <Divider />
            <Box display="flex" justifyContent="end" m="20px">
                {   //hide reset button on Payment update
                    title === "Update" ? null :
                        <Button type="reset" color="warning" variant="contained" sx={{ mr: 3 }}
                            disabled={!dirty || submitted}
                            onClick={() => {
                                if (window.confirm("Do You Really Want To Reset?")) {
                                    setReset(true);
                                    setOpenDialog(false);
                                }
                            }}
                        >
                            Reset
                        </Button>
                }
                <Button color="error" variant="contained" sx={{ mr: 3 }}
                    onClick={() => setOpenDialog(false)}>
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
        </Dialog>
    );
};

FormComponent.propTypes = {
    openDialog: PropTypes.bool,
    setOpenDialog: PropTypes.func
};

export default FormComponent;
