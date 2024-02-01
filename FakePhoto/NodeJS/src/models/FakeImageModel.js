const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const fakeImageSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
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
  
}, { timestamps: true });


const FakeImage = mongoose.model('FakeImage', fakeImageSchema);

module.exports = FakeImage;