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

import employeeValidation from "./Validation";
import config from '../config';

const initialValues = {
    firstname: "",
    lastname: "",
    email: "",
    contact_no: "",
    role: "",
    dob: null,
    gender: "",
    status: "active"
};

const EmployeeFormComponent = ({
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
        validationSchema: employeeValidation,
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
                    : false,
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

    const inputClass = (fieldName) => `w-full px-4 py-2 bg-white dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
        formik.touched[fieldName] && formik.errors[fieldName] 
        ? 'border-red-500 focus:ring-red-500/50' 
        : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500/50'
    } text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500`;
    
    const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
    const errorClass = "mt-1 text-sm text-red-500";

    return (
        <div className="p-6">
            <form ref={refId} onSubmit={formik.handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    <div className="col-span-1 md:col-span-1 lg:col-span-2">
                        <label className={labelClass}>Firstname*</label>
                        <input
                            type="text"
                            name="firstname"
                            autoComplete="new-firstname"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.firstname}
                            className={inputClass("firstname")}
                        />
                        {formik.touched.firstname && formik.errors.firstname && <p className={errorClass}>{formik.errors.firstname}</p>}
                    </div>

                    <div className="col-span-1 md:col-span-1 lg:col-span-2">
                        <label className={labelClass}>Lastname*</label>
                        <input
                            type="text"
                            name="lastname"
                            autoComplete="new-lastname"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.lastname}
                            className={inputClass("lastname")}
                        />
                        {formik.touched.lastname && formik.errors.lastname && <p className={errorClass}>{formik.errors.lastname}</p>}
                    </div>

                    <div className="col-span-1 lg:col-span-2">
                        <label className={labelClass}>Email</label>
                        <input
                            type="email"
                            name="email"
                            autoComplete="new-email"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.email}
                            className={inputClass("email")}
                        />
                        {formik.touched.email && formik.errors.email && <p className={errorClass}>{formik.errors.email}</p>}
                    </div>

                    <div className="col-span-1 lg:col-span-2">
                        <label className={labelClass}>Contact Number*</label>
                        <input
                            type="text"
                            name="contact_no"
                            autoComplete="new-contact"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.contact_no}
                            className={inputClass("contact_no")}
                        />
                        {formik.touched.contact_no && formik.errors.contact_no && <p className={errorClass}>{formik.errors.contact_no}</p>}
                    </div>

                    <div className="col-span-1 lg:col-span-2">
                        <label className={labelClass}>Role</label>
                        <input
                            type="text"
                            name="role"
                            autoComplete="new-role"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.role}
                            className={inputClass("role")}
                        />
                        {formik.touched.role && formik.errors.role && <p className={errorClass}>{formik.errors.role}</p>}
                    </div>

                    <div className="col-span-1 lg:col-span-2">
                        <label className={labelClass}>Date Of Birth*</label>
                        <input
                            type="date"
                            name="dob"
                            onBlur={formik.handleBlur}
                            onChange={(e) => handleDateChange("dob", e)}
                            value={formatDateForInput(formik.values.dob)}
                            className={inputClass("dob")}
                            required
                        />
                        {formik.touched.dob && formik.errors.dob && <p className={errorClass}>{formik.errors.dob}</p>}
                    </div>

                    <div className="col-span-1 lg:col-span-2">
                        <label className={labelClass}>Gender</label>
                        <select
                            name="gender"
                            value={formik.values.gender}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={inputClass("gender")}
                        >
                            <option value="" disabled>Select Gender</option>
                            {Object.keys(config.gender).map(item => (
                                <option key={item} value={item}>{config.gender[item]}</option>
                            ))}
                        </select>
                        {formik.touched.gender && formik.errors.gender && <p className={errorClass}>{formik.errors.gender}</p>}
                    </div>

                    <div className="col-span-1 lg:col-span-2">
                        <label className={labelClass}>Status</label>
                        <select
                            name="status"
                            value={formik.values.status}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={inputClass("status")}
                        >
                            {Object.keys(config.status).map(item => (
                                <option key={item} value={item}>{config.status[item]}</option>
                            ))}
                        </select>
                        {formik.touched.status && formik.errors.status && <p className={errorClass}>{formik.errors.status}</p>}
                    </div>

                </div>
            </form >
        </div>
    );
}

EmployeeFormComponent.propTypes = {
    onChange: PropTypes.func.isRequired,
    refId: PropTypes.any.isRequired, 
    setDirty: PropTypes.func.isRequired,
    reset: PropTypes.bool.isRequired,
    setReset: PropTypes.func.isRequired,
    updatedValues: PropTypes.object  
};

export default EmployeeFormComponent;
