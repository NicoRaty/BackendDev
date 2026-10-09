import express from "express";
import placesRouter from "./routers/places";
import loginRouter from "./routers/login";
import usersRouter from "./routers/users";

const server = express();
server.use(express.json());

server.use("/api/places", placesRouter);
server.use("/api/login", loginRouter);
server.use("/api/users", usersRouter);

server.listen(process.env.PORT, () => {
    console.log("Server is running on port " + process.env.PORT);
});