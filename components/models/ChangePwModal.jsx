/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useRef, useState } from "react";
import { useNavigate } from "@/lib/routerAdapter";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";

import { Formik } from "formik";
import * as Yup from 'yup';
import { Box, Divider, Typography } from "@mui/material";
import { Button, Dialog, TextField, useMediaQuery } from "@mui/material";
import { useTheme } from '@mui/material/styles';

import API from "../../apis";
import Loader from "../common/Loader";
import Toast from "../common/Toast";

import { tokens, themeSettings } from "../../theme";
import { Utility } from "../utility";

import formBg from "../assets/formBg.png";

const initialValues = {
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: ""
};
const sequentialChars = ['123', '234', '345', '456', '567', '678', '789', '890', 'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz'];

const validationSchema = Yup.object({
    oldPassword: Yup.string()
        .required('Old Password is required'),
    newPassword: Yup.string()
        .min(8, 'Password Must Be 8 Characters Long')
        .matches(/[A-Z]/, 'Password Must Contain At Least 1 Uppercase Letter')
        .matches(/[a-z]/, 'Password Must Contain At Least 1 Lowercase Letter')
        .matches(/[0-9]/, 'Password Must Contain At Least 1 Number')
        .matches(/[^\w]/, 'Password Must Contain At Least 1 Special Character')
        .test('no-sequential-chars', 'Avoid Sequential Characters In The Password', (value) => {
            // Check for sequential characters
            for (const seq of sequentialChars) {
                if (value.includes(seq) || value.includes(seq.toUpperCase())) {
                    return false;
                }
            }
            return true;
        })
        .required("This Field is Required"),
    confirmNewPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Confirm New Password is required')
});

const ChangePwModal = ({ openDialog, setOpenDialog }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isMobile = useMediaQuery("(max-width:480px)");
    const isTab = useMediaQuery("(max-width:920px)");

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    //form component starts
    const [loading, setLoading] = useState(false);
    const oldPasswordRef = useRef(null);
    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const toastInfo = useSelector(state => state.toastInfo);
    const { typography } = themeSettings(theme.palette.mode);
    const { toastAndNavigate } = Utility();

    const handleFormSubmit = (values, { setFieldError, setSubmitting }) => {
        if (values.oldPassword && values.newPassword && values.confirmNewPassword) {
            setLoading(true);

            API.UserAPI.changeUserPw(values)
                .then(({ data: response }) => {
                    setLoading(false);
                    if (response.status === 'Success') {
                        if (response.data === 'Old Password do not match') {
                            // Set the Formik error for oldPassword
                            setFieldError('oldPassword', response.data);
                            setSubmitting(false);
                            toastAndNavigate(dispatch, true, "info", response.data);
                            oldPasswordRef.current.focus();     //to focus old password field
                        } else if (response.data === 'User does not exist') {
                            toastAndNavigate(dispatch, true, "info", response.data);
                        } else if (response.data.includes('Updated Successfully')) {
                            toastAndNavigate(dispatch, true, "info", response.data);
                            setTimeout(() => {
                                handleDialogClose();
                                navigateTo(0);
                            }, 2000);
                        }
                    } else {
                        toastAndNavigate(dispatch, true, "error", "An Error Occurred, Please Try Again");
                    }
                })
                .catch(err => {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "error", err ? err.response?.data?.msg : "An Error Occurred");
                });
        }
    };

    return (
        <div>
            <Dialog
                fullScreen={fullScreen}
                open={openDialog}
                onClose={handleDialogClose}
                aria-labelledby="responsive-dialog-title"
                sx={{
                    top: isMobile ? "33%" : isTab ? "25%" : "20%", height: isMobile ? "49%" : isTab ? "39%" : "60%",
                    "& .MuiPaper-root": {
                        width: "100%",
                        backgroundImage: theme.palette.mode == "light" ? `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${formBg})`
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
                    marginTop="10px"
                >
                    Change Password
                </Typography>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleFormSubmit}
                >
                    {({
                        values,
                        errors,
                        touched,
                        dirty,
                        isSubmitting,
                        handleBlur,
                        handleChange,
                        handleSubmit
                    }) => (
                        <form onSubmit={handleSubmit}>
                            <Box display="grid" gap="30px" gridTemplateColumns="repeat(2, minmax(0, 1fr))" padding="20px">
                                <TextField
                                    variant="filled"
                                    type="text"
                                    name="oldPassword"
                                    label="Old Password*"
                                    inputRef={oldPasswordRef}
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.oldPassword}
                                    error={!!touched.oldPassword && !!errors.oldPassword}
                                    helperText={touched.oldPassword && errors.oldPassword}
                                />
                                <TextField
                                    variant="filled"
                                    type="text"
                                    name="newPassword"
                                    label="New Password*"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.newPassword}
                                    error={!!touched.newPassword && !!errors.newPassword}
                                    helperText={touched.newPassword && errors.newPassword}
                                />
                                <TextField
                                    variant="filled"
                                    type="text"
                                    name="confirmNewPassword"
                                    label="Confirm New Password*"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.confirmNewPassword}
                                    error={!!touched.confirmNewPassword && !!errors.confirmNewPassword}
                                    helperText={touched.confirmNewPassword && errors.confirmNewPassword}
                                />
                            </Box>
                            <Divider />
                            <Box display="flex" justifyContent="end" p="20px">
                                <Button color="error" variant="contained" sx={{ mr: 3 }}
                                    onClick={() => handleDialogClose()}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={!dirty || isSubmitting}
                                    color="success" variant="contained"
                                >
                                    Submit
                                </Button>
                            </Box>
                        </form>
                    )}
                </Formik>
                {loading === true ? <Loader /> : null}
            </Dialog>
            <Toast
                alerting={toastInfo.toastAlert}
                severity={toastInfo.toastSeverity}
                message={toastInfo.toastMessage}
            />
        </div>
    );
};

ChangePwModal.propTypes = {
    openDialog: PropTypes.bool,
    setOpenDialog: PropTypes.func
};

export default ChangePwModal;
