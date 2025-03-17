import jwt from 'jsonwebtoken';
import { config } from '@config/dotenv';

class JWTService {
  generateToken(payload: object) {
    const token = jwt.sign(payload, config.secretKey, { expiresIn: '7d' });
    return token;
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, config.secretKey);
    } catch {
      throw new Error('Invalid token');
    }
  }
}

export { JWTService };