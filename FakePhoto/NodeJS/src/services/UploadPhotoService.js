const mongoose = require('mongoose');
const { Types } = mongoose;
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const url = require('url');
const { BlobServiceClient } = require('@azure/storage-blob');
const FakeImageModel = require('../models/FakeImageModel');
const ResizePhotoJob = require('../jobs/ResizePhotoJob');
require('dotenv').config();
const { AZURE_STORAGE_CONTAINER, AZURE_STORAGE_CONNECTION_STRING } = process.env;

async function uploadPhotoService(req) {
    const fakePhoto = {
        name: req.body.name,
        author_id: req.user.id,
        original_photo_url: '',
        original_back_url: '',
        _id: new Types.ObjectId(),
    };

    // fakePhoto.original_photo_url = await saveFile(req.files.photo, req.user.id, fakePhoto.id, 'photo');
    // fakePhoto.original_back_url = await saveFile(req.files.back, req.user.id, fakePhoto.id, 'back');

    fakePhoto.original_photo_url = await uploadToBlobStorage(req.files.photo, req.user.id, fakePhoto._id, 'photo');
    fakePhoto.original_back_url = await uploadToBlobStorage(req.files.back, req.user.id, fakePhoto._id, 'back');

    
    const saveFakeImage = await FakeImageModel.create(fakePhoto);

    // При тестувані
    // const test = ResizePhotoService.resizePhotoService(saveFakeImage._id);
    // return test; 

    // Resize Photo Job
    await ResizePhotoJob.addJobToQueue(saveFakeImage._id, 'resizePhoto');
}

async function saveFile(file, userId, fakePhotoId, type) {
    const fileExtension = path.extname(file[0].originalname);
    const fileName = `${type}-${fakePhotoId}-${uuidv4()}${fileExtension}`;
    const filePath = path.join(__dirname, '../storage/fake_photos', userId.toString(), fakePhotoId.toString(), fileName);

    await fs.mkdir(path.dirname(filePath), { recursive: true });

    const fileContent = await fs.readFile(file[0].path);

    await fs.writeFile(filePath, fileContent);

    const fileUrl = url.format({
        protocol: 'http',
        host: 'localhost:4000',
        pathname: path.relative(__dirname, filePath).replace(/\\/g, '/'),
    });

    return fileUrl;
}


async function uploadToBlobStorage(file, userId, fakePhotoId, type) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER);

    const blobName = `${userId.toString()}/${fakePhotoId.toString()}/${type}.jpg`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const fileContent = await fs.readFile(file[0].path);

    await blockBlobClient.upload(fileContent, fileContent.length);

    // Повертаємо URL Blob файлу
    return blockBlobClient.url;
}

module.exports = { uploadPhotoService };