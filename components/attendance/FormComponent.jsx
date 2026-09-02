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

import { Box, Button, Typography, useTheme } from "@mui/material";
import dayjs from "dayjs";

import API from "../../apis";
import AddressFormComponent from "../address/AddressFormComponent";
import ImagePicker from "../image/ImagePicker";
import Loader from "../common/Loader";
import Toast from "../common/Toast";
import TeacherFormComponent from "./TeacherFormComponent";

import { setAllSections } from "../../redux/actions/SectionAction";
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
    teacherData: { values: null, validated: false },
    addressData: { values: null, validated: false },
    imageData: { values: null, validated: false },
  });
  const [updatedValues, setUpdatedValues] = useState(null);
  const [updatedImage, setUpdatedImage] = useState([]);
  const [deletedImage, setDeletedImage] = useState([]);
  const [preview, setPreview] = useState([]);
  const [classData, setClassData] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reset, setReset] = useState(false);

  const allSections = useSelector((state) => state.allSections);
  const allSubjects = useSelector((state) => state.allSubjects);
  const selected = useSelector((state) => state.menuItems.selected);
  const toastInfo = useSelector((state) => state.toastInfo);

  const teacherFormRef = useRef();
  const addressFormRef = useRef();
  const imageFormRef = useRef();

  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const userParams = useParams();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { typography } = themeSettings(theme.palette.mode);
  const { state } = useLocation();
  const {
    formatImageName,
    fetchAndSetAll,
    getLocalStorage,
    getIdsFromObject,
    generatePassword,
    isObjEmpty,
    toastAndNavigate,
  } = Utility();

  //after page refresh the id in router state becomes undefined, so getting teacher id from url params
  let id = state?.id || userParams?.id;

  useEffect(() => {
    const selectedMenu = getLocalStorage("menu");
    dispatch(setMenuItem(selectedMenu.selected));
  }, []);

  const updateTeacherAndAddress = useCallback(async formData => {
    setLoading(true);
    const paths = [];
    const dataFields = [];

    const username = formData.teacherData.values?.firstname.toLowerCase() +
      (formData.teacherData.values?.lastname ? `${formData.teacherData.values?.lastname.toLowerCase()}` : "");

    try {
      if (formData.teacherData.dirty) {
        await API.UserAPI.update({
          userId: formData.teacherData.values.parent_id,
          id: formData.teacherData.values.parent_id,
          username: username,
          email: formData.teacherData.values.email,
          contact_no: formData.teacherData.values.contact_no,
          status: formData.teacherData.values.status
        });
        paths.push("/update-teacher");
        dataFields.push(formData.teacherData.values);
      }
      if (formData.addressData.dirty) {
        paths.push("/update-address");
        dataFields.push(formData.addressData.values);
      }
      const responses = await API.CommonAPI.multipleAPICall("PATCH", paths, dataFields);
      if (responses) {
        updateImageAndClassData(formData);
      }
    } catch (err) {
      setLoading(false);
      toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
      throw err;
    }
  }, [formData]);

  const updateImageAndClassData = useCallback(async (formData) => {
    // delete the selected (removed) images from Azure which are in deletedImage state
    // if (deletedImage.length) {
    //     deletedImage.forEach(image => {
    //         deleteFileFromAzure("teacher", image);
    //         console.log("Deleted normal image from azure");
    //     });
    // }
    let updatePromises = [];
    let status = null;

    if (formData.teacherData.dirty) {
      await (async () => {
        // delete all class sections from mapping table
        await API.TeacherAPI.deleteFromMappingTable({ teacher_id: id });

        updatePromises = formData.teacherData.values.sections.map(
          (innerArray, classIndex) => {
            const teacherClass =
              formData.teacherData.values.classes[classIndex] || 0;
            // Iterating through each section in the class then associating subject ids for each section of class
            innerArray.map((sectionData, sectionIndex) => {
              const subjectArray =
                formData.teacherData.values.subjects[classIndex][sectionIndex] ||
                [];
              API.TeacherAPI.insertIntoMappingTable([
                formData.teacherData.values.id,
                teacherClass,
                sectionData.section_id,
                getIdsFromObject(subjectArray, allSubjects?.listData),
              ]);
            });
          }
        );
        await Promise.all(updatePromises);
      })();
    }

    try {
      let formattedName;
        // delete all images from db on every update and later insert new and old again
        await API.ImageAPI.deleteImage({
          parent: "teacher",
          parent_id: id,
        });
        // upload new images to backend folder and insert in db
        if (formData.imageData?.values?.image) {
          Array.from(formData.imageData.values.image).map((image) => {
            formattedName = formatImageName(image.name);
            API.ImageAPI.uploadImage({ image: image, imageName: formattedName });
            API.ImageAPI.createImage({
              image_src: formattedName,
              school_id: formData.teacherData.values.id,
              parent_id: formData.teacherData.values.id,
              parent: "teacher",
              type: "normal"
            });
          });
          status = true;
        }
        // insert old images only in db & not on azure
        if (formData.imageData.values.constructor === Array) {
          formData.imageData.values.map(oldIimage => {
            API.ImageAPI.createImage({
              image_src: oldIimage.image_src,
              school_id: oldIimage.school_id,
              parent_id: oldIimage.parent_id,
              parent: oldIimage.parent,
              type: oldIimage.type,
            });
          });
          status = true;
        }
      
      if (status) {
        setLoading(false);
        toastAndNavigate(
          dispatch,
          true,
          "info",
          "Successfully Updated",
          navigateTo,
          `/teacher/listing`
        );
      }
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
  }, [formData]);

  const populateTeacherData = useCallback((id) => {
    setLoading(true);
    const paths = [
      `/get-by-pk/teacher/${id}`,
      `/get-address/teacher/${id}`,
      `/get-teacher-detail/${id}`,
      `/get-image/teacher/${id}`,
    ];

    API.CommonAPI.multipleAPICall("GET", paths)
      .then((responses) => {
        if (responses[0].data.data) {
          responses[0].data.data.dob = dayjs(responses[0].data.data.dob);
        }
        const dataObj = {
          teacherData: {
            teacherData: responses[0].data.data,
            selectedClass: responses[2]?.data?.data,
          },
          addressData: responses[1]?.data?.data,
          imageData: responses[3]?.data?.data,
        };
        setUpdatedValues(dataObj);
        setUpdatedImage(dataObj?.imageData);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg);
        throw err;
      });
  }, []);

  const createTeacher = useCallback(formData => {
    let promise1;
    let promise2;
    let promise3;
    setLoading(true);
    const username =
      formData.teacherData.values?.firstname.toLowerCase() + (formData.teacherData.values?.lastname
        ? `${formData.teacherData.values?.lastname.toLowerCase()}` : "");
    const password = generatePassword();

    API.UserAPI.register({
      username: username,
      password: password,
      email: formData.teacherData.values.email,
      contact_no: formData.teacherData.values.contact_no,
      role: 4,
      designation: "teacher",
      status: formData.teacherData.values.status
    })
      .then(({ data: user }) => {
        if (user?.status === "Success") {
          API.TeacherAPI.createTeacher({
            ...formData.teacherData.values,
            parent_id: user.data.id,
            password: password
          })
            .then(async ({ data: teacher }) => {
              promise1 = API.AddressAPI.createAddress({
                ...formData.addressData.values,
                school_id: teacher.data.school_id,
                parent_id: teacher.data.id,
                parent: "teacher"
              });

              promise2 = formData.teacherData.values.sections.map((innerArray, classIndex) => {
                const teacherClass = formData.teacherData.values.classes[classIndex] || 0;
                // Iterating through each section in the class then associating subject ids for each section of class
                innerArray.map((sectionData, sectionIndex) => {
                  const subjectArray = formData.teacherData.values.subjects[classIndex][sectionIndex] || [];
                  API.TeacherAPI.insertIntoMappingTable([
                    teacher.data.id,
                    teacherClass,
                    sectionData.section_id,
                    getIdsFromObject(subjectArray, allSubjects?.listData),
                  ]);
                });
              });

              if (formData.imageData.values.image?.length) {
                promise3 = Array.from(formData.imageData.values.image).map(async (image) => {
                  let formattedName = formatImageName(image.name);
                  API.ImageAPI.uploadImage({ image: image, imageName: formattedName });
                  API.ImageAPI.createImage({
                    image_src: formattedName,
                    school_id: school.data.school_id,
                    parent_id: teacher.data.id,
                    parent: "teacher",
                    type: "normal"
                  });
                });
              }

              try {
                await Promise.all([promise1, promise2, promise3]);
                setLoading(false);
                toastAndNavigate(dispatch, true, "success", "Successfully Created", navigateTo, `/teacher/listing`);
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
                console.log("Error in Teacher Create", err);
              }
            })
            .catch((err) => {
              setLoading(false);
              toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
              console.log("Error in teacher create", err);
            });
        }
      })
      .catch((err) => {
        setLoading(false);
        toastAndNavigate(
          dispatch,
          true,
          "error",
          err ? err?.response?.data?.msg : "An Error Occurred",
          navigateTo,
          0
        );
        console.log("Error in teacher create", err);
      });
  }, []);

  useEffect(() => {
    if (!allSections?.listData?.length) {
      fetchAndSetAll(dispatch, setAllSections, API.SectionAPI);
    }
  }, [allSections?.listData?.length]);

  useEffect(() => {
    if (!allSubjects?.listData?.length) {
      fetchAndSetAll(dispatch, setAllSubjects, API.SubjectAPI);
    }
  }, [allSubjects?.listData?.length]);

  //Create/Update/Populate teacher
  useEffect(() => {
    if (id && !submitted && allSubjects?.listData) {
      setTitle("Update");
      populateTeacherData(id);
    }
    if (formData.teacherData.validated && formData.addressData.validated) {
      formData.teacherData.values?.id
        ? updateTeacherAndAddress(formData)
        : createTeacher(formData);
    } else {
      setSubmitted(false);
    }
  }, [id, submitted, allSubjects?.listData]);

  const handleSubmit = async () => {
    await teacherFormRef.current.Submit();
    await addressFormRef.current.Submit();
    await imageFormRef.current.Submit();
    setSubmitted(true);
  };

  const handleFormChange = (data, form) => {
    if (form === "teacher") {
      setFormData({ ...formData, teacherData: data });
    } else if (form === "address") {
      setFormData({ ...formData, addressData: data });
    } else if (form === "image") {
      setFormData({ ...formData, imageData: data });
    }
  };

  return (
    <Box
      m="10px"
      sx={{
        backgroundImage:
          theme.palette.mode == "light"
            ? `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${formBg})`
            : `linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.9)), url(${formBg})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "start",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
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
      <TeacherFormComponent
        onChange={(data) => {
          handleFormChange(data, "teacher");
        }}
        refId={teacherFormRef}
        setDirty={setDirty}
        reset={reset}
        setReset={setReset}
        classData={classData}
        setClassData={setClassData}
        allSections={allSections?.listData}
        allSubjects={allSubjects?.listData}
        updatedValues={updatedValues?.teacherData}
      />
      <AddressFormComponent
        onChange={(data) => {
          handleFormChange(data, "address");
        }}
        refId={addressFormRef}
        update={id ? true : false}
        setDirty={setDirty}
        reset={reset}
        setReset={setReset}
        updatedValues={updatedValues?.addressData}
      />
      <ImagePicker
        key="image"
        onChange={(data) => {
          handleFormChange(data, "image");
        }}
        refId={imageFormRef}
        reset={reset}
        setReset={setReset}
        setDirty={setDirty}
        preview={preview}
        setPreview={setPreview}
        deletedImage={deletedImage}
        setDeletedImage={setDeletedImage}
        updatedImage={updatedImage} //these are updated Values
        setUpdatedImage={setUpdatedImage}
        imageType="Teacher"
        ENV={ENV}
      />

      <Box display="flex" justifyContent="end" m="20px">
        {
          //hide reset button on teacher update
          title === "Update" ? null : (
            <Button
              type="reset"
              color="warning"
              variant="contained"
              sx={{ mr: 3 }}
              disabled={!dirty || submitted}
              onClick={() => {
                if (window.confirm("Do You Really Want To Reset?")) {
                  setReset(true);
                }
              }}
            >
              Reset
            </Button>
          )
        }
        <Button
          color="error"
          variant="contained"
          sx={{ mr: 3 }}
          onClick={() => navigateTo(`/${selected.toLowerCase()}/listing`)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={() => handleSubmit()}
          disabled={!dirty}
          color={title === "Update" ? "info" : "success"}
          variant="contained"
        >
          Submit
        </Button>
        <Toast
          alerting={toastInfo.toastAlert}
          severity={toastInfo.toastSeverity}
          message={toastInfo.toastMessage}
        />
      </Box>
      {loading === true ? <Loader /> : null}
    </Box>
  );
};

export default FormComponent;
