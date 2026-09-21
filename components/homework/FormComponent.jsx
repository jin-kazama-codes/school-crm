/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 */

import { useCallback, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "@/lib/routerAdapter";
import { useDispatch, useSelector } from "react-redux";
import { RotateCcw, X as XIcon, Save } from "lucide-react";

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
    const { state } = useLocation();
    const { toastAndNavigate, getLocalStorage } = Utility();

    let id = state?.id || userParams?.id;

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
                }
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg);
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
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg);
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
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg);
                throw err;
            });
    }, [formData]);

    useEffect(() => {
        if (id && !submitted) {
            setTitle("Update");
            populateHomeworkData(id);
        }
        if (formData.homeworkData.validated) {
            formData.homeworkData.values?.id ? updateHomework(formData) : createHomework(formData);
        } else {
            setSubmitted(false);
        }
    }, [id, submitted]);

    const handleSubmit = async () => {
        await homeworkFormRef.current.Submit();
        setSubmitted(true);
    };

    const handleFormChange = (data, form) => {
        if (form === "homework") setFormData({ ...formData, homeworkData: data });
    };

    return (
        <div
            className="m-4 md:m-8 rounded-[26px] border border-slate-200 dark:border-[#2a2a2a] overflow-hidden shadow-2xl relative animate-in fade-in duration-300 min-h-[70vh]"
            style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${formBg?.src || formBg})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundAttachment: "fixed",
            }}
        >
            <div className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-b border-white/20 dark:border-white/5 p-6">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight capitalize">
                    {`${title} ${selected}`}
                </h2>
            </div>

            <div className="p-4 md:p-6 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                <HomeworkFormComponent
                    onChange={(data) => handleFormChange(data, "homework")}
                    refId={homeworkFormRef}
                    setDirty={setDirty}
                    reset={reset}
                    setReset={setReset}
                    updatedValues={updatedValues?.homeworkData}
                />

                <div className="flex flex-wrap justify-end gap-4 p-6 pt-0">
                    {title !== "Update" && (
                        <button
                            type="reset"
                            disabled={!dirty || submitted}
                            onClick={() => { if (window.confirm("Do You Really Want To Reset?")) setReset(true); }}
                            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-white rounded-xl font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Reset
                        </button>
                    )}
                    <button
                        onClick={() => navigateTo("/homework/listing")}
                        className="flex items-center gap-2 px-6 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25 dark:hover:text-rose-200 border border-rose-200/80 dark:border-rose-500/30 rounded-xl font-semibold shadow-sm shadow-rose-500/10 hover:shadow-rose-500/20 transition-all cursor-pointer active:scale-95"
                    >
                        <XIcon className="w-5 h-5" />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={() => handleSubmit()}
                        disabled={!dirty}
                        className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 ${
                            title === "Update"
                                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 hover:shadow-blue-600/40"
                                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 hover:shadow-emerald-600/40"
                        }`}
                    >
                        <Save className="w-5 h-5" />
                        {title === "Update" ? "Update Homework" : "Submit"}
                    </button>
                </div>
            </div>

            <Toast
                alerting={toastInfo.toastAlert}
                severity={toastInfo.toastSeverity}
                message={toastInfo.toastMessage}
            />

            {loading && <Loader />}
        </div>
    );
};

export default FormComponent;
