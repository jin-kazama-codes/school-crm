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
        <div className="mb-0.5 w-full">
            <button
                type="button"
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer select-none ${
                    isActive
                        ? "bg-emerald-600 text-white font-bold shadow-xs shadow-emerald-600/10 dark:neon-glow dark:bg-emerald-500"
                        : "text-slate-500 dark:text-gray-400 font-semibold hover:bg-slate-50 dark:hover:bg-[#1a1a1a]/50 hover:text-slate-800 dark:hover:text-white"
                } ${className || ""}`}
            >
                <div className="w-4 h-4 min-w-[16px] min-h-[16px] shrink-0 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4 [&>svg]:shrink-0">
                    {icon}
                </div>
                {!isCollapsed && (
                    <span className="truncate leading-none text-left flex-1">{title}</span>
                )}
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
