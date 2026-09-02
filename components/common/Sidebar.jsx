/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "@/lib/routerAdapter";
import PropTypes from "prop-types";
import { Sidebar as ProSidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";

import {
  Box,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import SchoolIcon from "@mui/icons-material/School";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import EventIcon from "@mui/icons-material/Event";
import PaymentIcon from "@mui/icons-material/Payment";
import FitbitIcon from "@mui/icons-material/Fitbit";
import CoPresentIcon from "@mui/icons-material/CoPresent";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import CategoryIcon from "@mui/icons-material/Category";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import EngineeringIcon from "@mui/icons-material/Engineering";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import HourglassBottomTwoToneIcon from "@mui/icons-material/HourglassBottomTwoTone";
import EmojiFlagsRoundedIcon from "@mui/icons-material/EmojiFlagsRounded";

import API from "../../apis";
import {
  setAllClasses,
  setSchoolClasses,
} from "../../redux/actions/ClassAction";
import { SidebarItem } from "./SidebarItem";
import { tokens } from "../../theme";
import { Utility } from "../utility";

import "./index.css";
import companyImg from "../assets/eden.jpg";
import dpsImg from "../assets/schoolImg.jpg";

const Sidebar = ({ rolePriority, isCollapsed, setIsCollapsed, schoolInfo }) => {

  const [isSubMenuOpen, setIsubMenuOpen] = useState(false);
  const [schoolId, setSchoolId] = useState(null);
  const [schoolImg, setSchoolImg] = useState(null);

  const selected = useSelector((state) => state.menuItems.selected);
  const schoolClasses = useSelector((state) => state.schoolClasses);
  const allClasses = useSelector((state) => state.allClasses);

  const dispatch = useDispatch();
  const location = useLocation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery("(max-width:480px)");
  const isTab = useMediaQuery("(max-width:920px)");
  const {
    fetchAndSetAll,
    fetchAndSetSchoolData,
    getLocalStorage,
    remLocalStorage,
    addClassKeyword,
  } = Utility();
  const classData =
    (schoolClasses?.listData.length
      ? schoolClasses.listData
      : allClasses?.listData) || [];

      console.log(schoolClasses,"schoolClasses>>>")

  const closeSubMenu = () => {
    if (isSubMenuOpen) {
      setIsubMenuOpen(false);
    }
  };

  useEffect(() => {
    const schoolInfo = getLocalStorage("schoolInfo");
  
    if (!schoolInfo && (!allClasses || !allClasses.listData || allClasses.listData.length === 0)) {
      fetchAndSetAll(dispatch, setAllClasses, API.ClassAPI);
    } else if (schoolInfo && (!schoolClasses || !schoolClasses.listData || schoolClasses.listData.length === 0)) {
      fetchAndSetSchoolData(dispatch, setSchoolClasses);
    }
  }, [(!allClasses || !allClasses.listData || allClasses.listData.length === 0), (!schoolClasses || !schoolClasses.listData || schoolClasses.listData.length === 0)]);
  
  // Ensure fetchAndSetAll and fetchAndSetSchoolData do not cause unnecessary re-renders.
  

  useEffect(() => {
    // const regex = /^\d+/;
    if (!location.pathname.startsWith("/student/")) {
      getLocalStorage("class") ? remLocalStorage("class") : null;
    }
  }, [location.pathname]);

  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  useEffect(() => {
    setIsCollapsed(isTab);
  }, [isTab]);

  useEffect(() => {
    if (schoolInfo?.encrypted_id) {
      API.CommonAPI.decryptText(schoolInfo).then((result) => {
        if (result.status === "Success") {
           setSchoolId(parseInt(result?.data));
        } else if (result.status === "Error") {
          console.log("Error Encrypting Data");
        }
      });
    }
  }, [schoolInfo?.encrypted_id]);


  useEffect(()=>{
    if(schoolId !== null){
       API.ImageAPI.getImage("school", schoolId )
       .then(res =>{
          setSchoolImg(res.data[0].image_src);
       })
    }
  },[schoolId]);
  
  console.log("dataaaaareschool>>>",schoolImg);


  const renderNotCollapsedStudents = () => {
    console.log(" classData?.length>>", classData);
    return (
      classData?.length &&
      classData.map((classs) => (
        <SidebarItem
          key={classs.class_id}
          title={`${addClassKeyword(classs.class_name)}`}
          to={`/student/listing/${classs.class_id}`}
          icon={
            <SchoolIcon
              sx={{
                verticalAlign: "sub",
                marginLeft: "-1px",
                marginRight: "5px",
              }}
            />
          }
          selected={selected}
          rolePriority={rolePriority}
          menuVisibility={5}
          isSubMenu={true}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      ))
    );
  };

  const mapping = {
    "Pre Nursery": "PN",
    Nursery: "N",
    "Upper Kindergarten": "UKG",
    "Lower Kindergarten": "LKG",
  };

  const renderCollapsedStudents = () => {
    return (
      classData?.length &&
      classData.map((classs) => (
        <SidebarItem
          key={classs.class_id}
          to={`/student/listing/${classs.class_id}`}
          icon={<span>{mapping[classs.class_name] || classs.class_name}</span>}
          selected={selected}
          rolePriority={rolePriority}
          menuVisibility={5}
          isSubMenu={true}
        />
      ))
    );
  };

  // const getSchoolImage = () => {
  //   API.ImageAPI.getSchoolImage('school')
  //     .then(({ data: res }) => {
  //       console.log(res, 'response')
  //     })
  //     .catch(err => {
  //       console.log('error fetching image in sidebar', err);
  //     });
  // };  to be done

  return (
    <Box
      sx={{
        height: "100%",
        "& .pro-sidebar.collapsed": {
          display: isMobile ? "none" : "block",
        },
        "& .pro-sidebar": {
          position: isMobile ? "fixed" : "static",
          height: "100% !important",
          animation: "fade-in-left 0.5s cubic-bezier(0.390, 0.575, 0.565, 1.000) both",
        },
        "@keyframes fade-in-left": {
          "0%": {
            WebkitTransform: "translateX(-50px)",
            transform: "translateX(-50px)",
            opacity: 0,
          },
          "100%": {
            WebkitTransform: "translateX(0)",
            transform: "translateX(0)",
            opacity: 1,
          },
        },
        "& .pro-sidebar-inner": {
          background:
            theme.palette.mode === "light" ? `#6ac6ff !important` : "black",
          boxShadow: "inset -5px 0 10px rgba(0, 0, 0, 0.3)",
          overflow: isMobile ? "hidden" : "",
        },
        "& .pro-icon-wrapper": {
          backgroundColor: `transparent !important`,
        },
        "& .pro-inner-item": {
          color: theme.palette.mode === "light" ? `darkblue !important` : "",
          padding: `4px 35px 4px 15px !important`,
        },
        "& .pro-sidebar .pro-menu-item.active a::before": {
          content: `''`,
          position: "absolute",
          top: "-50px",
          right: "0px",
          bottom: "100px",
          left: "195px",
          backgroundColor: "transparent",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          pointerEvents: "none",
          boxShadow:
            theme.palette.mode === "light"
              ? "35px 35px 0 10px white"
              : "35px 35px 0 10px #141b2d",
        },
        " .pro-sidebar .pro-menu-item.active a::after": {
          content: `''`,
          position: "absolute",
          bottom: "-50px",
          right: "0px",
          top: "43px",
          left: "195px",
          backgroundColor: "transparent",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          pointerEvents: "none",
          boxShadow:
            theme.palette.mode === "light"
              ? "35px -35px 0 10px white"
              : "35px -35px 0 10px #141b2d",
        },
        "& .pro-menu-item.active": {
          color: `#868dfb !important`,
          backgroundColor:
            theme.palette.mode === "light" ? `white !important` : "#141b2d",
          borderRadius: " 20px 0 0px 20px;",
          boxShadow: "1px 1px 7px black",
          marginTop: "5px",
        },
        "& .pro-menu-item:hover": {
          color:
            theme.palette.mode === "light"
              ? `#868dfb !important`
              : `black !important`,
          backgroundColor:
            theme.palette.mode === "light" ? `white !important` : "#141b2d",
          borderRadius: " 20px 0 0px 20px;",
          boxShadow: "1px 1px 7px black",
        },
        "& .pro-sidebar .pro-menu .pro-menu-item .pro-inner-item:hover": {
          color: "white",
        },
        "& .pro-menu-item a.active": {
          color: theme.palette.mode === "light" ? `darkblue !important` : "",
        },
        "& .pro-arrow-wrapper": {
          marginRight: "50px",
        },
        "& .pro-menu-item.pro-sub-menu": {
          color: `${colors.primary[100]}`,
        },
        "& .pro-inner-list-item": {
          height: `${isSubMenuOpen ? "115px" : "0"}` + " !important",
          overflowY: isSubMenuOpen ? "scroll" : "hidden",
          overflowX: "hidden",
          transition: "height 0.3s ease-in-out !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square" onClick={(event) => closeSubMenu(event)}>
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              color: colors.grey[100],
              margin: isMobile
                ? `10px 0px 10px 0`
                : `10px 0px 10px 20px !important`,
            }}
          >
            {!isCollapsed && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  ml: "5px",
                }}
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  {rolePriority > 1
                    ? getLocalStorage("auth")
                      ?.designation?.charAt(0)
                      ?.toUpperCase() +
                    getLocalStorage("auth")?.designation?.slice(1)
                    : "The Skolar"}
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {/* USER */}
          {!isCollapsed && (
            <Box sx={{ mb: "15px" }}>
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <img
                  alt="profile-user"
                  src={rolePriority > 1 ? schoolImg ? schoolImg : (dpsImg?.src || dpsImg) : (dpsImg?.src || dpsImg)}
                  style={{ cursor: "pointer", borderRadius: "50%", width: "60%", filter: 'drop-shadow(1px 1px 5px black)' }}
                />
              </Box>
            </Box>
          )}

          {/* MENU ITEMS */}
          <Box sx={{ paddingLeft: isCollapsed ? undefined : "10%" }}>
            <SidebarItem
              title="Dashboard"
              to="/"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              rolePriority={rolePriority}
              menuVisibility={2}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
            <SidebarItem
              title="School"
              to="/school/listing"
              icon={<SchoolIcon />}
              selected={selected}
              rolePriority={rolePriority}
              menuVisibility={1}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
            {rolePriority < 5 ? (
              <Box>
                {isCollapsed && isSubMenuOpen ? (
                  <SubMenu
                    onClick={(event) => event.stopPropagation()}
                    title="Student"
                    icon={<PeopleOutlinedIcon />}
                  >
                    <SidebarItem
                      title="Student"
                      to="/student/listing"
                      icon={<PeopleOutlinedIcon />}
                      selected={selected}
                      rolePriority={rolePriority}
                      menuVisibility={5}
                      isSubMenu={true}
                      mt="5px"
                      isCollapsed={isCollapsed}
                      setIsCollapsed={setIsCollapsed}
                    />
                    {renderCollapsedStudents()}
                  </SubMenu>
                ) : (
                  <SubMenu
                    title="All Students"
                    onClick={(event) => {
                      isSubMenuOpen
                        ? setIsubMenuOpen(false)
                        : setIsubMenuOpen(true);
                      event.stopPropagation();
                    }}
                    open={isSubMenuOpen}
                    icon={<PeopleOutlinedIcon />}
                  >
                    <SidebarItem
                      title="Student"
                      to="/student/listing"
                      icon={<PeopleOutlinedIcon />}
                      selected={selected}
                      rolePriority={rolePriority}
                      menuVisibility={5}
                      isSubMenu={true}
                      isCollapsed={isCollapsed}
                      setIsCollapsed={setIsCollapsed}
                    />
                    {renderNotCollapsedStudents()}
                  </SubMenu>
                )}
              </Box>
            ) : (
              <SidebarItem
                title="Student"
                to="/student/listing"
                icon={<PeopleOutlinedIcon />}
                selected={selected}
                rolePriority={rolePriority}
                menuVisibility={5}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
              />
            )}
            <Divider />
            <SidebarItem
              title="Teacher"
              to="/teacher/listing"
              icon={<LocalLibraryIcon />}
              selected={selected}
              rolePriority={rolePriority}
              menuVisibility={3}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
            <SidebarItem
              title="User"
              to="/user/listing"
              icon={<AccountCircleIcon />}
              selected={selected}
              rolePriority={rolePriority}
              menuVisibility={3}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
            <SidebarItem
              title="Generate ID Card"
              to="/generate-id-card/listing"
              icon={<AnnouncementIcon />}
              selected={selected}
              rolePriority={rolePriority}
              menuVisibility={3}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
            <SidebarItem
              title="Employee"
              to="/employee/listing"
              icon={<AssignmentIndIcon />}
              selected={selected}
              rolePriority={rolePriority}
              menuVisibility={3}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
            <SidebarItem
              title="Payment"
              to="/payment/listing"
              icon={<PaymentIcon />}
              selected={selected}
              rolePriority={rolePriority}
              menuVisibility={3}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
            <SidebarItem
              title="Bus"
              to="/bus/listing"
              icon={<DirectionsBusIcon />}
              selected={selected}
              rolePriority={rolePriority}
              menuVisibility={3}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
            <SidebarItem
              title="Holiday"
              to="/holiday/listing"
              icon={<EventIcon />}
              selected={selected}
              rolePriority={rolePriority}
              menuVisibility={5}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
            <SidebarItem
              title="Marksheet"
              to="/marksheet/listing"
              icon={<FactCheckIcon />}
              selected={selected}
              rolePriority={rolePriority}
              menuVisibility={4}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
            <SidebarItem
              title="School House"
              to="/school-house/listing"
              icon={<EmojiFlagsRoundedIcon />}
              selected={selected}
              rolePriority={rolePriority}
              menuVisibility={4}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
            <SidebarItem
              title="Attendance"
              to="/attendance/listing"
              icon={<CoPresentIcon />}
              selected={selected}
              rolePriority={rolePriority}
              menuVisibility={4}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
            <SidebarItem
              title="School Duration"
              to="/school-duration/listing"
              icon={<HourglassBottomTwoToneIcon />}
              selected={selected}
              rolePriority={rolePriority}
              menuVisibility={4}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
            <SidebarItem
              title="Time Table"
              to="/time-table/listing"
              icon={<BackupTableIcon />}
              selected={selected}
              rolePriority={rolePriority}
              menuVisibility={4}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
            <SidebarItem
              title="Notice Board"
              to="/noticeboard/listing"
              icon={<AnnouncementIcon />}
              selected={selected}
              rolePriority={rolePriority}
              menuVisibility={3}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
            {rolePriority < 2 && (
              <>
                <Typography
                  variant="h6"
                  color={colors.grey[500]}
                  sx={{ m: "15px 0 5px 10px" }}
                >
                  Configurations
                </Typography>
                <SidebarItem
                  title="Amenity"
                  to="/amenity/listing"
                  icon={<FitbitIcon />}
                  selected={selected}
                  rolePriority={rolePriority}
                  menuVisibility={1}
                  isCollapsed={isCollapsed}
                  setIsCollapsed={setIsCollapsed}
                />
                <SidebarItem
                  title="Class"
                  to="/class/listing"
                  icon={<MeetingRoomIcon />}
                  selected={selected}
                  rolePriority={rolePriority}
                  menuVisibility={1}
                  isCollapsed={isCollapsed}
                  setIsCollapsed={setIsCollapsed}
                />
                <SidebarItem
                  title="Payment Method"
                  to="/payment-method/listing"
                  icon={<AutoStoriesIcon />}
                  selected={selected}
                  rolePriority={rolePriority}
                  menuVisibility={1}
                  isCollapsed={isCollapsed}
                  setIsCollapsed={setIsCollapsed}
                />
                <SidebarItem
                  title="Section"
                  to="/section/listing"
                  icon={<CategoryIcon />}
                  selected={selected}
                  rolePriority={rolePriority}
                  menuVisibility={1}
                  isCollapsed={isCollapsed}
                  setIsCollapsed={setIsCollapsed}
                />
                <SidebarItem
                  title="Subject"
                  to="/subject/listing"
                  icon={<AutoStoriesIcon />}
                  selected={selected}
                  rolePriority={rolePriority}
                  menuVisibility={1}
                  isCollapsed={isCollapsed}
                  setIsCollapsed={setIsCollapsed}
                />
                <SidebarItem
                  title="Role"
                  to="/role/listing"
                  icon={<EngineeringIcon />}
                  selected={selected}
                  rolePriority={rolePriority}
                  menuVisibility={1}
                  isCollapsed={isCollapsed}
                  setIsCollapsed={setIsCollapsed}
                />
              </>
            )}
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

Sidebar.propTypes = {
  rolePriority: PropTypes.number,
};

export default Sidebar;
