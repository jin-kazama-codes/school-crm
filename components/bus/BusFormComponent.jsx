/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { Box, FormControl, InputLabel, MenuItem, FormHelperText } from "@mui/material";
import { Select, TextField, useMediaQuery } from "@mui/material";
import { useFormik } from "formik";

import BusValidation from "./Validation";
import config from "../config"

const initialValues = {
    registration_no: "",
    driver: "",
    driver_contact: "",
    driver_license: "",
    conductor: "",
    conductor_contact: "",
    conductor_aadhaar: "",
    route: "",
    status: "active"
};

const BusFormComponent = ({
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
        validationSchema: BusValidation,
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
    }

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
                        name="registration_no"
                        label="Registration Number*"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.registration_no}
                        error={!!formik.touched.registration_no && !!formik.errors.registration_no}
                        helperText={formik.touched.registration_no && formik.errors.registration_no}
                        sx={{ gridColumn: "span 2" }}
                    />
                    <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        name="driver"
                        label="Driver Name*"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.driver}
                        error={!!formik.touched.driver && !!formik.errors.driver}
                        helperText={formik.touched.driver && formik.errors.driver}
                        sx={{ gridColumn: "span 2" }}
                    />
                    <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        label="Contact Number*"
                        name="driver_contact"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.driver_contact}
                        error={!!formik.touched.driver_contact && !!formik.errors.driver_contact}
                        helperText={formik.touched.driver_contact && formik.errors.driver_contact}
                    />
                    <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        label="License Number*"
                        name="driver_license"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.driver_license}
                        error={!!formik.touched.driver_license && !!formik.errors.driver_license}
                        helperText={formik.touched.driver_license && formik.errors.driver_license}
                    />
                    <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        name="conductor"
                        label="Conductor Name*"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.conductor}
                        error={!!formik.touched.conductor && !!formik.errors.conductor}
                        helperText={formik.touched.conductor && formik.errors.conductor}
                        sx={{ gridColumn: "span 2" }}
                    />
                    <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        label="Conductor Contact Number*"
                        name="conductor_contact"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.conductor_contact}
                        error={!!formik.touched.conductor_contact && !!formik.errors.conductor_contact}
                        helperText={formik.touched.conductor_contact && formik.errors.conductor_contact}
                    />
                    <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        label="Conductor Aadhaar Number*"
                        name="conductor_aadhaar"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.conductor_aadhaar}
                        error={!!formik.touched.conductor_aadhaar && !!formik.errors.conductor_aadhaar}
                        helperText={formik.touched.conductor_aadhaar && formik.errors.conductor_aadhaar}
                    />
                    <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        label="Route*"
                        name="route"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.route}
                        error={!!formik.touched.route && !!formik.errors.route}
                        helperText={formik.touched.route && formik.errors.route}
                    />

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
            </form>
        </Box>
    );
}
BusFormComponent.propTypes = {
    onChange: PropTypes.func,
    refId: PropTypes.shape({
        current: PropTypes.any
    }),
    setDirty: PropTypes.func,
    reset: PropTypes.bool,
    setReset: PropTypes.func,
    updatedValues: PropTypes.object,
};

export default BusFormComponent;
