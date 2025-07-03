
import { Request } from 'express';

export interface JwtPayload {
  userId: string;
  userEmail: string;
  role: string;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
