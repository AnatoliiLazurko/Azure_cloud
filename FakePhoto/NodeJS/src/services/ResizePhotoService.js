const sharp = require('sharp');
const { BlobServiceClient } = require('@azure/storage-blob');
const FakeImageModel = require('../models/FakeImageModel');
require('dotenv').config();
const { AZURE_STORAGE_CONTAINER, AZURE_STORAGE_CONNECTION_STRING, AZURE_STORAGE_URL } = process.env;
const RemovePhotoBackService = require('../services/RemovePhotoBackService');

const maxWidth = 800;
const maxHeight = 600;

async function resizePhotoService(photoId) { 
    const fakePhoto = await FakeImageModel.findById(photoId);
    const fileDir = `${fakePhoto.author_id}/${fakePhoto._id}/`;

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerName = AZURE_STORAGE_CONTAINER;
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Зчитуємо задній фон 
    const backBlobName = `${fileDir}back.jpg`;
    const backBlobClient = containerClient.getBlobClient(backBlobName);
    const backImageBuffer = await backBlobClient.downloadToBuffer();
    // Змінюємо розміри заднього фону
    const backImage = sharp(backImageBuffer);
    const backMetadata = await backImage.metadata();
    const backWidth = backMetadata.width;
    const backHeight = backMetadata.height;

    // Зчитуємо фото
    const photoBlobName = `${fileDir}photo.jpg`;
    const photoBlobClient = containerClient.getBlobClient(photoBlobName);
    const photoImageBuffer = await photoBlobClient.downloadToBuffer();
    // Змінюємо розміри фото
    const photoImage = sharp(photoImageBuffer);
    const photoMetadata = await photoImage.metadata();
    const photoWidth = photoMetadata.width;
    const photoHeight = photoMetadata.height;

    
    if (photoWidth > maxWidth || photoHeight > maxHeight) {
        photoImage.resize({
            width: maxWidth,
            height: maxHeight,
            withoutEnlargement: true,
        });
    }

    photoImage.resize(backWidth, backHeight);

    await containerClient.uploadBlockBlob(`${fileDir}photo_resize.jpg`, await photoImage.toBuffer(), photoImageBuffer.length);
    await containerClient.uploadBlockBlob(`${fileDir}back_resize.jpg`, await backImage.toBuffer(), backImageBuffer.length);
    
    // Оновлюємо наші дані в бд
    fakePhoto.resize_photo_url = `${AZURE_STORAGE_URL}/${containerName}/${fileDir}photo_resize.jpg`;
    fakePhoto.resize_back_url = `${AZURE_STORAGE_URL}/${containerName}/${fileDir}back_resize.jpg`;
    fakePhoto.resized_at = new Date();
    await fakePhoto.save();

    const test = RemovePhotoBackService.removePhotoBackService(fakePhoto._id);
    return test;
}

module.exports = { resizePhotoService };