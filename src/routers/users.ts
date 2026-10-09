import * as db from "../db";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { Request, Response, Router } from "express";
import bcrypt from "bcrypt";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  if (!req.body) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: ReasonPhrases.BAD_REQUEST,
      code: StatusCodes.BAD_REQUEST,
    });
    return;
  }

  const { name } = req.body;
  try {
    const existingUser = await db.getUserByName(name);
    if (existingUser) {
      res.status(StatusCodes.CONFLICT).json({
        message: "User Already Exists",
        code: StatusCodes.CONFLICT,
      });
      return;
    }

    req.body.password = await bcrypt.hash(req.body.password, 12);
    await db.addUser(name, req.body.password);
    const user = await db.getUserByName(name);
    delete user?.Password;
    res.json(user);
  } catch (error) {
    console.error("Database error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      code: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
});

// Get all users
router.get("/", async (req: Request, res: Response) => {
  try {
      const allUsers = await db.getAllUsers();
      res.json(allUsers);
  } catch (error) {
      console.error("Database error:", error)
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          code: StatusCodes.INTERNAL_SERVER_ERROR
      });
  }
});

export default router;