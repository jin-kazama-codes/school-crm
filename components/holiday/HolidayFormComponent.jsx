/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { useFormik } from "formik";
import dayjs from "dayjs";
import { ChevronDown } from "lucide-react";

import config from "../config";
import holidayValidation from "./Validation";

const initialValues = {
    title: "",
    startDate: "",
    endDate: "",
    type: "school_closure",
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
                validated: Object.keys(formik.errors).length === 0,
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
            const formatted = {
                ...updatedValues,
                startDate: updatedValues.startDate ? dayjs(updatedValues.startDate).format('YYYY-MM-DD') : "",
                endDate: updatedValues.endDate ? dayjs(updatedValues.endDate).format('YYYY-MM-DD') : "",
                type: updatedValues.type || updatedValues.holiday_type || "school_closure",
                notes: updatedValues.notes || ""
            };
            setInitialState(formatted);
        }
    }, [updatedValues]);

    const handleDateChange = (field, e) => {
        const val = e.target.value;
        formik.setFieldValue(field, val || "");
    };

    const inputClasses =
        "w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2e2e2e] rounded-xl shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:ring-2 focus:ring-rose-500/20 dark:focus:ring-rose-400/20 focus:border-rose-500 dark:focus:border-rose-400 transition-all outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500";

    const selectClasses =
        "w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2e2e2e] rounded-xl shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:ring-2 focus:ring-rose-500/20 dark:focus:ring-rose-400/20 focus:border-rose-500 dark:focus:border-rose-400 transition-all outline-none text-slate-900 dark:text-slate-100 cursor-pointer appearance-none";

    const labelClasses =
        "block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5";

    const errorClasses = "text-rose-500 text-xs mt-1 ml-0.5 font-medium";

    return (
        <form ref={refId} onSubmit={formik.handleSubmit} className="space-y-6">
            
            {/* ── CARD: Holiday Details ─────────────────────────────────────────── */}
            <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#222]">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        Holiday Information & Schedule
                    </h3>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        Closure duration, event classification & notes
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    
                    {/* Title */}
                    <div className="lg:col-span-4">
                        <label className={labelClasses}>Title *</label>
                        <input
                            type="text"
                            name="title"
                            placeholder="e.g. Diwali Break, Winter Vacation, Independence Day"
                            autoComplete="new-title"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.title}
                            className={`${inputClasses} ${
                                formik.touched.title && formik.errors.title
                                    ? "border-rose-400 ring-1 ring-rose-400"
                                    : ""
                            }`}
                        />
                        {formik.touched.title && formik.errors.title && (
                            <p className={errorClasses}>{formik.errors.title}</p>
                        )}
                    </div>

                    {/* Closing Date (Start Date) */}
                    <div className="lg:col-span-1">
                        <label className={labelClasses}>From (Start Date) *</label>
                        <input
                            type="date"
                            name="startDate"
                            onBlur={formik.handleBlur}
                            onChange={(e) => handleDateChange("startDate", e)}
                            value={formik.values.startDate || ""}
                            className={`${inputClasses} ${
                                formik.touched.startDate && formik.errors.startDate
                                    ? "border-rose-400 ring-1 ring-rose-400"
                                    : ""
                            }`}
                        />
                        {formik.touched.startDate && formik.errors.startDate && (
                            <p className={errorClasses}>{formik.errors.startDate}</p>
                        )}
                    </div>

                    {/* Opening Date (End Date) */}
                    <div className="lg:col-span-1">
                        <label className={labelClasses}>To (End Date) *</label>
                        <input
                            type="date"
                            name="endDate"
                            onBlur={formik.handleBlur}
                            onChange={(e) => handleDateChange("endDate", e)}
                            value={formik.values.endDate || ""}
                            className={`${inputClasses} ${
                                formik.touched.endDate && formik.errors.endDate
                                    ? "border-rose-400 ring-1 ring-rose-400"
                                    : ""
                            }`}
                        />
                        {formik.touched.endDate && formik.errors.endDate && (
                            <p className={errorClasses}>{formik.errors.endDate}</p>
                        )}
                    </div>

                    {/* Holiday Type */}
                    <div className="lg:col-span-2">
                        <label className={labelClasses}>Holiday Type *</label>
                        <div className="relative">
                            <select
                                name="type"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.type || formik.values.holiday_type || "school_closure"}
                                className={`${selectClasses} pr-9 ${
                                    formik.touched.type && formik.errors.type
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                            >
                                <option value="" disabled>Select Type</option>
                                {Object.keys(config.holiday_type || {}).map(item => (
                                    <option key={item} value={item}>
                                        {config.holiday_type[item]}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.type && formik.errors.type && (
                            <p className={errorClasses}>{formik.errors.type}</p>
                        )}
                    </div>

                    {/* Note */}
                    <div className="lg:col-span-4">
                        <label className={labelClasses}>Note / Instructions</label>
                        <textarea
                            name="notes"
                            placeholder="Add any additional remarks, instructions, or exceptions regarding this holiday..."
                            autoComplete="new-notes"
                            rows="3"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.notes || ""}
                            className={`${inputClasses} resize-y min-h-[90px] ${
                                formik.touched.notes && formik.errors.notes
                                    ? "border-rose-400 ring-1 ring-rose-400"
                                    : ""
                            }`}
                        />
                        {formik.touched.notes && formik.errors.notes && (
                            <p className={errorClasses}>{formik.errors.notes}</p>
                        )}
                    </div>

                </div>
            </div>
        </form>
    );
};

HolidayFormComponent.propTypes = {
    onChange: PropTypes.func,
    refId: PropTypes.shape({
        current: PropTypes.any
    }),
    setDirty: PropTypes.func,
    reset: PropTypes.bool,
    setReset: PropTypes.func,
    updatedValues: PropTypes.object
};

export default HolidayFormComponent;
