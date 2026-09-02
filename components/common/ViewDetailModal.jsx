/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React from 'react';
import PropTypes from "prop-types";

import { Card, CardContent, CardMedia, Dialog, Typography, Divider, CardHeader, Avatar, Box, IconButton, useTheme } from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

import '../models/styles.css';

import { Utility } from '../utility';

import listBg from "../assets/listBG.jpg";

const ENV = process.env;
const { capitalizeEveryWord } = Utility();

const ViewDetailModal = ({
  open,
  setOpen,
  title,
  name,
  horizontalData,
  verticalData,
  detail, // for address and image
  countryData,
  stateData,
  cityData
}) => {
  const theme = useTheme();
  const { findById } = Utility();

  const countryName = findById(detail?.addressData?.country, countryData)?.name;
  const stateName = findById(detail?.addressData?.state, stateData)?.name;
  const cityName = findById(detail?.addressData?.city, cityData)?.name;

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      BackdropProps={{
        style: {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          opacity: 0.5
        }
      }}
      fullWidth
      maxWidth='md'
    >
      <Card
        sx={{
          backgroundImage: theme.palette.mode === "light"
            ? `linear-gradient(rgb(151 203 255 / 80%), rgb(151 203 255 / 80%)), url(${listBg})`
            : `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${listBg})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover"
        }}
      >
        <CardHeader
          avatar={
            <Avatar sx={{ background: "darkcyan", fontFamily: 'Times New Roman' }} aria-label="recipe">
              i
            </Avatar>
          }
          action={
            <IconButton aria-label="settings" onClick={handleClose} sx={{ padding: "13px" }}>
              <CloseOutlinedIcon />
            </IconButton>
          }
          title={<Typography variant="h3" component="h2" sx={{ fontWeight: 'bold' }}>{title}</Typography>}
          sx={{ backgroundColor: "cyan", margin: "5px", borderRadius: "5px" }}
        />
        <CardContent>
          <CardMedia
            component="img"
            height="230"
            image={`${detail?.imageData && detail?.imageData[0]?.image_src}`}
            alt={name}
            sx={{ width: "200px", float: "left", margin: "20px", border: "1px dotted black" }}
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "10px" }}>

            {Object.keys(horizontalData).map((key, index) => (
              horizontalData[key] && (
                <React.Fragment key={index}>
                  <span className='heading-text1'>{key.replace(/_/g, ' ')}:</span>
                  <span className='normal-text1'>{capitalizeEveryWord(horizontalData[key])}</span>
                </React.Fragment>
              )
            ))}

            <span className='heading-text1'>Address:</span>
            <span className='normal-text1'>{detail?.addressData?.street}, {detail?.addressData?.landmark}, {cityName}, {stateName}, {countryName} - {detail?.addressData?.zipcode}</span>
          </Box>

          <Divider sx={{ margin: "10px" }} />

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', columnGap: '10px', rowGap: '5px' }}>

            {Object.keys(verticalData).map((key, index) => (
              verticalData[key] && (
                <React.Fragment key={index}>
                  <span className='heading-text1'>{key.replace(/_/g, ' ')}:</span>
                  <span className='normal-text1'>{capitalizeEveryWord(verticalData[key])}</span>
                </React.Fragment>
              )
            ))}

          </Box>
        </CardContent>
      </Card>
    </Dialog>
  );
};

ViewDetailModal.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  title: PropTypes.string,
  name: PropTypes.string,
  horizontalData: PropTypes.object.isRequired,
  verticalData: PropTypes.object.isRequired,
  detail: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  countryData: PropTypes.array.isRequired,
  stateData: PropTypes.array.isRequired,
  cityData: PropTypes.array.isRequired
};

export default ViewDetailModal;
