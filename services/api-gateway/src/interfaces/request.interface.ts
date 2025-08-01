import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: any;
  tenantId?: string;
}
