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
import { RotateCcw, X as XIcon, Save } from "lucide-react";

import API from "../../apis";
import AddressFormComponent from "../address/AddressFormComponent";
import ImagePicker from "../image/ImagePicker";
import Loader from "../common/Loader";
import Toast from "../common/Toast";
import TeacherFormComponent from "./TeacherFormComponent";

import { setAllSections } from "../../redux/actions/SectionAction";
import { setAllSubjects } from "../../redux/actions/SubjectAction";
import { setMenuItem } from "../../redux/actions/NavigationAction";
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

  let id = state?.id || userParams?.id;

  useEffect(() => {
    const selectedMenu = getLocalStorage("menu");
    if (selectedMenu?.selected) {
      dispatch(setMenuItem(selectedMenu.selected));
    }
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
    let updatePromises = [];
    let status = null;

    if (formData.teacherData.dirty) {
      await (async () => {
        await API.TeacherAPI.deleteFromMappingTable({ teacher_id: id });

        updatePromises = formData.teacherData.values.sections.map(
          (innerArray, classIndex) => {
            const teacherClass =
              formData.teacherData.values.classes[classIndex] || 0;
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
        await API.ImageAPI.deleteImage({
          parent: "teacher",
          parent_id: id,
        });
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
                    school_id: teacher.data.school_id,
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
    await teacherFormRef.current?.Submit?.();
    await addressFormRef.current?.Submit?.();
    await imageFormRef.current?.Submit?.();
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
        <div className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
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
        </div>

        <div className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
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
        </div>

        <div className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
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
            updatedImage={updatedImage}
            setUpdatedImage={setUpdatedImage}
            imageType="Teacher"
            ENV={ENV}
          />
        </div>

        <div className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-end gap-4 p-6 border-t border-slate-200 dark:border-slate-800">
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
              onClick={() => navigateTo(`/${selected.toLowerCase()}/listing`)}
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
              {title === "Update" ? "Update Attendance" : "Submit"}
            </button>
          </div>
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
