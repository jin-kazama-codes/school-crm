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
import dayjs from "dayjs";
import { useFormik } from "formik";
import { Clock, Layers, Users, Building, ChevronDown } from "lucide-react";

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
        // Bug #13 fix: formik.isSubmitting is already false by the time onSubmit fires.
        // Check errors directly — inside onSubmit the form is definitively submitted.
        validated: Object.keys(formik.errors).length === 0
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

  const inputClass = (field) =>
    `w-full px-3.5 py-2.5 bg-white dark:bg-[#121212] border rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:outline-none focus:ring-2 transition-all ${
      formik.touched[field] && formik.errors[field]
        ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
        : "border-slate-300 dark:border-[#333] focus:ring-emerald-500/20 focus:border-emerald-500"
    }`;

  const selectClass = (field) =>
    `w-full px-3.5 py-2.5 bg-white dark:bg-[#121212] border rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:outline-none focus:ring-2 transition-all cursor-pointer appearance-none ${
      formik.touched[field] && formik.errors[field]
        ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
        : "border-slate-300 dark:border-[#333] focus:ring-emerald-500/20 focus:border-emerald-500"
    }`;

  const handleTimeChange = (e, fieldName) => {
    const time = e.target.value;
    if (time) {
      const [hours, minutes] = time.split(':');
      const newTime = dayjs().hour(parseInt(hours, 10)).minute(parseInt(minutes, 10)).second(0);
      formik.setFieldValue(fieldName, newTime);
    } else {
      formik.setFieldValue(fieldName, null);
    }
  };

  const getTimeValue = (val) => {
    return val && dayjs(val).isValid() ? dayjs(val).format('HH:mm') : '';
  };

  return (
    <form ref={refId} onSubmit={formik.handleSubmit}>
      {/* Main Engraved Card Container */}
      <div className="bg-white/95 dark:bg-[#161616]/90 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-slate-200/90 dark:border-[#282828] shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] space-y-6">
        
        {/* Section 1: Period & Batch Structure */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-[#222]">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Period & Batch Structure
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Define session batch, period counts, halves, and recess intervals
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Batch */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Batch <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="batch"
                  value={formik.values.batch}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  className={selectClass("batch")}
                >
                  <option value="" className="bg-white dark:bg-[#161616]" disabled>Select Batch</option>
                  <option value="junior" className="bg-white dark:bg-[#161616]">Junior</option>
                  <option value="senior" className="bg-white dark:bg-[#161616]">Senior</option>
                  <option value="both" className="bg-white dark:bg-[#161616]">Both</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {formik.touched.batch && formik.errors.batch && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.batch}</p>
              )}
            </div>

            {/* Total Periods */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Total Periods <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="period"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.period}
                placeholder="e.g., 8"
                className={inputClass("period")}
              />
              {formik.touched.period && formik.errors.period && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.period}</p>
              )}
            </div>

            {/* Number of Halves */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Number of Halves <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="halves"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.halves}
                placeholder="e.g., 2"
                className={inputClass("halves")}
              />
              {formik.touched.halves && formik.errors.halves && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.halves}</p>
              )}
            </div>

            {/* Recess Duration */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Recess Duration (mins) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="recess_time"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.recess_time}
                placeholder="e.g., 30"
                className={inputClass("recess_time")}
              />
              {formik.touched.recess_time && formik.errors.recess_time && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.recess_time}</p>
              )}
            </div>

            {/* 1st Half Period Duration */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                1st Half Period (mins) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="first_half_period_duration"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.first_half_period_duration}
                placeholder="e.g., 40"
                className={inputClass("first_half_period_duration")}
              />
              {formik.touched.first_half_period_duration && formik.errors.first_half_period_duration && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.first_half_period_duration}</p>
              )}
            </div>

            {/* 2nd Half Period Duration */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                2nd Half Period (mins) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="second_half_period_duration"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.second_half_period_duration}
                placeholder="e.g., 35"
                className={inputClass("second_half_period_duration")}
              />
              {formik.touched.second_half_period_duration && formik.errors.second_half_period_duration && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.second_half_period_duration}</p>
              )}
            </div>

            {/* Cutoff Time */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Cutoff Time (mins)
              </label>
              <input
                type="number"
                name="cutoff_time"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.cutoff_time}
                placeholder="e.g., 15"
                className={inputClass("cutoff_time")}
              />
              {formik.touched.cutoff_time && formik.errors.cutoff_time && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.cutoff_time}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Employee Timings */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-[#222]">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Employee Timings
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Staff check-in and check-out schedule
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Employee Entry Time */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Employee Entry Time
              </label>
              <input
                type="time"
                name="employee_entry_time"
                value={getTimeValue(formik.values.employee_entry_time)}
                onChange={(e) => handleTimeChange(e, "employee_entry_time")}
                onBlur={formik.handleBlur}
                className={inputClass("employee_entry_time")}
              />
              {formik.touched.employee_entry_time && formik.errors.employee_entry_time && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.employee_entry_time}</p>
              )}
            </div>

            {/* Employee Exit Time */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Employee Exit Time
              </label>
              <input
                type="time"
                name="employee_exit_time"
                value={getTimeValue(formik.values.employee_exit_time)}
                onChange={(e) => handleTimeChange(e, "employee_exit_time")}
                onBlur={formik.handleBlur}
                className={inputClass("employee_exit_time")}
              />
              {formik.touched.employee_exit_time && formik.errors.employee_exit_time && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.employee_exit_time}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: School Timings & Shifts */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-[#222]">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                School Timings & Shifts
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Configure morning/evening shift bells and school hours
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Shift Mode */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Shift Mode <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="shifts"
                  value={formik.values.shifts}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  className={selectClass("shifts")}
                >
                  <option value="morning" className="bg-white dark:bg-[#161616]">Morning Only</option>
                  <option value="evening" className="bg-white dark:bg-[#161616]">Evening Only</option>
                  <option value="both" className="bg-white dark:bg-[#161616]">Both Shifts</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {formik.touched.shifts && formik.errors.shifts && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.shifts}</p>
              )}
            </div>

            {/* Morning Opening Time */}
            {formik.values.shifts !== "evening" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Morning Opening Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  name="opening_time"
                  value={getTimeValue(formik.values.opening_time)}
                  onChange={(e) => handleTimeChange(e, "opening_time")}
                  onBlur={formik.handleBlur}
                  className={inputClass("opening_time")}
                />
                {formik.touched.opening_time && formik.errors.opening_time && (
                  <p className="text-xs text-rose-500 font-medium">{formik.errors.opening_time}</p>
                )}
              </div>
            )}

            {/* Morning Closing Time */}
            {formik.values.shifts !== "evening" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Morning Closing Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  name="closing_time"
                  value={getTimeValue(formik.values.closing_time)}
                  onChange={(e) => handleTimeChange(e, "closing_time")}
                  onBlur={formik.handleBlur}
                  className={inputClass("closing_time")}
                />
                {formik.touched.closing_time && formik.errors.closing_time && (
                  <p className="text-xs text-rose-500 font-medium">{formik.errors.closing_time}</p>
                )}
              </div>
            )}

            {/* Evening Opening Time */}
            {formik.values.shifts !== "morning" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Evening Opening Time
                </label>
                <input
                  type="time"
                  name="eve_opening_time"
                  value={getTimeValue(formik.values.eve_opening_time)}
                  onChange={(e) => handleTimeChange(e, "eve_opening_time")}
                  onBlur={formik.handleBlur}
                  className={inputClass("eve_opening_time")}
                />
                {formik.touched.eve_opening_time && formik.errors.eve_opening_time && (
                  <p className="text-xs text-rose-500 font-medium">{formik.errors.eve_opening_time}</p>
                )}
              </div>
            )}

            {/* Evening Closing Time */}
            {formik.values.shifts !== "morning" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Evening Closing Time
                </label>
                <input
                  type="time"
                  name="eve_closing_time"
                  value={getTimeValue(formik.values.eve_closing_time)}
                  onChange={(e) => handleTimeChange(e, "eve_closing_time")}
                  onBlur={formik.handleBlur}
                  className={inputClass("eve_closing_time")}
                />
                {formik.touched.eve_closing_time && formik.errors.eve_closing_time && (
                  <p className="text-xs text-rose-500 font-medium">{formik.errors.eve_closing_time}</p>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </form>
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
