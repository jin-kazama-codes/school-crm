/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 */

import { useCallback, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "@/lib/routerAdapter";
import { useDispatch, useSelector } from "react-redux";
import { RotateCcw, X as XIcon, Save, BookOpenCheck, ArrowLeft } from "lucide-react";

import API from "../../apis";
import Loader from "../common/Loader";
import Toast from "../common/Toast";
import HomeworkFormComponent from "./HomeworkFormComponent";

import { setMenuItem } from "../../redux/actions/NavigationAction";
import { Utility } from "../utility";
import formBg from "../assets/formBg.png";

const FormComponent = () => {
    const [title, setTitle] = useState("Create");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        homeworkData: { values: null, validated: false },
    });
    const [updatedValues, setUpdatedValues] = useState(null);
    const [dirty, setDirty] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [reset, setReset] = useState(false);

    const selected = useSelector(state => state.menuItems.selected);
    const toastInfo = useSelector(state => state.toastInfo);

    const homeworkFormRef = useRef();
    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const userParams = useParams();
    const { pathname, state } = useLocation();
    const { toastAndNavigate, getLocalStorage } = Utility();

    const isCreate = pathname?.includes("/create") || pathname?.endsWith("/create");
    let id = isCreate ? undefined : (userParams?.id || state?.id);

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        if (selectedMenu?.selected) dispatch(setMenuItem(selectedMenu.selected));
    }, []);

    const updateHomework = useCallback(formData => {
        const values = { ...formData.homeworkData.values };
        if (values.class_id) values.class_id = parseInt(String(values.class_id), 10);
        if (values.section_id) values.section_id = parseInt(String(values.section_id), 10);
        if (values.subject_id) values.subject_id = parseInt(String(values.subject_id), 10);
        const dataFields = [values];
        const paths = ["/homework"];
        setLoading(true);

        API.CommonAPI.multipleAPICall("PATCH", paths, dataFields)
            .then(responses => {
                let status = true;
                responses.forEach(resp => { if (resp.data.status !== "Success") status = false; });
                if (status) {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "info", "Successfully Updated", navigateTo, "/homework/listing");
                } else {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "error", "An Error Occurred, Please Try Again");
                }
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg || "An Error Occurred");
                throw err;
            });
    }, [formData]);

    const populateHomeworkData = useCallback(id => {
        setLoading(true);
        const paths = [`/get-by-pk/homework/${id}`];
        API.CommonAPI.multipleAPICall("GET", paths)
            .then(responses => {
                const dataObj = { homeworkData: responses[0].data.data };
                setUpdatedValues(dataObj);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg || "An Error Occurred");
                throw err;
            });
    }, [id]);

    const createHomework = useCallback(formData => {
        setLoading(true);
        const values = { ...formData.homeworkData.values };
        if (values.class_id) values.class_id = parseInt(String(values.class_id), 10);
        if (values.section_id) values.section_id = parseInt(String(values.section_id), 10);
        if (values.subject_id) values.subject_id = parseInt(String(values.subject_id), 10);
        API.HomeworkAPI.createHomework(values)
            .then(() => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "success", "Successfully Created", navigateTo, "/homework/listing");
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg || "An Error Occurred");
                throw err;
            });
    }, [formData]);

    useEffect(() => {
        if (isCreate) {
            setTitle("Create");
            setUpdatedValues(null);
            setFormData({
                homeworkData: { values: null, validated: false },
            });
            setDirty(false);
            setSubmitted(false);
            setReset(true);
        } else if (id && !submitted) {
            setTitle("Update");
            populateHomeworkData(id);
        }
    }, [id, isCreate, pathname]);

    useEffect(() => {
        if (formData.homeworkData.validated) {
            (!isCreate && (formData.homeworkData.values?.id || id)) 
                ? updateHomework(formData) 
                : createHomework(formData);
        } else {
            setSubmitted(false);
        }
    }, [formData.homeworkData.validated]);

    const handleSubmit = async () => {
        await homeworkFormRef.current.Submit();
        setSubmitted(true);
    };

    const handleFormChange = (data, form) => {
        if (form === "homework") setFormData({ ...formData, homeworkData: data });
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
                            <BookOpenCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                                {`${title} ${selected || "Homework"}`}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {title === "Update" ? "Modify existing curriculum homework task and instructions" : "Assign and distribute new homework task across class standards"}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigateTo("/homework/listing")}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#252525] rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to List
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <HomeworkFormComponent
                        onChange={(data) => handleFormChange(data, "homework")}
                        refId={homeworkFormRef}
                        setDirty={setDirty}
                        reset={reset}
                        setReset={setReset}
                        updatedValues={updatedValues?.homeworkData}
                    />
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200/80 dark:border-[#222] bg-white/80 dark:bg-[#101010]/80 backdrop-blur-md flex items-center justify-between gap-3">
                    <div>
                        {title !== "Update" && (
                            <button
                                type="reset"
                                disabled={!dirty || submitted}
                                onClick={() => { if (window.confirm("Do you really want to reset this form?")) setReset(true); }}
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
                            onClick={() => navigateTo("/homework/listing")}
                            className="px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#252525] rounded-xl transition-all cursor-pointer shadow-2xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={() => handleSubmit()}
                            disabled={!dirty}
                            className={`inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                title === "Update"
                                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 hover:shadow-blue-600/30"
                                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 hover:shadow-emerald-600/30"
                            }`}
                        >
                            <Save className="w-4 h-4" />
                            {title === "Update" ? "Update Homework" : "Save Homework"}
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
