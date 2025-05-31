import { NextFunction , Response, Request} from "express";


export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = 500
    let error : {message : string, stack?: string} = {message: '', stack: ''}

    if(err.statusCode) statusCode = err.statusCode
    if(err.message) error.message = err.message
    if(process.env.ENV === 'development' && err.stack) error.stack = err.stack
    else delete error.stack
    return res.status(statusCode).json({success: 'fail', error: error})
}