import bcrypt from 'bcryptjs';
import sha1 from 'crypto-js/sha1';

const CLIENT_SALT = '$2b$10$PTz3CCJvhnZM3PKMjI0Ihu';

export const encryptUtils = {
  encodePassword(password: string) {
    const sha1Hash = sha1(password).toString();
    return bcrypt.hashSync(sha1Hash, CLIENT_SALT).substring(CLIENT_SALT.length);
  },

  generateSalt() {
    return bcrypt.genSaltSync(10).toString();
  }
};
