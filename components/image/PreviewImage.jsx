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
import { X } from "lucide-react";

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
            ...dbImgFiles,
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

    if (!preview) {
        return <Loader />;
    }

    if (preview.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {preview.map((item, index) => (
                <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a1a]">
                    <img
                        src={item.value}
                        alt="Preview"
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-start justify-end p-2">
                        <button
                            type="button"
                            onClick={() => handleDeleteClick(item)}
                            className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                            title="Remove image"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
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
