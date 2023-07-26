/** @format */

const express = require("express");
const router = express.Router();
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

const {
	create,
	servicesById,
	read,
	remove,
	update,
	list,
	listCobmined,
} = require("../controllers/services");

router.get("/service/:serviceId", read);

router.post("/service/create/:userId", requireSignin, isAuth, create);

router.put("/service/:serviceId/:userId", requireSignin, isAuth, update);
router.delete(
	"/service/:serviceId/:userId",
	requireSignin,
	isAuth,
	isAdmin,
	remove
);

router.get("/services/:ownerId", list);
router.get("/services/list/combined", listCobmined);

router.param("userId", userById);
router.param("serviceId", servicesById);

module.exports = router;
