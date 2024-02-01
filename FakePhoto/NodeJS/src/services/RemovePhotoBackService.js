const axios = require('axios');
const FakeImageModel = require('../models/FakeImageModel');
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();
const { AZURE_STORAGE_CONTAINER, AZURE_STORAGE_CONNECTION_STRING, AZURE_STORAGE_URL, XIMILAR_API_TOKEN } = process.env;

async function removePhotoBackService(photoId) {
    const fakePhoto = await FakeImageModel.findById(photoId);
    const fileDir = `${fakePhoto.author_id}/${fakePhoto._id}/`;

    const apiUrl = 'https://api.ximilar.com/removebg/precise/removebg';
    const requestData = {
        records: [
            {
                '_url': fakePhoto.resize_photo_url,
                'white_background': false,
                'image_format': 'png'
            }
        ]
    };

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${XIMILAR_API_TOKEN}`
    };


    try {
        // Відправляємо запит до Ximilar API для видалення заднього фону
        const response = await axios.post(apiUrl, requestData, { headers });

        // Отримуємо URL зображення без заднього фону
        const outputUrl = response.data.records[0]['_output_url'];

        // Завантажуємо зображення без заднього фону назад в Azure Blob Storage
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER);
        const blobName = `${fileDir}photo_no_bg.png`;
        const blobClient = containerClient.getBlockBlobClient(blobName);

        const photoContent = await axios.get(outputUrl, { responseType: 'arraybuffer' });
        await blobClient.upload(photoContent.data, photoContent.data.length);

        // Оновлюємо дані в базі даних
        fakePhoto.no_back_photo_url = `${AZURE_STORAGE_URL}/${AZURE_STORAGE_CONTAINER}/${blobName}`;
        fakePhoto.remove_bg_at = new Date();
        await fakePhoto.save();

        //console.log("Remove background finished!");

    } catch (error) {
        console.error("Error removing background:", error.message);
    }
}

module.exports = { removePhotoBackService };