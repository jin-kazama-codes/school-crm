/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { api } from "./config/axiosConfig";
import { defineCancelApiObject } from "./config/axiosUtils";
import { Utility } from "../components/utility";

const { getLocalStorage } = Utility();

export const ImageAPI = {
    /** Get image from the database based on parent and parent_id
     */
    getImage: async (parent, parent_id, cancel = false) => {
        const { data: response } = await api.request({
            url: `/get-image/${parent}/${parent_id}`,
            method: "GET",
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            signal: cancel && cancelApiObject.getImage ? cancelApiObject.getImage.handleRequestCancellation().signal : undefined
        });
        return response;
    },

    /** Store image name in the database
     */
    createImage: async (image_src, cancel = false) => {
        return await api.request({
            url: `/create-image`,
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            method: "POST",
            data: image_src,
            signal: cancel && cancelApiObject.createImage ? cancelApiObject.createImage.handleRequestCancellation().signal : undefined
        });
    },

    /** Update the image in the database
     */
    updateImage: async (fields, cancel = false) => {
        return await api.request({
            url: `/update-image`,
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            method: "PATCH",
            data: fields,
            signal: cancel && cancelApiObject.updateImage ? cancelApiObject.updateImage.handleRequestCancellation().signal : undefined
        });
    },

    /** Delete all the images from db on every update
     */
    deleteImage: async (fields, cancel = false) => {
        return await api.request({
            url: `/delete-image`,
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            method: "DELETE",
            data: fields,
            signal: cancel && cancelApiObject.deleteImage ? cancelApiObject.deleteImage.handleRequestCancellation().signal : undefined
        });
    },

    /** Upload image to the folder created by nodejs
     */
    uploadImage: async (data, cancel = false) => {
        return await api.request({
            url: `/upload-image`,
            headers: {
                "Content-Type": "multipart/form-data",
                "x-access-token": getLocalStorage("auth").token
            },
            method: "POST",
            data: data,
            signal: cancel && cancelApiObject.uploadImage ? cancelApiObject.uploadImage.handleRequestCancellation().signal : undefined
        });
    },
    uploadImageToS3: async (data, cancel = false) => {
        return await api.request({
            url: `/upload-image-s3`,
            headers: {
                "Content-Type": "multipart/form-data",
                "x-access-token": getLocalStorage("auth").token
            },
            method: "POST",
            data: data,
            signal: cancel && cancelApiObject.uploadImageToS3 ? cancelApiObject.uploadImageToS3.handleRequestCancellation().signal : undefined
        });
    }
};

// defining the cancel API object for ImageAPI
const cancelApiObject = defineCancelApiObject(ImageAPI);
