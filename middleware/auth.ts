import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Corrected interface to match the token payload sent by the backend
interface AuthRequest extends Request {
  user?: { 
    id: string;
    email: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Cast the decoded token to the new user type with the 'email' property
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string, email: string };
    
    // Attach the full user object (including email) to the request
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(401).json({ error: 'Invalid token' });
  }
};