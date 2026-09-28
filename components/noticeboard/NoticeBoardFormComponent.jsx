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
import { useFormik } from "formik";
import dayjs from "dayjs";
import { ChevronDown } from "lucide-react";

import noticeBoardValidation from "./Validation";
import config from "../config";

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
                // Bug #13 fix: formik.isSubmitting is false by the time onSubmit fires.
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

    // Format date for native date input (YYYY-MM-DD)
    const formatDateForInput = (dateValue) => {
        if (!dateValue) return "";
        try {
            const d = dayjs(dateValue);
            return d.isValid() ? d.format('YYYY-MM-DD') : "";
        } catch {
            return "";
        }
    };

    const handleDateChange = (field, e) => {
        const val = e.target.value;
        formik.setFieldValue(field, val ? dayjs(val) : "");
    };

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

    return (
        <form ref={refId} onSubmit={formik.handleSubmit}>
            {/* Engraved Card Container */}
            <div className="bg-white/95 dark:bg-[#161616]/90 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-slate-200/90 dark:border-[#282828] shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    
                    {/* Title */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-4 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Notice Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            autoComplete="off"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.title}
                            placeholder="e.g., Annual Sports Meet 2026 Schedule & Guidelines"
                            className={inputClass("title")}
                        />
                        {formik.touched.title && formik.errors.title && (
                            <p className="text-xs text-rose-500 font-medium">{formik.errors.title}</p>
                        )}
                    </div>

                    {/* Publish Date */}
                    <div className="col-span-1 lg:col-span-1 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Publish Date
                        </label>
                        <input
                            type="date"
                            name="publish_date"
                            onBlur={formik.handleBlur}
                            onChange={(e) => handleDateChange("publish_date", e)}
                            value={formatDateForInput(formik.values.publish_date)}
                            className={inputClass("publish_date")}
                        />
                        {formik.touched.publish_date && formik.errors.publish_date && (
                            <p className="text-xs text-rose-500 font-medium">{formik.errors.publish_date}</p>
                        )}
                    </div>

                    {/* Expiry Date */}
                    <div className="col-span-1 lg:col-span-1 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Expiry Date
                        </label>
                        <input
                            type="date"
                            name="expiry_date"
                            onBlur={formik.handleBlur}
                            onChange={(e) => handleDateChange("expiry_date", e)}
                            value={formatDateForInput(formik.values.expiry_date)}
                            className={inputClass("expiry_date")}
                        />
                        {formik.touched.expiry_date && formik.errors.expiry_date && (
                            <p className="text-xs text-rose-500 font-medium">{formik.errors.expiry_date}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div className="col-span-1 lg:col-span-2 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Notice Status
                        </label>
                        <div className="relative">
                            <select
                                name="status"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.status}
                                className={selectClass("status")}
                            >
                                {Object.keys(config.status).map(item => (
                                    <option key={item} value={item} className="bg-white dark:bg-[#161616]">
                                        {config.status[item]}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.status && formik.errors.status && (
                            <p className="text-xs text-rose-500 font-medium">{formik.errors.status}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-4 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Notice Description & Details
                        </label>
                        <textarea
                            name="description"
                            autoComplete="off"
                            rows={5}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.description}
                            placeholder="Provide comprehensive details, instructions, venue details or announcement text..."
                            className={`${inputClass("description")} resize-y custom-scrollbar`}
                        />
                        {formik.touched.description && formik.errors.description && (
                            <p className="text-xs text-rose-500 font-medium">{formik.errors.description}</p>
                        )}
                    </div>

                </div>
            </div>
        </form>
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
