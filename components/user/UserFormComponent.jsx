/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";

import { useFormik } from "formik";
import {
  Box,
  InputLabel,
  MenuItem,
  InputAdornment,
  IconButton,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { Button, Select, TextField, useMediaQuery } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

import API from "../../apis";
import userValidation from "./Validation";

import { setAllSchools } from "../../redux/actions/SchoolAction";
import { setAllUserRoles } from "../../redux/actions/UserRoleAction";
import { Utility } from "../utility";

import config from "../config";

const initialValues = {
  school_id: "",
  username: "",
  password: "",
  email: "",
  contact_no: "",
  designation: "",
  role: "",
  gender: "",
  status: "active",
};

const UserFormComponent = ({
  onChange,
  refId,
  setDirty,
  reset,
  setReset,
  schoolId,
  userId,
  rolePriority,
  updatedValues = null,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [updatePassword, setUpdatePassword] = useState({
    clicked: false,
    password: null,
  });
  const [initialState, setInitialState] = useState(initialValues);
  const [_schoolId, setSchoolId] = useState(null);
  const allSchools = useSelector((state) => state.allSchools);
  const allUserRoles = useSelector((state) => state.allUserRoles);

  const dispatch = useDispatch();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const isMobile = useMediaQuery("(max-width:480px)");
  const pwField = document.getElementById("pwField");
  const { fetchAndSetAll } = Utility();

  const formik = useFormik({
    initialValues: initialState,
    validationSchema: userValidation,
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
      if (pwField.disabled) {
        delete formik.values.password;
      }
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
    if (updatedValues) {
      setInitialState(updatedValues);
      pwField.setAttribute("disabled", true);
      pwField.style.backgroundColor = "#777";
      setUpdatePassword({
        clicked: true,
      });
    }
  }, [updatedValues]);

  useEffect(() => {
    // this will only fetch schools for admin
    if (!allSchools?.listData?.length && rolePriority === 1) {
      fetchAndSetAll(dispatch, setAllSchools, API.SchoolAPI);
    }
  }, [allSchools?.listData]);

  useEffect(() => {
    if (!allUserRoles?.listData?.length) {
      fetchAndSetAll(dispatch, setAllUserRoles, API.UserRoleAPI);
    }
  }, [allUserRoles?.listData?.length]);

  // useEffect(() => {
  //     const getRoles = () => {
  //         API.UserRoleAPI.getAll()
  //             .then(roles => {
  //                 if (roles.status === 'Success') {
  //                     setAllRoles(roles.data.rows);
  //                 } else {
  //                     console.log("An Error Occurred, Please Try Again");
  //                 }
  //             })
  //             .catch(err => {
  //                 throw err;
  //             });
  //     };
  //     getRoles();
  // }, []);

  const handleUpdatePassword = () => {
    if (updatePassword.clicked) {
      pwField.removeAttribute("disabled");
      pwField.style.backgroundColor = "rgba(255, 255, 255, 0.09)";
      pwField.focus();
      setUpdatePassword({
        clicked: false,
        password: formik.values.password,
      });
      formik.values.password = "";
    } else {
      pwField.setAttribute("disabled", true);
      pwField.style.backgroundColor = "#777";
      setUpdatePassword({
        clicked: true,
      });
      formik.values.password = updatePassword.password;
    }
  };

  useEffect(() => {
    if (schoolId) {
      formik.setFieldValue("school_id", schoolId);
    }
  }, [schoolId]);

  return (
    <Box m="20px">
      {userId ? (
        <Button
          type="button"
          color="primary"
          variant="contained"
          sx={{
            position: isMobile ? "relative" : "absolute",
            right: isMobile ? "0" : 30,
            top: isMobile ? 98 : 110,
            zIndex: isMobile ? 1 : 0,
          }}
          onClick={handleUpdatePassword}
        >
          {updatePassword.clicked === true ? "Update" : "Cancel Update"}{" "}
          Password{" "}
        </Button>
      ) : null}
      <form ref={refId}>
        <Box
          display="grid"
          gap="30px"
          gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          sx={{
            "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
          }}
        >
          <TextField
            fullWidth
            variant="filled"
            type="text"
            name="username"
            label="Username*"
            autoComplete={false}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.username}
            error={!!formik.touched.username && !!formik.errors.username}
            helperText={formik.touched.username && formik.errors.username}
            sx={{ gridColumn: "span 2" }}
          />
          <TextField
            fullWidth
            variant="filled"
            id="pwField"
            label="Password*"
            name="password"
            type={showPassword ? "text" : "password"} // <-- This is where the pw toggle happens
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.password}
            error={!!formik.touched.password && !!formik.errors.password}
            helperText={formik.touched.password && formik.errors.password}
            sx={{ gridColumn: "span 2" }}
            InputProps={{
              // <-- This is where the toggle button is added
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseDown={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <VisibilityOutlinedIcon />
                    ) : (
                      <VisibilityOffOutlinedIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Designation"
            name="designation"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.designation}
            error={!!formik.touched.designation && !!formik.errors.designation}
            helperText={formik.touched.designation && formik.errors.designation}
          />
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

          {allSchools?.listData?.length ? (
            <FormControl
              variant="filled"
              sx={{ minWidth: 120 }}
              error={!!formik.touched.school_id && !!formik.errors.school_id}
            >
              <InputLabel id="schoolField">School</InputLabel>
              <Select
                variant="filled"
                labelId="schoolField"
                label="School"
                name="school_id"
                disabled ={schoolId && userId ? true : false}
                value={formik.values.school_id}
                onChange={(event) => {
                  const selectedSchoolId = event.target.value;
                  setSchoolId(selectedSchoolId);
                  formik.setFieldValue("school_id", selectedSchoolId);
                }}
              >
                {allSchools.listData.map((item) => (
                  <MenuItem value={item.id} name={item.name} key={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}

          <FormControl
            variant="filled"
            sx={{ minWidth: 120 }}
            error={!!formik.touched.role && !!formik.errors.role}
          >
            <InputLabel id="roleField">Role</InputLabel>
            <Select
              variant="filled"
              labelId="roleField"
              label="role"
              name="role"
              value={formik.values.role}
              onChange={formik.handleChange}
            >
              {rolePriority === 2 && !allUserRoles?.listData?.length
                ? null
                : allUserRoles.listData
                  .filter((role) => role.id > rolePriority && role.id < 4)
                  .map((role) => (
                    <MenuItem
                      value={role.id}
                      name={role.name}
                      key={role.name}
                    >
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </MenuItem>
                  ))}
            </Select>
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
      </form>
    </Box>
  );
};

UserFormComponent.propTypes = {
  onChange: PropTypes.func,
  refId: PropTypes.shape({
    current: PropTypes.any,
  }),
  setDirty: PropTypes.func,
  reset: PropTypes.bool,
  setReset: PropTypes.func,
  userId: PropTypes.number,
  rolePriority: PropTypes.number,
  updatedValues: PropTypes.object,
};

export default UserFormComponent;
