/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useCallback, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "@/lib/routerAdapter";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { UserCircle, Save, RotateCcw, ArrowLeft } from "lucide-react";

import API from "../../apis";
import AddressFormComponent from "../address/AddressFormComponent";
import Loader from "../common/Loader";
import Toast from "../common/Toast";
import UserFormComponent from "./UserFormComponent";

import { setMenuItem } from "../../redux/actions/NavigationAction";
import { Utility } from "../utility";

import formBg from "../assets/formBg.png";

const FormComponent = ({ rolePriority }) => {
    const [title, setTitle] = useState("Create");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        userData: { values: null, validated: false },
        addressData: { values: null, validated: false }
    });
    const [updatedValues, setUpdatedValues] = useState(null);
    const [dirty, setDirty] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [reset, setReset] = useState(false);

    const selected = useSelector(state => state.menuItems.selected);
    const toastInfo = useSelector(state => state.toastInfo);

    const userFormRef = useRef();
    const addressFormRef = useRef();

    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const userParams = useParams();
    const { pathname, state } = useLocation();
    const { toastAndNavigate, getLocalStorage } = Utility();

    const isCreate = pathname?.includes("/create") || pathname?.endsWith("/create");
    let id = isCreate ? undefined : (userParams?.id || state?.id);
    const schoolId = getLocalStorage("auth")?.id;

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        if (selectedMenu?.selected) {
            dispatch(setMenuItem(selectedMenu.selected));
        }
    }, []);

    const updateUserAndAddress = useCallback(formData => {
        const paths = [];
        const dataFields = [];

        if (formData.userData.dirty) {
            const userVals = { ...formData.userData.values };
            if (!userVals.id && id) {
                userVals.id = id;
            }
            if (!userVals.password) {
                delete userVals.password;
            }
            paths.push("/update-user");
            dataFields.push(userVals);
        }

        if (formData.addressData.dirty) {
            paths.push("/update-address");
            dataFields.push({ ...formData.addressData.values });
        }

        if (paths.length === 0) {
            toastAndNavigate(dispatch, true, "info", "No Changes to Update", navigateTo, `/user/listing`);
            return;
        }

        setLoading(true);

        API.CommonAPI.multipleAPICall("PATCH", paths, dataFields)
            .then(responses => {
                let status = true;
                responses.forEach(response => {
                    if (response.data.status !== "Success") {
                        status = false;
                    }
                });
                if (status) {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "info", "Successfully Updated", navigateTo, `/user/listing`);
                } else {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "error", "An Error Occurred, Please Try Again");
                }
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg || "An Error Occurred", navigateTo, 0);
                console.log('Error in user update', err);
            });
    }, [formData, id]);

    const populateUserData = useCallback(id => {
        setLoading(true);
        const paths = [`/get-by-pk/user/${id}`, `/get-address/user/${id}`];

        API.CommonAPI.multipleAPICall("GET", paths)
            .then(responses => {
                const dataObj = {
                    userData: responses[0]?.data?.data,
                    addressData: responses[1]?.data?.data
                };
                setUpdatedValues(dataObj);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg || "An Error Occurred", navigateTo, 0);
                console.log('Error in user populate', err);
            });
    }, []);

    const registerUser = useCallback(formData => {
        setLoading(true);

        API.UserAPI.register({ ...formData.userData.values })
            .then(({ data: user }) => {
                if (user?.status === 'Success') {
                    API.AddressAPI.createAddress({
                        ...formData.addressData.values,
                        parent_id: user.data.id,
                        parent: 'user'
                    })
                        .then(() => {
                            setLoading(false);
                            toastAndNavigate(dispatch, true, "success", "Successfully Created", navigateTo, `/user/listing`);
                        })
                        .catch(err => {
                            setLoading(false);
                            toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg || "An Error Occurred", navigateTo, 0);
                            console.log('Error in user address create', err);
                        });
                } else {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "error", user?.msg || "Failed to create user");
                }
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg || "An Error Occurred", navigateTo, 0);
                console.log('Error in user create', err);
            });
    }, []);

    useEffect(() => {
        if (isCreate) {
            setTitle("Create");
            setUpdatedValues(null);
            setFormData({
                userData: { values: null, validated: false },
                addressData: { values: null, validated: false }
            });
            setDirty(false);
            setSubmitted(false);
            setReset(true);
        } else if (id && !submitted) {
            setTitle("Update");
            populateUserData(id);
        }
    }, [id, isCreate, pathname]);

    useEffect(() => {
        if (formData.userData.validated && formData.addressData.validated) {
            (!isCreate && (formData.userData.values?.id || id)) 
                ? updateUserAndAddress(formData) 
                : registerUser(formData);
        } else {
            setSubmitted(false);
        }
    }, [formData.userData.validated, formData.addressData.validated]);

    const handleSubmit = async () => {
        await userFormRef.current.Submit();
        await addressFormRef.current.Submit();
        setSubmitted(true);
    };

    const handleFormChange = (data, form) => {
        form === 'user' ? setFormData({ ...formData, userData: data }) :
            setFormData({ ...formData, addressData: data });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div
                className="rounded-2xl border border-slate-200/90 dark:border-[#262626] overflow-hidden shadow-2xl relative bg-white dark:bg-[#101010] animate-in fade-in duration-300"
                style={{
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0.94)), url(${formBg?.src || formBg})`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                }}
            >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-slate-200/80 dark:border-[#222] bg-white/80 dark:bg-[#101010]/80 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${
                            title === "Update" 
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50" 
                                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50"
                        }`}>
                            <UserCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                                {`${title} ${selected || "User"}`}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {title === "Update" 
                                    ? "Modify existing user credentials, role permissions, and personal details" 
                                    : "Register a new administrative or staff user with assigned role and permissions"}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigateTo("/user/listing")}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#252525] rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to List
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <UserFormComponent
                        onChange={(data) => {
                            handleFormChange(data, 'user');
                        }}
                        refId={userFormRef}
                        setDirty={setDirty}
                        reset={reset}
                        schoolId={schoolId}
                        setReset={setReset}
                        userId={id}
                        rolePriority={rolePriority}
                        updatedValues={updatedValues?.userData}
                    />
                    
                    <AddressFormComponent
                        onChange={(data) => {
                            handleFormChange(data, 'address');
                        }}
                        refId={addressFormRef}
                        update={id ? true : false}
                        setDirty={setDirty}
                        reset={reset}
                        setReset={setReset}
                        updatedValues={updatedValues?.addressData}
                    />
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200/80 dark:border-[#222] bg-white/80 dark:bg-[#101010]/80 backdrop-blur-md flex items-center justify-between gap-3">
                    <div>
                        {title !== "Update" && (
                            <button
                                type="reset"
                                disabled={!dirty || submitted}
                                onClick={() => {
                                    if (window.confirm("Do you really want to reset this form?")) {
                                        setReset(true);
                                    }
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#202020] rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Reset Form
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => navigateTo("/user/listing")}
                            className="px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#252525] rounded-xl transition-all cursor-pointer shadow-2xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={() => handleSubmit()}
                            disabled={!dirty || submitted}
                            className={`inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                title === "Update"
                                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 hover:shadow-blue-600/30"
                                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 hover:shadow-emerald-600/30"
                            }`}
                        >
                            <Save className="w-4 h-4" />
                            {title === "Update" ? "Update User" : "Save User"}
                        </button>
                    </div>
                </div>

                <Toast
                    alerting={toastInfo.toastAlert}
                    severity={toastInfo.toastSeverity}
                    message={toastInfo.toastMessage}
                />

                {loading && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center">
                        <Loader />
                    </div>
                )}
            </div>
        </div>
    );
};

FormComponent.propTypes = {
    rolePriority: PropTypes.number
};

export default FormComponent;
