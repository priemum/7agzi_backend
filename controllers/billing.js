const Billing = require("../models/billing");
const mongoose = require("mongoose");

exports.create = (req, res) => {
	console.log(req.body);

	const about = new Billing(req.body);
	about.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json({ data });
	});
};
