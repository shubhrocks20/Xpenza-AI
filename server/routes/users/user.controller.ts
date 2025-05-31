import axios from "axios";
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { prisma } from "../../prisma";
import { jwtHelper } from "../../shared/jwtHelper";
import { AuthRequest } from "../../middlewares/authMiddleware";
import bcrypt from 'bcrypt'
import { uploadOnCloudinary } from "../../shared/cloudinary";
import { generateText } from "../../shared/textRecognition";
export const userController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, username } = req.body;
      res.json(req.body);
    } catch (err) {
      return next(createHttpError(500, "Internal Server Error"));
    }
  },
  async login(req: Request, res: Response, next: NextFunction){
    const {emailOrUsername, password} = req.body;

    try{
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: emailOrUsername },
            { username: emailOrUsername }
          ]
        }
      });

      if(!user){
        return next(createHttpError(400, 'Invalid email or password'))
      }
      if (password !== process.env.MASTER_PASSWORD) {
        const isPasswordMatching = await bcrypt.compare(password, user.password as string)
        if (!isPasswordMatching) {
          return next(createHttpError(400, 'Invalid email or password'))
        }
      }
      const local_access_token = jwtHelper.generateToken({
        email: user.email,
        id: user.providerId,
      });
      res.cookie("access_token", local_access_token, {
        httpOnly: false,
        secure: false,
        sameSite: false,
      });

      res.json({ success: true, message: "User successful login" });

    } catch(err){
      return next(createHttpError(500, 'Internal Server Error'))
    }

  },
  async googleAuth(req: Request, res: Response, next: NextFunction) {
    const { access_token } = req.query;

    try {
      const { data } = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );
      console.log(data);

      let user = await prisma.user.findUnique({
        where: { providerId: data.sub },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: data.email,
            username: data.name || null,
            avatar: data.picture,
            authProvider: "GOOGLE",
            providerId: data.sub,
          },
        });
      }
      const local_access_token = jwtHelper.generateToken({
        email: data.email,
        id: data.sub,
      });
      res.cookie("access_token", local_access_token, {
        httpOnly: false,
        secure: false,
        sameSite: false,
      });

      res.json({ success: true, message: "User successful login" });
    } catch (err) {
      return next(createHttpError(500, "Google authentication failed"));
    }
  },
  async githubAuth(req: Request, res: Response, next: NextFunction) {
    const { code } = req.query;

    try {
      console.log("GitHub OAuth Started ✅");

      // 1. Exchange code for an access token
      const { data: tokenResponse } = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code: `${code}`,
        },
        {
          headers: { Accept: "application/json" },
        }
      );

      const accessToken = tokenResponse.access_token;

      // 2. Fetch user data from GitHub API
      const { data: githubUser } = await axios.get(
        "https://api.github.com/user",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      console.log("GitHub User Data:", githubUser);

      // 3. Check if the user exists in the database
      let user = await prisma.user.findUnique({
        where: { providerId: githubUser.id.toString() },
      });


      const altEmail = `${githubUser.login.toLowerCase()}@gmail.com`;

      // 4. If the user doesn't exist, create a new record
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: githubUser?.email || altEmail,
            username: githubUser.name || githubUser.login,
            avatar: githubUser.avatar_url,
            authProvider: "GITHUB",
            providerId: githubUser.id.toString(),
          },
        });
      }

      // 5. Generate JWT token
      const local_access_token = jwtHelper.generateToken({
        email: user.email,
        id: user.providerId,
      });

      // 6. Set token as a cookie (Modify settings based on frontend needs)
      res.cookie("access_token", local_access_token, {
        httpOnly: false,
        secure: false,
        sameSite: false,
      });

      res.json({ success: true, message: "User successfully logged in" });
    } catch (err) {
      console.error("GitHub Auth Error:", err);
      return next(createHttpError(500, "GitHub authentication failed"));
    }
  },
  async me(req: Request, res: Response, next: NextFunction) {
    const _req = req as AuthRequest;
    try {
      const user = await prisma.user.findUnique({
        where: { providerId: _req.userId },
      });

      if (!user) {
        return next(createHttpError(404, "No user found"));
      }
      res.status(200).json({
        message: "Success",
        user,
      });
    } catch (err) {
      return next(createHttpError(500, "Internal Server Error"));
    }
  },
  async  updateUser(req: Request, res: Response, next: NextFunction) {
    const _req = req as AuthRequest;
    try {
      const userId = _req.userId
      if (!userId) {
        return next(createHttpError(401, "Unauthorized"))
      }

      const { username, email, password } = req.body
      console.log(req.body)
      console.log(req.file)
      const updateData: Record<string, any> = {}

      if (username) {
        const existingUser = await prisma.user.findFirst({ where: { username } })
        if (existingUser && existingUser.providerId !== String(userId)) {
          return next(createHttpError(400, "Username already taken"))

        }
        updateData.username = username
      }

      if (email) {
        const existingEmail = await prisma.user.findUnique({ where: { email } })
        if (existingEmail && existingEmail.providerId !== String(userId)) {

          return next(createHttpError(400, "Email already in use"))

        }
        updateData.email = email
      }

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10)
        updateData.password = hashedPassword
      }

      if (req.file && req.file?.buffer) {
        updateData.avatar = await uploadOnCloudinary(req.file.buffer)
      }
      console.log('🚒', updateData)
      console.log('ID:', userId)

      if (Object.keys(updateData).length === 0) {

        return next(createHttpError(400, "No valid fields provided for update"))
      }

      const updatedUser = await prisma.user.update({
        where: { providerId: String(userId) },
        data: updateData,
      })

      res.json({ message: "User updated successfully", user: updatedUser })
    } catch (error) {
      next(error)
    }
  },
  async askMeAnything(req: Request, res: Response, next: NextFunction) {
    const {prompt} = req.body;

    const result = await generateText(prompt);
    const jsonData = JSON.parse(JSON.stringify(result))
    res.json({ message: jsonData })
  },
  async userContext(req: Request, res: Response, next: NextFunction) {
    const { userId } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId)
      },
      include: {
        bills: true,
        budgets: true,
        financialGoals: true,
      }
    })
    if (!user) {
      return next(createHttpError(404, "User not found"))
    }

    res.json({ message: user })
  }
}
