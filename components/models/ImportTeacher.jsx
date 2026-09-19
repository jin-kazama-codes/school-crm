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
import { saveAs } from 'file-saver';
import { read, utils, write } from 'xlsx';
import PropTypes from "prop-types";
import { UploadCloud, DownloadCloud, X } from 'lucide-react';

import API from "../../apis";
import Toast from "../common/Toast";
import Loader from "../common/Loader";
import { Utility } from "../utility";
import formBg from "../assets/formBg.png";

const ImportTeacher = ({ openDialog, setOpenDialog }) => {
    //form component starts
    const [importedFile, setImportedFile] = useState(undefined);
    const [teachers, setTeacher] = useState([]);
    const [fileName, setFileName] = useState('');
    const [uploadingRecord, setUploadingRecord] = useState({});
    const [loading, setLoading] = useState(false);
    const [skipped, setSkipped] = useState(true);
    const [skippedTeachers, setSkippedTeachers] = useState([]);
    
    const selected = useSelector(state => state.menuItems.selected);
    const toastInfo = useSelector(state => state.toastInfo);

    const { getStateCityFromZipCode, toastAndNavigate, generateNormalPassword, getLocalStorage, formateName } = Utility();
    const dispatch = useDispatch();
    const navigateTo = useNavigate();

    const schoolInformation = getLocalStorage("auth");

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
                    setTeacher(rows);
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
            return null;
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
        if (teachers?.length) {
            const promises = teachers.map(async (teacher) => {
                try {
                    setLoading(true);
                    const apiResponse = await getStateCityFromZipCode(teacher.zipcode);

                    const cityName = await apiResponse.city;
                    const stateName = await apiResponse.state;
                    const teacherDobSerial = teacher.dob;

                    const state_id = await getIdByName(stateName, API.StateAPI);
                    const city_id = await getIdByName(cityName, API.CityAPI);

                    const class_id = teacher.class ? await getIdByName(teacher.class, API.ClassAPI) : null;
                    const section_id = teacher.section ? await getIdByName(teacher.section, API.SectionAPI) : null;

                    const teacherDob = await excelSerialToDate(teacherDobSerial);

                    const isClassTeacher = teacher.is_class_teacher == "yes" ? 1 : 0;

                    const username = await formateName(teacher?.firstname || teacher?.lastname);
                    if (username && teacher.zipcode && teacher.contact_no) {
                        const password = await generateNormalPassword(username, schoolInformation.school_code);

                        const { data: user, status } = await API.CommonAPI.createOrUpdate({
                            username: username,
                            password: password.replace(/ /g, ""),
                            email: teacher?.email,
                            contact_no: teacher?.contact_no,
                            role: 4,
                            designation: 'teacher',
                            status: 'active'
                        }, 'user', {
                            designation: 'teacher',
                            username: username,
                            email: teacher.email,
                            contact_no: teacher.contact_no
                        });

                        if (status === 'Success') {
                            API.CommonAPI.createOrUpdate({
                                parent_id: user.id,
                                parent: 'user',
                                street: teacher.street,
                                landmark: teacher.landmark,
                                zipcode: teacher.zipcode,
                                state: state_id,
                                city: city_id,
                                country: 2
                            }, 'address', {
                                parent: 'user',
                                parent_id: user.id
                            });

                            let condition = {
                                parent_id: user.id,
                                firstname: teacher.firstname
                            }
                            const { data: tea } = await API.CommonAPI.createOrUpdate({
                                ...teacher,
                                parent_id: user.id,
                                is_class_teacher: isClassTeacher,
                                class: class_id,
                                section: section_id,
                                status: 'active',
                                dob: teacherDob ? teacherDob.replace(/\//g, "-") : null,

                            }, 'teacher', condition);

                            API.CommonAPI.createOrUpdate({
                                parent_id: tea.id,
                                parent: 'teacher',
                                street: teacher.street,
                                landmark: teacher.landmark,
                                zipcode: teacher.zipcode,
                                state: state_id,
                                city: city_id,
                                country: 2
                            }, 'address', {
                                parent: 'teacher',
                                parent_id: tea.id
                            });
                            setUploadingRecord(prev => ({
                                ...prev,
                                count: (prev.count || 1) - 1,
                                name: teacher.firstname,
                                skip: false
                            }));
                            setSkipped(false);
                        }
                    } else {
                        let fieldsObj = {
                            username,
                            email: teacher.email,
                            zipcode: teacher.zipcode
                        }
                        let emptyField;
                        Object.keys(fieldsObj).map(field => {
                            if (!fieldsObj[field]) {
                                emptyField = field;
                            }
                        });
                        setUploadingRecord(prev => ({
                            ...prev,
                            count: (prev.count || 1) - 1,
                            name: teacher.firstname,
                            skip: true
                        }));
                        setSkippedTeachers(prevSkipped => [...prevSkipped, {
                            firstname: teacher?.firstname,
                            contact_no: teacher?.contact_no,
                            email: teacher?.email,
                            street: teacher?.street,
                            zipcode: teacher?.zipcode,
                            dob: teacher?.dob,
                            error: emptyField
                        }]);
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
                    toastAndNavigate(dispatch, true, "success", "Successfully Created", navigateTo, 0);
                })
                .catch(error => {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "error", error ? error?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
                    console.log("At least one operation failed:", error);
                })
        }
    }, [teachers?.length]);

    useEffect(() => {
        if (!skippedTeachers.length && !loading && !skipped) {
            location.reload();
        }
    }, [skippedTeachers.length, loading, skipped]);

    const downloadSkippedTeachers = () => {
        const skippedData = skippedTeachers.map(skp => {
            const { error, ...rest } = skp;
            return rest;
        });

        const worksheet = utils.json_to_sheet(skippedData);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Skipped Teachers');
        const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, 'skipped_Teachers.xlsx');
    };

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
                        
                        {!loading && skippedTeachers.length > 0 && (
                            <div className="border border-red-200 bg-red-50/50 p-6 rounded-xl mx-auto max-w-xl text-center">
                                <h3 className="text-xl font-bold text-red-700 mb-4">Skipped Teachers</h3>
                                <ul className="space-y-2 mb-6">
                                    {skippedTeachers.map((teacher, index) => (
                                        <li key={index} className="text-red-600 font-medium bg-white px-4 py-2 rounded-lg shadow-sm">
                                            {teacher.firstname} - Missing {teacher.error}
                                        </li>
                                    ))}
                                </ul>
                                <button 
                                    onClick={downloadSkippedTeachers}
                                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center mx-auto gap-2"
                                >
                                    <DownloadCloud className="w-5 h-5" />
                                    Download Skipped List
                                </button>
                            </div>
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
                                <a href="https://ufile.io/dkv9szf1" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
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

ImportTeacher.propTypes = {
    setOpenDialog: PropTypes.func,
    openDialog: PropTypes.bool
};

export default ImportTeacher;
