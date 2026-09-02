/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';

import { Box, InputLabel, MenuItem, FormHelperText, FormControl } from "@mui/material";
import { Select, TextField, useMediaQuery } from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { useFormik } from "formik";

import employeeValidation from "./Validation";

import config from '../config';

const initialValues = {
    firstname: "",
    lastname: "",
    email: "",
    contact_no: "",
    role: "",
    dob: null,
    gender: "",
    status: "active"
};

const EmployeeFormComponent = ({
    onChange,
    refId,
    setDirty,
    reset,
    setReset,
    updatedValues = null
}) => {

    const [initialState, setInitialState] = useState(initialValues);

    const isNonMobile = useMediaQuery("(min-width:600px)");

    const formik = useFormik({
        initialValues: initialState,
        validationSchema: employeeValidation,
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
                    : false,
                    dirty: formik.dirty
            });
        }
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

    return (
        <Box m="20px">
            <form ref={refId}>
                <Box
                    display="grid"
                    gap="30px"
                    gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                    sx={{
                        "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                    }}
                >
                    <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        name="firstname"
                        label="Firstname*"
                        autoComplete="new-firstname"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.firstname}
                        error={!!formik.touched.firstname && !!formik.errors.firstname}
                        helperText={formik.touched.firstname && formik.errors.firstname}
                    />
                    <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        name="lastname"
                        label="Lastname*"
                        autoComplete="new-lastname"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.lastname}
                        error={!!formik.touched.lastname && !!formik.errors.lastname}
                        helperText={formik.touched.lastname && formik.errors.lastname}
                    />

                    <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        label="Email"
                        name="email"
                        autoComplete="new-email"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.email}
                        error={!!formik.touched.email && !!formik.errors.email}
                        helperText={formik.touched.email && formik.errors.email}
                    />
                    <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        label="Contact Number*"
                        name="contact_no"
                        autoComplete="new-contact"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.contact_no}
                        error={!!formik.touched.contact_no && !!formik.errors.contact_no}
                        helperText={formik.touched.contact_no && formik.errors.contact_no}
                    />
                    <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        label="Role"
                        name="role"
                        autoComplete="new-role"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.role}
                        error={!!formik.touched.role && !!formik.errors.role}
                        helperText={formik.touched.role && formik.errors.role}
                    />

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            format="DD MMMM YYYY"            //ex - 25 July 2023
                            views={['day', "month", "year"]}
                            label="Select Date Of Birth"
                            name="dob"
                            required
                            value={formik.values.dob}
                            onChange={newDob => {
                                formik.setFieldValue("dob", newDob);
                            }}
                        />
                    </LocalizationProvider>
                    <FormControl variant="filled" sx={{ minWidth: 120 }}
                        error={!!formik.touched.gender && !!formik.errors.gender}
                    >
                        <InputLabel>Gender</InputLabel>
                        <Select
                            variant="filled"
                            name="gender"
                            value={formik.values.gender}
                            onChange={formik.handleChange}
                        >
                            {Object.keys(config.gender).map(item => (
                                <MenuItem key={item} value={item}>
                                    {config.gender[item]}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>{formik.touched.gender && formik.errors.gender}</FormHelperText>
                    </FormControl>
                    <FormControl variant="filled" sx={{ minWidth: 120 }}
                        error={!!formik.touched.status && !!formik.errors.status}
                    >
                        <InputLabel>Status</InputLabel>
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
                </Box>
            </form >
        </Box >
    );
}

EmployeeFormComponent.propTypes = {
    onChange: PropTypes.func.isRequired,
    refId: PropTypes.any.isRequired, 
    setDirty: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    setReset: PropTypes.func.isRequired,
    updatedValues: PropTypes.object  
};

export default EmployeeFormComponent;
