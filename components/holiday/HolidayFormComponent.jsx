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
import { useFormik } from "formik";
import dayjs from "dayjs";

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

    const formatDateForInput = (dateValue) => {
        if (!dateValue) return "";
        return dayjs(dateValue).format('YYYY-MM-DD');
    };

    const handleDateChange = (field, e) => {
        const val = e.target.value;
        formik.setFieldValue(field, val ? dayjs(val) : null);
    };

    return (
        <div className="p-6">
            <form ref={refId} onSubmit={formik.handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* Title */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            autoComplete="new-title"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.title}
                            className={`w-full px-4 py-2 bg-white dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                formik.touched.title && formik.errors.title 
                                ? 'border-red-500 focus:ring-red-500/50' 
                                : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500/50'
                            }`}
                        />
                        {formik.touched.title && formik.errors.title && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.title}</p>
                        )}
                    </div>

                    {/* Start Date (Closing Date) */}
                    <div className="col-span-1 lg:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Closing Date
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            onBlur={formik.handleBlur}
                            onChange={(e) => handleDateChange("startDate", e)}
                            value={formatDateForInput(formik.values.startDate)}
                            className={`w-full px-4 py-2 bg-white dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-slate-700 dark:text-slate-300 ${
                                formik.touched.startDate && formik.errors.startDate 
                                ? 'border-red-500 focus:ring-red-500/50' 
                                : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500/50'
                            }`}
                        />
                        {formik.touched.startDate && formik.errors.startDate && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.startDate}</p>
                        )}
                    </div>

                    {/* End Date (Opening Date) */}
                    <div className="col-span-1 lg:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Opening Date
                        </label>
                        <input
                            type="date"
                            name="endDate"
                            onBlur={formik.handleBlur}
                            onChange={(e) => handleDateChange("endDate", e)}
                            value={formatDateForInput(formik.values.endDate)}
                            className={`w-full px-4 py-2 bg-white dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-slate-700 dark:text-slate-300 ${
                                formik.touched.endDate && formik.errors.endDate 
                                ? 'border-red-500 focus:ring-red-500/50' 
                                : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500/50'
                            }`}
                        />
                        {formik.touched.endDate && formik.errors.endDate && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.endDate}</p>
                        )}
                    </div>

                    {/* Holiday Type */}
                    <div className="col-span-1 lg:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Holiday Type
                        </label>
                        <select
                            name="holiday_type"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.holiday_type || formik.values.type}
                            className={`w-full px-4 py-2 bg-white dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-slate-700 dark:text-slate-300 ${
                                formik.touched.holiday_type && formik.errors.holiday_type 
                                ? 'border-red-500 focus:ring-red-500/50' 
                                : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500/50'
                            }`}
                        >
                            <option value="" disabled>Select Type</option>
                            {Object.keys(config.holiday_type).map(item => (
                                <option key={item} value={item}>
                                    {config.holiday_type[item]}
                                </option>
                            ))}
                        </select>
                        {formik.touched.holiday_type && formik.errors.holiday_type && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.holiday_type}</p>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Note
                        </label>
                        <textarea
                            name="notes"
                            autoComplete="new-notes"
                            rows="3"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.notes}
                            className={`w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-y ${
                                formik.touched.notes && formik.errors.notes 
                                ? 'border-red-500 focus:ring-red-500/50' 
                                : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500/50'
                            }`}
                        />
                        {formik.touched.notes && formik.errors.notes && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.notes}</p>
                        )}
                    </div>

                </div>
            </form>
        </div>
    );
};

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
