/** @format */

const express = require("express");
const router = express.Router();
const {
	requireSignin,
	isAuth,
	isAdmin,
	isEmployee,
} = require("../controllers/auth");
const {
	upload,
	remove,
	uploadCommentImage,
	removeCommentImage,
	uploadByStylist,
	removeByStylist,
} = require("../controllers/cloudinary");
const { userById } = require("../controllers/user");
router.post(
	"/admin/uploadimages/:userId",
	requireSignin,
	isAuth,
	isAdmin,
	upload,
);

router.post(
	"/stylist/uploadimages/:userId",
	requireSignin,
	isAuth,
	isEmployee,
	uploadByStylist,
);

router.post(
	"/admin/removeimage/:userId",
	requireSignin,
	isAuth,
	isAdmin,
	remove,
);

router.post(
	"/stylist/removeimage/:userId",
	requireSignin,
	isAuth,
	isEmployee,
	removeByStylist,
);

router.post(
	"/admin/uploadimagesimagecomment/:userId",
	requireSignin,
	isAuth,
	uploadCommentImage,
);
router.post(
	"/admin/removeimagecomment/:userId",
	requireSignin,
	isAuth,
	removeCommentImage,
);

router.param("userId", userById);

module.exports = router;
