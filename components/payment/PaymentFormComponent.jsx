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
  const [schoolPaymentMethods, setSchoolPaymentMethods] = useState([]);
  const [schoolPaymentData, setSchoolPaymentData] = useState([]);
  
  const allPaymentMethods = useSelector(state => state.allPaymentMethods);
  const toastInfo = useSelector(state => state.toastInfo);

  const dispatch = useDispatch();
  const { state } = useLocation();
  const { createDivider, createDropdown, createSchoolFee, createSession, fetchAndSetAll, findMultipleById } = Utility();

  const studentId = state?.id;
  const studentClass = state?.cls;
  const studentSection = state?.section;

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
        validated: formik.isSubmitting
          ? Object.keys(formik.errors).length === 0
          : false
      });
    }
  };

  let final_amount = Math.ceil((formik.values.amount - (formik.values.amount * (formik.values.discount_percent || 0) / 100)) +
    (Number(formik.values.late_fee) || 0));

  const typeDuration = formik.values.type;
  
  const inputClass = (fieldName) => `w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
    formik.touched[fieldName] && formik.errors[fieldName] 
    ? 'border-red-500 focus:ring-red-500/50' 
    : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/50'
  } text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500`;
  
  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";
  const errorClass = "mt-1.5 text-sm text-red-500 font-medium";

  const renderMonthsDropdown = () => {
    if (!schoolPaymentData) return <div className="p-2 text-slate-500">Loading...</div>;
    if (typeDuration === 'annually') return null;
    
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
          {createDropdown(createDivider(typeDuration), schoolPaymentData?.session_start).map((period, index) => (
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
    if (!allPaymentMethods?.listData?.length) {
      fetchAndSetAll(dispatch, setAllPaymentMethods, API.PaymentMethodAPI);
    }
  }, []);

  useEffect(() => {
    API.PaymentAPI.getPaymentData(studentClass, studentSection)
      .then(({ data: res }) => {
        if (res.status === "Success") {
          setSchoolPaymentData(res.data[0] || []);
        }
      })
      .catch(err => {
        console.log('error occured in getPaymentData api', err)
      })
  }, []);

  useEffect(() => {
    API.SchoolAPI.getSchoolClasses()
      .then(res => {
        const selectedClassData = res.data.filter(item => item.class_id === studentClass &&
          item.section_id === studentSection);
        if(selectedClassData.length > 0) {
            formik.setFieldValue("class_fee_by_mapping", selectedClassData[0]);
        }
      })
      .catch(err => {
        console.log('error occured in school mapping api', err)
      })
  }, []);

  useEffect(() => {
    if (formik.values.fee === 'school' && typeDuration !== 'annually') {
      formik.setFieldValue("amount", createSchoolFee(createDivider(typeDuration), formik.values.class_fee_by_mapping?.class_fee));
    } else if (formik.values.fee === 'school' && typeDuration === 'annually') {
      formik.setFieldValue("amount", createSchoolFee(createDivider(typeDuration), formik.values.class_fee_by_mapping?.class_fee));
    }
  }, [formik.values.fee, typeDuration]);

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
        const schoolPaymentOptions = findMultipleById(schoolPaymentData?.payment_methods, allPaymentMethods?.listData);
        setSchoolPaymentMethods(schoolPaymentOptions);

        if (timeDiff > 0 && feeSession == currentYear) {
          switch (schoolPaymentData?.late_fee_duration) {
            case 'per_day': {
              const daysLate = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
              lateFeeAmount = daysLate * schoolPaymentData?.classLateFee;
              break;
            }
            case 'per_week': {
              const weeksLate = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 7));
              lateFeeAmount = weeksLate * schoolPaymentData?.classLateFee;
              break;
            }
            case 'per_month': {
              const monthsLate = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30));
              lateFeeAmount = monthsLate * schoolPaymentData?.classLateFee;
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
          formik.setFieldValue('type_duration', "");
          formik.setFieldValue('type', "");
          formik.setFieldValue('amount', "");
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
              type="number"
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
              {schoolPaymentMethods?.map(value => (
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
              type="number"
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

        </div>

        {/* Final Amount Display */}
        <div className="mt-8 mx-6 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800/50 flex flex-col md:flex-row items-center justify-between shadow-sm">
          <div className="mb-4 md:mb-0">
            <h4 className="text-emerald-800 dark:text-emerald-400 font-bold text-lg">Total Payment Summary</h4>
            <p className="text-emerald-600/80 dark:text-emerald-500/80 text-sm font-medium mt-1">Amount + Late Fee - Discount</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">₹ {final_amount || 0}</span>
            <span className="text-lg font-bold text-emerald-600/60 dark:text-emerald-500/60">INR</span>
          </div>
        </div>

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
