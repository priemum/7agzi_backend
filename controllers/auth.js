/** @format */

const User = require("../models/user");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const expressJwt = require("express-jwt");
require("dotenv").config();
const { OAuth2Client } = require("google-auth-library");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const orderStatusSMS = require("twilio")(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);

const BarbershopName = "XLOOK";
const BarbershopWebsite = "http://xlookpro.com/";
const userDashboardLink = "http://xlookpro.com/dashboard";
const contactusPageLink = "http://xlookpro.com/contact";
const supportEmail = "info@xlookpro.com";
const fromEmail = "noreply@infinite-apps.com";
const defaultEmail = "ahmed.abdelrazak@infinite-apps.com";
const phoneNumber1 = "01097542859";
const phoneNumber2 = "(999) 222-3322";
const shopAddress = "629 main street, LA, CA";
const shopLogo =
	"https://res.cloudinary.com/infiniteapps/image/upload/v1691837329/Hairsalon/1691837329182.png";

exports.signup = async (req, res) => {
	//   console.log("req.body", req.body);
	const {
		name,
		email,
		password,
		phone,
		storeType,
		storeName,
		storeAddress,
		storeGovernorate,
	} = req.body;

	if (!name) return res.status(400).send("Please fill in your name.");
	if (!password) return res.status(400).send("Please fill in your password.");
	if (!phone) return res.status(400).send("Please fill in your phone.");
	if (!storeType) return res.status(400).send("Please fill in your storeType.");
	if (!storeName) return res.status(400).send("Please fill in your storeName.");
	if (!storeAddress)
		return res.status(400).send("Please fill in your storeAddress.");
	if (!storeGovernorate)
		return res.status(400).send("Please fill in your Goveronorate.");
	if (password.length < 6)
		return res
			.status(400)
			.json({ error: "Passwords should be 6 characters or more" });
	let userExist = await User.findOne({ email }).exec();
	if (userExist)
		return res.status(400).json({
			error: "User already exists, please try a different email/phone",
		});

	const user = new User(req.body);

	await user.save(() => {
		user.salt = undefined;
		user.hashed_password = undefined;
		const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
		res.cookie("t", token, { expire: "1d" });

		res.json({
			user,
		});

		var fullNameArray = user.name.split(" ");
		var firstName = fullNameArray[0].trim();

		if (user.role === 1000) {
			//
			//
			//Whats App Message
			orderStatusSMS.messages
				.create({
					from: "whatsapp:+201097542859",
					body: `Hi ${firstName} - Your profile is under review now, Our team will let you know once your account is activated. This process takes between 2 to 3 days.
				Thank you!`,
					to: `whatsapp:+2${user.phone}`,
				})
				.then((message) =>
					console.log(`Your message was successfully sent to ${user.phone}`)
				)
				.catch((err) => console.log(err));
			//End of Whats App Message
			//
			//
		}

		if (user.role === 2000) {
			//
			//
			//Whats App Message
			orderStatusSMS.messages
				.create({
					from: "whatsapp:+201097542859",
					body: `Hi ${firstName} - Your profile is under review now, Our team will let you know once your account is activated. This process takes between 2 to 3 days.
				Thank you!`,
					to: `whatsapp:+2${user.phone}`,
				})
				.then((message) =>
					console.log(`Your message was successfully sent to ${user.phone}`)
				)
				.catch((err) => console.log(err));
			//End of Whats App Message
			//
			//
		}

		if (email.includes("@")) {
			const welcomingEmail = {
				to: user.email,
				from: fromEmail,
				subject: `Welcome to ${BarbershopName}`,
				html: `
				<html>
		<head>
		  <title></title>
						
		</head>
		<body style=margin-left:20px;margin-right:20px;margin-top:50px;background:#f2f2f2;border-radius:20px;padding:50px;>
		 <div >
			  Hi ${user.name},
			  <br />
				<div>Thank you for registering with <a href=${BarbershopWebsite}> ${BarbershopName}</a>.</div>
				<h4> Our team will always be avaiable for you if you have any inquiries or need assistance!!</h4>
				 <br />
				 You can always visit your <a href=${userDashboardLink}> dashboard </a> to check on your loyalty points or if you want to check you last appointments
				<br />
				 Kind and Best Regards,  <br />
							 ${BarbershopName} support team <br />
							 Contact Email: ${supportEmail} <br />
							 Phone#: ${phoneNumber1} <br />
							 Address:  ${shopAddress}  <br />
							 &nbsp;&nbsp; <img src=${shopLogo} alt=${BarbershopName} style="height:100px;width:100px;"  />
							 <br />
							 <p>
							 <strong>${BarbershopName}</strong>
							  </p>
							  </div>
							  </body>
	  </html>
	
			`,
			};
			sgMail.send(welcomingEmail);
		}
	});
};

exports.signin = (req, res) => {
	const { username, password } = req.body; // 'username' can be either email or phone

	User.findOne(
		{
			$or: [{ email: username }, { phone: username }],
		},
		(err, user) => {
			if (err || !user) {
				return res.status(400).json({
					error: "User is Unavailable, Please Register or Try Again!!",
				});
			}

			if (!user.authenticate(password)) {
				return res.status(401).json({
					error: "Email or Password is incorrect, Please Try Again!!",
				});
			}

			const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
			res.cookie("t", token, { expire: "1d" });

			const {
				_id,
				name,
				email,
				role,
				activePoints,
				activeUser,
				storeAddress,
				storeName,
				storeGovernorate,
				phone,
				subscribed,
				storeType,
				belongsTo,
				storeDistrict,
				platFormShare,
				smsPayAsYouGo,
				platFormShareToken,
				smsPayAsYouGoToken,
				subscriptionToken,
				subscriptionId,
				agent,
				paidAgent,
				storeCountry,
			} = user;

			return res.json({
				token,
				user: {
					_id,
					email,
					name,
					role,
					activePoints,
					activeUser,
					storeAddress,
					storeName,
					storeGovernorate,
					phone,
					subscribed,
					storeType,
					belongsTo,
					storeDistrict,
					platFormShare,
					smsPayAsYouGo,
					platFormShareToken,
					smsPayAsYouGoToken,
					subscriptionToken,
					subscriptionId,
					agent,
					paidAgent,
					storeCountry,
				},
			});
		}
	);
};

exports.signout = (req, res) => {
	res.clearCookie("t");
	res.json({ message: "User Signed Out" });
};

exports.requireSignin = expressJwt({
	secret: process.env.JWT_SECRET,
	userProperty: "auth",
	algorithms: ["HS256"],
});

exports.isAuth = (req, res, next) => {
	// Check if user is super user
	if (
		(req.profile && req.profile.role === 10000) ||
		req.profile.role === 1000 ||
		req.profile.role === 2000
	) {
		return next();
	}

	// Check user authenticity for non-super users
	let user = req.profile && req.auth && req.profile._id == req.auth._id;
	if (!user) {
		return res.status(403).json({
			error: "Access denied",
		});
	}

	next();
};

exports.isAdmin = (req, res, next) => {
	if (
		req.profile.role !== 1000 &&
		req.profile.role !== 10000 &&
		req.profile.role !== 2000
	) {
		return res.status(403).json({
			error: "Admin resource! access denied",
		});
	}
	next();
};

exports.isBoss = (req, res, next) => {
	if (req.profile.role !== 10000 && req.profile.role !== 2000) {
		return res.status(403).json({
			error: "Boss resource! access denied",
		});
	}

	next();
};

exports.isAgent = (req, res, next) => {
	if (req.profile.role !== 2000) {
		return res.status(403).json({
			error: "Boss resource! access denied",
		});
	}

	next();
};

exports.isEmployee = (req, res, next) => {
	if (req.profile.role !== 2) {
		return res.status(403).json({
			error: "Admin resource! access denied",
		});
	}

	next();
};

exports.isInStore = (req, res, next) => {
	if (req.profile.role !== 3) {
		return res.status(403).json({
			error: "Admin resource! access denied",
		});
	}

	next();
};

// exports.forgotPassword = (req, res) => {
// 	const { email } = req.body;

// 	User.findOne({ email }, (err, user) => {
// 		if (err || !user) {
// 			return res.status(400).json({
// 				error: "User with that email does not exist",
// 			});
// 		}

// 		const token = jwt.sign(
// 			{ _id: user._id, name: user.name },
// 			process.env.JWT_RESET_PASSWORD,
// 			{
// 				expiresIn: "10m",
// 			}
// 		);

// 		const emailData_Reset = {
// 			to: email,
// 			from: fromEmail,
// 			subject: `Password Reset link`,
// 			html: `
//                 <h1>Please use the following link to reset your password</h1>
//                 <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
//                 <hr />
//                 <p>This email may contain sensetive information</p>
//                 <p>${process.env.CLIENT_URL}</p>
//                 <br />
// 				 Kind and Best Regards,  <br />
// 							 ${BarbershopName} support team <br />
// 							 Contact Email: ${supportEmail} <br />
// 							 Phone#: ${phoneNumber1} <br />
// 							 Address:  ${shopAddress}  <br />
// 							 &nbsp;&nbsp; <img src=${shopLogo} alt=${BarbershopName} style="height:100px;width:100px;"  />
// 							 <br />
// 							 <p>
// 							 <strong>${BarbershopName}</strong>
// 							  </p>
//             `,
// 		};
// 		const emailData_Reset2 = {
// 			to: defaultEmail,
// 			from: fromEmail,
// 			subject: `Password Reset link`,
// 			html: `
// 		        <h1>user ${email} tried to reset her/his password using the below link</h1>
// 		        <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
// 		        <hr />
// 		        <p>This email may contain sensetive information</p>
// 		        <p>${process.env.CLIENT_URL}</p>
// 		         <br />
// 				 Kind and Best Regards,  <br />
// 				 ${BarbershopName} support team <br />
// 				 Contact Email: ${supportEmail} <br />
// 				 Phone#: ${phoneNumber1} <br />
// 				 Address:  ${shopAddress}  <br />
// 				 &nbsp;&nbsp; <img src=${shopLogo} alt=${BarbershopName} style="height:100px;width:100px;"  />
// 				 <br />
// 				 <p>
// 				 <strong>${BarbershopName}</strong>
// 				  </p>
// 		    `,
// 		};

// 		return user.updateOne({ resetPasswordLink: token }, (err, success) => {
// 			if (err) {
// 				console.log("RESET PASSWORD LINK ERROR", err);
// 				return res.status(400).json({
// 					error: "Database connection error on user password forgot request",
// 				});
// 			} else {
// 				sgMail.send(emailData_Reset2);
// 				sgMail
// 					.send(emailData_Reset)
// 					.then((sent) => {
// 						console.log("SIGNUP EMAIL SENT", sent);
// 						return res.json({
// 							message: `Email has been sent to ${email}. Follow the instruction to Reset your Password`,
// 						});
// 					})
// 					.catch((err) => {
// 						console.log("SIGNUP EMAIL SENT ERROR", err);
// 						return res.json({
// 							message: err.message,
// 						});
// 					});
// 			}
// 		});
// 	});
// };

exports.forgotPassword = (req, res) => {
	const { username } = req.body;
	const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(
		username
	);
	const query = isEmail ? { email: username } : { phone: username };

	User.findOne(query, (err, user) => {
		if (err || !user) {
			return res.status(400).json({
				error: "User with that email/phone number does not exist",
			});
		}

		const email = user.email; // Extracting the email from user object

		// Generate a token with user id and secret
		console.log("JWT_RESET_PASSWORD:", process.env.JWT_RESET_PASSWORD);
		const token = jwt.sign(
			{ _id: user._id, name: user.name },
			process.env.JWT_RESET_PASSWORD,
			{
				expiresIn: "10m",
			}
		);

		const emailData_Reset = {
			to: email,
			from: fromEmail,
			subject: `Password Reset link`,
			html: `
                <h1>Hi ${user.name} - Please use the following link to reset your password</h1>
                <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                <hr />
                <p>This email may contain sensetive information</p>
                <p>${process.env.CLIENT_URL}</p>
                <br />
				 Kind and Best Regards,  <br />
							 ${BarbershopName} support team <br />
							 Contact Email: ${supportEmail} <br />
							 Phone#: ${phoneNumber1} <br />
							 Address:  ${shopAddress}  <br />
							 &nbsp;&nbsp; <img src=${shopLogo} alt=${BarbershopName} style="height:100px;width:100px;"  />
							 <br />
							 <p>
							 <strong>${BarbershopName}</strong>
							  </p>
            `,
		};
		const emailData_Reset2 = {
			to: defaultEmail,
			from: fromEmail,
			subject: `Password Reset link`,
			html: `
		        <h1>user ${email} tried to reset her/his password using the below link</h1>
		        <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
		        <hr />
		        <p>This email may contain sensetive information</p>
		        <p>${process.env.CLIENT_URL}</p>
		         <br />
				 Kind and Best Regards,  <br />
				 ${BarbershopName} support team <br />
				 Contact Email: ${supportEmail} <br />
				 Phone#: ${phoneNumber1} <br />
				 Address:  ${shopAddress}  <br />
				 &nbsp;&nbsp; <img src=${shopLogo} alt=${BarbershopName} style="height:100px;width:100px;"  />
				 <br />
				 <p>
				 <strong>${BarbershopName}</strong>
				  </p>
		    `,
		};

		return user.updateOne({ resetPasswordLink: token }, (err, success) => {
			if (err) {
				console.log("RESET PASSWORD LINK ERROR", err);
				return res.status(400).json({
					error: "Database connection error on user password forgot request",
				});
			} else {
				//
				//
				//Whats App Message
				orderStatusSMS.messages
					.create({
						from: "whatsapp:+201097542859",
						body: `Hi ${user.name} - Please click here to reset your password ${process.env.CLIENT_URL}/auth/password/reset/${token}`,
						to: `whatsapp:+2${user.phone}`,
					})
					.then((message) =>
						console.log(`Your message was successfully sent to +1${user.phone}`)
					)
					.catch((err) => console.log(err));
				//End of Whats App Message
				//
				//
				sgMail.send(emailData_Reset2);
				sgMail
					.send(emailData_Reset)
					.then((sent) => {
						console.log("SIGNUP EMAIL SENT", sent);
						return res.json({
							message: `Email has been sent to ${email}. Follow the instruction to Reset your Password`,
						});
					})
					.catch((err) => {
						console.log("SIGNUP EMAIL SENT ERROR", err);
						return res.json({
							message: err.message,
						});
					});
			}
		});
	});
};

exports.resetPassword = (req, res) => {
	const { resetPasswordLink, newPassword } = req.body;

	if (resetPasswordLink) {
		jwt.verify(
			resetPasswordLink,
			process.env.JWT_RESET_PASSWORD,
			function (err, decoded) {
				if (err) {
					return res.status(400).json({
						error: "Expired link. Try again",
					});
				}

				User.findOne({ resetPasswordLink }, (err, user) => {
					if (err || !user) {
						return res.status(400).json({
							error: "Something went wrong. Try later",
						});
					}

					const updatedFields = {
						password: newPassword,
						resetPasswordLink: "",
					};

					User.updateOne({ _id: user._id }, updatedFields, (err, result) => {
						if (err) {
							return res.status(400).json({
								error: "Error resetting user password",
							});
						}
						res.json({
							message: `Great! Now you can login with your new password`,
						});
					});
				});
			}
		);
	}
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleLogin = (req, res) => {
	const { idToken } = req.body;

	client
		.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
		.then((response) => {
			// console.log('GOOGLE LOGIN RESPONSE',response)
			const { email_verified, name, email } = response.payload;
			if (email_verified) {
				User.findOne({ email }).exec((err, user) => {
					if (user) {
						const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
							expiresIn: "7d",
						});
						const { _id, email, name, role } = user;
						return res.json({
							token,
							user: { _id, email, name, role },
						});
					} else {
						let password = email + process.env.JWT_SECRET;
						user = new User({ name, email, password });
						user.save((err, data) => {
							if (err) {
								console.log("ERROR GOOGLE LOGIN ON USER SAVE", err);
								return res.status(400).json({
									error: "User signup failed with google",
								});
							}
							const token = jwt.sign(
								{ _id: data._id },
								process.env.JWT_SECRET,
								{
									expiresIn: "7d",
								}
							);
							const { _id, email, name, role } = data;
							return res.json({
								token,
								user: { _id, email, name, role },
							});
						});
						const welcomingEmail = {
							to: user.email,
							from: fromEmail,
							subject: `Welcome to ${BarbershopName}`,
							html: `
							<html>
					<head>
					  <title></title>
									
					</head>
					<body style=margin-left:20px;margin-right:20px;margin-top:50px;background:#f2f2f2;border-radius:20px;padding:50px;>
					 <div >
						  Hi ${user.name},
						  <br />
							<div>Thank you for registering with <a href=${BarbershopWebsite}> ${BarbershopName}</a>.</div>
							<h4> Our team will always be avaiable for you if you have any inquiries or need assistance!!</h4>
							 <br />
							 You can always visit your <a href=${userDashboardLink}> dashboard </a> to check on your loyalty points or if you want to check you last appointments
							<br />
							 Kind and Best Regards,  <br />
										 ${BarbershopName} support team <br />
										 Contact Email: ${supportEmail} <br />
										 Phone#: ${phoneNumber1} <br />
										 Address:  ${shopAddress}  <br />
										 &nbsp;&nbsp; <img src=${shopLogo} alt=${BarbershopName} style="height:100px;width:100px;"  />
										 <br />
										 <p>
										 <strong>${BarbershopName}</strong>
										  </p>
										  </div>
										  </body>
				  </html>
				
						`,
						};
						sgMail.send(welcomingEmail);
					}
				});
			} else {
				return res.status(400).json({
					error: "Google login failed. Try again",
				});
			}
		});
};
