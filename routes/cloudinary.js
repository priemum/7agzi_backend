/** @format */

const express = require("express");
const router = express.Router();
const { requireSignin, isAuth } = require("../controllers/auth");
const {
	upload,
	remove,
	uploadCommentImage,
	removeCommentImage,
	uploadByStylist,
	removeByStylist,
} = require("../controllers/cloudinary");
const { userById } = require("../controllers/user");
router.post("/admin/uploadimages/:userId", requireSignin, isAuth, upload);

router.post(
	"/stylist/uploadimages/:userId",
	requireSignin,
	isAuth,
	uploadByStylist
);

router.post("/admin/removeimage/:userId", requireSignin, isAuth, remove);

router.post(
	"/stylist/removeimage/:userId",
	requireSignin,
	isAuth,
	removeByStylist
);

router.post(
	"/admin/uploadimagesimagecomment/:userId",
	requireSignin,
	isAuth,
	uploadCommentImage
);
router.post(
	"/admin/removeimagecomment/:userId",
	requireSignin,
	isAuth,
	removeCommentImage
);

router.post("/add/agent/idupload", upload);

router.post("/remove/agent/idupload", remove);

router.param("userId", userById);

module.exports = router;
