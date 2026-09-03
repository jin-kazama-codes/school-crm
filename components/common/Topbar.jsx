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
  Key
} from "lucide-react";

import API from "../../apis";
import ChangePwModal from "../models/ChangePwModal";
import { setAllSchools } from "../../redux/actions/SchoolAction";
import { ColorModeContext } from "../../theme";
import { Utility } from "../utility";

const Topbar = ({ roleName = null, rolePriority = null, isCollapsed, setIsCollapsed, schoolInfo }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [changePwModalOpen, setChangePwModalOpen] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [schoolObj, setSchoolObj] = useState({});
  const allSchools = useSelector((state) => state.allSchools);

  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const colorMode = useContext(ColorModeContext);
  
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 480;
  const isTab = typeof window !== "undefined" && window.innerWidth <= 920;
  const profileMenuRef = useRef(null);

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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsOpen(false);
    }, 6000);
    return () => clearTimeout(timeoutId);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDarkMode = document.documentElement.classList.contains("dark");

  return (
    <>
      <header className="sticky top-0 z-[1000] bg-white dark:bg-[#0f0f0f] border-b border-slate-100 dark:border-[#1a1a1a]/80 shadow-sm px-4 py-2 flex items-center justify-between transition-colors duration-300 min-h-[57px]">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {schoolName && rolePriority !== 1 && (
            <h1 className="text-xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 drop-shadow-sm tracking-tight hidden sm:block">
              {schoolName}
            </h1>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {rolePriority === 1 && (
            <div className="relative">
              <select
                className="appearance-none bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 text-sm rounded-xl px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer min-w-[150px] md:min-w-[200px]"
                value={schoolObj.id || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    remLocalStorage("schoolInfo");
                    window.location.reload();
                    return;
                  }
                  const selectedId = parseInt(val);
                  const selectedSchool = allSchools?.listData?.find(s => s.id === selectedId);
                  setSchoolObj({ id: selectedId, name: selectedSchool?.name });
                  API.CommonAPI.encryptText({ data: selectedId }).then(result => {
                    if (result.status === "Success") {
                      setLocalStorage("schoolInfo", result.data);
                      window.location.reload();
                    }
                  });
                }}
              >
                <option value="">All Schools</option>
                {allSchools?.listData?.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => {
              // We trigger the context toggle to let the app know, 
              // but we can also manually toggle dark mode on document element
              colorMode.toggleColorMode();
              if (isDarkMode) {
                document.documentElement.classList.remove('dark');
              } else {
                document.documentElement.classList.add('dark');
              }
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold text-sm shadow-sm hover:ring-2 ring-emerald-500/50 transition-all focus:outline-none"
            >
              {getInitials()}
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0f0f0f] rounded-2xl shadow-xl border border-slate-100 dark:border-[#1a1a1a] p-2 animate-in fade-in slide-in-from-top-2 z-50">
                <div className="px-3 py-3 border-b border-slate-100 dark:border-[#1a1a1a] text-center">
                  <p className="font-bold text-slate-800 dark:text-white truncate">{username}</p>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{role}</p>
                </div>
                
                <div className="p-1 space-y-1 mt-1">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setChangePwModalOpen(true);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#1a1a1a] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm text-slate-600 dark:text-slate-300"
                  >
                    <Key className="w-4 h-4" />
                    <span>Change Password</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 mt-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-rose-500/20"
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
