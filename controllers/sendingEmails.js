/** @format */

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const BarbershopName = "Hair Salon";
const BarbershopWebsite = "http://hairsalondemo.infinite-apps.com/";
const userDashboardLink = "http://hairsalondemo.infinite-apps.com/dashboard";
const contactusPageLink = "http://hairsalondemo.infinite-apps.com/contact";
const supportEmail = "info@hair-salon.com";
const fromEmail = "noreply@infinite-apps.com";
const defaultEmail = "ahmed.abdelrazak@infinite-apps.com";
const phoneNumber1 = "(999) 222-1111";
const phoneNumber2 = "(999) 222-3322";
const shopAddress = "123 main street, LA, CA";
const shopLogo =
	"https://res.cloudinary.com/infiniteapps/image/upload/v1634425351/Hairsalon/logo_p62voj.png";

exports.SendingEmailsToUsers = (req, res) => {
	console.log(req.body, "From API");

	const allUsersEmails = req.body.emailSendToUsers;

	allUsersEmails.map((i) => {
		const emailSending = {
			to: i,
			from: fromEmail,
			subject: req.body.emailSubject,
			html: `
                     <html>
                            <head>
                                <title></title>
                
                            </head>
                                    <body style=margin-left:20px;margin-right:20px;margin-top:50px;background:#f2f2f2;border-radius:20px;padding:50px;>
                                                    <div >
                                                        <div >Hi,</div>
                                    <br />
                                                            <div >
                                                            ${req.body.emailBody}
                                                            </div>
                                                                            
                                                            <br />
                                                Kind and Best Regards,  <br />
                                                ${BarbershopName} support team <br />
                                                Contact Email: ${supportEmail} <br />
                                                Phone#: ${phoneNumber1} <br />
                                                Landline#: ${phoneNumber2} <br />
                                                Address:  ${shopAddress}  <br />
                                                Website:  ${BarbershopWebsite}  <br />
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
		sgMail.send(emailSending);
	});

	res.json("Emails Were Sent Successfully");
};
