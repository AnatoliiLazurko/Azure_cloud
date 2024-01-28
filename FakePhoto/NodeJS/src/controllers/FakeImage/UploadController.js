const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const UploadPhotoService = require('../../services/UploadPhotoService');

async function uploadImage(req, res) {
    try {
        // console.log(req.files);
        // console.log(req.user);
        const fakePhoto = await UploadPhotoService.uploadPhotoService(req);


        return res.json(fakePhoto);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = { uploadImage }