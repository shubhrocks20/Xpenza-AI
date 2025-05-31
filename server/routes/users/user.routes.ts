import { Router } from "express";
import { userController } from "./user.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";
import upload from "../../middlewares/multer";
import { validateData } from "../../middlewares/validationMiddleware";
import { loginSchema } from "../../types/index.d";

const userRouter = Router()
userRouter.post('/manual', userController.register)
userRouter.post('/login',validateData(loginSchema), userController.login)
userRouter.patch('/',[authMiddleware, upload.single('avatar')], userController.updateUser)
userRouter.post('/auth/google', userController.googleAuth)
userRouter.post('/auth/github', userController.githubAuth)
userRouter.get('/me', authMiddleware,userController.me)
userRouter.post('/ask', userController.askMeAnything)
userRouter.post('/user-context', userController.userContext)

export default userRouter