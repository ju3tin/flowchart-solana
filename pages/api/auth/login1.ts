import connect from '../../../lib/mongodb';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  await connect();

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const tokenSecret = process.env.JWT_SECRET;

  if (!tokenSecret) {
    return res.status(500).json({ message: 'Server error: JWT secret not configured' });
  }

  const token = jwt.sign({ userId: user._id }, tokenSecret, { expiresIn: '1h' });

  res.status(200).json({ message: 'Login successful', token });
}
