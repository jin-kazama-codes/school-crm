/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import PropTypes from "prop-types";

import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "@/lib/routerAdapter";
import { useDispatch, useSelector } from "react-redux";

import { Formik } from "formik";
import { Box, Button, Dialog, Divider, Typography, TextField, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import API from "../../apis";
import paymentMethodValidation from "./Validation";
import Loader from "../common/Loader";
import Toast from "../common/Toast";

import { setMenuItem } from "../../redux/actions/NavigationAction";
import { tokens, themeSettings } from "../../theme";
import { Utility } from "../utility";

import formBg from "../assets/formBg.png";

const initialValues = {
  name: ""
};

const FormComponent = ({ openDialog, setOpenDialog }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = useMediaQuery("(max-width:480px)");
  const isTab = useMediaQuery("(max-width:920px)");

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  //form component starts
  const [title, setTitle] = useState("Create");
  const [loading, setLoading] = useState(false);
  const [initialState, setInitialState] = useState(initialValues);

  const selected = useSelector(state => state.menuItems.selected);
  const toastInfo = useSelector(state => state.toastInfo);
  const navigateTo = useNavigate();
  const dispatch = useDispatch();

  const { state } = useLocation();
  const { typography } = themeSettings(theme.palette.mode);
  const { toastAndNavigate, getLocalStorage } = Utility();
  let id = state?.id;

  useEffect(() => {
    const selectedMenu = getLocalStorage("menu");
    dispatch(setMenuItem(selectedMenu.selected));
    if (id) {
      setTitle("Update");
      populateData(id);
    } else {
      setTitle("Create");
      setInitialState(initialValues);
    }
  }, [id]);

  const updatePaymentMethod = useCallback(values => {
    setLoading(true);
    API.PaymentMethodAPI.updatePaymentMethod(values)
      .then(({ data: paymentMethod }) => {
        if (paymentMethod?.status === "Success") {
          setLoading(false);
          toastAndNavigate(dispatch, true, "info", "Successfully Updated");
          setTimeout(() => {
            handleDialogClose();
            location.href = "/payment-method/listing";    //same as location.reload()
          }, 2000);
        } else {
          //without settimeout, the page is reloaded immediately, which
          setLoading(false); //we do when there is error in updating, not when success
          toastAndNavigate(dispatch, true, "error", "An Error Occurred, Please Try Again");
        }
      })
      .catch((err) => {
        setLoading(false);
        toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred");
        console.log('Error in payment method update', err);
      });
  }, []);

  const populateData = useCallback(id => {
    setLoading(true);
    const path = [`/get-by-pk/payment_method/${id}`];
    API.CommonAPI.multipleAPICall("GET", path)
      .then(response => {
        if (response[0].data.status === "Success") {
          setInitialState(response[0].data.data);
          setLoading(false);
        } else {
          setLoading(false);
          toastAndNavigate(dispatch, true, "error", "An Error Occurred, Please Try Again");
        }
      })
      .catch((err) => {
        setLoading(false);
        toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred");
        console.log('Error in payment method populate', err);
      });
  }, [id]);

  const createPaymentMethod = useCallback(values => {
    setLoading(true);
    API.PaymentMethodAPI.createPaymentMethod(values)
      .then(({ data: paymentMethod }) => {
        if (paymentMethod?.status === "Success") {
          setLoading(false);
          toastAndNavigate(dispatch, true, "success", "Successfully Created");
          setTimeout(() => {
            handleDialogClose();
            navigateTo(0);
          }, 2000);
        } else {
          setLoading(false);
          toastAndNavigate(dispatch, true, "error", "An Error Occurred, Please Try Again");
        }
      })
      .catch((err) => {
        setLoading(false);
        toastAndNavigate(dispatch, true, err ? err.response?.data?.msg : "An Error Occurred");
        console.log('Error in payment method create', err);
      });
  }, []);

  return (
    <div>
      <Dialog
        fullScreen={fullScreen}
        open={openDialog}
        onClose={handleDialogClose}
        aria-labelledby="responsive-dialog-title"
        sx={{
          top: isMobile ? "33%" : isTab ? "25%" : "20%",
          height: isMobile ? "49%" : isTab ? "39%" : "60%",
          "& .MuiPaper-root": {
            width: "100%",
            backgroundImage:
              theme.palette.mode == "light"
                ? `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${formBg})`
                : `linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.9)), url(${formBg})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          },
        }}
      >
        <Typography
          fontFamily={typography.fontFamily}
          fontSize={typography.h2.fontSize}
          color={colors.grey[100]}
          fontWeight="600"
          display="inline-block"
          textAlign="center"
          marginTop="10px"
        >
          {`${title} ${selected}`}
        </Typography>
        <Formik
          initialValues={initialState}
          enableReinitialize    // To reinitialize the form when it gets stored values from backend
          validationSchema={paymentMethodValidation}
          onSubmit={values => values.id ? updatePaymentMethod(values) : createPaymentMethod(values)}
        >
          {({
            values,
            errors,
            touched,
            dirty,
            isSubmitting,
            handleBlur,
            handleChange,
            handleSubmit,
            resetForm,
          }) => (
            <form onSubmit={handleSubmit}>
              <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(2, minmax(0, 1fr))"
                padding="20px"
              >
                <TextField
                  variant="filled"
                  type="text"
                  name="name"
                  label="Name*"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.name}
                  error={!!touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                  sx={{ gridColumn: 'span 2' }}
                />
              </Box>
              <Divider />
              <Box display="flex" justifyContent="end" p="20px">
                {
                  //hide reset button on amenity update
                  title === "Update" ? null : (
                    <Button
                      type="reset"
                      color="warning"
                      variant="contained"
                      sx={{ mr: 3 }}
                      disabled={!dirty || isSubmitting}
                      onClick={() => {
                        if (window.confirm("Do You Really Want To Reset?")) {
                          resetForm();
                        }
                      }}
                    >
                      Reset
                    </Button>
                  )}
                <Button
                  color="error"
                  variant="contained"
                  sx={{ mr: 3 }}
                  onClick={() => handleDialogClose()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!dirty || isSubmitting}
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
            </form>
          )}
        </Formik>
        {loading === true ? <Loader /> : null}
      </Dialog>
    </div>
  );
};

FormComponent.propTypes = {
  openDialog: PropTypes.bool,
  setOpenDialog: PropTypes.func
};

export default FormComponent;
