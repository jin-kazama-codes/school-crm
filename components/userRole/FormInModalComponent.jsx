/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "@/lib/routerAdapter";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Formik } from "formik";
import { X, Shield, RotateCcw, Save } from "lucide-react";

import API from "../../apis";
import Loader from "../common/Loader";
import Toast from "../common/Toast";
import config from "../config";

import { setMenuItem } from "../../redux/actions/NavigationAction";
import { Utility } from "../utility";
import userRoleValidation from "./Validation";

import formBg from "../assets/formBg.png";

const initialValues = {
    name: "",
    priority: 0,
    status: "active"
};

const FormComponent = ({ openDialog, setOpenDialog }) => {
    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    const [title, setTitle] = useState("Create");
    const [loading, setLoading] = useState(false);
    const [initialState, setInitialState] = useState(initialValues);

    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const selected = useSelector(state => state.menuItems.selected);
    const toastInfo = useSelector(state => state.toastInfo);

    const { state } = useLocation();
    const { toastAndNavigate, getLocalStorage } = Utility();

    let id = state?.id;

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        if(selectedMenu?.selected) {
            dispatch(setMenuItem(selectedMenu.selected));
        }
        if (id) {
            setTitle("Update");
            populateData(id);
        } else {
            setTitle("Create");
            setInitialState(initialValues);
        }
    }, [id]);

    const updateUserRole = useCallback(values => {
        setLoading(true);
        API.UserRoleAPI.updateUserRole(values)
            .then(({ data: role }) => {
                if (role.status === 'Success') {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "info", "Successfully Updated");
                    setTimeout(() => {
                        handleDialogClose();
                        location.href = "/role/listing"; 
                    }, 2000);
                } else {
                    setLoading(false); 
                    toastAndNavigate(dispatch, true, "error", "An Error Occurred, Please Try Again", navigateTo, location.reload());
                }
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg, navigateTo, location.reload());
                console.error(err);
            });
    },[]);

    const populateData = useCallback(id => {
        setLoading(true);
        const path = [`/get-by-pk/role/${id}`];
        API.CommonAPI.multipleAPICall("GET", path)
            .then(response => {
                if (response[0].data.status === "Success") {
                    setInitialState(response[0].data.data);
                    setLoading(false);
                } else {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "error", "An Error Occurred, Please Try Again", navigateTo, location.reload());
                }
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg, navigateTo, location.reload());
                console.error(err);
            });
    },[id]);

    const createUserRole = useCallback(values => {
        setLoading(true);
        API.UserRoleAPI.createUserRole(values)
            .then(({ data: role }) => {
                if (role.status === 'Success') {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "success", "Successfully Created");
                    setTimeout(() => {
                        handleDialogClose();
                        navigateTo(0); 
                    }, 2000);
                } else {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "error", "An Error Occurred, Please Try Again", navigateTo, location.reload());
                }
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, err ? err.response?.data?.msg : "An Error Occurred", navigateTo, location.reload());
                console.error(err);
            });
    },[]);

    if (!openDialog) return null;

    const inputClass = (touched, error) => `w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
        touched && error 
        ? 'border-red-500 focus:ring-red-500/50' 
        : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/50'
    } text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500`;
    
    const selectClass = (touched, error) => `w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
        touched && error 
        ? 'border-red-500 focus:ring-red-500/50' 
        : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/50'
    } text-slate-800 dark:text-slate-100`;

    const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";
    const errorClass = "mt-1.5 text-sm text-red-500 font-medium";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="w-full max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-[24px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(${formBg?.src || formBg})`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "cover"
                }}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-black/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                                {`${title} ${selected}`}
                            </h2>
                        </div>
                    </div>
                    <button 
                        onClick={handleDialogClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <Formik
                        initialValues={initialState}
                        enableReinitialize
                        validationSchema={userRoleValidation}
                        onSubmit={values => {
                            values.id ? updateUserRole(values) : createUserRole(values);
                        }}
                    >
                        {({
                            values,
                            errors,
                            touched,
                            dirty,
                            isSubmitting,
                            handleBlur,
                            handleChange,
                            handleSubmit,
                            resetForm
                        }) => (
                            <form onSubmit={handleSubmit} className="space-y-6 flex flex-col h-full">
                                <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col md:col-span-2">
                                            <label className={labelClass}>Name*</label>
                                            <input
                                                type="text"
                                                name="name"
                                                autoComplete="new-name"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                value={values.name}
                                                className={inputClass(touched.name, errors.name)}
                                                placeholder="e.g., Admin"
                                            />
                                            {touched.name && errors.name && (
                                                <p className={errorClass}>{errors.name}</p>
                                            )}
                                        </div>

                                        <div className="flex flex-col">
                                            <label className={labelClass}>Priority*</label>
                                            <input
                                                type="number"
                                                name="priority"
                                                autoComplete="new-priority"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                value={values.priority}
                                                className={inputClass(touched.priority, errors.priority)}
                                                placeholder="e.g., 1"
                                            />
                                            {touched.priority && errors.priority && (
                                                <p className={errorClass}>{errors.priority}</p>
                                            )}
                                        </div>

                                        <div className="flex flex-col">
                                            <label className={labelClass}>Status*</label>
                                            <select
                                                name="status"
                                                autoComplete="new-status"
                                                value={values.status}
                                                onChange={handleChange}
                                                className={selectClass(touched.status, errors.status)}
                                            >
                                                {Object.keys(config.status).map(item => (
                                                    <option key={item} value={item}>
                                                        {config.status[item]}
                                                    </option>
                                                ))}
                                            </select>
                                            {touched.status && errors.status && (
                                                <p className={errorClass}>{errors.status}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
                                    {title !== "Update" && (
                                        <button
                                            type="button"
                                            disabled={!dirty || isSubmitting}
                                            onClick={() => {
                                                if (window.confirm("Do You Really Want To Reset?")) {
                                                    resetForm();
                                                }
                                            }}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-white rounded-xl font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                                        >
                                            <RotateCcw className="w-5 h-5" />
                                            Reset
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleDialogClose}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25 dark:hover:text-rose-200 border border-rose-200/80 dark:border-rose-500/30 rounded-xl font-semibold shadow-sm shadow-rose-500/10 hover:shadow-rose-500/20 transition-all cursor-pointer active:scale-95"
                                    >
                                        <X className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!dirty || isSubmitting}
                                        className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 ${
                                            title === "Update" 
                                            ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 hover:shadow-blue-600/40" 
                                            : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 hover:shadow-emerald-600/40"
                                        }`}
                                    >
                                        <Save className="w-5 h-5" />
                                        Submit
                                    </button>
                                </div>
                            </form>
                        )}
                    </Formik>
                </div>

                <Toast
                    alerting={toastInfo.toastAlert}
                    severity={toastInfo.toastSeverity}
                    message={toastInfo.toastMessage}
                />
                {loading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                        <Loader />
                    </div>
                )}
            </div>
        </div>
    );
}

FormComponent.propTypes = {
    openDialog: PropTypes.bool,
    setOpenDialog: PropTypes.func
};

export default FormComponent;
