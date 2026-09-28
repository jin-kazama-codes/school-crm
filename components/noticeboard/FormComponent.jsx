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
import dayjs from "dayjs";
import { RotateCcw, X as XIcon, Save, Megaphone, ArrowLeft } from "lucide-react";

import API from "../../apis";
import Loader from "../common/Loader";
import Toast from "../common/Toast";

import { setMenuItem } from "../../redux/actions/NavigationAction";
import { Utility } from "../utility";

import formBg from "../assets/formBg.png";
import NoticeBoardFormComponent from "./NoticeBoardFormComponent";

const FormComponent = () => {
    const [title, setTitle] = useState("Create");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        noticeboardData: { values: null, validated: false },
        imageData: { values: null, validated: true }
    });
    const [updatedValues, setUpdatedValues] = useState(null);
    const [dirty, setDirty] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [reset, setReset] = useState(false);

    const selected = useSelector(state => state.menuItems.selected);
    const toastInfo = useSelector(state => state.toastInfo);

    const noticeboardFormRef = useRef();

    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const userParams = useParams();
    const { pathname, state } = useLocation();
    const { toastAndNavigate, getLocalStorage } = Utility();

    const isCreate = pathname?.includes("/create") || pathname?.endsWith("/create");
    let id = isCreate ? undefined : (userParams?.id || state?.id);

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        if (selectedMenu?.selected) {
            dispatch(setMenuItem(selectedMenu.selected));
        }
    }, []);

    const updateNoticeBoard = useCallback(formData => {
        const values = { ...formData.noticeboardData.values };
        if (!values.id && id) {
            values.id = id;
        }
        const dataFields = [values];
        const paths = ["/update-notice"];
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
                    toastAndNavigate(dispatch, true, "info", "Successfully Updated", navigateTo, `/noticeboard/listing`);
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
    }, [formData, id]);

    const populateNoticeBoardData = useCallback(id => {
        setLoading(true);
        const paths = [`/get-by-pk/noticeboard/${id}`];
        API.CommonAPI.multipleAPICall("GET", paths)
            .then(responses => {
                if (responses[0]?.data?.data) {
                    if (responses[0].data.data.publish_date) {
                        responses[0].data.data.publish_date = dayjs(responses[0].data.data.publish_date);
                    }
                    if (responses[0].data.data.expiry_date) {
                        responses[0].data.data.expiry_date = dayjs(responses[0].data.data.expiry_date);
                    }
                }
                const dataObj = {
                    noticeboardData: responses[0]?.data?.data
                };
                setUpdatedValues(dataObj);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg || "An Error Occurred");
                throw err;
            });
    }, [id]);

    const createNoticeBoard = useCallback(formData => {
        setLoading(true);
        API.NoticeBoardAPI.createNoticeBoard({ ...formData.noticeboardData.values })
            .then(({ data: noticeboard }) => {
                if (noticeboard?.status === 'Success' || noticeboard?.status === 200 || !noticeboard?.status) {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "success", "Successfully Created", navigateTo, `/noticeboard/listing`);
                } else {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "error", noticeboard?.msg || "Failed to create notice");
                }
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
                noticeboardData: { values: null, validated: false },
                imageData: { values: null, validated: true }
            });
            setDirty(false);
            setSubmitted(false);
            setReset(true);
        } else if (id && !submitted) {
            setTitle("Update");
            populateNoticeBoardData(id);
        }
    }, [id, isCreate, pathname]);

    useEffect(() => {
        if (formData.noticeboardData.validated) {
            (!isCreate && (formData.noticeboardData.values?.id || id)) 
                ? updateNoticeBoard(formData) 
                : createNoticeBoard(formData);
        } else {
            setSubmitted(false);
        }
    }, [formData.noticeboardData.validated]);

    const handleSubmit = async () => {
        await noticeboardFormRef.current.Submit();
        setSubmitted(true);
    };

    const handleFormChange = (data, form) => {
        if (form === 'noticeboard') {
            setFormData({ ...formData, noticeboardData: data });
        }
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
                            <Megaphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                                {`${title} ${selected || "Notice Board"}`}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {title === "Update" 
                                    ? "Modify existing notice announcement, validity dates, and publish status" 
                                    : "Publish and broadcast a new official announcement to the school notice board"}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigateTo("/noticeboard/listing")}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#252525] rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to List
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <NoticeBoardFormComponent
                        onChange={(data) => {
                            handleFormChange(data, 'noticeboard');
                        }}
                        refId={noticeboardFormRef}
                        setDirty={setDirty}
                        reset={reset}
                        setReset={setReset}
                        userId={id}
                        updatedValues={updatedValues?.noticeboardData}
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
                            onClick={() => navigateTo("/noticeboard/listing")}
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
                            {title === "Update" ? "Update Notice" : "Publish Notice"}
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
