const Bull = require('bull');
const JobModel = require('../models/JobModel');
const ResizePhotoService = require('../services/ResizePhotoService');

const resizePhotoQueue = new Bull('resizePhotoQueue', {
  redis: 'redis://localhost:6379',
});

const addJobToQueue = async (photo_id, jobType) => {
    const job = await JobModel.create({ photo_id, jobType });
    await resizePhotoQueue.add(jobType, { jobId: job._id });
};

resizePhotoQueue.process('resizePhoto', async (job) => {
    const { photo_id } = await JobModel.findById(job.data.jobId);
    await ResizePhotoService.resizePhotoService(photo_id);
});

module.exports = { addJobToQueue };