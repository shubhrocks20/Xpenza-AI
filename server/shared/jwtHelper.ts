import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;


export const jwtHelper = {
  generateToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, {expiresIn: '7d'});
  },

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null; 
    }
  }
};
