// @ts-nocheck
"use client";

/**
 * ClientApp — SnailHRA-temp Layout Architecture
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
const HomeworkFormComponent = dynamic(() => import("@/components/homework/FormComponent"), { ssr: false });
const HomeworkListingComponent = dynamic(() => import("@/components/homework/ListingComponent"), { ssr: false });

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

// Helper to resolve initial role synchronously from local storage
const getInitialUserRole = (): { name: string; priority: number | null } => {
  if (typeof window === "undefined") return { name: "superadmin", priority: 1 };
  try {
    const cachedRole = localStorage.getItem("userRole");
    if (cachedRole) {
      const parsed = JSON.parse(cachedRole);
      if (parsed && typeof parsed.priority === "number") return parsed;
    }
    const auth = localStorage.getItem("auth");
    if (auth) {
      const parsedAuth = JSON.parse(auth);
      if (parsedAuth?.rolePriority !== undefined && parsedAuth?.rolePriority !== null) {
        return { name: parsedAuth.role || "superadmin", priority: Number(parsedAuth.rolePriority) };
      }
      if (parsedAuth?.role === "superadmin" || parsedAuth?.role === 1 || parsedAuth?.role === "1") {
        return { name: "superadmin", priority: 1 };
      }
      if (parsedAuth?.role) {
        const numRole = Number(parsedAuth.role);
        if (!isNaN(numRole) && numRole >= 1 && numRole <= 5) {
          return { name: parsedAuth.designation || parsedAuth.role, priority: numRole };
        }
      }
    }
  } catch (e) {
    console.error("Error reading initial userRole", e);
  }
  return { name: "superadmin", priority: 1 };
};

// Pathname-based router
function renderRouteContent(pathname: string, userRole: { name: string; priority: number | null }, schoolInfo: unknown) {
  // If user role priority is unresolved, show a clean skeleton rather than 404
  if (userRole.priority === null || userRole.priority === undefined) {
    return (
      <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center gap-3 p-8">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-medium animate-pulse">Loading workspace...</span>
      </div>
    );
  }

  const priority = userRole.priority;
  const cleanPath = (pathname || "/").split("?")[0];
  const parts = cleanPath.split("/").filter(Boolean);
  const base = parts[0] || "";
  const sub = parts[1] || "";

  if (cleanPath === "/" || cleanPath === "" || base === "dashboard") {
    if (priority <= 3) {
      return <Dashboard rolePriority={priority} />;
    }
  }

  // Priority 1 only routes (Superadmin / System Configs)
  if (priority === 1) {
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

  // Priority <= 3 routes (Admins, Principals, Managers)
  if (priority <= 3) {
    if (base === "bus" && sub === "listing") return <BusListingComponent rolePriority={priority} />;
    if (base === "bus" && sub === "create") return <BusFormComponent />;
    if (base === "bus" && sub === "update") return <BusFormComponent />;
    if (base === "student" && sub === "create") return <StudentFormComponent />;
    if (base === "student" && sub === "update") return <StudentFormComponent />;
    if (base === "teacher" && sub === "create") return <TeacherFormComponent />;
    if (base === "teacher" && sub === "update") return <TeacherFormComponent />;
    if (base === "teacher" && sub === "listing") return <TeacherListingComponent rolePriority={priority} />;
    if (base === "user" && sub === "create") return <UserFormComponent rolePriority={priority} />;
    if (base === "user" && sub === "update") return <UserFormComponent rolePriority={priority} />;
    if (base === "user" && sub === "listing") return <UserListingComponent />;
    if (base === "employee" && sub === "create") return <EmployeeFormComponent />;
    if (base === "employee" && sub === "update") return <EmployeeFormComponent />;
    if (base === "employee" && sub === "listing") return <EmployeeListingComponent rolePriority={priority} />;
    if (base === "generate-id-card" && sub === "listing") return <GenerateIdCardComponent rolePriority={priority} />;
    if (base === "payment" && sub === "create") return <PaymentFormComponent rolePriority={priority} openDialog={true} />;
    if (base === "payment" && sub === "update") return <PaymentFormComponent rolePriority={priority} />;
    if (base === "payment" && sub === "listing") return <PaymentListingComponent rolePriority={priority} />;
    if (base === "noticeboard" && sub === "create") return <NoticeBoardFormComponent />;
    if (base === "noticeboard" && sub === "update") return <NoticeBoardFormComponent />;
    if (base === "noticeboard" && sub === "listing") return <NoticeBoardListing rolePriority={priority} />;
  }

  // Priority <= 4 routes (Teachers, Staff)
  if (priority <= 4) {
    if (base === "homework" && sub === "create") return <HomeworkFormComponent />;
    if (base === "homework" && sub === "update") return <HomeworkFormComponent />;
    if (base === "homework" && sub === "listing") return <HomeworkListingComponent rolePriority={priority} />;
    if (base === "marksheet" && sub === "create") return <MarksheetFormComponent />;
    if (base === "marksheet" && sub === "update") return <MarksheetFormComponent />;
    if (base === "marksheet" && sub === "listing") return <MarksheetListingComponent rolePriority={priority} />;
    if (base === "school-duration" && sub === "create") return <SchoolDurationFormComponent />;
    if (base === "school-duration" && sub === "update") return <SchoolDurationFormComponent />;
    if (base === "school-duration" && sub === "listing") return <SchoolDurationListingComponent rolePriority={priority} />;
    if (base === "school-house" && sub === "create") return <SchoolHouseFormComponent />;
    if (base === "school-house" && sub === "update") return <SchoolHouseFormComponent />;
    if (base === "school-house" && sub === "listing") return <SchoolHouseListingComponent rolePriority={priority} />;
    if (base === "attendance" && sub === "listing") return <AttendanceComponent rolePriority={priority} />;
    if (base === "time-table" && sub === "create") return <TimeTableFormComponent />;
    if (base === "time-table" && sub === "update") return <TimeTableFormComponent />;
    if (base === "time-table" && sub === "listing") return <TimeTableListingComponent rolePriority={priority} />;
  }

  // Priority <= 5 routes (Students, Parents)
  if (priority <= 5) {
    if (base === "homework" && sub === "listing") return <HomeworkListingComponent rolePriority={priority} />;
    if (base === "student" && sub === "listing") return <StudentListingComponent rolePriority={priority} schoolInfo={schoolInfo} />;
    if (base === "holiday" && sub === "create") return <HolidayFormComponent />;
    if (base === "holiday" && sub === "update") return <HolidayFormComponent />;
    if (base === "holiday" && sub === "listing") return <HolidayListingComponent rolePriority={priority} />;
  }

  return <NotFound />;
}

export default function ClientApp() {
  const [userRole, setUserRole] = useState<{ name: string; priority: number | null }>(getInitialUserRole);
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
      if (result && typeof result.priority === "number") {
        setUserRole({ name: result.name, priority: result.priority });
        try {
          localStorage.setItem("userRole", JSON.stringify({ name: result.name, priority: result.priority }));
        } catch (e) {}
      }
    });
  }, []);

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
      {isLoggedIn && (
        <div className="min-h-screen flex flex-col font-sans bg-[#f8fafc] dark:bg-[#0a0a0a] text-slate-700 dark:text-gray-200 antialiased">
          {/* Top Full-Width Header Bar */}
          <Topbar
            roleName={userRole.name}
            rolePriority={userRole.priority}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            schoolInfo={schoolInfo}
          />

          {/* Main Layout (Sidebar + Content) */}
          <div className="flex-1 flex flex-row min-h-[calc(100vh-57px)] w-full">
            <Sidebar
              roleName={userRole.name}
              rolePriority={userRole.priority}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
              schoolInfo={schoolInfo}
            />
            <main className="flex-1 min-w-0 bg-[#f8fafc] dark:bg-[#0a0a0a] overflow-y-auto custom-scrollbar">
              <Suspense
                fallback={
                  <div className="p-8 text-center text-xs text-slate-400">
                    Loading workspace...
                  </div>
                }
              >
                {renderRouteContent(pathname || "/", userRole, schoolInfo)}
              </Suspense>
            </main>
          </div>
        </div>
      )}
    </ColorModeContext.Provider>
  );
}
