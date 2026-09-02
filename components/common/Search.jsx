/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useState } from "react";
import PropTypes from 'prop-types';

import { Box, IconButton, InputBase, useMediaQuery, useTheme, Button } from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import SearchIcon from "@mui/icons-material/Search";

import { tokens } from "../../theme";

const Search = ({
    getSearchData,
    condition,
    setSearchFlag,
    reloadBtn,
    action,
    api
}) => {
    const [inputValue, setInputValue] = useState("");
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery("(max-width:480px)");
    const isTab = useMediaQuery("(max-width:920px)");

    const handleChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleSearch = () => {
        getSearchData(0, 5, action, api, condition, inputValue);
        setSearchFlag({
            search: true,
            searching: true,
        });
        reloadBtn.style.display = "inline-flex";
    };

    //Search data by pressing down the enter key
    const handleKeyDown = (event) => {
        if (event.keyCode == 13) {
            handleSearch();
        }
    };

    const handleReload = () => {
        reloadBtn.style.display = "none";
        setInputValue('');
        setSearchFlag({
            search: false,
            searching: false
        });
    };

    return (
        <Box
            backgroundColor={colors.primary[400]}
            borderRadius="10px"
            width="40vw"
            height={isTab ? "4vh" : "auto"}
            display="flex"
        >
            <InputBase
                sx={{
                    ml: 2,
                    flex: 1,
                    width: "88%",
                }}
                placeholder="Search"
                id="input"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                autoComplete="off" // Add this attribute to disable suggestions
            />
            <Button sx={{
                display: "none",
                zIndex: 1,
                borderRadius: "50%",
                color: colors.grey[100],
                float: "right",
            }}
                id="reload-btn"
                type="button"
                onClick={handleReload}
            >
                <ReplayIcon />
            </Button>
            <IconButton sx={{
                p: 2
            }}
                onClick={handleSearch}
            >
                <SearchIcon />
            </IconButton>
        </Box>
    );
}

Search.propTypes = {
    getSearchData: PropTypes.func,
    condition: PropTypes.any,
    setSearchFlag: PropTypes.func,
    reloadBtn: PropTypes.object,
    action: PropTypes.func,
    api: PropTypes.object
};

export default Search;
