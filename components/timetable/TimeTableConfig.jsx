/* eslint-disable react-hooks/rules-of-hooks */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */
import { useSelector } from "react-redux";
import { useNavigate } from "@/lib/routerAdapter";
import { Pencil } from "lucide-react";

import { Utility } from "../utility";

export const datagridColumns = () => {
  const schoolClasses = useSelector((state) => state.schoolClasses);
  const allClasses = useSelector((state) => state.allClasses);
  const schoolSections = useSelector((state) => state.schoolSections);
  const allSections = useSelector((state) => state.allSections);

  const navigateTo = useNavigate();
  const { appendSuffix, findById, capitalizeEveryWord} = Utility();

  const handleActionEdit = (class_id, section_id, day, batch) => {
    navigateTo(`/time-table/update/${class_id}/${section_id}`, {
      state: { class_id: class_id, section_id: section_id, day: day, batch: batch }
    });
  };

  const columns = [
    {
      field: "class_id",
      headerName: "Class",
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderCell: (params) => {
        let className;
        let sectionName;

        if (allClasses?.listData?.length || allSections?.listData?.length) {
          className = findById(params?.row?.class_id, allClasses?.listData)?.class_name;
          sectionName = findById(params?.row?.section_id, allSections?.listData)?.section_name;
        } else if (schoolClasses?.listData?.length || schoolSections?.listData?.length) {
          className = findById(params?.row?.class_id, schoolClasses?.listData)?.class_name;
          sectionName = findById(params?.row?.section_id, schoolSections?.listData)?.section_name;
        }
        return (
          <div className="flex items-center justify-center w-full h-full font-medium">
            {className ? appendSuffix(className) : "/"} {sectionName}
          </div>
        );
      },
    },
    {
      field: "batch",
      headerName: "Batch",
      headerAlign: "center",
      align: "center",
      flex: 1,
      valueGetter: (value, row) => `${capitalizeEveryWord(row.batch) || ''} `
    },
    {
      field: "day",
      headerName: "Day",
      headerAlign: "center",
      align: "center",
      flex: 1,
      valueGetter: (value, row) => `${capitalizeEveryWord(row.day) || ''} `
    },
    {
      field: "action",
      headerName: "Action",
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderCell: ({ row: { class_id, section_id, day, batch } }) => {
        return (
          <div className="flex justify-center items-center w-full h-full">
            <button
              onClick={() => handleActionEdit(class_id, section_id, day, batch)}
              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];
  return columns;
};
