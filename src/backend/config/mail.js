module.exports = {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  service: process.env.MAIL_SERVICE,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
};