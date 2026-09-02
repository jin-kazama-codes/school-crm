/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "@/lib/routerAdapter";

import { Box, Typography, Button, useMediaQuery, useTheme } from "@mui/material";

import API from "../../apis";
import FormComponent from "./FormInModalComponent";
import Search from "../common/Search";
import ServerPaginationGrid from '../common/Datagrid';

import { datagridColumns } from "./ClassConfig";
import { setListingClasses } from "../../redux/actions/ClassAction";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { tokens } from "../../theme";
import { useCommon } from "../hooks/common";
import { Utility } from "../utility";

import listBg from "../assets/listBG.jpg"

const pageSizeOptions = [5, 10, 20];

const ListingComponent = () => {
    const [openDialog, setOpenDialog] = useState(false);
    //revisit for pagination
    const [searchFlag, setSearchFlag] = useState({ search: false, searching: false });
    const [oldPagination, setOldPagination] = useState();
    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const selected = useSelector(state => state.menuItems.selected);
    const { listData, loading } = useSelector(state => state.listingClasses);

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery("(max-width:480px)");
    const isTab = useMediaQuery("(max-width:920px)");
    const reloadBtn = document.getElementById("reload-btn");

    const { getPaginatedData } = useCommon();
    const { getLocalStorage } = Utility();

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        dispatch(setMenuItem(selectedMenu.selected));
    }, []);

    //For form modal to open
    const handleDialogOpen = () => {
        setOpenDialog(true);
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
                        action={setListingClasses}
                        api={API.ClassAPI}
                        getSearchData={getPaginatedData}
                        oldPagination={oldPagination}
                        reloadBtn={reloadBtn}
                        setSearchFlag={setSearchFlag}
                    />
                    <Button
                        type="submit"
                        color="success"
                        variant="contained"
                        onClick={() => {
                            navigateTo("#", { state: { id: undefined } });
                            handleDialogOpen();
                        }}
                        sx={{ height: isTab ? "4vh" : "auto" }}
                    >
                        Create New {selected}
                    </Button>
                </Box>
            </Box>
            <ServerPaginationGrid
                action={setListingClasses}
                api={API.ClassAPI}
                getQuery={getPaginatedData}
                columns={datagridColumns(handleDialogOpen)}
                rows={listData.rows}
                count={listData.count}
                loading={loading}
                selected={selected}
                pageSizeOptions={pageSizeOptions}
                setOldPagination={setOldPagination}
                searchFlag={searchFlag}
                setSearchFlag={setSearchFlag}
            />
            <FormComponent openDialog={openDialog} setOpenDialog={setOpenDialog} />
        </Box>
    );
};

export default ListingComponent;
