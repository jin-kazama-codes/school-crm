/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import PropTypes from "prop-types";
import { useCallback, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "@/lib/routerAdapter";
import { X, CreditCard, History, RotateCcw, Save } from "lucide-react";

import API from "../../apis";
import Loader from "../common/Loader";
import PaymentFormComponent from "./PaymentFormComponent";
import Toast from "../common/Toast";

import { setMenuItem } from "../../redux/actions/NavigationAction";
import { Utility } from "../utility";
import PaymentDataTable from "./PaymentDataTable";

import formBg from "../assets/formBg.png";

const FormComponent = ({ openDialog, setOpenDialog }) => {
    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    const [title, setTitle] = useState("Create");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        paymentData: { values: null, validated: false }
    });
    const [dirty, setDirty] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [reset, setReset] = useState(false);

    const selected = useSelector((state) => state.menuItems.selected);
    const toastInfo = useSelector((state) => state.toastInfo);
    const navigateTo = useNavigate();
    const paymentFormRef = useRef();

    const dispatch = useDispatch();
    const { state } = useLocation();
    const { capitalizeEveryWord, toastAndNavigate, getLocalStorage } = Utility();
    const studentName = state?.lastname ? `${state?.firstname} ${state?.lastname}` : state?.firstname;

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        if(selectedMenu?.selected) {
            dispatch(setMenuItem(selectedMenu.selected));
        }
    }, []);

    const createPayment = useCallback(formData => {
        setLoading(true);
        // eslint-disable-next-line no-unused-vars
        const { current_date, class_fee_by_mapping, ...modifiedObj } = formData.paymentData.values;

        API.PaymentAPI.createPayment(modifiedObj)
            .then(({ data: payment }) => {
                if (payment.status === 'Success') {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "success", "Successfully Created", navigateTo, '#', true);
                }
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, '#', true);
            });
    }, [formData]);

    useEffect(() => {
        if (formData.paymentData.validated) {
            createPayment(formData);
        }
    }, [submitted]);

    const handleSubmit = async () => {
        await paymentFormRef.current.Submit();
        setSubmitted(true);
    };

    const handleFormChange = (data, form) => {
        if(form === 'payment') setFormData({ ...formData, paymentData: data });
    };

    if (!openDialog) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="w-full max-w-7xl h-[95vh] flex flex-col bg-white dark:bg-[#1a1a1a] rounded-[24px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300"
                style={{
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(${formBg?.src || formBg})`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "cover"
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-black/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                                {selected} Management
                            </h2>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                {studentName ? capitalizeEveryWord(studentName) : 'Student'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleDialogClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
                    
                    {/* History Section */}
                    <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-2">
                            <History className="w-5 h-5 text-slate-500" />
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                                Payment History
                            </h3>
                        </div>
                        <div className="p-2 md:p-4">
                            <PaymentDataTable />
                        </div>
                    </div>

                    {/* New Payment Section */}
                    <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                                {title} New Payment
                            </h3>
                        </div>
                        <div className="p-2 md:p-4">
                            <PaymentFormComponent
                                onChange={(data) => handleFormChange(data, 'payment')}
                                refId={paymentFormRef}
                                setDirty={setDirty}
                                reset={reset}
                                setReset={setReset}
                            />
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-black/50 backdrop-blur-md flex justify-end gap-4 sticky bottom-0 z-10">
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
                        type="button"
                        onClick={handleDialogClose}
                        className="flex items-center gap-2 px-6 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25 dark:hover:text-rose-200 border border-rose-200/80 dark:border-rose-500/30 rounded-xl font-semibold shadow-sm shadow-rose-500/10 hover:shadow-rose-500/20 transition-all cursor-pointer active:scale-95"
                    >
                        <X className="w-5 h-5" />
                        Cancel
                    </button>
                    
                    <button 
                        type="submit" 
                        onClick={handleSubmit} 
                        disabled={!dirty}
                        className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 ${
                            title === "Update" 
                            ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 hover:shadow-blue-600/40" 
                            : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 hover:shadow-emerald-600/40"
                        }`}
                    >
                        <Save className="w-5 h-5" />
                        Submit Payment
                    </button>
                </div>

                <Toast 
                    alerting={toastInfo.toastAlert}
                    severity={toastInfo.toastSeverity}
                    message={toastInfo.toastMessage}
                />

                {loading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                        <Loader />
                    </div>
                )}
            </div>
        </div>
    );
};

FormComponent.propTypes = {
    openDialog: PropTypes.bool,
    setOpenDialog: PropTypes.func
};

export default FormComponent;
