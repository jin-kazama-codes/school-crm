/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from "@/lib/routerAdapter";

import API from "../../apis";
import { setPayments } from "../../redux/actions/PaymentAction";
import { Utility } from "../utility";
import { useCommon } from "../hooks/common";

const PaymentDataTable = () => {
    const allPayments = useSelector(state => state.allPayments);

    const { state } = useLocation();
    const { capitalizeEveryWord, formatDate } = Utility();
    const { getPaginatedData } = useCommon();
    const studentId = state?.id;
    let studentConditionObj = studentId
        ? {
            studentId: studentId
        }
        : null;


    useEffect(() => {
        getPaginatedData(0, 50, setPayments, API.PaymentAPI, studentConditionObj);
    }, []);

    return (
        <div className="w-[98%] mx-auto my-4 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-[#2a2a2a]">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead>
                        <tr className="bg-red-400 dark:bg-red-900/60 text-white font-semibold">
                            <th className="px-6 py-4 text-center border-r border-red-300 dark:border-red-800/50">Session</th>
                            <th className="px-6 py-4 text-center border-r border-red-300 dark:border-red-800/50 bg-red-300 dark:bg-red-800/60">Fee</th>
                            <th className="px-6 py-4 text-center border-r border-red-300 dark:border-red-800/50">Method</th>
                            <th className="px-6 py-4 text-center border-r border-red-300 dark:border-red-800/50 bg-red-300 dark:bg-red-800/60">Type</th>
                            <th className="px-6 py-4 text-center border-r border-red-300 dark:border-red-800/50">Period</th>
                            <th className="px-6 py-4 text-center border-r border-red-300 dark:border-red-800/50 bg-red-300 dark:bg-red-800/60">Discount</th>
                            <th className="px-6 py-4 text-center border-r border-red-300 dark:border-red-800/50">Amount</th>
                            <th className="px-6 py-4 text-center bg-red-300 dark:bg-red-800/60">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                        {!allPayments?.listData?.length ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 font-medium">
                                    No Record Found
                                </td>
                            </tr>
                        ) : (
                            allPayments.listData.map((item, index) => (
                                <tr 
                                    key={item.id}
                                    className={`
                                        transition-colors duration-150
                                        ${index % 2 === 0 
                                            ? 'bg-white dark:bg-[#1a1a1a]' 
                                            : 'bg-slate-50/50 dark:bg-slate-800/20'
                                        }
                                        hover:bg-red-50 dark:hover:bg-red-900/10
                                    `}
                                >
                                    <td className="px-6 py-4 text-center border-r border-slate-100 dark:border-slate-800/30 text-slate-700 dark:text-slate-300">
                                        {item.academic_year}
                                    </td>
                                    <td className="px-6 py-4 text-center border-r border-slate-100 dark:border-slate-800/30 text-slate-700 dark:text-slate-300 font-medium">
                                        {capitalizeEveryWord(item.fee)}
                                    </td>
                                    <td className="px-6 py-4 text-center border-r border-slate-100 dark:border-slate-800/30 text-slate-700 dark:text-slate-300">
                                        {capitalizeEveryWord(item.methodName)}
                                    </td>
                                    <td className="px-6 py-4 text-center border-r border-slate-100 dark:border-slate-800/30 text-slate-700 dark:text-slate-300">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                            {capitalizeEveryWord(item.type)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center border-r border-slate-100 dark:border-slate-800/30 text-slate-700 dark:text-slate-300">
                                        {item.type_duration}
                                    </td>
                                    <td className="px-6 py-4 text-center border-r border-slate-100 dark:border-slate-800/30 font-medium text-emerald-600 dark:text-emerald-400">
                                        {item.discount_percent}%
                                    </td>
                                    <td className="px-6 py-4 text-center border-r border-slate-100 dark:border-slate-800/30 font-bold text-slate-800 dark:text-slate-200">
                                        ₹ {item.final_amount}
                                    </td>
                                    <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                                        {formatDate(item.created_at)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentDataTable;
