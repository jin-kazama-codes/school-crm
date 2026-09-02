/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useRef, useState } from 'react'
import { Formik } from "formik"
import { Box, Typography, Button, TextField } from "@mui/material"

import SignInLoader from "../common/SignInLoader"

const ForgetPassword = ({ Api, isFliped, setIsFliped, dispatch, toastAndNavigate, isMobile, isTab }) => {
    const [loading, setLoading] = useState(false)
    const inputRef = useRef(null)
    const formikRef = useRef(null); // Ref to hold Formik instance

    const flipCard = () => {
        setIsFliped(!isFliped);
        if (formikRef.current) {
            formikRef.current.resetForm();
            setLoading(false);
        }
    };

    const handleSubmit = (values) => {
        setLoading(true);
        Api.forgotPassword(values)
            .then(res => {
                
                if (res.status === "Success") {
                    setLoading(false)
                    toastAndNavigate(dispatch, true, "info", "Link has been sent to the Email");
                    flipCard();
                } else if (res.status === "User does not exist") {
                    setLoading(false)
                    toastAndNavigate(dispatch, true, "error", "User does not exist");
                }
            })
            .catch(err => console.log('Error in Forget Password API', err))
    };

    return (
        <Box width={300} height={300}>
            <div>
                <Formik
                    innerRef={formikRef}
                    initialValues={{ email: "" }}
                    onSubmit={handleSubmit}
                >
                    {({
                        values,
                        errors,
                        dirty,
                        touched,
                        handleBlur,
                        handleChange,
                        handleSubmit
                    }) => (
                        <form onSubmit={handleSubmit}
                            style={{
                                width: isMobile ? "40vw" : isTab ? "28vw" : "21vw",
                                display: "flex",
                                justifyContent:"center",
                                alignItems:"center",
                                flexDirection:"column"
                            }}>
                            <TextField
                                required
                                name="email"
                                type='email'
                                label="Enter Email"
                                variant="filled"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.email}
                                error={!!errors.email && touched.email}
                                helperText={errors.email && touched.email}
                                sx={{width:"100%", backgroundColor: "#E9F1FA", borderRadius: "20px", overflow: "hidden" }}
                            />
                            <Button
                                disabled={!dirty || loading}
                                type="submit"
                                variant="contained"
                                size="large"
                                sx={{
                                    color: "#F6F6F2",
                                    display: "block",
                                    mt:"20px",
                                    minWidth: isMobile
                                        ? "170px"
                                        : isTab
                                            ? "200px"
                                            : "60%",
                                    backgroundColor: "#FF9A01",
                                    borderRadius: 28,
                                }}
                            >
                                {loading === true ? <SignInLoader /> : "Submit"}
                            </Button>
                        </form>
                    )}
                </Formik>
            </div>
            <Button onClick={flipCard} sx={{ color: "white" }}>Back to Login</Button>
        </Box>

    );
};

export default ForgetPassword;
