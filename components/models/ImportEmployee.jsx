/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "@/lib/routerAdapter";
import { useSelector, useDispatch } from "react-redux";
import { read, utils } from 'xlsx';

import PropTypes from "prop-types";

import { Box, Divider, IconButton, Typography } from "@mui/material";
import { Button, Dialog, TextField, useMediaQuery } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

import API from "../../apis"
import Toast from "../common/Toast";
import Loader from "../common/Loader";
import { tokens, themeSettings } from "../../theme";
import { Utility } from "../utility";

import formBg from "../assets/formBg.png";

const ENV = process.env;

const ImportComponent = ({ openDialog, setOpenDialog }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isMobile = useMediaQuery("(max-width:480px)");
    const isTab = useMediaQuery("(max-width:920px)");

    //form component starts
    const [importedFile, setImportedFile] = useState(undefined);
    const [employees, setEmployee] = useState([]);
    const [fileName, setFileName] = useState('');
    const [uploadingRecord, setUploadingRecord] = useState({});
    const [loading, setLoading] = useState(false);
    const selected = useSelector(state => state.menuItems.selected);
    const toastInfo = useSelector(state => state.toastInfo);

    const { typography } = themeSettings(theme.palette.mode);
    const { getStateCityFromZipCode, toastAndNavigate, generatePassword } = Utility();
    const dispatch = useDispatch();
    const navigateTo = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        handleImport();
    }

    const handleImport = () => {
        if (importedFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const wb = read(event.target.result);
                const sheets = wb.SheetNames;
                if (sheets.length) {
                    const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);
                    setEmployee(rows);
                    setUploadingRecord({
                        ...uploadingRecord,
                        count: sheets.length
                    })
                }
            }
            reader.readAsArrayBuffer(importedFile);
        }
    }

    const getIdByName = async (attrName, API) => {
        return new Promise(resolve => {
            API.getIdByName(attrName)
                .then(res => {
                    if (res.status === "Success") {
                        resolve(res.data);
                    } else {
                        resolve(new Error(`API call unsuccessful: ${res.status}`));
                    }
                })
                .catch(error => {
                    resolve(new Error(`API call failed: ${error.message}`));
                });
        });
    }

    const excelSerialToDate = async (serial) => {
        if (serial === undefined || serial === null) {
            return "0000-00-00";
        }

        if (!serial.toString().includes("/") && !serial.toString().includes("-")) {
            const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
            const daysOffset = serial - 2; // Excel mistakenly considers 1900 a leap year, so subtract 2 days
            const date = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);

            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based in JS
            const year = date.getFullYear();

            return `${year}-${month}-${day}`;
        }
        return serial;
    }

    useEffect(() => {
        if (employees?.length) {

            const promises = employees.map(async (employee) => {
                try {
                    setLoading(true);
                    const apiResponse = await getStateCityFromZipCode(employee.zipcode);

                    const cityName = await apiResponse.city;
                    const stateName = await apiResponse.state;
                    const employeeDobSerial = employee.dob;

                    const state_id = await getIdByName(stateName, API.StateAPI);
                    const city_id = await getIdByName(cityName, API.CityAPI);

                    const employeeDob = await excelSerialToDate(employeeDobSerial);

                    if (employee.firstname) {
                        
                        if (employee.firstname) {

                            let condition = {
                                contact_no : employee.contact_no,
                            }
                           
                            const { data: emp } = await API.CommonAPI.createOrUpdate({
                                ...employee,
                                dob: employeeDob ? employeeDob.replace(/\//g, "-") : null,

                            }, 'employee', condition);

                            API.CommonAPI.createOrUpdate({
                                parent_id: emp.id,
                                parent: 'employee',
                                street: employee.street,
                                landmark: employee.landmark,
                                zipcode: employee.zipcode,
                                state: state_id,
                                city: city_id,
                                country: 2
                            }, 'address', {
                                parent: 'employee',
                                parent_id: emp.id
                            });
                            setUploadingRecord({
                                ...uploadingRecord,
                                count: uploadingRecord.count--,
                                name: employee.firstname,
                                skip: false
                            });
                        }
                    } else {
                        setUploadingRecord({
                            ...uploadingRecord,
                            count: uploadingRecord.count--,
                            name: employee.firstname,
                            skip: true
                        });
                    }
                } catch (error) {
                    if (error) {
                        console.error("Error in API:", error);
                    }
                }
            });

            Promise.all(promises)
                .then(() => {
                    console.log("All operations completed successfully.");
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "success", "Successfully Created", navigateTo, "#", true);
                })
                .catch(error => {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "error", error ? error?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
                    console.log("At least one operation failed:", error);
                })
        }

    }, [employees?.length]);

    return (
        <div >
            <Dialog
                fullScreen={fullScreen}
                open={openDialog}
                // onClose={setOpenDialog(false)}
                aria-labelledby="responsive-dialog-title"
                sx={{
                    top: isMobile ? "33%" : isTab ? "25%" : "20%", height: isMobile ? "49%" : isTab ? "39%" : "60%",
                    "& .MuiPaper-root": {
                        width: "100%",
                        backgroundImage: theme.palette.mode == "light" ? `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${formBg})`
                            : `linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.9)), url(${formBg})`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "cover"
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
                    {`Import ${selected}s e`}
                </Typography>
                <Box>
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
                        <TextField
                            name="importedFile"
                            label="Upload Your File"
                            value={importedFile}
                            size="medium"
                            InputProps={{
                                startAdornment: (
                                    <IconButton component="label" sx={{ width: "99%" }}>
                                        <UploadFileIcon />
                                        <input
                                            hidden
                                            type="file"
                                            name="importedFile"
                                            onChange={event => {
                                                const file = event.target.files[0];
                                                setImportedFile(file);
                                                setFileName(file.name);
                                            }}
                                        />
                                    </IconButton>
                                )
                            }}
                            sx={{ m: "8px auto", outline: "none", width: "40%" }}
                        />
                        <div style={{ lineHeight: "30px", gridColumn: "span 2", display: "flex", fontWeight: "600", marginLeft: "30%" }}>Your Selected File: <div style={{ fontWeight: "900", marginLeft: "20px", color: "blue" }}>{fileName}</div> </div>

                        <Divider />
                        <Box display="flex" justifyContent="space-between" p="20px">

                            <a href="https://ufile.io/68xl79m8" target="_blank">
                                <Button
                                    component="label"
                                    role={undefined}
                                    variant="contained"
                                    tabIndex={-1}
                                    color="info"
                                    startIcon={<CloudDownloadIcon />}
                                >
                                    Sample File Download
                                </Button>
                            </a>

                            <Box>
                                {!loading &&
                                    <Box>
                                        <Button color="error" variant="contained" sx={{ mr: 3 }}
                                            onClick={() => setOpenDialog(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit"
                                            color="success" variant="contained"
                                        >
                                            Submit
                                        </Button>
                                    </Box>
                                }
                                <Typography id="uploading">
                                    {`Importing: ${uploadingRecord.name}`}
                                    {`Remaining: ${uploadingRecord.count}`}
                                </Typography>
                                {uploadingRecord.skip &&
                                    <Typography id="uploading">
                                        {`Skipping: ${uploadingRecord.name}`}
                                    </Typography>
                                }
                                <Toast alerting={toastInfo.toastAlert}
                                    severity={toastInfo.toastSeverity}
                                    message={toastInfo.toastMessage}
                                />
                            </Box>
                        </Box>
                    </form>
                </Box>
                {loading === true ? <Loader /> : null}
            </Dialog>
        </div >
    );
}

ImportComponent.propTypes = {
    setOpenDialog: PropTypes.func,
    openDialog: PropTypes.bool
};

export default ImportComponent;
