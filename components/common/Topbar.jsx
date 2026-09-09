/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useContext, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useNavigate } from "@/lib/routerAdapter";

import {
  Menu,
  Sun,
  Moon,
  LogOut,
  Key,
  Building2,
  ChevronDown
} from "lucide-react";

import API from "../../apis";
import ChangePwModal from "../models/ChangePwModal";
import { setAllSchools } from "../../redux/actions/SchoolAction";
import { ColorModeContext } from "../../theme";
import { Utility } from "../utility";

const Topbar = ({ roleName = null, rolePriority = null, isCollapsed, setIsCollapsed, schoolInfo }) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [schoolMenuOpen, setSchoolMenuOpen] = useState(false);
  const [changePwModalOpen, setChangePwModalOpen] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [schoolObj, setSchoolObj] = useState({});
  const allSchools = useSelector((state) => state.allSchools);

  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const colorMode = useContext(ColorModeContext);
  
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 480;
  const profileMenuRef = useRef(null);
  const schoolMenuRef = useRef(null);

  const {
    fetchAndSetAll,
    getInitials,
    getNameAndType,
    getLocalStorage,
    remLocalStorage,
    setLocalStorage,
  } = Utility();
  const { username, role } = getNameAndType(roleName);

  const handleSignOut = () => {
    localStorage.clear();
    navigateTo("/login", { replace: true });
    window.location.reload();
  };

  useEffect(() => {
    if (getLocalStorage("auth")) {
      setSchoolName(getLocalStorage("auth")?.school);
    }
  }, [getLocalStorage("auth")]);

  useEffect(() => {
    if (schoolInfo?.encrypted_id) {
      API.CommonAPI.decryptText(schoolInfo).then((result) => {
        if (result.status === "Success") {
          const filteredSchool = allSchools?.listData?.find(
            (value) => value.id === parseInt(result.data)
          );
          setSchoolObj({
            id: filteredSchool?.id,
            name: filteredSchool?.name,
          });
        }
      });
    }
  }, [schoolInfo?.encrypted_id, allSchools?.listData]);

  useEffect(() => {
    if (!allSchools?.listData?.length) {
      fetchAndSetAll(dispatch, setAllSchools, API.SchoolAPI);
    }
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (schoolMenuRef.current && !schoolMenuRef.current.contains(event.target)) {
        setSchoolMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDarkMode = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  const handleSelectSchool = (school) => {
    if (!school) {
      setSchoolObj({});
      remLocalStorage("schoolInfo");
      setSchoolMenuOpen(false);
      window.location.reload();
      return;
    }
    setSchoolObj({ id: school.id, name: school.name });
    setSchoolMenuOpen(false);
    API.CommonAPI.encryptText({ data: school.id }).then(result => {
      if (result.status === "Success") {
        setLocalStorage("schoolInfo", result.data);
        window.location.reload();
      }
    });
  };

  const schoolsList = allSchools?.listData || [];
  const activeSchoolSelected = Boolean(schoolObj?.id);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0f0f0f]/90 backdrop-blur-md border-b border-slate-100 dark:border-[#1a1a1a]/80 px-4 py-2.5 shadow-xs flex items-center justify-between gap-2 min-w-0 transition-colors duration-300">
        {/* Left Section - Brand Logo & Name */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-black text-xs shadow-md shadow-emerald-600/20 shrink-0">
              TS
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-sm sm:text-base text-slate-800 dark:text-white tracking-tight leading-none">
                <span className="text-emerald-600 dark:text-emerald-400">{schoolName || "The Skolar"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 min-w-0">
          {/* Custom School Selector Dropdown (Role 1 Admin) */}
          {rolePriority === 1 && (
            <div className="relative" ref={schoolMenuRef}>
              <button
                type="button"
                onClick={() => setSchoolMenuOpen(!schoolMenuOpen)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border font-semibold text-xs transition-all cursor-pointer shadow-xs ${
                  activeSchoolSelected
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                    : "bg-slate-50 dark:bg-[#141414] border-slate-200 dark:border-[#222] text-slate-700 dark:text-gray-300 hover:border-slate-300 dark:hover:border-[#333]"
                }`}
                title="Filter entire application by school"
              >
                <Building2 className={`w-4 h-4 shrink-0 ${activeSchoolSelected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                <span className="font-bold max-w-[120px] sm:max-w-[180px] truncate hidden sm:block">
                  {schoolObj.name || "All Schools"}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider hidden sm:inline-block ${
                  activeSchoolSelected
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 dark:bg-[#252525] text-slate-600 dark:text-gray-400"
                }`}>
                  {activeSchoolSelected ? "School Active" : `${schoolsList.length} Schools`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* School Dropdown Popup Menu */}
              {schoolMenuOpen && (
                <div className="absolute right-0 top-10 z-50 w-72 bg-white dark:bg-[#0f0f0f] border border-slate-100 dark:border-[#1a1a1a] rounded-2xl shadow-2xl p-2.5 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-[#1a1a1a] mb-1 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                      Select School Filter
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {schoolsList.length} Total Schools
                    </span>
                  </div>

                  {/* All Schools Option */}
                  <button
                    type="button"
                    onClick={() => handleSelectSchool(null)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      !activeSchoolSelected
                        ? "bg-emerald-600 text-white font-bold shadow-xs"
                        : "hover:bg-slate-50 dark:hover:bg-[#1a1a1a] text-slate-700 dark:text-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-base">🏢</span>
                      <div className="text-left">
                        <p className="leading-tight">All Schools</p>
                        <p className={`text-[10px] ${!activeSchoolSelected ? "text-emerald-100" : "text-slate-400 dark:text-gray-500"}`}>
                          Master Central View
                        </p>
                      </div>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                      !activeSchoolSelected
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-[#1f1f1f] text-slate-600 dark:text-gray-400"
                    }`}>
                      {schoolsList.length}
                    </span>
                  </button>

                  {/* Per School Options */}
                  <div className="pt-1 max-h-56 overflow-y-auto space-y-1 custom-scrollbar">
                    {schoolsList.map((school) => {
                      const isSelected = schoolObj.id === school.id;
                      return (
                        <button
                          key={school.id}
                          type="button"
                          onClick={() => handleSelectSchool(school)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-emerald-600 text-white font-bold shadow-xs"
                              : "hover:bg-slate-50 dark:hover:bg-[#1a1a1a] text-slate-700 dark:text-gray-300"
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <span className="text-base">📍</span>
                            <div className="text-left truncate">
                              <p className="leading-tight truncate">{school.name}</p>
                              <p className={`text-[10px] truncate ${isSelected ? "text-emerald-100" : "text-slate-400 dark:text-gray-500"}`}>
                                School ID: {school.id}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Theme Switcher */}
          <button
            type="button"
            onClick={() => {
              colorMode.toggleColorMode();
              if (isDarkMode) {
                document.documentElement.classList.remove('dark');
              } else {
                document.documentElement.classList.add('dark');
              }
            }}
            className="flex items-center justify-center p-2 bg-slate-50 dark:bg-[#0f0f0f] text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-emerald-400 rounded-xl border border-slate-100 dark:border-[#1a1a1a] transition-colors cursor-pointer"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="relative p-0.5 rounded-full hover:ring-2 hover:ring-emerald-500/50 transition-all cursor-pointer focus:outline-none shrink-0"
              title={`${username} (${role})`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold text-xs border-2 border-slate-200 dark:border-slate-800 shadow-xs">
                {getInitials()}
              </div>
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0f0f0f] absolute bottom-0 right-0 shadow-xs" />
            </button>

            {/* Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 top-11 z-50 w-64 bg-white dark:bg-[#0f0f0f] border border-slate-100 dark:border-[#1a1a1a] rounded-2xl shadow-2xl p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center space-x-3 p-2 bg-slate-50 dark:bg-[#141414] rounded-xl border border-slate-100 dark:border-[#1a1a1a]">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold text-xs shrink-0">
                    {getInitials()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-xs text-slate-800 dark:text-white truncate">{username}</p>
                    <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                      {role}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 pt-1 text-xs font-semibold text-slate-600 dark:text-gray-300">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setChangePwModalOpen(true);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#1a1a1a] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    <Key className="w-4 h-4 text-emerald-500" />
                    <span>Change Password</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-[#1a1a1a]">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-rose-500/20 cursor-pointer"
                  >
                    <span>Logout</span>
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ChangePwModal
        openDialog={changePwModalOpen}
        setOpenDialog={setChangePwModalOpen}
      />
    </>
  );
};

Topbar.propTypes = {
  roleName: PropTypes.string,
  rolePriority: PropTypes.number,
  isCollapsed: PropTypes.bool,
  setIsCollapsed: PropTypes.func,
  schoolInfo: PropTypes.object
};

export default Topbar;
