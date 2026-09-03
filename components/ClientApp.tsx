// @ts-nocheck
"use client";

/**
 * ClientApp — direct port of school-admin/src/App.jsx
 * 
 * Changes from original:
 * 1. react-router-dom -> next/navigation
 * 2. process.env.NEXT_PUBLIC_LOGOUT_TIMER -> process.env.NEXT_PUBLIC_LOGOUT_TIMER
 * 3. Wrapped all component imports with next/dynamic (ssr: false)
 */

import { lazy, Suspense, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";



import Login from "./login/Login";
import Topbar from "@/components/common/Topbar";
import Sidebar from "@/components/common/Sidebar";

import { ColorModeContext, useMode } from "@/theme";
import { Utility } from "@/components/utility";

import formBg from "@/components/assets/formBg.png";
import Image from "next/image";

// Dynamic imports (ssr: false for all heavy components with browser deps)
const Dashboard = dynamic(() => import("@/components/dashboard/Dashboard"), { ssr: false });
const NotFound = dynamic(() => import("@/components/404 page/Animated404Component"), { ssr: false });

const AmenityListingComponent = dynamic(() => import("@/components/amenities/ListingComponent"), { ssr: false });
const BusListingComponent = dynamic(() => import("@/components/bus/ListingComponent"), { ssr: false });
const BusFormComponent = dynamic(() => import("@/components/bus/FormComponent"), { ssr: false });
const ClassListingComponent = dynamic(() => import("@/components/class/ListingComponent"), { ssr: false });
const MarksheetFormComponent = dynamic(() => import("@/components/marksheet/FormComponent"), { ssr: false });
const MarksheetListingComponent = dynamic(() => import("@/components/marksheet/ListingComponent"), { ssr: false });
const SchoolFormComponent = dynamic(() => import("@/components/school/FormComponent"), { ssr: false });
const SchoolListingComponent = dynamic(() => import("@/components/school/ListingComponent"), { ssr: false });
const SectionListingComponent = dynamic(() => import("@/components/section/ListingComponent"), { ssr: false });
const StudentFormComponent = dynamic(() => import("@/components/student/FormComponent"), { ssr: false });
const StudentListingComponent = dynamic(() => import("@/components/student/ListingComponent"), { ssr: false });
const SubjectListingComponent = dynamic(() => import("@/components/subject/ListingComponent"), { ssr: false });
const TeacherFormComponent = dynamic(() => import("@/components/teacher/FormComponent"), { ssr: false });
const TeacherListingComponent = dynamic(() => import("@/components/teacher/ListingComponent"), { ssr: false });
const UserFormComponent = dynamic(() => import("@/components/user/FormComponent"), { ssr: false });
const UserListingComponent = dynamic(() => import("@/components/user/ListingComponent"), { ssr: false });
const EmployeeFormComponent = dynamic(() => import("@/components/employee/FormComponent"), { ssr: false });
const EmployeeListingComponent = dynamic(() => import("@/components/employee/ListingComponent"), { ssr: false });
const HolidayFormComponent = dynamic(() => import("@/components/holiday/FormComponent"), { ssr: false });
const HolidayListingComponent = dynamic(() => import("@/components/holiday/ListingComponent"), { ssr: false });
const PaymentFormComponent = dynamic(() => import("@/components/payment/FormInModalComponent"), { ssr: false });
const PaymentListingComponent = dynamic(() => import("@/components/payment/ListingComponent"), { ssr: false });
const PaymentMethodListingComponent = dynamic(() => import("@/components/paymentMethod/ListingComponent"), { ssr: false });
const SchoolDurationFormComponent = dynamic(() => import("@/components/schoolDuration/FormComponent"), { ssr: false });
const SchoolDurationListingComponent = dynamic(() => import("@/components/schoolDuration/ListingComponent"), { ssr: false });
const SchoolHouseFormComponent = dynamic(() => import("@/components/schoolHouse/FormComponent"), { ssr: false });
const SchoolHouseListingComponent = dynamic(() => import("@/components/schoolHouse/ListingComponent"), { ssr: false });
const TimeTableFormComponent = dynamic(() => import("@/components/timetable/FormComponent"), { ssr: false });
const TimeTableListingComponent = dynamic(() => import("@/components/timetable/ListingComponent"), { ssr: false });
const NoticeBoardFormComponent = dynamic(() => import("@/components/noticeboard/FormComponent"), { ssr: false });
const NoticeBoardListing = dynamic(() => import("@/components/noticeboard/ListingComponent"), { ssr: false });
const UserRoleListingComponent = dynamic(() => import("@/components/userRole/ListingComponent"), { ssr: false });
const ResetPasswordComponent = dynamic(() => import("@/components/resetPassword/ResetPw"), { ssr: false });
const AttendanceComponent = dynamic(() => import("@/components/attendance/ListingComponent"), { ssr: false });
const GenerateIdCardComponent = dynamic(() => import("@/components/generateIdCard/ListingComponent"), { ssr: false });

// Import idle timer dynamically (browser only)
const IdleTimerWrapper = dynamic(
  () =>
    import("react-idle-timer").then((mod) => {
      const IdleTimerInner = ({ onIdle, timeout }: { onIdle: () => void; timeout: number }) => {
        mod.useIdleTimer({ onIdle, timeout });
        return null;
      };
      return { default: IdleTimerInner };
    }),
  { ssr: false }
);

// Simple pathname-based router (replaces react-router-dom)
function renderRouteContent(pathname: string, userRole: { name: string; priority: number | null }, schoolInfo: unknown) {
  const parts = pathname.split("/").filter(Boolean);
  const base = parts[0];
  const sub = parts[1];
  const id = parts[2];

  if (pathname === "/" || pathname === "") {
    if (userRole.priority !== null && userRole.priority <= 3) {
      return <Dashboard rolePriority={userRole.priority} />;
    }
  }

  // Priority 1 only routes
  if (userRole.priority === 1) {
    if (base === "amenity" && sub === "listing") return <AmenityListingComponent />;
    if (base === "role" && sub === "listing") return <UserRoleListingComponent />;
    if (base === "school" && sub === "create") return <SchoolFormComponent />;
    if (base === "school" && sub === "update") return <SchoolFormComponent />;
    if (base === "school" && sub === "listing") return <SchoolListingComponent />;
    if (base === "class" && sub === "listing") return <ClassListingComponent />;
    if (base === "payment-method" && sub === "listing") return <PaymentMethodListingComponent />;
    if (base === "section" && sub === "listing") return <SectionListingComponent />;
    if (base === "subject" && sub === "listing") return <SubjectListingComponent />;
  }

  // Priority <= 3 routes
  if (userRole.priority !== null && userRole.priority <= 3) {
    if (base === "bus" && sub === "listing") return <BusListingComponent rolePriority={userRole.priority} />;
    if (base === "bus" && sub === "create") return <BusFormComponent />;
    if (base === "bus" && sub === "update") return <BusFormComponent />;
    if (base === "student" && sub === "create") return <StudentFormComponent />;
    if (base === "student" && sub === "update") return <StudentFormComponent />;
    if (base === "student" && sub === "listing") return <StudentListingComponent rolePriority={userRole.priority} schoolInfo={schoolInfo} />;
    if (base === "marksheet" && sub === "create") return <MarksheetFormComponent />;
    if (base === "marksheet" && sub === "update") return <MarksheetFormComponent />;
    if (base === "marksheet" && sub === "listing") return <MarksheetListingComponent rolePriority={userRole.priority} />;
    if (base === "teacher" && sub === "create") return <TeacherFormComponent />;
    if (base === "teacher" && sub === "update") return <TeacherFormComponent />;
    if (base === "teacher" && sub === "listing") return <TeacherListingComponent rolePriority={userRole.priority} />;
    if (base === "user" && sub === "create") return <UserFormComponent rolePriority={userRole.priority} />;
    if (base === "user" && sub === "update") return <UserFormComponent rolePriority={userRole.priority} />;
    if (base === "user" && sub === "listing") return <UserListingComponent />;
    if (base === "employee" && sub === "create") return <EmployeeFormComponent />;
    if (base === "employee" && sub === "update") return <EmployeeFormComponent />;
    if (base === "employee" && sub === "listing") return <EmployeeListingComponent rolePriority={userRole.priority} />;
    if (base === "generate-id-card" && sub === "listing") return <GenerateIdCardComponent rolePriority={userRole.priority} />;
    if (base === "holiday" && sub === "create") return <HolidayFormComponent />;
    if (base === "holiday" && sub === "update") return <HolidayFormComponent />;
    if (base === "holiday" && sub === "listing") return <HolidayListingComponent rolePriority={userRole.priority} />;
    if (base === "payment" && sub === "create") return <PaymentFormComponent rolePriority={userRole.priority} openDialog={true} />;
    if (base === "payment" && sub === "update") return <PaymentFormComponent rolePriority={userRole.priority} />;
    if (base === "payment" && sub === "listing") return <PaymentListingComponent rolePriority={userRole.priority} />;
    if (base === "school-duration" && sub === "create") return <SchoolDurationFormComponent />;
    if (base === "school-duration" && sub === "update") return <SchoolDurationFormComponent />;
    if (base === "school-duration" && sub === "listing") return <SchoolDurationListingComponent rolePriority={userRole.priority} />;
    if (base === "school-house" && sub === "create") return <SchoolHouseFormComponent />;
    if (base === "school-house" && sub === "update") return <SchoolHouseFormComponent />;
    if (base === "school-house" && sub === "listing") return <SchoolHouseListingComponent rolePriority={userRole.priority} />;
    if (base === "attendance" && sub === "listing") return <AttendanceComponent rolePriority={userRole.priority} />;
    if (base === "time-table" && sub === "create") return <TimeTableFormComponent />;
    if (base === "time-table" && sub === "update") return <TimeTableFormComponent />;
    if (base === "time-table" && sub === "listing") return <TimeTableListingComponent rolePriority={userRole.priority} />;
    if (base === "noticeboard" && sub === "create") return <NoticeBoardFormComponent />;
    if (base === "noticeboard" && sub === "update") return <NoticeBoardFormComponent />;
    if (base === "noticeboard" && sub === "listing") return <NoticeBoardListing rolePriority={userRole.priority} />;
  }

  // Priority 4 routes
  if (userRole.priority === 4) {
    if (base === "student" && sub === "listing") return <StudentListingComponent rolePriority={userRole.priority} />;
    if (base === "holiday" && sub === "listing") return <HolidayListingComponent rolePriority={userRole.priority} />;
    if (base === "marksheet" && sub === "listing") return <MarksheetListingComponent rolePriority={userRole.priority} />;
  }

  // Priority 5 routes
  if (userRole.priority === 5) {
    if (base === "student" && sub === "listing") return <StudentListingComponent rolePriority={userRole.priority} />;
    if (base === "holiday" && sub === "listing") return <HolidayListingComponent rolePriority={userRole.priority} />;
  }

  return <NotFound />;
}

export default function ClientApp() {
  const [userRole, setUserRole] = useState<{ name: string; priority: number | null }>({ name: "", priority: null });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, colorMode] = useMode();
  const router = useRouter();
  const pathname = usePathname();

  const { getLocalStorage, getRoleAndPriorityById, setLocalStorage, verifyToken } = Utility();
  const schoolInfo = getLocalStorage("schoolInfo");
  const currentSection = pathname?.split("/")?.[1] || "";

  const onIdle = () => {
    localStorage.clear();
    window.location.reload();
  };

  useEffect(() => {
    getRoleAndPriorityById().then((result: any) => {
      if (result) {
        setUserRole({ name: result.name, priority: result.priority });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getLocalStorage("auth")?.role]);

  useEffect(() => {
    verifyToken().then((result: any) => {
      if (!result && currentSection === "reset-password") {
        const parts = pathname?.split("/") || [];
        const token = parts[2];
        setLocalStorage("auth", { token });
        router.replace(`/reset-password/${token}`);
      } else if (!result && currentSection !== "login") {
        localStorage.clear();
        setLocalStorage("navigatedPath", currentSection);
        router.replace("/login");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoggedIn = getLocalStorage("auth")?.token;
  const isResetPw = currentSection === "reset-password";

  if (pathname === "/login") {
    return (
      <ColorModeContext.Provider value={colorMode}>
        <Login />
      </ColorModeContext.Provider>
    );
  }

  if (isResetPw) {
    return (
      <ColorModeContext.Provider value={colorMode}>
        <ResetPasswordComponent />
      </ColorModeContext.Provider>
    );
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
        <IdleTimerWrapper
          onIdle={onIdle}
          timeout={parseInt(process.env.NEXT_PUBLIC_LOGOUT_TIMER || "1800000")}
        />
        <div className="app">
          {isLoggedIn && (
            <Suspense
              fallback={
                <div>
                  <Image src={formBg?.src || formBg} alt="" style={{ backgroundSize: "cover" }} />
                </div>
              }
            >
              <div className="sidebar-container">
                <Sidebar
                  className="sidebar"
                  roleName={userRole.name}
                  rolePriority={userRole.priority}
                  isCollapsed={isCollapsed}
                  setIsCollapsed={setIsCollapsed}
                  schoolInfo={schoolInfo}
                />
              </div>
              <main className="content">
                <Topbar
                  roleName={userRole.name}
                  rolePriority={userRole.priority}
                  isCollapsed={isCollapsed}
                  setIsCollapsed={setIsCollapsed}
                  schoolInfo={schoolInfo}
                />
                {renderRouteContent(pathname || "/", userRole, schoolInfo)}
              </main>
            </Suspense>
          )}
        </div>
    </ColorModeContext.Provider>
  );
}
