const { Contract } = require('../model');
const { Op } = require("sequelize");

/**
 * @returns contract by id belonging to a profileId
 */
exports.getContractById = async (req, res) => {
    const { id } = req.params
    const contract = await Contract.findOne({ where: { id } })
    if (!contract) return res.status(404).end()
    if (contract.ContractorId !== req.profile.id &&
        contract.ClientId !== req.profile.id)
        return res.status(401).end();
    res.json(contract)
};

/**
 * @returns non terminated contracts belonging to a profileId
 */
exports.getContracts = async (req, res) => {
    const profileId = req.profile.id
    const contracts = await Contract.findAll({
        where: {
            status: {
                [Op.ne]: 'terminated'
            },
            [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }]
        }
    });

    if (!contracts) return res.status(404).end()
    res.json(contracts)
}