/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/
import { useDispatch, useSelector } from "react-redux";
import { Box, FormControl, useTheme } from "@mui/material";

import { tokens } from "../../theme";
import { useCommon } from "../hooks/common";
import { Utility } from "../utility";

//change name of dropdown to classsecdropdown
function DropDown({ marksheetClass = null, marksheetSection = null }) {
    const formClassesInRedux = useSelector(state => state.schoolClasses);
    const formSectionsInRedux = useSelector(state => state.schoolSections);

    const theme = useTheme();
    const dispatch = useDispatch();
    const colors = tokens(theme.palette.mode);
    const { getStudents } = useCommon();
    const { customSort, createUniqueDataArray, findById, setLocalStorage } = Utility();

    // const handleClassChange = (event) => {
    //     let localStorageValue = findById(event.target.value, formClassesInRedux?.listData);
    //     setLocalStorage("dropdown class", localStorageValue);
    //     dispatch(setMarksheetClass(findById(event.target.value, formClassesInRedux?.listData)));
    // };

    // const handleSectionChange = (event) => {
    //     let localStorageValue = findById(event.target.value, formSectionsInRedux?.listData);
    //     setLocalStorage("dropdown section", localStorageValue);
    //     dispatch(setMarksheetSection(findById(event.target.value, formSectionsInRedux?.listData)));
    // };

    //to be dicsussed
    // useEffect(() => {
    //     if (!formClassesInRedux?.listData[0]?.class_subjects || !formClassesInRedux?.listData?.length || !formSectionsInRedux?.listData?.length) {
    //         API.SchoolAPI.getSchoolClasses()
    //             .then(classData => {
    //                 if (classData.status === 'Success') {
    //                     classData.data.sort(customSort);

    //                     const uniqueClassDataArray = createUniqueDataArray(classData.data, 'class_id', 'class_name');
    //                     dispatch(setSchoolClasses(uniqueClassDataArray));

    //                     const uniqueSectionDataArray = createUniqueDataArray(classData.data, 'section_id', 'section_name');
    //                     dispatch(setSchoolSections(uniqueSectionDataArray));
    //                 }
    //             })
    //             .catch(err => {
    //                 console.log("Error Fetching ClassData:", err);
    //             });
    //     }
    // }, [formClassesInRedux.listData.length, formSectionsInRedux.listData.length]);

    // useEffect(() => {
    //     if (marksheetClass?.class_id && marksheetSection?.id) {
    //         getStudents(marksheetClass.class_id, marksheetSection.id, setStudents, API);
    //     }
    // }, [marksheetClass?.class_id, marksheetSection?.id]);

    return (
        <Box sx={{ display: "flex", marginRight: "10px", marginLeft: "10px" }}>
            <FormControl variant="filled" sx={{
                minWidth: 120, marginRight: "10px",
                "& .MuiInputBase-root": {
                    height: "44px"
                }
            }}>
                {/* <InputLabel id="classfield">Class</InputLabel>
                <Select
                    variant="filled"
                    labelId="classfield"
                    name="class_id"
                    value={selectedClass || ''}
                    onChange={handleClassChange}
                    sx={{ backgroundColor: colors.blueAccent[800] }}>
                    {formClassesInRedux?.listData?.length && formClassesInRedux.listData.map(cls => (
                        <MenuItem value={cls.class_id} key={cls.class_id}>
                            {cls.class_name}
                        </MenuItem>
                    ))}
                </Select> */}
            </FormControl>
            <FormControl variant="filled" sx={{
                minWidth: 120,
                "& .MuiInputBase-root": {
                    height: "44px"
                }
            }}>
                {/* <InputLabel id="sectionfield">Section</InputLabel>
                <Select
                    variant="filled"
                    labelId="sectionfield"
                    name="section_id"
                    value={selectedSection || ''}
                    onChange={handleSectionChange}
                    sx={{ backgroundColor: colors.greenAccent[600] }}>
                    {formSectionsInRedux?.listData?.length && formSectionsInRedux.listData.map(section => (
                        <MenuItem value={section.section_id} key={section.section_id}>
                            {section.section_name}
                        </MenuItem>
                    ))}
                </Select> */}
            </FormControl>
        </Box>
    )
}

export default DropDown;
