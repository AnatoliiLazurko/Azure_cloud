const mongoose = require('mongoose');

const fakeImageSchema = new mongoose.Schema({
    // Технічні дані
    name: { type: String, },

    // Отношення до автора публікації
    author_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    // Ісходні параметри, завантажені користувачем
    original_photo_url: { type: String, },
    original_back_url: { type: String, },
    upload_at: {
        type: Date,
        default: Date.now,
    },

    // Зміна розмірів
    resize_photo_url: { type: String, },
    resize_back_url: { type: String, },
    resized_at: { type: Date, },

    // Видалення бека
    no_back_photo_url: { type: String, },
    remove_bg_at: { type: Date, },

    // Результатируюча фотографія
    result_photo_url: { type: String, },
    finish_at: { type: Date, },

    // Тимчасові мітки - створення та оновлення запису в базі
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
  
}, { timestamps: true });


const FakeImage = mongoose.model('FakeImage', fakeImageSchema);

module.exports = FakeImage;