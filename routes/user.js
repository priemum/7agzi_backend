/** @format */

const express = require("express");
const router = express.Router();
const {
	requireSignin,
	isAuth,
	isAdmin,
	isBoss,
	isAgent,
} = require("../controllers/auth");

const {
	userById,
	read,
	update,
	purchaseHistory,
	like,
	unlike,
	allUsersList,
	updatedUserId,
	updateUserByAdminClients,
	userByPhoneNumber,
	readByPhoneNumber,
	updateByAdminUpdated,
	allUsersListBoss,
	updateByBoss,
	allUsersListGeneral,
	getDistinctValues,
	updateAgent,
} = require("../controllers/user");

router.get("/secret/:userId", requireSignin, isAuth, isAdmin, (req, res) => {
	res.json({
		user: req.profile,
	});
});

// like unlike
router.put("/user/like", requireSignin, like);
router.put("/user/unlike", requireSignin, unlike);
router.get("/user/:userId", requireSignin, read);
router.get("/user/phone/:phoneNumber", readByPhoneNumber);
router.put("/user/:userId", requireSignin, isAuth, update);
router.get("/orders/by/user/:userId", requireSignin, isAuth, purchaseHistory);
router.get("/allUsers/:userId", requireSignin, isAuth, isAdmin, allUsersList);
router.get(
	"/allUsers/boss/:userId",
	requireSignin,
	isAuth,
	isBoss,
	allUsersListBoss
);

router.get("/allUsers/agents/general", allUsersListGeneral);

router.put(
	"/user/:updatedUserId/:userId",
	requireSignin,
	isAuth,
	isAdmin,
	updateByAdminUpdated
);

router.put(
	"/client-update/:updatedUserId/activation/:userId",
	requireSignin,
	isAuth,
	isAdmin,
	updateUserByAdminClients
);

router.put("/user/update/byboss/:userId", isBoss, updateByBoss);

router.get("/distinct-values", getDistinctValues);
router.put("/agent/update/:agentId/:userId", isBoss, updateAgent);

router.get(
	"/agent/stores/:userId",
	requireSignin,
	isAuth,
	isAgent,
	allUsersListBoss
);

router.param("userId", userById);
router.param("phoneNumber", userByPhoneNumber);
router.param("updatedUserId", updatedUserId);

module.exports = router;
