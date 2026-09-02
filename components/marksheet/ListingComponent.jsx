/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "@/lib/routerAdapter";
import { useSelector, useDispatch } from "react-redux";

import PropTypes from "prop-types";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import API from "../../apis";
import Search from "../common/Search";
import ServerPaginationGrid from "../common/Datagrid";

import { datagridColumns } from "./MarksheetConfig";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { setMarksheets, setMarksheetClassData } from "../../redux/actions/MarksheetAction";
import { setAllClasses, setSchoolClasses } from "../../redux/actions/ClassAction";
import { setAllSections, setSchoolSections } from "../../redux/actions/SectionAction";
import { setAllSubjects } from "../../redux/actions/SubjectAction";
import { tokens } from "../../theme";
import { useCommon } from "../hooks/common";
import { Utility } from "../utility";

import listBg from "../assets/listBG.jpg";

const pageSizeOptions = [5, 10, 20];

const ListingComponent = ({ rolePriority = null }) => {
  const [classSectionObj, setClassSectionObj] = useState(null);
  const [classData, setClassData] = useState([]);
  const schoolClasses = useSelector((state) => state.schoolClasses);
  const allClasses = useSelector((state) => state.allClasses);
  const schoolSections = useSelector((state) => state.schoolSections);
  const allSections = useSelector((state) => state.allSections);
  const allSubjects = useSelector((state) => state.allSubjects);
  const selected = useSelector((state) => state.menuItems.selected);
  const { listData, loading } = useSelector((state) => state.allMarksheets);

  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery("(max-width:480px)");
  const isTab = useMediaQuery("(max-width:920px)");

  //revisit for pagination
  const [searchFlag, setSearchFlag] = useState({
    search: false,
    searching: false,
  });
  const [oldPagination, setOldPagination] = useState();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const reloadBtn = document.getElementById("reload-btn");
  const { getPaginatedData } = useCommon();
  const {
    getLocalStorage,
    fetchAndSetAll,
    fetchAndSetSchoolData,
    findMultipleById,
  } = Utility();

  // here, you are seeing marksheet listing with class & section dropdown, when u select class, all its section objects are filtered
  // from total classes of that school, now when a section is selected, then the subject ids are filtered from all SUbjects to get
  // individual subjects of that section, these are dispatched in marksheetClassData action
  // to bring marksheet data for selected class & section selected in dropdown
  let classConditionObj = classSectionObj?.class_id
    ? {
      classId: classSectionObj.class_id,
    }
    : null;

  classConditionObj = classSectionObj?.section_id
    ? {
      ...classConditionObj,
      sectionId: classSectionObj.section_id,
    }
    : null;

  useEffect(() => {
    if (classSectionObj?.class_id && classSectionObj?.section_id) {
      getPaginatedData(
        0,
        8,
        setMarksheets,
        API.MarksheetAPI,
        classConditionObj
      );
    }
  }, [classConditionObj?.classId, classConditionObj?.sectionId]);

  useEffect(() => {
    if (!allSubjects?.listData?.length) {
      fetchAndSetAll(dispatch, setAllSubjects, API.SubjectAPI);
    }
  }, []);

  useEffect(() => {
    const getAndSetSections = () => {
      const classSections =
        classData?.filter(
          (obj) => obj.class_id === classSectionObj?.class_id
        ) || [];
      const selectedSections = classSections.map(
        ({ section_id, section_name }) => ({ section_id, section_name })
      );
      dispatch(setSchoolSections(selectedSections));
    };
    getAndSetSections();
  }, [classSectionObj?.class_id, classData?.length]);

  useEffect(() => {
    const getAndSetSubjects = () => {
      const sectionSubjects = classData?.filter(
        (obj) =>
          obj.class_id === classSectionObj?.class_id &&
          obj.section_id === classSectionObj?.section_id
      );
      const selectedSubjects = sectionSubjects
        ? findMultipleById(
          sectionSubjects[0]?.subject_ids,
          allSubjects?.listData
        )
        : [];
      dispatch(
        setMarksheetClassData({
          selectedSubjects: selectedSubjects,
          classDataObj: sectionSubjects[0],
        })
      );
    };
    getAndSetSubjects();
  }, [
    classSectionObj?.class_id,
    classSectionObj?.section_id,
    allSubjects?.listData?.length,
    classData.length,
  ]);

  useEffect(() => {
    if (!getLocalStorage("schoolInfo")) {
      if (!allClasses?.listData?.length) {
        fetchAndSetAll(dispatch, setAllClasses, API.ClassAPI);
      }
      if (!allSections?.listData?.length) {
        fetchAndSetAll(dispatch, setAllSections, API.SectionAPI);
      }
    }
    if (
      getLocalStorage("schoolInfo") &&
      (!schoolClasses?.listData?.length || !schoolSections?.listData?.length || !classData?.length)
    ) {
      fetchAndSetSchoolData(
        dispatch,
        setSchoolClasses,
        setSchoolSections,
        setClassData
      );
    }
  }, []);

  useEffect(() => {
    const selectedMenu = getLocalStorage("menu");
    dispatch(setMenuItem(selectedMenu.selected));
  }, []);

  // to set default class & section id in dropdowns
  useEffect(() => {
    if (
      listData?.rows?.length &&
      !classSectionObj?.class_id &&
      !classSectionObj?.section_id
    ) {
      setClassSectionObj({
        ...classSectionObj,
        class_id: listData.rows[0].class_id,
        section_id: listData.rows[0].section_id,
      });
    }
  }, [listData?.rows?.length, classSectionObj?.section_id]);

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
            marginRight="15px"
          >
            {selected}
          </Typography>
          <Search
            action={setMarksheets}
            api={API.MarksheetAPI}
            getSearchData={getPaginatedData}
            oldPagination={oldPagination}
            reloadBtn={reloadBtn}
            setSearchFlag={setSearchFlag}
          />

          <FormControl
            variant="filled"
            sx={{ minWidth: 120, marginRight: "10px" }}
          >
            <InputLabel id="classfield">Class</InputLabel>
            <Select
              variant="filled"
              labelId="classfield"
              value={classSectionObj?.class_id || ""}
              onChange={(event) =>
                setClassSectionObj({
                  ...classSectionObj,
                  class_id: event.target.value,
                })
              }
              sx={{
                height: "100%",
                marginLeft: "1vh",
                backgroundColor: colors.blueAccent[800],
                "&:hover": {
                  backgroundColor: colors.blueAccent[800],
                },
              }}
            >
              {allClasses?.listData?.length
                ? allClasses.listData.map((cls) => (
                  <MenuItem value={cls.class_id} key={cls.class_id}>
                    {cls.class_name}
                  </MenuItem>
                ))
                : schoolClasses?.listData?.length
                  ? schoolClasses.listData.map((cls) => (
                    <MenuItem value={cls.class_id} key={cls.class_id}>
                      {cls.class_name}
                    </MenuItem>
                  ))
                  : null}
            </Select>
          </FormControl>
          
          <FormControl
            variant="filled"
            sx={{ minWidth: 120, height: isTab ? "4vh" : "auto" }}
          >
            <InputLabel id="sectionfield">Section</InputLabel>
            <Select
              variant="filled"
              labelId="sectionfield"
              value={classSectionObj?.section_id || ""}
              onChange={(event) =>
                setClassSectionObj({
                  ...classSectionObj,
                  section_id: event.target.value,
                })
              }
              sx={{
                height: "100%",
                marginRight: "1vh",
                backgroundColor: colors.blueAccent[800],
                "&:hover": {
                  backgroundColor: colors.blueAccent[800],
                }
              }}
            >
              {allSections?.listData?.length
                ? allSections.listData.map((section) => (
                  <MenuItem
                    value={section.section_id}
                    key={section.section_id}
                  >
                    {section.section_name}
                  </MenuItem>
                ))
                : schoolSections?.listData?.length
                  ? schoolSections.listData.map((section) => (
                    <MenuItem
                      value={section.section_id}
                      key={section.section_id}
                    >
                      {section.section_name}
                    </MenuItem>
                  ))
                  : null}
            </Select>
          </FormControl>

          {rolePriority > 1 && (
            <Button
              color="success"
              disabled={
                !classSectionObj?.class_id || !classSectionObj?.section_id
              } // Disable if either class or section is not selected
              variant="contained"
              type="submit"
              onClick={() => navigateTo(`/marksheet/create`)}
              sx={{ height: isTab ? "4vh" : "auto" }}
            >
              Create New {selected}
            </Button>
          )}
        </Box>
      </Box>
      <ServerPaginationGrid
        action={setMarksheets}
        api={API.MarksheetAPI}
        getQuery={getPaginatedData}
        columns={datagridColumns(rolePriority)}
        rows={listData.rows}
        count={listData.count}
        loading={loading}
        selected={selected}
        pageSizeOptions={pageSizeOptions}
        setOldPagination={setOldPagination}
        searchFlag={searchFlag}
        setSearchFlag={setSearchFlag}
        condition={classConditionObj}
      />
    </Box>
  );
};

ListingComponent.propTypes = {
  rolePriority: PropTypes.number,
};

export default ListingComponent;
