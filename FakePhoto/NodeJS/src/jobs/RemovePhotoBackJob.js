const Bull = require('bull');
const JobModel = require('../models/JobModel');
const RemovePhotoBackService = require('../services/RemovePhotoBackService');

const removePhotoBackQueue = new Bull('removePhotoBackQueue', {
  redis: 'redis://localhost:6379',
});

const addJobToQueue = async (photo_id, jobType) => {
  const job = await JobModel.create({ photo_id, jobType });
  await removePhotoBackQueue.add(jobType, { jobId: job._id });
};

removePhotoBackQueue.process('removePhotoBack', async (job) => {
  const { photo_id } = await JobModel.findById(job.data.jobId);
  await RemovePhotoBackService.removePhotoBackService(photo_id);
});

module.exports = { addJobToQueue };