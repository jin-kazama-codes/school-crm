/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Users, UserCog, Bus, GraduationCap, Building2, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';

import "../common/index.css";
import StatBox from "../common/StatBox";
import { studentData, schoolData } from "../common/CustomCharts";
import { Utility } from "../utility";
import API from "../../apis";

const Dashboard = ({ rolePriority = null }) => {
  const [dashboardCount, setDashboardCount] = useState({});
  const [schoolCapacity, setSchoolCapacity] = useState("");
  const [graphData, setGraphData] = useState();

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 480;
  const isTab = typeof window !== "undefined" && window.innerWidth <= 920;

  const allSchools = useSelector(state => state.allSchools);
  const { capitalizeEachWord, getLocalStorage } = Utility();
  const authUser = getLocalStorage("auth");

  const dashboardAttributes =
    rolePriority === 1
      ? ["student", "school", "teacher", "employee"]
      : rolePriority !== 1
        ? ["student", "bus", "teacher", "employee"]
        : null;

  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const chartBg = isDark ? "#0f0f0f" : "#ffffff";
  const textColor = isDark ? "#f1f5f9" : "#334155";
  const primaryColor = "#059669"; // emerald-600

  const options1 = {
    chart: {
      type: "spline",
      backgroundColor: chartBg,
      borderRadius: 16,
      width: null,
    },
    title: {
      text: "RESULT %",
      style: {
        color: textColor,
        fontSize: "18px",
        fontWeight: "bold",
      },
    },
    xAxis: {
      categories: rolePriority !== 1 ? studentData.map((dataPoint) => dataPoint.month) : schoolData.map((dataPoint) => dataPoint.years),
      labels: { style: { color: textColor } }
    },
    yAxis: {
      title: {
        text: `Number of ${rolePriority !== 1 ? "Students" : "Schools"}`,
        style: { color: textColor },
      },
      labels: { style: { color: textColor } }
    },
    tooltip: { shared: true },
    series: [
      {
        name: rolePriority !== 1 ? 'Passing %' : 'Schools Adding %',
        data: rolePriority !== 1 ? studentData.map((dataPoint) => dataPoint.students) : schoolData.map((dataPoint) => dataPoint.schools),
        color: primaryColor,
      }
    ],
  };

  const option = {
    chart: {
      type: "pie",
      backgroundColor: chartBg,
      borderRadius: 16,
      width: null,
    },
    title: {
      text: "Attendance Distribution",
      style: {
        color: textColor,
        fontSize: "18px",
        fontWeight: "bold",
      },
    },
    xAxis: {
      type: "datetime",
      title: { text: "Date", style: { color: textColor } },
      labels: { style: { color: textColor } }
    },
    yAxis: {
      title: { text: "Attendance Percentage", style: { color: textColor } },
      labels: { style: { color: textColor } }
    },
    tooltip: {
      shared: true,
      formatter: function () {
        return `<strong>${Highcharts.dateFormat("%Y-%m-%d", this.x)}</strong><br>${this.series.name}: ${this.y}%`;
      },
    },
    series: [
      {
        name: "Attendance Percentage",
        colorByPoint: true,
        data: [
          { name: "Class 1", y: 30, color: "#10b981" },
          { name: "Class 2", y: 40, color: "#059669" },
          { name: "Class 3", y: 30, color: "#14b8a6" },
          { name: "Class 4", y: 60, color: "#0d9488" },
          { name: "Class 5", y: 50, color: "#6366f1" },
          { name: "Class 6", y: 70, color: "#f59e0b" },
          { name: "Class 7", y: 30, color: "#f43f5e" },
          { name: "Class 8", y: 70, color: "#8b5cf6" },
          { name: "Class 9", y: 60, color: "#06b6d4" },
          { name: "Class 10", y: 50, color: "#10b981" },
          { name: "Class 11", y: 80, color: "#047857" },
        ],
      },
    ],
  };

  useEffect(() => {
    const promises = dashboardAttributes !== null
      ? dashboardAttributes.map((attribute) =>
        API.DashboardAPI.getDashboardCount(attribute)
          .then((data) => {
            if (data.status === "Success") return { [attribute]: data.data };
            else if (data.status === "Error") return { [attribute]: 0 };
            return { [attribute]: 0, error: "Unexpected status" };
          })
          .catch((error) => ({ [attribute]: 0, error }))
      )
      : null;

    Promise.all(promises)
      .then((results) => {
        const countObject = Object.assign({}, ...results);
        setDashboardCount(countObject);
      })
      .catch((error) => console.error("Error fetching dashboard counts:", error));
  }, []);

  useEffect(() => {
    if (getLocalStorage("auth")) {
      setSchoolCapacity(getLocalStorage("auth")?.school_capacity);
    }
  }, [getLocalStorage("auth")]);

  useEffect(() => {
    if (rolePriority !== 1) {
      API.DashboardAPI.getStudentGraphData()
        .then((data) => {
          if (data.status === "Success") setGraphData(data.data);
        })
        .catch(error => console.error("API error:", error));
    } else if (rolePriority === 1) {
      const data = [
        { name: 'Class A', passingPercentage: 80 },
        { name: 'Class B', passingPercentage: 75 },
        { name: 'Class C', passingPercentage: 90 },
        { name: 'Class D', primaryPercentage: 85 },
        { name: 'Class E', passingPercentage: 80 },
        { name: 'Class F', passingPercentage: 75 },
        { name: 'Class G', passingPercentage: 90 },
        { name: 'Class H', passingPercentage: 85 },
      ];
      setGraphData(data);
    }
  }, []);

  const currentSchoolName = authUser?.school || "The Skolar Platform";

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full animate-in fade-in duration-200">

      {/* ── TOP HERO ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Hero Banner (2 cols) */}
        <div className="lg:col-span-2 bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>THE SKOLAR WORKSPACE SUITE</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white leading-tight">
              Welcome back, {capitalizeEachWord(authUser?.username || authUser?.name || "Administrator")}!
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl leading-relaxed">
              Workspace Overview: Access real-time student rosters, faculty records, automated attendance, and school performance metrics.
            </p>
          </div>

          {/* Bottom info chips */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            <div className="bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              <p className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider">Designation</p>
              <p className="text-xs font-bold text-white mt-0.5">Superadmin</p>
            </div>
            <div className="bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              <p className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider">Clearance & Role</p>
              <p className="text-xs font-bold text-emerald-300 mt-0.5">{authUser?.role || "ADMIN"}</p>
            </div>
            <div className="bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              <p className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider">School Workspace</p>
              <p className="text-xs font-bold text-white mt-0.5">{currentSchoolName}</p>
            </div>
          </div>
        </div>

        {/* Right Desk Status Card (1 col) */}
        <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-100 dark:border-[#1a1a1a] p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold font-display text-slate-800 dark:text-white">
                {currentSchoolName} Desk
              </h2>
              <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {authUser?.role || "ADMIN"}
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-[#141414] rounded-xl p-3 border border-slate-100 dark:border-[#222] space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-gray-400 font-semibold">System Status:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ONLINE & SYNCED
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 dark:text-gray-400 font-semibold">Database Latency:</span>
              <span className="text-slate-700 dark:text-gray-200 font-mono font-bold text-[11px]">24ms</span>
            </div>
          </div>

          <div className="pt-2">
            <div className="w-full py-2.5 px-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-center">
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                School Management System v2.4
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── METRIC STAT CARDS ROW (4 CARDS) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* Card 1: Students */}
        <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-100 dark:border-[#1a1a1a] p-5 shadow-sm hover:shadow-md transition-shadow">
          <StatBox
            title={dashboardCount.student || 0}
            subtitle="TOTAL STUDENTS"
            showPercentage={true}
            progress={`${(dashboardCount.student || 0) / (schoolCapacity || 1)}`}
            increase={`${(((dashboardCount.student || 0) / (schoolCapacity || 1)) * 100).toFixed(2)}%`}
            icon={<GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            role={rolePriority}
            subtext="Enrolled active students"
          />
        </div>

        {/* Card 2: Schools or Buses */}
        {rolePriority === 1 ? (
          <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-100 dark:border-[#1a1a1a] p-5 shadow-sm hover:shadow-md transition-shadow">
            <StatBox
              title={dashboardCount.school || 0}
              subtitle="TOTAL SCHOOLS"
              progress={`${(dashboardCount.school || 0) / 500}`}
              increase={`${(((dashboardCount.school || 0) / 500) * 100).toFixed(2)}%`}
              icon={<Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
              role={rolePriority}
              subtext="Registered school branches"
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-100 dark:border-[#1a1a1a] p-5 shadow-sm hover:shadow-md transition-shadow">
            <StatBox
              title={dashboardCount.bus || 0}
              subtitle="TOTAL BUSES"
              progress={`${(dashboardCount.bus || 0) / 500}`}
              increase={`${(((dashboardCount.bus || 0) / 500) * 100).toFixed(2)}%`}
              icon={<Bus className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
              role={rolePriority}
              subtext="Active transport fleet"
            />
          </div>
        )}

        {/* Card 3: Teachers */}
        <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-100 dark:border-[#1a1a1a] p-5 shadow-sm hover:shadow-md transition-shadow">
          <StatBox
            title={dashboardCount.teacher || 0}
            subtitle="TOTAL TEACHERS"
            progress={`${(dashboardCount.teacher || 0) / 500}`}
            increase={`${(((dashboardCount.teacher || 0) / 500) * 100).toFixed(2)}%`}
            icon={<Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            role={rolePriority}
            subtext="Certified teaching staff"
          />
        </div>

        {/* Card 4: Employees */}
        <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-100 dark:border-[#1a1a1a] p-5 shadow-sm hover:shadow-md transition-shadow">
          <StatBox
            title={dashboardCount.employee || 0}
            subtitle="TOTAL EMPLOYEES"
            progress={`${(dashboardCount.employee || 0) / 500}`}
            increase={`${(((dashboardCount.employee || 0) / 500) * 100).toFixed(2)}%`}
            icon={<UserCog className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
            role={rolePriority}
            subtext="Administrative personnel"
          />
        </div>

      </div>

      {/* ── CHARTS ROW ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-100 dark:border-[#1a1a1a] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold font-display text-slate-800 dark:text-white">
                Class Performance & Results
              </h3>
              <p className="text-xs text-slate-400 dark:text-gray-500">
                Passing percentage distribution across classes
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={graphData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                <XAxis
                  fontSize={11}
                  dataKey={rolePriority === 1 ? "name" : "class_name"}
                  stroke={textColor}
                />
                <YAxis fontSize={11} stroke={textColor} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartBg,
                    borderColor: isDark ? '#222' : '#e2e8f0',
                    color: textColor,
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <defs>
                  <linearGradient id="emeraldBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <Bar
                  dataKey={rolePriority === 1 ? "passingPercentage" : "passing_percentage"}
                  name="Passing %"
                  fill="url(#emeraldBarGradient)"
                  radius={[8, 8, 0, 0]}
                  stroke="#059669"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Highcharts Chart */}
        <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-100 dark:border-[#1a1a1a] p-5 shadow-sm">
          {rolePriority !== 1 ? (
            <HighchartsReact highcharts={Highcharts} options={option} />
          ) : (
            <HighchartsReact highcharts={Highcharts} options={options1} />
          )}
        </div>
      </div>

    </div>
  );
};

Dashboard.propTypes = {
  rolePriority: PropTypes.number,
};

export default Dashboard;
