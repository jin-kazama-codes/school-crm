/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";

import { useFormik } from "formik";
import { MapPin, Navigation, Map } from "lucide-react";

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
                validated: formik.isSubmitting
                    ? Object.keys(formik.errors).length === 0
                    : false,
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

    const inputClass = (touched, error) => `w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all pl-11 ${
        touched && error 
        ? 'border-red-500 focus:ring-red-500/50' 
        : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/50'
    } text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500`;

    const selectClass = (touched, error) => `w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all pl-11 ${
        touched && error 
        ? 'border-red-500 focus:ring-red-500/50' 
        : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/50'
    } text-slate-800 dark:text-slate-100`;

    const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";
    const errorClass = "mt-1.5 text-sm text-red-500 font-medium";
    const fieldsetLegendClass = "flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100 mb-6";
    const fieldsetClass = "p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 mt-8";

    return (
        <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 w-full animate-in slide-in-from-bottom-4 duration-500 mt-8">
            <form ref={refId} className="space-y-6">
                
                <div className={fieldsetClass}>
                    <h3 className={fieldsetLegendClass}>
                        <MapPin className="w-6 h-6 text-red-500" />
                        Address Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex flex-col md:col-span-2">
                            <label className={labelClass}>Street Address*</label>
                            <div className="relative">
                                <MapPin className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    name="street"
                                    autoComplete="new-street"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.street}
                                    className={inputClass(formik.touched.street, formik.errors.street)}
                                    placeholder="e.g., 123 Main St, Apt 4B"
                                />
                            </div>
                            {formik.touched.street && formik.errors.street && (
                                <p className={errorClass}>{formik.errors.street}</p>
                            )}
                        </div>

                        <div className="flex flex-col md:col-span-2">
                            <label className={labelClass}>Landmark</label>
                            <div className="relative">
                                <Navigation className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    name="landmark"
                                    autoComplete="new-landmark"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.landmark}
                                    className={inputClass(formik.touched.landmark, formik.errors.landmark)}
                                    placeholder="e.g., Near Central Park"
                                />
                            </div>
                            {formik.touched.landmark && formik.errors.landmark && (
                                <p className={errorClass}>{formik.errors.landmark}</p>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <label className={labelClass}>Zipcode / Postal Code*</label>
                            <div className="relative">
                                <Map className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    name="zipcode"
                                    autoComplete="new-zipcode"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.zipcode}
                                    className={inputClass(formik.touched.zipcode, formik.errors.zipcode)}
                                    placeholder="e.g., 10001"
                                />
                            </div>
                            {formik.touched.zipcode && formik.errors.zipcode && (
                                <p className={errorClass}>{formik.errors.zipcode}</p>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <label className={labelClass}>State*</label>
                            <div className="relative">
                                <Map className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    name="state"
                                    value={formik.values.state}
                                    onChange={event => {
                                        setStateId(event.target.value);
                                        formik.setFieldValue("state", event.target.value);
                                    }}
                                    className={selectClass(formik.touched.state, formik.errors.state)}
                                >
                                    <option value={0} disabled>--Select State--</option>
                                    {states.map(item => (
                                        <option value={item.id} key={item.name}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {formik.touched.state && formik.errors.state && (
                                <p className={errorClass}>{formik.errors.state}</p>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <label className={labelClass}>City*</label>
                            <div className="relative">
                                <Map className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    name="city"
                                    value={formik.values.city || updatedValues?.city || 0}
                                    onChange={event => {
                                        formik.setFieldValue("city", event.target.value);
                                    }}
                                    className={selectClass(formik.touched.city, formik.errors.city)}
                                >
                                    <option value={0} disabled>--Select City--</option>
                                    {cities.map(item => (
                                        <option value={item.id} key={item.name}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {formik.touched.city && formik.errors.city && (
                                <p className={errorClass}>{formik.errors.city}</p>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
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
