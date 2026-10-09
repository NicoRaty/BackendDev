import * as db from "../db";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { Request, Response, Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  if (!req.body) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: ReasonPhrases.BAD_REQUEST,
      code: StatusCodes.BAD_REQUEST,
    });
    return;
  }

  const { name, password } = req.body;
  try {
    const user = await db.getUserByName(name);
    if (!user) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Wrong User Name",
        code: StatusCodes.UNAUTHORIZED,
      });
      return;
    }

    if (user.Password && await bcrypt.compare(password, user.Password)) {
      delete user.Password;
      user.Token = jwt.sign({id: user.ID}, process.env.SECRET as string);
      res.json(user);
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Wrong Password",
        code: StatusCodes.UNAUTHORIZED,
      });
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      code: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
});

export default router;