/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "@/lib/routerAdapter";
import { useSelector, useDispatch } from "react-redux";

import { Box, Typography, Button, useMediaQuery, useTheme } from "@mui/material";

import API from "../../apis";
import Search from "../common/Search";
import ServerPaginationGrid from '../common/Datagrid';
import ViewDetailModal from "../common/ViewDetailModal";

import { datagridColumns } from "./SchoolConfig";
import { setFormAmenities } from "../../redux/actions/AmenityAction";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { setListingSchools } from "../../redux/actions/SchoolAction";
import { tokens } from "../../theme";
import { useCommon } from "../hooks/common";
import { Utility } from "../utility";

import listBg from "../assets/listBG.jpg";

const pageSizeOptions = [5, 10, 20];

const ListingComponent = () => {

    const [openModal, setOpenModal] = useState(false);
    const [schoolDetail, setSchoolDetail] = useState([]);
    const [countryData, setCountryData] = useState([]);
    const [stateData, setStateData] = useState([]);
    const [cityData, setCityData] = useState([]);

    const selected = useSelector(state => state.menuItems.selected);
    const formAmenitiesInRedux = useSelector(state => state.allFormAmenities);
    const { listData, loading } = useSelector(state => state.listingSchools);

    const theme = useTheme();
    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const { state } = useLocation();
    const isMobile = useMediaQuery("(max-width:480px)");
    const isTab = useMediaQuery("(max-width:920px)");
    let id = state?.id;

    //revisit for pagination
    const [searchFlag, setSearchFlag] = useState({ search: false, searching: false });
    const [oldPagination, setOldPagination] = useState();

    const colors = tokens(theme.palette.mode);
    const reloadBtn = document.getElementById("reload-btn");
    const { getPaginatedData } = useCommon();
    const { findMultipleById, getLocalStorage, toastAndNavigate } = Utility();

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        dispatch(setMenuItem(selectedMenu.selected));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const populateData = useCallback(id => {
        const paths = [`/get-by-pk/school/${id}`, `/get-address/school/${id}`, `/get-image/school/${id}`];

        API.CommonAPI.multipleAPICall("GET", paths)
            .then(responses => {
                if (responses[0]?.data?.data) {
                    responses[0].data.data.amenities = findMultipleById(responses[0].data.data?.amenities, formAmenitiesInRedux?.listData?.rows);
                }
                API.SchoolAPI.getSchoolClasses(id)
                    .then(res => {
                        const dataObj = {
                            schoolData: {
                                schoolData: responses[0].data.data,
                                selectedClass: res?.data
                            },
                            addressData: responses[1]?.data?.data,
                            imageData: responses[2]?.data?.data
                        };
                        setSchoolDetail(dataObj);
                    })
                    .catch(err => {
                        toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg || "Error fetching school classes", navigateTo, 0);
                    });
            })
            .catch(err => {
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg || "Error fetching school classes", navigateTo, 0);
            });
    }, [formAmenitiesInRedux?.listData?.rows]);

    useEffect(() => {
        if (!formAmenitiesInRedux?.listData?.rows?.length) {
            getPaginatedData(0, 50, setFormAmenities, API.AmenityAPI);
        }
    }, [formAmenitiesInRedux?.listData?.rows?.length]);

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

    const horizontalData = {
        Registration_year: schoolDetail?.schoolData?.schoolData?.registration_year,
        Registered_by: schoolDetail?.schoolData?.schoolData?.registered_by,
        Name: schoolDetail?.schoolData?.schoolData?.name,
        Board: schoolDetail?.schoolData?.schoolData?.board,
        Email: schoolDetail?.schoolData?.schoolData?.email,
        Director: schoolDetail?.schoolData?.schoolData?.director,
        School_code: schoolDetail?.schoolData?.schoolData?.school_code
    };
    const verticalData = {
        Contact_no: schoolDetail?.schoolData?.schoolData?.contact_no_1,
        Type: schoolDetail?.schoolData?.schoolData?.type,
        Sub_type: schoolDetail?.schoolData?.schoolData?.sub_type,
        Principal: schoolDetail?.schoolData?.schoolData?.principal,

    };


    return (
        <Box m="10px" position="relative"
            sx={{
                borderRadius: "20px",
                border: "0.5px solid black",
                overflow: "hidden",
                boxShadow: "1px 1px 10px black",
                backgroundImage: theme.palette.mode === "light"
                    ? `linear-gradient(rgb(151 203 255 / 80%), rgb(151 203 255 / 80%)), url(${listBg})`
                    : `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${listBg})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover"
            }}>
            <Box
                height={isMobile ? "19vh" : isTab ? "8vh" : "11vh"}
                borderRadius="4px"
                padding={isMobile ? "1vh" : "2vh"}
                backgroundColor={colors.blueAccent[700]}
                position="relative"
            >
                <Box
                    display="flex"
                    height={isMobile ? "16vh" : "7vh"}
                    flexDirection={isMobile ? "column" : "row"}
                    justifyContent="space-between"
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
                        action={setListingSchools}
                        api={API.SchoolAPI}
                        getSearchData={getPaginatedData}
                        oldPagination={oldPagination}
                        reloadBtn={reloadBtn}
                        setSearchFlag={setSearchFlag}
                    />
                    <Button
                        type="submit"
                        color="success"
                        variant="contained"
                        onClick={() => { navigateTo(`/${selected.toLowerCase()}/create`) }}
                        sx={{ height: isTab ? "4vh" : "auto" }}
                    >
                        Create New {selected}
                    </Button>
                </Box>
            </Box>
            <ServerPaginationGrid
                action={setListingSchools}
                api={API.SchoolAPI}
                getQuery={getPaginatedData}
                columns={datagridColumns(setOpenModal)}
                rows={listData.rows}
                count={listData.count}
                loading={loading}
                selected={selected}
                pageSizeOptions={pageSizeOptions}
                setOldPagination={setOldPagination}
                searchFlag={searchFlag}
                setSearchFlag={setSearchFlag}
            />
            <ViewDetailModal
                open={openModal}
                setOpen={setOpenModal}
                title='School Details'
                horizontalData={horizontalData}
                verticalData={verticalData}
                detail={schoolDetail}
                countryData={countryData}
                stateData={stateData}
                cityData={cityData}
            />
        </Box>
    );
};

export default ListingComponent;
