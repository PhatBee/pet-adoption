const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });


    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    });
};

const sendPasswordResetOtpEmail = async (to, otp, ttlMinutes) => {
  const subject = "Pet Adoption - Đặt lại mật khẩu (OTP)";
  const text =
`Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Pet Adoption.

Mã OTP của bạn là: ${otp}
OTP có hiệu lực trong ${ttlMinutes} phút.

Nếu không phải bạn yêu cầu, hãy bỏ qua email này.`;
  await sendEmail(to, subject, text);
};

module.exports = {
    sendEmail,
    sendPasswordResetOtpEmail,
};
