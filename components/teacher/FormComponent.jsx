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
import { RotateCcw, Save, ArrowLeft, UserCheck } from "lucide-react";

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
    generateNormalPassword,
    toastAndNavigate,
    formateName
  } = Utility();

  // after page refresh the id in router state becomes undefined, so getting teacher id from url params
  let id = state?.id || userParams?.id;

  const schoolInformation = getLocalStorage("auth");

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

    const username = await formateName(
      formData.teacherData.values?.firstname.toLowerCase() +
      (formData.teacherData.values?.lastname ? `${formData.teacherData.values?.lastname.toLowerCase()}` : "")
    );

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
      await API.CommonAPI.multipleAPICall("PATCH", paths, dataFields);
      updateImageAndClassData(formData);
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
        // delete all class sections from mapping table
        await API.TeacherAPI.deleteFromMappingTable({ teacher_id: id });

        updatePromises = formData.teacherData.values.sections.map(
          (innerArray, classIndex) => {
            const teacherClass =
              formData.teacherData.values.classes[classIndex] || 0;
            // Iterating through each section in the class then associating subject ids for each section of class
            innerArray.map((sectionData, sectionIndex) => {
              const subjectArray = formData.teacherData.values.subjects[classIndex] ? formData.teacherData.values.subjects[classIndex][sectionIndex] : [];
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
        await Promise.all(
          Array.from(formData.imageData.values.image).map(async (image) => {
            const formattedName = formatImageName(image.name);
            const res = await API.ImageAPI.uploadImageToSupabase({
              image: image,
              folder: `teacher/${formattedName}`,
            });
            if (res?.data?.status === "Success" || res?.data?.data) {
              await API.ImageAPI.createImage({
                image_src: res.data.data,
                school_id: formData.teacherData.values.id,
                parent_id: formData.teacherData.values.id,
                parent: "teacher",
                type: "normal"
              });
            }
          })
        );
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

  const createTeacher = useCallback(async formData => {
    let promise1;
    let promise2;
    let promise3;
    setLoading(true);
    const username =
      formData.teacherData.values?.firstname.toLowerCase() + (formData.teacherData.values?.lastname
        ? `${formData.teacherData.values?.lastname.toLowerCase()}` : "");
    const password = await generateNormalPassword(username, schoolInformation.school_code);

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
          API.AddressAPI.createAddress({
            ...formData.addressData.values,
            school_id: user.data.school_id,
            parent_id: user.data.id,
            parent: 'user'
          });

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
                  const subjectArray = formData.teacherData.values.subjects[classIndex] ? formData.teacherData.values.subjects[classIndex][sectionIndex] : [];
                  API.TeacherAPI.insertIntoMappingTable([
                    teacher.data.id,
                    teacherClass,
                    sectionData.section_id,
                    getIdsFromObject(subjectArray, allSubjects?.listData),
                  ]);
                });
              });

              if (formData.imageData.values.image?.length) {
                promise3 = Promise.all(
                  Array.from(formData.imageData.values.image).map(async (image) => {
                    const formattedName = formatImageName(image.name);
                    const res = await API.ImageAPI.uploadImageToSupabase({
                      image: image,
                      folder: `teacher/${formattedName}`,
                    });
                    if (res?.data?.status === "Success" || res?.data?.data) {
                      await API.ImageAPI.createImage({
                        image_src: res.data.data,
                        school_id: teacher.data.school_id,
                        parent_id: teacher.data.id,
                        parent: "teacher",
                        type: "normal"
                      });
                    }
                  })
                );
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

  // Create/Update/Populate teacher
  useEffect(() => {
    if (id && !submitted && allSubjects?.listData) {
      setTitle("Update");
      populateTeacherData(id);
    }
    if (formData.teacherData.validated && formData.addressData.validated && formData.imageData.validated) {
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
    await imageFormRef.current?.Submit();
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
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                {`${title} ${selected || "Teacher"}`}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {title === "Update" 
                  ? "Modify teacher records, qualifications, class allocations, and media assets" 
                  : "Register a new teacher profile with qualifications, teaching allocations, and media"}
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => navigateTo(`/${(selected || "teacher").toLowerCase()}/listing`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#252525] rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to List
          </button>
        </div>

        {/* Form Main Body */}
        <div className="p-6 space-y-6">
            
            {/* Teacher Details Form */}
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

            {/* Address Form Container */}
            <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
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

            {/* Teacher Photo Card */}
            <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-[#222]">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Teacher Photo
                </h3>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  Faculty profile & ID verification image
                </span>
              </div>
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
                validation={true}
              />
            </div>

          </div>

          {/* Action Footer */}
          <div className="px-6 py-4 border-t border-slate-200/80 dark:border-[#222] bg-white/80 dark:bg-[#101010]/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
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
                onClick={() => navigateTo(`/${(selected || "teacher").toLowerCase()}/listing`)}
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
                {title === "Update" ? "Update Teacher" : "Save Teacher"}
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
