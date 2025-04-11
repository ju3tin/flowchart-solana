import type { NextApiRequest, NextApiResponse } from 'next'

// Mock database
const users: { email: string, password: string }[] = []

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  // Basic email and password validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email address' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  // Check if user already exists
  const userExists = users.find(user => user.email === email)
  if (userExists) {
    return res.status(409).json({ message: 'User already exists' })
  }

  // Save the user (mock)
  users.push({ email, password })

  return res.status(201).json({ message: 'User registered successfully' })
}
