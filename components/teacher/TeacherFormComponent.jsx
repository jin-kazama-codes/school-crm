/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { useFormik } from "formik";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  FormHelperText,
  Divider,
} from "@mui/material";
import { Autocomplete, Select, TextField, useMediaQuery } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";

import teacherValidation from "./Validation";

import { setSchoolClasses } from "../../redux/actions/ClassAction";
import { setSchoolSections } from "../../redux/actions/SectionAction";
import { setSchoolSubjects } from "../../redux/actions/SubjectAction";
import { Utility } from "../utility";

import config from "../config";

const initialValues = {
  firstname: "",
  lastname: "",
  email: "",
  contact_no: "",
  dob: null,
  age: "",
  nationality: "indian",
  religion: "",
  blood_group: "",
  qualification: "",
  achievements: "",
  experience: "",
  classes: [],
  sections: [],
  subjects: [[]],
  grade: "",
  is_specially_abled: false,
  is_class_teacher: false,
  class: "",
  section: "",
  caste_group: "",
  gender: "",
  status: "active",
};

const TeacherFormComponent = ({
  onChange,
  refId,
  setDirty,
  reset,
  setReset,
  classData,
  setClassData,
  allSubjects,
  allSections,
  updatedValues = null,
}) => {
  const [initialState, setInitialState] = useState(initialValues);
  const schoolClasses = useSelector((state) => state.schoolClasses);
  const schoolSections = useSelector((state) => state.schoolSections);
  const schoolSubjects = useSelector((state) => state.schoolSubjects);

  const dispatch = useDispatch();
  const checkboxLabel = { inputProps: { "aria-label": "Checkboxes" } };
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const isMobile = useMediaQuery("(max-width:480px)");
  const { fetchAndSetSchoolData, getLocalStorage, findMultipleById } =
    Utility();

  const formik = useFormik({
    initialValues: initialState,
    validationSchema: teacherValidation,
    enableReinitialize: true,
    onSubmit: () => watchForm(),
  });

  React.useImperativeHandle(refId, () => ({
    Submit: async () => {
      await formik.submitForm();
    },
  }));

  const watchForm = () => {
    if (onChange) {
      onChange({
        values: formik.values,
        validated: formik.isSubmitting
          ? Object.keys(formik.errors).length === 0
          : false,
        dirty: formik.dirty
      });
    }
  };

  const getAndSetSubjects = () => {
    const sectionSubjects = {};
    classData.forEach((obj) => {
      if (
        (formik.values.classes.includes(`${obj.class_id}`) || formik.values.classes.includes(obj.class_id)) &&
        formik.values.sections.some((sectionArray) =>
          sectionArray.some(
            (sectionObj) => sectionObj.section_id === obj.section_id
          )
        )
      ) {
        if (!sectionSubjects[obj.class_id]) {
          sectionSubjects[obj.class_id] = {};
        }
        const selectedSubjects = findMultipleById(obj.subject_ids, allSubjects);

        // subjects for the current class section
        sectionSubjects[obj.class_id][obj.section_id] = selectedSubjects;

      }
    });
    // Dispatch the sectionSubjects to redux
    dispatch(setSchoolSubjects(sectionSubjects));
  };

  const getAndSetSections = () => {
    const selectedSectionsSet = new Set();
    for (const obj of classData) {
      if (
        (formik.values.classes.length &&
          formik.values.classes.includes(
            initialState?.sections?.length ? `${obj.class_id}` : obj.class_id
          )) ||
        (!formik.values.classes.length && obj.class_id === formik.values.class)
      ) {
        selectedSectionsSet.add({
          section_id: obj.section_id,
          section_name: obj.section_name,
        });
      }
    }
    const selectedSectionsArray = Array.from(selectedSectionsSet);
    const filteredSections = allSections.filter((section) =>
      selectedSectionsArray.some(
        (selectedSection) => selectedSection.section_id === section.section_id
      )
    );
    dispatch(setSchoolSections(filteredSections));
  };

  useEffect(() => {
    if (
      formik.values.sections.some((innerArray) => innerArray.length > 0) &&
      classData.length
    ) {
      getAndSetSubjects();
    }
  }, [formik.values?.sections, classData.length]);

  useEffect(() => {
    if ((formik.values?.classes || formik.values?.class) && classData.length) {
      getAndSetSections();
    }
  }, [formik.values?.classes, formik.values?.class, classData.length]);

  useEffect(() => {
    if (
      getLocalStorage("schoolInfo") &&
      (!schoolSubjects?.listData?.length ||
        !schoolClasses?.listData?.length ||
        !schoolSections?.listData?.length)
    ) {
      fetchAndSetSchoolData(
        dispatch,
        setSchoolClasses,
        setSchoolSections,
        setClassData
      );
    }
  }, [classData.length]);

  useEffect(() => {
    if (reset) {
      formik.resetForm();
      setReset(false);
    }
  }, [reset]);

  useEffect(() => {
    if (formik.dirty) {
      setDirty(true);
    }
  }, [formik.dirty]);

  useEffect(() => {
    if (updatedValues) {
      const splittedArray = updatedValues.selectedClass.reduce((acc, obj) => {
        const key = obj.class_id;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
      }, {});

      // Check if splittedArray is not empty and has keys
      const hasData = splittedArray && Object.keys(splittedArray).length > 0;

      const assignUpdatedSections = (sectionData) => {
        let filteredSectionArray = [];
        sectionData.map((sections) => {

          // Filter out sections from allSections that have matching ids in the current section
          let filteredSection = allSections?.filter((obj) =>
            sections.some((sect) => sect.section_id === obj.section_id)
          );
          filteredSectionArray.push(filteredSection);
        });

        return filteredSectionArray;
      };

      const assignUpdatedSubjects = (splittedArray) => {
        const subArr = [[]];
        Object.keys(splittedArray).map((field, index) => {
          Object.values(splittedArray)[index].map((section, sectionIndex) => {
            const value = findMultipleById(section.subject_ids, allSubjects);
            if (index > 0 && sectionIndex === 0) {
              subArr[index] = [];
            }
            subArr[index][sectionIndex] = value;
          });
        });
        return subArr;
      };

      setInitialState({
        ...initialState,
        ...updatedValues.teacherData,
        classes: hasData ? Object.keys(splittedArray) : [],
        sections: hasData
          ? assignUpdatedSections(Object.values(splittedArray))
          : [],
        subjects: hasData ? assignUpdatedSubjects(splittedArray) : [[]],
      });
    }
  }, [updatedValues]);

  return (
    <Box m="20px">
      <form ref={refId}>
        <Box
          display="grid"
          gap="30px"
          gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          gridColumn="span 4"
          position="relative"
          className="box-shadow"
          sx={{
            "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
            marginBottom: "40px",
          }}
        >
          <TextField
            fullWidth
            variant="filled"
            type="text"
            name="firstname"
            label="Firstname*"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.firstname}
            error={!!formik.touched.firstname && !!formik.errors.firstname}
            helperText={formik.touched.firstname && formik.errors.firstname}
          />
          <TextField
            fullWidth
            variant="filled"
            type="text"
            name="lastname"
            label="Lastname*"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.lastname}
            error={!!formik.touched.lastname && !!formik.errors.lastname}
            helperText={formik.touched.lastname && formik.errors.lastname}
          />
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Email*"
            name="email"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.email}
            error={!!formik.touched.email && !!formik.errors.email}
            helperText={formik.touched.email && formik.errors.email}
            sx={{ gridColumn: "span 2" }}
          />
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Contact Number*"
            name="contact_no"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.contact_no}
            error={!!formik.touched.contact_no && !!formik.errors.contact_no}
            helperText={formik.touched.contact_no && formik.errors.contact_no}
          />

          <FormControl
            variant="filled"
            sx={{ minWidth: 120 }}
            error={!!formik.touched.nationality && !!formik.errors.nationality}
          >
            <InputLabel>Nationality</InputLabel>
            <Select
              variant="filled"
              name="nationality"
              value={formik.values.nationality}
              onChange={formik.handleChange}
            >
              {Object.keys(config.nationality).map((casteGroup) => (
                <MenuItem key={casteGroup} value={casteGroup}>
                  {config.nationality[casteGroup]}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formik.touched.nationality && formik.errors.nationality}
            </FormHelperText>
          </FormControl>

          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Religion"
            name="religion"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.religion}
            error={!!formik.touched.religion && !!formik.errors.religion}
            helperText={formik.touched.religion && formik.errors.religion}
          />
          <FormControl
            variant="filled"
            sx={{ minWidth: 120 }}
            error={!!formik.touched.blood_group && !!formik.errors.blood_group}
          >
            <InputLabel>Blood Group</InputLabel>
            <Select
              variant="filled"
              name="blood_group"
              value={formik.values.blood_group}
              onChange={formik.handleChange}
            >
              {Object.keys(config.bloodGroups).map((bloodGroup) => (
                <MenuItem key={bloodGroup} value={bloodGroup}>
                  {config.bloodGroups[bloodGroup]}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formik.touched.blood_group && formik.errors.blood_group}
            </FormHelperText>
          </FormControl>

          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Qualification"
            name="qualification"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.qualification}
            error={
              !!formik.touched.qualification && !!formik.errors.qualification
            }
            helperText={
              formik.touched.qualification && formik.errors.qualification
            }
          />
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Achievements"
            name="achievements"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.achievements}
            error={
              !!formik.touched.achievements && !!formik.errors.achievements
            }
            helperText={
              formik.touched.achievements && formik.errors.achievements
            }
          />
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Experience"
            name="experience"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.experience}
            error={!!formik.touched.experience && !!formik.errors.experience}
            helperText={formik.touched.experience && formik.errors.experience}
          />
          <FormControl
            variant="filled"
            sx={{ minWidth: 120 }}
            error={!!formik.touched.grade && !!formik.errors.grade}
          >
            <InputLabel>Grade</InputLabel>
            <Select
              variant="filled"
              name="grade"
              value={formik.values.grade}
              onChange={formik.handleChange}
            >
              {Object.keys(config.grade).map((grade) => (
                <MenuItem key={grade} value={grade}>
                  {config.grade[grade]}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formik.touched.grade && formik.errors.grade}
            </FormHelperText>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              format="DD MMMM YYYY" //ex - 25 July 2023
              views={["day", "month", "year"]}
              label="Date Of Birth"
              name="dob"
              required
              value={formik.values.dob}
              onChange={(newDob) => formik.setFieldValue("dob", newDob)}
            />
          </LocalizationProvider>
          <FormControlLabel
            label="Is Specially Abled"
            sx={{ gridColumn: isMobile ? "span 2" : "" }}
            control={
              <Checkbox
                {...checkboxLabel}
                color="default"
                checked={formik.values.is_specially_abled ? true : false}
                name="is_specially_abled"
                onChange={(event, value) =>
                  formik.setFieldValue("is_specially_abled", value)
                }
                value={formik.values.is_specially_abled}
              />
            }
          />
          <FormControlLabel
            label="Is Class Teacher"
            sx={{ gridColumn: isMobile ? "span 2" : "" }}
            control={
              <Checkbox
                {...checkboxLabel}
                color="default"
                checked={formik.values.is_class_teacher ? true : false}
                name="is_class_teacher"
                onChange={(event, value) =>
                  formik.setFieldValue("is_class_teacher", value)
                }
                value={formik.values.is_class_teacher}
              />
            }
          />
          {formik.values.is_class_teacher && (
            <>
              <FormControl
                variant="filled"
                sx={{ minWidth: 120 }}
                error={!!formik.touched.class && !!formik.errors.class}
              >
                <InputLabel id="classField">Class</InputLabel>
                <Select
                  variant="filled"
                  labelId="classField"
                  name="class"
                  value={formik.values.class}
                  onChange={(event) => {
                    formik.setFieldValue("class", event.target.value);
                    if (formik.values.section) {
                      //if old values are there, clean them according to change
                      formik.setFieldValue("section", "");
                    }
                  }}
                >
                  {!schoolClasses?.listData?.length
                    ? null
                    : schoolClasses.listData.map((cls) => (
                      <MenuItem
                        value={cls.class_id}
                        name={cls.class_name}
                        key={cls.class_name}
                      >
                        {cls.class_name}
                      </MenuItem>
                    ))}
                </Select>
                <FormHelperText>
                  {formik.touched.class && formik.errors.class}
                </FormHelperText>
              </FormControl>
              <FormControl
                variant="filled"
                sx={{ minWidth: 120 }}
                error={!!formik.touched.section && !!formik.errors.section}
              >
                <InputLabel id="sectionField">Section</InputLabel>
                <Select
                  variant="filled"
                  labelId="sectionField"
                  name="section"
                  value={formik.values.section}
                  onChange={(event) =>
                    formik.setFieldValue("section", event.target.value)
                  }
                >
                  {!schoolSections?.listData?.length
                    ? null
                    : schoolSections.listData.map((section) => (
                      <MenuItem
                        value={section.section_id}
                        name={section.section_name}
                        key={section.section_id}
                      >
                        {section.section_name}
                      </MenuItem>
                    ))}
                </Select>
                <FormHelperText>
                  {formik.touched.section && formik.errors.section}
                </FormHelperText>
              </FormControl>
            </>
          )}

          <FormControl
            variant="filled"
            sx={{ minWidth: 120 }}
            error={!!formik.touched.nationality && !!formik.errors.nationality}
          >
            <InputLabel>Caste Group</InputLabel>
            <Select
              variant="filled"
              name="caste_group"
              value={formik.values.caste_group}
              onChange={formik.handleChange}
            >
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="obc">OBC</MenuItem>
              <MenuItem value="sc">SC</MenuItem>
              <MenuItem value="st">ST</MenuItem>
            </Select>
            <FormHelperText>
              {formik.touched.caste_group && formik.errors.caste_group}
            </FormHelperText>
          </FormControl>
          <FormControl
            variant="filled"
            sx={{ minWidth: 120 }}
            error={!!formik.touched.gender && !!formik.errors.gender}
          >
            <InputLabel>Gender</InputLabel>
            <Select
              variant="filled"
              name="gender"
              value={formik.values.gender}
              onChange={formik.handleChange}
            >
              {Object.keys(config.gender).map((item) => (
                <MenuItem key={item} value={item}>
                  {config.gender[item]}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formik.touched.gender && formik.errors.gender}
            </FormHelperText>
          </FormControl>
          <FormControl
            variant="filled"
            sx={{ minWidth: 120 }}
            error={!!formik.touched.status && !!formik.errors.status}
          >
            <InputLabel>Status</InputLabel>
            <Select
              variant="filled"
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
            >
              {Object.keys(config.status).map((item) => (
                <MenuItem key={item} value={item}>
                  {config.status[item]}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formik.touched.status && formik.errors.status}
            </FormHelperText>
          </FormControl>
        </Box>

        <Box
          border="2px solid #BADFE7"
          borderRadius="12px"
          display="grid"
          gap="30px"
          gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          padding="10px"
          marginBottom="40px"
        >
          {formik.values.classes.map((field, index) => {
            let key = index + 1;
            return (
              <React.Fragment key={key}>
                <FormControl
                  variant="filled"
                  sx={{ minWidth: 120 }}
                  error={!!formik.touched.classes && !!formik.errors.classes}
                >
                  <InputLabel id={`classesField_${key}`}>Class</InputLabel>
                  <Select
                    variant="filled"
                    labelId={`classesField_${key}`}
                    name={`classes.${key}`}
                    value={formik.values.classes[index]}
                    onChange={(event, value) => {
                      const subArr = [...formik.values.classes];
                      subArr[index] = value.props.value;
                      formik.setFieldValue("classes", subArr);
                      if (!updatedValues) {
                        if (formik.values.sections) {
                          //if old values are there, clean them according to change
                          formik.setFieldValue("sections", []);
                        }
                        if (formik.values.subjects) {
                          formik.setFieldValue("subjects", [[]]);
                        }
                      }
                    }}
                  >
                    {!schoolClasses?.listData?.length
                      ? null
                      : schoolClasses.listData.map((cls) => (
                        <MenuItem
                          value={cls.class_id}
                          name={cls.class_name}
                          key={cls.class_id}
                        >
                          {cls.class_name}
                        </MenuItem>
                      ))}
                  </Select>
                  <FormHelperText>
                    {formik.touched.classes && formik.errors.classes}
                  </FormHelperText>
                </FormControl>

                <Autocomplete
                  multiple
                  options={schoolSections?.listData || []}
                  getOptionLabel={(option) => option.section_name}
                  disableCloseOnSelect
                  value={formik.values.sections[index] || []}
                  onChange={(event, value) => {
                    const sectArr = [...formik.values.sections];
                    sectArr[index] = value;
                    formik.setFieldValue("sections", sectArr);
                  }}
                  sx={{ gridColumn: "span 2" }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="filled"
                      type="text"
                      name={`sections.${key}`}
                      label="Section"
                      error={
                        !!formik.touched.sections && !!formik.errors.sections
                      }
                      helperText={
                        formik.touched.sections && formik.errors.sections
                      }
                    />
                  )}
                />
                {formik?.values?.sections[index]?.map(
                  (section, sectionIndex) => (
                    <Autocomplete
                      multiple
                      key={key + sectionIndex}
                      options={
                        schoolSubjects?.listData?.[
                        formik.values.classes[index]
                        ]?.[section.section_id] || []
                      }
                      getOptionLabel={(option) => option.name}
                      disableCloseOnSelect
                      value={
                        formik.values.subjects[index]
                          ? formik.values.subjects[index][sectionIndex] || []
                          : []
                      }
                      onChange={(event, value) => {
                        const subArr = [...formik.values.subjects];
                        if (index > 0 && sectionIndex === 0) {
                          subArr[index] = [];
                        }
                        subArr[index][sectionIndex] = value;
                        formik.setFieldValue("subjects", subArr);
                      }}
                      sx={{ gridColumn: "span 2" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="filled"
                          type="text"
                          name={`subjects.${index}.${sectionIndex}`}
                          label={`Subjects For Section ${section.section_name}`}
                          error={
                            !!formik.touched.subjects &&
                            !!formik.errors.subjects
                          }
                          helperText={
                            formik.touched.subjects && formik.errors.subjects
                          }
                        />
                      )}
                    />
                  )
                )}
                <Divider sx={{ borderBottomWidth: 0, gridColumn: "span 4" }} />
              </React.Fragment>
            );
          })}

          <React.Fragment key={formik.values.classes.length + 1}>
            <FormControl
              variant="filled"
              sx={{ minWidth: 120 }}
              error={!!formik.touched.classes && !!formik.errors.classes}
            >
              <InputLabel
                id={`classesField_${formik.values.classes.length + 1}`}
              >
                Class
              </InputLabel>
              <Select
                variant="filled"
                labelId={`classesField_${formik.values.classes.length + 1}`}
                name={`classes${formik.values.classes.length + 1}`}
                value={[]}
                onChange={(event, value) => {
                  const subArr = [...formik.values.classes];
                  subArr[formik.values.classes.length] = value.props.value;
                  formik.setFieldValue("classes", subArr);
                }}
              >
                {!schoolClasses?.listData?.length
                  ? null
                  : schoolClasses?.listData
                    .filter(
                      (cls) => !formik.values.classes.includes(cls.class_id)
                    ) // Exclude the selected class
                    .map((cls) => (
                      <MenuItem
                        value={cls.class_id}
                        name={cls.class_name}
                        key={cls.class_id}
                      >
                        {cls.class_name}
                      </MenuItem>
                    ))}
              </Select>
              <FormHelperText>
                {formik.touched.classes && formik.errors.classes}
              </FormHelperText>
            </FormControl>

            <Autocomplete
              multiple
              options={schoolSections?.listData || []}
              getOptionLabel={(option) => option.section_name}
              disableCloseOnSelect
              value={[]}
              onChange={(event, value) => {
                const sectArr = [...formik.values.sections];
                sectArr[formik.values.classes.length] = value;
                formik.setFieldValue("sections", sectArr);
              }}
              sx={{ gridColumn: "span 2" }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="filled"
                  type="text"
                  name={`sections${formik.values.classes.length + 1}`}
                  label="Section"
                />
              )}
            />
          </React.Fragment>
        </Box>
      </form>
    </Box>
  );
};

TeacherFormComponent.propTypes = {
  onChange: PropTypes.func,
  refId: PropTypes.shape({
    current: PropTypes.any,
  }),
  setDirty: PropTypes.func,
  reset: PropTypes.bool,
  setReset: PropTypes.func,
  classData: PropTypes.array,
  setClassData: PropTypes.func,
  allSubjects: PropTypes.array,
  allSections: PropTypes.array,
  updatedValues: PropTypes.object,
};

export default TeacherFormComponent;
