import * as db from "../db";
import { Place } from "../types";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();


router.get("/", async (_req: Request, res: Response) => {
    try {
        const places: Place[] = await db.getAllPlaces();
        res.json(places);
    } catch (error) {
        console.error("Database error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
            code: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});

// Get place by ID
router.get("/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    if(!id || isNaN(Number(id))) {
        res.status(StatusCodes.BAD_REQUEST).json({
            message: ReasonPhrases.BAD_REQUEST,
            code: StatusCodes.BAD_REQUEST
        });
        return;
    }

    try {
        const place = await db.getPlaceById(Number(id));
        if (!place) {
            res.status(StatusCodes.NOT_FOUND).json({
                message: ReasonPhrases.NOT_FOUND,
                code: StatusCodes.NOT_FOUND
            });
            return;
        }
        res.json(place);
    } catch (error) {
        console.error("Database error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
            code: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});

// Add a place
router.post("/", async (req: Request, res: Response) => {
    if (!req.body) {
        res.status(StatusCodes.BAD_REQUEST).json({
            message: ReasonPhrases.BAD_REQUEST,
            code: StatusCodes.BAD_REQUEST
        });
        return;
    }

    const { name, userid, latitude, longitude } = req.body;
    const auth = req.get("Authorization");

    if (!auth || !auth.startsWith("Bearer ")) {
        res.status(StatusCodes.UNAUTHORIZED).json({
            message: 'Missing or unexpected token',
            code: StatusCodes.UNAUTHORIZED
        });
        return;
    }

    // TODO: Modularization for auth and error handling
    const token = auth.split(" ")[1];
    console.log("Token:", token);

    try {
        const decodedToken = jwt.verify(token, process.env.SECRET as string) as {id: number};
        console.log(decodedToken);
        if (decodedToken.id != userid) {
            res.status(StatusCodes.FORBIDDEN).json({
                message: "Forbidden request",
                code: StatusCodes.FORBIDDEN
            });
        }
    } catch (error) {
        res.status(StatusCodes.UNAUTHORIZED).json({
            message: "Invalid token",
            code: StatusCodes.UNAUTHORIZED
        });
    }

    try {
        const newPlace = await db.addPlace(name, userid, latitude, longitude);
        res.status(StatusCodes.CREATED).json(newPlace);
    } catch (error) {
        console.error("Database error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
            code: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});

// Edit a place
router.put("/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    if(!id || isNaN(Number(id))) {
        res.status(StatusCodes.BAD_REQUEST).json({
            message: ReasonPhrases.BAD_REQUEST,
            code: StatusCodes.BAD_REQUEST
        });
        return;
    }

    if (!req.body) {
        res.status(StatusCodes.BAD_REQUEST).json({
            message: ReasonPhrases.BAD_REQUEST,
            code: StatusCodes.BAD_REQUEST
        });
        return;
    }

    const { name, userid, latitude, longitude } = req.body;
    try {
        const updatedPlace = await db.editPlace({ ID: Number(id), Name: name, UserID: userid, Latitude: latitude, Longitude: longitude });
        res.json(updatedPlace);
    } catch (error) {
        console.error("Database error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
            code: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});

// Delete a place
router.delete("/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    if(!id || isNaN(Number(id))) {
        res.status(StatusCodes.BAD_REQUEST).json({
            message: ReasonPhrases.BAD_REQUEST,
            code: StatusCodes.BAD_REQUEST
        });
        return;
    }

    try {
        const deletedPlace = await db.deletePlace(Number(id));
        res.json(deletedPlace);
    } catch (error) {
        console.error("Database error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
            code: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});

export default router;