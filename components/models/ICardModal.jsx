/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from "prop-types";
import { usePDF } from 'react-to-pdf';
import { X, ImagePlus } from 'lucide-react';

import './styles.css';
import API from '../../apis';
import { Utility } from '../utility';
import idCard from "../assets/idCard.png";

const ICardModal = ({ iCardDetails, setICardDetails, previewStudent, openDialog, setOpenDialog }) => {
    const [signatureImage, setSignatureImage] = useState([]);
    const [signatureImageChange, setSignatureImageChange] = useState([]);
    const formClassesInRedux = useSelector(state => state.schoolClasses);
    const formSectionsInRedux = useSelector(state => state.schoolSections);

    const { toPDF, targetRef } = usePDF({ filename: 'document.pdf' });

    const { appendSuffix, findById } = Utility();

    const className = findById(iCardDetails?.class, formClassesInRedux?.listData)?.class_name;
    const sectionName = findById(iCardDetails?.section, formSectionsInRedux?.listData)?.section_name;

    const readImageFiles = (file, onReadComplete) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            onReadComplete(reader.result);
        }
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        if (signatureImage.length > 0) {
            readImageFiles(signatureImage[0], setSignatureImageChange);
        }
    }, [signatureImage]);

    useEffect(() => {
        if (openDialog) {
            API.SchoolAPI.getDetailsForICard()
                .then(data => {
                    if (data.status === 'Success') {
                        setICardDetails({
                            ...iCardDetails,
                            schoolData: data.data[0]
                        });
                    } else {
                        console.log("Error Fetching School Data, Please Try Again");
                    }
                })
                .catch(err => {
                    console.log("Error Fetching SchoolData:", err);
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openDialog]);
    
    if (!openDialog) return null;

    const stateName = document.getElementById("state");
    const cityName = document.getElementById("city");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="flex flex-col gap-4 animate-in zoom-in-95 duration-200">
                {/* ID Card PDF Target */}
                <div 
                    ref={targetRef} 
                    className="w-[350px] mx-auto shadow-[0px_4px_20px_rgba(0,0,0,0.1)] rounded-b-2xl bg-white overflow-hidden relative"
                    style={{
                        backgroundImage: `url(${idCard?.src || idCard})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    {/* Header */}
                    <div className="grid grid-cols-[auto_1fr] bg-[#2591ea] text-[#f6f6f2] rounded-b-[20px] p-2.5">
                        <div className="w-[60px] h-[60px] bg-green-500 rounded-full flex items-center justify-center overflow-hidden self-center justify-self-center">
                            <img src="/path/to/logo.png" alt="School Logo" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col items-center justify-center pl-2">
                            <p className="text-left text-lg font-bold m-0 leading-tight">
                                {iCardDetails?.schoolData?.name}
                            </p>
                            <p className="m-0 text-sm opacity-90">
                                {iCardDetails?.schoolData?.registered_by}
                            </p>
                        </div>
                        <p className="col-span-2 text-center mt-2.5 text-xs opacity-90">
                            {iCardDetails?.schoolData ? `${iCardDetails.schoolData.street} ${iCardDetails.schoolData.landmark} ${iCardDetails.schoolData.city} ${iCardDetails.schoolData.state} ${iCardDetails.schoolData.country}-${iCardDetails.schoolData.zipcode}` : ''}
                        </p>
                    </div>

                    {/* Student Photo */}
                    <img
                        src={previewStudent?.[0]?.value || '/placeholder-student.jpg'}
                        alt="student-image"
                        className="w-[120px] h-[140px] object-cover mx-auto mt-4 rounded-[10px] border-[3px] border-white shadow-md bg-white"
                    />

                    {/* Student Details */}
                    <div className="p-4 bg-white/80 backdrop-blur-sm mt-4 rounded-t-xl mx-2">
                        <div className="text-center mb-3">
                            <h2 className="text-[18px] font-bold text-blue-600 m-0">
                                {iCardDetails?.firstname && iCardDetails?.lastname && `${iCardDetails.firstname} ${iCardDetails.lastname}`}
                            </h2>
                            <p className="text-[16px] font-bold text-blue-500 m-0 mt-[-2px]">
                                {iCardDetails?.session}
                            </p>
                        </div>

                        <div className="grid grid-cols-[1fr_1.5fr] gap-x-2 gap-y-1.5 text-sm">
                            <span className="font-bold text-slate-700">Father's Name:</span>
                            <span className="text-slate-600 font-medium">{iCardDetails?.father_name?.charAt(0)?.toUpperCase() + iCardDetails?.father_name?.slice(1) || iCardDetails?.gaurdian?.charAt(0)?.toUpperCase() + iCardDetails?.gaurdian?.slice(1)}</span>

                            <span className="font-bold text-slate-700">Class:</span>
                            <span className="text-slate-600 font-medium">{className ? `${appendSuffix(className)} ${sectionName}` : ''}</span>

                            <span className="font-bold text-slate-700">DOB:</span>
                            <span className="text-slate-600 font-medium">{iCardDetails.dob ? iCardDetails.dob.format('YYYY-MM-DD') : ''}</span>

                            <span className="font-bold text-slate-700">Phone:</span>
                            <span className="text-slate-600 font-medium">{iCardDetails.contact_no ? iCardDetails.contact_no : ''}</span>

                            <span className="font-bold text-slate-700">Address:</span>
                            <span className="text-slate-600 font-medium text-xs leading-tight">
                                {`${iCardDetails?.street || ''} ${iCardDetails?.landmark || ''} ${iCardDetails?.studentCity || cityName?.innerText || ''} ${iCardDetails?.studentState || stateName?.innerText || ''} India-${iCardDetails?.zipcode || ''}`}
                            </span>
                        </div>
                    </div>

                    {/* Signature Area */}
                    <div className="px-4 pb-4 bg-white/80 backdrop-blur-sm mx-2">
                        {!signatureImageChange.length ? (
                            <div className="mt-4 flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-blue-50 text-sm font-medium border border-dashed border-slate-300 w-full justify-center">
                                    <ImagePlus className="w-5 h-5" />
                                    <span>Upload Signature</span>
                                    <input
                                        hidden
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setSignatureImage(e.target.files)}
                                    />
                                </label>
                            </div>
                        ) : (
                            <div className="mt-2 flex flex-col items-end relative">
                                <button
                                    onClick={() => {
                                        setSignatureImage([]);
                                        setSignatureImageChange([]);
                                    }}
                                    className="absolute -top-2 right-0 p-1 text-slate-400 hover:text-red-500 bg-white rounded-full shadow-sm z-10 transition-colors"
                                    title="Delete Signature"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <img
                                    src={signatureImageChange}
                                    alt="principal-signature"
                                    className="h-[50px] w-[130px] object-contain mr-4"
                                />
                            </div>
                        )}
                        <p className="text-right text-sm font-bold text-slate-700 mr-8 mt-1">Principal</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center w-[350px] mx-auto bg-white p-3 rounded-xl shadow-lg mt-2">
                    <button
                        onClick={() => toPDF()}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all text-sm"
                    >
                        Download PDF
                    </button>
                    <button
                        onClick={() => setOpenDialog(false)}
                        className="px-6 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-lg transition-all text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

ICardModal.propTypes = {
    iCardDetails: PropTypes.object,
    setICardDetails: PropTypes.func,
    setOpenDialog: PropTypes.func,
    openDialog: PropTypes.bool,
    previewStudent: PropTypes.array
};

export default ICardModal;
