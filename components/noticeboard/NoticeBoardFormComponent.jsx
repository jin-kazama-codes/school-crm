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

    // Format date for native date input (YYYY-MM-DD)
    const formatDateForInput = (dateValue) => {
        if (!dateValue) return "";
        return dayjs(dateValue).format('YYYY-MM-DD');
    };

    const handleDateChange = (field, e) => {
        // Formik was originally storing whatever Dayjs/date object MUI DatePicker gave it.
        // We'll store it as a dayjs object to maintain compatibility with existing logic if any.
        const val = e.target.value;
        formik.setFieldValue(field, val ? dayjs(val) : "");
    };

    return (
        <div className="p-6">
            <form ref={refId} onSubmit={formik.handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* Title */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Title
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

                    {/* Publish Date */}
                    <div className="col-span-1 lg:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Publish Date
                        </label>
                        <input
                            type="date"
                            name="publish_date"
                            onBlur={formik.handleBlur}
                            onChange={(e) => handleDateChange("publish_date", e)}
                            value={formatDateForInput(formik.values.publish_date)}
                            className={`w-full px-4 py-2 bg-white dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-slate-700 dark:text-slate-300 ${
                                formik.touched.publish_date && formik.errors.publish_date 
                                ? 'border-red-500 focus:ring-red-500/50' 
                                : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500/50'
                            }`}
                        />
                        {formik.touched.publish_date && formik.errors.publish_date && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.publish_date}</p>
                        )}
                    </div>

                    {/* Expiry Date */}
                    <div className="col-span-1 lg:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Expiry Date
                        </label>
                        <input
                            type="date"
                            name="expiry_date"
                            onBlur={formik.handleBlur}
                            onChange={(e) => handleDateChange("expiry_date", e)}
                            value={formatDateForInput(formik.values.expiry_date)}
                            className={`w-full px-4 py-2 bg-white dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-slate-700 dark:text-slate-300 ${
                                formik.touched.expiry_date && formik.errors.expiry_date 
                                ? 'border-red-500 focus:ring-red-500/50' 
                                : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500/50'
                            }`}
                        />
                        {formik.touched.expiry_date && formik.errors.expiry_date && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.expiry_date}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div className="col-span-1 lg:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Status
                        </label>
                        <select
                            name="status"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.status}
                            className={`w-full px-4 py-2 bg-white dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-slate-700 dark:text-slate-300 ${
                                formik.touched.status && formik.errors.status 
                                ? 'border-red-500 focus:ring-red-500/50' 
                                : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500/50'
                            }`}
                        >
                            <option value="" disabled>Select Status</option>
                            {Object.keys(config.status).map(item => (
                                <option key={item} value={item}>
                                    {config.status[item]}
                                </option>
                            ))}
                        </select>
                        {formik.touched.status && formik.errors.status && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.status}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            autoComplete="new-description"
                            rows="4"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.description}
                            className={`w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-y ${
                                formik.touched.description && formik.errors.description 
                                ? 'border-red-500 focus:ring-red-500/50' 
                                : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500/50'
                            }`}
                        />
                        {formik.touched.description && formik.errors.description && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.description}</p>
                        )}
                    </div>

                </div>
            </form>
        </div>
    );
};

NoticeBoardFormComponent.propTypes = {
    onChange: PropTypes.func.isRequired,
    refId: PropTypes.any.isRequired,
    setDirty: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    setReset: PropTypes.func.isRequired,
    updatedValues: PropTypes.object
};

export default NoticeBoardFormComponent;
