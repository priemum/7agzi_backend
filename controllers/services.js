/** @format */

const Services = require("../models/services");
const mongoose = require("mongoose");
const Employee = require("../models/employee");

exports.servicesById = (req, res, next, id) => {
	Services.findById(id).exec((err, service) => {
		if (err || !service) {
			return res.status(400).json({
				error: "Service was not found",
			});
		}
		req.service = service;
		next();
	});
};

exports.create = (req, res) => {
	const service = new Services(req.body);
	service.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: console.log(err, "error while creating service"),
			});
		}
		res.json({ data });
	});
};

exports.read = (req, res) => {
	return res.json(req.service);
};

exports.update = (req, res) => {
	console.log(req.body);
	const service = req.service;
	service.serviceName = req.body.serviceName;
	service.serviceNameOtherLanguage = req.body.serviceNameOtherLanguage;
	service.serviceDescription = req.body.serviceDescription;
	service.serviceDescriptionOtherLanguage =
		req.body.serviceDescriptionOtherLanguage;
	service.customerType = req.body.customerType;
	service.customerTypeOtherLanguage = req.body.customerTypeOtherLanguage;
	service.servicePrice = req.body.servicePrice;
	service.servicePriceDiscount = req.body.servicePriceDiscount;
	service.serviceTime = req.body.serviceTime;
	service.serviceLoyaltyPoints = req.body.serviceLoyaltyPoints;
	service.activeService = req.body.activeService;
	service.belongsTo = req.body.belongsTo;
	service.catchyPhrase = req.body.catchyPhrase;
	service.catchyPhraseOtherLanguage = req.body.catchyPhraseOtherLanguage;
	service.bundleService = req.body.bundleService;
	service.bundleServicesAdded = req.body.bundleServicesAdded;
	service.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json(data);
	});
};

exports.remove = (req, res) => {
	const service = req.service;

	service.remove((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json({ message: "Service deleted" });
	});
};

// exports.list = (req, res) => {
// 	Services.find().exec((err, data) => {
// 		if (err) {
// 			return res.status(400).json({
// 				error: err,
// 			});
// 		}
// 		res.json(data);
// 	});
// };

exports.list = (req, res) => {
	Services.find({ belongsTo: mongoose.Types.ObjectId(req.params.ownerId) })
		.populate("belongsTo", "_id name email phone storeName")
		.exec((err, data) => {
			if (err) {
				return res.status(400).json({
					error: err,
				});
			}
			res.json(data);
		});
};

exports.listCobmined = (req, res) => {
	Services.find()
		.populate("belongsTo", "_id name email phone storeName")
		.exec((err, data) => {
			if (err) {
				return res.status(400).json({
					error: err,
				});
			}
			res.json(data);
		});
};

exports.findUniqueActiveServices = (req, res) => {
	const ownerId = req.params.ownerId;

	Employee.find({ belongsTo: mongoose.Types.ObjectId(ownerId) })
		.populate(
			"belongsTo",
			"_id name phone storeName storeCountry storeGovernorate"
		)
		.populate(
			"services",
			"serviceName serviceNameOtherLanguage activeService belongsTo"
		)
		.then((employees) => {
			if (!employees.length) {
				return res.status(400).json({ error: "No employees found." });
			}

			// Flatten the services array across all employees
			let allServices = [].concat(...employees.map((emp) => emp.services));

			// Filter only active services
			let activeServices = allServices.filter(
				(service) => service.activeService
			);

			// Filter for unique services
			let uniqueServices = activeServices.filter(
				(service, index, self) =>
					index ===
					self.findIndex(
						(s) =>
							s.serviceName === service.serviceName &&
							s.belongsTo._id.toString() === service.belongsTo._id.toString()
					)
			);

			return res.json(uniqueServices);
		})
		.catch((err) => {
			console.log(err);
			return res.status(500).json({ error: err.message });
		});
};

exports.findUniqueCustomerTypes = (req, res) => {
	const ownerId = req.params.ownerId;

	Employee.find({ belongsTo: mongoose.Types.ObjectId(ownerId) })
		.populate("services", "customerType customerTypeOtherLanguage belongsTo")
		.then((employees) => {
			if (!employees.length) {
				return res.status(400).json({ error: "No employees found." });
			}

			// Flatten the services array across all employees
			let allServices = [].concat(...employees.map((emp) => emp.services));

			// Filter for unique customerTypes
			let uniqueCustomerTypes = allServices.filter(
				(service, index, self) =>
					index ===
					self.findIndex(
						(s) =>
							s.customerType === service.customerType &&
							s.belongsTo._id.toString() === service.belongsTo._id.toString()
					)
			);

			return res.json(uniqueCustomerTypes);
		})
		.catch((err) => {
			return res.status(500).json({ error: err.message });
		});
};
