/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { useFormik } from "formik";
import {
  Box,
  InputLabel,
  MenuItem,
  FormHelperText,
  FormControl,
  FormControlLabel,
  Autocomplete,
  Typography,
  useTheme
} from "@mui/material";
import { Checkbox, Select, TextField, useMediaQuery } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";

import API from "../../apis";
import Toast from "../common/Toast";
import studentValidation from "./Validation";

import { setSchoolClasses } from "../../redux/actions/ClassAction";
import { setSchoolSections } from "../../redux/actions/SectionAction";
import { setSchoolSubjects } from "../../redux/actions/SubjectAction";
import { setBuses } from "../../redux/actions/BusAction";
import { setListingSchoolHouses } from "../../redux/actions/SchoolHouseAction";

import { Utility } from "../utility";
import { useCommon } from "../hooks/common";

import config from "../config";

const initialValues = {
  session: "",
  firstname: "",
  lastname: "",
  mother_name: "",
  mother_contact_no: "",
  mother_aadhar: "",
  father_name: "",
  father_contact_no: "",
  father_aadhar: "",
  guardian_name: "",
  guardian_contact_no: "",
  guardian_aadhar: "",
  house:"",
  contact_no: "",
  email: "",
  class: "",
  section: "",
  subjects: [],
  dob: null,
  admission_date: null,
  admission_type: "regular",
  is_specially_abled: false,
  is_taking_bus: false,
  bus: "",
  blood_group: "",
  birth_mark: "",
  religion: "",
  nationality: "indian",
  age: "",
  aadhaar_no: "",
  caste_group: "",
  gender: "",
  head: 0,
  status: "active",
  is_fee_waiver: false,
  fee_waiver_type: "",
  waived_fees: "",
};

const StudentFormComponent = ({
  onChange,
  refId,
  setDirty,
  reset,
  setReset,
  classData,
  iCardDetails,
  setICardDetails,
  setClassData,
  allSubjects,
  userId,
  updatedValues = null,
}) => {
  const [initialState, setInitialState] = useState(initialValues);
  const schoolClasses = useSelector((state) => state.schoolClasses);
  const schoolSections = useSelector((state) => state.schoolSections);
  const schoolSubjects = useSelector((state) => state.schoolSubjects);
  const toastInfo = useSelector((state) => state.toastInfo);
  const allBuses = useSelector((state) => state.allBuses);
  const listingSchoolHouses = useSelector((state) => state.listingSchoolHouses);

  const dispatch = useDispatch();
  const genderRef = useRef();
  const theme = useTheme()
  const checkboxLabel = { inputProps: { "aria-label": "Checkboxes" } };
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const isMobile = useMediaQuery("(max-width:480px)");
  const { getPaginatedData } = useCommon();
  const {
    createSession,
    fetchAndSetSchoolData,
    getLocalStorage,
    getValuesFromArray,
    toastAndNavigate,
  } = Utility();

  const formik = useFormik({
    initialValues: initialState,
    validationSchema: studentValidation,
    enableReinitialize: true,
    validateOnBlur: true, // Set to true to trigger validation on blur or on change
    validateOnChange: true,
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

  const validateHead = () => {
    const condition = { gender: formik.values.gender };
    API.StudentAPI.getAll(condition)
      .then((res) => {
        if (res.status === "Success") {
          toastAndNavigate(
            dispatch,
            true,
            "warning",
            `Can not appoint Head ${formik.values.gender}`
          );
        }
      })
      .catch((err) => {
        console.error("An error occurred in validate head function: ", err);
      });
  };

  const getAndSetSubjects = () => {
    const sectionSubjects = classData?.filter(
      (obj) =>
        obj.class_id === formik.values.class &&
        obj.section_id === formik.values?.section
    );
    const selectedSubjects = sectionSubjects
      ? getValuesFromArray(sectionSubjects[0]?.subject_ids, allSubjects)
      : [];
    dispatch(setSchoolSubjects(selectedSubjects));
  };

  const getAndSetSections = () => {
    const classSections =
      classData?.filter((obj) => obj.class_id === formik.values.class) || [];
    const selectedSections = classSections.map(
      ({ section_id, section_name }) => ({ section_id, section_name })
    );
    dispatch(setSchoolSections(selectedSections));
  };

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
      setInitialState(updatedValues);
    }
  }, [updatedValues]);

  useEffect(() => {
    if (!allBuses?.listData?.rows?.length) {
      getPaginatedData(0, 40, setBuses, API.BusAPI);
    }
  }, []);

  useEffect(() => {
    if (!listingSchoolHouses?.listData?.rows?.length) {
      getPaginatedData(0, 40, setListingSchoolHouses, API.SchoolHouseAPI);
    }
  }, []);

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
  }, []);

  useEffect(() => {
    if (formik.values) {
      setICardDetails({
        ...iCardDetails,
        ...formik.values,
      });
    }
  }, [formik.values]);

  useEffect(() => {
    const selectedClassId = parseInt(getLocalStorage("class"));
    if (selectedClassId) {
      formik.setFieldValue("class", selectedClassId);
    }
  }, [getLocalStorage("class")]);

  useEffect(() => {
    if (formik.values.section) {
      getAndSetSubjects();
    }
  }, [formik.values?.section]);

  useEffect(() => {
    if (formik.values.class) {
      getAndSetSections();
    }
  }, [formik.values?.class, classData?.length]);

  return (
    <Box m="20px">
      <form ref={refId}>
        <Box
          display="grid"
          gap="30px"
          gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          sx={{
            "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
          }}
        >
          <FormControl
            variant="filled"
            sx={{ minWidth: 120 }}
            error={!!formik.touched.session && !!formik.errors.session}
          >
            <InputLabel>Session*</InputLabel>
            <Select
              variant="filled"
              name="session"
              value={formik.values.session}
              onChange={(event) =>
                formik.setFieldValue("session", event.target.value)
              }
            >
              {createSession().map((session) => (
                <MenuItem value={session} name={session} key={session}>
                  {session}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formik.touched.session && formik.errors.session}
            </FormHelperText>
          </FormControl>
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
            label="Contact Number*"
            name="contact_no"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.contact_no}
            error={!!formik.touched.contact_no && !!formik.errors.contact_no}
            helperText={formik.touched.contact_no && formik.errors.contact_no}
          />
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Email"
            name="email"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.email}
            error={!!formik.touched.email && !!formik.errors.email}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            fullWidth
            variant="filled"
            type="text"
            name="aadhaar_no"
            label="Aadhaar Number*"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.aadhaar_no}
            error={!!formik.touched.aadhaar_no && !!formik.errors.aadhaar_no}
            helperText={formik.touched.aadhaar_no && formik.errors.aadhaar_no}
          />
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
          <FormControl
            variant="filled"
            sx={{ minWidth: 120 }}
            error={!!formik.touched.gender && !!formik.errors.gender}
          >
            <InputLabel>Gender</InputLabel>
            <Select
              ref={genderRef} //head ka issue hai
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
          {userId && (
            <FormControl
              variant="filled"
              sx={{ minWidth: 120 }}
              error={!!formik.touched.head && !!formik.errors.head}
            >
              <InputLabel>
                {updatedValues?.gender === "male"
                  ? "Head Boy"
                  : updatedValues?.gender === "female"
                    ? "Head Girl"
                    : "Select Head of School"}
              </InputLabel>
              <Select
                variant="filled"
                name="head"
                value={formik.values.head}
                onChange={(event) => {
                  if (formik.values.gender) {
                    formik.setFieldValue("head", event.target.value);
                    if (event.target.value == 1) {
                      validateHead();
                    }
                  } else {
                    toastAndNavigate(
                      dispatch,
                      true,
                      "info",
                      "Please Select Gender"
                    );
                  }
                }}
              >
                {Object.keys(config.head).map((item) => (
                  <MenuItem key={item} value={item}>
                    {config.head[item]}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {formik.touched.head && formik.errors.head}
              </FormHelperText>
            </FormControl>
          )}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              format="DD MMMM YYYY" //ex - 25 July 2023
              views={["day", "month", "year"]}
              label="Select Date Of Birth*"
              name="dob"
              value={formik.values.dob}
              onChange={(newDob) => formik.setFieldValue("dob", newDob)}
              onBlur={() => formik.setFieldTouched('dob', true)}
              renderInput={(params) => (
                <>
                  <TextField
                    {...params}
                    error={formik.touched.dob && Boolean(formik.errors.dob)}
                    helperText={formik.touched.dob && formik.errors.dob}
                    fullWidth
                    margin="normal"
                  />
                  <FormHelperText>
                    {formik.touched.dob && formik.errors.dob}
                  </FormHelperText>
                </>

              )}
            />

            <DatePicker
              format="DD MMMM YYYY"
              views={["day", "month", "year"]}
              label="Select Admission Date*"
              name="admission_date"
              value={formik.values.admission_date}
              onChange={(new_admission_date) =>
                formik.setFieldValue("admission_date", new_admission_date)
              }
              onBlur={() => formik.setFieldTouched('admission_date', true)}
              renderInput={(params) => (
                <>
                  <TextField
                    {...params}
                    error={
                      formik.touched.admission_date && Boolean(formik.errors.admission_date)
                    }
                    helperText={formik.touched.admission_date && formik.errors.admission_date}
                    fullWidth
                    margin="normal"
                  />
                  <FormHelperText>
                    {formik.touched.admission_date && formik.errors.admission_date}
                  </FormHelperText>
                </>
              )}

            />
          </LocalizationProvider>
          <FormControl
            variant="filled"
            sx={{ minWidth: 120 }}
            error={
              !!formik.touched.admission_type && !!formik.errors.admission_type
            }
          >
            <InputLabel>Admission Type*</InputLabel>
            <Select
              variant="filled"
              name="admission_type"
              value={formik.values.admission_type}
              onChange={formik.handleChange}
            >
              {Object.keys(config.admission_type).map((item) => (
                <MenuItem key={item} value={item}>
                  {config.admission_type[item]}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formik.touched.admission_type && formik.errors.admission_type}
            </FormHelperText>
          </FormControl>
          <FormControl
            variant="filled"
            sx={{ minWidth: 120 }}
            error={!!formik.touched.class && !!formik.errors.class}
          >
            <InputLabel>Class*</InputLabel>
            <Select
              variant="filled"
              name="class"
              value={formik.values.class}
              onChange={(event) => {
                formik.setFieldValue("class", event.target.value);
                if (formik.values.section) {
                  //if old values are there, clean them according to change
                  formik.setFieldValue("section", "");
                }
                if (formik.values.subjects) {
                  formik.setFieldValue("subjects", []);
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
              {formik.touched.class && formik.errors.class}
            </FormHelperText>
          </FormControl>
          <FormControl
            variant="filled"
            sx={{ minWidth: 120 }}
            error={!!formik.touched.section && !!formik.errors.section}
          >
            <InputLabel>Section*</InputLabel>
            <Select
              variant="filled"
              name="section"
              value={formik.values.section}
              onChange={(event) => {
                formik.setFieldValue("section", event.target.value);
                if (formik.values.subjects) {
                  formik.setFieldValue("subjects", []);
                }
              }}
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
          <Autocomplete
            multiple
            options={schoolSubjects?.listData || []}
            getOptionLabel={(option) => option.name}
            disableCloseOnSelect
            value={formik.values.subjects}
            onBlur={formik.handleBlur}
            onChange={(event, value) => formik.setFieldValue("subjects", value)}
            sx={{ gridColumn: "span 2" }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="filled"
                type="text"
                name="subjects"
                label="Subjects*"
                onBlur={formik.handleBlur}
                error={!!formik.touched.subjects && !!formik.errors.subjects}
                helperText={formik.touched.subjects && formik.errors.subjects}
              />
            )}
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
              <MenuItem value="A+">A+</MenuItem>
              <MenuItem value="A-">A-</MenuItem>
              <MenuItem value="B+">B+</MenuItem>
              <MenuItem value="B-">B-</MenuItem>
              <MenuItem value="AB+">AB+</MenuItem>
              <MenuItem value="AB-">AB-</MenuItem>
              <MenuItem value="O+">O+</MenuItem>
              <MenuItem value="O-">O-</MenuItem>
            </Select>
            <FormHelperText>
              {formik.touched.blood_group && formik.errors.blood_group}
            </FormHelperText>
          </FormControl>
          <TextField
            fullWidth
            variant="filled"
            type="text"
            name="birth_mark"
            label="Birth Mark"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.birth_mark}
            error={!!formik.touched.birth_mark && !!formik.errors.birth_mark}
            helperText={formik.touched.birth_mark && formik.errors.birth_mark}
          />
          <TextField
            fullWidth
            variant="filled"
            type="text"
            name="religion"
            label="Religion"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.religion}
            error={!!formik.touched.religion && !!formik.errors.religion}
            helperText={formik.touched.religion && formik.errors.religion}
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
              <MenuItem value="indian">Indian</MenuItem>
              <MenuItem value="nri">NRI</MenuItem>
            </Select>
            <FormHelperText>
              {formik.touched.nationality && formik.errors.nationality}
            </FormHelperText>
          </FormControl>
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

          <FormControl variant="filled" sx={{ minWidth: 120 }}
            error={!!formik.touched.house && !!formik.errors.house}
          >
            <InputLabel id="houseField">Student house</InputLabel>
            <Select
              labelId="houseField"
              name="house"
              value={formik.values.house || ''}
              onChange={event => formik.setFieldValue("house", event.target.value)}
            >
              {!listingSchoolHouses?.listData?.rows?.length ?  (
                  <MenuItem>
                    {'No House Created'}
                  </MenuItem>
                ) :
                listingSchoolHouses.listData.rows.map(item => (
                  <MenuItem value={item.id} name={item.name} key={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
            </Select>
            <FormHelperText>{formik.touched.house && formik.errors.house}</FormHelperText>
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
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
            <FormHelperText>
              {formik.touched.status && formik.errors.status}
            </FormHelperText>
          </FormControl>

          <Box
            sx={{
              border: "2px solid #BADFE7",
              borderRadius: "12px",
              display: "grid",
              gap: "40px",
              alignItems: "center",
              width: isMobile
                ? "100%"
                : formik.values.is_taking_bus
                  ? "215%"
                  : formik.values.is_taking_bus
                    ? "200%"
                    : "290px",
              padding: "5px",
              gridTemplateColumns: formik.values.is_taking_bus
                ? "repeat(2, minmax(0, 1fr))"
                : "1fr",
              gridColumnStart: 1,
            }}
          >
            <FormControlLabel
              label="Bus Required"
              sx={{ gridColumn: isMobile ? "span 2" : "", margin: "auto 0px" }}
              control={
                <Checkbox
                  {...checkboxLabel}
                  color="default"
                  checked={formik.values.is_taking_bus}
                  name="is_taking_bus"
                  onChange={(event, value) => {
                    formik.setFieldValue("is_taking_bus", value);
                  }}
                />
              }
            />
            {formik.values.is_taking_bus && (
              <FormControl
                variant="filled"
                sx={{ minWidth: 120 }}
                error={!!formik.touched.bus && !!formik.errors.bus}
              >
                <InputLabel>Bus Number</InputLabel>
                <Select
                  name="bus"
                  value={formik.values.bus || ""}
                  onChange={(event) =>
                    formik.setFieldValue("bus", event.target.value)
                  }
                >
                  {!allBuses?.listData?.rows?.length
                    ? null
                    : allBuses.listData.rows.map((item) => (
                      <MenuItem
                        value={item.id}
                        name={`${item.registration_no}`}
                        key={item.id}
                      >
                        {`${item.registration_no}`}
                      </MenuItem>
                    ))}
                </Select>
                <FormHelperText>
                  {formik.touched.bus && formik.errors.bus}
                </FormHelperText>
              </FormControl>
            )}
          </Box>
          <Box
            sx={{
              border: "2px solid #BADFE7",
              borderRadius: "12px",
              display: "grid",
              gap: "40px",
              alignItems: "center",
              width: isMobile
                ? "100%"
                : formik.values.fee_waiver_type === "partial" &&
                  formik.values.is_fee_waiver
                  ? "326%"
                  : formik.values.is_fee_waiver
                    ? "200%"
                    : "290px",
              padding: "5px",
              gridTemplateColumns:
                formik.values.fee_waiver_type === "partial" &&
                  formik.values.is_fee_waiver
                  ? "repeat(3, minmax(0, 1fr))"
                  : formik.values.is_fee_waiver
                    ? "repeat(2, minmax(0, 1fr))"
                    : "1fr",
              gridColumnStart: 1,
              "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
            }}
          >
            <FormControlLabel
              label="Is Fee Waiver"
              sx={{ gridColumn: isMobile ? "span 2" : "", margin: "auto 0px" }}
              control={
                <Checkbox
                  {...checkboxLabel}
                  color="default"
                  checked={formik.values.is_fee_waiver}
                  name="is_fee_waiver"
                  onChange={(event, value) => {
                    formik.setFieldValue("is_fee_waiver", value);
                    if (formik.values.is_fee_waiver) {
                      formik.setFieldValue("fee_waiver_type", "");
                      formik.setFieldValue("waived_fees", "");
                    }
                  }}
                />
              }
            />
            {formik.values.is_fee_waiver && (
              <FormControl
                variant="filled"
                sx={{ minWidth: 120 }}
                error={
                  !!formik.touched.fee_waiver_type &&
                  !!formik.errors.fee_waiver_type
                }
              >
                <InputLabel>Fee Waiver Type</InputLabel>
                <Select
                  variant="filled"
                  name="fee_waiver_type"
                  value={formik.values.fee_waiver_type}
                  onChange={formik.handleChange}
                >
                  <MenuItem value="partial">Partial</MenuItem>
                  <MenuItem value="full">Full</MenuItem>
                </Select>
                <FormHelperText>
                  {formik.touched.fee_waiver_type &&
                    formik.errors.fee_waiver_type}
                </FormHelperText>
              </FormControl>
            )}
            {formik.values.fee_waiver_type === "partial" &&
              formik.values.is_fee_waiver && (
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  name="waived_fees"
                  label="Waived Fees (in rupees)"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.waived_fees}
                  error={
                    !!formik.touched.waived_fees && !!formik.errors.waived_fees
                  }
                  helperText={
                    formik.touched.waived_fees && formik.errors.waived_fees
                  }
                />
              )}
          </Box>

          <fieldset style={{
            border: theme.palette.mode === 'light' ? "2px solid rgb(0 165 201)" : "2px solid #BADFE7",
            borderRadius: "10px",
            padding: "10px",
            margin: "5px 0px 5px 0px",
            gridColumnStart: 1,
            gridColumn: "span 4"
          }}>
            <legend style={{
              color: theme.palette.mode === 'light' ? "rgb(0 165 201)" : "#BADFE7",
              fontWeight: "bold",
              padding: "5px",
              fontSize: "larger"
            }}>
              Mother's Details
            </legend>
            <Box
              display='grid'
              gap="30px"
              gridTemplateColumns="repeat(3, minmax(0, 1fr))"
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                name="mother_name"
                label="Mother's Name*"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.mother_name}
                error={!!formik.touched.mother_name && !!formik.errors.mother_name}
                helperText={formik.touched.mother_name && formik.errors.mother_name}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                name="mother_contact_no"
                label="Mother Contact Number*"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.mother_contact_no}
                error={!!formik.touched.mother_contact_no && !!formik.errors.mother_contact_no}
                helperText={formik.touched.mother_contact_no && formik.errors.mother_contact_no}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                name="mother_aadhar"
                label="Mother Aadhar*"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.mother_aadhar}
                error={!!formik.touched.mother_aadhar && !!formik.errors.mother_aadhar}
                helperText={formik.touched.mother_aadhar && formik.errors.mother_aadhar}
              />
            </Box>
          </fieldset>

          <fieldset style={{
            border: theme.palette.mode === 'light' ? "2px solid rgb(0 165 201)" : "2px solid #BADFE7",
            borderRadius: "10px",
            padding: "10px",
            margin: "5px 0px 5px 0px",
            gridColumnStart: 1,
            gridColumn: "span 4"
          }}>
            <legend style={{
              color: theme.palette.mode === 'light' ? "rgb(0 165 201)" : "#BADFE7",
              fontWeight: "bold",
              padding: "5px",
              fontSize: "larger"
            }}>
              Father's Details
            </legend>
            <Box
              display='grid'
              gap="30px"
              gridTemplateColumns="repeat(3, minmax(0, 1fr))"
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                name="father_name"
                label="Father's Name*"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.father_name}
                error={!!formik.touched.father_name && !!formik.errors.father_name}
                helperText={formik.touched.father_name && formik.errors.father_name}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                name="father_contact_no"
                label="Father's Contact Number*"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.father_contact_no}
                error={!!formik.touched.father_contact_no && !!formik.errors.father_contact_no}
                helperText={formik.touched.father_contact_no && formik.errors.father_contact_no}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                name="father_aadhar"
                label="Father's Aadhar*"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.father_aadhar}
                error={!!formik.touched.father_aadhar && !!formik.errors.father_aadhar}
                helperText={formik.touched.father_aadhar && formik.errors.father_aadhar}
              />
            </Box>
          </fieldset>

          <fieldset style={{
            border: theme.palette.mode === 'light' ? "2px solid rgb(0 165 201)" : "2px solid #BADFE7",
            borderRadius: "10px",
            padding: "10px",
            margin: "5px 0px 10px 0px",
            gridColumnStart: 1,
            gridColumn: "span 4"
          }}>
            <legend style={{
              color: theme.palette.mode === 'light' ? "rgb(0 165 201)" : "#BADFE7",
              fontWeight: "bold",
              padding: "5px",
              fontSize: "larger"
            }}>
              Gurdian's Details ( if any )
            </legend>
            <Box
              display='grid'
              gap="30px"
              gridTemplateColumns="repeat(3, minmax(0, 1fr))"
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                name="guardian_name"
                label="Guardian's Name*"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.guardian_name}
                error={!!formik.touched.guardian_name && !!formik.errors.guardian_name}
                helperText={formik.touched.guardian_name && formik.errors.guardian_name}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                name="guardian_contact_no"
                label="Guardian's Contact Number*"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.guardian_contact_no}
                error={!!formik.touched.guardian_contact_no && !!formik.errors.guardian_contact_no}
                helperText={formik.touched.guardian_contact_no && formik.errors.guardian_contact_no}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                name="guardian_aadhar"
                label="Guardian's Aadhar*"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.guardian_aadhar}
                error={!!formik.touched.guardian_aadhar && !!formik.errors.guardian_aadhar}
                helperText={formik.touched.guardian_aadhar && formik.errors.guardian_aadhar}
              />
            </Box>
          </fieldset>


        </Box>
      </form>
      <Toast
        alerting={toastInfo.toastAlert}
        severity={toastInfo.toastSeverity}
        message={toastInfo.toastMessage}
      />
    </Box>
  );
};

StudentFormComponent.propTypes = {
  onChange: PropTypes.func,
  refId: PropTypes.shape({
    current: PropTypes.any,
  }),
  setDirty: PropTypes.func,
  reset: PropTypes.bool,
  setReset: PropTypes.func,
  classData: PropTypes.array,
  setClassData: PropTypes.func,
  setFormikData: PropTypes.func,
  allSubjects: PropTypes.array,
  userId: PropTypes.number,
  updatedValues: PropTypes.object,
  iCardDetails: PropTypes.object,
  setICardDetails: PropTypes.func,
};

export default StudentFormComponent;
