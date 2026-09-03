/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { useFormik } from "formik";
import { UploadCloud } from "lucide-react";

import imageValidation from "./Validation";
import PreviewImage from "./PreviewImage";

const initialValues = {};
const ImagePicker = ({
    onChange,
    refId,
    setDirty,
    reset,
    setReset,
    preview,
    setPreview,
    updatedImage = [],
    setUpdatedImage,
    deletedImage = [],
    setDeletedImage,
    imageType,
    ENV,
    multiple = false,
    validation = true,
    iCardDetails = null,
    setICardDetails = null
}) => {
    const image = 'image';
    initialValues[`${image}`] = null;
    const [initialState, setInitialState] = useState(initialValues);

    const formik = useFormik({
        initialValues: initialState,
        validationSchema: validation === true ? imageValidation : null,
        enableReinitialize: true,
        onSubmit: () => watchForm()
    });

    React.useImperativeHandle(refId, () => ({
        Submit: async () => {
            await formik.submitForm();
        }
    }));

    const watchForm = () => {
        if (onChange) {
            onChange({
                values: formik.values,
                validated: formik.isSubmitting
                    ? Object.keys(formik.errors).length === 0
                    : false,
                dirty: formik.dirty
            });
        }
    };

    useEffect(() => {
        if (reset) {
            formik.resetForm();
            setPreview([]);
            setReset(false);
        }
    }, [reset]);


    useEffect(() => {
        if (updatedImage?.length) {
            setInitialState(updatedImage);
        }
    }, [updatedImage?.length]);

    const showPicker = !formik.values[`${image}`]?.length || multiple;

    return (
        <div className="w-full">
            <form 
                ref={refId} 
                encType="multipart/form-data" 
                className={`mb-6 ${multiple || (showPicker && !updatedImage?.length) ? "block" : "hidden"}`}
            >
                <div className="relative group">
                    <label 
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-[#1a1a1a] dark:hover:bg-[#222] transition-colors"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-3 text-slate-400 group-hover:text-blue-500 transition-colors" />
                            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                SVG, PNG, JPG, WEBP or PDF
                            </p>
                        </div>
                        <input
                            hidden
                            multiple={multiple}
                            type="file"
                            name="file"
                            accept=".jpg, .gif, .png, .jpeg, .svg, .webp, application/pdf"
                            onChange={(event) => {
                                const newFiles = Array.from(event.target.files);
                                if (Array.isArray(formik.values[`${image}`])) {
                                    formik.setFieldValue(`${image}`, [
                                        ...formik.values[`${image}`],
                                        ...newFiles
                                    ]);
                                } else {
                                    formik.setFieldValue(`${image}`, newFiles);
                                }
                                setDirty(true);
                            }}
                        />
                    </label>
                </div>
            </form>

            <PreviewImage
                formik={formik}
                deletedImage={deletedImage}
                setDeletedImage={setDeletedImage}
                setDirty={setDirty}
                updatedImage={updatedImage}
                setUpdatedImage={setUpdatedImage}
                imageFiles={formik.values[`${image}`]}
                preview={preview}
                setPreview={setPreview}
                imageType={image}
                ENV={ENV}
                iCardDetails={iCardDetails}
                setICardDetails={setICardDetails}
            />

            {formik.touched[`${image}`] && formik.errors[`${image}`] && (
                <p className="mt-2 text-sm text-red-500 font-medium">
                    {formik.errors[`${image}`]}
                </p>
            )}
        </div>
    );
}

ImagePicker.propTypes = {
    onChange: PropTypes.func,
    refId: PropTypes.shape({
        current: PropTypes.any
    }),
    setDirty: PropTypes.func,
    reset: PropTypes.bool,
    setReset: PropTypes.func,
    preview: PropTypes.array,
    setPreview: PropTypes.func,
    updatedImage: PropTypes.array,
    setUpdatedImage: PropTypes.func,
    deletedImage: PropTypes.array,
    setDeletedImage: PropTypes.func,
    imageType: PropTypes.string,
    ENV: PropTypes.object,
    multiple: PropTypes.bool
};

export default ImagePicker;
