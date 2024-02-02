const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    photo_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    jobType: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
});

const JobModel = mongoose.model('Job', jobSchema);

module.exports = JobModel;