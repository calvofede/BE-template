const { Router } = require('express');
const { getProfile } = require('./middleware/getProfile');
const contracts = require('./controllers/contracts');
const jobs = require('./controllers/jobs');
const clients = require('./controllers/clients');
const admin = require('./controllers/admin');

const router = new Router();

router
    .get('/contracts/:id', getProfile, contracts.getContractById)
    .get('/contracts', getProfile, contracts.getContracts)
    .get('/jobs/unpaid', getProfile, jobs.getUnpaidJobs)
    .post('/jobs/:job_id/pay', getProfile, jobs.postPayment)
    .post('/balances/deposit/:userId', getProfile, clients.postDeposit)
    .get('/admin/best-profession', getProfile, admin.getBestProfession)
    .get('/admin/best-clients', getProfile, admin.getBestClients);

module.exports = router;