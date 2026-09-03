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

import API from "../../apis";
import AddressFormComponent from "../address/AddressFormComponent";
import Loader from "../common/Loader";
import Toast from "../common/Toast";
import EmployeeFormComponent from "./EmployeeFormComponent";

import { setMenuItem } from "../../redux/actions/NavigationAction";
import { Utility } from "../utility";

import formBg from "../assets/formBg.png";

const FormComponent = () => {
    const [title, setTitle] = useState("Create");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        employeeData: { values: null, validated: false },
        addressData: { values: null, validated: false },
        imageData: { values: null, validated: true }
    });
    const [updatedValues, setUpdatedValues] = useState(null);
    const [dirty, setDirty] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [reset, setReset] = useState(false);

    const selected = useSelector(state => state.menuItems.selected);
    const toastInfo = useSelector(state => state.toastInfo);

    const employeeFormRef = useRef();
    const addressFormRef = useRef();

    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const userParams = useParams();
    const { state } = useLocation();
    const { toastAndNavigate, getLocalStorage } = Utility();

    //after page refresh the id in router state becomes undefined, so getting employee id from url params
    let id = state?.id || userParams?.id;

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        if (selectedMenu?.selected) {
            dispatch(setMenuItem(selectedMenu.selected));
        }
    }, []);

    const updateEmployeeAndAddress = useCallback(
        async (formData) => {
          setLoading(true);
          const paths = [];
          const dataFields = [];
    
          try {
            if (formData.employeeData.dirty) {
              paths.push("/update-employee");
              dataFields.push(formData.employeeData.values);
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
                `/employee/listing/${getLocalStorage("class") || ""}`
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
      
    const populateEmployeeData = useCallback(id => {
        setLoading(true);
        const paths = [`/get-by-pk/employee/${id}`, `/get-address/employee/${id}`];
        API.CommonAPI.multipleAPICall("GET", paths)
            .then(responses => {
                if (responses[0].data.data) {
                    responses[0].data.data.dob = dayjs(responses[0].data.data.dob);
                    responses[0].data.data.admission_date = dayjs(responses[0].data.data.admission_date);
                }
                const dataObj = {
                    employeeData: responses[0].data.data,
                    addressData: responses[1]?.data?.data
                };
                setUpdatedValues(dataObj);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg);
                throw err;
            });
    },[id]);

    const createEmployee = useCallback(formData => {
        setLoading(true);
        API.EmployeeAPI.createEmployee({ ...formData.employeeData.values })
            .then(({ data: employee }) => {
                if (employee?.status === 'Success') {
                    API.AddressAPI.createAddress({
                        ...formData.addressData.values,
                        parent_id: employee.data.id,
                        parent: 'employee',
                    })
                        .then(() => {
                            setLoading(false);
                            toastAndNavigate(dispatch, true, "success", "Successfully Created", navigateTo, `/employee/listing`);
                        })
                        .catch(err => {
                            setLoading(false);
                            toastAndNavigate(dispatch, true, err ? err : "An Error Occurred");
                            throw err;
                        });
                }
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg);
                throw err;
            });
    },[formData]);

    //Create/Update/Populate employee
    useEffect(() => {
        if (id && !submitted) {
            setTitle("Update");
            populateEmployeeData(id);
        }
        if (formData.employeeData.validated && formData.addressData.validated) {
            formData.employeeData.values?.id ? updateEmployeeAndAddress(formData) : createEmployee(formData);
        } else {
            setSubmitted(false);
        }
    }, [id, submitted]);

    const handleSubmit = async () => {
        await employeeFormRef.current.Submit();
        await addressFormRef.current.Submit();
        setSubmitted(true);
    };

    const handleFormChange = (data, form) => {
        if (form === 'employee') {
            setFormData({ ...formData, employeeData: data });
        } else if (form === 'address') {
            setFormData({ ...formData, addressData: data });
        }
    };

    return (
        <div 
            className="m-4 md:m-8 rounded-[26px] border border-slate-200 dark:border-[#2a2a2a] overflow-hidden shadow-2xl relative animate-in fade-in duration-300 min-h-[70vh]"
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${formBg?.src || formBg})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundAttachment: "fixed"
            }}
        >
            <div className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-b border-white/20 dark:border-white/5 p-6 sticky top-0 z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight capitalize">
                    {`${title} ${selected}`}
                </h2>
            </div>

            <div className="p-4 md:p-6 bg-white/50 dark:bg-black/50 backdrop-blur-sm space-y-6">
                <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <EmployeeFormComponent
                        onChange={(data) => {
                            handleFormChange(data, 'employee');
                        }}
                        refId={employeeFormRef}
                        setDirty={setDirty}
                        reset={reset}
                        setReset={setReset}
                        userId={id}
                        updatedValues={updatedValues?.employeeData}
                    />
                </div>

                <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
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

                <div className="flex flex-wrap items-center justify-end gap-4 p-6 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur border-t border-slate-200 dark:border-slate-800 rounded-b-2xl">
                    {title !== "Update" && (
                        <button 
                            type="reset" 
                            disabled={!dirty || submitted}
                            onClick={() => {
                                if (window.confirm("Do You Really Want To Reset?")) {
                                    setReset(true);
                                }
                            }}
                            className="px-6 py-2.5 rounded-xl font-semibold text-white bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-yellow-500/20"
                        >
                            Reset
                        </button>
                    )}
                    
                    <button 
                        onClick={() => navigateTo(`/employee/listing/${getLocalStorage('class') || ''}`)}
                        className="px-6 py-2.5 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-md shadow-red-500/20"
                    >
                        Cancel
                    </button>
                    
                    <button 
                        type="submit" 
                        onClick={() => handleSubmit()} 
                        disabled={!dirty}
                        className={`px-6 py-2.5 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md ${
                            title === "Update" 
                            ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20" 
                            : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                        }`}
                    >
                        Submit
                    </button>
                </div>
            </div>

            <Toast 
                alerting={toastInfo.toastAlert}
                severity={toastInfo.toastSeverity}
                message={toastInfo.toastMessage}
            />

            {loading && <Loader />}
        </div>
    );
};

export default FormComponent;
