import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: 'admin' | 'user';
        [key: string]: any;
      };
    }
  }
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}