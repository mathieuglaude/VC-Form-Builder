import { Request, Response, NextFunction } from 'express';

export function isSuperAdmin(req: Request, res: Response, next: NextFunction) {
  // Get user role from request (set by auth middleware in routes.ts)
  const userRole = (req as any).user?.role;
  
  if (userRole !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  
  next();
}