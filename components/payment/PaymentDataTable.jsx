/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/
import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from "@/lib/routerAdapter";
import { Paperclip, ExternalLink } from 'lucide-react';

import API from "../../apis";
import { setPayments } from "../../redux/actions/PaymentAction";
import { setAllPaymentMethods } from "../../redux/actions/PaymentMethodAction";
import { Utility } from "../utility";
import { useCommon } from "../hooks/common";

const PaymentDataTable = () => {
    const allPayments = useSelector(state => state.allPayments);
    const allPaymentMethods = useSelector(state => state.allPaymentMethods);

    const dispatch = useDispatch();
    const { state } = useLocation();
    const { capitalizeEveryWord, formatDate, fetchAndSetAll } = Utility();
    const { getPaginatedData } = useCommon();
    const studentId = state?.id;
    let studentConditionObj = studentId
        ? {
            student_id: studentId
        }
        : null;

    useEffect(() => {
        getPaginatedData(0, 50, setPayments, API.PaymentAPI, studentConditionObj);
        if (!allPaymentMethods?.listData?.length) {
            fetchAndSetAll(dispatch, setAllPaymentMethods, API.PaymentMethodAPI);
        }
    }, [studentId]);

    const paymentRows = useMemo(() => {
        if (Array.isArray(allPayments?.listData)) return allPayments.listData;
        if (Array.isArray(allPayments?.listData?.rows)) return allPayments.listData.rows;
        return [];
    }, [allPayments?.listData]);

    const methodMap = useMemo(() => {
        const map = {};
        const list = Array.isArray(allPaymentMethods?.listData)
            ? allPaymentMethods.listData
            : (allPaymentMethods?.listData?.rows || []);
        list.forEach(m => {
            if (m.id) map[m.id] = m.name;
        });
        return map;
    }, [allPaymentMethods]);

    return (
        <div className="w-full bg-white dark:bg-[#161616] rounded-2xl shadow-xs overflow-hidden border border-slate-200/90 dark:border-[#262626]">
            <div className="overflow-x-auto">
                <table className="w-full text-xs text-left whitespace-nowrap">
                    <thead>
                        <tr className="bg-slate-100/80 dark:bg-[#202020] text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-[#282828] uppercase tracking-wider text-[11px]">
                            <th className="px-4 py-3.5 text-center">Session</th>
                            <th className="px-4 py-3.5 text-center">Fee Category</th>
                            <th className="px-4 py-3.5 text-center">Method</th>
                            <th className="px-4 py-3.5 text-center">Ref / UTR</th>
                            <th className="px-4 py-3.5 text-center">Type</th>
                            <th className="px-4 py-3.5 text-center">Period</th>
                            <th className="px-4 py-3.5 text-center">Discount</th>
                            <th className="px-4 py-3.5 text-center">Amount</th>
                            <th className="px-4 py-3.5 text-center">Status</th>
                            <th className="px-4 py-3.5 text-center">Payment Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#242424]">
                        {!paymentRows.length ? (
                            <tr>
                                <td colSpan={10} className="px-6 py-10 text-center text-slate-400 dark:text-slate-500 font-medium">
                                    No Payment Records Found for this Student
                                </td>
                            </tr>
                        ) : (
                            paymentRows.map((item, index) => {
                                const methodName = item.methodName || methodMap[item.method] || (item.method === 1 ? 'Cash' : (item.method === 2 ? 'Cheque' : (item.method === 3 ? 'Online' : 'Cash')));
                                const payStatus = (item.status || 'completed').toLowerCase();
                                const isCompleted = payStatus === 'completed';
                                const isPending = payStatus === 'pending';

                                return (
                                    <tr 
                                        key={item.id || index}
                                        className={`
                                            transition-colors duration-150
                                            ${index % 2 === 0 
                                                ? 'bg-white dark:bg-[#161616]' 
                                                : 'bg-slate-50/60 dark:bg-[#191919]'
                                            }
                                            hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20
                                        `}
                                    >
                                        <td className="px-4 py-3.5 text-center text-slate-700 dark:text-slate-300 font-medium font-mono">
                                            {item.academic_year || '—'}
                                        </td>
                                        <td className="px-4 py-3.5 text-center text-slate-800 dark:text-slate-200 font-semibold">
                                            {capitalizeEveryWord(item.fee) || '—'}
                                        </td>
                                        <td className="px-4 py-3.5 text-center text-slate-700 dark:text-slate-300">
                                            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#252525] text-slate-700 dark:text-slate-300 font-medium text-[11px] border border-slate-200/60 dark:border-[#333]">
                                                {capitalizeEveryWord(methodName) || 'Cash'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                <span>{item.reference_no || '—'}</span>
                                                {item.receipt_url && (
                                                    <a
                                                        href={item.receipt_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-200/60 dark:border-emerald-800/40 hover:underline"
                                                        title="View Payment Slip"
                                                    >
                                                        <Paperclip className="w-2.5 h-2.5" />
                                                        <span>Slip</span>
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-center text-slate-700 dark:text-slate-300">
                                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                                                {capitalizeEveryWord(item.type) || '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center text-slate-700 dark:text-slate-300 font-medium">
                                            {item.type_duration || '—'}
                                        </td>
                                        <td className="px-4 py-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                                            {item.discount_percent ? `${item.discount_percent}%` : '0%'}
                                        </td>
                                        <td className="px-4 py-3.5 text-center font-extrabold font-mono text-slate-900 dark:text-slate-100 text-sm">
                                            ₹{Number(item.final_amount || 0).toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                                isCompleted
                                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                                                    : isPending
                                                    ? 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40'
                                                    : 'bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40'
                                            }`}>
                                                {payStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center text-slate-500 dark:text-slate-400 text-xs">
                                            {item.created_at ? formatDate(item.created_at) : '—'}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentDataTable;
