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

import config from "../config";
import holidayValidation from "./Validation";

const initialValues = {
    title: "",
    startDate: null,
    endDate: null,
    holiday_type: "school_closure",
    notes: ""
};

const HolidayFormComponent = ({
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
        validationSchema: holidayValidation,
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
                        label="Title*"
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
                            label="Closing Date"
                            name="startDate"
                            value={formik.values.startDate}
                            onChange={newStartDate => formik.setFieldValue("startDate", newStartDate)}
                            slotProps={{
                                textField: {
                                    error: !!formik.touched.startDate && !!formik.errors.startDate,
                                    helperText: formik.touched.startDate && formik.errors.startDate
                                }
                            }}
                        />
                        <DatePicker
                            format="DD MMMM YYYY"
                            views={['day', "month", "year"]}
                            label="Opening Date"
                            name="endDate"
                            value={formik.values.endDate}
                            onChange={new_endDate => formik.setFieldValue("endDate", new_endDate)}
                            slotProps={{
                                textField: {
                                    error: !!formik.touched.endDate && !!formik.errors.endDate,
                                    helperText: formik.touched.endDate && formik.errors.endDate
                                }
                            }}
                        />
                    </LocalizationProvider>
                    <FormControl variant="filled" sx={{ minWidth: 120 }}
                        error={!!formik.touched.type && !!formik.errors.type}
                    >
                        <InputLabel>Holiday Type</InputLabel>
                        <Select
                            variant="filled"
                            name="holiday_type"
                            value={formik.values.type}
                            onChange={formik.handleChange}
                        >
                            {Object.keys(config.holiday_type).map(item => (
                                <MenuItem key={item} value={item}>
                                    {config.holiday_type[item]}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>{formik.touched.type && formik.errors.type}</FormHelperText>
                    </FormControl>
                    <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        label="Note"
                        name="notes"
                        autoComplete="new-notes"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.notes}
                        error={!!formik.touched.notes && !!formik.errors.notes}
                        helperText={formik.touched.notes && formik.errors.notes}

                    />
                </Box>
            </form >
        </Box >
    );
}
HolidayFormComponent.propTypes = {
    onChange: PropTypes.func,
    refId: PropTypes.shape({
        current: PropTypes.any
    }),
    setDirty: PropTypes.func,
    reset: PropTypes.func,
    setReset: PropTypes.func,
    updatedValues: PropTypes.object
};

export default HolidayFormComponent;
