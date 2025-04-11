import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

const secret = process.env.JWT_SECRET || '';

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, secret, {
    expiresIn: '1d',
  });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    return null;
  }
};
