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
import { RotateCcw, Save, ArrowLeft, Award, Loader2 } from "lucide-react";

import API from "../../apis";
import Loader from "../common/Loader";
import Toast from "../common/Toast";
import MarksheetFormComponent from "./MarksheetFormComponent";

import { setMenuItem } from "../../redux/actions/NavigationAction";
import { Utility } from "../utility";

import formBg from "../assets/formBg.png";

const FormComponent = () => {
    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const userParams = useParams();
    const { state } = useLocation();
    const { toastAndNavigate, getLocalStorage } = Utility();

    const [title, setTitle] = useState("Create");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        marksheetData: { values: null, validated: false }
    });
    const [updatedValues, setUpdatedValues] = useState(null);
    const [dirty, setDirty] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [reset, setReset] = useState(false);
    const [marksheetId, setMarksheetId] = useState(state?.id || null);

    const { marksheetClassData } = useSelector(state => state.allMarksheets);
    const selected = useSelector((state) => state.menuItems.selected);
    const toastInfo = useSelector((state) => state.toastInfo);
    const marksheetFormRef = useRef();

    let student_id = state?.student_id || userParams?.student_id;
    let term = state?.term;

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        if(selectedMenu?.selected) {
            dispatch(setMenuItem(selectedMenu.selected));
        }
    }, []);

    const populateMarksheetData = useCallback((student_id, term, mId) => {
        setLoading(true);
        const activeMarksheetId = mId || marksheetId || state?.id;
        const path = [
            `/get-marksheet/?page=0&size=10&student=${student_id}&term=${term}`,
            activeMarksheetId ? `/get-marksheet-data/${activeMarksheetId}` : `/get-marksheet-data/0`
        ];

        API.CommonAPI.multipleAPICall("GET", path)
            .then(response => {
                if (response[0]?.data?.status === 'Success') {
                    const fetchedRows = response[0]?.data?.data?.rows || [];
                    const fetchedId = fetchedRows[0]?.id || activeMarksheetId;
                    if (fetchedId) {
                        setMarksheetId(fetchedId);
                    }
                    const dataObj = {
                        marksheetData: fetchedRows,
                        marksheetMappingData: response[1]?.data?.data || []
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
    }, [marksheetId, state?.id]);

    const handleMarksheet = useCallback((formData) => {
        let promise;
        setLoading(true);
        const resolvedClassId = marksheetClassData?.classDataObj?.class_id || updatedValues?.marksheetData?.[0]?.class_id;
        const resolvedSectionId = marksheetClassData?.classDataObj?.section_id || updatedValues?.marksheetData?.[0]?.section_id;
        const targetMarksheetId = marksheetId || state?.id || updatedValues?.marksheetData?.[0]?.id;
        const isUpdate = Boolean(title === "Update" || student_id || targetMarksheetId);

        let payload = {
            session: formData.marksheetData.values.session,
            student_id: formData.marksheetData.values.student,
            class_id: resolvedClassId,
            section_id: resolvedSectionId,
            term: formData.marksheetData.values.term,
            result: formData.marksheetData.values.result,
            co_scholastic_data: {
                work_edu: formData.marksheetData.values.co_work_edu || "",
                art: formData.marksheetData.values.co_art || "",
                sports: formData.marksheetData.values.co_sports || "",
                gk: formData.marksheetData.values.co_gk || "",
            },
            discipline_data: {
                punctuality: formData.marksheetData.values.dis_punctuality || "",
                behavior: formData.marksheetData.values.dis_behavior || "",
                attitude: formData.marksheetData.values.dis_attitude || "",
                attendance: formData.marksheetData.values.dis_attendance || "",
            },
            overall_remark: formData.marksheetData.values.overall_remark || ""
        };
        if (!isUpdate) {
            // Create a new marksheet record
            promise = API.MarksheetAPI.createMarksheet(payload);
        } else {
            payload = {
                ...payload,
                id: targetMarksheetId
            };
            // Update existing marksheet record
            promise = API.MarksheetAPI.updateMarksheet(payload);
        }

        promise
            .then(async marksheet => {
                const effectiveMarksheetId = !isUpdate ? marksheet?.data?.data?.id : targetMarksheetId;

                // Deletes all the records on update from mapping table and insert new records
                if (isUpdate && targetMarksheetId) {
                    await API.MarksheetAPI.deleteFromMappingTable({ marksheet_id: targetMarksheetId });
                }

                const subjectsToInsert = (formData.marksheetData.values.subjects || [])
                    .map((subjectId, index) => {
                        const marks_obtained = formData.marksheetData.values[`marks_obtained_${index}`];
                        const total_marks = formData.marksheetData.values[`total_marks_${index}`];
                        const grade = formData.marksheetData.values[`grade_${index}`];
                        const remark = formData.marksheetData.values[`remark_${index}`];
                        const result = formData.marksheetData.values[`result_${index}`];

                        // Skip if all fields for this subject are blank
                        const isBlank = (marks_obtained === undefined || marks_obtained === null || String(marks_obtained).trim() === "") &&
                                        (total_marks === undefined || total_marks === null || String(total_marks).trim() === "") &&
                                        (!grade || String(grade).trim() === "") &&
                                        (!remark || String(remark).trim() === "") &&
                                        (!result || String(result).trim() === "");

                        if (isBlank) return null;

                        return {
                            marksheet_id: effectiveMarksheetId,
                            subject_id: subjectId,
                            marks_obtained: marks_obtained !== undefined && marks_obtained !== null && String(marks_obtained).trim() !== "" ? marks_obtained : null,
                            total_marks: total_marks !== undefined && total_marks !== null && String(total_marks).trim() !== "" ? total_marks : null,
                            grade: grade || null,
                            remark: remark || null,
                            result: result || null
                        };
                    })
                    .filter(Boolean);

                if (subjectsToInsert.length > 0) {
                    await Promise.all(
                        subjectsToInsert.map(payload2 => API.MarksheetAPI.insertIntoMappingTable(payload2))
                    );
                }

                setLoading(false);
                toastAndNavigate(dispatch, true, !isUpdate ? "success" : "info", !isUpdate ? "Successfully Created" : "Successfully Updated", navigateTo, '/marksheet/listing');
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
            });
    }, [formData, marksheetClassData, marksheetId, state?.id, student_id, title, updatedValues]);

    // Create/Update/Populate marksheet
    useEffect(() => {
        if (student_id && !submitted && !updatedValues) {
            setTitle("Update");
            populateMarksheetData(student_id, term, state?.id);
        }
        if (submitted && formData.marksheetData.validated) {
            setSubmitted(false);
            setFormData(prev => ({
                ...prev,
                marksheetData: { ...prev.marksheetData, validated: false }
            }));
            handleMarksheet(formData);
        } else if (submitted && !formData.marksheetData.validated) {
            setLoading(false);
            setSubmitted(false);
        }
    }, [submitted, student_id, term, formData.marksheetData.validated]);

    const handleSubmit = async () => {
        setLoading(true);
        await marksheetFormRef.current.Submit();
        setSubmitted(true);
    };

    const handleFormChange = (data, form) => {
        form === "marksheet" ? setFormData({ ...formData, marksheetData: data }) : null;
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
                                : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50"
                        }`}>
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                                {`${title} ${selected || "Marksheet"}`}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {title === "Update" 
                                    ? "Modify examination marks, grades, evaluation remarks, and term scores" 
                                    : "Enter examination results, per-subject scorecards, and promotion decisions"}
                            </p>
                        </div>
                    </div>
                    
                    <button
                        type="button"
                        onClick={() => navigateTo(`/marksheet/listing`)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#252525] rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to List
                    </button>
                </div>

                {/* Form Main Body */}
                <div className="p-6 space-y-6">
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
                </div>

                {/* Action Footer */}
                <div className="px-6 py-4 border-t border-slate-200/80 dark:border-[#222] bg-white/80 dark:bg-[#101010]/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {title !== "Update" && (
                            <button 
                                type="reset" 
                                disabled={!dirty || submitted || loading}
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
                            onClick={() => navigateTo(`/marksheet/listing`)}
                            disabled={loading}
                            className="px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#252525] rounded-xl transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        
                        <button 
                            type="submit" 
                            onClick={() => handleSubmit()} 
                            disabled={!dirty || submitted || loading}
                            className={`inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                title === "Update" 
                                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 hover:shadow-blue-600/30" 
                                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 hover:shadow-emerald-600/30"
                            }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>{title === "Update" ? "Updating..." : "Saving..."}</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>{title === "Update" ? "Update Marksheet" : "Save Marksheet"}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <Toast 
                    alerting={toastInfo.toastAlert}
                    severity={toastInfo.toastSeverity}
                    message={toastInfo.toastMessage}
                />

                {loading && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[99999] flex items-center justify-center p-4">
                        <Loader 
                            text={title === "Update" ? "Updating Marksheet..." : "Saving Marksheet..."} 
                            subtext="Processing subject marks and saving records securely"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default FormComponent;
