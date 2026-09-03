/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "@/lib/routerAdapter";
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
  Menu,
  ChevronDown,
  ChevronRight
} from "lucide-react";

import API from "../../apis";
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

  const selected = useSelector((state) => state.menuItems.selected);
  const schoolClasses = useSelector((state) => state.schoolClasses);
  const allClasses = useSelector((state) => state.allClasses);

  const dispatch = useDispatch();
  const location = useLocation();
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 480;
  const isTab = typeof window !== "undefined" && window.innerWidth <= 920;
  
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

  const closeSubMenu = () => {
    if (isSubMenuOpen) {
      setIsubMenuOpen(false);
    }
  };

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
          setSchoolImg(res.data[0]?.image_src);
       })
    }
  },[schoolId]);

  const mapping = {
    "Pre Nursery": "PN",
    Nursery: "N",
    "Upper Kindergarten": "UKG",
    "Lower Kindergarten": "LKG",
  };

  const renderNotCollapsedStudents = () => {
    return (
      classData?.length > 0 &&
      classData.map((classs) => (
        <SidebarItem
          key={classs.class_id}
          title={`${addClassKeyword(classs.class_name)}`}
          to={`/student/listing/${classs.class_id}`}
          icon={<Building2 className="w-4 h-4 mr-2" />}
          selected={selected}
          rolePriority={rolePriority}
          menuVisibility={5}
          isSubMenu={true}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      ))
    );
  };

  const renderCollapsedStudents = () => {
    return (
      classData?.length > 0 &&
      classData.map((classs) => (
        <SidebarItem
          key={classs.class_id}
          to={`/student/listing/${classs.class_id}`}
          icon={<span className="text-[10px] font-bold">{mapping[classs.class_name] || classs.class_name.substring(0,2)}</span>}
          selected={selected}
          rolePriority={rolePriority}
          menuVisibility={5}
          isSubMenu={true}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      ))
    );
  };

  const currentSchoolName = rolePriority > 1
    ? getLocalStorage("auth")?.designation?.charAt(0)?.toUpperCase() + getLocalStorage("auth")?.designation?.slice(1)
    : "The Skolar";

  return (
    <aside
      className={`bg-white dark:bg-[#0f0f0f] border-r border-slate-100 dark:border-[#1a1a1a]/80 p-3 flex flex-col transition-all duration-300 overflow-y-auto custom-scrollbar shrink-0 h-screen sticky top-0 
      ${isCollapsed ? "w-20 items-center" : "w-64"}`}
    >
      {/* Header / Logo */}
      <div className={`flex items-center mb-6 mt-2 ${isCollapsed ? "justify-center" : "justify-between px-2"}`}>
        {!isCollapsed && (
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-white truncate pr-2">
            {currentSchoolName}
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* School/Profile Image */}
      {!isCollapsed && (
        <div className="flex justify-center mb-6">
          <img
            alt="profile-user"
            src={rolePriority > 1 ? (schoolImg ? schoolImg : (dpsImg?.src || dpsImg)) : (dpsImg?.src || dpsImg)}
            className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-emerald-500/20"
          />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <SidebarItem
          title="Dashboard"
          to="/"
          icon={<LayoutDashboard className="w-4.5 h-4.5" />}
          selected={selected}
          rolePriority={rolePriority}
          menuVisibility={2}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <SidebarItem
          title="School"
          to="/school/listing"
          icon={<Building2 className="w-4.5 h-4.5" />}
          selected={selected}
          rolePriority={rolePriority}
          menuVisibility={1}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* Submenu for Students */}
        {rolePriority < 5 ? (
          <div className="mb-1">
            <button
              onClick={() => setIsubMenuOpen(!isSubMenuOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-[#1a1a1a]/50 ${isCollapsed ? "justify-center" : ""}`}
            >
              <div className="flex items-center space-x-3 shrink-0">
                <Users className="w-4.5 h-4.5" />
                {!isCollapsed && <span className="text-xs font-semibold">Student</span>}
              </div>
              {!isCollapsed && (
                isSubMenuOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {/* Submenu Items */}
            {isSubMenuOpen && (
              <div className={`mt-1 overflow-hidden transition-all ${isCollapsed ? "space-y-1" : "ml-4 pl-2 border-l border-slate-100 dark:border-[#1a1a1a]"}`}>
                <SidebarItem
                  title="Student"
                  to="/student/listing"
                  icon={<Users className="w-4 h-4" />}
                  selected={selected}
                  rolePriority={rolePriority}
                  menuVisibility={5}
                  isSubMenu={true}
                  isCollapsed={isCollapsed}
                  setIsCollapsed={setIsCollapsed}
                />
                {isCollapsed ? renderCollapsedStudents() : renderNotCollapsedStudents()}
              </div>
            )}
          </div>
        ) : (
          <SidebarItem
            title="Student"
            to="/student/listing"
            icon={<Users className="w-4.5 h-4.5" />}
            selected={selected}
            rolePriority={rolePriority}
            menuVisibility={5}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        )}

        <div className="my-2 border-t border-slate-100 dark:border-[#1a1a1a]" />

        <SidebarItem
          title="Teacher"
          to="/teacher/listing"
          icon={<BookCopy className="w-4.5 h-4.5" />}
          selected={selected}
          rolePriority={rolePriority}
          menuVisibility={3}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <SidebarItem
          title="User"
          to="/user/listing"
          icon={<User className="w-4.5 h-4.5" />}
          selected={selected}
          rolePriority={rolePriority}
          menuVisibility={3}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <SidebarItem
          title="Generate ID Card"
          to="/generate-id-card/listing"
          icon={<MessageSquare className="w-4.5 h-4.5" />}
          selected={selected}
          rolePriority={rolePriority}
          menuVisibility={3}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <SidebarItem
          title="Employee"
          to="/employee/listing"
          icon={<UserCircle className="w-4.5 h-4.5" />}
          selected={selected}
          rolePriority={rolePriority}
          menuVisibility={3}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <SidebarItem
          title="Payment"
          to="/payment/listing"
          icon={<ReceiptText className="w-4.5 h-4.5" />}
          selected={selected}
          rolePriority={rolePriority}
          menuVisibility={3}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <SidebarItem
          title="Bus"
          to="/bus/listing"
          icon={<Bus className="w-4.5 h-4.5" />}
          selected={selected}
          rolePriority={rolePriority}
          menuVisibility={3}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <SidebarItem
          title="Holiday"
          to="/holiday/listing"
          icon={<Calendar className="w-4.5 h-4.5" />}
          selected={selected}
          rolePriority={rolePriority}
          menuVisibility={5}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <SidebarItem
          title="Marksheet"
          to="/marksheet/listing"
          icon={<FileCheck className="w-4.5 h-4.5" />}
          selected={selected}
          rolePriority={rolePriority}
          menuVisibility={4}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <SidebarItem
          title="School House"
          to="/school-house/listing"
          icon={<Flag className="w-4.5 h-4.5" />}
          selected={selected}
          rolePriority={rolePriority}
          menuVisibility={4}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <SidebarItem
          title="Attendance"
          to="/attendance/listing"
          icon={<UserCheck className="w-4.5 h-4.5" />}
          selected={selected}
          rolePriority={rolePriority}
          menuVisibility={4}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <SidebarItem
          title="School Duration"
          to="/school-duration/listing"
          icon={<Hourglass className="w-4.5 h-4.5" />}
          selected={selected}
          rolePriority={rolePriority}
          menuVisibility={4}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <SidebarItem
          title="Time Table"
          to="/time-table/listing"
          icon={<Table className="w-4.5 h-4.5" />}
          selected={selected}
          rolePriority={rolePriority}
          menuVisibility={4}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <SidebarItem
          title="Notice Board"
          to="/noticeboard/listing"
          icon={<MessageSquare className="w-4.5 h-4.5" />}
          selected={selected}
          rolePriority={rolePriority}
          menuVisibility={3}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {rolePriority < 2 && (
          <div className="mt-4">
            {!isCollapsed && (
              <h3 className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Configurations
              </h3>
            )}
            <SidebarItem
              title="Amenity"
              to="/amenity/listing"
              icon={<Activity className="w-4.5 h-4.5" />}
              selected={selected}
              rolePriority={rolePriority}
              menuVisibility={1}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
            <SidebarItem
              title="Class"
              to="/class/listing"
              icon={<LayoutGrid className="w-4.5 h-4.5" />}
              selected={selected}
              rolePriority={rolePriority}
              menuVisibility={1}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
            <SidebarItem
              title="Payment Method"
              to="/payment-method/listing"
              icon={<BookOpen className="w-4.5 h-4.5" />}
              selected={selected}
              rolePriority={rolePriority}
              menuVisibility={1}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
            <SidebarItem
              title="Section"
              to="/section/listing"
              icon={<List className="w-4.5 h-4.5" />}
              selected={selected}
              rolePriority={rolePriority}
              menuVisibility={1}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
            <SidebarItem
              title="Subject"
              to="/subject/listing"
              icon={<BookOpen className="w-4.5 h-4.5" />}
              selected={selected}
              rolePriority={rolePriority}
              menuVisibility={1}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
            <SidebarItem
              title="Role"
              to="/role/listing"
              icon={<Settings className="w-4.5 h-4.5" />}
              selected={selected}
              rolePriority={rolePriority}
              menuVisibility={1}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
          </div>
        )}
      </nav>
    </aside>
  );
};

Sidebar.propTypes = {
  rolePriority: PropTypes.number,
  isCollapsed: PropTypes.bool,
  setIsCollapsed: PropTypes.func,
  schoolInfo: PropTypes.object
};

export default Sidebar;
