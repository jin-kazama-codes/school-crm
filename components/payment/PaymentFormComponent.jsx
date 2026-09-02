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

import { Box, InputLabel, MenuItem, FormHelperText, FormControl } from "@mui/material";
import { Select, TextField, useMediaQuery } from "@mui/material";
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
  class_fee_by_mapping: "",     // These 2 must be excluded when creating payment
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
  const isNonMobile = useMediaQuery("(min-width:600px)");
  // const isMobile = useMediaQuery("(max-width:480px)");
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

  let final_amount = Math.ceil((formik.values.amount - (formik.values.amount * formik.values.discount_percent / 100)) +
    formik.values.late_fee);

  const typeDuration = formik.values.type;    // Variable created after initializing formik
  const renderMonthsDropdown = () => {
    if (!schoolPaymentData) {
      return <div>Loading...</div>;
    }
    if (typeDuration === 'annually') {
      return null;
    }
    return (
      <FormControl
        variant="filled"
        sx={{ minWidth: 120 }}
        error={!!formik.touched.type_duration && !!formik.errors.type_duration}
      >
        <InputLabel>Period</InputLabel>
        <Select
          name="type_duration"
          variant="filled"
          value={formik.values.type_duration}
          onChange={event => formik.setFieldValue('type_duration', event.target.value)}
        >
          {createDropdown(createDivider(typeDuration), schoolPaymentData?.session_start).map((period, index) => (
            <MenuItem key={index} value={period}>
              {period}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText> {formik.touched.type_duration && formik.errors.type_duration} </FormHelperText>
      </FormControl>
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
          setSchoolPaymentData(...res.data);
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
        formik.setFieldValue("class_fee_by_mapping", ...selectedClassData);   // If we directly update the amount field here then,
      })
      .catch(err => {
        console.log('error occured in school mapping api', err)
      })
  }, []);

  // Updates the "amount" field in the form based on the selected fee type and typeDuration.
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

        // Calculate the payment date based on the current year, month and payment date from school
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
    if (final_amount) {
      formik.setFieldValue("final_amount", final_amount);
    }
  }, [final_amount]);

  return (
    <Box m="20px">
      <form ref={refId}>
        <Box
          display="grid"
          gap="30px"
          gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          sx={{
            "& > div": { gridColumn: isNonMobile ? undefined : "span 4" }
          }}
        >
          <FormControl
            variant="filled"
            sx={{ minWidth: 120 }}
            error={!!formik.touched.academic_year && !!formik.errors.academic_year}
          >
            <InputLabel>Session*</InputLabel>
            <Select
              variant="filled"
              name="academic_year"
              value={formik.values.academic_year}
              onChange={event => formik.setFieldValue("academic_year", event.target.value)}
            >
              {createSession().map(year => (
                <MenuItem value={year} name={year} key={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formik.touched.academic_year && formik.errors.academic_year}
            </FormHelperText>
          </FormControl>
          <FormControl
            variant="filled"
            sx={{ minWidth: 120 }}
            error={!!formik.touched.fee && !!formik.errors.fee}
          >
            <InputLabel>Fee*</InputLabel>
            <Select
              name="fee"
              variant="filled"
              value={formik.values.fee}
              onChange={formik.handleChange}
            >
              {Object.keys(config.fee).map(item => (
                <MenuItem key={item} value={item}>
                  {config.fee[item]}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText> {formik.touched.fee && formik.errors.fee} </FormHelperText>
          </FormControl>
          <FormControl
            variant="filled"
            sx={{ minWidth: 120 }}
            error={!!formik.touched.type && !!formik.errors.type}
          >
            <InputLabel>Type*</InputLabel>
            <Select
              name="type"
              variant="filled"
              value={formik.values.type}
              onChange={event => {
                formik.setFieldValue('type', event.target.value);
                formik.setFieldValue('type_duration', '');
              }}
            >
              {Object.keys(config.payment_type).map(item => (
                <MenuItem key={item} value={item}>
                  {config.payment_type[item]}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText> {formik.touched.type && formik.errors.type} </FormHelperText>
          </FormControl>
          {formik.values.type &&
            renderMonthsDropdown()
          }

          <TextField
            fullWidth
            variant="filled"
            type="number"
            name="amount"
            label="Amount*"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.amount}
            error={!!formik.touched.amount && !!formik.errors.amount}
            helperText={formik.touched.amount && formik.errors.amount}
          />
          <FormControl
            variant="filled"
            sx={{ minWidth: 120 }}
            error={!!formik.touched.method && !!formik.errors.method}
          >
            <InputLabel>Payment Method*</InputLabel>
            <Select
              variant="filled"
              name="method"
              value={formik.values.method}
              onChange={event => formik.setFieldValue("method", event.target.value)}
            >
              {!schoolPaymentMethods?.length ? null :
                schoolPaymentMethods.map(value => (
                  <MenuItem value={value.id} name={value.name} key={value.id}>
                    {value.name}
                  </MenuItem>
                ))}
            </Select>
            <FormHelperText>
              {formik.touched.method && formik.errors.method}
            </FormHelperText>
          </FormControl>
          <TextField
            fullWidth
            variant="filled"
            type="number"
            label="Late Fees"
            name="late_fee"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.late_fee}
            error={!!formik.touched.late_fee && !!formik.errors.late_fee}
            helperText={formik.touched.late_fee && formik.errors.late_fee}
          />
          <TextField
            fullWidth
            variant="filled"
            type="number"
            label="Discount Percent"
            name="discount_percent"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.discount_percent}
            error={!!formik.touched.discount_percent && !!formik.errors.discount_percent}
            helperText={formik.touched.discount_percent && formik.errors.discount_percent}
          />
          <InputLabel
            sx={{
              fontWeight: '600', fontSize: '16px', justifySelf: 'center'
            }}
          >
            Final Payment: &#8377; {final_amount + " INR."}
          </InputLabel>
        </Box>
        <Toast
          alerting={toastInfo.toastAlert}
          severity={toastInfo.toastSeverity}
          message={toastInfo.toastMessage}
        />
      </form>
    </Box>
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
