/** @format */

const Category = require("../models/category");
const Subcategory = require("../models/subcategory");
const mongoose = require("mongoose");

exports.categoryById = (req, res, next, id) => {
	Category.findById(id).exec((err, category) => {
		if (err || !category) {
			return res.status(400).json({
				error: "category was not found",
			});
		}
		req.category = category;
		next();
	});
};

exports.create = (req, res) => {
	const category = new Category(req.body);
	category.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: "Cannot Create Category",
			});
		}
		res.json({ data });
	});
};

exports.read = (req, res) => {
	return res.json(req.category);
};

exports.update = (req, res) => {
	console.log(req.body);
	const category = req.category;
	category.categoryName = req.body.categoryName;
	category.categoryName_Arabic = req.body.categoryName_Arabic;
	category.categorySlug = req.body.categorySlug;
	category.categorySlug_Arabic = req.body.categorySlug_Arabic;
	category.thumbnail = req.body.thumbnail;
	category.categoryStatus = req.body.categoryStatus;
	category.belongsTo = req.body.belongsTo;

	category.save((err, data) => {
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

	Category.find().exec((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json(data);
	});
};

exports.remove = (req, res) => {
	const category = req.category;

	category.remove((err, data) => {
		if (err) {
			return res.status(400).json({
				err: "error while removing",
			});
		}
		res.json({ message: "Category deleted" });
	});
};

exports.getSubs = (req, res) => {
	Subcategory.find({ categoryId: req.params._id }).exec((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json(data);
	});
};
