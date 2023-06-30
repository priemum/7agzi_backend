/** @format */

const express = require("express");
const router = express.Router();
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

const {
	create,
	gallaryById,
	read,
	remove,
	update,
	list,
	listCobmined,
} = require("../controllers/gallary");

router.get("/gallary/:gallaryId", read);

router.post("/gallary/create/:userId", requireSignin, isAuth, isAdmin, create);

router.put(
	"/gallary/:gallaryId/:userId",
	requireSignin,
	isAuth,
	isAdmin,
	update
);
router.delete(
	"/gallary/:gallaryId/:userId",
	requireSignin,
	isAuth,
	isAdmin,
	remove
);

router.get("/gallary/:ownerId", list);
router.get("/gallary/list/combined", listCobmined);

router.param("userId", userById);
router.param("gallaryId", gallaryById);

module.exports = router;
