/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import { MapPin, ChevronDown } from "lucide-react";

import './index.css';
import API from "../../apis";
import addressValidation from "./Validation";
import { Utility } from "../utility";

const countryId = process.env.NEXT_PUBLIC_DEFAULT_COUNTRY_ID;
const initialValues = {
    street: "",
    landmark: "",
    zipcode: "",
    country: countryId,
    state: 0,
    city: 0
};

const AddressFormComponent = ({
    onChange,
    refId,
    update,
    setDirty,
    reset,
    setReset,
    iCardDetails = null,
    setICardDetails = null,
    updatedValues = null
}) => {

    const [initialState, setInitialState] = useState(initialValues);
    const [states, setStates] = useState([]);
    const [stateId, setStateId] = useState(null);
    const [cities, setCities] = useState([]);
    const [zipcodeCity, setZipcodeCity] = useState(null);

    const { getStateCityFromZipCode } = Utility();

    const formik = useFormik({
        initialValues: initialState,
        validationSchema: addressValidation,
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
                validated: Object.keys(formik.errors).length === 0,
                dirty: formik.dirty
            });
        }
    };

    const getIdByName = async (attrName, API) => {
        return new Promise(resolve => {
            API.getIdByName(attrName)
                .then(res => {
                    if (res.status === "Success") {
                        resolve(res.data);
                    } else {
                        resolve(new Error(`API call unsuccessful: ${res.status}`));
                    }
                })
                .catch(error => {
                    resolve(new Error(`API call failed: ${error.message}`));
                });
        });
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

    useEffect(() => {
        const getStates = () => {
            if (formik.values.country || countryId) {
                API.StateAPI.getStates(formik.values.country || countryId)
                    .then(data => {
                        if (data?.status === 'Success') {
                            setStates(data.data.list);
                            setCities([]);
                        } else {
                            setStates([]);
                            setCities([]);
                            formik.setFieldValue("state", 0);
                        }
                    })
                    .catch(err => {
                        throw err;
                    });
            }
        }
        getStates();
    }, [formik.values.country, countryId]);

    useEffect(() => {
        API.CityAPI.getCities(formik.values.state || stateId)
            .then(cities => {
                if (cities?.status === 'Success') {
                    setCities(cities.data.list);
                    if (zipcodeCity) {
                        setTimeout(() => {
                            formik.setFieldValue("city", zipcodeCity);
                        }, 1000);
                    }
                } else {
                    setCities([]);
                }
            })
            .catch(err => {
                setCities([]);
            });
    }, [formik.values.state, stateId]);

    useEffect(() => {
        const { state, city, country, ...restObj } = formik.values;
        if (formik.values.city && formik.values.state && setICardDetails !== null) {
            const selectedObj1 = states.filter(obj => obj.id === formik.values.state) || [];
            const selectedObj2 = cities.filter(obj => obj.id === formik.values.city) || [];

            if (Object.keys(restObj).length > 0) {
                setICardDetails({
                    studentState: selectedObj1[0]?.name,
                    studentCity: selectedObj2[0]?.name,
                    ...restObj,
                });
            }
        }
    }, [formik.values, updatedValues]);

    useEffect(() => {
        if (cities.length) {
            formik.setFieldValue("city", updatedValues?.city);
        }
    }, [cities.length]);

    useEffect(() => {
        const fetchStateCity = async () => {
            if (formik.values.zipcode && (formik.values.zipcode.toString().length === 6)) {
                try {
                    const res = await getStateCityFromZipCode(formik?.values?.zipcode);
                    const state_id = await getIdByName(res.state, API.StateAPI);
                    const city_id = await getIdByName(res.city, API.CityAPI);

                    formik.setFieldValue("state", state_id);
                    setZipcodeCity(city_id);
                } catch (error) {
                    console.error("Error fetching state and city", error);
                }
            }
        };

        fetchStateCity();
    }, [formik?.values?.zipcode]);

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
            <div className="bg-white/95 dark:bg-[#161616]/90 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-slate-200/90 dark:border-[#282828] shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] space-y-4">
                
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-[#222]">
                    <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            Residential & Mailing Address
                        </h3>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                            Street details, landmark, and location parameters
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Street */}
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Street Address <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="street"
                            autoComplete="off"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.street}
                            className={inputClass("street")}
                            placeholder="e.g., 123 Main Street, Apt 4B"
                        />
                        {formik.touched.street && formik.errors.street && (
                            <p className="text-xs text-rose-500 font-medium">{formik.errors.street}</p>
                        )}
                    </div>

                    {/* Landmark */}
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Landmark
                        </label>
                        <input
                            type="text"
                            name="landmark"
                            autoComplete="off"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.landmark}
                            className={inputClass("landmark")}
                            placeholder="e.g., Near City Library"
                        />
                        {formik.touched.landmark && formik.errors.landmark && (
                            <p className="text-xs text-rose-500 font-medium">{formik.errors.landmark}</p>
                        )}
                    </div>

                    {/* Zipcode */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Postal Code / Zipcode <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="zipcode"
                            autoComplete="off"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.zipcode}
                            className={inputClass("zipcode")}
                            placeholder="e.g., 110001"
                        />
                        {formik.touched.zipcode && formik.errors.zipcode && (
                            <p className="text-xs text-rose-500 font-medium">{formik.errors.zipcode}</p>
                        )}
                    </div>

                    {/* State */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            State <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                name="state"
                                value={formik.values.state}
                                onBlur={formik.handleBlur}
                                onChange={event => {
                                    setStateId(event.target.value);
                                    formik.setFieldValue("state", event.target.value);
                                }}
                                className={selectClass("state")}
                            >
                                <option value={0} className="bg-white dark:bg-[#161616]" disabled>Select State</option>
                                {states.map(item => (
                                    <option value={item.id} key={item.name} className="bg-white dark:bg-[#161616]">
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.state && formik.errors.state && (
                            <p className="text-xs text-rose-500 font-medium">{formik.errors.state}</p>
                        )}
                    </div>

                    {/* City */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            City <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                name="city"
                                value={formik.values.city || updatedValues?.city || 0}
                                onBlur={formik.handleBlur}
                                onChange={event => {
                                    formik.setFieldValue("city", event.target.value);
                                }}
                                className={selectClass("city")}
                            >
                                <option value={0} className="bg-white dark:bg-[#161616]" disabled>Select City</option>
                                {cities.map(item => (
                                    <option value={item.id} key={item.name} className="bg-white dark:bg-[#161616]">
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.city && formik.errors.city && (
                            <p className="text-xs text-rose-500 font-medium">{formik.errors.city}</p>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
};

AddressFormComponent.propTypes = {
    onChange: PropTypes.func,
    refId: PropTypes.shape({
        current: PropTypes.any
    }),
    update: PropTypes.bool,
    setDirty: PropTypes.func,
    reset: PropTypes.bool,
    setReset: PropTypes.func,
    updatedValues: PropTypes.object,
    iCardDetails: PropTypes.object,
    setICardDetails: PropTypes.func
};

export default AddressFormComponent;
