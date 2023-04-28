const { knexPostgre } = require('../../../../database/knex');
const { Consulta_CNPJ } = require('../../../../database/sqlite/consulta_cnpj');

module.exports = {
	async request(req, res) {
		var { cnpj } = req.body;
			try {
				await Consulta_CNPJ(cnpj).then((result) => {
					if (result) {
					return res.send(result);
					} else {
					return res.status(504);
					}
				})
			} catch (error) {
				console.log(error);
			}
	}

}
