/** @format */

const Affiliate = require("../models/affiliateProducts");

exports.affiliateById = (req, res, next, id) => {
	Affiliate.findById(id).exec((err, affiliate) => {
		if (err || !affiliate) {
			return res.status(400).json({
				error: "affiliate was not found",
			});
		}
		req.affiliate = affiliate;
		next();
	});
};

exports.create = (req, res) => {
	const affiliate = new Affiliate(req.body);
	affiliate.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: "Cannot Create affiliate",
			});
		}
		res.json({ data });
	});
};

exports.read = (req, res) => {
	return res.json(req.affiliate);
};

exports.update = (req, res) => {
	console.log(req.body);
	const affiliate = req.affiliate;
	affiliate.productName = req.body.productName;

	affiliate.slug = req.body.slug;
	affiliate.description1 = req.body.description1;
	affiliate.price = req.body.price;
	affiliate.currency = req.body.currency;
	affiliate.category = req.body.category;
	affiliate.gender = req.body.gender;
	affiliate.images = req.body.images;
	affiliate.shipping = req.body.shipping;
	affiliate.activeProduct = req.body.activeProduct;
	affiliate.featuredProduct = req.body.featuredProduct;
	affiliate.country = req.body.country;
	affiliate.gender = req.body.gender;
	affiliate.affiliateLink = req.body.affiliateLink;
	affiliate.source = req.body.source;

	affiliate.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json(data);
	});
};

exports.list = (req, res) => {
	// Using aggregation framework for random sorting
	Affiliate.aggregate([
		{ $match: { activeProduct: true } }, // Filter for active products
		{ $sample: { size: 20 } }, // Randomly select documents, you can adjust the size
	]).exec((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json(data);
	});
};

exports.remove = (req, res) => {
	const affiliate = req.affiliate;

	affiliate.remove((err, data) => {
		if (err) {
			return res.status(400).json({
				err: "error while removing",
			});
		}
		res.json({ message: "affiliate deleted" });
	});
};
