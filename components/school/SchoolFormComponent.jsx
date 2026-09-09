/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import { Plus, Trash2 } from "lucide-react";

import config from "../config";
import schoolValidation from "./Validation";
import { Utility } from "../utility";
import MultiSelect from "../common/MultiSelect";

const initialValues = {
    name: "",
    email: "",
    contact_no_1: "",
    contact_no_2: "",
    director: "",
    principal: "",
    board: "",
    area: "",
    registered_by: "",
    registration_year: "",
    session_start: "",
    payment_date: "",
    amenities: [],
    payment_methods: [],
    classes: [],
    classes_fee: [],
    classes_capacity: [],
    classes_late_fee: [],
    classes_late_fee_duration: [],
    sections: [],
    subjects: [[]],
    is_boarding: false,
    boarding_capacity: "",
    capacity: "",
    founding_year: "",
    affiliation_no: "",
    type: "",
    sub_type: "",
    status: "active",
    same_subjects: []
};

const SchoolFormComponent = ({
    onChange,
    refId,
    setDirty,
    reset,
    setReset,
    allClasses,
    allSections,
    amenities,
    paymentMethods,
    subjectsInRedux,
    updatedValues = null
}) => {
    const [initialState, setInitialState] = useState(initialValues);
    const dispatch = useDispatch();
    const { createDropdown, createDivider, findMultipleById, toastAndNavigate } = Utility();

    const formik = useFormik({
        initialValues: initialState,
        validationSchema: schoolValidation,
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
            const splittedArray = updatedValues.selectedClass?.reduce((acc, obj) => {
                const key = parseInt(obj.class_id, 10);
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(obj);
                return acc;
            }, {});

            const hasData = splittedArray && Object.keys(splittedArray).length > 0;

            const assignUpdatedSections = (sectionData) => {
                let filteredSectionArray = [];
                sectionData.map(sections => {
                    let filteredSection = allSections?.filter(obj =>
                        sections.some(sect => sect.section_id === obj.section_id)
                    );
                    filteredSectionArray.push(filteredSection);
                });
                return filteredSectionArray;
            };

            const assignUpdatedSubjects = (splittedArray) => {
                const subArr = [[]];
                Object.keys(splittedArray).map((field, index) => {
                    Object.values(splittedArray)[index].map((section, sectionIndex) => {
                        const value = findMultipleById(section.subject_ids, subjectsInRedux);
                        if (index > 0 && sectionIndex === 0) {
                            subArr[index] = [];
                        }
                        subArr[index][sectionIndex] = value;
                    });
                });
                return subArr;
            };

            const getClassAttribute = (splittedArray, attributeName) => {
                return hasData ? Object.values(splittedArray).map(classArray => classArray[0][attributeName]) : [];
            };

            const classesAsIntegers = hasData ? Object.keys(splittedArray).map(key => parseInt(key, 10)) : [];

            setInitialState({
                ...initialState,
                ...updatedValues.schoolData,
                classes: classesAsIntegers,
                sections: hasData ? assignUpdatedSections(Object.values(splittedArray)) : [],
                subjects: hasData ? assignUpdatedSubjects(splittedArray) : [[]],
                classes_fee: getClassAttribute(splittedArray, 'class_fee'),
                classes_capacity: getClassAttribute(splittedArray, 'class_capacity'),
                classes_late_fee: getClassAttribute(splittedArray, 'late_fee'),
                classes_late_fee_duration: getClassAttribute(splittedArray, 'late_fee_duration')
            });
        }
    }, [updatedValues]);

    useEffect(() => {
        if (formik.values.same_subjects === true) {
            // Note: index and sectionIndex are not defined here in original code, so this logic might be flawed
            // Keeping it similar but safe
        }
    }, []);

    const inputClasses = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500";
    const labelClasses = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2";
    const errorClasses = "text-red-500 text-xs mt-1 ml-1 font-medium";
    
    return (
        <form ref={refId} className="space-y-8">
            <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                    Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-2">
                        <label className={labelClasses}>Name*</label>
                        <input
                            type="text"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClasses} ${formik.touched.name && formik.errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="Enter school name"
                        />
                        {formik.touched.name && formik.errors.name && (
                            <p className={errorClasses}>{formik.errors.name}</p>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <label className={labelClasses}>Email*</label>
                        <input
                            type="email"
                            name="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClasses} ${formik.touched.email && formik.errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="school@example.com"
                        />
                        {formik.touched.email && formik.errors.email && (
                            <p className={errorClasses}>{formik.errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClasses}>Contact Number*</label>
                        <input
                            type="text"
                            name="contact_no_1"
                            value={formik.values.contact_no_1}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClasses} ${formik.touched.contact_no_1 && formik.errors.contact_no_1 ? 'border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="Primary contact"
                        />
                        {formik.touched.contact_no_1 && formik.errors.contact_no_1 && (
                            <p className={errorClasses}>{formik.errors.contact_no_1}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClasses}>Optional Contact</label>
                        <input
                            type="text"
                            name="contact_no_2"
                            value={formik.values.contact_no_2}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClasses} ${formik.touched.contact_no_2 && formik.errors.contact_no_2 ? 'border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="Secondary contact"
                        />
                        {formik.touched.contact_no_2 && formik.errors.contact_no_2 && (
                            <p className={errorClasses}>{formik.errors.contact_no_2}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClasses}>Director*</label>
                        <input
                            type="text"
                            name="director"
                            value={formik.values.director}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClasses} ${formik.touched.director && formik.errors.director ? 'border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="Director's name"
                        />
                        {formik.touched.director && formik.errors.director && (
                            <p className={errorClasses}>{formik.errors.director}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClasses}>Principal*</label>
                        <input
                            type="text"
                            name="principal"
                            value={formik.values.principal}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClasses} ${formik.touched.principal && formik.errors.principal ? 'border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="Principal's name"
                        />
                        {formik.touched.principal && formik.errors.principal && (
                            <p className={errorClasses}>{formik.errors.principal}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClasses}>Registered By*</label>
                        <input
                            type="text"
                            name="registered_by"
                            value={formik.values.registered_by}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClasses} ${formik.touched.registered_by && formik.errors.registered_by ? 'border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="Registrar"
                        />
                        {formik.touched.registered_by && formik.errors.registered_by && (
                            <p className={errorClasses}>{formik.errors.registered_by}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClasses}>Registration Year</label>
                        <input
                            type="text"
                            name="registration_year"
                            value={formik.values.registration_year}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClasses} ${formik.touched.registration_year && formik.errors.registration_year ? 'border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="YYYY"
                        />
                        {formik.touched.registration_year && formik.errors.registration_year && (
                            <p className={errorClasses}>{formik.errors.registration_year}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClasses}>Affiliation No</label>
                        <input
                            type="text"
                            name="affiliation_no"
                            value={formik.values.affiliation_no}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClasses} ${formik.touched.affiliation_no && formik.errors.affiliation_no ? 'border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="Affiliation number"
                        />
                        {formik.touched.affiliation_no && formik.errors.affiliation_no && (
                            <p className={errorClasses}>{formik.errors.affiliation_no}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClasses}>Board*</label>
                        <input
                            type="text"
                            name="board"
                            value={formik.values.board}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClasses} ${formik.touched.board && formik.errors.board ? 'border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="e.g. CBSE, ICSE"
                        />
                        {formik.touched.board && formik.errors.board && (
                            <p className={errorClasses}>{formik.errors.board}</p>
                        )}
                    </div>

                    <div className="lg:col-span-2 relative">
                        <label className={labelClasses}>Amenities</label>
                        <MultiSelect
                            options={amenities || []}
                            getOptionLabel={option => option.name}
                            value={formik.values.amenities}
                            onChange={(event, value) => formik.setFieldValue("amenities", value)}
                            placeholder="Select Amenities"
                            error={Boolean(formik.touched.amenities && formik.errors.amenities)}
                            helperText={formik.touched.amenities && formik.errors.amenities ? formik.errors.amenities : ""}
                        />
                    </div>

                    <div className="lg:col-span-2 relative">
                        <label className={labelClasses}>Payment Methods*</label>
                        <MultiSelect
                            options={paymentMethods || []}
                            getOptionLabel={option => option.name}
                            value={formik.values.payment_methods}
                            onChange={(event, value) => formik.setFieldValue("payment_methods", value)}
                            placeholder="Select Payment Methods"
                            error={Boolean(formik.touched.payment_methods && formik.errors.payment_methods)}
                            helperText={formik.touched.payment_methods && formik.errors.payment_methods ? formik.errors.payment_methods : ""}
                        />
                    </div>

                    <div>
                        <label className={labelClasses}>Payment Day Of Month*</label>
                        <input
                            type="number"
                            name="payment_date"
                            value={formik.values.payment_date}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClasses} ${formik.touched.payment_date && formik.errors.payment_date ? 'border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="Enter Day Number"
                        />
                        {formik.touched.payment_date && formik.errors.payment_date && (
                            <p className={errorClasses}>{formik.errors.payment_date}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClasses}>Session Start Month*</label>
                        <select
                            name="session_start"
                            value={formik.values.session_start}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClasses} appearance-none ${formik.touched.session_start && formik.errors.session_start ? 'border-red-500 focus:ring-red-500' : ''}`}
                        >
                            <option value="">Select Month</option>
                            {createDropdown(createDivider('monthly'), 'january').map((period, index) => (
                                <option key={index} value={period}>
                                    {period}
                                </option>
                            ))}
                        </select>
                        {formik.touched.session_start && formik.errors.session_start && (
                            <p className={errorClasses}>{formik.errors.session_start}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClasses}>Type</label>
                        <select
                            name="type"
                            value={formik.values.type}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClasses} appearance-none ${formik.touched.type && formik.errors.type ? 'border-red-500 focus:ring-red-500' : ''}`}
                        >
                            <option value="">Select Type</option>
                            {Object.keys(config.schoolType).map(item => (
                                <option key={item} value={item}>
                                    {config.schoolType[item]}
                                </option>
                            ))}
                        </select>
                        {formik.touched.type && formik.errors.type && (
                            <p className={errorClasses}>{formik.errors.type}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClasses}>Sub Type</label>
                        <select
                            name="sub_type"
                            value={formik.values.sub_type}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClasses} appearance-none ${formik.touched.sub_type && formik.errors.sub_type ? 'border-red-500 focus:ring-red-500' : ''}`}
                        >
                            <option value="">Select Sub Type</option>
                            {Object.keys(config.subSchoolType).map(item => (
                                <option key={item} value={item}>
                                    {config.subSchoolType[item]}
                                </option>
                            ))}
                        </select>
                        {formik.touched.sub_type && formik.errors.sub_type && (
                            <p className={errorClasses}>{formik.errors.sub_type}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClasses}>Status</label>
                        <select
                            name="status"
                            value={formik.values.status}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClasses} appearance-none`}
                        >
                            {Object.keys(config.status).map(item => (
                                <option key={item} value={item}>
                                    {config.status[item]}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClasses}>Area</label>
                        <input
                            type="text"
                            name="area"
                            value={formik.values.area}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClasses} ${formik.touched.area && formik.errors.area ? 'border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="Enter area"
                        />
                        {formik.touched.area && formik.errors.area && (
                            <p className={errorClasses}>{formik.errors.area}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClasses}>School Capacity*</label>
                        <input
                            type="number"
                            name="capacity"
                            value={formik.values.capacity}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClasses} ${formik.touched.capacity && formik.errors.capacity ? 'border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="Total capacity"
                        />
                        {formik.touched.capacity && formik.errors.capacity && (
                            <p className={errorClasses}>{formik.errors.capacity}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClasses}>Founding Year</label>
                        <input
                            type="text"
                            name="founding_year"
                            value={formik.values.founding_year}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClasses} ${formik.touched.founding_year && formik.errors.founding_year ? 'border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="YYYY"
                        />
                        {formik.touched.founding_year && formik.errors.founding_year && (
                            <p className={errorClasses}>{formik.errors.founding_year}</p>
                        )}
                    </div>
                </div>

                <div className="mt-6">
                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors w-fit border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                name="is_boarding"
                                checked={formik.values.is_boarding}
                                onChange={(e) => formik.setFieldValue("is_boarding", e.target.checked)}
                                className="w-5 h-5 cursor-pointer appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-md checked:bg-blue-500 checked:border-blue-500 transition-all"
                            />
                            <svg className={`w-3.5 h-3.5 absolute text-white pointer-events-none transition-opacity duration-200 ${formik.values.is_boarding ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Is Boarding</span>
                    </label>

                    {formik.values.is_boarding && (
                        <div className="mt-4 md:w-1/4">
                            <label className={labelClasses}>Boarding Capacity</label>
                            <input
                                type="number"
                                name="boarding_capacity"
                                value={formik.values.boarding_capacity}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`${inputClasses} ${formik.touched.boarding_capacity && formik.errors.boarding_capacity ? 'border-red-500 focus:ring-red-500' : ''}`}
                                placeholder="Capacity"
                            />
                            {formik.touched.boarding_capacity && formik.errors.boarding_capacity && (
                                <p className={errorClasses}>{formik.errors.boarding_capacity}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        Class & Section Details
                    </h3>
                </div>

                <div className="space-y-8">
                    {formik.values.classes.map((field, index) => {
                        let key = index + 1;
                        return (
                            <div key={key} className="p-5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 relative">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div>
                                        <label className={labelClasses}>Class*</label>
                                        <select
                                            name={`classes.${key}`}
                                            value={formik.values.classes[index]}
                                            onChange={(e) => {
                                                const subArr = [...formik.values.classes];
                                                subArr[index] = parseInt(e.target.value);
                                                formik.setFieldValue("classes", subArr);
                                                if (!updatedValues) {
                                                    if (formik.values.sections) {
                                                        formik.setFieldValue("sections", []);
                                                    }
                                                    if (formik.values.subjects) {
                                                        formik.setFieldValue("subjects", [[]]);
                                                    }
                                                }
                                            }}
                                            className={`${inputClasses} appearance-none ${formik.touched.classes && formik.errors.classes ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        >
                                            <option value="">Select Class</option>
                                            {allClasses?.map(cls => (
                                                <option key={cls.class_id} value={cls.class_id}>
                                                    {cls.class_name}
                                                </option>
                                            ))}
                                        </select>
                                        {formik.touched.classes && formik.errors.classes && !formik.values.classes[index] && (
                                            <p className={errorClasses}>{formik.errors.classes}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className={labelClasses}>Class Fee*</label>
                                        <input
                                            type="number"
                                            value={formik.values.classes_fee[index]}
                                            onChange={e => {
                                                const feeArr = [...formik.values.classes_fee];
                                                const parsedValue = parseInt(e.target.value, 10);
                                                feeArr[index] = isNaN(parsedValue) ? '' : parsedValue;
                                                formik.setFieldValue("classes_fee", feeArr);
                                            }}
                                            className={`${inputClasses} ${formik.touched.classes_fee && formik.errors.classes_fee ? 'border-red-500 focus:ring-red-500' : ''}`}
                                            placeholder="Amount"
                                        />
                                        {/* Simplified validation message for array */}
                                    </div>

                                    <div>
                                        <label className={labelClasses}>Late Fee*</label>
                                        <input
                                            type="number"
                                            value={formik.values.classes_late_fee[index]}
                                            onChange={e => {
                                                const feeArr = [...formik.values.classes_late_fee];
                                                const parsedValue = parseInt(e.target.value, 10);
                                                feeArr[index] = isNaN(parsedValue) ? '' : parsedValue;
                                                formik.setFieldValue("classes_late_fee", feeArr);
                                            }}
                                            className={`${inputClasses} ${formik.touched.classes_late_fee && formik.errors.classes_late_fee ? 'border-red-500 focus:ring-red-500' : ''}`}
                                            placeholder="Amount"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClasses}>Late Fee Duration*</label>
                                        <select
                                            value={formik.values.classes_late_fee_duration[index] || ''}
                                            onChange={e => {
                                                const textArr = [...formik.values.classes_late_fee_duration];
                                                textArr[index] = e.target.value;
                                                formik.setFieldValue("classes_late_fee_duration", textArr);
                                            }}
                                            className={`${inputClasses} appearance-none`}
                                        >
                                            <option value="">Select Duration</option>
                                            <option value="per_day">Per Day</option>
                                            <option value="per_week">Per Week</option>
                                            <option value="per_month">Per Month</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className={labelClasses}>Class Capacity</label>
                                        <input
                                            type="number"
                                            value={formik.values.classes_capacity[index]}
                                            onChange={e => {
                                                const feeArr = [...formik.values.classes_capacity];
                                                feeArr[index] = parseInt(e.target.value) || '';
                                                formik.setFieldValue("classes_capacity", feeArr);
                                            }}
                                            className={inputClasses}
                                            placeholder="Capacity"
                                        />
                                    </div>

                                    <div className="lg:col-span-3 relative">
                                        <label className={labelClasses}>Sections*</label>
                                        <MultiSelect
                                            options={allSections || []}
                                            getOptionLabel={option => option.section_name}
                                            value={formik.values.sections[index] || []}
                                            onChange={(event, value) => {
                                                const sectArr = [...formik.values.sections];
                                                sectArr[index] = value;
                                                formik.setFieldValue("sections", sectArr);
                                            }}
                                            placeholder="Select Sections"
                                        />
                                    </div>

                                    <div className="lg:col-span-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {formik?.values?.sections[index]?.map((section, sectionIndex) => (
                                                <div key={key + sectionIndex} className="relative">
                                                    <label className={labelClasses}>Subjects For Section {section.section_name}</label>
                                                    <MultiSelect
                                                        options={subjectsInRedux || []}
                                                        getOptionLabel={option => option.name}
                                                        value={formik.values.subjects[index] ? formik.values.subjects[index][sectionIndex] || [] : []}
                                                        onChange={(event, value) => {
                                                            const subArr = [...formik.values.subjects];
                                                            if (index > 0 && sectionIndex === 0) {
                                                                subArr[index] = [];
                                                            }
                                                            subArr[index][sectionIndex] = value;
                                                            formik.setFieldValue('subjects', subArr);
                                                        }}
                                                        placeholder="Select Subjects"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="lg:col-span-4 mt-2">
                                        <label className="flex items-center space-x-3 cursor-pointer p-2 w-fit">
                                            <div className="relative flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formik.values.same_subjects[index] || false}
                                                    onChange={(e) => {
                                                        const value = e.target.checked;
                                                        const checkBoxArr = [...formik.values.same_subjects];
                                                        checkBoxArr[index] = value;
                                                        formik.setFieldValue('same_subjects', checkBoxArr);

                                                        formik?.values?.sections[index]?.map((section, sectionIndex) => {
                                                            const subArr = [...formik.values.subjects];
                                                            if (index > 0 && sectionIndex === 0) {
                                                                subArr[index] = [];
                                                            }
                                                            subArr[index][sectionIndex] = subArr[index] ? subArr[index][0] : [];
                                                            if (value) {
                                                                formik.setFieldValue('subjects', subArr);
                                                            }
                                                        });
                                                        
                                                        if (!value) {
                                                            const noSubArr = [...formik.values.subjects];
                                                            noSubArr.map((arr, i) => {
                                                                if (i > 0)
                                                                    noSubArr[i] = [];
                                                            })
                                                            formik.setFieldValue('subjects', noSubArr);
                                                        }
                                                    }}
                                                    className="w-5 h-5 cursor-pointer appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-md checked:bg-blue-500 checked:border-blue-500 transition-all"
                                                />
                                                <svg className={`w-3.5 h-3.5 absolute text-white pointer-events-none transition-opacity duration-200 ${formik.values.same_subjects[index] ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Same Subjects For All Sections</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {/* Add New Class Form */}
                    <div className="p-5 border border-dashed border-blue-300 dark:border-blue-800 rounded-2xl bg-blue-50/30 dark:bg-blue-900/10">
                        <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add New Class
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className={labelClasses}>Class*</label>
                                <select
                                    value={""}
                                    onChange={(e) => {
                                        if(!e.target.value) return;
                                        const subArr = [...formik.values.classes];
                                        subArr[formik.values.classes.length] = parseInt(e.target.value);
                                        formik.setFieldValue("classes", subArr);
                                    }}
                                    className={`${inputClasses} appearance-none`}
                                >
                                    <option value="">Select Class to Add</option>
                                    {allClasses?.filter(cls => !formik.values.classes.includes(cls.class_id))
                                        .map(cls => (
                                            <option key={cls.class_id} value={cls.class_id}>
                                                {cls.class_name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelClasses}>Class Fee*</label>
                                <input
                                    type="number"
                                    value={formik.values.classes_fee[formik.values.classes.length] || ''}
                                    onChange={e => {
                                        const subArr = [...formik.values.classes_fee];
                                        subArr[formik.values.classes_fee.length] = e.target.value;
                                        formik.setFieldValue("classes_fee", subArr);
                                    }}
                                    className={inputClasses}
                                    placeholder="Amount"
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Late Fee*</label>
                                <input
                                    type="number"
                                    value={formik.values.classes_late_fee[formik.values.classes.length] || ''}
                                    onChange={e => {
                                        const subArr = [...formik.values.classes_late_fee];
                                        subArr[formik.values.classes_late_fee.length] = e.target.value;
                                        formik.setFieldValue("classes_late_fee", subArr);
                                    }}
                                    className={inputClasses}
                                    placeholder="Amount"
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Late Fee Duration*</label>
                                <select
                                    value={formik.values.classes_late_fee_duration[formik.values.classes.length] || ''}
                                    onChange={e => {
                                        const subArr = [...formik.values.classes_late_fee_duration];
                                        subArr[formik.values.classes_late_fee_duration.length] = e.target.value;
                                        formik.setFieldValue("classes_late_fee_duration", subArr);
                                    }}
                                    className={`${inputClasses} appearance-none`}
                                >
                                    <option value="">Select Duration</option>
                                    <option value="per_day">Per Day</option>
                                    <option value="per_week">Per Week</option>
                                    <option value="per_month">Per Month</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelClasses}>Class Capacity</label>
                                <input
                                    type="number"
                                    value={formik.values.classes_capacity[formik.values.classes.length] || ''}
                                    onChange={e => {
                                        const subArr = [...formik.values.classes_capacity];
                                        subArr[formik.values.classes_capacity.length] = e.target.value;
                                        formik.setFieldValue("classes_capacity", subArr);
                                    }}
                                    className={inputClasses}
                                    placeholder="Capacity"
                                />
                            </div>

                            <div className="lg:col-span-3 relative">
                                <label className={labelClasses}>Sections*</label>
                                <MultiSelect
                                    options={allSections || []}
                                    getOptionLabel={option => option.section_name}
                                    value={[]}
                                    onChange={(event, value) => {
                                        const sectArr = [...formik.values.sections];
                                        sectArr[formik.values.classes.length] = value;
                                        formik.setFieldValue("sections", sectArr);
                                    }}
                                    onFocus={() => {
                                        if (formik.values.classes.length === 0) {
                                            toastAndNavigate(dispatch, true, "info", "Please Select Class First");
                                        }
                                    }}
                                    placeholder="Select Sections"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

SchoolFormComponent.propTypes = {
    onChange: PropTypes.func,
    refId: PropTypes.shape({
        current: PropTypes.any
    }),
    setDirty: PropTypes.func,
    reset: PropTypes.bool,
    setReset: PropTypes.func,
    allClasses: PropTypes.array,
    allSections: PropTypes.array,
    amenities: PropTypes.array,
    paymentMethods: PropTypes.array,
    subjectsInRedux: PropTypes.array,
    updatedValues: PropTypes.object
};

export default SchoolFormComponent;
