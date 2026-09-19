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
import MarksheetFormComponent from "./MarksheetFormComponent";

import { setMenuItem } from "../../redux/actions/NavigationAction";
import { Utility } from "../utility";

import formBg from "../assets/formBg.png";

const FormComponent = () => {
    const [title, setTitle] = useState("Create");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        marksheetData: { values: null, validated: false }
    });
    const [updatedValues, setUpdatedValues] = useState(null);
    const [dirty, setDirty] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [reset, setReset] = useState(false);

    const { marksheetClassData } = useSelector(state => state.allMarksheets);
    const selected = useSelector((state) => state.menuItems.selected);
    const toastInfo = useSelector((state) => state.toastInfo);
    const marksheetFormRef = useRef();

    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const userParams = useParams();
    const { state } = useLocation();
    const { toastAndNavigate, getLocalStorage } = Utility();

    let student_id = state?.student_id || userParams?.student_id;
    let term = state?.term;
    let marksheet_id = state?.id;



    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        if(selectedMenu?.selected) {
            dispatch(setMenuItem(selectedMenu.selected));
        }
    }, []);

    const populateMarksheetData = useCallback((student_id, term, marksheet_id) => {
        setLoading(true);
        const path = [`/get-marksheet/?page=0&size=10&student=${student_id}&term=${term}`, `/get-marksheet-data/${marksheet_id}`];

        API.CommonAPI.multipleAPICall("GET", path)
            .then(response => {
                if (response[0].data.status === 'Success') {
                    const dataObj = {
                        marksheetData: response[0].data.data.rows,
                        marksheetMappingData: response[1].data.data
                    };
                    setUpdatedValues(dataObj);
                    setLoading(false);
                }
            })
            .catch((err) => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
                throw err;
            });
    }, [student_id, term, marksheet_id]);

    const handleMarksheet = useCallback((formData, studentId) => {
        let promise;
        setLoading(true);
        let payload = {
            session: formData.marksheetData.values.session,
            student_id: formData.marksheetData.values.student,
            class_id: marksheetClassData.classDataObj.class_id,
            section_id: marksheetClassData.classDataObj.section_id,
            term: formData.marksheetData.values.term,
            result: formData.marksheetData.values.result
        };
        if (!studentId) {
            // Create a new marksheet record if studentId is not provided
            promise = API.MarksheetAPI.createMarksheet(payload);
        } else {
            payload = {
                ...payload,
                id: marksheet_id
            }
            // Update an existing marksheet record if studentId is provided
            promise = API.MarksheetAPI.updateMarksheet(payload);
        }

        promise
            .then(async marksheet => {
                // Deletes all the records on update from mapping table and insert new records
                if (studentId) {
                    await API.MarksheetAPI.deleteFromMappingTable({ marksheet_id: marksheet_id });
                }
                formData.marksheetData.values.subjects.map((subjectId, index) => {
                    let payload2 = {
                        marksheet_id: !studentId ? marksheet.data.data.id : marksheet_id,
                        subject_id: subjectId,
                        marks_obtained: formData.marksheetData.values[`marks_obtained_${index}`],
                        total_marks: formData.marksheetData.values[`total_marks_${index}`],
                        grade: formData.marksheetData.values[`grade_${index}`],
                        remark: formData.marksheetData.values[`remark_${index}`],
                        result: formData.marksheetData.values[`result_${index}`]
                    }
                    // if update it runs create after delete mapping table and if create it do not run any delete and create into mapping table 
                    API.MarksheetAPI.insertIntoMappingTable(payload2)
                        .then(() => {
                            setLoading(false);
                            toastAndNavigate(dispatch, true, !studentId ? "success" : "info", !studentId ? "Successfully Created" : "Successfully Updated", navigateTo, '/marksheet/listing');
                        })
                        .catch(err => {
                            setLoading(false);
                            toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
                        });
                })
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
            });
    }, [formData]);

    //Create/Update/Populate marksheet
    useEffect(() => {
        if (student_id && !submitted) {
            setTitle("Update");
            populateMarksheetData(student_id, term, marksheet_id);
        }
        if (formData.marksheetData.validated) {
            handleMarksheet(formData, student_id)
        } else {
            setSubmitted(false);
        }
    }, [submitted, student_id, term]);

    const handleSubmit = async () => {
        await marksheetFormRef.current.Submit();
        setSubmitted(true);
    };

    const handleFormChange = (data, form) => {
        form === "marksheet" ? setFormData({ ...formData, marksheetData: data }) : null;
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
                    <MarksheetFormComponent
                        onChange={(data) => {
                            handleFormChange(data, "marksheet");
                        }}
                        refId={marksheetFormRef}
                        setDirty={setDirty}
                        reset={reset}
                        setReset={setReset}
                        updatedValues={updatedValues}
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
                            onClick={() => navigateTo(`/marksheet/listing`)}
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
                            {title === "Update" ? "Update Marksheet" : "Submit"}
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
