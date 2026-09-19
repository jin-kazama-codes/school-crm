/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "@/lib/routerAdapter";
import { useSelector, useDispatch } from "react-redux";
import { read, utils } from 'xlsx';
import PropTypes from "prop-types";
import { UploadCloud, DownloadCloud, X } from 'lucide-react';

import API from "../../apis";
import Toast from "../common/Toast";
import Loader from "../common/Loader";
import { Utility } from "../utility";
import formBg from "../assets/formBg.png";

const ImportComponent = ({ openDialog, setOpenDialog }) => {
    //form component starts
    const [importedFile, setImportedFile] = useState(undefined);
    const [employees, setEmployee] = useState([]);
    const [fileName, setFileName] = useState('');
    const [uploadingRecord, setUploadingRecord] = useState({});
    const [loading, setLoading] = useState(false);
    
    const selected = useSelector(state => state.menuItems.selected);
    const toastInfo = useSelector(state => state.toastInfo);

    const { getStateCityFromZipCode, toastAndNavigate } = Utility();
    const dispatch = useDispatch();
    const navigateTo = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        handleImport();
    }

    const handleImport = () => {
        if (importedFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const wb = read(event.target.result);
                const sheets = wb.SheetNames;
                if (sheets.length) {
                    const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);
                    setEmployee(rows);
                    setUploadingRecord({
                        ...uploadingRecord,
                        count: sheets.length
                    })
                }
            }
            reader.readAsArrayBuffer(importedFile);
        }
    }

    const getIdByName = async (attrName, API) => {
        return new Promise(resolve => {
            API.getIdByName(attrName)
                .then(res => {
                    if (res.status === "Success") {
                        resolve(res.data);
                    } else {
                        resolve(new Error(`API call unsuccessful: ${res.status}`));
                    }
                })
                .catch(error => {
                    resolve(new Error(`API call failed: ${error.message}`));
                });
        });
    }

    const excelSerialToDate = async (serial) => {
        if (serial === undefined || serial === null) {
            return "0000-00-00";
        }

        if (!serial.toString().includes("/") && !serial.toString().includes("-")) {
            const excelEpoch = new Date(1900, 0, 1);
            const daysOffset = serial - 2;
            const date = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);

            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();

            return `${year}-${month}-${day}`;
        }
        return serial;
    }

    useEffect(() => {
        if (employees?.length) {
            const promises = employees.map(async (employee) => {
                try {
                    setLoading(true);
                    const apiResponse = await getStateCityFromZipCode(employee.zipcode);

                    const cityName = await apiResponse.city;
                    const stateName = await apiResponse.state;
                    const employeeDobSerial = employee.dob;

                    const state_id = await getIdByName(stateName, API.StateAPI);
                    const city_id = await getIdByName(cityName, API.CityAPI);

                    const employeeDob = await excelSerialToDate(employeeDobSerial);

                    if (employee.firstname) {
                        let condition = {
                            contact_no : employee.contact_no,
                        }
                        
                        const { data: emp } = await API.CommonAPI.createOrUpdate({
                            ...employee,
                            dob: employeeDob ? employeeDob.replace(/\//g, "-") : null,
                        }, 'employee', condition);

                        API.CommonAPI.createOrUpdate({
                            parent_id: emp.id,
                            parent: 'employee',
                            street: employee.street,
                            landmark: employee.landmark,
                            zipcode: employee.zipcode,
                            state: state_id,
                            city: city_id,
                            country: 2
                        }, 'address', {
                            parent: 'employee',
                            parent_id: emp.id
                        });
                        setUploadingRecord(prev => ({
                            ...prev,
                            count: (prev.count || 1) - 1,
                            name: employee.firstname,
                            skip: false
                        }));
                    } else {
                        setUploadingRecord(prev => ({
                            ...prev,
                            count: (prev.count || 1) - 1,
                            name: employee.firstname,
                            skip: true
                        }));
                    }
                } catch (error) {
                    if (error) {
                        console.error("Error in API:", error);
                    }
                }
            });

            Promise.all(promises)
                .then(() => {
                    console.log("All operations completed successfully.");
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "success", "Successfully Created", navigateTo, "#", true);
                })
                .catch(error => {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "error", error ? error?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
                    console.log("At least one operation failed:", error);
                })
        }
    }, [employees?.length]);

    if (!openDialog) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="w-full max-w-3xl bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                style={{
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${formBg?.src || formBg})`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "cover"
                }}
            >
                <div className="p-6 md:p-8 flex flex-col h-full max-h-[85vh]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 text-center w-full">
                            Import {selected}s
                        </h2>
                        <button onClick={() => setOpenDialog(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                        {loading && (
                            <div className="text-center text-xl font-medium text-slate-600 py-8">Loading...</div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-xl mx-auto w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-10 h-10 mb-3 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                    <p className="mb-2 text-sm text-slate-500 font-semibold">
                                        <span className="font-bold">Click to upload</span> or drag and drop
                                    </p>
                                </div>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    onChange={event => {
                                        const file = event.target.files[0];
                                        if (file) {
                                            setImportedFile(file);
                                            setFileName(file.name);
                                        }
                                    }} 
                                />
                            </label>

                            {fileName && (
                                <div className="text-center text-sm font-semibold text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    Selected File: <span className="text-blue-600 ml-2">{fileName}</span>
                                </div>
                            )}

                            <hr className="border-slate-200" />

                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <a href="https://ufile.io/68xl79m8" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                                    <button
                                        type="button"
                                        className="w-full px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        <DownloadCloud className="w-4 h-4" />
                                        Sample File
                                    </button>
                                </a>

                                {!loading && (
                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <button 
                                            type="button" 
                                            onClick={() => setOpenDialog(false)}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25 dark:hover:text-rose-200 border border-rose-200/80 dark:border-rose-500/30 rounded-xl font-semibold shadow-sm shadow-rose-500/10 hover:shadow-rose-500/20 transition-all cursor-pointer active:scale-95 text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={!importedFile}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                                        >
                                            Import
                                        </button>
                                    </div>
                                )}
                            </div>

                            {(uploadingRecord.name || uploadingRecord.count !== undefined) && (
                                <div className="text-center text-sm font-medium text-slate-600">
                                    {uploadingRecord.name && <p>Importing: {uploadingRecord.name}</p>}
                                    {uploadingRecord.count !== undefined && <p>Remaining: {uploadingRecord.count}</p>}
                                    {uploadingRecord.skip && <p className="text-amber-600">Skipping: {uploadingRecord.name}</p>}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
            
            {loading && <Loader />}
            
            <Toast 
                alerting={toastInfo.toastAlert}
                severity={toastInfo.toastSeverity}
                message={toastInfo.toastMessage}
            />
        </div>
    );
}

ImportComponent.propTypes = {
    setOpenDialog: PropTypes.func,
    openDialog: PropTypes.bool
};

export default ImportComponent;
