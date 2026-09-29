/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "@/lib/routerAdapter";
import PropTypes from "prop-types";

import {
  LayoutDashboard,
  Building2,
  Users,
  Bus,
  User,
  UserCircle,
  Calendar,
  ReceiptText,
  Activity,
  UserCheck,
  LayoutGrid,
  List,
  BookOpen,
  Settings,
  BookCopy,
  FileCheck,
  MessageSquare,
  Table,
  Hourglass,
  Flag,
  ChevronDown,
  ChevronRight,
  LogOut
} from "lucide-react";

import API from "../../apis";
import ProfileModal from "../models/ProfileModal";
import ChangePwModal from "../models/ChangePwModal";
import {
  setAllClasses,
  setSchoolClasses,
} from "../../redux/actions/ClassAction";
import { SidebarItem } from "./SidebarItem";
import { Utility } from "../utility";

import dpsImg from "../assets/schoolImg.jpg";

const Sidebar = ({ rolePriority, isCollapsed, setIsCollapsed, schoolInfo }) => {
  const [isSubMenuOpen, setIsubMenuOpen] = useState(false);
  const [schoolId, setSchoolId] = useState(null);
  const [schoolImg, setSchoolImg] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [changePwModalOpen, setChangePwModalOpen] = useState(false);
  const sidebarRef = React.useRef(null);

  const selected = useSelector((state) => state.menuItems.selected);
  const schoolClasses = useSelector((state) => state.schoolClasses);
  const allClasses = useSelector((state) => state.allClasses);

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 480;
  const isTab = typeof window !== "undefined" && window.innerWidth <= 920;

  // Track sidebar scroll position so it never jumps to top on menu item clicks
  const handleSidebarScroll = (e) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("sidebar_scroll_pos", String(e.currentTarget.scrollTop));
    }
  };

  useEffect(() => {
    if (sidebarRef.current && typeof window !== "undefined") {
      const saved = sessionStorage.getItem("sidebar_scroll_pos");
      if (saved !== null) {
        sidebarRef.current.scrollTop = Number(saved);
      }
    }
  }, [location.pathname]);
  
  const {
    fetchAndSetAll,
    fetchAndSetSchoolData,
    getLocalStorage,
    remLocalStorage,
    addClassKeyword,
  } = Utility();
  
  const classData =
    (schoolClasses?.listData?.length
      ? schoolClasses.listData
      : allClasses?.listData) || [];

  useEffect(() => {
    const schoolInfoLocal = getLocalStorage("schoolInfo");
  
    if (!schoolInfoLocal && (!allClasses || !allClasses.listData || allClasses.listData.length === 0)) {
      fetchAndSetAll(dispatch, setAllClasses, API.ClassAPI);
    } else if (schoolInfoLocal && (!schoolClasses || !schoolClasses.listData || schoolClasses.listData.length === 0)) {
      fetchAndSetSchoolData(dispatch, setSchoolClasses);
    }
  }, [(!allClasses || !allClasses.listData || allClasses.listData.length === 0), (!schoolClasses || !schoolClasses.listData || schoolClasses.listData.length === 0)]);

  useEffect(() => {
    if (!location.pathname.startsWith("/student/")) {
      getLocalStorage("class") ? remLocalStorage("class") : null;
    }
  }, [location.pathname]);

  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  useEffect(() => {
    setIsCollapsed(isTab);
  }, [isTab]);

  useEffect(() => {
    if (schoolInfo?.encrypted_id) {
      API.CommonAPI.decryptText(schoolInfo).then((result) => {
        if (result.status === "Success") {
           setSchoolId(parseInt(result?.data));
        }
      });
    }
  }, [schoolInfo?.encrypted_id]);

  useEffect(()=>{
    if(schoolId !== null){
       API.ImageAPI.getImage("school", schoolId )
       .then(res =>{
          setSchoolImg(res?.data?.[0]?.image_src);
       })
       .catch(() => {});
    }
  },[schoolId]);


  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
    window.location.reload();
  };

  const authUser = getLocalStorage("auth");
  const currentSchoolName = rolePriority > 1
    ? (authUser?.school || authUser?.designation?.charAt(0)?.toUpperCase() + authUser?.designation?.slice(1))
    : "The Skolar";

  return (
    <>
      <aside
        ref={sidebarRef}
        onScroll={handleSidebarScroll}
        className={`bg-white dark:bg-[#0f0f0f] border-r border-slate-100 dark:border-[#1a1a1a]/80 p-4 flex flex-col justify-between shrink-0 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto custom-scrollbar 
        ${isCollapsed ? "w-20 min-w-[5rem] max-w-[5rem] items-center px-2" : "w-64 min-w-[16rem] max-w-[16rem]"}`}
      >
      <div className="space-y-4 w-full">
        {/* Current Profile Details Card */}
        {authUser && (
          !isCollapsed ? (
            <div
              onClick={() => setProfileModalOpen(true)}
              className="bg-slate-50 dark:bg-[#141414] p-3 rounded-2xl border border-slate-100 dark:border-[#222] hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:bg-slate-100/80 dark:hover:bg-[#1a1a1a] flex items-center space-x-3 transition-all cursor-pointer shadow-2xs group active:scale-[0.98]"
              title="Click to view full user profile"
            >
              <img
                src={schoolImg || dpsImg?.src || dpsImg || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop"}
                alt="user"
                className="w-9 h-9 rounded-full object-cover border border-emerald-500/20 group-hover:border-emerald-500/50 transition-colors shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800 dark:text-gray-200 text-xs truncate leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {authUser?.username || authUser?.name || "superadmin"}
                </p>
                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 truncate leading-tight mt-0.5">
                  {authUser?.designation || authUser?.role || "Administrator"}
                </p>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setProfileModalOpen(true)}
              className="w-10 h-10 mx-auto rounded-2xl bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#222] hover:border-emerald-400 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 group"
              title="Click to view full user profile"
            >
              <img
                src={schoolImg || dpsImg?.src || dpsImg || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop"}
                alt="user"
                className="w-8 h-8 rounded-xl object-cover"
              />
            </button>
          )
        )}

        {/* Navigation Menu */}
        <nav className="space-y-1 text-xs font-semibold w-full">
          <SidebarItem
            title="Dashboard"
            to="/"
            icon={<LayoutDashboard className="w-4 h-4" />}
            selected={selected}
            rolePriority={rolePriority}
            menuVisibility={2}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <SidebarItem
            title="School"
            to="/school/listing"
            icon={<Building2 className="w-4 h-4" />}
            selected={selected}
            rolePriority={rolePriority}
            menuVisibility={1}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />

          <SidebarItem
            title="Student"
            to="/student/listing"
            icon={<Users className="w-4 h-4" />}
            selected={selected}
            rolePriority={rolePriority}
            menuVisibility={5}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />

          <SidebarItem
            title="Teacher"
            to="/teacher/listing"
            icon={<BookCopy className="w-4 h-4" />}
            selected={selected}
            rolePriority={rolePriority}
            menuVisibility={3}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <SidebarItem
            title="User"
            to="/user/listing"
            icon={<User className="w-4 h-4" />}
            selected={selected}
            rolePriority={rolePriority}
            menuVisibility={3}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <SidebarItem
            title="Generate ID Card"
            to="/generate-id-card/listing"
            icon={<MessageSquare className="w-4 h-4" />}
            selected={selected}
            rolePriority={rolePriority}
            menuVisibility={3}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <SidebarItem
            title="Employee"
            to="/employee/listing"
            icon={<UserCircle className="w-4 h-4" />}
            selected={selected}
            rolePriority={rolePriority}
            menuVisibility={3}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <SidebarItem
            title="Payment"
            to="/payment/listing"
            icon={<ReceiptText className="w-4 h-4" />}
            selected={selected}
            rolePriority={rolePriority}
            menuVisibility={3}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <SidebarItem
            title="Bus"
            to="/bus/listing"
            icon={<Bus className="w-4 h-4" />}
            selected={selected}
            rolePriority={rolePriority}
            menuVisibility={3}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <SidebarItem
            title="Holiday"
            to="/holiday/listing"
            icon={<Calendar className="w-4 h-4" />}
            selected={selected}
            rolePriority={rolePriority}
            menuVisibility={5}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <SidebarItem
            title="Marksheet"
            to="/marksheet/listing"
            icon={<FileCheck className="w-4 h-4" />}
            selected={selected}
            rolePriority={rolePriority}
            menuVisibility={4}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <SidebarItem
            title="School House"
            to="/school-house/listing"
            icon={<Flag className="w-4 h-4" />}
            selected={selected}
            rolePriority={rolePriority}
            menuVisibility={4}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <SidebarItem
            title="Attendance"
            to="/attendance/listing"
            icon={<UserCheck className="w-4 h-4" />}
            selected={selected}
            rolePriority={rolePriority}
            menuVisibility={4}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <SidebarItem
            title="School Duration"
            to="/school-duration/listing"
            icon={<Hourglass className="w-4 h-4" />}
            selected={selected}
            rolePriority={rolePriority}
            menuVisibility={4}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <SidebarItem
            title="Time Table"
            to="/time-table/listing"
            icon={<Table className="w-4 h-4" />}
            selected={selected}
            rolePriority={rolePriority}
            menuVisibility={4}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <SidebarItem
            title="Notice Board"
            to="/noticeboard/listing"
            icon={<MessageSquare className="w-4 h-4" />}
            selected={selected}
            rolePriority={rolePriority}
            menuVisibility={3}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <SidebarItem
            title="Homework"
            to="/homework/listing"
            icon={<BookOpen className="w-4 h-4" />}
            selected={selected}
            rolePriority={rolePriority}
            menuVisibility={4}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />

          {rolePriority < 2 && (
            <div className="pt-2">
              {!isCollapsed && (
                <h3 className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Configurations
                </h3>
              )}
              <SidebarItem
                title="Amenity"
                to="/amenity/listing"
                icon={<Activity className="w-4 h-4" />}
                selected={selected}
                rolePriority={rolePriority}
                menuVisibility={1}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
              />
              <SidebarItem
                title="Class"
                to="/class/listing"
                icon={<LayoutGrid className="w-4 h-4" />}
                selected={selected}
                rolePriority={rolePriority}
                menuVisibility={1}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
              />
              <SidebarItem
                title="Payment Method"
                to="/payment-method/listing"
                icon={<BookOpen className="w-4 h-4" />}
                selected={selected}
                rolePriority={rolePriority}
                menuVisibility={1}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
              />
              <SidebarItem
                title="Section"
                to="/section/listing"
                icon={<List className="w-4 h-4" />}
                selected={selected}
                rolePriority={rolePriority}
                menuVisibility={1}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
              />
              <SidebarItem
                title="Subject"
                to="/subject/listing"
                icon={<BookOpen className="w-4 h-4" />}
                selected={selected}
                rolePriority={rolePriority}
                menuVisibility={1}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
              />
              <SidebarItem
                title="Role"
                to="/role/listing"
                icon={<Settings className="w-4 h-4" />}
                selected={selected}
                rolePriority={rolePriority}
                menuVisibility={1}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
              />
            </div>
          )}

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-all cursor-pointer font-bold mt-2"
          >
            <div className="w-4 h-4 shrink-0 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </nav>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="pt-4 pb-6 border-t border-slate-100 dark:border-[#1a1a1a]/80 text-[10px] text-slate-400 dark:text-gray-500 shrink-0 mt-6 w-full">
          <p className="font-bold font-display text-slate-800 dark:text-white truncate">
            {currentSchoolName} Platform Suite
          </p>
          <p className="mt-0.5">School Management Suite v2.4</p>
          <p className="font-mono mt-1 text-[9px]">UTC: {new Date().toISOString().split("T")[0]}</p>
        </div>
      )}

      </aside>

      <ProfileModal
        openDialog={profileModalOpen}
        setOpenDialog={setProfileModalOpen}
        onOpenChangePassword={() => setChangePwModalOpen(true)}
      />

      <ChangePwModal
        openDialog={changePwModalOpen}
        setOpenDialog={setChangePwModalOpen}
      />
    </>
  );
};

Sidebar.propTypes = {
  rolePriority: PropTypes.number,
  isCollapsed: PropTypes.bool,
  setIsCollapsed: PropTypes.func,
  schoolInfo: PropTypes.object
};

export default Sidebar;
