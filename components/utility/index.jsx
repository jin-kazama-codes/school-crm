/* eslint-disable no-case-declarations */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import axios from "axios";
import API from "../../apis";
import config from "../config";

import { displayToast } from "../../redux/actions/ToastAction";

const { months } = config;

export const Utility = () => {

    /** Adds the keyword "Class" to a number, creating a formatted class representation.
     * @param {number} num - The number to be formatted.
     * @returns {string|number} - The formatted class representation with the keyword "Class" or the original number if not valid number.
     */
    const addClassKeyword = (num) => {
        console.log("nummmmm>>>", num);
        return isNaN(num) ? num : `Class ${num}`;

    };

    /** Appends a suffix to a number or converts specific string values to abbreviations.
     * @param {string|number} num - The number or string value to which the suffix or abbreviation will be appended.
     * @returns {string} - The original input with an appended suffix or abbreviation.
     */
    const appendSuffix = (num) => {
        if (isNaN(num)) {
            return num.toLowerCase() === "lower kindergarten" ? "LKG" :
                num.toLowerCase() === "upper kindergarten" ? "UKG" : num;
        }
        const specialCase = num >= 10 && num <= 20;
        const lastDigit = num % 10;

        switch (true) {
            case specialCase:
                return `${num}th`;
            case lastDigit === 1:
                return `${num}st`;
            case lastDigit === 2:
                return `${num}nd`;
            case lastDigit === 3:
                return `${num}rd`;
            default:
                return `${num}th`;
        }
    };

    /**
     * Function to capitalize the first letter of each word in a string
     * @param str - The string to be capitalized
     * @returns
     */
    const capitalizeEachWord = (str) => {
        if (!str) return '';
        return str
            .split(' ')
            .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '')
            .join(' ');
    };

    const capitalizeEveryWord = capitalizeEachWord;

    /** Determines the divider based on the duration type.
     * @param {string} duration - The type of duration (monthly, quarterly, half-yearly).
     * @returns {number} The divider value.
     */
    const createDivider = duration => {
        let divider;
        switch (duration) {
            case 'monthly':
                divider = 1;
                break;
            case 'quarterly':
                divider = 4;
                break;
            case 'half-yearly':
                divider = 2;
                break;
            default:
                divider = 0;
                break;
        }
        return divider;
    };

    /** Generates an array of dropdown options based on the divider value and session start month.
     * @param {number} divider - The divider value to determine the number of parts.
     * @param {string} session_start_month - The starting month of the session.
     * @returns {string[]} An array of dropdown options representing periods.
     */
    const createDropdown = (divider, session_start_month) => {
        // Find the index of the session start month in the months array
        const startMonthIndex = months.findIndex(month => month.toLowerCase() === session_start_month?.toLowerCase());

        // Helper function to rotate the array starting from the given index
        const rotateArray = (arr, index) => {
            return arr.slice(index).concat(arr.slice(0, index));
        };

        // Helper function to format a period string
        const formatPeriod = (startMonth, endMonth) => {
            return `${startMonth} - ${endMonth}`;
        };

        switch (divider) {
            case 0:
                return [];
            case 1:
                return rotateArray(months, startMonthIndex);
            case 2:
            case 3:
            case 4:
                const dropdownArray = [];
                const dropdownLength = months.length / divider;
                for (let i = 0; i < divider; i++) {
                    // The start index of the current dropdownArray
                    const start = (startMonthIndex + i * dropdownLength) % months.length;
                    const end = (start + dropdownLength - 1) % months.length;
                    dropdownArray.push(formatPeriod(months[start], months[end]));
                }
                return dropdownArray;
            default:
                return [];
        }

        //------------------------------earlier way of doing
        // const dropdownArray = [];
        // let index = startMonthIndex;        //earlier the index was 0, now it is startMonthIndex as 3 or 4 whatever
        // let periodLength = months.length / divider;

        // if (divider === 0) return [];
        // if (divider === 1) {
        //     const dropdownArray = months.slice(startMonthIndex).concat(months.slice(0, startMonthIndex));
        //     console.log(session_start_month, startMonthIndex, dropdownArray, 'session_month', 'startMonthIndex dropdownArray', divider)
        //     return dropdownArray;
        // }
        // if (divider > 1) {
        //     index = Math.floor(startMonthIndex / periodLength) * periodLength;
        //     console.log('inside if condition', index, divider)
        // }
        // while (divider--) {
        //     dropdownArray.push(`${months[index]} - ${months[(index + periodLength) % months.length]}`);
        //     console.log(`${months[index]} - ${months[(index + periodLength) % months.length]}`, dropdownArray, 'inside loop');

        //     index = (index + periodLength) % months.length;
        //     console.log(divider, index, 'divider', 'index', 'inside loop');
        // }
        // return dropdownArray;
    };

    /** Calculates the school fee based on the divider value. 
     * @param {number} divider - The divider value to determine the fee calculation method.
     * @param {number} amount - The total amount of school fee.
     * @returns {number} The calculated school fee.
     */
    const createSchoolFee = (divider, amount) => {
        switch (divider) {
            case 1:
                return Math.ceil(amount / 12);
            case 2:
                return Math.ceil(amount / 2);
            case 4:
                return Math.ceil(amount / 4);
            default:
                return amount; // Default to returning the total amount
        }
    };

    /** Creates a school code based on the provided name.
     * @param {string} name - The name used to generate the school code.
     * @returns {string} - The generated school code.
     */
    const createSchoolCode = (name) => {
        let school = name.toLowerCase().split(" ");
        let code = '';

        for (let name of school) {
            if (name !== 'school')
                code += name.charAt(0).toUpperCase();
        }
        return `${code}S${Math.floor(Math.random() * 1000)}`;
    };

    /** Creates an array of academic sessions based on the current year.
     * @returns {Array} - An array containing three academic session strings.
     *                    [previousSession, currentSession, nextSession]
     */
    const createSession = () => {
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        const previousYear = currentYear - 1;

        return [`${previousYear - 1}-${previousYear}`, `${previousYear}-${currentYear}`, `${currentYear}-${nextYear}`]
    };

    /** Custom sorting function for sorting objects based on the class_name property, prioritizes non-numeric classnames.
    * @param {Object} a - The first object to compare.
    * @param {Object} b - The second object to compare.
    * @returns {number} - A negative value if a should be sorted before b, a positive value if b should be sorted before a, or 0 if they are equal.
    */
    const customSort = (a, b) => {
        // Check if both class names are non-numeric
        const isANonNumeric = isNaN(a.class_name);
        const isBNonNumeric = isNaN(b.class_name);

        // Sort non-numeric classes to the top
        if (isANonNumeric && !isBNonNumeric) {
            return -1;
        } else if (!isANonNumeric && isBNonNumeric) {
            return 1;
        }

        // If both are numeric or both are non-numeric, use localeCompare
        return a.class_name.localeCompare(b.class_name);
    };

    /** Creates a unique data array based on specified keys from the dataArray.
     * @param {Array} dataArray - The array of objects.
     * @param {string} key1 - The first key to consider for uniqueness.
     * @param {string} key2 - The second key to consider for uniqueness.
     * @returns {Array} - An array of unique objects based on the specified keys.
     */
    const createUniqueDataArray = (dataArray, key1, key2, key3 = null) => {
        const uniqueDataArray = new Set();

        dataArray.forEach(obj => {
            let combinedKeys = `${obj[key1]}+${obj[key2]}`;
            uniqueDataArray.add(key3 ? `${combinedKeys}+${obj[key3]}` : combinedKeys);
        });
        // Convert the Set back to an array of unique objects
        return Array.from(uniqueDataArray).map(compoundKey => {
            const [id, name, sub] = compoundKey.split('+');
            let obj = {
                [key1]: parseInt(id),
                [key2]: name
            };
            return key3 ? { ...obj, [key3]: sub } : obj;
        });
    };

    /** Fetches data from the specified API, dispatches the data to a Redux action and updates the state
     * @param {function} dispatch - The dispatch function from the Redux store.
     * @param {function} action - The Redux action to be dispatched with the fetched data.
     * @param {object} api - An object containing methods for interacting with the API.
     */
    const fetchAndSetAll = (dispatch, action, api) => {
        api.getAll(false, 0, 50)
            .then(res => {
                if (res?.status === 'Success') {
                    dispatch(action(res.data.rows));
                } else {
                    console.log("An Error Occurred, Please Try Again");
                }
            })
            .catch(err => {
                console.log('fetchandsetall function error:', err);
            });
    };

    /**Fetches school data (classes and optionally sections) from API and dispatches actions to update the Redux store.
     * @param {function} dispatch - The Redux dispatch function.
     * @param {function} setClassesAction - The Redux action to set classes in the store.
     * @param {function} [setSectionsAction] - The optional Redux action to set sections in the store.
     * @param {function} [setClassData] - The optional local state to set the data fetched from API call.
     */
    const fetchAndSetSchoolData = (dispatch, setClassesAction = false, setSectionsAction = false, setClassData = false) => {
        API.SchoolAPI.getSchoolClasses()
            .then(classData => {
                console.log(classData, "classdata>>")
                if (classData.status === 'Success') {
                    if (setClassesAction) {
                        const uniqueClassDataArray = createUniqueDataArray(classData.data, 'class_id', 'class_name');
                        dispatch(setClassesAction(uniqueClassDataArray));
                    }
                    if (setSectionsAction) {        //why is this required, needs to be tested
                        const uniqueSectionsDataArray = createUniqueDataArray(classData.data, 'section_id', 'section_name');
                        dispatch(setSectionsAction(uniqueSectionsDataArray));
                    }
                    if (setClassData) {    //setting all classData in local state
                        setClassData(classData.data);
                    }
                } else {
                    console.log("Error Fetching School Data, Please Try Again");
                }
            })
            .catch(err => {
                console.log("Error Fetching School Class Section Info:", err);
            });
    };

    /**Fetches school data (classes and optionally sections) from API and dispatches actions to update the Redux store.
     * @param {function} dispatch - The Redux dispatch function.
     * @param {function} setClassesAction - The Redux action to set classes in the store.
     * @param {function} [setSectionsAction] - The optional Redux action to set sections in the store.
     * @param {function} [setClassData] - The optional local state to set the data fetched from API call.
     */
    const fetchAndSetTeacherData = (dispatch, setClassesAction = false, setSectionsAction = false, setClassData = false) => {
        API.SchoolAPI.getTeacherClasses()
            .then(classData => {
                if (classData.status === 'Success') {
                    if (setClassesAction) {
                        const uniqueClassDataArray = createUniqueDataArray(classData.data, 'class_id', 'class_name');
                        dispatch(setClassesAction(uniqueClassDataArray));
                    }
                    if (setSectionsAction) {        //why is this required, needs to be tested
                        const uniqueSectionsDataArray = createUniqueDataArray(classData.data, 'section_id', 'section_name');
                        dispatch(setSectionsAction(uniqueSectionsDataArray));
                    }
                    if (setClassData) {    //setting all classData in local state
                        setClassData(classData.data);
                    }
                } else {
                    console.log("Error Fetching School Data, Please Try Again");
                }
            })
            .catch(err => {
                console.log("Error Fetching School Class Section Info:", err);
            });
    };


    /** Finds an object in a collection by its ID.
     * @param {number} id - The ID to search for.
     * @param {Array} model - The collection (array of objects) to search within.
     * @returns {Object|string} - The found object with the specified ID, or an empty string if not found.
     */
    const findById = (id, model) => {
        if (!model || !id) {
            return [];
        }
        return model.find((obj => obj.id === id || obj.class_id === id || obj.section_id === id));
    };

    /** Finds multiple objects in a collection by their IDs.
     * @param {Array} ids - The array of IDs to search for.
     * @param {Array} model - The collection (array of objects) to search within.
     * @returns {Array} - An array containing the found objects with the specified IDs.
     */
    const findMultipleById = (ids, model) => {
        if (!ids || !model) {
            return [];
        }
        return model.filter(obj => ids.split(',').indexOf(obj.id.toString()) > -1);
    };

    /** Formats date value into a string in the format: "DD-MMM-YYYY".
     * @param {string | number | Date} value - The date value to format.
     * @returns {string} - The formatted date string.
     */
    const formatDate = (value) => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return value;
        }
        const day = date.getDate();
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();

        // Construct the formatted date string in the format: "DD-MMM-YYYY"
        const formattedDate = `${day}-${month}-${year}`;
        return formattedDate;
    };

    /** Formats an image name by appending a random number and removing special characters.
     * @param {string} name - The original image name.
     * @returns {string} - The formatted image name.
     */
    const formatImageName = (name) => {
        const formattedName = Math.ceil(Math.random() * 100000000) + name
            .toLowerCase()
            .trim()
            .replace(/[!@#$%^&*();:'"`~`'$]/g, "")
            .replace(/\s+/g, "_");
        return formattedName;
    };

    /** Gets user initials from the first and last name stored in auth information.
     * @returns {string} - User initials.
     */
    const getInitials = () => {
        const authInfo = getLocalStorage("auth");
        const rawName = String(authInfo?.username || '').trim();
        if (rawName) {
            const parts = rawName.split(" ");
            const firstNameInitial = parts[0]?.[0]?.toUpperCase() || '';
            const lastNameInitial = parts[1]?.[0]?.toUpperCase() || '';

            return `${firstNameInitial} ${lastNameInitial}`.trim() || 'U';
        }
        return 'U';
    };

    /** Gets formatted username and role based on the provided role name.
     * @param {string} roleName - The role name to be formatted.
     * @returns {Object} - An object containing formatted username and role.
     */
    const getNameAndType = (roleName) => {
        const authInfo = getLocalStorage("auth");
        const rawUsername = String(authInfo?.username || '').trim();
        const fullName = rawUsername ? rawUsername.split(" ") : [];
        const firstName = fullName[0] ? fullName[0].charAt(0).toUpperCase() + fullName[0].slice(1) : '';
        const lastName = fullName[1] ? fullName[1].charAt(0).toUpperCase() + fullName[1].slice(1) : '';

        let roleStr = '';
        if (typeof roleName === 'string' && isNaN(Number(roleName))) {
            roleStr = roleName;
        } else if (authInfo?.designation) {
            roleStr = String(authInfo.designation);
        } else if (roleName !== undefined && roleName !== null && roleName !== '') {
            const roleNum = Number(roleName);
            const roleMap = { 1: "Superadmin", 2: "Admin", 3: "Manager", 4: "Teacher", 5: "Student" };
            roleStr = roleMap[roleNum] || String(roleName);
        }

        const formattedRole = roleStr ? roleStr.charAt(0).toUpperCase() + roleStr.slice(1) : '';

        return {
            username: `${firstName} ${lastName}`.trim() || rawUsername || 'User',
            role: formattedRole,
        };
    };

    /** Extracts and concatenates IDs from array of objects.
     * @param {Array} array - The array of objects from which to extract IDs.
     * @returns {string} - A comma-separated string of IDs.
     */
    const getIdsFromObject = (array) => {
        let arrayId = [];
        if (Array.isArray(array)) {
            array.forEach(arr => {
                arrayId.push(arr.id);
            });
        }
        return arrayId.toString();
    };

    /** Get selected values by matching IDs from a comma-separated string.
     * @param {string} - A comma-separated string of IDs.
     * @returns {Array} - An array of objects of selected values.
     */
    // remove it
    const getValuesFromArray = (ids, model) => {
        const idArray = ids?.split(",");
        if (idArray) {
            return model.filter(value => idArray.includes(value.id.toString()));
        }
    };

    /** Retrieves user role and priority information by making an asynchronous API call.
     * @returns {Promise<Object|null>} - A promise that resolves to an object containing user role and priority information,
     *                                   or null if there is an error during the API call.
     */
    const getRoleAndPriorityById = async () => {
        return API.UserRoleAPI.getRoleById({ id: getRole() })
            .then(res => {
                if (res.status === 'Success') {
                    return res.data;
                } else if (res.status === 'Error') {
                    console.log('Error Getting User Role And Priority')
                }
            })
            .catch(err => {
                console.error('Error fetching user role and priority:', err);
            })
    };

    /** Gets the value associated with a key from local storage.
     * @param {string} key - The key for which to retrieve the value from local storage.
     * @returns {any|null} - The value associated with the key, or null if the key is not found.
     */
    const getLocalStorage = (key) => {
        const storedValue = localStorage.getItem(key);
        if (typeof storedValue !== 'undefined' && storedValue !== null && storedValue !== 'undefined') {
            return JSON.parse(storedValue);
        }
        return null;
    };

    /** Retrieves the user's role from local storage.
     * @returns {string|null} - The user's role, or null if the role is not available in local storage.
     */
    const getRole = () => {
        const authData = getLocalStorage("auth");
        if (authData && authData.role !== undefined) {
            return authData.role;
        }
        return null;
    };

    /** Generates a random password of length 10, excluding certain special characters.
     * @returns { string } The generated password.
     */
    const generatePassword = () => {
        let pw = '';
        for (let i = 0; i < 10; i++) {
            const randomCharCode = Math.floor(Math.random() * 94) + 33;
            if ([34, 38, 60, 62, 44, 96, 39].includes(randomCharCode)) {
                pw += '#';
            } else {
                pw += String.fromCharCode(randomCharCode);
            }
        }
        return pw;
    };

    const formateName = async (name) => {
        // Split the name by spaces
        let nameParts = name.split(' ');

        // Remove "MR." prefix if it exists
        if (nameParts[0].toUpperCase() === "MR." ||
            nameParts[0].toUpperCase() === "MR" ||
            nameParts[0].toUpperCase() === "DR." ||
            nameParts[0].toUpperCase() === "DR" ||
            nameParts[0].toUpperCase() === "MD." ||
            nameParts[0].toUpperCase() === "MD" ||
            nameParts[0].toUpperCase() === "MRS." ||
            nameParts[0].toUpperCase() === "MRS" ||
            nameParts[0].toUpperCase() === "MOHD." ||
            nameParts[0].toUpperCase() === "MOHD") {
            nameParts.shift();
        }

        // Join the remaining parts back into a single string
        return nameParts.join(' ');
    };

    const generateNormalPassword = async (name, code) => {
        // Split the name by spaces
        let nameParts = name.split(' ');

        // Remove "MR." prefix if it exists
        if (nameParts[0].toUpperCase() === "MR." ||
            nameParts[0].toUpperCase() === "MR" ||
            nameParts[0].toUpperCase() === "DR." ||
            nameParts[0].toUpperCase() === "DR" ||
            nameParts[0].toUpperCase() === "MD." ||
            nameParts[0].toUpperCase() === "MD" ||
            nameParts[0].toUpperCase() === "MRS." ||
            nameParts[0].toUpperCase() === "MRS" ||
            nameParts[0].toUpperCase() === "MOHD." ||
            nameParts[0].toUpperCase() === "MOHD"
        ) {
            nameParts.shift();
        }

        // Extract the first name (assume the first name is the first part after "MR.")
        let firstName = nameParts[0].toLowerCase();

        // Construct the password
        let password = `${firstName}@${code.toLowerCase()}`;

        return password;
    };

    /** Checks if an object is empty (has no own enumerable properties).
    * @param {Object} obj - The object to be checked for emptiness.
    * @returns {boolean} - True if the object is empty, false otherwise.
    */
    const isObjEmpty = (obj) => {
        for (const prop in obj) {
            if (Object.hasOwn(obj, prop)) {
                return false;
            }
        }
        return true;
    };

    /** Removes a key-value pair from local storage.
     * @param {string} key - The key to be removed from local storage.
     * @returns {void} - This function does not return any value.
     */
    const remLocalStorage = (key) => {
        try {
            localStorage.removeItem(key);
        } catch (err) {
            console.error(`Error removing ${key} from localStorage:`, err);
        }
    };

    /** Sets a key-value pair in the local storage.
      * @param {string} key - The key to be set in local storage.
      * @param {any} value - The value associated with the key.
      * @returns {void} - This function does not return any value.
      */
    const setLocalStorage = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            console.error(`Error setting ${key} in localStorage:`, err);
        }
    };

    /** Displays a toast alert, sets its severity and message, and navigates to a specified path (optional) after a delay.
     * @param {function} dispatch - The Redux dispatch function.
     * @param {boolean} display - Whether to display the toast alert.
     * @param {string} severity - The severity level of the toast alert (e.g., 'success', 'info', 'warning', 'error').
     * @param {string} msg - The message to be displayed in the toast alert.
     * @param {function} navigateTo - The navigation function to be called after the delay.
     * @param {string|null} path - The optional path to navigate to after hiding the toast alert.
     * @returns {void} - This function does not return any value.
     */
    const toastAndNavigate = (dispatch, display, severity, msg, navigateTo, path = null, reload = false) => {
        dispatch(displayToast({ toastAlert: display, toastSeverity: severity, toastMessage: msg }));

        setTimeout(() => {
            dispatch(displayToast({ toastAlert: !display, toastSeverity: "", toastMessage: "" }));
            if (path) {
                navigateTo(path);
                if (reload) {
                    location.reload();
                }
            }
        }, 2000);
    };

    //this used to upload images on aws s3 bucket 
    // const uploadFile = async (image, folder) => {
    //     console.log("Starting upload process");

    //     // S3 Bucket Name
    //     const S3_BUCKET = "theskolar";

    //     // S3 Credentials (Ensure these are stored securely in environment variables in production)
    //     AWS.config.update({
    //         accessKeyId: ENV.NEXT_PUBLIC_AWS_KEY_ID,
    //         secretAccessKey: ENV.NEXT_PUBLIC_AWS_SECRET_KEY,
    //         region: ENV.NEXT_PUBLIC_AWS_REGION
    //     });

    //     const s3 = new AWS.S3();

    //     // Files Parameters
    //     const params = {
    //         Bucket: S3_BUCKET,
    //         Key: folder,
    //         Body: image
    //     };

    //     // Uploading file to S3
    //     try {
    //         const upload = s3.upload(params).on("httpUploadProgress", (evt) => {
    //             console.log("Uploading " + parseInt((evt.loaded * 100) / evt.total) + "%");
    //         }).promise();

    //         const data = await upload;
    //         console.log("File uploaded successfully.");
    //         alert("File uploaded successfully.");
    //         return data;

    //     } catch (error) {
    //         console.error("Error uploading file: ", error);
    //         alert("Error uploading file.");
    //     }
    // };

    /** Verifies a token using an asynchronous API call.
     * @returns {Promise<boolean|string>} - A promise that resolves to a boolean indicating whether the token is verified,
     *                                       or a string containing an error message if verification fails.
     */
    const verifyToken = async () => {
        return API.CommonAPI.verifyToken()
            .then(verified => {
                if (verified) {
                    return verified.data === "Verified";
                }
            })
            .catch(err => {
                return err;
            });
    };

    const getStateCityFromZipCode = async (zipcode) => {
        return new Promise(resolve => {
            axios(`https://api.postalpincode.in/pincode/${zipcode}`)
                .then(({ data: res }) => {
                    const dataObj = {
                        city: res[0].PostOffice[0].Block !== 'NA' ? res[0].PostOffice[0].Block : res[0].PostOffice[1]?.Block,
                        state: res[0].PostOffice[0].State
                    };
                    resolve(dataObj);
                })
                .catch(err => {
                    resolve(err);
                });
        });
    };

    return {
        addClassKeyword,
        appendSuffix,
        capitalizeEveryWord,
        capitalizeEachWord,
        createDivider,
        createDropdown,
        createSchoolFee,
        createSchoolCode,
        createSession,
        customSort,
        createUniqueDataArray,
        fetchAndSetAll,
        fetchAndSetSchoolData,
        fetchAndSetTeacherData,
        findById,
        findMultipleById,
        formatDate,
        formatImageName,
        formateName,
        getInitials,
        getNameAndType,
        getLocalStorage,
        getRole,
        getRoleAndPriorityById,
        getIdsFromObject,
        getValuesFromArray,
        generatePassword,
        generateNormalPassword,
        isObjEmpty,
        remLocalStorage,
        setLocalStorage,
        toastAndNavigate,
        verifyToken,
        getStateCityFromZipCode
    };
};
