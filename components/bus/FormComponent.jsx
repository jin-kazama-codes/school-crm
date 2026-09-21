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
import { Bus, Save, RotateCcw, X } from "lucide-react";

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
    <div 
        className="min-h-[90vh] m-4 md:m-8 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in duration-500 relative border border-slate-200 dark:border-slate-800"
        style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(${formBg?.src || formBg})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "start",
            backgroundSize: "cover",
            backgroundAttachment: "fixed",
        }}
    >
      <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-6 md:px-10 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-inner">
                <Bus className="w-8 h-8" />
            </div>
            <div>
                <h1 className="text-3xl font-extrabold font-display text-slate-800 dark:text-slate-100 tracking-tight">
                    {title} {selected}
                </h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                    Fill in the required information below
                </p>
            </div>
        </div>
      </div>

      <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
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

        <div className="flex flex-wrap items-center justify-end gap-4 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            {title !== "Update" && (
                <button 
                    type="button" 
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
                onClick={() => navigateTo(`/bus/listing/${getLocalStorage("class") || ""}`)}
                className="flex items-center gap-2 px-6 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25 dark:hover:text-rose-200 border border-rose-200/80 dark:border-rose-500/30 rounded-xl font-semibold shadow-sm shadow-rose-500/10 hover:shadow-rose-500/20 transition-all cursor-pointer active:scale-95"
            >
                <X className="w-5 h-5" />
                Cancel
            </button>
            
            <button 
                type="button" 
                onClick={() => handleSubmit()} 
                disabled={!dirty || submitted}
                className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 ${
                    title === "Update" 
                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 hover:shadow-blue-600/40" 
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 hover:shadow-emerald-600/40"
                }`}
            >
                <Save className="w-5 h-5" />
                {title === "Update" ? "Update Bus" : "Submit"}
            </button>
        </div>
      </div>

      <Toast
        alerting={toastInfo.toastAlert}
        severity={toastInfo.toastSeverity}
        message={toastInfo.toastMessage}
      />
      
      {loading && (
        <div className="fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <Loader />
        </div>
      )}
    </div>
  );
};

export default FormComponent;
