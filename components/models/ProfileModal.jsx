/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Shield,
  Key,
  CheckCircle2,
  Calendar,
  Sparkles,
  Loader2
} from "lucide-react";
import API from "../../apis";
import { Utility } from "../utility";
import formBg from "../assets/formBg.png";

const ProfileModal = ({ openDialog, setOpenDialog, onOpenChangePassword }) => {
  const { getLocalStorage, getInitials, capitalizeEveryWord } = Utility();
  const authUser = getLocalStorage("auth") || {};
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (openDialog) {
      setLoading(true);
      API.UserAPI.profile()
        .then((res) => {
          setLoading(false);
          if (res?.data?.status === "Success" && res?.data?.data) {
            setProfileData(res.data.data);
          }
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [openDialog]);

  if (!openDialog || typeof document === "undefined") return null;

  const handleClose = () => {
    setOpenDialog(false);
  };

  const username = profileData?.username || authUser?.username || authUser?.name || "Admin User";
  const email = profileData?.email || authUser?.email || "—";
  const contactNo = profileData?.contact_no || authUser?.contact_no || authUser?.contact || "—";
  const schoolName = authUser?.school || "The Skolar";
  const designation = profileData?.designation || authUser?.designation || "Administrator";
  const roleVal = profileData?.role ?? authUser?.role;
  const roleMap = { 1: "Superadmin", 2: "Sub-admin", 3: "Manager", 4: "Teacher", 5: "Student" };
  const roleName = authUser?.roleName || authUser?.role_name || profileData?.role_name || (typeof roleVal === 'number' ? (roleMap[roleVal] || `Role ${roleVal}`) : (roleVal ? capitalizeEveryWord(String(roleVal)) : "User"));
  const priority = authUser?.rolePriority ?? authUser?.priority ?? (typeof roleVal === 'number' ? roleVal : 1);
  const gender = (profileData?.gender || authUser?.gender) ? capitalizeEveryWord(profileData?.gender || authUser?.gender) : "Not Specified";
  const status = (profileData?.status || authUser?.status) ? capitalizeEveryWord(profileData?.status || authUser?.status) : "Active";
  const rawCreatedAt = profileData?.created_at || authUser?.created_at;
  const createdAt = rawCreatedAt
    ? new Date(rawCreatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    : "—";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#141414] rounded-3xl shadow-2xl border border-slate-100 dark:border-[#222] overflow-hidden animate-in zoom-in-95 duration-200 relative"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0.94)), url(${formBg?.src || formBg})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover"
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#202020] transition-colors cursor-pointer z-10"
          title="Close Profile"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Card / User Summary */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-emerald-600/30">
                {getInitials() || "AD"}
              </div>
              <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#141414] absolute -bottom-1 -right-1 shadow-sm" />
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-xl font-black text-slate-900 dark:text-white truncate">
                  {username}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  {roleName} (Priority {priority})
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {designation}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            {/* School */}
            <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#1c1c1c]/90 border border-slate-200/80 dark:border-[#2a2a2a] flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">School Workspace</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{schoolName}</span>
              </div>
            </div>

            {/* Email */}
            <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#1c1c1c]/90 border border-slate-200/80 dark:border-[#2a2a2a] flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{email}</span>
              </div>
            </div>

            {/* Contact No */}
            <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#1c1c1c]/90 border border-slate-200/80 dark:border-[#2a2a2a] flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Number</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{contactNo}</span>
              </div>
            </div>

            {/* Gender */}
            <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#1c1c1c]/90 border border-slate-200/80 dark:border-[#2a2a2a] flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gender</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{gender}</span>
              </div>
            </div>

            {/* Account Status */}
            <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#1c1c1c]/90 border border-slate-200/80 dark:border-[#2a2a2a] flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate block">{status}</span>
              </div>
            </div>

            {/* Created At */}
            <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#1c1c1c]/90 border border-slate-200/80 dark:border-[#2a2a2a] flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-200 dark:bg-[#282828] text-slate-600 dark:text-slate-300 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Member Since</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{createdAt}</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
            {onOpenChangePassword && (
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onOpenChangePassword();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c1c1c] hover:bg-slate-50 dark:hover:bg-[#252525] text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all shadow-xs cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-emerald-500" />
                Change Password
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              Close Profile
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

ProfileModal.propTypes = {
  openDialog: PropTypes.bool,
  setOpenDialog: PropTypes.func,
  onOpenChangePassword: PropTypes.func
};

export default ProfileModal;
