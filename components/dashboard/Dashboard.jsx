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
import { Box, Typography, useTheme, useMediaQuery, Paper } from "@mui/material";
import Groups3Icon from "@mui/icons-material/Groups3";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import EngineeringSharpIcon from "@mui/icons-material/EngineeringSharp";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';

import "../common/index.css";
import StatBox from "../common/StatBox";
import { tokens, themeSettings } from "../../theme";
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
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:480px)");
  const isTab = useMediaQuery("(max-width:920px)");
  const colors = tokens(theme.palette.mode);
  const { typography } = themeSettings(theme.palette.mode);
  const allSchools = useSelector(state => state.allSchools);

  const { getLocalStorage } = Utility();

  const dashboardAttributes =
    rolePriority === 1
      ? ["student", "school", "teacher", "employee"]
      : rolePriority !== 1
        ? ["student", "bus", "teacher", "employee"]
        : null;

  const options1 = {
    chart: {
      type: "spline",
      backgroundColor: colors.blueAccent[500],
      borderRadius: 6,
      width: null,
    },
    title: {
      text: "RESULT %",
      style: {
        color: colors.blueAccent[100],
        fontSize: `${typography.h3.fontSize}px`,
        fontWeight: "bold",
      },
    },
    xAxis: {
      categories: rolePriority !== 1 ? studentData.map((dataPoint) => dataPoint.month) : schoolData.map((dataPoint) => dataPoint.years),
    },
    yAxis: {
      title: {
        text: `Number of ${rolePriority !== 1 ? "Students" : "Schools"}`,
        style: {
          color: colors.greenAccent[400],
        },
      },
    },
    tooltip: {
      shared: true,
    },
    series: [
      {
        name: rolePriority !== 1 ? 'Passing %' : 'Schools Adding %',
        data: rolePriority !== 1 ? studentData.map((dataPoint) => dataPoint.students) : schoolData.map((dataPoint) => dataPoint.schools),
        color: colors.greenAccent[800],
      }
    ],
  };
  const option = {
    chart: {
      type: "pie",
      backgroundColor: colors.redAccent[800],
      borderRadius: 6,
      width: null,
    },
    title: {
      text: "Attendance Trends Over Time",
      style: {
        color: colors.grey[100],
        fontSize: `${typography.h3.fontSize}px`,
        fontWeight: "bold",
      },
    },
    xAxis: {
      type: "datetime",
      title: {
        text: "Date",
        style: {
          color: colors.grey[100],
        },
      },
    },
    yAxis: {
      title: {
        text: "Attendance Percentage",
        style: {
          color: colors.grey[100],
        },
      },
    },
    tooltip: {
      shared: true,
      formatter: function () {
        return `<strong>${Highcharts.dateFormat(
          "%Y-%m-%d",
          this.x
        )}</strong><br>${this.series.name}: ${this.y}%`;
      },
    },
    series: [
      {
        name: "Attendance Percentage",
        colorByPoint: true,
        data: [
          { name: "Class 1", y: 30, color: colors.blueAccent[600] },
          { name: "Class 2", y: 40, color: colors.greenAccent[600] },
          { name: "Class 3", y: 30, color: colors.redAccent[100] },
          { name: "Class 4", y: 60, color: colors.blueAccent[100] },
          { name: "Class 5", y: 50, color: colors.blueAccent[700] },
          { name: "Class 6", y: 70, color: colors.orangeAccent[100] },
          { name: "Class 7", y: 30, color: colors.redAccent[200] },
          { name: "Class 8", y: 70, color: colors.blueAccent[200] },
          { name: "Class 9", y: 60, color: colors.primary[800] },
          { name: "Class 10", y: 50, color: colors.primary[500] },
          { name: "Class 11", y: 80, color: colors.primary[600] },
        ],
        color: colors.blueAccent[600],
      },
    ],
  };

  useEffect(() => {
    const promises =
      dashboardAttributes !== null
        ? dashboardAttributes.map((attribute) =>
          API.DashboardAPI.getDashboardCount(attribute)
            .then((data) => {
              if (data.status === "Success") {
                return { [attribute]: data.data };
              } else if (data.status === "Error") {
                return { [attribute]: 0 };
              }
              // Run this if the status is neither 'Success' nor 'Error'
              return { [attribute]: 0, error: "Unexpected status" };
            })
            //Creating an object where attribute is the key and retrieved data is the value.
            .catch((error) => ({ [attribute]: 0, error }))
        )
        : null;

    Promise.all(promises)
      .then((results) => {
        //Combining the results of all promises into a single object using Object.assign({}, ...results)
        const countObject = Object.assign({}, ...results);
        setDashboardCount(countObject);
      })
      .catch((error) => {
        console.error("Error fetching dashboard counts:", error);
      });
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
          if (data.status === "Success") {
            setGraphData(data.data)
          }
        })
        .catch(error => {
          console.error("API error:", error);
        });
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
  }, [])

  return (
    <Box
      ml="10px"
      sx={{
        backgroundImage:
          theme.palette.mode == "light"
            ? `linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.3)), url(${dashBg})`
            : `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${dashBg})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "start",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography
          sx={{
            fontFamily: typography.fontFamily,
            fontSize: isMobile
              ? typography.h4.fontSize
              : typography.h2.fontSize,
            color: colors.grey[100],
            fontWeight: "600",
            display: "inline-block",
            backgroundColor:
              theme.palette.mode === "light" ? "white" : "transparent",
            lineHeight: "0.8",
            paddingTop: "15px",
          }}
        >
          Dashboard
        </Typography>
      </Box>
      {/* GRID & CHARTS */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : isTab ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
          gridTemplateRows: isMobile ? "0.1fr 0.1fr 2fr 2fr" : isTab ? "1fr 1fr 2fr 2fr" : "",
          gridTemplateAreas: isMobile ? `"box1 box2" "box3 box4" "chart1 chart1" "chart2 chart2"`
            : isTab ? `"box1 box2" "box3 box4" "chart1 chart1" "chart2 chart2"` :
              `"box1 box2 box3 box4" "chart1 chart1 chart2 chart2"`,
          gap: isMobile ? "15px" : "30px",
          margin: isMobile ? "10px" : "20px",
          flexWrap: "wrap",
        }}
      >
        {/* ROW 1 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: isMobile ? "8px" : "15px",
            borderRadius: "20px",
            gridArea: "box1",
            boxShadow: "rgb(38, 57, 77) 0px 20px 30px -10px;",
            backgroundImage:
              theme.palette.mode == "light"
                ? `linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url(${studentCountBg?.src || studentCountBg})`
                : `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${studentCountBg?.src || studentCountBg})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
            transition: "transform 0.3s ease-in-out",
            ":hover": {
              transform: "scale(1.1)",
            },
          }}
        >
          <StatBox
            title={dashboardCount.student}
            subtitle="Students"
            showPercentage={true}
            progress={`${dashboardCount.student / schoolCapacity}`}
            increase={`${((dashboardCount.student / schoolCapacity) * 100).toFixed(2)}%`}
            icon={<Groups3Icon sx={{ fontSize: isMobile ? "20px" : "26px" }} />}
            role={rolePriority}
          />
        </Box>

        {rolePriority === 1 ? (
          <Box
            sx={{
              backgroundColor: colors.yellowAccent[100],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "20px",
              padding: isMobile ? "8px" : "15px",
              gridArea: "box2",
              boxShadow: "rgb(38, 57, 77) 0px 20px 30px -10px;",
              backgroundImage:
                theme.palette.mode == "light"
                  ? `linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url(${schoolCountBg?.src || schoolCountBg})`
                  : `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${schoolCountBg?.src || schoolCountBg})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
              transition: "transform 0.3s ease-in-out",
              ":hover": {
                transform: "scale(1.1)",
              },
            }}
          >
            <StatBox
              title={dashboardCount.school}
              subtitle="schools"
              progress={`${dashboardCount.school / 500}`}
              increase={`${((dashboardCount.school / 500) * 100).toFixed(2)}%`}
              icon={
                <DirectionsBusIcon
                  sx={{ fontSize: isMobile ? "20px" : "26px" }}
                />
              }
              role={rolePriority}
            />
          </Box>
        ) : rolePriority !== 1 ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "20px",
              padding: isMobile ? "8px" : "15px",
              gridArea: "box2",
              boxShadow: "rgb(38, 57, 77) 0px 20px 30px -10px;",
              backgroundImage:
                theme.palette.mode == "light"
                  ? `linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url(${schoolbusCountBg?.src || schoolbusCountBg})`
                  : `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${schoolbusCountBg?.src || schoolbusCountBg})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
              transition: "transform 0.3s ease-in-out",
              ":hover": {
                transform: "scale(1.1)",
              },
            }}
          >
            <StatBox
              title={dashboardCount.bus}
              subtitle="Buses"
              progress={`${dashboardCount.bus / 500}`}
              increase={`${((dashboardCount.bus / 500) * 100).toFixed(2)}%`}
              icon={
                <DirectionsBusIcon
                  sx={{ fontSize: isMobile ? "20px" : "26px" }}
                />
              }
              role={rolePriority}
            />
          </Box>
        ) : null}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "20px",
            padding: isMobile ? "8px" : "15px",
            gridArea: "box3",
            boxShadow: "rgb(38, 57, 77) 0px 20px 30px -10px;",
            backgroundImage:
              theme.palette.mode == "light"
                ? `linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url(${teacherCountBg?.src || teacherCountBg})`
                : `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${teacherCountBg?.src || teacherCountBg})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "top",
            backgroundSize: "cover",
            transition: "transform 0.3s ease-in-out",
            ":hover": {
              transform: "scale(1.1)",
            },
          }}
        >
          <StatBox
            title={dashboardCount.teacher}
            subtitle="Teachers"
            progress={`${dashboardCount.teacher / 500}`}
            increase={`${((dashboardCount.teacher / 500) * 100).toFixed(2)}%`}
            icon={
              <Diversity3Icon sx={{ fontSize: isMobile ? "20px" : "26px" }} />
            }
            role={rolePriority}
          />
        </Box>
        <Box
          sx={{
            backgroundColor: colors.redAccent[700],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "20px",
            padding: isMobile ? "8px" : "15px",
            gridArea: "box4",
            boxShadow: "rgb(38, 57, 77) 0px 20px 30px -10px;",
            backgroundImage:
              theme.palette.mode == "light"
                ? `linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url(${employeeCountBg?.src || employeeCountBg})`
                : `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${employeeCountBg?.src || employeeCountBg})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
            transition: "transform 0.3s ease-in-out",
            ":hover": {
              transform: "scale(1.1)",
            },
          }}
        >
          <StatBox
            title={dashboardCount.employee}
            subtitle="employees"
            progress={`${dashboardCount.employee / 500}`}
            increase={`${((dashboardCount.employee / 500) * 100).toFixed(2)}%`}
            color="rgb(251 249 233)"
            icon={
              <EngineeringSharpIcon
                sx={{ fontSize: isMobile ? "20px" : "26px" }}
              />
            }
            role={rolePriority}
          />
        </Box>

        <Box
          sx={{
            width: isMobile ? "100%" : isTab ? "100%" : rolePriority === 1 ? "200%" : "135%",
            gridArea: "chart1",
            boxShadow: "rgb(38, 57, 77) 0px 20px 30px -10px;",
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          <Paper sx={{ padding: "0px", margin: "auto", backgroundColor: "lightblue" }}>
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 375 }>
              <BarChart
                data={graphData}
                margin={{
                  top: 20,
                  right:isMobile ? 10 : 30,
                  left: isMobile ? -25 : 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis fontSize={isMobile ? 8 : 15} dataKey={rolePriority === 1 ? "name" : "class_name"} />
                <YAxis fontSize={isMobile ? 10 : 15}/>
                <Tooltip />
                <Legend />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={1} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Bar
                  dataKey={rolePriority === 1 ? "passingPercentage" : "passing_percentage"}
                  fill="url(#colorGradient)"
                  radius={[10, 10, 0, 0]}
                  strokeWidth={2}
                  stroke="darkblue"
                  animationDuration={1000}
                  animationBegin={0}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

        {rolePriority !== 1 && <Box
          sx={{
            height: isMobile ? "100%" : isTab ? "100%" : "100%",
            width: isMobile ? "100%" : isTab ? "100%" : "70%",
            marginLeft: isMobile ? "0vh" : isTab ? "0vh" : "35%",
            gridArea: "chart2",
            boxShadow: "rgb(38, 57, 77) 0px 20px 30px -10px;",
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          <HighchartsReact highcharts={Highcharts} options={option} />
        </Box>}
      </Box>
    </Box>
  );
};
Dashboard.propTypes = {
  rolePriority: PropTypes.number,
};

export default Dashboard;
