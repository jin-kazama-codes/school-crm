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

import { styled } from '@mui/material/styles';
import { Table, useTheme } from '@mui/material';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import API from "../../apis";

import { setPayments } from "../../redux/actions/PaymentAction";
import { tokens } from "../../theme";
import { Utility } from "../utility";
import { useCommon } from "../hooks/common";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

const PaymentDataTable = () => {
    const allPayments = useSelector(state => state.allPayments);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { state } = useLocation();
    const { capitalizeEveryWord, formatDate } = Utility();
    const { getPaginatedData } = useCommon();
    const studentId = state?.id;
    let studentConditionObj = studentId
        ? {
            studentId: studentId
        }
        : null;

    const tableHeaderCell = {
        border: `2px solid ${colors.whiteAccent[500]}`,
        color: colors.whiteAccent[800],
        fontSize: '16px',
        textAlign: 'center'
    };
    const tableBodyCell = {
        border: `2px solid ${colors.whiteAccent[500]}`,
        fontSize: '14px',
        textAlign: 'center'
    };

    useEffect(() => {
        getPaginatedData(0, 50, setPayments, API.PaymentAPI, studentConditionObj);
    }, []);

    return (
        <TableContainer component={Paper}
            sx={{ width: "98%", margin: '10px auto' }}>
            <Table sx={{ minWidth: 700, letterSpacing: "1px" }}
                aria-label="customized table">
                <TableHead>
                    <TableRow sx={{ backgroundColor: colors.redAccent[300] }}>
                        <TableCell sx={tableHeaderCell}>Session</TableCell>
                        <TableCell sx={[tableHeaderCell, { backgroundColor: colors.redAccent[200] }]}>Fee</TableCell>
                        <TableCell sx={tableHeaderCell}>Method</TableCell>
                        <TableCell sx={[tableHeaderCell, { backgroundColor: colors.redAccent[200] }]}>Type</TableCell>
                        <TableCell sx={tableHeaderCell}>Period</TableCell>
                        <TableCell sx={[tableHeaderCell, { backgroundColor: colors.redAccent[200] }]}>Discount</TableCell>
                        <TableCell sx={tableHeaderCell}>Amount</TableCell>
                        <TableCell sx={[tableHeaderCell, { backgroundColor: colors.redAccent[200] }]}>Date</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {!allPayments?.listData?.length ?
                        <StyledTableRow>
                            <TableCell component="th" scope="row" colSpan={8} sx={tableBodyCell}> No Record Found </TableCell>
                        </StyledTableRow>
                        :
                        allPayments.listData.map(item => (
                            <StyledTableRow key={item.id}>
                                <TableCell component="th" scope="row" sx={tableBodyCell}> {item.academic_year} </TableCell>
                                <TableCell sx={tableBodyCell}>{capitalizeEveryWord(item.fee)}</TableCell>
                                <TableCell sx={tableBodyCell}>{capitalizeEveryWord(item.methodName)}</TableCell>
                                <TableCell sx={tableBodyCell}>{capitalizeEveryWord(item.type)}</TableCell>
                                <TableCell sx={tableBodyCell}>{item.type_duration}</TableCell>
                                <TableCell sx={tableBodyCell}> {item.discount_percent}% </TableCell>
                                <TableCell sx={tableBodyCell}>&#8377; {item.final_amount}</TableCell>
                                <TableCell sx={tableBodyCell}>{formatDate(item.created_at)}</TableCell>
                            </StyledTableRow>
                        )
                        )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PaymentDataTable;
