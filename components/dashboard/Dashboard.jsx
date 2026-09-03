/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Users, UserCog, Bus, GraduationCap, Building2 } from "lucide-react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';

import "../common/index.css";
import StatBox from "../common/StatBox";
import { studentData, schoolData } from "../common/CustomCharts";
import { Utility } from "../utility";
import API from "../../apis";

import dashBg from "../assets/formBg.png";
import studentCountBg from "../assets/studentCountBg.png";
import schoolbusCountBg from "../assets/schoolbusCountBg.jpg";
import teacherCountBg from "../assets/teacherCountBg.png";
import employeeCountBg from "../assets/employeeCountBg.jpg";
import schoolCountBg from "../assets/schoolCountBg.jpg";

const Dashboard = ({ rolePriority = null }) => {
  const [dashboardCount, setDashboardCount] = useState({});
  const [schoolCapacity, setSchoolCapacity] = useState("");
  const [graphData, setGraphData] = useState();

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 480;
  const isTab = typeof window !== "undefined" && window.innerWidth <= 920;

  const allSchools = useSelector(state => state.allSchools);
  const { getLocalStorage } = Utility();

  const dashboardAttributes =
    rolePriority === 1
      ? ["student", "school", "teacher", "employee"]
      : rolePriority !== 1
        ? ["student", "bus", "teacher", "employee"]
        : null;

  const isDark = document.documentElement.classList.contains("dark");
  const chartBg = isDark ? "#1e293b" : "#ffffff";
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
        fontSize: "20px",
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
      text: "Attendance Trends Over Time",
      style: {
        color: textColor,
        fontSize: "20px",
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
          { name: "Class 1", y: 30, color: "#3b82f6" },
          { name: "Class 2", y: 40, color: "#10b981" },
          { name: "Class 3", y: 30, color: "#ef4444" },
          { name: "Class 4", y: 60, color: "#60a5fa" },
          { name: "Class 5", y: 50, color: "#1d4ed8" },
          { name: "Class 6", y: 70, color: "#f97316" },
          { name: "Class 7", y: 30, color: "#b91c1c" },
          { name: "Class 8", y: 70, color: "#2563eb" },
          { name: "Class 9", y: 60, color: "#1e40af" },
          { name: "Class 10", y: 50, color: "#3b82f6" },
          { name: "Class 11", y: 80, color: "#60a5fa" },
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
        { name: 'Class D', passingPercentage: 85 },
        { name: 'Class A', passingPercentage: 80 },
        { name: 'Class B', passingPercentage: 75 },
        { name: 'Class C', passingPercentage: 90 },
        { name: 'Class D', passingPercentage: 85 },
        { name: 'Class A', passingPercentage: 80 },
        { name: 'Class B', passingPercentage: 75 },
        { name: 'Class C', passingPercentage: 90 },
        { name: 'Class D', passingPercentage: 85 },
      ];
      setGraphData(data);
    }
  }, []);

  return (
    <div 
      className="min-h-screen w-full relative bg-fixed bg-cover bg-center p-4 md:p-8"
      style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${dashBg?.src || dashBg})` }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-md py-4">
          Dashboard
        </h1>
      </div>

      {/* GRID & CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* ROW 1 */}
        {/* Student Box */}
        <div 
          className="relative overflow-hidden rounded-[26px] p-6 shadow-xl transition-all duration-300 hover:scale-[1.02] bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${studentCountBg?.src || studentCountBg})` }}
        >
          <StatBox
            title={dashboardCount.student || 0}
            subtitle="Students"
            showPercentage={true}
            progress={`${(dashboardCount.student || 0) / (schoolCapacity || 1)}`}
            increase={`${(((dashboardCount.student || 0) / (schoolCapacity || 1)) * 100).toFixed(2)}%`}
            icon={<GraduationCap className="w-10 h-10 text-emerald-400" />}
            role={rolePriority}
          />
        </div>

        {/* Box 2: Schools or Buses */}
        {rolePriority === 1 ? (
          <div 
            className="relative overflow-hidden rounded-[26px] p-6 shadow-xl transition-all duration-300 hover:scale-[1.02] bg-cover bg-center"
            style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${schoolCountBg?.src || schoolCountBg})` }}
          >
            <StatBox
              title={dashboardCount.school || 0}
              subtitle="Schools"
              progress={`${(dashboardCount.school || 0) / 500}`}
              increase={`${(((dashboardCount.school || 0) / 500) * 100).toFixed(2)}%`}
              icon={<Building2 className="w-10 h-10 text-blue-400" />}
              role={rolePriority}
            />
          </div>
        ) : rolePriority !== 1 ? (
          <div 
            className="relative overflow-hidden rounded-[26px] p-6 shadow-xl transition-all duration-300 hover:scale-[1.02] bg-cover bg-center"
            style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${schoolbusCountBg?.src || schoolbusCountBg})` }}
          >
            <StatBox
              title={dashboardCount.bus || 0}
              subtitle="Buses"
              progress={`${(dashboardCount.bus || 0) / 500}`}
              increase={`${(((dashboardCount.bus || 0) / 500) * 100).toFixed(2)}%`}
              icon={<Bus className="w-10 h-10 text-yellow-400" />}
              role={rolePriority}
            />
          </div>
        ) : null}

        {/* Box 3: Teachers */}
        <div 
          className="relative overflow-hidden rounded-[26px] p-6 shadow-xl transition-all duration-300 hover:scale-[1.02] bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${teacherCountBg?.src || teacherCountBg})` }}
        >
          <StatBox
            title={dashboardCount.teacher || 0}
            subtitle="Teachers"
            progress={`${(dashboardCount.teacher || 0) / 500}`}
            increase={`${(((dashboardCount.teacher || 0) / 500) * 100).toFixed(2)}%`}
            icon={<Users className="w-10 h-10 text-purple-400" />}
            role={rolePriority}
          />
        </div>

        {/* Box 4: Employees */}
        <div 
          className="relative overflow-hidden rounded-[26px] p-6 shadow-xl transition-all duration-300 hover:scale-[1.02] bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${employeeCountBg?.src || employeeCountBg})` }}
        >
          <StatBox
            title={dashboardCount.employee || 0}
            subtitle="Employees"
            progress={`${(dashboardCount.employee || 0) / 500}`}
            increase={`${(((dashboardCount.employee || 0) / 500) * 100).toFixed(2)}%`}
            icon={<UserCog className="w-10 h-10 text-orange-400" />}
            role={rolePriority}
          />
        </div>

        {/* Charts Row */}
        <div className={`col-span-1 md:col-span-2 xl:col-span-2 shadow-2xl rounded-[26px] overflow-hidden bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-white/20 dark:border-white/5`}>
          <div className="p-4 md:p-6 h-full">
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 400}>
              <BarChart
                data={graphData}
                margin={{
                  top: 20,
                  right: isMobile ? 10 : 30,
                  left: isMobile ? -25 : 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis 
                  fontSize={isMobile ? 10 : 12} 
                  dataKey={rolePriority === 1 ? "name" : "class_name"} 
                  stroke={textColor}
                />
                <YAxis fontSize={isMobile ? 10 : 12} stroke={textColor} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: chartBg, 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    color: textColor,
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <Bar
                  dataKey={rolePriority === 1 ? "passingPercentage" : "passing_percentage"}
                  fill="url(#colorGradient)"
                  radius={[8, 8, 0, 0]}
                  strokeWidth={2}
                  stroke="#059669"
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {rolePriority !== 1 && (
          <div className="col-span-1 md:col-span-2 xl:col-span-2 shadow-2xl rounded-[26px] overflow-hidden bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-white/20 dark:border-white/5">
            <div className="p-4 md:p-6 h-full">
              <HighchartsReact highcharts={Highcharts} options={option} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

Dashboard.propTypes = {
  rolePriority: PropTypes.number,
};

export default Dashboard;
