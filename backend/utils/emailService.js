const SibApiV3Sdk = require("@getbrevo/brevo");

// 🚀 WORLD CLASS BREVO CONFIGURATION
// 1. Initialize the Client Instance
let defaultClient = SibApiV3Sdk.ApiClient.instance;

// 2. Configure API Key
let apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

// 3. Create the Transactional Email Instance
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

console.log("⚡ Brevo API Service initialized and ready.");

const sendPropertyAlert = async (users, property) => {
  if (!users || users.length === 0)
    return console.log("⚠️ No users to notify.");

  // Data preparation for the template
  const propertyImage =
    property.images?.[0] || "https://estatera.onrender.com/og-image.png";
  const propertyTitle = property.title || "Exclusive New Listing";
  const propertyPrice = property.price
    ? `₹${property.price.toLocaleString()}`
    : "Price on Request";

  const emailPromises = users.map((user) => {
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    // Email Configuration
    sendSmtpEmail.subject = `✨ New Luxury Property: ${propertyTitle}`;
    sendSmtpEmail.htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; background-color: #ffffff;">
        <div style="background: #2563eb; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 1px;">ESTATERA</h1>
        </div>
        <div style="width: 100%; height: 300px; overflow: hidden;">
          <img src="${propertyImage}" style="width: 100%; height: 100%; object-fit: cover;" alt="Property" />
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #1e293b; margin: 0 0 10px 0;">${propertyTitle}</h2>
          <p style="color: #2563eb; font-size: 24px; font-weight: 800; margin: 0 0 10px 0;">${propertyPrice}</p>
          <p style="color: #64748b; font-size: 16px; margin-bottom: 30px;">📍 ${property.location}</p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 30px;" />
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/property/${property._id}" 
               style="display: inline-block; background: #2563eb; color: white; padding: 16px 35px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(37,99,235,0.2);">
               View Full Details
            </a>
          </div>
        </div>
        <div style="background: #f8fafc; padding: 20px; text-align: center; color: #94a3b8; font-size: 11px;">
          © ${new Date().getFullYear()} Estatera Real Estate Group.
        </div>
      </div>
    `;

    // 🛡️ SENDER & RECIPIENT
    // Important: 'email' must be your verified Brevo sender email
    sendSmtpEmail.sender = {
      name: "Estatera Luxury",
      email: "estatera.team@gmail.com",
    };
    sendSmtpEmail.to = [
      { email: user.email, name: user.name || "Valued Member" },
    ];

    // Return the promise for sending
    return apiInstance.sendTransacEmail(sendSmtpEmail);
  });

  return Promise.allSettled(emailPromises);
};

module.exports = { sendPropertyAlert };
