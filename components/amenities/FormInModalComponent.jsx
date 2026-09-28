/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 */

import { useCallback, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "@/lib/routerAdapter";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Formik } from "formik";
import { X, Sparkles, RotateCcw, Save, ChevronDown } from "lucide-react";

import API from "../../apis";
import amenityValidation from "./Validation";
import config from "../config";
import Loader from "../common/Loader";
import Toast from "../common/Toast";

import { setMenuItem } from "../../redux/actions/NavigationAction";
import { Utility } from "../utility";
import formBg from "../assets/formBg.png";

const initialValues = {
  name: "",
  description: "",
  status: "active",
};

const FormComponent = ({ openDialog, setOpenDialog, onRefresh }) => {
  const firstInputRef = useRef(null);
  const handleDialogClose = () => {
    setOpenDialog(false);
    navigateTo("#", { state: { id: undefined } });
  };

  const [title, setTitle] = useState("Create");
  const [loading, setLoading] = useState(false);
  const [initialState, setInitialState] = useState(initialValues);

  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const selected = useSelector((state) => state.menuItems.selected);
  const toastInfo = useSelector((state) => state.toastInfo);

  const { state } = useLocation();
  const { toastAndNavigate, getLocalStorage } = Utility();

  let id = state?.id;

  useEffect(() => {
    if (openDialog && !loading) {
      const timer = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [openDialog, id, loading]);

  useEffect(() => {
    const selectedMenu = getLocalStorage("menu");
    if (selectedMenu?.selected) {
      dispatch(setMenuItem(selectedMenu.selected));
    }
    if (openDialog) {
      if (id) {
        setTitle("Update");
        populateData(id);
      } else {
        setTitle("Create");
        setInitialState(initialValues);
      }
    }
  }, [id, openDialog]);

  const updateAmenity = useCallback((values) => {
    setLoading(true);
    API.AmenityAPI.updateAmenity(values)
      .then(({ data: amenity }) => {
        if (amenity?.status === "Success") {
          setLoading(false);
          toastAndNavigate(dispatch, true, "info", "Successfully Updated");
          handleDialogClose();
          if (typeof onRefresh === "function") {
            onRefresh();
          }
        } else {
          setLoading(false);
          toastAndNavigate(
            dispatch,
            true,
            "error",
            "An Error Occurred, Please Try Again"
          );
        }
      })
      .catch((err) => {
        setLoading(false);
        toastAndNavigate(
          dispatch,
          true,
          "error",
          err?.response?.data?.msg || "An Error Occurred"
        );
        throw err;
      });
  }, [onRefresh]);

  const populateData = useCallback(
    (id) => {
      setLoading(true);
      const path = [`/get-by-pk/amenity/${id}`];
      API.CommonAPI.multipleAPICall("GET", path)
        .then((response) => {
          if (response[0].data.status === "Success") {
            setInitialState(response[0].data.data);
            setLoading(false);
          } else {
            setLoading(false);
            toastAndNavigate(
              dispatch,
              true,
              "error",
              "An Error Occurred, Please Try Again"
            );
          }
        })
        .catch((err) => {
          setLoading(false);
          toastAndNavigate(
            dispatch,
            true,
            "error",
            err?.response?.data?.msg || "An Error Occurred"
          );
          throw err;
        });
    },
    [id]
  );

  const createAmenity = useCallback((values) => {
    setLoading(true);
    API.AmenityAPI.createAmenity(values)
      .then(({ data: amenity }) => {
        if (amenity?.status === "Success") {
          setLoading(false);
          toastAndNavigate(dispatch, true, "success", "Successfully Created");
          handleDialogClose();
          if (typeof onRefresh === "function") {
            onRefresh();
          }
        } else {
          setLoading(false);
          toastAndNavigate(
            dispatch,
            true,
            "error",
            "An Error Occurred, Please Try Again"
          );
        }
      })
      .catch((err) => {
        setLoading(false);
        toastAndNavigate(
          dispatch,
          true,
          "error",
          err ? err.response?.data?.msg : "An Error Occurred"
        );
        throw err;
      });
  }, [onRefresh]);

  if (!openDialog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs transition-opacity" 
        onClick={handleDialogClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#101010] rounded-2xl shadow-2xl overflow-hidden border border-slate-200/90 dark:border-[#262626] flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-200"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0.94)), url(${formBg?.src || formBg})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover"
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-[#222] bg-white/80 dark:bg-[#101010]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              title === "Update" 
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50" 
                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50"
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {`${title} ${selected}`}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {title === "Update" ? "Modify existing campus amenity details" : "Add a new campus amenity facility"}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleDialogClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <Formik
            initialValues={initialState}
            enableReinitialize
            validationSchema={amenityValidation}
            onSubmit={(values) => {
              values.id ? updateAmenity(values) : createAmenity(values);
            }}
          >
            {({
              values,
              errors,
              touched,
              dirty,
              isSubmitting,
              handleBlur,
              handleChange,
              handleSubmit,
              resetForm,
            }) => (
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="p-6">
                  {/* Engraved Card Container */}
                  <div className="bg-white/95 dark:bg-[#161616]/90 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/90 dark:border-[#282828] shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] space-y-4">
                    {/* Name Input */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Amenity Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        ref={firstInputRef}
                        autoFocus
                        type="text"
                        name="name"
                        autoComplete="off"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.name}
                        className={`w-full px-3.5 py-2.5 bg-white dark:bg-[#121212] border rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:outline-none focus:ring-2 transition-all ${
                          touched.name && errors.name
                            ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
                            : "border-slate-300 dark:border-[#333] focus:ring-emerald-500/20 focus:border-emerald-500"
                        }`}
                        placeholder="e.g., Swimming Pool, Science Lab"
                      />
                      {touched.name && errors.name && (
                        <p className="text-xs text-rose-500 font-medium">{errors.name}</p>
                      )}
                    </div>

                    {/* Status Select */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Status
                      </label>
                      <div className="relative">
                        <select
                          name="status"
                          value={values.status}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-[#121212] border border-slate-300 dark:border-[#333] rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer appearance-none"
                        >
                          {Object.keys(config.status).map((item) => (
                            <option key={item} value={item} className="bg-white dark:bg-[#161616]">
                              {config.status[item]}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Description Input */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        name="description"
                        autoComplete="off"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.description}
                        className={`w-full px-3.5 py-2.5 bg-white dark:bg-[#121212] border rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:outline-none focus:ring-2 transition-all custom-scrollbar resize-none ${
                          touched.description && errors.description
                            ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
                            : "border-slate-300 dark:border-[#333] focus:ring-emerald-500/20 focus:border-emerald-500"
                        }`}
                        placeholder="Brief details about facility features, equipment, or access..."
                      />
                      {touched.description && errors.description && (
                        <p className="text-xs text-rose-500 font-medium">{errors.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200/80 dark:border-[#222] bg-white/80 dark:bg-[#101010]/80 backdrop-blur-md flex items-center justify-between gap-3 mt-auto">
                  <div>
                    {title !== "Update" && (
                      <button
                        type="button"
                        disabled={!dirty || isSubmitting}
                        onClick={() => {
                          if (window.confirm("Do you really want to reset this form?")) {
                            resetForm();
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#202020] rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleDialogClose}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#252525] rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!dirty || isSubmitting}
                      className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        title === "Update"
                          ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 hover:shadow-blue-600/30"
                          : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 hover:shadow-emerald-600/30"
                      }`}
                    >
                      <Save className="w-4 h-4" />
                      {title === "Update" ? "Update" : "Save"} {selected}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </Formik>
        </div>

        <Toast
          alerting={toastInfo.toastAlert}
          severity={toastInfo.toastSeverity}
          message={toastInfo.toastMessage}
        />
        {loading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
};

FormComponent.propTypes = {
  openDialog: PropTypes.bool,
  setOpenDialog: PropTypes.func,
  onRefresh: PropTypes.func,
};

export default FormComponent;
