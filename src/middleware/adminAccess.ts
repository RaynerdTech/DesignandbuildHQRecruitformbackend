import { timingSafeEqual } from 'crypto';
import { Request, Response, NextFunction } from 'express';

/** Only protects administration; POST /submit remains public. */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const expected = process.env.ADMIN_API_KEY;
  // Safe by default: never expose applicants when the deployment has no admin key.
  if (!expected || expected.length < 32) {
    res.status(503).json({ success: false, message: 'Administration API is not configured' });
    return;
  }

  const supplied = req.header('x-admin-key') || '';
  const expectedBytes = Buffer.from(expected);
  const suppliedBytes = Buffer.from(supplied);
  if (suppliedBytes.length !== expectedBytes.length ||
      !timingSafeEqual(suppliedBytes, expectedBytes)) {
    res.status(401).json({ success: false, message: 'Administrator authorization required' });
    return;
  }
  next();
};
