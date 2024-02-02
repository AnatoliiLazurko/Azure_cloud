const Bull = require('bull');
const JobModel = require('../models/JobModel');
const MixPhotoService = require('../services/MixPhotoService');

const mixPhotoQueue = new Bull('mixPhotoQueue', {
  redis: 'redis://localhost:6379',
});

const addJobToQueue = async (photo_id, jobType) => {
    const job = await JobModel.create({ photo_id, jobType });
    await mixPhotoQueue.add(jobType, { jobId: job._id });
};

mixPhotoQueue.process('mixPhoto', async (job) => {
    const { photo_id } = await JobModel.findById(job.data.jobId);
    await MixPhotoService.mixPhotoService(photo_id);
});

module.exports = { addJobToQueue };