/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";

import { useFormik } from "formik";
import { Eye, EyeOff, User, Mail, Phone, Briefcase, Building, Shield, UserCircle, Activity } from "lucide-react";

import API from "../../apis";
import userValidation from "./Validation";

import { setAllSchools } from "../../redux/actions/SchoolAction";
import { setAllUserRoles } from "../../redux/actions/UserRoleAction";
import { Utility } from "../utility";

import config from "../config";

const initialValues = {
  school_id: "",
  username: "",
  password: "",
  email: "",
  contact_no: "",
  designation: "",
  role: "",
  gender: "",
  status: "active",
};

const UserFormComponent = ({
  onChange,
  refId,
  setDirty,
  reset,
  setReset,
  schoolId,
  userId,
  rolePriority,
  updatedValues = null,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [updatePassword, setUpdatePassword] = useState({
    clicked: false,
    password: null,
  });
  const [initialState, setInitialState] = useState(initialValues);
  const [_schoolId, setSchoolId] = useState(null);
  const allSchools = useSelector((state) => state.allSchools);
  const allUserRoles = useSelector((state) => state.allUserRoles);

  const dispatch = useDispatch();
  const { fetchAndSetAll } = Utility();

  const formik = useFormik({
    initialValues: initialState,
    validationSchema: userValidation,
    enableReinitialize: true,
    onSubmit: () => watchForm(),
  });

  React.useImperativeHandle(refId, () => ({
    Submit: async () => {
      await formik.submitForm();
    },
  }));

  const watchForm = () => {
    if (onChange) {
      const values = { ...formik.values };
      if (!updatePassword.clicked && userId) {
        delete values.password;
      }
      onChange({
        values: values,
        validated: formik.isSubmitting
          ? Object.keys(formik.errors).length === 0
          : false,
      });
    }
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
    if (!allSchools?.listData?.length && rolePriority === 1) {
      fetchAndSetAll(dispatch, setAllSchools, API.SchoolAPI);
    }
  }, [allSchools?.listData]);

  useEffect(() => {
    if (!allUserRoles?.listData?.length) {
      fetchAndSetAll(dispatch, setAllUserRoles, API.UserRoleAPI);
    }
  }, [allUserRoles?.listData?.length]);

  const handleUpdatePassword = () => {
    if (updatePassword.clicked) {
      setUpdatePassword({
        clicked: false,
        password: formik.values.password,
      });
      formik.setFieldValue('password', '');
    } else {
      setUpdatePassword({
        clicked: true,
      });
      formik.setFieldValue('password', updatePassword.password || '');
    }
  };

  useEffect(() => {
    if (schoolId) {
      formik.setFieldValue("school_id", schoolId);
    }
  }, [schoolId]);

  const inputClass = (touched, error, disabled) => `w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all pl-11 ${
    disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''
  } ${
      touched && error 
      ? 'border-red-500 focus:ring-red-500/50' 
      : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/50'
  } text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500`;

  const selectClass = (touched, error, disabled) => `w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all pl-11 ${
    disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''
  } ${
      touched && error 
      ? 'border-red-500 focus:ring-red-500/50' 
      : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/50'
  } text-slate-800 dark:text-slate-100`;

  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";
  const errorClass = "mt-1.5 text-sm text-red-500 font-medium";
  const fieldsetLegendClass = "flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100 mb-6";
  const fieldsetClass = "p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 mt-8 relative";

  return (
    <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 w-full animate-in slide-in-from-bottom-4 duration-500 relative">
      
      {userId && (
          <button
            type="button"
            onClick={handleUpdatePassword}
            className="absolute top-6 right-6 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 z-10"
          >
            {updatePassword.clicked ? "Cancel Password Update" : "Update Password"}
          </button>
      )}

      <form ref={refId} className="space-y-6">
        
        <div className={fieldsetClass}>
            <h3 className={fieldsetLegendClass}>
                <UserCircle className="w-6 h-6 text-blue-500" />
                Account Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                    <label className={labelClass}>Username*</label>
                    <div className="relative">
                        <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            name="username"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.username}
                            className={inputClass(formik.touched.username, formik.errors.username)}
                            placeholder="e.g., johndoe"
                        />
                    </div>
                    {formik.touched.username && formik.errors.username && (
                        <p className={errorClass}>{formik.errors.username}</p>
                    )}
                </div>

                <div className="flex flex-col">
                    <label className={labelClass}>Password*</label>
                    <div className="relative">
                        <Shield className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            disabled={userId && !updatePassword.clicked}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.password}
                            className={inputClass(formik.touched.password, formik.errors.password, userId && !updatePassword.clicked)}
                            placeholder={userId && !updatePassword.clicked ? "********" : "Enter password"}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                            disabled={userId && !updatePassword.clicked}
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {formik.touched.password && formik.errors.password && (!userId || updatePassword.clicked) && (
                        <p className={errorClass}>{formik.errors.password}</p>
                    )}
                </div>
            </div>
        </div>

        <div className={fieldsetClass}>
            <h3 className={fieldsetLegendClass}>
                <User className="w-6 h-6 text-indigo-500" />
                Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-col">
                    <label className={labelClass}>Email Address</label>
                    <div className="relative">
                        <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="email"
                            name="email"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.email}
                            className={inputClass(formik.touched.email, formik.errors.email)}
                            placeholder="e.g., john@example.com"
                        />
                    </div>
                    {formik.touched.email && formik.errors.email && (
                        <p className={errorClass}>{formik.errors.email}</p>
                    )}
                </div>

                <div className="flex flex-col">
                    <label className={labelClass}>Contact Number*</label>
                    <div className="relative">
                        <Phone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="tel"
                            name="contact_no"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.contact_no}
                            className={inputClass(formik.touched.contact_no, formik.errors.contact_no)}
                            placeholder="e.g., +1 234 567 8900"
                        />
                    </div>
                    {formik.touched.contact_no && formik.errors.contact_no && (
                        <p className={errorClass}>{formik.errors.contact_no}</p>
                    )}
                </div>

                <div className="flex flex-col">
                    <label className={labelClass}>Gender*</label>
                    <div className="relative">
                        <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            name="gender"
                            value={formik.values.gender}
                            onChange={formik.handleChange}
                            className={selectClass(formik.touched.gender, formik.errors.gender)}
                        >
                            <option value="" disabled>Select Gender</option>
                            {Object.keys(config.gender).map((item) => (
                                <option key={item} value={item}>
                                    {config.gender[item]}
                                </option>
                            ))}
                        </select>
                    </div>
                    {formik.touched.gender && formik.errors.gender && (
                        <p className={errorClass}>{formik.errors.gender}</p>
                    )}
                </div>
            </div>
        </div>

        <div className={fieldsetClass}>
            <h3 className={fieldsetLegendClass}>
                <Briefcase className="w-6 h-6 text-emerald-500" />
                Professional Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-col">
                    <label className={labelClass}>Designation</label>
                    <div className="relative">
                        <Briefcase className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            name="designation"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.designation}
                            className={inputClass(formik.touched.designation, formik.errors.designation)}
                            placeholder="e.g., Teacher"
                        />
                    </div>
                    {formik.touched.designation && formik.errors.designation && (
                        <p className={errorClass}>{formik.errors.designation}</p>
                    )}
                </div>

                {allSchools?.listData?.length ? (
                    <div className="flex flex-col">
                        <label className={labelClass}>School*</label>
                        <div className="relative">
                            <Building className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select
                                name="school_id"
                                disabled={schoolId && userId ? true : false}
                                value={formik.values.school_id}
                                onChange={(event) => {
                                    const selectedSchoolId = event.target.value;
                                    setSchoolId(selectedSchoolId);
                                    formik.setFieldValue("school_id", selectedSchoolId);
                                }}
                                className={selectClass(formik.touched.school_id, formik.errors.school_id, schoolId && userId)}
                            >
                                <option value="" disabled>Select School</option>
                                {allSchools.listData.map((item) => (
                                    <option value={item.id} key={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {formik.touched.school_id && formik.errors.school_id && (
                            <p className={errorClass}>{formik.errors.school_id}</p>
                        )}
                    </div>
                ) : null}

                <div className="flex flex-col">
                    <label className={labelClass}>Role*</label>
                    <div className="relative">
                        <Shield className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            name="role"
                            value={formik.values.role}
                            onChange={formik.handleChange}
                            className={selectClass(formik.touched.role, formik.errors.role)}
                        >
                            <option value="" disabled>Select Role</option>
                            {rolePriority === 2 && !allUserRoles?.listData?.length
                                ? null
                                : allUserRoles.listData
                                    ?.filter((role) => role.id > rolePriority && role.id < 4)
                                    .map((role) => (
                                    <option value={role.id} key={role.name}>
                                        {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                    </option>
                                ))}
                        </select>
                    </div>
                    {formik.touched.role && formik.errors.role && (
                        <p className={errorClass}>{formik.errors.role}</p>
                    )}
                </div>

                <div className="flex flex-col">
                    <label className={labelClass}>Status*</label>
                    <div className="relative">
                        <Activity className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            name="status"
                            value={formik.values.status}
                            onChange={formik.handleChange}
                            className={selectClass(formik.touched.status, formik.errors.status)}
                        >
                            {Object.keys(config.status).map((item) => (
                                <option key={item} value={item}>
                                    {config.status[item]}
                                </option>
                            ))}
                        </select>
                    </div>
                    {formik.touched.status && formik.errors.status && (
                        <p className={errorClass}>{formik.errors.status}</p>
                    )}
                </div>
            </div>
        </div>

      </form>
    </div>
  );
};

UserFormComponent.propTypes = {
  onChange: PropTypes.func,
  refId: PropTypes.shape({
    current: PropTypes.any,
  }),
  setDirty: PropTypes.func,
  reset: PropTypes.bool,
  setReset: PropTypes.func,
  schoolId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rolePriority: PropTypes.number,
  updatedValues: PropTypes.object,
};

export default UserFormComponent;
