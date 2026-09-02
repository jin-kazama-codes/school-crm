/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useEffect } from "react";
import PropTypes from "prop-types";

import { IconButton, ImageList, ImageListItem, Tooltip, useMediaQuery } from "@mui/material";
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';

import Loader from "../common/Loader";

const PreviewImage = ({
    formik,
    preview,
    setPreview,
    deletedImage = [],
    setDeletedImage,
    setDirty,
    imageFiles,
    imageType,
    ENV,
    updatedImage,
    setUpdatedImage
}) => {
    const isMobile = useMediaQuery("(max-width:480px)");
    const isTab = useMediaQuery("(max-width:920px)");

    // On form update
    useEffect(() => {
        const dbImgFiles = [];
        const pickerFiles = [];

        if (updatedImage) {
            let countOld = 0;
            updatedImage.map(img => {
                if (img.image_src) {
                    dbImgFiles.push({
                        key: 'old',
                        index: countOld,
                        value: `${img.image_src}`
                    });
                }
                countOld++;
            });
        }
        if (imageFiles) {
            let arrayOfImages = Array.from(imageFiles);
            let countNew = 0;
            for (const file of arrayOfImages) {
                pickerFiles.push({
                    key: 'new',
                    index: countNew,
                    value: URL.createObjectURL(file)
                });
                countNew++;
            }
        }
        setPreview([
            ...dbImgFiles,         //We are not doing ...preview because in imagePicker file we have already
            ...pickerFiles
        ]);
    }, [updatedImage?.length, imageFiles, setPreview]);

    useEffect(() => {
        // On new image selection through picker
        if (imageFiles) {
            const pickerFiles = [];
            const dbImgFiles = [];

            let arrayOfImages = Array.from(imageFiles);
            let countNew = 0;
            for (const file of arrayOfImages) {
                pickerFiles.push({
                    key: 'new',
                    index: countNew,
                    value: URL.createObjectURL(file)
                });
                countNew++;
            }

            if (updatedImage) {
                let countOld = 0;
                updatedImage.map(img => {
                    if (img.image_src) {
                        dbImgFiles.push({
                            key: 'old',
                            index: countOld,
                            value: `${img.image_src}`
                        });
                        countOld++;
                    }
                });
            }
            // Merge the preview values with already populated values during update otherwise just show prev
            setPreview([
                ...dbImgFiles,
                ...pickerFiles
            ]);
        }
    }, [imageFiles, setPreview, updatedImage]);

    const handleDeleteClick = (item) => {
        const previewIndex = preview.indexOf(item);
        preview.splice(previewIndex, 1);

        if (item?.index > -1) {
            // On image selection through image picker
            if (imageFiles && item.key === 'new') {
                const fileList = Array.from(imageFiles);
                fileList.splice(item.index, 1);
                // eslint-disable-next-line react/prop-types
                formik.setFieldValue(imageType, fileList);
            }

            // on form update splice 1 item from array when it is found
            if (updatedImage && item.key === 'old') {
                updatedImage.splice(item.index, 1);
                setUpdatedImage(updatedImage); // update picker image files
            }
            setDirty(true);     //to enable the submit button
        }
        // On form update
        if (updatedImage) {
            setDeletedImage([
                ...deletedImage,
                updatedImage[previewIndex]?.image_src
            ]);
        }
    };

    return (
        <ImageList sx={{ width: "80%", height: "60%", overflow: "inherit" }}
            cols={3} rowHeight={isMobile ? 80 : isTab ? 160 : 220} gap={8}>
            {preview ? preview.map((item, index) => (
                <ImageListItem key={index}>
                    <IconButton
                        sx={{
                            position: "absolute",
                            left: "87%",
                            '@media screen and (max-width: 920px)': {
                                left: '77%',
                            },
                            '@media screen and (max-width: 480px)': {
                                left: '60%',
                            },
                            top: "-2%"
                        }}
                        onClick={() => handleDeleteClick(item)}
                    >
                        <Tooltip title="DELETE">
                            <HighlightOffOutlinedIcon sx={{
                                color: "#002147",
                                "&:hover": {
                                    color: "red", fontSize: "1.5rem", transition: "all 0.3s ease-in-out"
                                }
                            }}
                            />
                        </Tooltip>
                    </IconButton>
                    <img
                        src={item.value}
                        alt="This image is not available"
                        loading="lazy"
                        style={{
                            objectFit: "cover",
                            height: "100%",
                            width: "100%",
                            borderRadius: isMobile ? "6px" : "12px",
                            boxShadow: "2px 2px 4px hsl(0, 0%, 30%)"
                        }}
                    />
                </ImageListItem>
            )) : <Loader />}
        </ImageList>
    );
};

PreviewImage.propTypes = {
    formik: PropTypes.shape({
        current: PropTypes.any
    }),
    setDirty: PropTypes.func,
    preview: PropTypes.array,
    setPreview: PropTypes.func,
    imageFiles: PropTypes.array,
    updatedImage: PropTypes.array,
    setUpdatedImage: PropTypes.func,
    deletedImage: PropTypes.array,
    setDeletedImage: PropTypes.func,
    imageType: PropTypes.string,
    ENV: PropTypes.object
};

export default PreviewImage;
