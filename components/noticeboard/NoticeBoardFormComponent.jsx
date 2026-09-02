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

import noticeBoardValidation from "./Validation";

import config from '../config';

const initialValues = {
    title: "",
    description: "",
    publish_date: "",
    expiry_date: "",
    status: "active"
};

const NoticeBoardFormComponent = ({
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
        validationSchema: noticeBoardValidation,
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
                    : false
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
                        name="title"
                        label="Title"
                        autoComplete="new-title"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.title}
                        error={!!formik.touched.title && !!formik.errors.title}
                        helperText={formik.touched.title && formik.errors.title}
                    />

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            format="DD MMMM YYYY"            //ex - 25 July 2023
                            views={['day', "month", "year"]}
                            label="Publish Date"
                            name="publish_date"
                            value={formik.values.publish_date}
                            onChange={new_publish_date => formik.setFieldValue("publish_date", new_publish_date)}
                            slotProps={{
                                textField: {
                                    error: !!formik.touched.publish_date && !!formik.errors.publish_date,
                                    helperText: formik.touched.publish_date && formik.errors.publish_date
                                }
                            }}
                        />
                        <DatePicker
                            format="DD MMMM YYYY"
                            views={['day', "month", "year"]}
                            label="Expiry Date"
                            name="expiry_date"
                            value={formik.values.expiry_date}
                            onChange={new_expiry_date => formik.setFieldValue("expiry_date", new_expiry_date)}
                            slotProps={{
                                textField: {
                                    error: !!formik.touched.expiry_date && !!formik.errors.expiry_date,
                                    helperText: formik.touched.expiry_date && formik.errors.expiry_date
                                }
                            }}
                        />
                    </LocalizationProvider>

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
                    <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        label="Description"
                        name="description"
                        autoComplete="new-description"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.description}
                        error={!!formik.touched.description && !!formik.errors.description}
                        helperText={formik.touched.description && formik.errors.description}
                        sx={{ gridColumn: "span 4", gridRow: "span 2" }}
                    />
                </Box>
            </form >
        </Box >
    );
}

NoticeBoardFormComponent.propTypes = {
    onChange: PropTypes.func.isRequired,
    refId: PropTypes.any.isRequired,
    setDirty: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    setReset: PropTypes.func.isRequired,
    updatedValues: PropTypes.object
};

export default NoticeBoardFormComponent;
