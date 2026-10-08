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
import { Eye, EyeOff, User, Mail, Phone, Briefcase, Building, Shield, UserCircle, Activity, ChevronDown } from "lucide-react";

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
      const errors = await formik.validateForm();
      formik.setTouched(
        Object.keys(formik.values).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {})
      );
      await formik.submitForm();
      return errors;
    },
    validate: async () => {
      const errors = await formik.validateForm();
      formik.setTouched(
        Object.keys(formik.values).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {})
      );
      return errors;
    },
    formik,
    updatePassword,
  }));

  const watchForm = () => {
    if (onChange) {
      const values = { ...formik.values };
      if (!updatePassword.clicked && userId) {
        delete values.password;
      }
      onChange({
        values: values,
        // Bug #13 fix: formik.isSubmitting is false by the time onSubmit fires.
        validated: Object.keys(formik.errors).length === 0,
        dirty: formik.dirty,
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

  const inputClass = (field, disabled = false) =>
    `w-full px-3.5 py-2.5 bg-white dark:bg-[#121212] border rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:outline-none focus:ring-2 transition-all ${
      disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-[#181818]' : ''
    } ${
      formik.touched[field] && formik.errors[field]
        ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
        : "border-slate-300 dark:border-[#333] focus:ring-emerald-500/20 focus:border-emerald-500"
    }`;

  const selectClass = (field, disabled = false) =>
    `w-full px-3.5 py-2.5 bg-white dark:bg-[#121212] border rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:outline-none focus:ring-2 transition-all cursor-pointer appearance-none ${
      disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-[#181818]' : ''
    } ${
      formik.touched[field] && formik.errors[field]
        ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
        : "border-slate-300 dark:border-[#333] focus:ring-emerald-500/20 focus:border-emerald-500"
    }`;

  return (
    <form ref={refId} onSubmit={formik.handleSubmit}>
      {/* Main Engraved Card */}
      <div className="bg-white/95 dark:bg-[#161616]/90 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-slate-200/90 dark:border-[#282828] shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] space-y-6">
        
        {/* Section 1: Account Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 pb-2.5 border-b border-slate-100 dark:border-[#222]">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                <UserCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Account Credentials
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Login username and authentication password
                </p>
              </div>
            </div>

            {userId && (
              <button
                type="button"
                onClick={handleUpdatePassword}
                className="px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/60 rounded-lg transition-colors cursor-pointer"
              >
                {updatePassword.clicked ? "Cancel Password Update" : "Update Password"}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Username <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                autoComplete="off"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.username}
                placeholder="e.g., johndoe"
                className={inputClass("username")}
              />
              {formik.touched.username && formik.errors.username && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.username}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  disabled={Boolean(userId && !updatePassword.clicked)}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.password}
                  placeholder={userId && !updatePassword.clicked ? "••••••••" : "Enter secure password"}
                  className={inputClass("password", Boolean(userId && !updatePassword.clicked))}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                  disabled={Boolean(userId && !updatePassword.clicked)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (!userId || updatePassword.clicked) && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.password}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Personal Information */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-[#222]">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Personal Information
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Primary contact and identity details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                autoComplete="off"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.email}
                placeholder="e.g., john@example.com"
                className={inputClass("email")}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.email}</p>
              )}
            </div>

            {/* Contact Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Contact Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="contact_no"
                autoComplete="off"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.contact_no}
                placeholder="e.g., +1 234 567 8900"
                className={inputClass("contact_no")}
              />
              {formik.touched.contact_no && formik.errors.contact_no && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.contact_no}</p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Gender <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="gender"
                  value={formik.values.gender}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  className={selectClass("gender")}
                >
                  <option value="" className="bg-white dark:bg-[#161616]" disabled>Select Gender</option>
                  {Object.keys(config.gender).map((item) => (
                    <option key={item} value={item} className="bg-white dark:bg-[#161616]">
                      {config.gender[item]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {formik.touched.gender && formik.errors.gender && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.gender}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Professional Details */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-[#222]">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Professional Details & Access Role
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                System designation, institution affiliation, and permission role
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Designation */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Designation
              </label>
              <input
                type="text"
                name="designation"
                autoComplete="off"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.designation}
                placeholder="e.g., Senior Administrator"
                className={inputClass("designation")}
              />
              {formik.touched.designation && formik.errors.designation && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.designation}</p>
              )}
            </div>

            {/* School */}
            {allSchools?.listData?.length ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  School <span className="text-rose-500">*</span>
                  {Boolean(schoolId && userId) && (
                    <span className="text-slate-400 dark:text-slate-500 font-medium normal-case ml-1 text-[11px]">
                      (Locked)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <select
                    name="school_id"
                    disabled={Boolean(schoolId && userId)}
                    value={formik.values.school_id}
                    onBlur={formik.handleBlur}
                    onChange={(event) => {
                      const selectedSchoolId = event.target.value;
                      setSchoolId(selectedSchoolId);
                      formik.setFieldValue("school_id", selectedSchoolId);
                    }}
                    className={selectClass("school_id", Boolean(schoolId && userId))}
                  >
                    <option value="" className="bg-white dark:bg-[#161616]" disabled>Select School</option>
                    {allSchools.listData.map((item) => (
                      <option value={item.id} key={item.id} className="bg-white dark:bg-[#161616]">
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formik.touched.school_id && formik.errors.school_id && (
                  <p className="text-xs text-rose-500 font-medium">{formik.errors.school_id}</p>
                )}
              </div>
            ) : null}

            {/* Role */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Role <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={formik.values.role}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  className={selectClass("role")}
                >
                  <option value="" className="bg-white dark:bg-[#161616]" disabled>Select Role</option>
                  {rolePriority === 2 && !allUserRoles?.listData?.length
                    ? null
                    : allUserRoles.listData
                        ?.filter((role) => (role.priority ?? role.id) > rolePriority || rolePriority === 1 || Number(role.id) === Number(formik.values.role))
                        .map((role) => (
                        <option value={role.id} key={role.name} className="bg-white dark:bg-[#161616]">
                          {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                        </option>
                      ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {formik.touched.role && formik.errors.role && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.role}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Status <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="status"
                  value={formik.values.status}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  className={selectClass("status")}
                >
                  {Object.keys(config.status).map((item) => (
                    <option key={item} value={item} className="bg-white dark:bg-[#161616]">
                      {config.status[item]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {formik.touched.status && formik.errors.status && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.status}</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </form>
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
