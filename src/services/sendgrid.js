const axios = require('axios');

const { SEND_GRID_TOKEN, SEND_GRID_FROM, SEND_GRID_NAME } = process.env;

module.exports = {
  sendMail: (to, subject, content) => axios({
    method: 'post',
    url: 'https://api.sendgrid.com/v3/mail/send',
    data: {
      personalizations: [
        {
          to: [
            {
              email: to,
            },
          ],
        },
      ],
      from: {
        email: SEND_GRID_FROM,
        name: SEND_GRID_NAME,
      },
      subject,
      content: [
        {
          type: 'text/html',
          value: content,
        },
      ],
    },
    headers: {
      Authorization: `Bearer ${SEND_GRID_TOKEN}`,
    },
  }),

};
