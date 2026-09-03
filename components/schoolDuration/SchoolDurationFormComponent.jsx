/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { Clock, Layers, Users, Building, Sunset } from "lucide-react";

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

  const inputClass = (touched, error) => `w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all pl-11 ${
      touched && error 
      ? 'border-red-500 focus:ring-red-500/50' 
      : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/50'
  } text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500`;

  const timeInputClass = (touched, error) => `w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
      touched && error 
      ? 'border-red-500 focus:ring-red-500/50' 
      : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/50'
  } text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500`;

  const selectClass = (touched, error) => `w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
      touched && error 
      ? 'border-red-500 focus:ring-red-500/50' 
      : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/50'
  } text-slate-800 dark:text-slate-100`;

  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";
  const errorClass = "mt-1.5 text-sm text-red-500 font-medium";
  
  const fieldsetLegendClass = "flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100 mb-6";
  const fieldsetClass = "p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 mt-8";

  const handleTimeChange = (e, fieldName) => {
    const time = e.target.value;
    if (time) {
      const [hours, minutes] = time.split(':');
      const newTime = dayjs().hour(hours).minute(minutes).second(0);
      formik.setFieldValue(fieldName, newTime);
    } else {
      formik.setFieldValue(fieldName, null);
    }
  };

  const getTimeValue = (val) => {
    return val && dayjs(val).isValid() ? dayjs(val).format('HH:mm') : '';
  };

  return (
    <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 w-full animate-in slide-in-from-bottom-4 duration-500">
      
      <form ref={refId} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col">
              <label className={labelClass}>Batch*</label>
              <div className="relative">
                  <select
                      name="batch"
                      value={formik.values.batch}
                      onChange={formik.handleChange}
                      className={selectClass(formik.touched.batch, formik.errors.batch)}
                  >
                      <option value="" disabled>Select Batch</option>
                      <option value="junior">Junior</option>
                      <option value="senior">Senior</option>
                      <option value="both">Both</option>
                  </select>
              </div>
              {formik.touched.batch && formik.errors.batch && (
                  <p className={errorClass}>{formik.errors.batch}</p>
              )}
          </div>

          <div className="flex flex-col">
              <label className={labelClass}>Total Periods*</label>
              <div className="relative">
                  <Layers className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                      type="number"
                      name="period"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.period}
                      className={inputClass(formik.touched.period, formik.errors.period)}
                      placeholder="e.g., 8"
                  />
              </div>
              {formik.touched.period && formik.errors.period && (
                  <p className={errorClass}>{formik.errors.period}</p>
              )}
          </div>

          <div className="flex flex-col">
              <label className={labelClass}>Number of Halves*</label>
              <div className="relative">
                  <Layers className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                      type="number"
                      name="halves"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.halves}
                      className={inputClass(formik.touched.halves, formik.errors.halves)}
                      placeholder="e.g., 2"
                  />
              </div>
              {formik.touched.halves && formik.errors.halves && (
                  <p className={errorClass}>{formik.errors.halves}</p>
              )}
          </div>

          <div className="flex flex-col">
              <label className={labelClass}>Recess Duration (mins)*</label>
              <div className="relative">
                  <Clock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                      type="number"
                      name="recess_time"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.recess_time}
                      className={inputClass(formik.touched.recess_time, formik.errors.recess_time)}
                      placeholder="e.g., 30"
                  />
              </div>
              {formik.touched.recess_time && formik.errors.recess_time && (
                  <p className={errorClass}>{formik.errors.recess_time}</p>
              )}
          </div>

          <div className="flex flex-col md:col-span-2 lg:col-span-1">
              <label className={labelClass}>1st Half Period Length (mins)*</label>
              <div className="relative">
                  <Clock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                      type="number"
                      name="first_half_period_duration"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.first_half_period_duration}
                      className={inputClass(formik.touched.first_half_period_duration, formik.errors.first_half_period_duration)}
                      placeholder="e.g., 40"
                  />
              </div>
              {formik.touched.first_half_period_duration && formik.errors.first_half_period_duration && (
                  <p className={errorClass}>{formik.errors.first_half_period_duration}</p>
              )}
          </div>

          <div className="flex flex-col md:col-span-2 lg:col-span-1">
              <label className={labelClass}>2nd Half Period Length (mins)*</label>
              <div className="relative">
                  <Clock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                      type="number"
                      name="second_half_period_duration"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.second_half_period_duration}
                      className={inputClass(formik.touched.second_half_period_duration, formik.errors.second_half_period_duration)}
                      placeholder="e.g., 35"
                  />
              </div>
              {formik.touched.second_half_period_duration && formik.errors.second_half_period_duration && (
                  <p className={errorClass}>{formik.errors.second_half_period_duration}</p>
              )}
          </div>

          <div className="flex flex-col md:col-span-2 lg:col-span-1">
              <label className={labelClass}>Cutoff Time (mins)*</label>
              <div className="relative">
                  <Clock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                      type="number"
                      name="cutoff_time"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.cutoff_time}
                      className={inputClass(formik.touched.cutoff_time, formik.errors.cutoff_time)}
                      placeholder="e.g., 15"
                  />
              </div>
              {formik.touched.cutoff_time && formik.errors.cutoff_time && (
                  <p className={errorClass}>{formik.errors.cutoff_time}</p>
              )}
          </div>
        </div>

        <div className={fieldsetClass}>
            <h3 className={fieldsetLegendClass}>
                <Users className="w-6 h-6 text-blue-500" />
                Employee Timings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                    <label className={labelClass}>Employee Entry Time</label>
                    <input
                        type="time"
                        name="employee_entry_time"
                        value={getTimeValue(formik.values.employee_entry_time)}
                        onChange={(e) => handleTimeChange(e, "employee_entry_time")}
                        className={timeInputClass(formik.touched.employee_entry_time, formik.errors.employee_entry_time)}
                    />
                    {formik.touched.employee_entry_time && formik.errors.employee_entry_time && (
                        <p className={errorClass}>{formik.errors.employee_entry_time}</p>
                    )}
                </div>
                <div className="flex flex-col">
                    <label className={labelClass}>Employee Exit Time</label>
                    <input
                        type="time"
                        name="employee_exit_time"
                        value={getTimeValue(formik.values.employee_exit_time)}
                        onChange={(e) => handleTimeChange(e, "employee_exit_time")}
                        className={timeInputClass(formik.touched.employee_exit_time, formik.errors.employee_exit_time)}
                    />
                    {formik.touched.employee_exit_time && formik.errors.employee_exit_time && (
                        <p className={errorClass}>{formik.errors.employee_exit_time}</p>
                    )}
                </div>
            </div>
        </div>

        <div className={fieldsetClass}>
            <h3 className={fieldsetLegendClass}>
                <Building className="w-6 h-6 text-indigo-500" />
                School Timings & Shifts
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-col md:col-span-2 lg:col-span-3">
                    <label className={labelClass}>Shift Mode*</label>
                    <div className="relative max-w-sm">
                        <select
                            name="shifts"
                            value={formik.values.shifts}
                            onChange={formik.handleChange}
                            className={selectClass(formik.touched.shifts, formik.errors.shifts)}
                        >
                            <option value="morning">Morning Only</option>
                            <option value="evening">Evening Only</option>
                            <option value="both">Both Shifts</option>
                        </select>
                    </div>
                    {formik.touched.shifts && formik.errors.shifts && (
                        <p className={errorClass}>{formik.errors.shifts}</p>
                    )}
                </div>

                {formik.values.shifts !== "evening" && (
                    <>
                        <div className="flex flex-col">
                            <label className={labelClass}>Morning Opening Time</label>
                            <input
                                type="time"
                                name="opening_time"
                                value={getTimeValue(formik.values.opening_time)}
                                onChange={(e) => handleTimeChange(e, "opening_time")}
                                className={timeInputClass(formik.touched.opening_time, formik.errors.opening_time)}
                            />
                            {formik.touched.opening_time && formik.errors.opening_time && (
                                <p className={errorClass}>{formik.errors.opening_time}</p>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <label className={labelClass}>Morning Closing Time</label>
                            <input
                                type="time"
                                name="closing_time"
                                value={getTimeValue(formik.values.closing_time)}
                                onChange={(e) => handleTimeChange(e, "closing_time")}
                                className={timeInputClass(formik.touched.closing_time, formik.errors.closing_time)}
                            />
                            {formik.touched.closing_time && formik.errors.closing_time && (
                                <p className={errorClass}>{formik.errors.closing_time}</p>
                            )}
                        </div>
                        <div className="hidden lg:block"></div>
                    </>
                )}

                {formik.values.shifts !== "morning" && (
                    <>
                        <div className="flex flex-col">
                            <label className={labelClass}>Evening Opening Time</label>
                            <input
                                type="time"
                                name="eve_opening_time"
                                value={getTimeValue(formik.values.eve_opening_time)}
                                onChange={(e) => handleTimeChange(e, "eve_opening_time")}
                                className={timeInputClass(formik.touched.eve_opening_time, formik.errors.eve_opening_time)}
                            />
                            {formik.touched.eve_opening_time && formik.errors.eve_opening_time && (
                                <p className={errorClass}>{formik.errors.eve_opening_time}</p>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <label className={labelClass}>Evening Closing Time</label>
                            <input
                                type="time"
                                name="eve_closing_time"
                                value={getTimeValue(formik.values.eve_closing_time)}
                                onChange={(e) => handleTimeChange(e, "eve_closing_time")}
                                className={timeInputClass(formik.touched.eve_closing_time, formik.errors.eve_closing_time)}
                            />
                            {formik.touched.eve_closing_time && formik.errors.eve_closing_time && (
                                <p className={errorClass}>{formik.errors.eve_closing_time}</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>

      </form>
    </div>
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
