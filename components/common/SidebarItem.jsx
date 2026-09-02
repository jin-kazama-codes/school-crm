/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useNavigate } from "@/lib/routerAdapter";
import { useDispatch } from "react-redux";

import PropTypes from "prop-types";
import { MenuItem } from "react-pro-sidebar";
import { Typography, useTheme, Divider, useMediaQuery } from "@mui/material";

import { setMenuItem } from "../../redux/actions/NavigationAction";
import { tokens } from "../../theme";
import { Utility } from "../utility";

export const SidebarItem = ({
    title,
    to,
    icon,
    selected,
    rolePriority,
    menuVisibility,
    className,
    handleClassClick = null,
    isSubMenu = false,
    setIsCollapsed,
    isCollapsed
}) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery("(max-width:480px)");
    const { setLocalStorage } = Utility();

    if (rolePriority > menuVisibility) { // 2 > 2
        return false;
    }

    return (
        <>
            <MenuItem
                active={title === selected}
                style={{
                    color: colors.grey[100],
                    marginLeft: className ? '-15px' : 'auto',
                    marginRight: className ? '-15px' : 'auto'
                }}
                onClick={(e) => {
                    if (isSubMenu) {
                        e.stopPropagation();
                    }
                    handleClassClick ? handleClassClick() : null;
                    dispatch(setMenuItem(title));
                    setLocalStorage("menu", { selected: title });
                    if (isMobile && setIsCollapsed) {
                        setIsCollapsed(!isCollapsed);
                    }
                    if (to) {
                        navigate(to);
                    }
                }}
                icon={icon}
            >
                <Typography>{title}</Typography>
            </MenuItem>
            <Divider />
        </>
    );
};

SidebarItem.propTypes = {
    title: PropTypes.string,
    to: PropTypes.string,
    icon: PropTypes.object,
    selected: PropTypes.string,
    rolePriority: PropTypes.number,
    menuVisibility: PropTypes.number,
    className: PropTypes.string,
    handleClassClick: PropTypes.func,
    isSubMenu: PropTypes.bool
};
