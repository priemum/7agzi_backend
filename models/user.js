/** @format */

const mongoose = require("mongoose");
const crypto = require("crypto");
const {v1: uuidv1} = require("uuid");
const {ObjectId} = mongoose.Schema;

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: true,
			maxlength: 32,
		},
		email: {
			type: String,
			trim: true,
			required: true,
			lowercase: true,
		},
		phone: {
			type: String,
			trim: true,
			required: true,
			unique: true,
			lowercase: true,
		},
		hashed_password: {
			type: String,
			required: true,
		},

		salt: String,

		role: {
			type: Number,
			default: 0,
		},

		roleDescription: {
			type: String,
			default: "Regular User",
		},

		storeType: {
			type: String,
			default: "No Store",
			lowercase: true,
			trim: true,
		},

		storeName: {
			type: String,
			default: "No Store",
			lowercase: true,
			trim: true,
		},

		storeAddress: {
			type: String,
			default: "No Store",
			lowercase: true,
			trim: true,
		},

		storeGovernorate: {
			type: String,
			default: "No Store",
			lowercase: true,
			trim: true,
		},
		storeDistrict: {
			type: String,
			default: "No Store",
			lowercase: true,
			trim: true,
		},

		storeCountry: {
			type: String,
			default: "No Store",
			lowercase: true,
			trim: true,
		},

		history: {
			type: Array,
			default: [],
		},

		resetPasswordLink: {
			data: String,
			default: "",
		},

		likesUser: [{type: ObjectId, ref: "Employee"}],

		points: {
			type: Number,
			default: 0,
		},
		activePoints: {
			type: Number,
			default: 0,
		},
		activeUser: {
			type: Boolean,
			default: true,
		},

		subscribed: {
			type: Boolean,
			default: false,
		},
		subscriptionToken: {
			type: String,
			default: "unavailable",
		},
		subscriptionId: {
			type: String,
			default: "unavailable",
		},
		platFormShare: {
			type: Boolean,
			default: false,
		},
		platFormShareToken: {
			type: String,
			default: "unavailable",
		},
		smsPayAsYouGo: {
			type: Boolean,
			default: false,
		},
		smsPayAsYouGoToken: {
			type: String,
			default: "unavailable",
		},
		belongsTo: {
			type: String,
			default: "Not Added",
		},

		agentOtherData: {
			type: Object,
			default: {phone2: "No Agent"},
		},

		agent: {
			type: Object,
			default: {name: "No Agent"},
		},
		agentPaid: {
			type: Boolean,
			default: false,
		},
		agentPaidPro: {
			type: Boolean,
			default: false,
		},
		activeAgent: {
			type: Boolean,
			default: false,
		},
	},
	{timestamps: true}
);

// virtual field
userSchema
	.virtual("password")
	.set(function (password) {
		this._password = password;
		this.salt = uuidv1();
		this.hashed_password = this.encryptPassword(password);
	})
	.get(function () {
		return this._password;
	});

userSchema.methods = {
	authenticate: function (plainText) {
		return this.encryptPassword(plainText) === this.hashed_password;
	},

	encryptPassword: function (password) {
		if (!password) return "";
		try {
			return crypto
				.createHmac("sha1", this.salt)
				.update(password)
				.digest("hex");
		} catch (err) {
			return "";
		}
	},
};

module.exports = mongoose.model("User", userSchema);
