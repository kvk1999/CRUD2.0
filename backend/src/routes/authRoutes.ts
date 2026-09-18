import { Router, Request, Response } from 'express';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { User } from '../models/User';

const router = Router();

const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password: string, storedHash: string) => {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const passwordHash = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(hash, 'hex');
  return storedBuffer.length === passwordHash.length && timingSafeEqual(storedBuffer, passwordHash);
};

router.post('/register', async (req: Request, res: Response) => {
  try {
    const username = String(req.body.username || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (username.length < 3 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 4) {
      res.status(400).json({ success: false, message: 'Invalid username, email, or password.' });
      return;
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Username or email is already registered.' });
      return;
    }

    await User.create({ username, email, passwordHash: hashPassword(password) });
    res.status(201).json({ success: true, data: { username, email } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Registration failed.' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const identifier = String(req.body.identifier || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ success: false, message: 'Incorrect username/email or password.' });
      return;
    }

    res.status(200).json({ success: true, data: { username: user.username, email: user.email } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Login failed.' });
  }
});

export default router;