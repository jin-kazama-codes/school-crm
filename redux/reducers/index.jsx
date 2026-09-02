/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { combineReducers } from "redux";

import { authReducer } from "./AuthReducer";
import { displayToastReducer } from "./ToastReducer";
import { menuItemReducer } from "./MenuItemReducer";
import { setEmployeesReducer } from "./EmployeeReducer";
import { setGenerateIdCardReducer } from "./GenerateIdCardReducer";
import { setHolidaysReducer } from "./HolidayReducer";
import { setMarksheetsReducer } from "./MarksheetReducer";
import { setPaymentsReducer } from "./PaymentReducer";
import { setAllPaymentMethodsReducer } from "./PaymentMethodReducer";
import { setListingPaymentMethodsReducer } from "./PaymentMethodReducer";
import { setAmenitiesReducer } from "./AmenityReducer";
import { setFormAmenitiesReducer } from "./AmenityReducer";
import { setBusesReducer } from "./BusReducer";
import { setAllClassesReducer } from "./ClassReducer";
import { setListingClassesReducer } from "./ClassReducer";
import { setSchoolClassesReducer } from "./ClassReducer";
import { setTeacherClassesReducer } from "./ClassReducer";
import { setAllSectionsReducer } from "./SectionReducer";
import { setListingSectionsReducer } from "./SectionReducer";
import { setSchoolSectionsReducer } from "./SectionReducer";
import { setTeacherSectionsReducer } from "./SectionReducer";
import { setAllSchoolsReducer } from "./SchoolReducer";
import { setListingSchoolsReducer } from "./SchoolReducer";
import { setListingSchoolHousesReducer } from "./SchoolHouseReducer";
import { setSchoolDurationsReducer } from "./SchoolDurationReducer";
import { setStudentsReducer } from "./StudentReducer";
import { setAllStudentsReducer } from "./StudentReducer";
import { setAllSubjectsReducer } from "./SubjectReducer";
import { setListingSubjectsReducer } from "./SubjectReducer";
import { setSchoolSubjectsReducer } from "./SubjectReducer";
import { setTeacherSubjectsReducer } from "./SubjectReducer";
import { setTimeTablesReducer } from "./TimeTableReducer";
import { setTeachersReducer } from "./TeacherReducer";
import { setAllTeachersReducer } from "./TeacherReducer";
import { setUsersReducer } from "./UserReducer";
import { setAllUserRolesReducer } from "./UserRoleReducer";
import { setListingUserRolesReducer } from "./UserRoleReducer";
import { setNoticeBoardReducer } from "./NoticeBoardReducer";

const reducers = combineReducers({
  auth: authReducer,
  allAmenities: setAmenitiesReducer,
  allFormAmenities: setFormAmenitiesReducer,
  allBuses: setBusesReducer,
  allClasses: setAllClassesReducer,
  listingClasses: setListingClassesReducer,
  schoolClasses: setSchoolClassesReducer,
  teacherClasses: setTeacherClassesReducer,
  allMarksheets: setMarksheetsReducer,
  allSections: setAllSectionsReducer,
  listingSections: setListingSectionsReducer,
  schoolSections: setSchoolSectionsReducer,
  teacherSections: setTeacherSectionsReducer,
  listingSchools: setListingSchoolsReducer,
  allSchools: setAllSchoolsReducer,
  listingSchoolHouses: setListingSchoolHousesReducer,
  allStudents: setStudentsReducer,
  allFormStudents: setAllStudentsReducer,
  allSubjects: setAllSubjectsReducer,
  listingSubjects: setListingSubjectsReducer,
  schoolSubjects: setSchoolSubjectsReducer,
  teacherSubjects: setTeacherSubjectsReducer,
  allTimeTables: setTimeTablesReducer,
  allTeachers: setTeachersReducer,
  allFormTeachers: setAllTeachersReducer,
  allUsers: setUsersReducer,
  allEmployees: setEmployeesReducer,
  allGenerateIdCards: setGenerateIdCardReducer,
  listingUserRoles: setListingUserRolesReducer,
  allUserRoles: setAllUserRolesReducer,
  allHolidays: setHolidaysReducer,
  allNotices: setNoticeBoardReducer,
  allPayments: setPaymentsReducer,
  listingPaymentMethods: setListingPaymentMethodsReducer,
  allPaymentMethods: setAllPaymentMethodsReducer,
  allSchoolDurations: setSchoolDurationsReducer,
  menuItems: menuItemReducer,
  toastInfo: displayToastReducer
});

export default reducers;
