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
import { PlusCircle } from "lucide-react";

import API from "../../apis";
import classNames from "../modules";
import Search from "../common/Search";
import ServerPaginationGrid from "../common/Datagrid";
import ViewDetailModal from "../common/ViewDetailModal";

import { datagridColumns } from "./StudentConfig";
import { setAllSubjects } from "../../redux/actions/SubjectAction";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { setStudents } from "../../redux/actions/StudentAction";
import { useCommon } from "../hooks/common";
import { Utility } from "../utility";


const pageSizeOptions = [10, 20, 50];

const ListingComponent = ({ rolePriority = null }) => {
  const [openModal, setOpenModal] = useState(false);
  const [studentDetail, setStudentDetail] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [countryData, setCountryData] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [cityData, setCityData] = useState([]);

  const selected = useSelector((state) => state.menuItems.selected);
  const subjectsInRedux = useSelector(state => state.allSubjects);
  const formSectionsInRedux = useSelector(state => state.schoolSections);   //for custom modal
  const formClassesInRedux = useSelector(state => state.schoolClasses);
  const { listData, loading } = useSelector((state) => state.allStudents);

  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const URLParams = useParams();
  const { state } = useLocation();
  // NOTE: Do NOT use state?.id for the modal — that pollutes the /student/create form.
  // selectedStudentId is local state set by the datagrid action button.
  let id = null; // listing page never reads id from location
  
  //revisit for pagination
  const [searchFlag, setSearchFlag] = useState({
    search: false,
    searching: false
  });
  const [oldPagination, setOldPagination] = useState();
  
  const { getPaginatedData } = useCommon();
  const { findMultipleById, findById, fetchAndSetAll, getLocalStorage, setLocalStorage, toastAndNavigate } = Utility();

  // ── Helpers ──────────────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const BLOOD_GROUP_MAP = {
    A_pos: 'A+', A_neg: 'A−', B_pos: 'B+', B_neg: 'B−',
    AB_pos: 'AB+', AB_neg: 'AB−', O_pos: 'O+', O_neg: 'O−'
  };
  const bloodGroupLabel = (val) => BLOOD_GROUP_MAP[val] || val || '';
  
  const [reloadBtn, setReloadBtn] = useState(null);
  useEffect(() => {
    setReloadBtn(document.getElementById("reload-btn"));
  }, []);

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
    if (selectedStudentId) {
      populateData(selectedStudentId);

      API.CountryAPI.getCountries()
        .then(countries => {
          if (countries.status === 'Success') {
            setCountryData(countries.data.list);
          }
        })
        .catch(err => { throw err; });

      API.StateAPI.getAllStates()
        .then(states => {
          if (states.status === 'Success') {
            setStateData(states.data.rows);
          }
        })
        .catch(err => { throw err; });

      API.CityAPI.getAllCities()
        .then(cities => {
          if (cities.status === 'Success') {
            setCityData(cities.data.rows);
          }
        })
        .catch(err => { throw err; });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudentId]);

  useEffect(() => {
    dispatch(setMenuItem("Student"));
  }, []);

  useEffect(() => {
    classId ? setLocalStorage("class", classId) : null;
  }, [classId]);

  const horizontalData = {
    Session: studentDetail?.studentData?.session,
    Name: studentDetail?.studentData?.firstname
      ? `${studentDetail.studentData.firstname} ${studentDetail.studentData.lastname || ''}`.trim()
      : '',
    Email: studentDetail?.studentData?.email,
    Dob: formatDate(studentDetail?.studentData?.dob),
    Admission_date: formatDate(studentDetail?.studentData?.admission_date),
    Blood_group: bloodGroupLabel(studentDetail?.studentData?.blood_group),
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
    <div 
        className="p-4 sm:p-6 lg:p-8 space-y-6 w-full animate-in fade-in duration-200"
        
    >
      <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-100 dark:border-[#1a1a1a] shadow-sm p-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-extrabold font-display text-slate-800 dark:text-white tracking-tight capitalize leading-tight">Student Desk</h2>
          
          <div className="flex-1 w-full flex justify-center md:px-8 max-w-2xl">
            <Search
                action={setStudents}
                api={API.StudentAPI}
                getSearchData={getPaginatedData}
                oldPagination={oldPagination}
                reloadBtn={reloadBtn}
                setSearchFlag={setSearchFlag}
            />
          </div>

          {rolePriority > 1 && (
            <button
                onClick={() => navigateTo(`/student/create`, { state: null })}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 whitespace-nowrap"
            >
                <PlusCircle className="w-5 h-5" />
                {classNames.includes(selected) ? "Admission" : `Create New ${selected}`}
            </button>
          )}
        </div>
      </div>

      <ServerPaginationGrid
            action={setStudents}
            api={API.StudentAPI}
            getQuery={getPaginatedData}
            columns={datagridColumns(rolePriority, setOpenModal, setSelectedStudentId)}
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
    </div>
  );
};

ListingComponent.propTypes = {
  rolePriority: PropTypes.number,
};

export default ListingComponent;
