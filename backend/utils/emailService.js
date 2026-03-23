const Mailjet = require("node-mailjet");

// 🚀 WORLD CLASS MAILJET CONFIGURATION
const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY,
);

console.log("⚡ Mailjet API Service initialized.");

const sendPropertyAlert = async (users, property) => {
  if (!users || users.length === 0)
    return console.log("⚠️ No users to notify.");

  const propertyImage =
    property.images?.[0] || "https://estatera.onrender.com/og-image.png";
  const propertyTitle = property.title || "Exclusive New Listing";
  const propertyPrice = property.price
    ? `₹${property.price.toLocaleString()}`
    : "Price on Request";
  const frontendUrl =
    process.env.FRONTEND_URL || "https://estatera.onrender.com";

  // Prepare recipients list for Mailjet's bulk sender
  const recipients = users.map((user) => ({
    Email: user.email,
    Name: user.name || "Valued Member",
  }));

  try {
    const request = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "estatera.team@gmail.com", // 🛡️ MUST be verified in Mailjet
            Name: "Estatera Luxury",
          },
          To: recipients,
          Subject: `✨ New Luxury Property: ${propertyTitle}`,
          HTMLPart: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; background-color: #ffffff;">
              <div style="background: #2563eb; padding: 40px 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 3px; font-weight: 900;">ESTATERA</h1>
                <p style="color: #bfdbfe; margin: 5px 0 0 0; font-size: 11px; font-weight: bold; text-transform: uppercase;">Luxury Living Redefined</p>
              </div>
              <img src="${propertyImage}" style="width: 100%; height: 320px; object-fit: cover;" alt="Property Image" />
              <div style="padding: 40px;">
                <h2 style="color: #1e293b; font-size: 26px; font-weight: 800; margin: 0;">${propertyTitle}</h2>
                <p style="color: #2563eb; font-size: 28px; font-weight: 900; margin: 10px 0;">${propertyPrice}</p>
                <p style="color: #64748b; font-size: 16px;">📍 ${property.location}</p>
                <div style="text-align: center; margin-top: 35px;">
                  <a href="${frontendUrl}/property/${property._id}" 
                     style="display: inline-block; background: #2563eb; color: white; padding: 18px 45px; text-decoration: none; border-radius: 14px; font-weight: bold; font-size: 16px;">
                     View Full Details
                  </a>
                </div>
              </div>
            </div>
          `,
        },
      ],
    });

    console.log(
      `✅ Success: Property alert sent to ${users.length} users via Mailjet.`,
    );
    return request.body;
  } catch (error) {
    console.error("❌ Mailjet API Error:", error.statusCode, error.message);
    throw error;
  }
};

module.exports = { sendPropertyAlert };
