/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

const config = {
    months: ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'],
    bloodGroups: {
        'A+': 'A+',
        'A-': 'A-',
        'B+': 'B+',
        'B-': 'B-',
        'AB+': 'AB+',
        'AB-': 'AB-',
        'O+': 'O+',
        'O-': 'O-'
    },
    casteGroups: {
        'general': 'General',
        'obc': 'OBC',
        'sc': 'SC',
        'st': 'St'
    },
    status: {
        'active': 'Active',
        'inactive': 'Inactive'
    },
    nationality: {
        'indian': 'Indian',
        'nri': 'NRI'
    },
    head: {
        '1': 'Appoint',
        '0': 'Not appointed'
    },
    fee_waiver_type: {
        'partial': 'Partial',
        'full': 'Full'
    },
    gender: {
        'male': 'Male',
        'female': 'Female',
        'other': 'Other'
    },
    admission_type: {
        'regular': 'Regular',
        'midsession': 'Mid-Session'
    },
    grade: {
        'primary_teacher': 'Primary Teacher',
        'trained_graduate_teacher': 'Trained Graduate Teacher',
        'post_graduate_teacher': 'Post Graduate Teacher'
    },
    fee: {
        'school': 'School',
        'bus': 'Bus'
    },
    payment_type: {
        'monthly': 'Monthly',
        'quarterly': 'Quarterly',
        'half-yearly': 'Half-Yearly',
        'annually': 'Annually'
    },
    holiday_type: {
        'school_closure': 'School Closure',
        'partial_closure': 'Partial Closure',
        'staff_only': 'Staff Only'
    },
    term: {
        'I': 'I',
        'II': 'II',
        'III': 'III'
    },
    day: {
        'monday': 'Monday',
        'tuesday': 'Tuesday',
        'wednesday': 'Wednesday',
        'thursday': 'Thursday',
        'friday': 'Friday',
        'saturday': 'Saturday'
    },
    schoolType: {
        'co-ed': 'Co-Ed',
        'boys': 'Boys',
        'girls': 'Girls'
    },
    subSchoolType: {
        'playgroup': 'Playgroup',
        'junior': 'Junior',
        'senior': 'Senior',
        'senior-sec': 'Senior-Sec'
    }
};

export default config;
