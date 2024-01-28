const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const url = require('url');
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();
const { AZURE_STORAGE_NAME, AZURE_STORAGE_KEY, AZURE_STORAGE_CONTAINER, AZURE_STORAGE_URL, AZURE_STORAGE_CONNECTION_STRING } = process.env;

async function uploadPhotoService(req) {
    const fakePhoto = {
        name: req.body.name,
        author_id: req.user.id,
        original_photo_url: '',
        original_back_url: '',
        id: uuidv4(),
    };

    // fakePhoto.original_photo_url = await saveFile(req.files.photo, req.user.id, fakePhoto.id, 'photo');
    // fakePhoto.original_back_url = await saveFile(req.files.back, req.user.id, fakePhoto.id, 'back');

    fakePhoto.original_photo_url = await uploadToBlobStorage(req.files.photo, req.user.id, fakePhoto.id, 'photo');
    fakePhoto.original_back_url = await uploadToBlobStorage(req.files.back, req.user.id, fakePhoto.id, 'back');

    return fakePhoto;
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

    const fileExtension = path.extname(file[0].originalname);
    const fileName = `${type}-${fakePhotoId}-${uuidv4()}${fileExtension}`;

    const blobName = `${userId.toString()}/${fakePhotoId.toString()}/${fileName}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const fileContent = await fs.readFile(file[0].path);

    await blockBlobClient.upload(fileContent, fileContent.length);

    // Повертаємо URL Blob файлу
    return blockBlobClient.url;
}

module.exports = { uploadPhotoService };