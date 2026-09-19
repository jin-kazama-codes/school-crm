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
import { Save, X as XIcon, RotateCcw } from "lucide-react";

import API from "../../apis";
import AddressFormComponent from "../address/AddressFormComponent";
import ImagePicker from "../image/ImagePicker";
import Loader from "../common/Loader";
import Toast from "../common/Toast";
import SchoolFormComponent from "./SchoolFormComponent";

import { setAllClasses } from "../../redux/actions/ClassAction";
import { setAllSections } from "../../redux/actions/SectionAction";
import { setAllSubjects } from "../../redux/actions/SubjectAction";
import { setAllPaymentMethods } from "../../redux/actions/PaymentMethodAction";
import { setFormAmenities } from "../../redux/actions/AmenityAction";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { useCommon } from "../hooks/common";
import { Utility } from "../utility";

import formBg from "../assets/formBg.png";

const ENV = process.env;

const FormComponent = () => {
    const [title, setTitle] = useState("Create");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        schoolData: { values: null, validated: false },
        addressData: { values: null, validated: false },
        imageData: { values: null, validated: false },
        bannerImageData: { values: null, validated: false }
    });
    const [updatedValues, setUpdatedValues] = useState(null);
    const [deletedImage, setDeletedImage] = useState([]);
    const [previewDisplay, setPreviewDisplay] = useState([]);
    const [deletedBannerImage, setDeletedBannerImage] = useState([]);
    const [previewBanner, setPreviewBanner] = useState([]);
    const [updatedDisplayImage, setUpdatedDisplayImage] = useState([]);
    const [updatedBannerImage, setUpdatedBannerImage] = useState([]);

    const [dirty, setDirty] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [reset, setReset] = useState(false);

    const allClasses = useSelector(state => state.allClasses);
    const allSections = useSelector(state => state.allSections);
    const allSubjects = useSelector(state => state.allSubjects);
    const formAmenitiesInRedux = useSelector(state => state.allFormAmenities);
    const allPaymentMethods = useSelector(state => state.allPaymentMethods);
    const selected = useSelector(state => state.menuItems.selected);
    const toastInfo = useSelector(state => state.toastInfo);

    const schoolFormRef = useRef();
    const addressFormRef = useRef();
    const imageFormRef = useRef();
    const bannerImageFormRef = useRef();

    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const userParams = useParams();

    const { state } = useLocation();
    const { getPaginatedData } = useCommon();
    const { createSchoolCode, formatImageName, getLocalStorage, getIdsFromObject, findMultipleById,
        fetchAndSetAll, toastAndNavigate } = Utility();

    //after page refresh the id in router state becomes undefined, so getting school id from url params
    let id = state?.id || userParams?.id;

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        dispatch(setMenuItem(selectedMenu.selected));
    }, []);

    const updateSchoolAndAddress = useCallback(async formData => {
        setLoading(true);
        const paths = [];
        const dataFields = [];

        if (formData.schoolData.dirty) {
            paths.push("/update-school");
            dataFields.push({
                ...formData.schoolData.values,
                amenities: getIdsFromObject(formData.schoolData.values.amenities),
                payment_methods: getIdsFromObject(formData.schoolData.values.payment_methods)
            });
        }

        if (formData.addressData.dirty) {
            paths.push("/update-address");
            dataFields.push({ ...formData.addressData.values });
        }

        try {
            const responses = await API.CommonAPI.multipleAPICall("PATCH", paths, dataFields);
            // if (responses) {        //due to this if schoolform or address form is dirty, then other forms are also manipulated
            //     updateImageAndClassData(formData);
            // }

            console.log("func pe aaya");
            updateImageAndClassData(formData);
        } catch (err) {
            setLoading(false);
            toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
            throw err;
        }
    }, [formData]);

    const updateImageAndClassData = useCallback(async formData => {
        // delete the selected (removed) images from Azure which are in deletedImage state
        // if (deletedImage.length) {
        //     deletedImage.forEach(image => {
        //         deleteFileFromAzure("school", image);
        //         console.log("Deleted normal image from azure");
        //     });
        // }
        // delete the selected (removed) images from Azure which are in deletedBannerImage state
        // if (deletedBannerImage.length) {
        //     deletedBannerImage.forEach(image => {
        //         deleteFileFromAzure("school/banner", image);
        //         console.log("Deleted  banner image from azure");
        //     });
        // }
        let status = null;

        console.log("formdatadirty",formData.schoolData.dirty);

        if (formData.schoolData.dirty) {

            console.log("ander ayaa");
            // Delete all class sections from the mapping table
            await API.SchoolAPI.deleteFromMappingTable({ school_id: id });

            const updatedClassData = formData.schoolData.values.sections.map(async (innerArray, classIndex) => {
                // Get class-related data or default to 0 if not available
                const schoolClass = formData.schoolData.values.classes[classIndex] || 0;
                const classFee = formData.schoolData.values.classes_fee[classIndex] || 0;
                const classCapacity = formData.schoolData.values.classes_capacity[classIndex] || 0;
                const classLateFee = formData.schoolData.values.classes_late_fee[classIndex] || 0;
                const classLateFeeDuration = formData.schoolData.values.classes_late_fee_duration[classIndex] || 0;

                // Iterating through each section in the class then associating subject ids for each section of class
                return Promise.all(innerArray.map(async (sectionData, sectionIndex) => {
                    const subjectArray = formData.schoolData.values.subjects[classIndex] ? formData.schoolData.values.subjects[classIndex][sectionIndex] : [];
                    await API.SchoolAPI.insertIntoMappingTable(
                        [formData.schoolData.values.id, schoolClass, sectionData.section_id,
                        getIdsFromObject(subjectArray, allSubjects?.listData), classFee, classCapacity, classLateFee,
                            classLateFeeDuration]
                    );
                }));
            });
            await Promise.all(updatedClassData);
        }

        try {
            let formattedName;
            // delete all images from db on every update and later insert new and old again
            await API.ImageAPI.deleteImage({
                parent: "school",
                parent_id: id
            });
            // upload new images to backend folder and insert in db
            if (formData.imageData?.values?.image) {
                Array.from(formData.imageData.values?.image).map(async image => {
                    formattedName = formatImageName(image.name);
                        API.ImageAPI.uploadImageToS3({
                        image: image,
                        folder: `school/${formattedName}`,
                    })
                        .then(res => {
                            if (res.data.status === "Success") {
                                API.ImageAPI.createImage({
                                    image_src: res.data.data,
                                    school_id: formData.schoolData.values.id,
                                    parent_id: formData.schoolData.values.id,
                                    parent: 'school',
                                    type: 'display'
                                })
                            }

                        })
                });
                status = true;
            }
            // insert old images only in db & not on azure
            if (formData.imageData?.values?.constructor === Array) {
                formData.imageData.values.map(async image => {
                    await API.ImageAPI.createImage({
                        image_src: image.image_src,
                        school_id: image.school_id,
                        parent_id: image.parent_id,
                        parent: image.parent,
                        type: image.type
                    });
                });
                status = true;
            }

            // upload new parent images to azure and insert in db
            if (formData.bannerImageData?.values?.image) {
                Array.from(formData.bannerImageData.values.image).map(async image => {
                    let formattedName = formatImageName(image.name);
                    await API.ImageAPI.uploadImageToS3({
                        image: image,
                        folder: `school/${formattedName}`
                    })
                        .then(res => {
                            if (res.data.status === "Success") {
                                API.ImageAPI.createImage({
                                    image_src: res.data.data,
                                    school_id: formData.schoolData.values.id,
                                    parent_id: formData.schoolData.values.id,
                                    parent: 'school',
                                    type: 'banner'
                                })
                            }
                        })
                });
                status = true;
            }
            // insert old images parent only in db & not on azure
            if (formData.bannerImageData?.values?.constructor === Array) {
                formData.bannerImageData.values.map(async image => {
                    await API.ImageAPI.createImage({
                        image_src: image.image_src,
                        school_id: image.school_id,
                        parent_id: image.parent_id,
                        parent: image.parent,
                        type: image.type
                    });
                });
                status = true;
            }
            if (status) {
                setLoading(false);
                toastAndNavigate(dispatch, true, "info", "Successfully Updated", navigateTo, '/school/listing');
            }
        } catch (err) {
            setLoading(false);
            toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
            console.log("Error in School Update", err);
        }
    }, [formData]);

    const populateSchoolData = useCallback(id => {
        setLoading(true);
        const paths = [`/get-by-pk/school/${id}`, `/get-address/school/${id}`, `/get-image/school/${id}`];

        API.CommonAPI.multipleAPICall("GET", paths)
            .then(responses => {
                if (responses[0]?.data?.data) {
                    responses[0].data.data.amenities = findMultipleById(responses[0].data.data?.amenities, formAmenitiesInRedux?.listData?.rows);
                    responses[0].data.data.payment_methods = findMultipleById(responses[0].data.data?.payment_methods, allPaymentMethods?.listData);
                }
                API.SchoolAPI.getSchoolClasses(id)
                    .then(res => {
                        const dataObj = {
                            schoolData: {
                                schoolData: responses[0].data.data,
                                selectedClass: res?.data
                            },
                            addressData: responses[1]?.data?.data,
                            imageData: responses[2]?.data?.data
                        };
                        setUpdatedValues(dataObj);
                        setUpdatedDisplayImage(dataObj?.imageData?.filter(img => img.type === "display"));
                        setUpdatedBannerImage(dataObj?.imageData?.filter(img => img.type === "banner"));
                        setLoading(false);
                    })
                    .catch(err => {
                        setLoading(false);
                        toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg || "Error fetching school classes", navigateTo, 0);
                    });
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg || "Error in MultipleApiCall", navigateTo, 0);
            });
    }, [formAmenitiesInRedux?.listData?.rows, allPaymentMethods?.listData?.length]);

    const createSchool = useCallback(formData => {
        let promise1;
        let promise2;
        let promise3;
        let promise4;
        setLoading(true);

        formData.schoolData.values = {
            ...formData.schoolData.values,
            school_code: createSchoolCode(formData.schoolData.values?.name),
            amenities: getIdsFromObject(formData.schoolData.values?.amenities),
            payment_methods: getIdsFromObject(formData.schoolData.values?.payment_methods)
        };

        API.SchoolAPI.createSchool({ ...formData.schoolData.values })
            .then(({ data: school }) => {
                if (school?.status === 'Success') {
                    promise1 = API.AddressAPI.createAddress({
                        ...formData.addressData.values,
                        school_id: school.data.id,
                        parent_id: school.data.id,
                        parent: 'school'
                    });

                    promise2 = formData.schoolData.values.sections.map((innerArray, classIndex) => {
                        // Get class-related data or default to 0 if not available
                        const schoolClass = formData.schoolData.values.classes[classIndex] || 0;
                        const classFee = formData.schoolData.values.classes_fee[classIndex] || 0;
                        const classCapacity = formData.schoolData.values.classes_capacity[classIndex] || 0;
                        const classLateFee = formData.schoolData.values.classes_late_fee[classIndex] || 0;
                        const classLateFeeDuration = formData.schoolData.values.classes_late_fee_duration[classIndex] || 0;

                        // Iterating through each section in the class then associating subject ids for each section of class
                        innerArray.map(async (sectionData, sectionIndex) => {
                            // Get subject array for the current section or default to empty array
                            const subjectArray = formData.schoolData.values.subjects[classIndex] ? formData.schoolData.values.subjects[classIndex][sectionIndex] : [];
                            await API.SchoolAPI.insertIntoMappingTable(
                                [school.data.id, schoolClass, sectionData.section_id,
                                getIdsFromObject(subjectArray, allSubjects?.listData), classFee, classCapacity, classLateFee,
                                    classLateFeeDuration]
                            );
                        });
                    });
                    if (formData.imageData.values?.image?.length) {
                        promise3 = Array.from(formData.imageData.values.image).map(async (image) => {
                            let formattedName = formatImageName(image.name);
                            API.ImageAPI.uploadImageToS3({
                                image: image,
                                folder: `school/${formattedName}`,
                            })
                                .then(res => {
                                    if (res.data.status === "Success") {
                                        API.ImageAPI.createImage({
                                            image_src: res.data.data,
                                            school_id: school.data.id,
                                            parent_id: school.data.id,
                                            parent: 'school',
                                            type: 'display'
                                        })
                                    }
                                })
                        });
                    }

                    if (formData.bannerImageData.values.image?.length) {
                        promise4 = Array.from(formData.bannerImageData.values.image).map(async (image) => {
                            let formattedName = formatImageName(image.name);
                            API.ImageAPI.uploadImageToS3({
                                image: image,
                                folder: `school/${formattedName}`,
                            })
                                .then(res => {
                                    if (res.data.status === "Success") {
                                        API.ImageAPI.createImage({
                                            image_src: res.data.data,
                                            school_id: school.data.id,
                                            parent_id: school.data.id,
                                            parent: 'school',
                                            type: 'banner'
                                        })
                                    }
                                })
                        });
                    }

                    return Promise.all([promise1, promise2, promise3, promise4])
                        .then(() => {
                            setLoading(false);
                            toastAndNavigate(dispatch, true, "success", "Successfully Created", navigateTo, '/school/listing', true);
                        })
                        .catch(err => {
                            setLoading(false);
                            toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
                            throw err;
                        });
                }
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
                throw err;
            });
    }, [formData]);

    useEffect(() => {
        if (!formAmenitiesInRedux?.listData?.rows?.length) {
            getPaginatedData(0, 50, setFormAmenities, API.AmenityAPI);
        }
    }, []);

    useEffect(() => {
        if (!allPaymentMethods?.listData?.length) {
            fetchAndSetAll(dispatch, setAllPaymentMethods, API.PaymentMethodAPI);
        }
    }, []);

    useEffect(() => {
        if (!allSubjects?.listData?.length) {
            fetchAndSetAll(dispatch, setAllSubjects, API.SubjectAPI);
        }
    }, []);

    useEffect(() => {
        if (!allClasses?.listData?.length) {
            fetchAndSetAll(dispatch, setAllClasses, API.ClassAPI);
        }
    }, []);

    useEffect(() => {
        if (!allSections?.listData?.length) {
            fetchAndSetAll(dispatch, setAllSections, API.SectionAPI);
        }
    }, []);

    //Create/Update/Populate School
    useEffect(() => {
        if (id && !submitted && formAmenitiesInRedux?.listData?.rows && allSubjects?.listData) {
            setTitle("Update");
            populateSchoolData(id);
        }
        if (formData.schoolData.validated && formData.addressData.validated && formData.imageData.validated && formData.bannerImageData.validated) {
            formData.schoolData.values?.id ? updateSchoolAndAddress(formData) : createSchool(formData);
        } else {
            setSubmitted(false);
        }
    }, [id, submitted, formAmenitiesInRedux?.listData?.rows, allSubjects?.listData]);


    const handleSubmit = async () => {
        await schoolFormRef.current.Submit();
        await addressFormRef.current.Submit();
        await imageFormRef.current?.Submit();
        await bannerImageFormRef.current?.Submit();
        setSubmitted(true);
    };

    const handleFormChange = (data, form) => {
        if (form === 'school') {
            setFormData({ ...formData, schoolData: data });
        } else if (form === 'address') {
            setFormData({ ...formData, addressData: data });
        } else if (form === 'display') {
            setFormData({ ...formData, imageData: data });
        } else if (form === 'banner') {
            setFormData({ ...formData, bannerImageData: data });
        }
    };

    return (
        <div 
            className="min-h-screen p-4 md:p-8 animate-in fade-in duration-500"
            style={{
                backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${formBg?.src || formBg})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundAttachment: "fixed"
            }}
        >
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                        {`${title} ${selected}`}
                    </h1>
                </div>

                <div className="space-y-6">
                    <SchoolFormComponent
                        onChange={(data) => {
                            handleFormChange(data, 'school');
                        }}
                        refId={schoolFormRef}
                        setDirty={setDirty}
                        reset={reset}
                        setReset={setReset}
                        schoolId={id}
                        allClasses={allClasses?.listData}
                        allSections={allSections?.listData}
                        subjectsInRedux={allSubjects?.listData}
                        amenities={formAmenitiesInRedux?.listData?.rows}
                        paymentMethods={allPaymentMethods?.listData}
                        updatedValues={updatedValues?.schoolData}
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

                    <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 w-full">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Display Image</h3>
                        <ImagePicker
                            key="image"
                            onChange={data => handleFormChange(data, 'display')}
                            refId={imageFormRef}
                            reset={reset}
                            setReset={setReset}
                            setDirty={setDirty}
                            preview={previewDisplay}
                            setPreview={setPreviewDisplay}
                            updatedImage={updatedDisplayImage}
                            setUpdatedImage={setUpdatedDisplayImage}
                            deletedImage={deletedImage}
                            setDeletedImage={setDeletedImage}
                            imageType="Display"
                            ENV={ENV}
                        />
                    </div>

                    <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 w-full">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Banner Images</h3>
                        <ImagePicker
                            key="banner"
                            onChange={data => handleFormChange(data, 'banner')}
                            refId={bannerImageFormRef}
                            reset={reset}
                            setReset={setReset}
                            setDirty={setDirty}
                            preview={previewBanner}
                            setPreview={setPreviewBanner}
                            updatedImage={updatedBannerImage}
                            setUpdatedImage={setUpdatedBannerImage}
                            deletedImage={deletedBannerImage}
                            setDeletedImage={setDeletedBannerImage}
                            imageType="Banner"
                            multiple={true}
                            ENV={ENV}
                            validation={false}
                        />
                    </div>
                </div>

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
                        onClick={() => navigateTo(`/${selected.toLowerCase()}/listing`)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25 dark:hover:text-rose-200 border border-rose-200/80 dark:border-rose-500/30 rounded-xl font-semibold shadow-sm shadow-rose-500/10 hover:shadow-rose-500/20 transition-all cursor-pointer active:scale-95"
                    >
                        <XIcon className="w-5 h-5" />
                        Cancel
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={handleSubmit} 
                        disabled={!dirty || submitted}
                        className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 ${
                            title === "Update" 
                            ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 hover:shadow-blue-600/40" 
                            : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 hover:shadow-emerald-600/40"
                        }`}
                    >
                        <Save className="w-5 h-5" />
                        {title === "Update" ? "Update School" : "Save School"}
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
