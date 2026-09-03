/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React from "react";
import { useNavigate } from "@/lib/routerAdapter";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { setMenuItem } from "../../redux/actions/NavigationAction";
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
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { setLocalStorage } = Utility();

    if (rolePriority > menuVisibility) {
        return null;
    }

    const isActive = title === selected;

    return (
        <div className="mb-1">
            <button
                onClick={(e) => {
                    if (isSubMenu) {
                        e.stopPropagation();
                    }
                    if (handleClassClick) handleClassClick();
                    dispatch(setMenuItem(title));
                    setLocalStorage("menu", { selected: title });
                    if (setIsCollapsed && window.innerWidth <= 480) {
                        setIsCollapsed(true);
                    }
                    if (to) {
                        navigate(to);
                    }
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                        ? "bg-emerald-600 text-white font-bold shadow-xs shadow-emerald-600/10 dark:neon-glow dark:bg-emerald-500"
                        : "text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-[#1a1a1a]/50"
                } ${className || ""}`}
            >
                <div className="flex shrink-0">{icon}</div>
                {!isCollapsed && <span className="text-xs">{title}</span>}
            </button>
        </div>
    );
};

SidebarItem.propTypes = {
    title: PropTypes.string,
    to: PropTypes.string,
    icon: PropTypes.node,
    selected: PropTypes.string,
    rolePriority: PropTypes.number,
    menuVisibility: PropTypes.number,
    className: PropTypes.string,
    handleClassClick: PropTypes.func,
    isSubMenu: PropTypes.bool,
    setIsCollapsed: PropTypes.func,
    isCollapsed: PropTypes.bool
};
