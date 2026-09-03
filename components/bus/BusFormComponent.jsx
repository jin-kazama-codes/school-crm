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
import { Bus, User, Phone, FileText, IdCard, Map } from "lucide-react";

import BusValidation from "./Validation";
import config from "../config"

const initialValues = {
    registration_no: "",
    driver: "",
    driver_contact: "",
    driver_license: "",
    conductor: "",
    conductor_contact: "",
    conductor_aadhaar: "",
    route: "",
    status: "active"
};

const BusFormComponent = ({
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
        validationSchema: BusValidation,
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
    }

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

    const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";
    const errorClass = "mt-1.5 text-sm text-red-500 font-medium";

    return (
        <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 w-full animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Bus className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Bus Details</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Basic vehicle and crew information</p>
                </div>
            </div>

            <form ref={refId} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
                
                <div className="flex flex-col md:col-span-2">
                    <label className={labelClass}>Registration Number*</label>
                    <div className="relative">
                        <Bus className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            name="registration_no"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.registration_no}
                            className={inputClass(formik.touched.registration_no, formik.errors.registration_no)}
                            placeholder="e.g., UP-32-AB-1234"
                        />
                    </div>
                    {formik.touched.registration_no && formik.errors.registration_no && (
                        <p className={errorClass}>{formik.errors.registration_no}</p>
                    )}
                </div>

                <div className="flex flex-col md:col-span-2">
                    <label className={labelClass}>Route*</label>
                    <div className="relative">
                        <Map className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            name="route"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.route}
                            className={inputClass(formik.touched.route, formik.errors.route)}
                            placeholder="e.g., City Center to Campus"
                        />
                    </div>
                    {formik.touched.route && formik.errors.route && (
                        <p className={errorClass}>{formik.errors.route}</p>
                    )}
                </div>

                <div className="flex flex-col md:col-span-2">
                    <label className={labelClass}>Driver Name*</label>
                    <div className="relative">
                        <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            name="driver"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.driver}
                            className={inputClass(formik.touched.driver, formik.errors.driver)}
                            placeholder="Driver full name"
                        />
                    </div>
                    {formik.touched.driver && formik.errors.driver && (
                        <p className={errorClass}>{formik.errors.driver}</p>
                    )}
                </div>

                <div className="flex flex-col">
                    <label className={labelClass}>Driver Contact*</label>
                    <div className="relative">
                        <Phone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            name="driver_contact"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.driver_contact}
                            className={inputClass(formik.touched.driver_contact, formik.errors.driver_contact)}
                            placeholder="+91..."
                        />
                    </div>
                    {formik.touched.driver_contact && formik.errors.driver_contact && (
                        <p className={errorClass}>{formik.errors.driver_contact}</p>
                    )}
                </div>

                <div className="flex flex-col">
                    <label className={labelClass}>Driver License*</label>
                    <div className="relative">
                        <FileText className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            name="driver_license"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.driver_license}
                            className={inputClass(formik.touched.driver_license, formik.errors.driver_license)}
                            placeholder="License ID"
                        />
                    </div>
                    {formik.touched.driver_license && formik.errors.driver_license && (
                        <p className={errorClass}>{formik.errors.driver_license}</p>
                    )}
                </div>

                <div className="flex flex-col md:col-span-2">
                    <label className={labelClass}>Conductor Name*</label>
                    <div className="relative">
                        <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            name="conductor"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.conductor}
                            className={inputClass(formik.touched.conductor, formik.errors.conductor)}
                            placeholder="Conductor full name"
                        />
                    </div>
                    {formik.touched.conductor && formik.errors.conductor && (
                        <p className={errorClass}>{formik.errors.conductor}</p>
                    )}
                </div>

                <div className="flex flex-col">
                    <label className={labelClass}>Conductor Contact*</label>
                    <div className="relative">
                        <Phone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            name="conductor_contact"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.conductor_contact}
                            className={inputClass(formik.touched.conductor_contact, formik.errors.conductor_contact)}
                            placeholder="+91..."
                        />
                    </div>
                    {formik.touched.conductor_contact && formik.errors.conductor_contact && (
                        <p className={errorClass}>{formik.errors.conductor_contact}</p>
                    )}
                </div>

                <div className="flex flex-col">
                    <label className={labelClass}>Conductor Aadhaar*</label>
                    <div className="relative">
                        <IdCard className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            name="conductor_aadhaar"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.conductor_aadhaar}
                            className={inputClass(formik.touched.conductor_aadhaar, formik.errors.conductor_aadhaar)}
                            placeholder="12-digit Aadhaar"
                        />
                    </div>
                    {formik.touched.conductor_aadhaar && formik.errors.conductor_aadhaar && (
                        <p className={errorClass}>{formik.errors.conductor_aadhaar}</p>
                    )}
                </div>

                <div className="flex flex-col md:col-span-2 lg:col-span-4 max-w-sm">
                    <label className={labelClass}>Status</label>
                    <select
                        name="status"
                        value={formik.values.status}
                        onChange={formik.handleChange}
                        className={`w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                            formik.touched.status && formik.errors.status 
                            ? 'border-red-500 focus:ring-red-500/50' 
                            : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/50'
                        } text-slate-800 dark:text-slate-100`}
                    >
                        {Object.keys(config.status).map(item => (
                            <option key={item} value={item}>
                                {config.status[item]}
                            </option>
                        ))}
                    </select>
                    {formik.touched.status && formik.errors.status && (
                        <p className={errorClass}>{formik.errors.status}</p>
                    )}
                </div>
            </form>
        </div>
    );
}

BusFormComponent.propTypes = {
    onChange: PropTypes.func,
    refId: PropTypes.shape({
        current: PropTypes.any
    }),
    setDirty: PropTypes.func,
    reset: PropTypes.bool,
    setReset: PropTypes.func,
    updatedValues: PropTypes.object,
};

export default BusFormComponent;
