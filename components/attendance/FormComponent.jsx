/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useEffect } from "react";
import { useNavigate } from "@/lib/routerAdapter";
import Loader from "../common/Loader";

const FormComponent = () => {
  const navigateTo = useNavigate();

  useEffect(() => {
    // Attendance management is handled via the Attendance Desk & Quick Edit modal
    navigateTo("/attendance/listing");
  }, [navigateTo]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loader />
    </div>
  );
};

export default FormComponent;
