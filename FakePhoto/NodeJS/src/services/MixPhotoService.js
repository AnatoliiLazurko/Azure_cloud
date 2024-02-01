const FakeImageModel = require('../models/FakeImageModel');
const { BlobServiceClient } = require('@azure/storage-blob');
const sharp = require('sharp');
require('dotenv').config();
const { AZURE_STORAGE_CONTAINER, AZURE_STORAGE_CONNECTION_STRING, AZURE_STORAGE_URL } = process.env;

async function mixPhotoService(photoId) {
    const fakePhoto = await FakeImageModel.findById(photoId);
    const fileDir = `${fakePhoto.author_id}/${fakePhoto._id}/`;

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER);


    const backBlobName = `${fileDir}back_resize.jpg`;
    const backBlobClient = containerClient.getBlobClient(backBlobName);
    const backImageBuffer = await backBlobClient.downloadToBuffer();


    const photoBlobName = `${fileDir}photo_no_bg.png`;
    const photoBlobClient = containerClient.getBlobClient(photoBlobName);
    const photoImageBuffer = await photoBlobClient.downloadToBuffer();


    const mixedImageBuffer = await sharp(backImageBuffer)
        .composite([{ input: photoImageBuffer }])
        .toBuffer();


    const mixedBlobName = `${fileDir}result.png`;
    const mixedBlobClient = containerClient.getBlockBlobClient(mixedBlobName);
    await mixedBlobClient.upload(mixedImageBuffer, mixedImageBuffer.length);

    // Оновлюємо дані в базі даних
    fakePhoto.result_photo_url = `${AZURE_STORAGE_URL}/${AZURE_STORAGE_CONTAINER}/${mixedBlobName}`;
    fakePhoto.finish_at = new Date();
    await fakePhoto.save();
}


module.exports = { mixPhotoService };