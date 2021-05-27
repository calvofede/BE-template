const { Profile, Job, Contract } = require('../model');
const { Op } = require("sequelize");

exports.postDeposit = async (req, res) => {

    if (req.profile.type === 'contractor')
    return res.status(400).json({error: 'Only clients are allowed to deposit.'}).end();

    const id = req.params.userId;
    const amountToDeposit = req.body.amountToDeposit;

    if (!amountToDeposit || amountToDeposit < 1)
    return res.status(400).json({error: 'Amount to deposit must be non null and positive.'}).end();

    const jobsToPaid = await Job.findAll({
        where: {
            paid: { [Op.or]: [false, null] }
        },
        include: { 
            model: Contract, 
            required: true,
            include: {
                model: Profile, 
                as: 'Client',
                where: {
                    id
                }
            }
        }
    });

    if(jobsToPaid.length === 0)
    return res.status(404).end();

    const totalAmountPendingToPay = jobsToPaid.reduce((previous, current) => { return previous + current.price }, 0);
    const quarterTotalAmountToPay = new Number(totalAmountPendingToPay * .25).toFixed(2);

    if(amountToDeposit > quarterTotalAmountToPay) 
    return res.status(400).json({error: 'Amount to deposit cannot exceed 25% of total pending jobs to pay.'}).end();

    const clientNewBalance = req.profile.balance + amountToDeposit;

    await Profile.update({ balance: clientNewBalance }, {
        where: {
            id: req.profile.id
        }
    })


    res.status(200).end();
}