const nodemailer = require("nodemailer");

// 🛡️ WORLD CLASS CLOUD CONFIGURATION
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // Using Port 465 (SSL)
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // 🚀 THE FIX FOR RENDER: Force IPv4 (Prevents ENETUNREACH IPv6 errors)
  family: 4,
  // Increase timeouts for cloud stability
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

console.log("⚡ Mailer initialized for:", process.env.EMAIL_USER);

const sendPropertyAlert = async (users, property) => {
  if (!users || users.length === 0)
    return console.log("⚠️ No users to notify.");

  // Fallback data for the template
  const propertyImage =
    property.images?.[0] || "https://estatera.onrender.com/og-image.png";
  const propertyTitle = property.title || "Exclusive New Listing";
  const propertyPrice = property.price
    ? `₹${property.price.toLocaleString()}`
    : "Price on Request";

  const emailPromises = users.map((user) => {
    return transporter.sendMail({
      from: `"Estatera Luxury" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `✨ New Luxury Property: ${propertyTitle}`,
      html: `
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
            © ${new Date().getFullYear()} Estatera Real Estate Group. All rights reserved.
          </div>
        </div>
      `,
    });
  });

  return Promise.allSettled(emailPromises);
};

// Verify Connection on Boot
transporter.verify((error) => {
  if (error) {
    console.error("❌ Mailer Connection Error:", error.message);
  } else {
    console.log("📧 Mailer Ready: Forced IPv4 (Port 465) connected.");
  }
});

module.exports = { sendPropertyAlert };
