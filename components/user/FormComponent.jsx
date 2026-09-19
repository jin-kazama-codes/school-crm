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
import { UserCircle, Save, RotateCcw, X } from "lucide-react";

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
    const { state } = useLocation();
    const { toastAndNavigate, getLocalStorage } = Utility();
    let id = state?.id || userParams?.id;
    const schoolId = getLocalStorage("auth")?.id;

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        if(selectedMenu?.selected) {
            dispatch(setMenuItem(selectedMenu.selected));
        }
    }, []);

    const updateUserAndAddress = useCallback(formData => {
        const dataFields = [
            { ...formData.userData.values },
            { ...formData.addressData.values }
        ];
        const paths = ["/update-user", "/update-address"];
        setLoading(true);

        if (!formData.userData.password) {
            delete formData.userData.password;
        }
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
                    toastAndNavigate(dispatch, true, "info", "Successfully Updated", navigateTo, `/${selected.toLowerCase()}/listing`);
                }
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
                console.log('Error in user update', err);
            });
    }, [formData]);

    const populateUserData = useCallback(id => {
        setLoading(true);
        const paths = [`/get-by-pk/user/${id}`, `/get-address/user/${id}`];

        API.CommonAPI.multipleAPICall("GET", paths)
            .then(responses => {
                const dataObj = {
                    userData: responses[0].data.data,
                    addressData: responses[1]?.data?.data
                };
                setUpdatedValues(dataObj);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
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
                            toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
                            console.log('Error in user create', err);
                        });
                }
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
                console.log('Error in user create', err);
            });
    }, []);

    useEffect(() => {
        if (id && !submitted) {
            setTitle("Update");
            populateUserData(id);
        }
        if (formData.userData.validated && formData.addressData.validated) {
            formData.userData.values?.id ? updateUserAndAddress(formData) : registerUser(formData);
        } else {
            setSubmitted(false);
        }
    }, [id, submitted]);

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
        <div 
            className="min-h-[90vh] m-4 md:m-8 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in duration-500 relative border border-slate-200 dark:border-slate-800"
            style={{
                backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(${formBg?.src || formBg})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "start",
                backgroundSize: "cover",
                backgroundAttachment: "fixed",
            }}
        >
            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-6 md:px-10 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl shadow-inner">
                        <UserCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                            {title} {selected}
                        </h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                            {title === "Create" ? "Register a new user" : "Update user details"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
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

                <div className="flex flex-wrap items-center justify-end gap-4 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    {title !== "Update" && (
                        <button 
                            type="button" 
                            disabled={!dirty || submitted}
                            onClick={() => {
                                if (window.confirm("Do You Really Want To Reset?")) {
                                    setReset(true);
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
                        onClick={() => navigateTo(`/${selected.toLowerCase()}/listing`)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25 dark:hover:text-rose-200 border border-rose-200/80 dark:border-rose-500/30 rounded-xl font-semibold shadow-sm shadow-rose-500/10 hover:shadow-rose-500/20 transition-all cursor-pointer active:scale-95"
                    >
                        <X className="w-5 h-5" />
                        Cancel
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={() => handleSubmit()} 
                        disabled={!dirty || submitted}
                        className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 ${
                            title === "Update" 
                            ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 hover:shadow-blue-600/40" 
                            : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 hover:shadow-emerald-600/40"
                        }`}
                    >
                        <Save className="w-5 h-5" />
                        {title === "Update" ? "Update User" : "Submit"}
                    </button>
                </div>
            </div>

            <Toast 
                alerting={toastInfo.toastAlert}
                severity={toastInfo.toastSeverity}
                message={toastInfo.toastMessage}
            />
            {loading && (
                <div className="fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <Loader />
                </div>
            )}
        </div>
    );
};

FormComponent.propTypes = {
    rolePriority: PropTypes.number
};

export default FormComponent;
