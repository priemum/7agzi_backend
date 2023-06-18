/** @format */

const express = require("express");
const router = express.Router();

// middlewares
const { isAuth, requireSignin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

// controller
const { createe, smsById, list } = require("../controllers/sms");

// routes
router.post("/sms/create/:userId", requireSignin, isAuth, createe);
router.get("/sms/list/:userId", requireSignin, isAuth, list);

router.param("userId", userById);
router.param("smsId", smsById);

module.exports = router;
