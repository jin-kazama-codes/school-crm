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
import { saveAs } from 'file-saver';
import { read, utils, write } from 'xlsx';

import PropTypes from "prop-types";

import { Box, Divider, IconButton, Typography, List, ListItem } from "@mui/material";
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
    const [teachers, setTeacher] = useState([]);
    const [fileName, setFileName] = useState('');
    const [uploadingRecord, setUploadingRecord] = useState({});
    const [loading, setLoading] = useState(false);
    const [skipped, setSkipped] = useState(true);
    const [skippedTeachers, setSkippedTeachers] = useState([]);
    const selected = useSelector(state => state.menuItems.selected);
    const toastInfo = useSelector(state => state.toastInfo);

    const { typography } = themeSettings(theme.palette.mode);
    const { getStateCityFromZipCode, toastAndNavigate, generateNormalPassword, getLocalStorage, formateName } = Utility();
    const dispatch = useDispatch();
    const navigateTo = useNavigate();

    const schoolInformation = getLocalStorage("auth");

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
                    setTeacher(rows);
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
            return null;
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
        if (teachers?.length) {

            const promises = teachers.map(async (teacher) => {
                try {
                    setLoading(true);
                    const apiResponse = await getStateCityFromZipCode(teacher.zipcode);

                    const cityName = await apiResponse.city;
                    const stateName = await apiResponse.state;
                    const teacherDobSerial = teacher.dob;
                    // const teacherAddmissionSerial = teacher.admission_date;

                    const state_id = await getIdByName(stateName, API.StateAPI);
                    const city_id = await getIdByName(cityName, API.CityAPI);

                    const class_id = teacher.class ? await getIdByName(teacher.class, API.ClassAPI) : null;
                    const section_id = teacher.section ? await getIdByName(teacher.section, API.SectionAPI) : null;

                    const teacherDob = await excelSerialToDate(teacherDobSerial);

                    const isClassTeacher = teacher.is_class_teacher == "yes" ? 1 : 0;

                    const username = await formateName(teacher?.firstname || teacher?.lastname);
                    if (username && teacher.zipcode && teacher.contact_no) {
                        const password = await generateNormalPassword(username, schoolInformation.school_code);

                        const { data: user, status } = await API.CommonAPI.createOrUpdate({
                            username: username,
                            password: password.replace(/ /g, ""),
                            email: teacher?.email,
                            contact_no: teacher?.contact_no,
                            role: 4,
                            designation: 'teacher',
                            status: 'active'
                        }, 'user', {
                            designation: 'teacher',
                            username: username,
                            email: teacher.email,
                            contact_no: teacher.contact_no
                        });

                        if (status === 'Success') {
                            API.CommonAPI.createOrUpdate({
                                parent_id: user.id,
                                parent: 'user',
                                street: teacher.street,
                                landmark: teacher.landmark,
                                zipcode: teacher.zipcode,
                                state: state_id,
                                city: city_id,
                                country: 2
                            }, 'address', {
                                parent: 'user',
                                parent_id: user.id
                            });

                            let condition = {
                                parent_id: user.id,
                                firstname: teacher.firstname
                            }
                            const { data: tea } = await API.CommonAPI.createOrUpdate({
                                ...teacher,
                                parent_id: user.id,
                                is_class_teacher: isClassTeacher,
                                class: class_id,
                                section: section_id,
                                status: 'active',
                                dob: teacherDob ? teacherDob.replace(/\//g, "-") : null,

                            }, 'teacher', condition);

                            API.CommonAPI.createOrUpdate({
                                parent_id: tea.id,
                                parent: 'teacher',
                                street: teacher.street,
                                landmark: teacher.landmark,
                                zipcode: teacher.zipcode,
                                state: state_id,
                                city: city_id,
                                country: 2
                            }, 'address', {
                                parent: 'teacher',
                                parent_id: tea.id
                            });
                            setUploadingRecord({
                                ...uploadingRecord,
                                count: uploadingRecord.count--,
                                name: teacher.firstname,
                                skip: false
                            });
                            setSkipped(false);
                        }
                    } else {
                        let fieldsObj = {
                            username,
                            email: teacher.email,
                            zipcode: teacher.zipcode
                        }
                        let emptyField;
                        Object.keys(fieldsObj).map(field => {
                            if (!fieldsObj[field]) {
                                emptyField = field;
                            }
                        });
                        setUploadingRecord({
                            ...uploadingRecord,
                            count: uploadingRecord.count--,
                            name: teacher.firstname,
                            skip: true
                        });
                        setSkippedTeachers(prevSkipped => [...prevSkipped, {
                            firstname: teacher?.firstname,
                            contact_no: teacher?.contact_no,
                            email: teacher?.email,
                            street: teacher?.street,
                            zipcode: teacher?.zipcode,
                            dob: teacher?.dob,
                            error: emptyField
                        }]);
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
                    toastAndNavigate(dispatch, true, "success", "Successfully Created", navigateTo, 0);
                })
                .catch(error => {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "error", error ? error?.response?.data?.msg : "An Error Occurred", navigateTo, 0);
                    console.log("At least one operation failed:", error);
                })
        }

    }, [teachers?.length]);

    useEffect(() => {
        if (!skippedTeachers.length && !loading && !skipped) {
            location.reload();
        }
    }, [skippedTeachers.length, loading, skipped]); // 0

    const downloadSkippedTeachers = () => {
        const skipped = [];
        skippedTeachers.map(skp => {
            if (skp.error) {
                delete skp.error;
            }
            skipped.push(skp);
        })

        const worksheet = utils.json_to_sheet(skippedTeachers);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Skipped Teachers');
        const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, 'skipped_Teachers.xlsx');
    };

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
                    {`Import ${selected}s`}
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: 2,
                        fontFamily: 'Arial, sans-serif',
                    }}
                >
                    {loading && (
                        <Typography sx={{ fontSize: '1.5em', color: '#555' }}>Loading...</Typography>
                    )}
                    {!loading && skippedTeachers.length > 0 && (
                        <Box
                            sx={{
                                textAlign: 'center',
                                border: '1px solid #ddd',
                                padding: 2,
                                borderRadius: 1,
                                backgroundColor: "transparent",
                                width: '100%',
                                maxWidth: 600,
                            }}
                        >
                            <Typography variant="h2" sx={{ marginBottom: 2, color: '#333' }}>
                                Skipped Teachers
                            </Typography>
                            <List sx={{ padding: 0 }}>
                                {skippedTeachers.map((teacher, index) => (
                                    <ListItem
                                        key={index}
                                        sx={{ marginBottom: 1, fontSize: '1.2em', color: '#666' }}
                                    >
                                        {teacher.firstname} - Missing {teacher.error}
                                    </ListItem>
                                ))}
                            </List>
                            <Button onClick={downloadSkippedTeachers} variant="contained" color="error" sx={{ marginTop: 2, boxShadow: "3px 3px 1px black, -3px -3px 1px black,3px -3px 1px black, -3px 3px 1px black" }}>
                                Download Skipped Teachers Excel
                            </Button>
                        </Box>
                    )}
                </Box>

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

                            <a href="https://ufile.io/dkv9szf1" target="_blank">
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
