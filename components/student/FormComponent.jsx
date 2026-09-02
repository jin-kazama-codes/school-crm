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

import { Box, Button, Typography, useTheme } from "@mui/material";
import dayjs from "dayjs";

import API from "../../apis";
import AddressFormComponent from "../address/AddressFormComponent";
import ICardModal from "../models/ICardModal";
import ImagePicker from "../image/ImagePicker";
import Loader from "../common/Loader";
import StudentFormComponent from "./StudentFormComponent";
import Toast from "../common/Toast";

import { setAllSubjects } from "../../redux/actions/SubjectAction";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { tokens, themeSettings } from "../../theme";
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
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { typography } = themeSettings(theme.palette.mode);
    const { state } = useLocation();
    const { getLocalStorage, getIdsFromObject, generatePassword, findMultipleById, formatImageName, fetchAndSetAll,
        toastAndNavigate, generateNormalPassword, formateName } = Utility();

    //after page refresh the id in router state becomes undefined, so getting student id from url params
    let id = state?.id || userParams?.id;
    const showIdCard = !id || (id && !updatedValues?.studentData?.id_card);
    const formValidated = formData.studentData.validated && formData.addressData.validated && formData.imageData.validated && formData.parentImageData.validated;

    const schoolInformation = getLocalStorage("auth");

    // useEffect(() => {
    //     if (!state.reload) {
    //         console.log('reload', state.reload);
    //         navigateTo(`/student/update/${id}`, { state: { id: id, reload: true } });
    //         location.reload();
    //     }
    // }, []);

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        dispatch(setMenuItem(selectedMenu.selected));
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
                // setICardDetails({
                //     // ...iCardDetails,
                //     ...dataObj.studentData,
                //     ...dataObj.addressData,
                //     imageData: dataObj.studentImage 
                // });
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
                throw err;
            });
    }, [formSubjectsInRedux?.listData]);

    console.log("schol>>", schoolInformation.school_code);

    const createStudent = useCallback(async formData => {
        let promise1;
        let promise2;
        let promise3;
        setLoading(true);
        const username = await formateName(formData.studentData.values?.father_name || formData.studentData.values?.mother_name ||
            formData.studentData.values?.guardian);
        const password = await generateNormalPassword(username, schoolInformation.school_code);

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
                // ...iCardDetails,
                ...updatedValues?.studentData,
                ...updatedValues?.addressData,
                ...updatedValues?.studentImage[0]
            });
        }
    }, [updatedValues?.studentData, updatedValues?.addressData, updatedValues?.imageData]);

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

    console.log("i card cond>>", !(
        previewStudent?.length > 0
        && iCardDetails.firstname?.length > 0
        && iCardDetails.father_name?.length > 0
        && iCardDetails.lastname?.length > 0
        && iCardDetails.class > 0
        && iCardDetails.section > 0
        && iCardDetails.contact_no?.length > 0
        && iCardDetails.street?.length > 0
        && iCardDetails.landmark?.length > 0
        && iCardDetails.zipcode?.length > 0
        // && iCardDetails.studentCity?.length > 0
        // && iCardDetails.studentState?.length > 0
    ), previewStudent?.length
        , iCardDetails.firstname?.length
        , iCardDetails.father_name?.length
        , iCardDetails.lastname?.length
        , iCardDetails.class
        , iCardDetails.section
        , iCardDetails.contact_no?.length
        , iCardDetails.street?.length
        , iCardDetails.landmark?.length
        , iCardDetails.zipcode?.length
        , iCardDetails.studentCity?.length
        , iCardDetails.studentState?.length
    );

    console.log(updatedValues, "updatedvalues");

    return (
        <Box m="10px"
            sx={{
                backgroundImage: theme.palette.mode == "light" ? `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${formBg})`
                    : `linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.9)), url(${formBg})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "start",
                backgroundSize: "cover",
                backgroundAttachment: "fixed"
            }}>
            <Typography
                fontFamily={typography.fontFamily}
                fontSize={typography.h2.fontSize}
                color={colors.grey[100]}
                fontWeight="bold"
                display="inline-block"
                marginLeft="20px"
            >
                {`${title} ${selected}`}
            </Typography>
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

            <Box display="flex" justifyContent="end" m="20px" pb="20px">
                {showIdCard && <>
                    <Button color="info" variant="contained" sx={{ mr: 30 }}
                        onClick={() => setOpenDialog(!openDialog)}
                        disabled={!id &&
                            !(
                                previewStudent?.length > 0
                                && iCardDetails.firstname?.length > 0
                                && iCardDetails.father_name?.length > 0
                                && iCardDetails.lastname?.length > 0
                                && iCardDetails.class > 0
                                && iCardDetails.section > 0
                                && iCardDetails.contact_no?.length > 0
                                && iCardDetails.street?.length > 0
                                && iCardDetails.landmark?.length > 0
                                && iCardDetails.zipcode?.length > 0
                                // && iCardDetails.studentCity?.length > 0
                                // && iCardDetails.studentState?.length > 0
                            )
                        }
                    >
                        Generate ICard
                    </Button>
                    <ICardModal iCardDetails={iCardDetails} setICardDetails={setICardDetails} previewStudent={previewStudent}
                        openDialog={openDialog} setOpenDialog={setOpenDialog} />
                </>}
                {   //hide reset button on student update
                    title === "Update" ? null :
                        <Button type="reset" color="warning" variant="contained" sx={{ mr: 3 }}
                            disabled={!dirty || submitted}
                            onClick={() => {
                                if (window.confirm("Do You Really Want To Reset?")) {
                                    setReset(true);
                                }
                            }}
                        >
                            Reset
                        </Button>
                }
                <Button color="error" variant="contained" sx={{ mr: 3 }}
                    onClick={() => navigateTo(`/student/listing/${getLocalStorage('class') || ''}`)}>
                    Cancel
                </Button>
                <Button type="submit" onClick={() => handleSubmit()} disabled={!dirty}
                    color={title === "Update" ? "info" : "success"} variant="contained"
                >
                    Submit
                </Button>
                <Toast alerting={toastInfo.toastAlert}
                    severity={toastInfo.toastSeverity}
                    message={toastInfo.toastMessage}
                />
            </Box>
            {loading === true ? <Loader /> : null}
        </Box >
    );
};

export default FormComponent;
