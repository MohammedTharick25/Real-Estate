const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Helps bypass some cloud network handshake issues
    minVersion: "TLSv1.2",
  },
});

console.log("Attempting Mailer Config for:", process.env.EMAIL_USER);

const sendPropertyAlert = async (users, property) => {
  // Safety check: ensure we have users
  if (!users || users.length === 0) return console.log("No users to notify.");

  const propertyImage =
    property.images?.[0] || "https://estatera.onrender.com/og-image.png";
  const propertyTitle = property.title || "Exclusive New Property";
  const propertyPrice = property.price
    ? `₹${property.price.toLocaleString()}`
    : "Price on Request";

  const emailPromises = users.map((user) => {
    // 🛡️ Guard against missing data
    const propertyImage =
      property.images?.[0] || "https://estatera.onrender.com/og-image.png";
    const propertyTitle = property.title || "New Luxury Property";
    const propertyPrice = property.price
      ? `₹${property.price.toLocaleString()}`
      : "Contact for Price";

    return transporter.sendMail({
      from: `"Estatera Luxury" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `✨ New Exclusive Property: ${propertyTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 15px; overflow: hidden;">
          <div style="background: #2563eb; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">ESTATERA</h1>
          </div>
          <img src="${propertyImage}" style="width: 100%; height: 250px; object-fit: cover;" />
          <div style="padding: 30px;">
            <h2 style="color: #1e293b;">${propertyTitle}</h2>
            <p style="color: #2563eb; font-size: 20px; font-weight: bold;">${propertyPrice}</p>
            <p style="color: #64748b;">${property.location}</p>
            <a href="${process.env.FRONTEND_URL}/property/${property._id}" 
               style="display: inline-block; background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">
               View Details
            </a>
          </div>
        </div>
      `,
    });
  });

  return Promise.allSettled(emailPromises);
};

transporter.verify((error) => {
  if (error) {
    console.log("❌ Mailer Config Failed:", error);
  } else {
    console.log("📧 Mailer Ready: SMTP connected");
  }
});

module.exports = { sendPropertyAlert };
