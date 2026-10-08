/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { useLocation } from "@/lib/routerAdapter";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import { Receipt, Calculator, Tag, Clock, CheckCircle2, ShieldCheck, UploadCloud, Paperclip, ExternalLink, X } from "lucide-react";

import API from "../../apis";
import config from '../config';
import paymentValidation from "./Validation";
import Toast from "../common/Toast";

import { setAllPaymentMethods } from "../../redux/actions/PaymentMethodAction";
import { Utility } from "../utility";

const initialValues = {
  student_id: "",
  method: "",
  fee: "",
  type: "",
  type_duration: "",
  academic_year: "",
  amount: "",
  final_amount: "",
  discount_percent: "",
  late_fee: "",
  class_fee_by_mapping: "",
  reference_no: "",
  status: "completed",
  receipt_url: "",
  current_date: null
};

const PaymentFormComponent = ({
  onChange,
  refId,
  setDirty,
  reset,
  setReset,
  updatedValues = null
}) => {
  const [initialState, setInitialState] = useState(initialValues);
  const [schoolPaymentData, setSchoolPaymentData] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  const allPaymentMethods = useSelector(state => state.allPaymentMethods);
  const toastInfo = useSelector(state => state.toastInfo);

  const dispatch = useDispatch();
  const { state } = useLocation();
  const { createDivider, createDropdown, createSchoolFee, createSession, fetchAndSetAll, findMultipleById } = Utility();

  const studentId = state?.id;
  const studentClass = state?.cls;
  const studentSection = state?.section;

  const handleReceiptUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingReceipt(true);
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", "payments");
      const res = await API.ImageAPI.uploadImageToSupabase(formData);
      const uploadedUrl = res?.data?.data?.url || res?.data?.url || res?.data?.image_src || res?.data?.path || (typeof res?.data === "string" ? res.data : "");
      if (uploadedUrl) {
        formik.setFieldValue("receipt_url", uploadedUrl);
      }
    } catch (err) {
      console.error("Failed to upload receipt slip:", err);
    } finally {
      setUploadingReceipt(false);
    }
  };

  // Derived payment methods list: prefer school duration mapping if configured, fallback to all active payment methods created by admin
  const paymentMethodList = React.useMemo(() => {
    if (schoolPaymentData?.payment_methods && allPaymentMethods?.listData?.length) {
      const matched = findMultipleById(schoolPaymentData.payment_methods, allPaymentMethods.listData);
      if (matched && matched.length > 0) return matched;
    }
    const rawList = allPaymentMethods?.listData?.rows || allPaymentMethods?.listData || [];
    if (Array.isArray(rawList) && rawList.length > 0) {
      return rawList.filter(item => !item.status || item.status === 'active');
    }
    return [];
  }, [schoolPaymentData?.payment_methods, allPaymentMethods?.listData]);

  const formik = useFormik({
    initialValues: initialState,
    validationSchema: paymentValidation,
    enableReinitialize: true,
    onSubmit: () => watchForm()
  });

  React.useImperativeHandle(refId, () => ({
    Submit: async () => {
      await formik.submitForm();
    }
  }));

  const watchForm = () => {
    if (onChange) {
      onChange({
        values: formik.values,
        validated: Object.keys(formik.errors).length === 0
      });
    }
  };

  let final_amount = Math.ceil((formik.values.amount - (formik.values.amount * (formik.values.discount_percent || 0) / 100)) +
    (Number(formik.values.late_fee) || 0));

  const typeDuration = formik.values.type;

  const inputClass = (fieldName) => `w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#161616] border rounded-xl focus:outline-none focus:ring-2 transition-all text-xs sm:text-sm font-medium ${formik.touched[fieldName] && formik.errors[fieldName]
    ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500/30 focus:border-rose-500'
    : 'border-slate-200 dark:border-[#2a2a2a] focus:ring-emerald-500/30 focus:border-emerald-500 hover:border-slate-300 dark:hover:border-slate-700'
    } text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs`;

  const labelClass = "block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5";
  const errorClass = "mt-1 text-xs text-rose-500 font-semibold";

  const renderMonthsDropdown = () => {
    if (!typeDuration || typeDuration === 'annually') return null;

    const sessionStart = schoolPaymentData?.session_start || 'April';
    const periodOptions = createDropdown(createDivider(typeDuration), sessionStart);

    return (
      <div className="flex flex-col">
        <label className={labelClass}>Period*</label>
        <select
          name="type_duration"
          value={formik.values.type_duration}
          onChange={event => formik.setFieldValue('type_duration', event.target.value)}
          className={inputClass('type_duration')}
        >
          <option value="" disabled>Select Period</option>
          {periodOptions.map((period, index) => (
            <option key={index} value={period}>{period}</option>
          ))}
        </select>
        {formik.touched.type_duration && formik.errors.type_duration && (
          <p className={errorClass}>{formik.errors.type_duration}</p>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (reset) {
      formik.resetForm();
      setReset(false);
    }
  }, [reset]);

  useEffect(() => {
    if (formik.dirty) {
      setDirty(true);
    }
  }, [formik.dirty]);

  useEffect(() => {
    if (updatedValues) {
      setInitialState(updatedValues);
    }
  }, [updatedValues]);

  useEffect(() => {
    fetchAndSetAll(dispatch, setAllPaymentMethods, API.PaymentMethodAPI);
  }, []);

  useEffect(() => {
    if (studentClass && studentSection) {
      API.PaymentAPI.getPaymentData(studentClass, studentSection)
        .then(({ data: res }) => {
          if (res.status === "Success") {
            setSchoolPaymentData(res.data[0] || null);
          }
        })
        .catch(err => {
          console.log('error occurred in getPaymentData api', err);
        });
    }
  }, [studentClass, studentSection]);

  useEffect(() => {
    if (studentClass && studentSection) {
      API.SchoolAPI.getSchoolClasses()
        .then(res => {
          const selectedClassData = res.data.filter(item => item.class_id === studentClass &&
            item.section_id === studentSection);
          if (selectedClassData.length > 0) {
            formik.setFieldValue("class_fee_by_mapping", selectedClassData[0]);
          }
        })
        .catch(err => {
          console.log('error occurred in school mapping api', err);
        });
    }
  }, [studentClass, studentSection]);

  useEffect(() => {
    if (formik.values.fee === 'school' && typeDuration) {
      formik.setFieldValue("amount", createSchoolFee(createDivider(typeDuration), formik.values.class_fee_by_mapping?.class_fee));
    }
  }, [formik.values.fee, typeDuration, formik.values.class_fee_by_mapping?.class_fee]);

  useEffect(() => {
    formik.setFieldValue("student_id", studentId);
  }, [studentId]);

  useEffect(() => {
    const calculateLateFee = (chosenPeriod) => {
      let lateFeeAmount = 0;

      if (schoolPaymentData) {
        const currentDate = new Date();
        formik.setFieldValue("current_date", currentDate);

        let paymentMonth;
        const currentYear = currentDate.getFullYear();

        if (chosenPeriod) {
          paymentMonth = config.months.indexOf(chosenPeriod);
          if (chosenPeriod.includes('-')) {
            paymentMonth = config.months.indexOf(chosenPeriod.split('-')[0].trim());
          }
        } else {
          paymentMonth = currentDate.getMonth();
        }
        const paymentDate = new Date(currentYear, paymentMonth, schoolPaymentData?.payment_date);

        const paymentDateTime = paymentDate.getTime();
        const currentDateTime = currentDate.getTime();
        const timeDiff = currentDateTime - paymentDateTime;

        const feeSession = formik.values.academic_year?.split('-')[1] || currentYear;

        if (timeDiff > 0 && feeSession == currentYear) {
          switch (schoolPaymentData?.late_fee_duration) {
            case 'per_day': {
              const daysLate = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
              lateFeeAmount = daysLate * (schoolPaymentData?.classLateFee || 0);
              break;
            }
            case 'per_week': {
              const weeksLate = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 7));
              lateFeeAmount = weeksLate * (schoolPaymentData?.classLateFee || 0);
              break;
            }
            case 'per_month': {
              const monthsLate = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30));
              lateFeeAmount = monthsLate * (schoolPaymentData?.classLateFee || 0);
              break;
            }
            default:
              break;
          }
        } else if (feeSession > currentYear) {
          lateFeeAmount = 0;
        }

        if (formik.values.fee === 'school') {
          formik.setFieldValue("late_fee", lateFeeAmount);
        } else {
          formik.setFieldValue("late_fee", 0);
        }
      } else {
        formik.setFieldValue("late_fee", lateFeeAmount);
      }
    };

    calculateLateFee(formik.values.type_duration);
  }, [schoolPaymentData, formik.values.fee, formik.values.type_duration, formik.values.academic_year]);

  useEffect(() => {
    if (final_amount !== undefined && !isNaN(final_amount)) {
      formik.setFieldValue("final_amount", final_amount);
    }
  }, [final_amount]);

  return (
    <div className="w-full">
      <form ref={refId} onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">

          <div className="flex flex-col">
            <label className={labelClass}>Session*</label>
            <select
              name="academic_year"
              value={formik.values.academic_year}
              onChange={event => formik.setFieldValue("academic_year", event.target.value)}
              className={inputClass('academic_year')}
            >
              <option value="" disabled>Select Session</option>
              {createSession().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {formik.touched.academic_year && formik.errors.academic_year && (
              <p className={errorClass}>{formik.errors.academic_year}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Fee*</label>
            <select
              name="fee"
              value={formik.values.fee}
              onChange={formik.handleChange}
              className={inputClass('fee')}
            >
              <option value="" disabled>Select Fee</option>
              {Object.keys(config.fee).map(item => (
                <option key={item} value={item}>{config.fee[item]}</option>
              ))}
            </select>
            {formik.touched.fee && formik.errors.fee && (
              <p className={errorClass}>{formik.errors.fee}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Type*</label>
            <select
              name="type"
              value={formik.values.type}
              onChange={event => {
                formik.setFieldValue('type', event.target.value);
                formik.setFieldValue('type_duration', '');
              }}
              className={inputClass('type')}
            >
              <option value="" disabled>Select Type</option>
              {Object.keys(config.payment_type).map(item => (
                <option key={item} value={item}>{config.payment_type[item]}</option>
              ))}
            </select>
            {formik.touched.type && formik.errors.type && (
              <p className={errorClass}>{formik.errors.type}</p>
            )}
          </div>

          {formik.values.type && renderMonthsDropdown()}

          <div className="flex flex-col">
            <label className={labelClass}>Amount*</label>
            <input
              type="text"
              name="amount"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.amount}
              className={inputClass('amount')}
              placeholder="0"
            />
            {formik.touched.amount && formik.errors.amount && (
              <p className={errorClass}>{formik.errors.amount}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Payment Method*</label>
            <select
              name="method"
              value={formik.values.method}
              onChange={event => formik.setFieldValue("method", event.target.value)}
              className={inputClass('method')}
            >
              <option value="" disabled>Select Method</option>
              {paymentMethodList.map(value => (
                <option key={value.id} value={value.id}>{value.name}</option>
              ))}
            </select>
            {formik.touched.method && formik.errors.method && (
              <p className={errorClass}>{formik.errors.method}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Late Fees</label>
            <input
              type="text"
              name="late_fee"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.late_fee}
              className={inputClass('late_fee')}
              placeholder="0"
            />
            {formik.touched.late_fee && formik.errors.late_fee && (
              <p className={errorClass}>{formik.errors.late_fee}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Discount Percent</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                name="discount_percent"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.discount_percent}
                className={`${inputClass('discount_percent')} pr-8`}
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</span>
            </div>
            {formik.touched.discount_percent && formik.errors.discount_percent && (
              <p className={errorClass}>{formik.errors.discount_percent}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Ref / Transaction ID</label>
            <input
              type="text"
              name="reference_no"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.reference_no}
              className={inputClass('reference_no')}
              placeholder="e.g. UTR / Cheque No / Slip Ref"
            />
            {formik.touched.reference_no && formik.errors.reference_no && (
              <p className={errorClass}>{formik.errors.reference_no}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Payment Status*</label>
            <select
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              className={inputClass('status')}
            >
              <option value="completed">Completed (Paid)</option>
              <option value="pending">Pending (Awaiting Clearance)</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            {formik.touched.status && formik.errors.status && (
              <p className={errorClass}>{formik.errors.status}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Receipt / Proof Slip</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                name="receipt_url"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.receipt_url || ""}
                className={inputClass('receipt_url')}
                placeholder="Paste URL or upload slip"
              />
              <label className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#202020] dark:hover:bg-[#282828] text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-[#333] text-xs font-bold cursor-pointer transition-all shadow-2xs">
                <UploadCloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{uploadingReceipt ? "Uploading..." : "Upload"}</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleReceiptUpload}
                  disabled={uploadingReceipt}
                />
              </label>
            </div>
            {formik.values.receipt_url && (
              <div className="mt-1.5 flex items-center justify-between gap-2 px-2.5 py-1.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40 rounded-lg text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                <a
                  href={formik.values.receipt_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 truncate hover:underline"
                >
                  <Paperclip className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{formik.values.receipt_url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
                <button
                  type="button"
                  onClick={() => formik.setFieldValue("receipt_url", "")}
                  className="text-slate-400 hover:text-rose-500 cursor-pointer p-0.5 rounded"
                  title="Remove Slip"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {formik.touched.receipt_url && formik.errors.receipt_url && (
              <p className={errorClass}>{formik.errors.receipt_url}</p>
            )}
          </div>

        </div>

        {/* Itemized Financial Breakdown Receipt Card */}
        {(() => {
          const baseAmount = Number(formik.values.amount) || 0;
          const lateFee = Number(formik.values.late_fee) || 0;
          const discountPercent = Number(formik.values.discount_percent) || 0;
          const discountAmount = Math.round((baseAmount * discountPercent) / 100);
          const totalPayable = final_amount || 0;

          return (
            <div className="mt-6 mx-6 rounded-2xl bg-slate-50/80 dark:bg-[#151515] border border-slate-200/90 dark:border-[#262626] overflow-hidden shadow-xs">
              {/* Card Header */}
              <div className="px-5 py-3.5 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-[#1b1b1b] dark:to-[#161616] border-b border-slate-200/80 dark:border-[#262626] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Payment Calculation Breakdown
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Live itemized invoice summary
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-300/60 dark:border-emerald-800/40">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Realtime Audit</span>
                </div>
              </div>

              {/* Itemized Grid Breakdown */}
              <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-stretch">

                {/* 1. Base Fee Item */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200/80 dark:border-[#282828] shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <span>Base Amount</span>
                    <Calculator className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="mt-2 text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-slate-100">
                    ₹{baseAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1 capitalize truncate">
                    {formik.values.fee ? `${formik.values.fee} Fee Schedule` : 'Standard Rate'}
                  </div>
                </div>

                {/* 2. Late Surcharge (+) Item */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200/80 dark:border-[#282828] shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <span>Late Surcharge</span>
                    <Clock className={`w-3.5 h-3.5 ${lateFee > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                  </div>
                  <div className={`mt-2 text-lg sm:text-xl font-black font-mono ${lateFee > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {lateFee > 0 ? `+ ₹${lateFee.toLocaleString('en-IN')}` : '₹0'}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1">
                    {lateFee > 0 ? 'Overdue late penalty' : 'No late penalty applied'}
                  </div>
                </div>

                {/* 3. Discount Concession (-) Item */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200/80 dark:border-[#282828] shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <span>Discount ({discountPercent}%)</span>
                    <Tag className={`w-3.5 h-3.5 ${discountAmount > 0 ? 'text-emerald-500' : 'text-slate-400'}`} />
                  </div>
                  <div className={`mt-2 text-lg sm:text-xl font-black font-mono ${discountAmount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {discountAmount > 0 ? `- ₹${discountAmount.toLocaleString('en-IN')}` : '₹0'}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1">
                    {discountAmount > 0 ? `Saved ₹${discountAmount.toLocaleString('en-IN')} on fee` : 'No concession applied'}
                  </div>
                </div>

                {/* 4. Net Payable Hero Block */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white shadow-md shadow-emerald-600/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-widest text-emerald-100">
                    <span>Net Payable</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/20 font-bold backdrop-blur-xs">
                      INR
                    </span>
                  </div>
                  <div className="mt-2 text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                    ₹{totalPayable.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-emerald-100/90 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                    <span>Final amount to charge</span>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

        <Toast
          alerting={toastInfo.toastAlert}
          severity={toastInfo.toastSeverity}
          message={toastInfo.toastMessage}
        />
      </form>
    </div>
  );
};

PaymentFormComponent.propTypes = {
  onChange: PropTypes.func,
  refId: PropTypes.shape({
    current: PropTypes.any
  }),
  setDirty: PropTypes.func,
  reset: PropTypes.bool,
  setReset: PropTypes.func,
  updatedValues: PropTypes.object
};

export default PaymentFormComponent;
