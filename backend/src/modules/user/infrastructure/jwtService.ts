import jwt from 'jsonwebtoken';
import { config } from '@config/dotenv';

class JWTService {
  generateToken(payload: object) {
    const token = jwt.sign(payload, config.secretKey, { expiresIn: '1h' });
    return token;
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, config.secretKey);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

export { JWTService };