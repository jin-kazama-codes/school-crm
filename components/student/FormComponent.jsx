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
import { RotateCcw, X as XIcon, Save } from "lucide-react";

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
                        iCardDetails={iCardDetails}
                        setICardDetails={setICardDetails}
                    />
                </div>

                <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Student Image</h3>
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
                        updatedImage={updatedStudentImage}            //these are updated Values
                        setUpdatedImage={setUpdatedStudentImage}
                        imageType="Student"
                        ENV={ENV}
                        iCardDetails={iCardDetails}
                        setICardDetails={setICardDetails}
                    />
                </div>

                <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Parent Image</h3>
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
                        updatedImage={updatedParentImage}            //these are updated Values
                        setUpdatedImage={setUpdatedParentImage}
                        imageType="Parent"
                        ENV={ENV}
                        validation={false}
                    />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-4 p-6 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur border-t border-slate-200 dark:border-slate-800 rounded-b-2xl">
                    
                    {showIdCard && (
                        <div className="mr-auto">
                            <button
                                onClick={() => setOpenDialog(!openDialog)}
                                disabled={!id && !isICardValid}
                                className="px-6 py-2.5 rounded-xl font-semibold text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-indigo-500/20"
                            >
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
                        onClick={() => navigateTo(`/student/listing/${getLocalStorage('class') || ''}`)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25 dark:hover:text-rose-200 border border-rose-200/80 dark:border-rose-500/30 rounded-xl font-semibold shadow-sm shadow-rose-500/10 hover:shadow-rose-500/20 transition-all cursor-pointer active:scale-95"
                    >
                        <XIcon className="w-5 h-5" />
                        Cancel
                    </button>
                    
                    <button 
                        type="submit" 
                        onClick={() => handleSubmit()} 
                        disabled={!dirty}
                        className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 ${
                            title === "Update" 
                            ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 hover:shadow-blue-600/40" 
                            : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 hover:shadow-emerald-600/40"
                        }`}
                    >
                        <Save className="w-5 h-5" />
                        {title === "Update" ? "Update Student" : "Submit"}
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
