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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 lg:p-7 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="w-full max-w-6xl max-h-[92vh] flex flex-col bg-white dark:bg-[#0f0f0f] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-[#222] animate-in zoom-in-95 duration-200"
            >
                {/* Letterhead / Header */}
                <div className="relative bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white px-6 py-5 overflow-hidden shrink-0">
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg shadow-black/20 shrink-0">
                                <CreditCard className="w-6 h-6 text-emerald-300" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                                        Fee Management Portal
                                    </span>
                                </div>
                                <h2 className="text-lg sm:text-xl font-black font-display tracking-tight text-white mt-0.5">
                                    {selected || "Payment"} Desk
                                </h2>
                                <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                                    <span>Student: <strong className="text-white">{studentName ? capitalizeEveryWord(studentName) : 'Selected Student'}</strong></span>
                                </p>
                            </div>
                        </div>

                        <button 
                            type="button"
                            onClick={handleDialogClose}
                            className="p-2 hover:bg-white/20 text-white/80 hover:text-white rounded-xl transition-colors cursor-pointer border border-white/10"
                            aria-label="Close dialog"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content Body */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 custom-scrollbar bg-slate-50/60 dark:bg-[#121212]">
                    
                    {/* Section 1: Payment History */}
                    <div className="bg-white dark:bg-[#181818] rounded-2xl shadow-xs border border-slate-200/90 dark:border-[#282828] overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-[#242424] bg-slate-50/50 dark:bg-[#151515] flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                                <History className="w-4 h-4" />
                            </div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                Past Transaction Records
                            </h3>
                        </div>
                        <div className="p-4">
                            <PaymentDataTable />
                        </div>
                    </div>

                    {/* Section 2: Create New Payment Form */}
                    <div className="bg-white dark:bg-[#181818] rounded-2xl shadow-xs border border-slate-200/90 dark:border-[#282828] overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-[#242424] bg-slate-50/50 dark:bg-[#151515] flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                                <CreditCard className="w-4 h-4" />
                            </div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                Record New Payment Entry
                            </h3>
                        </div>
                        <div className="p-2 sm:p-4">
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
                <div className="px-6 py-4 border-t border-slate-200 dark:border-[#222] bg-white dark:bg-[#141414] flex items-center justify-between gap-4 shrink-0">
                    <div>
                        {title !== "Update" && (
                            <button 
                                type="reset" 
                                disabled={!dirty || submitted}
                                onClick={() => {
                                    if (window.confirm("Do you really want to reset this payment form?")) {
                                        setReset(true);
                                    }
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#202020] rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset Form
                            </button>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            type="button"
                            onClick={handleDialogClose}
                            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#202020] dark:hover:bg-[#282828] text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        
                        <button 
                            type="submit" 
                            onClick={handleSubmit} 
                            disabled={!dirty}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                        >
                            <Save className="w-4 h-4" />
                            Submit Payment
                        </button>
                    </div>
                </div>

                <Toast 
                    alerting={toastInfo.toastAlert}
                    severity={toastInfo.toastSeverity}
                    message={toastInfo.toastMessage}
                />

                {loading && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
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
