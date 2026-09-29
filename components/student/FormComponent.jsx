/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useCallback, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "@/lib/routerAdapter";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { RotateCcw, Save, ArrowLeft, GraduationCap, CreditCard } from "lucide-react";

import API from "../../apis";
import AddressFormComponent from "../address/AddressFormComponent";
import ICardModal from "../models/ICardModal";
import ImagePicker from "../image/ImagePicker";
import Loader from "../common/Loader";
import StudentFormComponent from "./StudentFormComponent";
import Toast from "../common/Toast";

import { setAllSubjects } from "../../redux/actions/SubjectAction";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { Utility } from "../utility";

import formBg from "../assets/formBg.png";

const ENV = process.env;

const FormComponent = () => {
    const [title, setTitle] = useState("Create");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        studentData: { values: null, validated: false },
        addressData: { values: null, validated: false },
        imageData: { values: null, validated: false },
        parentImageData: { values: null, validated: false }
    });
    const [updatedValues, setUpdatedValues] = useState(null);
    const [updatedStudentImage, setUpdatedStudentImage] = useState([]);
    const [deletedImage, setDeletedImage] = useState([]);
    const [previewStudent, setPreviewStudent] = useState([]);
    const [deletedParentImage, setDeletedParentImage] = useState([]);
    const [previewParent, setPreviewParent] = useState([]);
    const [updatedParentImage, setUpdatedParentImage] = useState([]);

    const [dirty, setDirty] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [reset, setReset] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [classData, setClassData] = useState([]);
    const [iCardDetails, setICardDetails] = useState({});


    const formSubjectsInRedux = useSelector(state => state.allSubjects);
    const selected = useSelector(state => state.menuItems.selected);
    const toastInfo = useSelector(state => state.toastInfo);

    const studentFormRef = useRef();
    const addressFormRef = useRef();
    const imageFormRef = useRef();
    const parentImageFormRef = useRef();

    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const userParams = useParams();

    const { state } = useLocation();
    const { getLocalStorage, getIdsFromObject, generatePassword, findMultipleById, formatImageName, fetchAndSetAll,
        toastAndNavigate, generateNormalPassword, formateName } = Utility();

    let id = state?.id || userParams?.id;
    const showIdCard = !id || (id && !updatedValues?.studentData?.id_card);
    const formValidated = formData.studentData.validated && formData.addressData.validated && formData.imageData.validated && formData.parentImageData.validated;

    const schoolInformation = getLocalStorage("auth");

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        if (selectedMenu?.selected) {
            dispatch(setMenuItem(selectedMenu.selected));
        }
    }, []);

    const updateStudentAndAddress = useCallback(async formData => {
        setLoading(true);
        const paths = [];
        const dataFields = [];

        const username = formData.studentData.values?.father_name || formData.studentData.values?.mother_name ||
            formData.studentData.values?.guardian;
        formData.studentData.values = {
            ...formData.studentData.values,
            subjects: getIdsFromObject(formData.studentData.values?.subjects)
        }
        try {
            if (formData.studentData?.dirty) {
                await API.UserAPI.update({
                    userId: formData.studentData?.values?.parent_id,
                    id: formData.studentData?.values?.parent_id,
                    username: username,
                    email: formData.studentData?.values?.email,
                    contact_no: formData.studentData?.values?.contact_no,
                    status: formData.studentData?.values?.status
                });
                paths.push("/update-student");
                dataFields.push({
                    ...formData.studentData.values,
                });
            }
            if (formData.addressData.dirty) {
                paths.push("/update-address");
                dataFields.push({ ...formData.addressData.values });
            }
            const responses = await API.CommonAPI.multipleAPICall("PATCH", paths, dataFields);
            if (responses) {        //due to this if schoolform or address form is dirty, then other forms are also manipulated
                updateImageAndClassData(formData);
            }
        } catch (err) {
            setLoading(false);
            toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
            throw err;
        }
    }, [formData]);


    const updateImageAndClassData = useCallback(async formData => {
        let flag = false;
        try {
            let formattedName;
            // delete all images from db on every update and later insert new and old again
            let deleteImgs = [];
            if (formData.imageData?.values?.image) {
                deleteImgs.push("student");
            } else if (formData.parentImageData?.values?.image) {
                deleteImgs.push("parent");
            } else {
                flag = true;
            }
            await API.ImageAPI.deleteImage({
                parent: deleteImgs,
                parent_id: id
            });
            // upload new images to backend folder and insert in db
            if (formData.imageData?.values?.image) {
                Array.from(formData.imageData.values?.image).map(async image => {
                    formattedName = formatImageName(image.name);
                    API.ImageAPI.uploadImageToS3({
                        image: image,
                        folder: `student/${formattedName}`,
                    })
                        .then(res => {
                            if (res.data.status === "Success") {
                                API.ImageAPI.createImage({
                                    image_src: res.data.data,
                                    school_id: formData.studentData.values.school_id,
                                    parent_id: formData.studentData.values.id,
                                    parent: 'student',
                                    type: 'normal'
                                });
                            }
                        });
                    flag = true;
                });
            }

            // upload new parent images to aws and insert in db
            if (formData.parentImageData?.values?.image) {
                Array.from(formData.parentImageData.values.image).map(async image => {
                    let formattedName = formatImageName(image.name);
                    API.ImageAPI.uploadImageToS3({
                        image: image,
                        folder: `student/${formattedName}`,
                    })
                        .then(res => {
                            if (res.data.status === "Success") {
                                API.ImageAPI.createImage({
                                    image_src: res.data.data,
                                    school_id: formData.studentData.values.school_id,
                                    parent_id: formData.studentData.values.id,
                                    parent: 'parent',
                                    type: 'normal'
                                });
                            }
                        });
                });
                flag = true;
            }

            if (flag) {
                setLoading(false);
                toastAndNavigate(dispatch, true, "info", "Successfully Updated", navigateTo, `/student/listing/${getLocalStorage('class') || ''}`);
            }
        } catch (err) {
            setLoading(false);
            toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
            throw err;
        }
    }, [formData]);

    const populateStudentData = useCallback(id => {
        setLoading(true);
        const paths = [`/get-by-pk/student/${id}`, `/get-address/student/${id}`, `/get-image/student/${id}`, `/get-image/parent/${id}`];

        API.CommonAPI.multipleAPICall("GET", paths)
            .then(responses => {
                if (responses[0].data.data) {
                    responses[0].data.data.subjects = findMultipleById(responses[0].data.data.subjects, formSubjectsInRedux?.listData)
                    responses[0].data.data.dob = dayjs(responses[0].data.data.dob);
                    responses[0].data.data.admission_date = dayjs(responses[0].data.data.admission_date);
                }
                const dataObj = {
                    studentData: responses[0].data.data,
                    addressData: responses[1]?.data?.data,
                    studentImage: responses[2]?.data?.data,
                    parentImage: responses[3]?.data.data
                };
                setUpdatedValues(dataObj);
                setUpdatedStudentImage(dataObj?.studentImage);
                setUpdatedParentImage(dataObj?.parentImage);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
                throw err;
            });
    }, [formSubjectsInRedux?.listData]);

    const createStudent = useCallback(async formData => {
        let promise1;
        let promise2;
        let promise3;
        setLoading(true);
        const username = await formateName(formData.studentData.values?.father_name || formData.studentData.values?.mother_name ||
            formData.studentData.values?.guardian);
        const password = await generateNormalPassword(username, schoolInformation?.school_code || 'DEMO');

        formData.studentData.values = {
            ...formData.studentData.values,
            subjects: getIdsFromObject(formData.studentData.values?.subjects)
        }

        API.UserAPI.register({
            username: username,
            password: password,
            email: formData.studentData.values.email,
            contact_no: formData.studentData.values.contact_no,
            role: 5,
            designation: 'parent',
            status: formData.studentData.values.status
        })
            .then(({ data: user }) => {
                if (user?.status === 'Success') {

                    API.AddressAPI.createAddress({
                        ...formData.addressData.values,
                        school_id: user.data.school_id,
                        parent_id: user.data.id,
                        parent: 'user'
                    })

                    API.StudentAPI.createStudent({
                        ...formData.studentData.values,
                        parent_id: user.data.id,
                        password: password
                    })
                        .then(async ({ data: student }) => {
                            promise1 = API.AddressAPI.createAddress({
                                ...formData.addressData.values,
                                school_id: student.data.school_id,
                                parent_id: student.data.id,
                                parent: 'student'
                            });

                            if (formData.imageData.values?.image?.length) {
                                promise2 = Array.from(formData.imageData.values.image).map(async (image) => {
                                    let formattedName = formatImageName(image.name);
                                    await API.ImageAPI.uploadImageToS3({
                                        image: image,
                                        folder: `student/${formattedName}`,
                                    })
                                        .then(res => {
                                            if (res.data.status === "Success") {
                                                API.ImageAPI.createImage({
                                                    image_src: res.data.data,
                                                    school_id: student.data.school_id,
                                                    parent_id: student.data.id,
                                                    parent: 'student',
                                                    type: 'normal'
                                                })
                                            }
                                        })
                                });
                            }

                            if (formData.parentImageData.values?.image?.length) {
                                promise3 = Array.from(formData.parentImageData.values.image).map(async (image) => {
                                    let formattedName = formatImageName(image.name);
                                    await API.ImageAPI.uploadImageToS3({
                                        image: image,
                                        folder: `student/${formattedName}`,
                                    })
                                        .then(res => {
                                            if (res.data.status === "Success") {
                                                API.ImageAPI.createImage({
                                                    image_src: res.data.data,
                                                    school_id: student.data.school_id,
                                                    parent_id: student.data.id,
                                                    parent: 'parent',
                                                    type: 'parent'
                                                })
                                            }

                                        })
                                });
                            }
                            try {
                                await Promise.all([promise1, promise2, promise3]);
                                setLoading(false);
                                toastAndNavigate(dispatch, true, "success", "Successfully Created", navigateTo, `/student/listing/${getLocalStorage('class') || ''}`);
                            } catch (err) {
                                setLoading(false);
                                toastAndNavigate(dispatch, true, err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
                                console.log('Error in student create', err);
                            }
                        })
                        .catch(err => {
                            setLoading(false);
                            toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
                            console.log('Error in student create', err);
                        });
                }
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
                console.log('Error in student create', err);
            });
    }, []);

    useEffect(() => {
        if (!formSubjectsInRedux?.listData?.length) {
            fetchAndSetAll(dispatch, setAllSubjects, API.SubjectAPI);
        }
    }, [formSubjectsInRedux?.listData?.length]);

    useEffect(() => {
        if (id) {
            setICardDetails({
                ...updatedValues?.studentData,
                ...updatedValues?.addressData,
                ...(updatedValues?.studentImage && updatedValues?.studentImage[0])
            });
        }
    }, [updatedValues?.studentData, updatedValues?.addressData, updatedValues?.studentImage]);

    //Create/Update/Populate student
    useEffect(() => {
        if (id && !submitted && formSubjectsInRedux?.listData) {
            setTitle("Update");
            populateStudentData(id);
        }
        if (formValidated) {
            formData?.studentData?.values?.id ? updateStudentAndAddress(formData) : createStudent(formData);
        } else {
            setSubmitted(false);
        }
    }, [id, submitted, formSubjectsInRedux?.listData]);

    const handleSubmit = async () => {
        await studentFormRef.current.Submit();
        await addressFormRef.current.Submit();
        await imageFormRef.current?.Submit();
        await parentImageFormRef.current?.Submit();
        setSubmitted(true);
    };

    const handleFormChange = (data, form) => {
        if (form === 'student') {
            setFormData({ ...formData, studentData: data });
        } else if (form === 'address') {
            setFormData({ ...formData, addressData: data });
        } else if (form === 'student_image') {
            setFormData({ ...formData, imageData: data });
        } else if (form === 'parent_image') {
            setFormData({ ...formData, parentImageData: data });
        }
    };

    const isICardValid = previewStudent?.length > 0
        && iCardDetails.firstname?.length > 0
        && iCardDetails.father_name?.length > 0
        && iCardDetails.lastname?.length > 0
        && iCardDetails.class > 0
        && iCardDetails.section > 0
        && iCardDetails.contact_no?.length > 0
        && iCardDetails.street?.length > 0
        && iCardDetails.landmark?.length > 0
        && iCardDetails.zipcode?.length > 0;

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
                                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50"
                        }`}>
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                                {`${title} ${selected || "Student"}`}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {title === "Update" 
                                    ? "Modify student records, parent/guardian info, academic details, and media assets" 
                                    : "Register a new student profile with academic details, parent contacts, and media"}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigateTo(`/student/listing/${getLocalStorage('class') || ''}`)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#252525] rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to List
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <StudentFormComponent
                        onChange={(data) => {
                            handleFormChange(data, 'student');
                        }}
                        refId={studentFormRef}
                        setDirty={setDirty}
                        reset={reset}
                        setReset={setReset}
                        userId={id}
                        classData={classData}
                        setClassData={setClassData}
                        allSubjects={formSubjectsInRedux?.listData}
                        updatedValues={updatedValues?.studentData}
                        iCardDetails={iCardDetails}
                        setICardDetails={setICardDetails}
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
                        iCardDetails={iCardDetails}
                        setICardDetails={setICardDetails}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-[#222]">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Student Photo
                                </h3>
                                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Official Student Portrait</span>
                            </div>
                            <ImagePicker
                                key="student"
                                onChange={data => handleFormChange(data, 'student_image')}
                                refId={imageFormRef}
                                reset={reset}
                                setReset={setReset}
                                setDirty={setDirty}
                                preview={previewStudent}
                                setPreview={setPreviewStudent}
                                deletedImage={deletedImage}
                                setDeletedImage={setDeletedImage}
                                updatedImage={updatedStudentImage}
                                setUpdatedImage={setUpdatedStudentImage}
                                imageType="Student"
                                ENV={ENV}
                                iCardDetails={iCardDetails}
                                setICardDetails={setICardDetails}
                            />
                        </div>

                        <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-[#222]">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    Parent / Guardian Photo
                                </h3>
                                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Parent / Guardian Verification</span>
                            </div>
                            <ImagePicker
                                key="parent"
                                onChange={data => handleFormChange(data, 'parent_image')}
                                refId={parentImageFormRef}
                                reset={reset}
                                setReset={setReset}
                                setDirty={setDirty}
                                preview={previewParent}
                                setPreview={setPreviewParent}
                                deletedImage={deletedParentImage}
                                setDeletedImage={setDeletedParentImage}
                                updatedImage={updatedParentImage}
                                setUpdatedImage={setUpdatedParentImage}
                                imageType="Parent"
                                ENV={ENV}
                                validation={false}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200/80 dark:border-[#222] bg-white/80 dark:bg-[#101010]/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {showIdCard && (
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setOpenDialog(!openDialog)}
                                    disabled={!id && !isICardValid}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                                >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    Generate ICard
                                </button>
                                <ICardModal 
                                    iCardDetails={iCardDetails} 
                                    setICardDetails={setICardDetails} 
                                    previewStudent={previewStudent}
                                    openDialog={openDialog} 
                                    setOpenDialog={setOpenDialog} 
                                />
                            </div>
                        )}
                        
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
                            onClick={() => navigateTo(`/student/listing/${getLocalStorage('class') || ''}`)}
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
                            {title === "Update" ? "Update Student" : "Save Student"}
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
