import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

const JWT_SECRET_KEY = JWT_SECRET as string;


export const jwtHelper = {
  generateToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET_KEY, {expiresIn: '7d'});
  },

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET_KEY);
    } catch (error) {
      return null; 
    }
  }
};
