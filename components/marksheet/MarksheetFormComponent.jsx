/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useEffect } from "react";
import PropTypes from "prop-types";

import { useFormik } from "formik";
import {
  Box,
  InputLabel,
  MenuItem,
  FormHelperText,
  FormControl,
} from "@mui/material";
import { Select, TextField, useMediaQuery } from "@mui/material";

import API from "../../apis";
import config from "../config";
import marksheetValidation from "./Validation";

import { setMarksheetClassData } from "../../redux/actions/MarksheetAction";
import { setAllSubjects } from "../../redux/actions/SubjectAction";
import { setAllStudents } from "../../redux/actions/StudentAction";
import { useDispatch, useSelector } from "react-redux";
import { Utility } from "../utility";
import { useCommon } from "../hooks/common";

const initialValues = {
  dbId: "",
  session: "",
  student: "",
  class: "",
  section: "",
  term: "",
  result: "",
  subjects: [],
  marks_obtained: "",
  total_marks: "",
  grade: "",
  remark: "",
};

const MarksheetFormComponent = ({
  onChange,
  refId,
  setDirty,
  reset,
  setReset,
  updatedValues = null,
}) => {
  const allSubjects = useSelector((state) => state.allSubjects);
  const allStudents = useSelector((state) => state.allFormStudents);
  const { marksheetClassData } = useSelector((state) => state.allMarksheets);

  const dispatch = useDispatch();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const { getStudents } = useCommon();
  const { createSession, findMultipleById, fetchAndSetAll } = Utility();

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: marksheetValidation,
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
      });
    }
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
    if (!allSubjects?.listData?.length) {
      fetchAndSetAll(dispatch, setAllSubjects, API.SubjectAPI);
    }
  }, []);

  useEffect(() => {
    // this will run when creating marksheet
    if (marksheetClassData?.classDataObj) {
      formik.setFieldValue("class", marksheetClassData.classDataObj.class_name);
      formik.setFieldValue(
        "section",
        marksheetClassData.classDataObj.section_name
      );
      formik.setFieldValue(
        "subjects",
        marksheetClassData.classDataObj.subject_ids.split(",")
      );
      getStudents(
        marksheetClassData.classDataObj.class_id,
        marksheetClassData.classDataObj.section_id,
        setAllStudents,
        API
      );
    }
  }, [marksheetClassData?.classDataObj]);

  useEffect(() => {
    if (updatedValues) {
      let subjectIds = [];
      updatedValues.marksheetMappingData.map((sub, index) => {
        formik.setFieldValue(`marks_obtained_${index}`, sub.marks_obtained);
        formik.setFieldValue(`total_marks_${index}`, sub.total_marks);
        formik.setFieldValue(`grade_${index}`, sub.grade);
        formik.setFieldValue(`remark_${index}`, sub.remark);
        formik.setFieldValue(`result_${index}`, sub.result);
        formik.setFieldValue(`dbId_${index}`, sub.id);
        subjectIds.push(sub.subject_id.toString());
      });
      let classSubjects;
      if (subjectIds?.length) {
        classSubjects = findMultipleById(subjectIds.join(","), allSubjects?.listData);
      }
      formik.setFieldValue("session", updatedValues.marksheetData[0]?.session);
      formik.setFieldValue("student", updatedValues.marksheetData[0]?.student_id);
      formik.setFieldValue("term", updatedValues.marksheetData[0]?.term);
      formik.setFieldValue("result", updatedValues.marksheetData[0]?.result);

      dispatch(
        setMarksheetClassData({
          ...marksheetClassData,
          selectedSubjects: classSubjects,
        })
      );
    }
  }, [updatedValues]);

  return (
    <Box m="20px">
      <form ref={refId}>
        <div
          style={{
            border: "2px solid #BADFE7",
            padding: "25px 10px",
            marginBottom: "40px",
            borderRadius: "12px",
          }}
        >
          <Box
            display="grid"
            gap="15px"
            gridTemplateColumns="repeat(3, minmax(0, 1fr))"
            marginBottom="20px"
            sx={{
              "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
            }}
          >
            <FormControl
              variant="filled"
              sx={{ minWidth: 120 }}
              error={!!formik.touched.session && !!formik.errors.session}
            >
              <InputLabel id="sessionField">Session</InputLabel>
              <Select
                variant="filled"
                labelId="sessionField"
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
              label="Class"
              value={formik.values.class || ""}
            />
            <TextField
              fullWidth
              variant="filled"
              type="text"
              label="Section"
              value={formik.values.section || ""}
            />
          </Box>
          <Box
            display="flex"
            justifyContent="space-evenly"
            alignItems="center"
            mb={4}
          >
            <FormControl
              variant="filled"
              sx={{ minWidth: 320 }}
              error={!!formik.touched.term && !!formik.errors.term}
            >
              <InputLabel id="termField">Term</InputLabel>
              <Select
                variant="filled"
                labelId="termField"
                name="term"
                onChange={formik.handleChange}
                value={formik.values.term}
              >
                {Object.keys(config.term).map(item => (
                  <MenuItem key={item} value={item}>
                    {config.term[item]}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{formik.touched.term && formik.errors.term}</FormHelperText>
            </FormControl>

            <FormControl
              variant="filled"
              sx={{ minWidth: 320 }}
              error={!!formik.touched.student && !!formik.errors.student}
            >
              <InputLabel id="studentField">Student</InputLabel>
              <Select
                labelId="studentField"
                name="student"
                value={formik.values.student || ""}
                onChange={(event) =>
                  formik.setFieldValue("student", event.target.value)
                }
              >
                {!allStudents?.listData?.rows?.length
                  ? null
                  : allStudents.listData.rows.map((item) => (
                    <MenuItem
                      value={item.id}
                      name={`${item.firstname} ${item.lastname}`}
                      key={item.id}
                    >
                      {`${item.firstname.charAt(0).toUpperCase() +
                        item.firstname.slice(1)
                        } ${item.lastname.charAt(0).toUpperCase() +
                        item.lastname.slice(1)
                        }`}
                    </MenuItem>
                  ))}
              </Select>
              <FormHelperText>
                {formik.touched.session && formik.errors.session}
              </FormHelperText>
            </FormControl>
          </Box>
        </div>

        <div
          style={{
            border: "2px solid #BADFE7",
            padding: "25px 10px",
            marginBottom: "30px",
            borderRadius: "12px",
          }}
        >
          {!marksheetClassData?.selectedSubjects
            ? null
            : marksheetClassData.selectedSubjects.map((subject, index) => (
              <Box
                key={index}
                display="grid"
                gap="15px"
                gridTemplateColumns="repeat(6, minmax(0, 1fr))"
                mb={2}
              >
                <Box display="flex" alignItems="center">
                  {subject?.name}
                </Box>
                <TextField
                  fullWidth
                  variant="outlined"
                  type="text"
                  name={`marks_obtained_${index}`}
                  label="Marks Obtained*"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values[`marks_obtained_${index}`]}
                  error={
                    !!formik.touched[`marks_obtained_${index}`] &&
                    !!formik.errors[`marks_obtained_${index}`]
                  }
                  helperText={
                    formik.touched[`marks_obtained_${index}`] &&
                    formik.errors[`marks_obtained_${index}`]
                  }
                  sx={{ width: "150px" }}
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  type="text"
                  name={`total_marks_${index}`}
                  label="Total Marks*"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values[`total_marks_${index}`]}
                  error={
                    !!formik.touched[`total_marks_${index}`] &&
                    !!formik.errors[`total_marks_${index}`]
                  }
                  helperText={
                    formik.touched[`total_marks_${index}`] &&
                    formik.errors[`total_marks_${index}`]
                  }
                  sx={{ width: "150px" }}
                />
                <TextField
                  variant="outlined"
                  type="text"
                  name={`grade_${index}`}
                  label="Grade*"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values[`grade_${index}`]}
                  error={
                    !!formik.touched[`grade_${index}`] &&
                    !!formik.errors[`grade_${index}`]
                  }
                  helperText={
                    formik.touched[`grade_${index}`] &&
                    formik.errors[`grade_${index}`]
                  }
                  sx={{ width: "120px" }}
                />
                <TextField
                  variant="outlined"
                  type="text"
                  name={`remark_${index}`}
                  label="Remark"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values[`remark_${index}`]}
                  error={
                    !!formik.touched[`remark_${index}`] &&
                    !!formik.errors[`remark_${index}`]
                  }
                  helperText={
                    formik.touched[`remark_${index}`] &&
                    formik.errors[`remark_${index}`]
                  }
                />
                <FormControl
                  variant="filled"
                  error={
                    !!formik.touched[`result_${index}`] &&
                    !!formik.errors[`result_${index}`]
                  }
                >
                  <InputLabel id="resultField">Result</InputLabel>
                  <Select
                    variant="filled"
                    labelId="resultField"
                    name={`result_${index}`}
                    value={formik.values[`result_${index}`] || ""}
                    onChange={(event) =>
                      formik.setFieldValue(
                        `result_${index}`,
                        event.target.value
                      )
                    }
                  >
                    {!updatedValues?.length
                      ? [
                        <MenuItem key="pass" value="pass">
                          Pass
                        </MenuItem>,
                        <MenuItem key="fail" value="fail">
                          Fail
                        </MenuItem>,
                      ]
                      : [
                        <MenuItem key="pass" value="pass">
                          {formik.values[`result_${index}`] || "Pass"}{" "}
                        </MenuItem>,
                        <MenuItem key="fail" value="fail">
                          {formik.values[`result_${index}`] || "Fail"}{" "}
                        </MenuItem>,
                      ]}
                  </Select>
                  <FormHelperText>
                    {formik.touched[`result_${index}`] &&
                      formik.errors[`result_${index}`]}
                  </FormHelperText>
                </FormControl>
              </Box>
            ))}
        </div>
        <FormControl
          variant="filled"
          sx={{ minWidth: 120 }}
          error={!!formik.touched.result && !!formik.errors.result}
        >
          <InputLabel>Result</InputLabel>
          <Select
            variant="filled"
            name="result"
            value={formik.values.result}
            onChange={formik.handleChange}
          >
            <MenuItem key="pass" value="pass">
              Pass
            </MenuItem>,
            <MenuItem key="fail" value="fail">
              Fail
            </MenuItem>
          </Select>
          <FormHelperText>
            {formik.touched.result && formik.errors.result}
          </FormHelperText>
        </FormControl>
      </form>
    </Box>
  );
};

MarksheetFormComponent.propTypes = {
  onChange: PropTypes.func,
  refId: PropTypes.shape({
    current: PropTypes.any,
  }),
  setDirty: PropTypes.func,
  reset: PropTypes.bool,
  setReset: PropTypes.func,
  userId: PropTypes.number,
  studentId: PropTypes.number,
  updatedValues: PropTypes.array,
};

export default MarksheetFormComponent;
