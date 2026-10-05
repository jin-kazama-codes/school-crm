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
import { Trash2 } from "lucide-react";

import Loader from "../common/Loader";

const getOldImageList = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(item => item && item.image_src);
    if (typeof raw === 'object' && raw.image_src) return [raw];
    return [];
};

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

        const oldList = getOldImageList(updatedImage);
        let countOld = 0;
        oldList.forEach(img => {
            if (img.image_src) {
                dbImgFiles.push({
                    key: 'old',
                    index: countOld,
                    value: `${img.image_src}`,
                    raw: img
                });
                countOld++;
            }
        });

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
    }, [updatedImage, imageFiles, setPreview]);

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

            const oldList = getOldImageList(updatedImage);
            let countOld = 0;
            oldList.forEach(img => {
                if (img.image_src) {
                    dbImgFiles.push({
                        key: 'old',
                        index: countOld,
                        value: `${img.image_src}`,
                        raw: img
                    });
                    countOld++;
                }
            });

            // Merge the preview values with already populated values during update otherwise just show prev
            setPreview([
                ...dbImgFiles,
                ...pickerFiles
            ]);
        }
    }, [imageFiles, setPreview, updatedImage]);

    const handleDeleteClick = (item) => {
        const previewIndex = preview.indexOf(item);
        if (previewIndex > -1) {
            const nextPreview = [...preview];
            nextPreview.splice(previewIndex, 1);
            setPreview(nextPreview);
        }

        if (item?.index > -1) {
            // On image selection through image picker
            if (imageFiles && item.key === 'new') {
                const fileList = Array.from(imageFiles);
                fileList.splice(item.index, 1);
                if (formik?.setFieldValue) {
                    formik.setFieldValue(imageType, fileList);
                }
            }

            // on form update splice item from old list
            if (updatedImage && item.key === 'old') {
                const oldList = getOldImageList(updatedImage);
                oldList.splice(item.index, 1);
                if (setUpdatedImage) {
                    setUpdatedImage(oldList);
                }
            }
            if (setDirty) {
                setDirty(true);     // to enable the submit button
            }
        }

        // Record deleted image src
        if (item?.key === 'old' && item?.value && setDeletedImage) {
            setDeletedImage(prev => [...(prev || []), item.value]);
        }
    };

    if (!preview) {
        return <Loader />;
    }

    if (preview.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-4 mt-2">
            {preview.map((item, index) => (
                <div 
                    key={index} 
                    className="w-36 h-36 shrink-0 relative group rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-[#333] bg-slate-50 dark:bg-[#1a1a1a] shadow-sm transition-all"
                >
                    <img
                        src={item.value}
                        alt="Preview"
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Always visible dustbin delete button on top right edge */}
                    <button
                        type="button"
                        onClick={() => handleDeleteClick(item)}
                        className="absolute top-2 right-2 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-md transition-all hover:scale-110 cursor-pointer z-10 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                        title="Remove image"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
