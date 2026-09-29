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
import dayjs from "dayjs";
import { Bus, Save, RotateCcw, ArrowLeft } from "lucide-react";

import API from "../../apis";
import AddressFormComponent from "../address/AddressFormComponent";
import Loader from "../common/Loader";
import Toast from "../common/Toast";
import BusFormComponent from "./BusFormComponent";

import { setMenuItem } from "../../redux/actions/NavigationAction";
import { Utility } from "../utility";

import formBg from "../assets/formBg.png";

const FormComponent = () => {
  const [title, setTitle] = useState("Create");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    busData: { values: null, validated: false },
    addressData: { values: null, validated: false },
    imageData: { values: null, validated: true },
  });
  const [updatedValues, setUpdatedValues] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reset, setReset] = useState(false);

  const selected = useSelector((state) => state.menuItems.selected);
  const toastInfo = useSelector((state) => state.toastInfo);

  const busFormRef = useRef();
  const addressFormRef = useRef();

  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const userParams = useParams();
  const { state } = useLocation();
  const { toastAndNavigate, getLocalStorage } = Utility();

  let id = state?.id || userParams?.id;

  useEffect(() => {
    const selectedMenu = getLocalStorage("menu");
    if(selectedMenu?.selected) {
        dispatch(setMenuItem(selectedMenu.selected));
    }
  }, []);

  const updateBusAndAddress = useCallback(
    async (formData) => {
      setLoading(true);
      const paths = [];
      const dataFields = [];

      try {
        if (formData.busData.dirty) {
          paths.push("/update-bus");
          dataFields.push(formData.busData.values);
        }
        if (formData.addressData.dirty) {
          paths.push("/update-address");
          dataFields.push(formData.addressData.values);
        }
        const responses = await API.CommonAPI.multipleAPICall(
          "PATCH",
          paths,
          dataFields
        );
        if (responses) {
          toastAndNavigate(
            dispatch,
            true,
            "info",
            "Successfully Updated",
            navigateTo,
            `/bus/listing/${getLocalStorage("class") || ""}`
          );
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
        toastAndNavigate(
          dispatch,
          true,
          "error",
          err ? err?.response?.data?.msg : "An Error Occurred",
          navigateTo,
          0
        );
        throw err;
      }
    },
    [formData]
  );

  const populateBusData = useCallback((id) => {
    setLoading(true);
    const paths = [`/get-by-pk/bus/${id}`, `/get-address/bus/${id}`];
    API.CommonAPI.multipleAPICall("GET", paths)
      .then((responses) => {
        if (responses[0].data.data) {
          responses[0].data.data.dob = dayjs(responses[0].data.data.dob);
          responses[0].data.data.admission_date = dayjs(
            responses[0].data.data.admission_date
          );
        }
        const dataObj = {
          busData: responses[0].data.data,
          addressData: responses[1]?.data?.data,
        };
        setUpdatedValues(dataObj);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg);
        throw err;
      });
  }, []);

  const createBus = useCallback(
    (formData) => {
      setLoading(true);
      API.BusAPI.createBus({ ...formData.busData.values })
        .then(({ data: bus }) => {
          if (bus?.status === "Success") {
            API.AddressAPI.createAddress({
              ...formData.addressData.values,
              parent_id: bus.data.id,
              parent: "bus",
            })
              .then(() => {
                setLoading(false);
                toastAndNavigate(
                  dispatch,
                  true,
                  "success",
                  "Successfully Created",
                  navigateTo,
                  `/bus/listing`
                );
              })
              .catch((err) => {
                setLoading(false);
                toastAndNavigate(
                  dispatch,
                  true,
                  err ? err : "An Error Occurred"
                );
                throw err;
              });
          }
        })
        .catch((err) => {
          setLoading(false);
          toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg);
          throw err;
        });
    },
    [formData]
  );

  useEffect(() => {
    if (id && !submitted) {
      setTitle("Update");
      populateBusData(id);
    }
    if (formData.busData.validated && formData.addressData.validated) {
      formData.busData.values?.id
        ? updateBusAndAddress(formData)
        : createBus(formData);
    } else {
      setSubmitted(false);
    }
  }, [id, submitted]);

  const handleSubmit = async () => {
    await busFormRef.current.Submit();
    await addressFormRef.current.Submit();
    setSubmitted(true);
  };

  const handleFormChange = (data, form) => {
    if (form === "bus") {
      setFormData({ ...formData, busData: data });
    } else if (form === "address") {
      setFormData({ ...formData, addressData: data });
    }
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
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                {`${title} ${selected || "Bus"}`}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {title === "Update" 
                  ? "Modify transport vehicle records, transit routes, crew information, and addresses" 
                  : "Register a new school vehicle with registration details, routes, and crew contacts"}
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => navigateTo(`/${(selected || "bus").toLowerCase()}/listing`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#252525] rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to List
          </button>
        </div>

        {/* Form Main Body */}
        <div className="p-6 space-y-6">
          <BusFormComponent
            onChange={(data) => {
              handleFormChange(data, 'bus');
            }}
            refId={busFormRef}
            setDirty={setDirty}
            reset={reset}
            setReset={setReset}
            userId={id}
            updatedValues={updatedValues?.busData}
          />
          
          {/* Address Form Container */}
          <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
            <AddressFormComponent
              onChange={(data) => {
                handleFormChange(data, 'address');
              }}
              refId={addressFormRef}
              update={id ? true : false}
              setDirty={setDirty}
              reset={reset}
              setReset={setReset}
              updatedValues={updatedValues?.addressData}
            />
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 border-t border-slate-200/80 dark:border-[#222] bg-white/80 dark:bg-[#101010]/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {title !== "Update" && (
              <button 
                type="reset" 
                disabled={!dirty || submitted}
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
              onClick={() => navigateTo(`/${(selected || "bus").toLowerCase()}/listing`)}
              className="px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#252525] rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
            
            <button 
              type="submit" 
              onClick={() => handleSubmit()} 
              disabled={!dirty || submitted}
              className={`inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                title === "Update" 
                  ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 hover:shadow-blue-600/30" 
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 hover:shadow-emerald-600/30"
              }`}
            >
              <Save className="w-4 h-4" />
              {title === "Update" ? "Update Bus" : "Save Bus"}
            </button>
          </div>
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

export default FormComponent;
