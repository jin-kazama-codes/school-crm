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
import { useLocation, useNavigate, useParams } from "@/lib/routerAdapter";
import { useSelector, useDispatch } from "react-redux";

import { Box, Button, Typography, useMediaQuery, useTheme } from "@mui/material";

import API from "../../apis";
import classNames from "../modules";
import Search from "../common/Search";
import ServerPaginationGrid from "../common/Datagrid";
import ViewDetailModal from "../common/ViewDetailModal";

import { datagridColumns } from "./StudentConfig";
import { setAllSubjects } from "../../redux/actions/SubjectAction";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { setStudents } from "../../redux/actions/StudentAction";
import { tokens } from "../../theme";
import { useCommon } from "../hooks/common";
import { Utility } from "../utility";

import listBg from "../assets/listBG.jpg";

const pageSizeOptions = [5, 10, 20];

const ListingComponent = ({ rolePriority = null }) => {
  const [openModal, setOpenModal] = useState(false);
  const [studentDetail, setStudentDetail] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [cityData, setCityData] = useState([]);

  const selected = useSelector((state) => state.menuItems.selected);
  const subjectsInRedux = useSelector(state => state.allSubjects);
  const formSectionsInRedux = useSelector(state => state.schoolSections);   //for custom modal
  const formClassesInRedux = useSelector(state => state.schoolClasses);
  const { listData, loading } = useSelector((state) => state.allStudents);

  const theme = useTheme();
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const URLParams = useParams();
  const { state } = useLocation();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery("(max-width:480px)");
  const isTab = useMediaQuery("(max-width:920px)");
  let id = state?.id;
  
  //revisit for pagination
  const [searchFlag, setSearchFlag] = useState({
    search: false,
    searching: false
  });
  const [oldPagination, setOldPagination] = useState();
  
  const { getPaginatedData } = useCommon();
  const { findMultipleById, findById, fetchAndSetAll, getLocalStorage, setLocalStorage, toastAndNavigate } = Utility();
  const reloadBtn = document.getElementById("reload-btn");
  const classId = URLParams ? URLParams.classId : null; // grab class id from url
  const sectionName = findById(studentDetail?.studentData?.section, formSectionsInRedux?.listData)?.section_name;
  const className = findById(studentDetail?.studentData?.class, formClassesInRedux?.listData)?.class_name;
  const importBtn = true;
  const studentImport = "student";

  let classConditionObj = classId
    ? { classId: classId }
    : null;

  // Logged in with parent role
  if (rolePriority === 5) {
    const parentId = getLocalStorage("auth").id;
    classConditionObj = {
      ...classConditionObj,
      parentId: parentId,
    };
  }

  const populateData = useCallback(id => {
    const paths = [`/get-by-pk/student/${id}`, `/get-address/student/${id}`, `/get-image/student/${id}`];
    API.CommonAPI.multipleAPICall("GET", paths)
      .then(responses => {
        if (responses[0].data.data) {
          responses[0].data.data.subjects = findMultipleById(responses[0].data.data.subjects, subjectsInRedux?.listData?.rows)
        }
        const dataObj = {
          studentData: responses[0].data.data,
          addressData: responses[1]?.data?.data,
          imageData: responses[2]?.data?.data
        };
        setStudentDetail(dataObj);
      })
      .catch(err => {
        toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred");
        throw err;
      });
  }, [subjectsInRedux?.listData?.rows, id]);

  useEffect(() => {
    if (!subjectsInRedux?.listData?.length) {
      fetchAndSetAll(dispatch, setAllSubjects, API.SubjectAPI);
    }
  }, [subjectsInRedux?.listData?.length]);

  useEffect(() => {
    if (id) {
      populateData(id);

      API.CountryAPI.getCountries()
        .then(countries => {
          if (countries.status === 'Success') {
            setCountryData(countries.data.list);
          }
        })
        .catch(err => {
          throw err;
        });

      API.StateAPI.getAllStates()
        .then(states => {
          if (states.status === 'Success') {
            setStateData(states.data.rows);
          }
        })
        .catch(err => {
          throw err;
        });

      API.CityAPI.getAllCities()
        .then(cities => {
          if (cities.status === 'Success') {
            setCityData(cities.data.rows);
          }
        })
        .catch(err => {
          throw err;
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const selectedMenu = getLocalStorage("menu");
    dispatch(setMenuItem(selectedMenu.selected));
  }, []);

  useEffect(() => {
    classId ? setLocalStorage("class", classId) : null;
  }, [classId]);

  const horizontalData = {
    Session: studentDetail?.studentData?.session,
    Name: studentDetail?.studentData?.firstname,
    Email: studentDetail?.studentData?.email,
    Dob: studentDetail?.studentData?.dob,
    Admission_date: studentDetail?.studentData?.admission_date,
    Blood_group: studentDetail?.studentData?.blood_group,
    Class: className,
    Section: sectionName
  };
  const verticalData = {
    Father_name: studentDetail?.studentData?.father_name,
    Mother_name: studentDetail?.studentData?.mother_name,
    Guardian: studentDetail?.studentData?.guardian,
    Contact_no: studentDetail?.studentData?.contact_no,
    Religion: studentDetail?.studentData?.religion,
    Caste_group: studentDetail?.studentData?.caste_group,
    Gender: studentDetail?.studentData?.gender,
  };


  return (
    <Box
      m="10px"
      position="relative"
      sx={{
        borderRadius: "20px",
        border: "0.5px solid black",
        overflow: "hidden",
        boxShadow: "1px 1px 10px black",
        backgroundImage:
          theme.palette.mode === "light"
            ? `linear-gradient(rgb(151 203 255 / 80%), rgb(151 203 255 / 80%)), url(${listBg})`
            : `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${listBg})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <Box
        height={isMobile ? "19vh" : isTab ? "8vh" : "11vh"}
        borderRadius="4px"
        padding={isMobile ? "1vh" : "2vh"}
        backgroundColor={colors.blueAccent[700]}
      >
        <Box
          display="flex"
          height={isMobile ? "16vh" : "7vh"}
          flexDirection={isMobile ? "column" : "row"}
          justifyContent={"space-between"}
          alignItems={isMobile ? "center" : "normal"}
        >
          <Typography
            component="h2"
            variant="h2"
            color={colors.grey[100]}
            fontWeight="bold"
          >
            {selected}
          </Typography>
          <Search
            action={setStudents}
            api={API.StudentAPI}
            getSearchData={getPaginatedData}
            oldPagination={oldPagination}
            reloadBtn={reloadBtn}
            setSearchFlag={setSearchFlag}
          />

          {rolePriority > 1 && (
            <Button
              type="submit"
              color="success"
              variant="contained"
              onClick={() => {
                navigateTo(`/student/create`);
              }}
              sx={{ height: isTab ? "4vh" : "auto" }}
            >
              {classNames.includes(selected)
                ? "Admission"
                : `Create New ${selected}`}
            </Button>
          )}
        </Box>
      </Box>
      <ServerPaginationGrid
        action={setStudents}
        api={API.StudentAPI}
        getQuery={getPaginatedData}
        columns={datagridColumns(rolePriority, setOpenModal)}
        rolePriority={rolePriority}
        condition={classConditionObj}
        importBtn={importBtn}
        rows={listData.rows}
        count={listData.count}
        loading={loading}
        selected={selected}
        pageSizeOptions={pageSizeOptions}
        setOldPagination={setOldPagination}
        searchFlag={searchFlag}
        setSearchFlag={setSearchFlag}
        imports={studentImport}
      />
      <ViewDetailModal
        open={openModal}
        setOpen={setOpenModal}
        title='Student Details'
        horizontalData={horizontalData}
        verticalData={verticalData}
        detail={studentDetail}
        countryData={countryData}
        stateData={stateData}
        cityData={cityData}
      />
    </Box>
  );
};

ListingComponent.propTypes = {
  rolePriority: PropTypes.number,
};

export default ListingComponent;
