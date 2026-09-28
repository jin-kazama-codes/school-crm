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
import { Plus, Trash2, ChevronDown, Check } from "lucide-react";

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
                // Bug #13 fix: formik.isSubmitting is already false by the time onSubmit runs
                // (Formik resets it asynchronously). Check errors directly instead.
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

    const inputClasses = "w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2e2e2e] rounded-xl shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500";
    const selectClasses = "w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2e2e2e] rounded-xl shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none text-slate-900 dark:text-slate-100";
    const labelClasses = "block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5";
    const errorClasses = "text-rose-500 text-xs mt-1 ml-0.5 font-medium";
    
    return (
        <form ref={refId} className="space-y-6">
            <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#222]">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Basic Information
                    </h3>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">School Profile & Contact Details</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="lg:col-span-2">
                        <label className={labelClasses}>Name*</label>
                        <input
                            type="text"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClasses} ${formik.touched.name && formik.errors.name ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
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
                            className={`${inputClasses} ${formik.touched.email && formik.errors.email ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
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
                            className={`${inputClasses} ${formik.touched.contact_no_1 && formik.errors.contact_no_1 ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
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
                            className={`${inputClasses} ${formik.touched.contact_no_2 && formik.errors.contact_no_2 ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
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
                            className={`${inputClasses} ${formik.touched.director && formik.errors.director ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
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
                            className={`${inputClasses} ${formik.touched.principal && formik.errors.principal ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
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
                            className={`${inputClasses} ${formik.touched.registered_by && formik.errors.registered_by ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
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
                            className={`${inputClasses} ${formik.touched.registration_year && formik.errors.registration_year ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
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
                            className={`${inputClasses} ${formik.touched.affiliation_no && formik.errors.affiliation_no ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
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
                            className={`${inputClasses} ${formik.touched.board && formik.errors.board ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
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
                            className={`${inputClasses} ${formik.touched.payment_date && formik.errors.payment_date ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                            placeholder="Day (1-31)"
                        />
                        {formik.touched.payment_date && formik.errors.payment_date && (
                            <p className={errorClasses}>{formik.errors.payment_date}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClasses}>Session Start Month*</label>
                        <div className="relative">
                            <select
                                name="session_start"
                                value={formik.values.session_start}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`${selectClasses} appearance-none pr-10 ${formik.touched.session_start && formik.errors.session_start ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                            >
                                <option value="">Select Month</option>
                                {createDropdown(createDivider('monthly'), 'january').map((period, monthIndex) => (
                                    <option key={`session-month-${period}-${monthIndex}`} value={period}>
                                        {period}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.session_start && formik.errors.session_start && (
                            <p className={errorClasses}>{formik.errors.session_start}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClasses}>Type</label>
                        <div className="relative">
                            <select
                                name="type"
                                value={formik.values.type}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`${selectClasses} appearance-none pr-10 ${formik.touched.type && formik.errors.type ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                            >
                                <option value="">Select Type</option>
                                {Object.keys(config.schoolType).map((item, typeIndex) => (
                                    <option key={`school-type-${item}-${typeIndex}`} value={item}>
                                        {config.schoolType[item]}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.type && formik.errors.type && (
                            <p className={errorClasses}>{formik.errors.type}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClasses}>Sub Type</label>
                        <div className="relative">
                            <select
                                name="sub_type"
                                value={formik.values.sub_type}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`${selectClasses} appearance-none pr-10 ${formik.touched.sub_type && formik.errors.sub_type ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                            >
                                <option value="">Select Sub Type</option>
                                {Object.keys(config.subSchoolType).map((item, subTypeIndex) => (
                                    <option key={`sub-type-${item}-${subTypeIndex}`} value={item}>
                                        {config.subSchoolType[item]}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.sub_type && formik.errors.sub_type && (
                            <p className={errorClasses}>{formik.errors.sub_type}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClasses}>Status</label>
                        <div className="relative">
                            <select
                                name="status"
                                value={formik.values.status}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`${selectClasses} appearance-none pr-10`}
                            >
                                {Object.keys(config.status).map((item, statusIndex) => (
                                    <option key={`status-${item}-${statusIndex}`} value={item}>
                                        {config.status[item]}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label className={labelClasses}>Area</label>
                        <input
                            type="text"
                            name="area"
                            value={formik.values.area}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`${inputClasses} ${formik.touched.area && formik.errors.area ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
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
                            className={`${inputClasses} ${formik.touched.capacity && formik.errors.capacity ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
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
                            className={`${inputClasses} ${formik.touched.founding_year && formik.errors.founding_year ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                            placeholder="YYYY"
                        />
                        {formik.touched.founding_year && formik.errors.founding_year && (
                            <p className={errorClasses}>{formik.errors.founding_year}</p>
                        )}
                    </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#222]">
                    <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#202020] transition-colors w-fit border border-slate-200/60 dark:border-[#2a2a2a]">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                name="is_boarding"
                                checked={formik.values.is_boarding}
                                onChange={(e) => formik.setFieldValue("is_boarding", e.target.checked)}
                                className="w-4 h-4 cursor-pointer appearance-none border border-slate-300 dark:border-slate-600 rounded checked:bg-blue-600 checked:border-blue-600 transition-all"
                            />
                            <Check className={`w-3 h-3 absolute text-white pointer-events-none transition-opacity duration-200 ${formik.values.is_boarding ? 'opacity-100' : 'opacity-0'}`} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Is Boarding School</span>
                    </label>

                    {formik.values.is_boarding && (
                        <div className="mt-4 max-w-sm">
                            <label className={labelClasses}>Boarding Capacity</label>
                            <input
                                type="number"
                                name="boarding_capacity"
                                value={formik.values.boarding_capacity}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`${inputClasses} ${formik.touched.boarding_capacity && formik.errors.boarding_capacity ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                                placeholder="Capacity"
                            />
                            {formik.touched.boarding_capacity && formik.errors.boarding_capacity && (
                                <p className={errorClasses}>{formik.errors.boarding_capacity}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#222]">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Class & Section Details
                    </h3>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Curriculum, Fees & Subject Allocations</span>
                </div>

                <div className="space-y-6">
                    {formik.values.classes.map((field, index) => {
                        let key = index + 1;
                        return (
                            <div key={`class-row-${key}-${formik.values.classes[index] || index}`} className="p-5 border border-slate-200/80 dark:border-[#282828] rounded-2xl bg-slate-50/70 dark:bg-[#181818]/60 relative shadow-2xs">
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/60 dark:border-[#262626]">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/70 dark:border-blue-900/50 rounded-lg">
                                            Class #{index + 1}
                                        </span>
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                            {allClasses?.find(c => c.class_id === formik.values.classes[index])?.class_name || "Configuration"}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                    <div>
                                        <label className={labelClasses}>Class*</label>
                                        <div className="relative">
                                            <select
                                                name={`classes.${key}`}
                                                value={formik.values.classes[index]}
                                                onChange={(e) => {
                                                    const subArr = [...formik.values.classes];
                                                    subArr[index] = parseInt(e.target.value);
                                                    formik.setFieldValue("classes", subArr);
                                                    if (!updatedValues) {
                                                        // Bug #2 fix: only reset sections & subjects for the changed class index
                                                        const sectArr = [...(formik.values.sections || [])];
                                                        sectArr[index] = [];
                                                        formik.setFieldValue("sections", sectArr);

                                                        const subList = [...(formik.values.subjects || [[]])];
                                                        subList[index] = [];
                                                        formik.setFieldValue("subjects", subList);
                                                    }
                                                }}
                                                className={`${selectClasses} appearance-none pr-10 ${formik.touched.classes && formik.errors.classes ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                                            >
                                                <option value="">Select Class</option>
                                                {allClasses?.map((cls, clsIndex) => (
                                                    <option key={`cls-opt-${index}-${cls.class_id || clsIndex}`} value={cls.class_id}>
                                                        {cls.class_name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
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
                                            className={`${inputClasses} ${formik.touched.classes_fee && formik.errors.classes_fee ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                                            placeholder="Amount"
                                        />
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
                                            className={`${inputClasses} ${formik.touched.classes_late_fee && formik.errors.classes_late_fee ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                                            placeholder="Amount"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClasses}>Late Fee Duration*</label>
                                        <div className="relative">
                                            <select
                                                value={formik.values.classes_late_fee_duration[index] || ''}
                                                onChange={e => {
                                                    const textArr = [...formik.values.classes_late_fee_duration];
                                                    textArr[index] = e.target.value;
                                                    formik.setFieldValue("classes_late_fee_duration", textArr);
                                                }}
                                                className={`${selectClasses} appearance-none pr-10`}
                                            >
                                                <option value="">Select Duration</option>
                                                <option value="per_day">Per Day</option>
                                                <option value="per_week">Per Week</option>
                                                <option value="per_month">Per Month</option>
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
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
                                                <div key={`section-sub-${key}-${section.section_id || sectionIndex}`} className="relative">
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
                                    
                                    <div className="lg:col-span-4 mt-1">
                                        <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-xl hover:bg-slate-100/70 dark:hover:bg-[#222] transition-colors w-fit border border-slate-200/60 dark:border-[#2a2a2a]">
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
                                                            // Bug #3 fix: only clear subjects for the CURRENT class index,
                                                            // not all classes with index > 0.
                                                            const noSubArr = [...formik.values.subjects];
                                                            noSubArr[index] = noSubArr[index] ? [noSubArr[index][0]] : [];
                                                            formik.setFieldValue('subjects', noSubArr);
                                                        }
                                                    }}
                                                    className="w-4 h-4 cursor-pointer appearance-none border border-slate-300 dark:border-slate-600 rounded checked:bg-blue-600 checked:border-blue-600 transition-all"
                                                />
                                                <Check className={`w-3 h-3 absolute text-white pointer-events-none transition-opacity duration-200 ${formik.values.same_subjects[index] ? 'opacity-100' : 'opacity-0'}`} />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Same Subjects For All Sections</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add New Class Form */}
                    <div className="p-5 border border-dashed border-blue-300 dark:border-blue-900/60 rounded-2xl bg-blue-50/20 dark:bg-blue-950/10">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add New Class
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div>
                                <label className={labelClasses}>Class*</label>
                                <div className="relative">
                                    <select
                                        value={""}
                                        onChange={(e) => {
                                            if(!e.target.value) return;
                                            const subArr = [...formik.values.classes];
                                            subArr[formik.values.classes.length] = parseInt(e.target.value);
                                            formik.setFieldValue("classes", subArr);
                                        }}
                                        className={`${selectClasses} appearance-none pr-10`}
                                    >
                                        <option value="">Select Class to Add</option>
                                        {allClasses?.filter(cls => !formik.values.classes.includes(cls.class_id))
                                            .map((cls, clsIndex) => (
                                                <option key={`add-cls-opt-${cls.class_id || clsIndex}`} value={cls.class_id}>
                                                    {cls.class_name}
                                                </option>
                                            ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>

                            {/* Bug #1 fix: The class dropdown appends to classes[] first, so after it fires,
                                classes.length is already N+1. These staging fields must use the LAST index
                                (classes.length - 1) to pair correctly with the newly added class.
                                We derive newIdx = classes.length (pre-add snapshot) by reading it BEFORE
                                the class select mutates the array – but since Formik state updates are
                                batched, we read formik.values.classes.length at render time which still
                                reflects the pre-add length.  That index is the one these fields must write to. */}
                            <div>
                                <label className={labelClasses}>Class Fee*</label>
                                <input
                                    type="number"
                                    value={formik.values.classes_fee[formik.values.classes.length] ?? ''}
                                    onChange={e => {
                                        const subArr = [...formik.values.classes_fee];
                                        subArr[formik.values.classes.length] = e.target.value;
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
                                    value={formik.values.classes_late_fee[formik.values.classes.length] ?? ''}
                                    onChange={e => {
                                        const subArr = [...formik.values.classes_late_fee];
                                        subArr[formik.values.classes.length] = e.target.value;
                                        formik.setFieldValue("classes_late_fee", subArr);
                                    }}
                                    className={inputClasses}
                                    placeholder="Amount"
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Late Fee Duration*</label>
                                <div className="relative">
                                    <select
                                        value={formik.values.classes_late_fee_duration[formik.values.classes.length] ?? ''}
                                        onChange={e => {
                                            const subArr = [...formik.values.classes_late_fee_duration];
                                            subArr[formik.values.classes.length] = e.target.value;
                                            formik.setFieldValue("classes_late_fee_duration", subArr);
                                        }}
                                        className={`${selectClasses} appearance-none pr-10`}
                                    >
                                        <option value="">Select Duration</option>
                                        <option value="per_day">Per Day</option>
                                        <option value="per_week">Per Week</option>
                                        <option value="per_month">Per Month</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>Class Capacity</label>
                                <input
                                    type="number"
                                    value={formik.values.classes_capacity[formik.values.classes.length] ?? ''}
                                    onChange={e => {
                                        const subArr = [...formik.values.classes_capacity];
                                        subArr[formik.values.classes.length] = e.target.value;
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
