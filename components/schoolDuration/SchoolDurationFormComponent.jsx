/* eslint-disable react-hooks/exhaustive-deps */
// /**
//  * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
//  *
//  * This software is the confidential information of School CRM Inc., and is licensed as
//  * restricted rights software. The use,reproduction, or disclosure of this software is subject to
//  * restrictions set forth in your license agreement with School CRM.
// */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { Box, TextField, useMediaQuery, FormControl, InputLabel } from "@mui/material";
import { Select, MenuItem, FormHelperText, useTheme } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker, renderTimeViewClock, LocalizationProvider } from "@mui/x-date-pickers";
import { useFormik } from "formik";

import SchoolPeriodValidation from "./Validation";

const initialValues = {
  batch: "",
  period: "",
  halves: 2,
  recess_time: "",
  first_half_period_duration: "",
  second_half_period_duration: "",
  cutoff_time: "",
  opening_time: null,
  closing_time: null,
  shifts: "morning",
  eve_opening_time: null,
  eve_closing_time: null,
  employee_entry_time: null,
  employee_exit_time: null
};

const SchoolDurationFormComponent = ({
  onChange,
  refId,
  setDirty,
  reset,
  setReset,
  updatedValues = null,
}) => {
  const [initialState, setInitialState] = useState(initialValues);

  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();

  const formik = useFormik({
    initialValues: initialState,
    validationSchema: SchoolPeriodValidation,
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
            "& > div": { gridColumn: isNonMobile ? undefined : "span 4" }
          }}
        >
          <FormControl
            variant="filled"
            sx={{ minWidth: 220 }}
            error={!!formik.touched.batch && !!formik.errors.batch}
          >
            <InputLabel>Batch</InputLabel>
            <Select
              variant="filled"
              name="batch"
              value={formik.values.batch}
              onChange={formik.handleChange}
            >
              <MenuItem value="junior">Junior</MenuItem>
              <MenuItem value="senior">Senior</MenuItem>
              <MenuItem value="both">Both</MenuItem>
            </Select>
            <FormHelperText> {formik.touched.batch && formik.errors.batch} </FormHelperText>
          </FormControl>
          <TextField
            fullWidth
            variant="filled"
            type="number"
            name="period"
            label="Period"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.period}
            error={!!formik.touched.period && !!formik.errors.period}
            helperText={formik.touched.period && formik.errors.period}
          />
          <TextField
            fullWidth
            variant="filled"
            type="number"
            name="halves"
            label="Halves"
            onBlur={formik.handleBlur}
            value={formik.values.halves}
            error={!!formik.touched.halves && !!formik.errors.halves}
            helperText={formik.touched.halves && formik.errors.halves}
          />
          <TextField
            fullWidth
            variant="filled"
            type="number"
            name="recess_time"
            label="Recess Time (mintues)"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.recess_time}
            error={!!formik.touched.recess_time && !!formik.errors.recess_time}
            helperText={formik.touched.recess_time && formik.errors.recess_time}
          />
          <TextField
            fullWidth
            variant="filled"
            type="number"
            name="first_half_period_duration"
            label="First half period duration (mintues)"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.first_half_period_duration}
            error={!!formik.touched.first_half_period_duration && !!formik.errors.first_half_period_duration}
            helperText={formik.touched.first_half_period_duration && formik.errors.first_half_period_duration}
          />
          <TextField
            fullWidth
            variant="filled"
            type="number"
            name="second_half_period_duration"
            label="Second half period duration (mintues)"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.second_half_period_duration}
            error={!!formik.touched.second_half_period_duration && !!formik.errors.second_half_period_duration}
            helperText={formik.touched.second_half_period_duration && formik.errors.second_half_period_duration}
          />
          <TextField
            fullWidth
            variant="filled"
            type="number"
            name="cutoff_time"
            label="CutOff Time (mintues)"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.cutoff_time}
            error={!!formik.touched.cutoff_time && !!formik.errors.cutoff_time}
            helperText={formik.touched.cutoff_time && formik.errors.cutoff_time}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              name="employee_entry_time"
              label="Employee Entry Time"
              format="hh:mm A"
              value={formik.values.employee_entry_time}
              onChange={(newOpeningTime) => formik.setFieldValue("employee_entry_time", newOpeningTime)}
              viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock, seconds: renderTimeViewClock }}
              slotProps={{
                textField: {
                  error: !!formik.touched.employee_entry_time && !!formik.errors.employee_entry_time,
                  helperText: formik.touched.employee_entry_time && formik.errors.employee_entry_time
                }
              }}
            />
            <TimePicker
              name="employee_exit_time"
              label="Employee Exit Time"
              value={formik.values.employee_exit_time}
              onChange={(newClosingTime) => formik.setFieldValue("employee_exit_time", newClosingTime)}
              viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock, seconds: renderTimeViewClock }}
              slotProps={{
                textField: {
                  error: !!formik.touched.employee_exit_time && !!formik.errors.employee_exit_time,
                  helperText: formik.touched.employee_exit_time && formik.errors.employee_exit_time
                }
              }}
            />
          </LocalizationProvider>
          <Box
            display="grid"
            gap="30px"
            border="2px solid #BADFE7"
            borderRadius="12px"
            p={2}
            sx={
              formik.values.shifts == "morning"
                ? {
                  gridColumnStart: 1,
                  gridColumnEnd: 3
                }
                : formik.values.shifts == "evening"
                  ? {
                    gridColumnStart: 1,
                    gridColumnEnd: 3
                  }
                  : formik.values.shifts == "both"
                    ? {
                      gridColumnStart: 1,
                      gridColumnEnd: 4
                    }
                    : null}
          >
            <FormControl
              variant="filled"
              sx={{ minWidth: 220 }}
              error={!!formik.touched.shifts && !!formik.errors.shifts}
            >
              <InputLabel>Shifts</InputLabel>
              <Select
                variant="filled"
                name="shifts"
                value={formik.values.shifts}
                onChange={formik.handleChange}
              >
                <MenuItem value="morning">Morning</MenuItem>
                <MenuItem value="evening">Evening</MenuItem>
                <MenuItem value="both">Both</MenuItem>
              </Select>
              <FormHelperText> {formik.touched.shifts && formik.errors.shifts} </FormHelperText>
            </FormControl>

            {formik.values.shifts !== "evening" && (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  name="opening_time"
                  label="Opening time"
                  format="hh:mm A"
                  value={formik.values.opening_time}
                  onChange={(newOpeningTime) => formik.setFieldValue("opening_time", newOpeningTime)}
                  viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock, seconds: renderTimeViewClock }}
                  slotProps={{
                    textField: {
                      error: !!formik.touched.opening_time && !!formik.errors.opening_time,
                      helperText: formik.touched.opening_time && formik.errors.opening_time
                    }
                  }}
                />
                <TimePicker
                  name="closing_time"
                  label="Closing time"
                  value={formik.values.closing_time}
                  onChange={(newClosingTime) => formik.setFieldValue("closing_time", newClosingTime)}
                  viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock, seconds: renderTimeViewClock }}
                  slotProps={{
                    textField: {
                      error: !!formik.touched.closing_time && !!formik.errors.closing_time,
                      helperText: formik.touched.closing_time && formik.errors.closing_time
                    }
                  }}
                  sx={{
                    gridColumnStart: 2,
                    gridColumnEnd: 3
                  }}
                />
              </LocalizationProvider>
            )}

            {formik.values.shifts !== "morning" && (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  name="eve_opening_time"
                  label="Evening Opening time"
                  format="hh:mm A"
                  value={formik.values.eve_opening_time}
                  onChange={(newOpeningTime) => formik.setFieldValue("eve_opening_time", newOpeningTime)}
                  viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock, seconds: renderTimeViewClock }}
                  slotProps={{
                    textField: {
                      error: !!formik.touched.eve_opening_time && !!formik.errors.eve_opening_time,
                      helperText: formik.touched.eve_opening_time && formik.errors.eve_opening_time
                    }
                  }}
                  sx={
                    formik.values.shifts !== "both"
                      ? null // If not "both", sx will not be applied
                      : {
                        gridRowStart: 1,
                        gridRowEnd: 2,
                        gridColumnStart: 3,
                        gridColumnEnd: 4
                      }
                  }
                />
                <TimePicker
                  name="eve_closing_time"
                  label="Evening Closing time"
                  value={formik.values.eve_closing_time}
                  onChange={(newClosingTime) => formik.setFieldValue("eve_closing_time", newClosingTime)}
                  viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock, seconds: renderTimeViewClock }}
                  slotProps={{
                    textField: {
                      error: !!formik.touched.eve_closing_time && !!formik.errors.eve_closing_time,
                      helperText: formik.touched.eve_closing_time && formik.errors.eve_closing_time
                    }
                  }}
                  sx={
                    formik.values.shifts !== "both"
                      ? {
                        gridColumnStart: 2,
                        gridColumnEnd: 3
                      }
                      : {
                        gridRowStart: 2,
                        gridRowEnd: 3,
                        gridColumnStart: 3,
                        gridColumnEnd: 4
                      }
                  }
                />
              </LocalizationProvider>
            )}
          </Box>
        </Box>
      </form>
    </Box>
  );
};

SchoolDurationFormComponent.propTypes = {
  onChange: PropTypes.func,
  refId: PropTypes.shape({
    current: PropTypes.any,
  }),
  setDirty: PropTypes.func,
  reset: PropTypes.bool,
  setReset: PropTypes.func,
  updatedValues: PropTypes.object
};

export default SchoolDurationFormComponent;
