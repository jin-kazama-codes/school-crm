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

const countryId = process.env.NEXT_PUBLIC_DEFAULT_COUNTRY_ID || 1;
const initialValues = {
    street: "",
    landmark: "",
    zipcode: "",
    country: Number(countryId) || 1,
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

    const renderRequiredLabel = (text) => (
        <span>
            {text.replace(/[*]|(?:\*\s*\(Mandatory\))/g, "").trim()}{" "}
            <span className="text-[#e05353] dark:text-[#f87171] text-[11px] font-medium tracking-[0.2px] normal-case ml-0.5">
                * (Mandatory)
            </span>
        </span>
    );

    const formik = useFormik({
        initialValues: initialState,
        validationSchema: addressValidation,
        enableReinitialize: true,
        onSubmit: () => watchForm()
    });

    React.useImperativeHandle(refId, () => ({
        Submit: async () => {
            const errors = await formik.validateForm();
            formik.setTouched(
                Object.keys(formik.values).reduce((acc, key) => {
                    acc[key] = true;
                    return acc;
                }, {})
            );
            await formik.submitForm();
            return errors;
        },
        validate: async () => {
            const errors = await formik.validateForm();
            formik.setTouched(
                Object.keys(formik.values).reduce((acc, key) => {
                    acc[key] = true;
                    return acc;
                }, {})
            );
            return errors;
        },
        formik
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

    const isInitialMount = React.useRef(true);
    const initialCitySet = React.useRef(false);

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
            initialCitySet.current = false;
            setInitialState({
                ...initialValues,
                ...updatedValues,
                street: updatedValues.street ?? "",
                landmark: updatedValues.landmark ?? "",
                zipcode: updatedValues.zipcode ?? "",
                country: Number(updatedValues.country) || Number(countryId) || 1,
                state: Number(updatedValues.state) || 0,
                city: Number(updatedValues.city) || 0,
            });
        }
    }, [updatedValues]);

    useEffect(() => {
        const getStates = () => {
            const cId = formik.values.country || countryId || 1;
            if (cId && cId !== 0 && cId !== "0" && cId !== "null") {
                API.StateAPI.getStates(cId)
                    .then(data => {
                        if (data?.status === 'Success') {
                            setStates(data.data?.list || data.data?.rows || []);
                        } else {
                            setStates([]);
                            setCities([]);
                            formik.setFieldValue("state", 0);
                        }
                    })
                    .catch(() => {
                        setStates([]);
                        setCities([]);
                    });
            }
        };
        getStates();
    }, [formik.values.country, countryId]);

    useEffect(() => {
        const sId = formik.values.state || stateId;
        if (sId && sId !== 0 && sId !== "0" && sId !== "null" && sId !== "undefined") {
            API.CityAPI.getCities(sId)
                .then(citiesResponse => {
                    if (citiesResponse?.status === 'Success') {
                        const cityList = citiesResponse.data?.list || citiesResponse.data?.rows || [];
                        setCities(cityList);
                        // On initial load of updatedValues, ensure city is set once cities load
                        if (!initialCitySet.current && updatedValues?.city) {
                            const targetCity = Number(updatedValues.city);
                            if (cityList.some(c => Number(c.id) === targetCity)) {
                                formik.setFieldValue("city", targetCity);
                            }
                            initialCitySet.current = true;
                        }
                    } else {
                        setCities([]);
                    }
                })
                .catch(() => {
                    setCities([]);
                });
        } else {
            setCities([]);
        }
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

    const handleZipcodeLookup = async (code) => {
        if (code && code.toString().length === 6) {
            try {
                const res = await getStateCityFromZipCode(code);
                if (res?.state && res?.city) {
                    const state_id = await getIdByName(res.state, API.StateAPI);
                    const city_id = await getIdByName(res.city, API.CityAPI);
                    if (state_id && typeof state_id === 'number') {
                        formik.setFieldValue("state", state_id);
                        setStateId(state_id);
                    }
                    if (city_id && typeof city_id === 'number') {
                        formik.setFieldValue("city", city_id);
                    }
                }
            } catch (error) {
                console.error("Error fetching state and city from zipcode", error);
            }
        }
    };

    const handleZipcodeChange = (e) => {
        formik.handleChange(e);
        const val = e.target.value;
        if (val && val.length === 6) {
            handleZipcodeLookup(val);
        }
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
                            {renderRequiredLabel("Street Address")}
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
                            {renderRequiredLabel("Postal Code / Zipcode")}
                        </label>
                        <input
                            type="text"
                            name="zipcode"
                            autoComplete="off"
                            onBlur={formik.handleBlur}
                            onChange={handleZipcodeChange}
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
                            {renderRequiredLabel("State")}
                        </label>
                        <div className="relative">
                            <select
                                name="state"
                                value={formik.values.state || 0}
                                onBlur={formik.handleBlur}
                                onChange={event => {
                                    const val = Number(event.target.value) || event.target.value;
                                    setStateId(val);
                                    formik.setFieldValue("state", val);
                                    formik.setFieldValue("city", 0);
                                }}
                                className={selectClass("state")}
                            >
                                <option value={0} className="bg-white dark:bg-[#161616]" disabled>Select State</option>
                                {states.map(item => (
                                    <option value={item.id} key={`state-${item.id}`} className="bg-white dark:bg-[#161616]">
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
                            {renderRequiredLabel("City")}
                        </label>
                        <div className="relative">
                            <select
                                name="city"
                                value={formik.values.city || 0}
                                onBlur={formik.handleBlur}
                                onChange={event => {
                                    const val = Number(event.target.value) || event.target.value;
                                    formik.setFieldValue("city", val);
                                }}
                                className={selectClass("city")}
                            >
                                <option value={0} className="bg-white dark:bg-[#161616]" disabled>Select City</option>
                                {cities.map(item => (
                                    <option value={item.id} key={`city-${item.id}`} className="bg-white dark:bg-[#161616]">
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
