/** @format */

const Subcategory = require("../models/subcategory");
const mongoose = require("mongoose");

exports.subcategoryById = (req, res, next, id) => {
	Subcategory.findById(id).exec((err, subcategory) => {
		if (err || !subcategory) {
			return res.status(400).json({
				error: "Subcategory was not found",
			});
		}
		req.subcategory = subcategory;
		next();
	});
};

exports.create = (req, res) => {
	const subcategory = new Subcategory(req.body);
	subcategory.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: "Cannot Create Subcategory",
			});
		}
		res.json({ data });
	});
};

exports.read = (req, res) => {
	return res.json(req.subcategory);
};

exports.update = (req, res) => {
	console.log(req.body);
	const subcategory = req.subcategory;
	subcategory.SubcategoryName = req.body.SubcategoryName;
	subcategory.SubcategoryName_Arabic = req.body.SubcategoryName_Arabic;
	subcategory.SubcategorySlug = req.body.SubcategorySlug;
	subcategory.SubcategorySlug_Arabic = req.body.SubcategorySlug_Arabic;
	subcategory.subCategoryStatus = req.body.subCategoryStatus;
	subcategory.thumbnail = req.body.thumbnail;
	subcategory.categoryId = req.body.categoryId;
	subcategory.belongsTo = req.body.belongsTo;

	subcategory.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json(data);
	});
};

exports.list = (req, res) => {
	const userId = mongoose.Types.ObjectId(req.params.userId);

	Subcategory.find({ belongsTo: userId })
		.populate("categoryId")
		.exec((err, data) => {
			if (err) {
				return res.status(400).json({
					error: err,
				});
			}
			res.json(data);
		});
};

exports.remove = (req, res) => {
	const subcategory = req.subcategory;

	subcategory.remove((err, data) => {
		if (err) {
			return res.status(400).json({
				err: "error while removing",
			});
		}
		res.json({ message: "Subcategory deleted" });
	});
};
