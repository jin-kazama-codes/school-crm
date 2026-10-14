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
import { Castle, Save, RotateCcw, ArrowLeft } from "lucide-react";

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

    const updateSchoolHouse = useCallback(async (dataPayload) => {
        setLoading(true);
        try {
            // eslint-disable-next-line no-unused-vars
            const { captainClassId, captainSectionId, viceCaptainClassId, viceCaptainSectionId, ...modifiedObj } = dataPayload.schoolHouseData.values;

            const res = await API.SchoolHouseAPI.updateSchoolHouse(modifiedObj);
            const updatedData = res?.data || res;
            if (updatedData.status === 'Success' || updatedData?.data) {
                setLoading(false);
                toastAndNavigate(dispatch, true, "info", "Successfully Updated", navigateTo, "/school-house/listing");
            } else {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", updatedData?.msg || "Failed to update school house", navigateTo, `/school-house/update/${id}`);
            }
        } catch (err) {
            setLoading(false);
            toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg || "An Error Occurred", navigateTo, `/school-house/update/${id}`);
            console.error('error updating school house', err);
        }
    }, [id, dispatch, navigateTo]);

    const populateSchoolHouseData = useCallback(async (houseId) => {
        setLoading(true);
        try {
            const paths = [`/get-by-pk/school_house/${houseId}`];
            const response = await API.CommonAPI.multipleAPICall("GET", paths);
            const rawHouse = response[0]?.data?.data || response[0]?.data;

            if (rawHouse) {
                const captainId = rawHouse.captain;
                const viceCaptainId = rawHouse.vice_captain;

                const [captainResult, viceCaptainResult] = await Promise.all([
                    captainId ? API.StudentAPI.getClassOfStudent(captainId).catch(() => ({ data: {} })) : Promise.resolve({ data: {} }),
                    viceCaptainId ? API.StudentAPI.getClassOfStudent(viceCaptainId).catch(() => ({ data: {} })) : Promise.resolve({ data: {} })
                ]);

                const dataObj = {
                    ...rawHouse,
                    name: rawHouse.name || "",
                    color_code: rawHouse.color_code || "",
                    captain: rawHouse.captain || "",
                    vice_captain: rawHouse.vice_captain || "",
                    teacher_incharge: rawHouse.teacher_incharge || "",
                    strength: rawHouse.strength !== null && rawHouse.strength !== undefined ? rawHouse.strength : "",
                    status: rawHouse.status || "active",
                    captainClassId: captainResult?.data?.class || captainResult?.class || "",
                    captainSectionId: captainResult?.data?.section || captainResult?.section || "",
                    viceCaptainClassId: viceCaptainResult?.data?.class || viceCaptainResult?.class || "",
                    viceCaptainSectionId: viceCaptainResult?.data?.section || viceCaptainResult?.section || ""
                };
                setUpdatedValues(dataObj);
            }
            setLoading(false);
        } catch (commonAPIError) {
            setLoading(false);
            toastAndNavigate(dispatch, true, "error", commonAPIError?.response?.data?.msg || "Failed to load school house data", navigateTo, 0);
        }
    }, [dispatch, navigateTo]);

    const createSchoolHouse = useCallback(async (dataPayload) => {
        setLoading(true);
        try {
            // eslint-disable-next-line no-unused-vars
            const { captainClassId, captainSectionId, viceCaptainClassId, viceCaptainSectionId, ...modifiedObj } = dataPayload.schoolHouseData.values;

            const res = await API.SchoolHouseAPI.createSchoolHouse(modifiedObj);
            const schoolHouse = res?.data || res;
            if (schoolHouse.status === 'Success' || schoolHouse?.data) {
                setLoading(false);
                toastAndNavigate(dispatch, true, "success", "Successfully Created", navigateTo, '/school-house/listing');
            } else {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", schoolHouse?.msg || "Failed to create school house");
            }
        } catch (err) {
            setLoading(false);
            toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg || "An Error Occurred");
            console.error('error creating school house', err);
        }
    }, [dispatch, navigateTo]);

    useEffect(() => {
        if (id) {
            setTitle("Update");
            populateSchoolHouseData(id);
        }
    }, [id]);

    useEffect(() => {
        if (submitted && formData.schoolHouseData.validated) {
            formData.schoolHouseData.values?.id ? updateSchoolHouse(formData) : createSchoolHouse(formData);
            setSubmitted(false);
        } else if (submitted && !formData.schoolHouseData.validated) {
            setSubmitted(false);
        }
    }, [submitted, formData, updateSchoolHouse, createSchoolHouse]);

    const handleSubmit = async () => {
        if (schoolHouseFormRef.current?.Submit) {
            await schoolHouseFormRef.current.Submit();
            setSubmitted(true);
        }
    };

    const handleFormChange = (data, form) => {
        if (form === 'schoolHouse') {
            setFormData({ ...formData, schoolHouseData: data });
        }
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex items-start justify-center">
            <div 
                className="w-full max-w-7xl rounded-2xl border border-slate-200/90 dark:border-[#262626] overflow-hidden shadow-2xl relative bg-white dark:bg-[#101010]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0.94)), url(${formBg?.src || formBg})`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    backgroundAttachment: "fixed"
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
                            <Castle className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                                {`${title} ${selected || "School House"}`}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {title === "Update" 
                                    ? "Modify house identity, color branding, teacher incharge, and student leadership" 
                                    : "Configure house details, faculty incharge, and appoint house captains & vice captains"}
                            </p>
                        </div>
                    </div>
                    
                    <button
                        type="button"
                        onClick={() => navigateTo('/school-house/listing')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#252525] rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to List
                    </button>
                </div>

                {/* Form Main Body */}
                <div className="p-6 space-y-6">
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

                {/* Action Footer */}
                <div className="px-6 py-4 border-t border-slate-200/80 dark:border-[#222] bg-white/80 dark:bg-[#101010]/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {title !== "Update" && (
                            <button 
                                type="button" 
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
                            onClick={() => navigateTo('/school-house/listing')}
                            className="px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#252525] rounded-xl transition-all cursor-pointer shadow-2xs"
                        >
                            Cancel
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={() => handleSubmit()} 
                            disabled={!dirty || submitted}
                            className={`inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                title === "Update" 
                                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 hover:shadow-blue-600/30" 
                                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 hover:shadow-emerald-600/30"
                            }`}
                        >
                            <Save className="w-4 h-4" />
                            {title === "Update" ? "Update School House" : "Save School House"}
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

export default FormComponent;
