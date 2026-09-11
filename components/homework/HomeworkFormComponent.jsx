/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import { useSelector } from "react-redux";

import config from "../config";
import homeworkValidation from "./Validation";

const initialValues = {
    title: "",
    description: "",
    class_id: "",
    section_id: "",
    subject_id: "",
    status: "active",
};

const HomeworkFormComponent = ({
    onChange,
    refId,
    setDirty,
    reset,
    setReset,
    updatedValues = null,
}) => {
    const [initialState, setInitialState] = useState(initialValues);

    // Pull class, section, subject options from Redux store (shared with rest of app)
    const allClasses   = useSelector(state => state.allClasses?.listData?.rows || []);
    const allSections  = useSelector(state => state.allSections?.listData?.rows || []);
    const allSubjects  = useSelector(state => state.allSubjects?.listData?.rows || []);

    const formik = useFormik({
        initialValues: initialState,
        validationSchema: homeworkValidation,
        enableReinitialize: true,
        onSubmit: () => watchForm(),
    });

    React.useImperativeHandle(refId, () => ({
        Submit: async () => {
            await formik.submitForm();
        },
    }));

    const watchForm = () => {
        if (onChange) {
            onChange({
                values: formik.values,
                validated:
                    formik.isSubmitting
                        ? Object.keys(formik.errors).length === 0
                        : false,
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
        if (formik.dirty) setDirty(true);
    }, [formik.dirty]);

    useEffect(() => {
        if (updatedValues) setInitialState(updatedValues);
    }, [updatedValues]);

    const fieldClass = (field) =>
        `w-full px-4 py-2 bg-white dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-slate-700 dark:text-slate-300 ${
            formik.touched[field] && formik.errors[field]
                ? "border-red-500 focus:ring-red-500/50"
                : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500/50"
        }`;

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
                            autoComplete="off"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.title}
                            className={fieldClass("title")}
                        />
                        {formik.touched.title && formik.errors.title && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.title}</p>
                        )}
                    </div>

                    {/* Class */}
                    <div className="col-span-1 lg:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Class *
                        </label>
                        <select
                            name="class_id"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.class_id}
                            className={fieldClass("class_id")}
                        >
                            <option value="">Select Class</option>
                            {allClasses.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                        {formik.touched.class_id && formik.errors.class_id && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.class_id}</p>
                        )}
                    </div>

                    {/* Section */}
                    <div className="col-span-1 lg:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Section *
                        </label>
                        <select
                            name="section_id"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.section_id}
                            className={fieldClass("section_id")}
                        >
                            <option value="">Select Section</option>
                            {allSections.map(sec => (
                                <option key={sec.id} value={sec.id}>{sec.name}</option>
                            ))}
                        </select>
                        {formik.touched.section_id && formik.errors.section_id && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.section_id}</p>
                        )}
                    </div>

                    {/* Subject */}
                    <div className="col-span-1 lg:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Subject *
                        </label>
                        <select
                            name="subject_id"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.subject_id}
                            className={fieldClass("subject_id")}
                        >
                            <option value="">Select Subject</option>
                            {allSubjects.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                        </select>
                        {formik.touched.subject_id && formik.errors.subject_id && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.subject_id}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div className="col-span-1 lg:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Status
                        </label>
                        <select
                            name="status"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.status}
                            className={fieldClass("status")}
                        >
                            {Object.keys(config.status).map(item => (
                                <option key={item} value={item}>{config.status[item]}</option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            rows="4"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.description}
                            className={`${fieldClass("description")} resize-y`}
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

HomeworkFormComponent.propTypes = {
    onChange: PropTypes.func,
    refId: PropTypes.shape({ current: PropTypes.any }),
    setDirty: PropTypes.func,
    reset: PropTypes.bool,
    setReset: PropTypes.func,
    updatedValues: PropTypes.object,
};

export default HomeworkFormComponent;
