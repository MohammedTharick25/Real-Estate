const Mailjet = require("node-mailjet");

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY,
);

const sendPropertyAlert = async (users, property) => {
  if (!users || users.length === 0) return;

  // 1. Force HTTPS and Clean Cloudinary URLs
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
            Email: "estatera.team@gmail.com", // 🛡️ SEE SPAM FIX NOTE BELOW
            Name: "Estatera Luxury",
          },
          To: recipients,
          Subject: `✨ New Luxury Property in ${property.location}: ${propertyTitle}`,

          // 🛡️ SPAM FIX: Always include a Text version
          TextPart: `New Property Alert: ${propertyTitle} available for ${propertyPrice}. View details here: ${frontendUrl}/property/${property._id}`,

          // 🖼️ IMAGE & LAYOUT FIX: Table-based layout is best for emails
          HTMLPart: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f7fa; padding: 20px;">
              <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
                
                <!-- Header -->
                <tr>
                  <td align="center" style="padding: 30px; background-color: #2563eb;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px;">ESTATERA</h1>
                  </td>
                </tr>

                <!-- Property Image (FIXED TAG) -->
                <tr>
                  <td align="center">
                    <img src="${propertyImage}" alt="${propertyTitle}" width="600" style="width: 100%; max-width: 600px; display: block; height: auto;" border="0" />
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="color: #1e293b; font-size: 22px; margin: 0 0 10px 0;">${propertyTitle}</h2>
                    <p style="color: #2563eb; font-size: 26px; font-weight: bold; margin: 0 0 10px 0;">${propertyPrice}</p>
                    <p style="color: #64748b; font-size: 16px; margin: 0 0 30px 0;">📍 ${property.location}</p>
                    
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="${frontendUrl}/property/${property._id}" 
                             style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                             View Full Details
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer (SPAM FIX: Unsubscribe) -->
                <tr>
                  <td style="padding: 20px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                      Estatera Real Estate Group, Chennai, India. <br>
                      You are receiving this because you signed up on our platform. <br>
                      <a href="#" style="color: #2563eb;">Unsubscribe</a>
                    </p>
                  </td>
                </tr>
              </table>
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
