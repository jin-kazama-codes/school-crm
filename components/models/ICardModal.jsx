/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from "prop-types";
import { usePDF } from 'react-to-pdf';

import { Avatar, Box, Button, Card, CardContent, CardMedia, Dialog, DialogActions, Grid, IconButton } from '@mui/material';
import { List, ListItem, ListItemText, TextField, Tooltip, useMediaQuery } from '@mui/material';
import { green, blue, red, grey } from '@mui/material/colors';
import { useTheme } from '@mui/material/styles';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';

import './styles.css';
import API from '../../apis';

import { tokens } from "../../theme";
import { Utility } from '../utility';

import idCard from "../assets/idCard.png"

const ENV = process.env;

const ICardModal = ({ iCardDetails, setICardDetails, previewStudent, openDialog, setOpenDialog }) => {
    const [signatureImage, setSignatureImage] = useState([]);
    const [signatureImageChange, setSignatureImageChange] = useState([]);
    const formClassesInRedux = useSelector(state => state.schoolClasses);
    const formSectionsInRedux = useSelector(state => state.schoolSections);

    const studentImageRef = useRef([]);
    const { toPDF, targetRef } = usePDF({ filename: 'document.pdf' });

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const stateName = document.getElementById("state");
    const cityName = document.getElementById("city");
    const { appendSuffix, findById } = Utility();

    const className = findById(iCardDetails?.class, formClassesInRedux?.listData)?.class_name;
    const sectionName = findById(iCardDetails?.section, formSectionsInRedux?.listData)?.section_name;

    const readImageFiles = (file, onReadComplete) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            onReadComplete(reader.result);
        }
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        if (openDialog) {
            API.SchoolAPI.getDetailsForICard()
                .then(data => {
                    if (data.status === 'Success') {
                        setICardDetails({
                            ...iCardDetails,
                            schoolData: data.data[0]
                        });
                    } else {
                        console.log("Error Fetching School Data, Please Try Again");
                    }
                })
                .catch(err => {
                    console.log("Error Fetching SchoolData:", err);
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openDialog]);
    
    return (
        <Dialog
            fullScreen={fullScreen}
            open={openDialog}
            aria-labelledby="responsive-dialog-title"
            id="dialog"
            sx={{
                "&.MuiDialog-container": {
                    height: "102% !important"
                },
                // backgroundColor: grey[100],
                backdropFilter: "blur(3px)"
            }}
        >
            <Card ref={targetRef} sx={{ width: '350px', margin: 'auto', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)', borderRadius: '0px', backgroundImage:`url(${idCard})` }}>
                <Box
                    sx={{
                        display: "grid", gridTemplateColumns: '0.3fr 1fr',
                        backgroundColor: "#2591ea", color: '#f6f6f2', borderRadius: '0 0 20px 20px', padding: '10px'
                    }}
                >
                    <Avatar sx={{
                        bgcolor: green[500], height: '60px', width: '60px', justifySelf: 'center', alignSelf: 'center'
                    }}
                        aria-label="student-id-card">
                        <img src="/path/to/logo.png" alt="School Logo" style={{ width: '100%' }} />
                    </Avatar>
                    <div style={{ display: 'flex', flexWrap: "wrap", alignItems: 'center',flexDirection:"column" }}>
                        <p className='heading-text' style={{ textAlign: "left", fontSize: '18px', margin: '0' }}>
                            {iCardDetails?.schoolData?.name}
                        </p>
                        <p className='normal-text' style={{ margin: '0', fontSize: '14px' }}>
                            {iCardDetails?.schoolData?.registered_by}
                        </p>
                    </div>
                    <p className='normal-text' style={{ gridColumn: 'span 2', textAlign: 'center', marginTop: '10px', fontSize: '12px' }}>
                        {iCardDetails?.schoolData ? `${iCardDetails.schoolData.street}
                     ${iCardDetails.schoolData.landmark} ${iCardDetails.schoolData.city} ${iCardDetails.schoolData.state}
                      ${iCardDetails.schoolData.country}-${iCardDetails.schoolData.zipcode}` : ''}
                    </p>
                </Box>
                <CardMedia
                    component="img"
                    className='student-image'
                    image={previewStudent[0]?.value}
                    alt="student-image"
                    sx={{ borderRadius: '10px 10px 0 0' }}
                />
                <CardContent sx={{ padding: '10px' }}>
                    <List sx={{ width: '100%', padding: '0', bgcolor: 'transparent' }}>
                        <ListItem sx={{ padding: '0' }}>
                            <ListItemText
                                className='primary-text'
                                primary={iCardDetails?.firstname && iCardDetails?.lastname &&
                                    `${iCardDetails.firstname} ${iCardDetails.lastname}`}
                                primaryTypographyProps={{
                                    fontSize: '18px', fontWeight: '700', color: colors.blueAccent[500]
                                }}
                            />
                        </ListItem>
                        <ListItem sx={{ padding: "0" }}>
                            <ListItemText
                                className='primary-text'
                                primary={iCardDetails?.session}
                                primaryTypographyProps={{
                                    fontSize: '16px', fontWeight: '700', color: colors.blueAccent[500], margin: '-6px 0 8px 0'
                                }}
                            />
                        </ListItem>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', columnGap: '10px', rowGap: '5px' }}>
                            <span className='heading-text'> Father&apos;s Name: </span>
                            <span className='normal-text'> {iCardDetails?.father_name?.charAt(0)?.toUpperCase() + iCardDetails?.father_name?.slice(1) ? iCardDetails?.father_name?.charAt(0)?.toUpperCase() + iCardDetails?.father_name?.slice(1) : iCardDetails?.gaurdian?.charAt(0)?.toUpperCase() + iCardDetails?.gaurdian?.slice(1)} </span>

                            <span className='heading-text'>Class:</span>
                            <span className='normal-text'>{className ? `${appendSuffix(className)} ${sectionName}` : ''}</span>

                            <span className='heading-text'>DOB:</span>
                            <span className='normal-text'>{iCardDetails.dob ? iCardDetails.dob.format('YYYY-MM-DD') : ''}</span>

                            <span className='heading-text'>Phone:</span>
                            <span className='normal-text'>{iCardDetails.contact_no ? iCardDetails.contact_no : ''}</span>

                            <span className='heading-text'>Address:</span>
                            <span className='normal-text'>{`${iCardDetails?.street} ${iCardDetails?.landmark} ${iCardDetails?.studentCity ? iCardDetails.studentCity : cityName?.innerText}
                            ${iCardDetails?.studentState ? iCardDetails.studentState : stateName?.innerText} India-${iCardDetails?.zipcode}`}</span>
                        </Box>
                    </List>
                </CardContent>

                <Grid container>
                    {signatureImageChange.length ? null :
                        <Grid item xs={12}>
                            <TextField
                                accept="image/*, application/pdf"
                                label="Upload Digital Signature"
                                value={undefined}
                                size="small"
                                sx={{ m: 1, ml: 2, outline: "none", width: '41%' }}
                                InputProps={{
                                    startAdornment: (
                                        <IconButton component="label" sx={{ width: "90%" }}>
                                            <AddPhotoAlternateIcon />
                                            <input
                                                hidden
                                                type="file"
                                                name="file"
                                                onChange={e => setSignatureImage(e.target.files)}
                                            />
                                        </IconButton>
                                    )
                                }}
                            />
                        </Grid>}
                    {!signatureImageChange.length ? null :
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
                            <IconButton
                                sx={{
                                    position: "absolute",
                                    left: "86%",
                                    '@media screen and (max-width: 920px)': {
                                        left: '76%',
                                    },
                                    '@media screen and (max-width: 480px)': {
                                        left: '59%',
                                    },
                                    top: "6%"
                                }}
                                onClick={() => {
                                    setSignatureImage([]);
                                    setSignatureImageChange([]);
                                }}
                            >
                                <Tooltip title="DELETE">
                                    <HighlightOffOutlinedIcon sx={{
                                        fontSize: "16px",
                                        color: "#002147",
                                        "&:hover": {
                                            color: red[500], fontSize: "20px", transition: "all 0.3s ease-in-out"
                                        }
                                    }}
                                    />
                                </Tooltip>
                            </IconButton>
                            <CardMedia
                                component="img"
                                image={signatureImageChange}
                                alt='principal-signature'
                                sx={{
                                    height: '50px', width: '130px', margin: '10px 20px 0 0'
                                }}
                            />
                        </Grid>}
                    <Grid item xs={12}>
                        <p className='heading-text' style={{ margin: '0 50px 20px 0', fontSize: '15px' }}> Principal </p>
                    </Grid>
                </Grid>
            </Card>
            <DialogActions sx={{ padding: '8px 12px', justifyContent: 'space-between' }}>
                <Button color='info' variant='contained'
                    onClick={() => toPDF()}
                >
                    Download
                </Button>
                <Button color='warning' variant='outlined'
                    onClick={() => setOpenDialog(false)}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog >
    );
};

ICardModal.propTypes = {
    iCardDetails: PropTypes.object,
    setICardDetails: PropTypes.func,
    setOpenDialog: PropTypes.func,
    openDialog: PropTypes.bool
};

export default ICardModal;
