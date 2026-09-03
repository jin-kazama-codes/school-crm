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
import { Castle, Save, RotateCcw, X } from "lucide-react";

import API from "../../apis";
import Loader from "../common/Loader";
import Toast from "../common/Toast";
import SchoolHouseFormComponent from "./SchoolHouseFormComponent";

import { setMenuItem } from "../../redux/actions/NavigationAction";
import { Utility } from "../utility";

import formBg from "../assets/formBg.png";

const FormComponent = () => {
    const [title, setTitle] = useState("Create");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        schoolHouseData: { values: null, validated: false }
    });
    const [updatedValues, setUpdatedValues] = useState(null);
    const [dirty, setDirty] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [reset, setReset] = useState(false);

    const selected = useSelector(state => state.menuItems.selected);
    const toastInfo = useSelector(state => state.toastInfo);
    const schoolHouseFormRef = useRef();

    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const userParams = useParams();
    const { state } = useLocation();
    const { toastAndNavigate, getLocalStorage } = Utility();

    let id = state?.id || userParams?.id;

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        if(selectedMenu?.selected) {
            dispatch(setMenuItem(selectedMenu.selected));
        }
    }, []);

    const updateSchoolHouse = useCallback(formData => {
        setLoading(true);
        // eslint-disable-next-line no-unused-vars
        const { captainClassId, captainSectionId, viceCaptainClassId, viceCaptainSectionId, ...modifiedObj } = formData.schoolHouseData.values;

        API.SchoolHouseAPI.updateSchoolHouse(modifiedObj)
            .then(({ data: updatedData }) => {
                if (updatedData.status === 'Success') {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "info", "Successfully Updated", navigateTo, "/school-house/listing");
                }
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, `/school-house/update/${id}`);
                console.log('error updating school house', err);
            });
    }, [formData]);

    const populateSchoolHouseData = useCallback(id => {
        setLoading(true);
        const paths = [`/get-by-pk/school_house/${id}`];

        API.CommonAPI.multipleAPICall("GET", paths)
            .then(response => {
                if (response[0].data.status === 'Success') {
                    const captainId = response[0].data.data.captain;
                    const viceCaptainId = response[0].data.data.vice_captain;

                    Promise.all([
                        API.StudentAPI.getClassOfStudent(captainId),
                        API.StudentAPI.getClassOfStudent(viceCaptainId)
                    ])
                        .then(results => {
                            const [captainResult, viceCaptainResult] = results;
                            const dataObj = {
                                ...response[0].data.data,
                                captainClassId: captainResult.data.class,
                                captainSectionId: captainResult.data.section,
                                viceCaptainClassId: viceCaptainResult.data.class,
                                viceCaptainSectionId: viceCaptainResult.data.section
                            };
                            setUpdatedValues(dataObj);
                            setLoading(false);
                        })
                        .catch(error => {
                            console.error("Error in API calls of populating school house:", error);
                            setLoading(false);
                        });
                }
            })
            .catch(commonAPIError => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", commonAPIError ? commonAPIError?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
            });
    }, [id]);

    const createSchoolHouse = useCallback(formData => {
        setLoading(true);
        // eslint-disable-next-line no-unused-vars
        const { captainClassId, captainSectionId, viceCaptainClassId, viceCaptainSectionId, ...modifiedObj } = formData.schoolHouseData.values;

        API.SchoolHouseAPI.createSchoolHouse(modifiedObj)
            .then(({ data: schoolHouse }) => {
                if (schoolHouse.status === 'Success') {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "success", "Successfully Created", navigateTo, '/school-house/listing');
                }
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, err ? err.response?.data?.msg : "An Error Occurred");
                console.log('error creating school house', err);
            });
    }, [formData]);

    useEffect(() => {
        if (id && !submitted) {
            setTitle("Update");
            populateSchoolHouseData(id);
        }
        if (formData.schoolHouseData.validated) {
            formData.schoolHouseData.values?.id ? updateSchoolHouse(formData) : createSchoolHouse(formData);
        } else {
            setSubmitted(false);
        }
    }, [id, submitted]);

    const handleSubmit = async () => {
        await schoolHouseFormRef.current.Submit();
        setSubmitted(true);
    };

    const handleFormChange = (data, form) => {
        form == 'schoolHouse' ? setFormData({ ...formData, schoolHouseData: data }) : '';
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
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-inner">
                        <Castle className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                            {title} {selected}
                        </h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                            Fill in the required information below
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto pb-32">
                <SchoolHouseFormComponent
                    onChange={(data) => {
                        handleFormChange(data, 'schoolHouse');
                    }}
                    refId={schoolHouseFormRef}
                    setDirty={setDirty}
                    reset={reset}
                    setReset={setReset}
                    updatedValues={updatedValues}
                />
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[-0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[-0_-10px_40px_rgba(0,0,0,0.2)] z-20">
                <div className="max-w-7xl mx-auto flex items-center justify-end gap-4">
                    {title !== "Update" && (
                        <button
                            type="button"
                            disabled={!dirty || submitted}
                            onClick={() => {
                                if (window.confirm("Do You Really Want To Reset?")) {
                                    setReset(true);
                                }
                            }}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md shadow-amber-500/20"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Reset
                        </button>
                    )}
                    
                    <button
                        type="button"
                        onClick={() => navigateTo('/school-house/listing')}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all active:scale-95"
                    >
                        <X className="w-5 h-5" />
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSubmit()}
                        disabled={!dirty}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg ${
                            title === "Update"
                            ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 hover:shadow-blue-600/40"
                            : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 hover:shadow-emerald-600/40"
                        }`}
                    >
                        <Save className="w-5 h-5" />
                        Submit
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

export default FormComponent;
