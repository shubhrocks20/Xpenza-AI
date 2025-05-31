import createHttpError from "http-errors";
import { NextFunction,Response, Request } from "express";
import { jwtHelper } from "../shared/jwtHelper";



export interface AuthRequest extends Request {
    userId: string;
    email: string;
}
export const authMiddleware = async(req: Request, res: Response, next: NextFunction) => {
    const {authorization} = req.headers
    const access_token = authorization?.split(' ')[1]
    if (!access_token) {
        
        return next(createHttpError(401, 'Not authenticated to access'))
    }
    try{
        const {id, email} =  jwtHelper.verifyToken(access_token) as any
        const _req = req as AuthRequest
        _req.userId = id
        _req.email = email
        next()
    } catch (err) {
        return next(createHttpError(401, "Token Expired"));
    }
  
}
