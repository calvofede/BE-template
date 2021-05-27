const { Profile, Job, Contract, sequelize } = require('../model');
const { Op } = require("sequelize");
const config = require('../config');

exports.getBestProfession = async (req, res) => {
    const startDate = req.query.start;
    const endDate = req.query.end;
    
    if(!startDate || !endDate) 
    return res.status(400).json({error: 'Query params start and end dates are mandatory'}).end();

    const bestProfession = await Job.findAll({
        attributes: ['id', [sequelize.fn('SUM', sequelize.col('price')), 'totalPrice']],
        group : ['Contract.Contractor.id'],
        where: {
            paid: true,
            paymentDate: {
                [Op.gte]: startDate,
                [Op.lte]: endDate
            },
        },
        include: { 
            model: Contract,
            as: 'Contract', 
            required: true,
            include: {
                model: Profile, 
                as: 'Contractor',
            }
        },
        order: sequelize.literal('totalPrice DESC')
    })

    res.json({bestProfession: bestProfession[0].Contract.Contractor.profession});
}


exports.getBestClients = async (req, res) => {
    const startDate = req.query.start;
    const endDate = req.query.end;
    const limit = req.query.limit || config.defaultLimit;
    
    if(!startDate || !endDate) 
    return res.status(400).json({error: 'Query params start and end dates are mandatory'}).end();

    const bestClients = await Job.findAll({
        group : ['Contract.Client.id'],
        where: {
            paid: true,
            paymentDate: {
                [Op.gte]: startDate,
                [Op.lte]: endDate
            },
        },
        include: { 
            model: Contract, 
            required: true,
            include: {
                model: Profile, 
                as: 'Client'
            }
        },
        order: sequelize.literal('price DESC'),
        limit
    })

    let bestClientsArray = [];

    bestClients.map((clientJobs)=> {
        const element = {
            id: clientJobs.id,
            paid: clientJobs.price,
            fullName: clientJobs.Contract.Client.firstName + ' ' + clientJobs.Contract.Client.lastName
        }

        bestClientsArray.push(element);
    })

    res.json(bestClientsArray);

}