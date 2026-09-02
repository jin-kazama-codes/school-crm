/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";

import {
  Avatar,
  Box,
  Divider,
  useTheme,
  IconButton,
  Tooltip,
  MenuItem,
} from "@mui/material";
import {
  Autocomplete,
  Paper,
  Menu,
  ListItemIcon,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";

import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import Logout from "@mui/icons-material/Logout";
import LockResetIcon from "@mui/icons-material/LockReset";
import * as React from "react";

import API from "../../apis";
import ChangePwModal from "../models/ChangePwModal";
import "./index.css"

import { setAllSchools } from "../../redux/actions/SchoolAction";
import { ColorModeContext, tokens } from "../../theme";
import { Utility } from "../utility";
import { useNavigate } from "@/lib/routerAdapter";
import { red } from "@mui/material/colors";

const Topbar = ({ roleName = null, rolePriority = null, isCollapsed, setIsCollapsed, schoolInfo }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [isOpen, setIsOpen] = useState(true);
  const [changePwModalOpen, setChangePwModalOpen] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [schoolObj, setSchoolObj] = useState({});
  const allSchools = useSelector((state) => state.allSchools);

  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const isMobile = useMediaQuery("(max-width:480px)");
  const isTab = useMediaQuery("(max-width:920px)");

  const {
    fetchAndSetAll,
    getInitials,
    getNameAndType,
    getLocalStorage,
    remLocalStorage,
    setLocalStorage,
  } = Utility();
  const { username, role } = getNameAndType(roleName);
  

  const CustomOption = {
    id: null,
    name: "All Schools",
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigateTo("/login", { replace: true });
    location.reload();
  };

  useEffect(() => {
    if (getLocalStorage("auth")) {
      setSchoolName(getLocalStorage("auth")?.school);
    }
  }, [getLocalStorage("auth")]);

  //on refresh autocomplete state gets empty so doing this
  useEffect(() => {
    if (schoolInfo?.encrypted_id) {
      API.CommonAPI.decryptText(schoolInfo).then((result) => {
        if (result.status === "Success") {
          const filteredSchool = allSchools?.listData.find(
            (value) => value.id === parseInt(result.data)
          );
          setSchoolObj({
            id: filteredSchool?.id,
            name: filteredSchool?.name,
          });
        } else if (result.status === "Error") {
          console.log("Error Encrypting Data");
        }
      });
    }
  }, [schoolInfo?.encrypted_id, allSchools?.listData]);

  useEffect(() => {
    if (!allSchools?.listData?.length) {
      fetchAndSetAll(dispatch, setAllSchools, API.SchoolAPI);
    }
  }, []);

  useEffect(() => {
    // Set up the timeout to close the tooltip after 6 seconds
    const timeoutId = setTimeout(() => {
      setIsOpen(false);
    }, 6000);

    // Cleanup function to clear the timeout
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          textAlign: "center",
          justifyContent: "space-between",
          backgroundColor:
            theme.palette.mode === "light" ? "white !important" : "#141b2d",
          boxShadow: "1px 1px 10px black",
          position: "sticky",
          top: "0px",
          zIndex: 1000,
        }}
      >
        {/* ICONS */}
        {isMobile &&
          <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
            <MenuOutlinedIcon sx={{ marginLeft: "15px" }} />
          </IconButton>
        }
        {rolePriority == 1 && !isMobile &&
          <Box></Box>
        }
        {schoolName && rolePriority !== 1 &&
          <Box>
            <Typography
              sx={{
                m: "20px",
                fontSize: isMobile ? "15px" : isTab ? "30" : "40px",
                fontWeight: "bolder",
                textAlign: "center",
                textShadow: " 2px 8px 10px #aba8a8;",
                color:
                  theme.palette.mode === "light"
                    ? `rgb(51 153 254) !important`
                    : "white",
                wordSpacing: "5px",
              }}
            >
              {schoolName}
            </Typography>
          </Box>
        }
        <Box
          sx={{
            display: "flex",
            textAlign: "center",
            justifyContent: "flex-end",
            p: 2,
            backgroundColor:
              theme.palette.mode === "light" ? "white !important" : "#141b2d",
          }}
        >
          {rolePriority === 1 && (
            <Tooltip
              title="Select School"
              placement="left-start"
              open={isOpen && allSchools?.listData?.length > 0}
              arrow
              slotProps={{
                arrow: {
                  sx: {
                    color: "#f50057",

                  }
                },
                tooltip: {
                  sx: {
                    animation: 'blinking 1s infinite',
                    backgroundColor: "#f50057",
                    color: "#ffffff",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                    fontSize: "14px",
                    fontWeight: "bold",
                    letterSpacing: "0.5px"
                  }
                }
              }}
            >
              <Autocomplete
                options={[CustomOption, ...(allSchools?.listData || [])]}
                getOptionLabel={(option) => option.name || ""}
                disableCloseOnSelect
                value={schoolObj}
                onChange={(event, value) => {
                  if (value && value.id === null) {
                    remLocalStorage("schoolInfo");
                    location.reload();
                  }
                  setSchoolObj({
                    id: value.id,
                    name: value.name,
                  });
                  API.CommonAPI.encryptText({ data: value?.id }).then(
                    (result) => {
                      if (result.status === "Success") {
                        setLocalStorage("schoolInfo", result.data);
                        location.reload();
                      } else if (result.status === "Error") {
                        console.log("Error Encrypting Data");
                      }
                    }
                  );
                }}
                sx={{ width: isMobile ? "150px" : "280px", marginRight: "0px" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select School"
                    sx={{
                      fieldset: {
                        boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
                        borderRadius: "50px",
                      },
                    }}
                  />
                )}
                slotProps={{
                  paper: {
                    sx: {
                      background:
                        theme.palette.mode === "light"
                          ? `#6ac6ff !important`
                          : "black",
                      borderRadius: "10px",
                      boxShadow:
                        "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;",
                      color: colors.redAccent[400],
                      fontSize: "25px",
                      "&:hover": {
                        border: "1px solid #00FF00",
                        color: "gray",
                        backgroundColor: "white !important",
                      },
                      width: isMobile ? "150px" : "280px"
                    }
                  }
                }}
              />
            </Tooltip>
          )}

          <IconButton onClick={colorMode.toggleColorMode}>
            {theme.palette.mode === "dark" ? (
              <Tooltip title="Dark Mode">
                <DarkModeOutlinedIcon />
              </Tooltip>
            ) : (
              <Tooltip title="Light Mode">
                <LightModeOutlinedIcon />
              </Tooltip>
            )}
          </IconButton>
          {/* <Tooltip title="Notifications">
            <IconButton>
              <NotificationsOutlinedIcon />
            </IconButton>
          </Tooltip> */}
          {/* <Tooltip title="Settings">
          <IconButton>
            <SettingsOutlinedIcon />
          </IconButton>
        </Tooltip>
        <PersonOutlinedIcon /> */}
          <Tooltip title="Account">
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{ ml: 1 }}
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <Avatar
                sx={{
                  padding: "2px",
                  width: 36,
                  height: 33,
                  bgcolor: colors.grey[100],
                }}
              >
                {getInitials()}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem onClick={handleClose} sx={{ flexDirection: "column" }}>
            <Box textAlign="center">
              <Typography
                variant="h3"
                color={colors.blueAccent[300]}
                fontWeight="bold"
                sx={{ m: "10px 0 4px 0" }}
              >
                {username}
              </Typography>
              <Typography variant="h5" color={colors.greenAccent[1000]}>
                {" "}
                {role}{" "}
              </Typography>
            </Box>
          </MenuItem>

          <Divider />
          <MenuItem
            onClick={() => setChangePwModalOpen(true)}
            sx={{ color: colors.blueAccent[300], justifyContent: "center" }}
          >
            <ListItemIcon>
              <LockResetIcon
                sx={{ color: colors.blueAccent[300], fontSize: "22px" }}
              />
            </ListItemIcon>
            <Typography variant="h5"> Change Password </Typography>
          </MenuItem>

          <Divider />
          <MenuItem
            onClick={handleSignOut}
            sx={{ color: colors.blueAccent[300] }}
          >
            <ListItemIcon>
              <Logout
                fontSize="medium"
                sx={{ color: colors.blueAccent[300] }}
              />
            </ListItemIcon>
            <Typography variant="h5"> Logout </Typography>
          </MenuItem>
        </Menu>
      </Box>
      <ChangePwModal
        openDialog={changePwModalOpen}
        setOpenDialog={setChangePwModalOpen}
      />
    </>
  );
};

Topbar.propTypes = {
  roleName: PropTypes.string,
  rolePriority: PropTypes.number,
};

export default Topbar;
