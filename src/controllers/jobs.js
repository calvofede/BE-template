const { Job } = require('../model');
const { Contract } = require('../model');
const { Profile } = require('../model');
const { Op } = require("sequelize");

exports.getUnpaidJobs = async (req, res) => {
    const profileId = req.profile.id;
    const jobs = await Job.findAll({
        where: {
            paid: {
                [Op.or]: [false, null]
            },
        },
        include: [{
            model: Contract,
            where: {
                status: 'in_progress',
                [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }]
            }
        }]
    });

    if (!jobs) return res.status(404).end()
    res.json(jobs)
}

exports.postPayment = async (req, res) => {
    const id = req.params.job_id;

    const job = await Job.findOne({ where: { id }, include: { 
        model: Contract, 
        include: [{
            model: Profile, 
            as: 'Contractor' 
            },
            {
                model: Profile, 
                as: 'Client' 
            }]
        }
    });
    if (!job) return res.status(404).end()

    if (req.profile.type === 'contractor' || req.profile.balance < job.price)
    return res.status(400).json({error: 'Clients must have enough balance or not be contractors'}).end();

    const clientNewBalance = req.profile.balance - job.price;
    const contractorNewBalance = job.Contract.Contractor.balance + job.price;

    const updateClient = await Profile.update({ balance: clientNewBalance }, {
        where: {
            id: job.Contract.Client.id
        }
    })

    const updateContractor = await Profile.update({ balance: contractorNewBalance }, {
        where: {
            id: job.Contract.Contractor.id
        }
    })

    const updateJob = await Job.update({ paid: true, paymentDate: Date.now() }, {
        where: {
            id: job.id
        }
    })

    Promise.all([updateClient, updateContractor, updateJob]).then(() => {
        res.status(200).end();
    }).catch(() => {
        res.status(500).end();
    });
}