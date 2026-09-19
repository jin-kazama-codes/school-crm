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
import { RotateCcw, X as XIcon, Save } from "lucide-react";

import API from "../../apis";
import Loader from "../common/Loader";
import Toast from "../common/Toast";
import TimeTableFormComponent from "./TimeTableFormComponent";

import { setAllSubjects } from "../../redux/actions/SubjectAction";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { Utility } from "../utility";

import formBg from "../assets/formBg.png";

const FormComponent = () => {
    const [title, setTitle] = useState("Create");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        timeTableData: { values: null, validated: false }
    });
    const [updatedValues, setUpdatedValues] = useState(null);
    const [dirty, setDirty] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [reset, setReset] = useState(false);
    const [classData, setClassData] = useState([]);

    const allSubjects = useSelector(state => state.allSubjects);
    const selected = useSelector(state => state.menuItems.selected);
    const toastInfo = useSelector(state => state.toastInfo);
    
    const timeTableFormRef = useRef();

    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const userParams = useParams();
    const { state } = useLocation();
    const { getLocalStorage, fetchAndSetAll, toastAndNavigate } = Utility();

    let class_id = state?.class_id || userParams?.class_id;
    let section_id = state?.section_id || userParams?.section_id;
    let day = state?.day;
    let batch = state?.batch;

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        if(selectedMenu?.selected){
            dispatch(setMenuItem(selectedMenu.selected));
        }
    }, []);

    const updateTimeTable = useCallback(formData => {
        let promises = [];
        setLoading(true);
        let payloadBase = {
            day: formData.timeTableData.values.day,
            class_id: formData.timeTableData.values.class,
            section_id: formData.timeTableData.values.section,
            batch: formData.timeTableData.values.batch
        };

        promises = formData.timeTableData.values.period.map((item, index) => {
            const payload = {
                ...payloadBase,
                period: item,
                id: formData.timeTableData.values[`dbId_${index}`],
                duration: formData.timeTableData.values.duration[index],
                subject_id: formData.timeTableData.values[`subject${index + 1}`],
            };
            API.TimeTableAPI.updateTimeTable(payload);
        });

        return Promise.all(promises)
            .then(() => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "info", "Successfully updated", navigateTo, `/time-table/listing`);
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
            });
    }, [formData]);


    const populateTimeTableData = useCallback((class_id, section_id, day, batch) => {
        setLoading(true);
        const path = [`/get-time-tables/?page=0&size=12&classId=${class_id}&section=${section_id}&day=${day}&batch=${batch}`];

        API.CommonAPI.multipleAPICall("GET", path)
            .then(response => {
                if (response[0].data.status === 'Success') {
                    const dataObj = {
                        timeTableData: response[0].data.data.rows
                    };
                    setUpdatedValues(dataObj);
                    setLoading(false);
                }
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
            });
    }, [class_id, section_id, day, batch]);

    const createTimeTable = useCallback(formData => {
        let promises = [];
        setLoading(true);
        let payloadBase = {
            day: formData.timeTableData.values.day,
            class_id: formData.timeTableData.values.class,
            section_id: formData.timeTableData.values.section,
            batch: formData.timeTableData.values.batch
        };

        promises = formData.timeTableData.values.period.map((item, index) => {
            const payload = {
                ...payloadBase,
                period: item,
                duration: formData.timeTableData.values.duration[index],
                subject_id: formData.timeTableData.values[`subject${index + 1}`]
            }
            API.TimeTableAPI.createTimeTable(payload);
        });

        return Promise.all(promises)
            .then(() => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "success", "Successfully Created", navigateTo, `/time-table/listing`, true);
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
            });
    }, [formData]);

    useEffect(() => {
        if (!allSubjects?.listData?.length) {
            fetchAndSetAll(dispatch, setAllSubjects, API.SubjectAPI);
        }
    }, [allSubjects?.listData?.length]);

    //Create/Update/Populate TimeTable
    useEffect(() => {
        if (class_id && section_id && !submitted) {
            setTitle("Update");
            populateTimeTableData(class_id, section_id, day, batch);
        }
        if (formData.timeTableData.validated) {
            (class_id && section_id) ? updateTimeTable(formData) : createTimeTable(formData);
        } else {
            setSubmitted(false);
        }
    }, [submitted, class_id, section_id, day, batch]);

    const handleSubmit = async () => {
        await timeTableFormRef.current.Submit();
        setSubmitted(true);
    };

    const handleFormChange = (data, form) => {
        if(form === 'timeTable') setFormData({ ...formData, timeTableData: data });
    };

    return (
        <div 
            className="m-4 md:m-8 rounded-[26px] border border-slate-200 dark:border-[#2a2a2a] overflow-hidden shadow-2xl relative animate-in fade-in duration-300 min-h-[70vh]"
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${formBg?.src || formBg})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundAttachment: "fixed"
            }}
        >
            <div className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-b border-white/20 dark:border-white/5 p-6 sticky top-0 z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight capitalize">
                    {`${title} ${selected}`}
                </h2>
            </div>

            <div className="p-4 md:p-6 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                <div className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <TimeTableFormComponent
                        onChange={(data) => {
                            handleFormChange(data, 'timeTable');
                        }}
                        refId={timeTableFormRef}
                        setDirty={setDirty}
                        reset={reset}
                        setReset={setReset}
                        classData={classData}
                        setClassData={setClassData}
                        allSubjects={allSubjects?.listData}
                        updatedValues={updatedValues?.timeTableData}
                    />

                    <div className="flex flex-wrap items-center justify-end gap-4 p-6 border-t border-slate-200 dark:border-slate-800">
                        {title !== "Update" && (
                            <button 
                                type="reset" 
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
                            onClick={() => navigateTo(`/time-table/listing`)}
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
                            {title === "Update" ? "Update Timetable" : "Submit"}
                        </button>
                    </div>
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
