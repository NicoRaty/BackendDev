import * as maria from "mariadb";
import "dotenv/config";
import {Place, User} from "./types";

let pool: maria.Pool | undefined;

export function getPool(): maria.Pool {
    if (!pool) {
        pool = maria.createPool({
            host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
            connectionLimit: 100
        });
    }
    return pool;
}

async function sendQuery<T>(sql: string, params?: any[]): Promise<T[]> {
    let connection: maria.PoolConnection | null = null;
    
    try {
        connection = await getPool().getConnection();
        
        return await connection.query(sql, params);
    } catch (err) {
        console.error("Database query failed:", err);
        throw err;
    } finally {
        connection?.release();
    }
}

export async function getAllPlaces(): Promise<Place[]> {
    return sendQuery<Place>("SELECT * FROM Places");
}

export async function getUserById(id: number): Promise<User | undefined> {
    const sql = "SELECT * FROM Users WHERE id = ?";
    const users = await sendQuery<User>(sql, [id]);
    return users[0];
}

export async function getUserByName(name: string): Promise<User | undefined> {
  const sql = "SELECT * FROM `Users` where Name = ?";
  return (await sendQuery<User>(sql, [name]))[0];
}

export async function getPlaceById(id: number): Promise<Place | undefined> {
  const sql = "SELECT * FROM `Places` where ID = ?";
  return (await sendQuery<Place>(sql, [id]))[0];
}

export async function addUser(name: string, password: string): Promise<void> {
    const sql = "INSERT INTO `Users` (Name, Password) VALUES (?, ?)";
    await sendQuery(sql, [name, password]);
}

export async function getPlaceByUsername(Name: string): Promise<Place[]> {
    const sql = "SELECT * FROM Places WHERE Name = ?";
    const places = await sendQuery<Place>(sql, [Name]);
    return places;
}

export async function getPlacesNearPlace(Latitude: number, Longitude: number): Promise<Place[]> {
    const sql = "SELECT * FROM Places WHERE Latitude BETWEEN ? AND ? AND Longitude BETWEEN ? AND ?";
    const places = await sendQuery<Place>(sql, [Latitude - 0.009, Latitude + 0.009, Longitude - 0.009, Longitude + 0.009]);
    // One kilometer is approximately 0.009 degrees of latitude and logitude.
    return places;
}

export async function addPlace(Name: string, UserID: number, Latitude: number, Longitude: number): Promise<Place> {
    const sql = "INSERT INTO Places (Name, UserID, Latitude, Longitude) VALUES (?, ?, ?, ?)";
    await sendQuery(sql, [Name, UserID, Latitude, Longitude]);
    const place = await sendQuery<Place>("SELECT * FROM Places WHERE Name = ? AND UserID = ? AND Latitude = ? AND Longitude = ?",
        [Name, UserID, Latitude, Longitude]);
    return place[0];
}

export async function editPlace(Place: Place): Promise<Place> {
    const sql = "UPDATE Places SET Name = ?, UserID = ?, Latitude = ?, Longitude = ? WHERE ID = ?";
    await sendQuery(sql, [Place.Name, Place.UserID, Place.Latitude, Place.Longitude, Place.ID]);
    const place = await sendQuery<Place>("SELECT * FROM Places WHERE ID = ?", [Place.ID]);
    return place[0];
}

export async function deletePlace(id: number): Promise<void> {
    const sql = "DELETE FROM Places WHERE ID = ?";
    await sendQuery(sql, [id]);
}

export async function getAllUsers(): Promise<User[]> {
    return sendQuery<User>("SELECT * FROM Users");
}