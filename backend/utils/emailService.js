const Mailjet = require("node-mailjet");

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY,
);

const sendPropertyAlert = async (users, property) => {
  if (!users || users.length === 0) return;

  // 1. Ensure Absolute HTTPS URLs
  let propertyImage =
    property.images?.[0] || "https://estatera.onrender.com/og-image.png";
  if (propertyImage.startsWith("http://")) {
    propertyImage = propertyImage.replace("http://", "https://");
  }

  const propertyTitle = property.title || "Exclusive Listing";
  const propertyPrice = property.price
    ? `₹${property.price.toLocaleString()}`
    : "Price on Request";
  const frontendUrl =
    process.env.FRONTEND_URL || "https://estatera.onrender.com";

  const recipients = users.map((user) => ({
    Email: user.email,
    Name: user.name || "Valued Member",
  }));

  try {
    await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "estatera.team@gmail.com",
            Name: "Estatera Luxury", // This name appears in the inbox
          },
          To: recipients,
          Subject: `✨ New Exclusive Property: ${propertyTitle}`,
          // 2. Optimized HTML for Image Loading
          HTMLPart: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; background-color: #ffffff;">
              <div style="background: #2563eb; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 2px;">ESTATERA</h1>
              </div>
              
              <!-- IMAGE BLOCK WITH FALLBACK -->
              <div style="width: 100%; max-height: 350px; overflow: hidden;">
                <img src="${propertyImage}" width="600" alt="Property" style="width: 100%; display: block; border: 0;" />
              </div>

              <div style="padding: 40px;">
                <h2 style="color: #1e293b; font-size: 24px; margin: 0;">${propertyTitle}</h2>
                <p style="color: #2563eb; font-size: 26px; font-weight: 900; margin: 10px 0;">${propertyPrice}</p>
                <p style="color: #64748b; font-size: 16px;">📍 ${property.location}</p>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${frontendUrl}/property/${property._id}" 
                     style="background: #2563eb; color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">
                     View Full Details
                  </a>
                </div>
              </div>
            </div>
          `,
        },
      ],
    });
    console.log(`✅ Success: Alert sent to ${users.length} users.`);
  } catch (error) {
    console.error("❌ Mailjet API Error:", error.statusCode);
  }
};

module.exports = { sendPropertyAlert };
