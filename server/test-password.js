const bcrypt = require('bcryptjs');

const password = 'Admin123!';
const hash = '$2b$10$Kaey3a8l4ziXyaZzsPwXvewDrRMPuHyIZCS5hmOIGpvZx0U8rZeuK';

bcrypt.compare(password, hash).then(result => {
  console.log('Password matches:', result);
  process.exit(result ? 0 : 1);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
