import express from "express";
import apiRouter from "./v1";
import usersRouter from "./users";

const router = express.Router();

router.get("/", (_, res) => {
  res.send("Welcome to employee salary management (ESM) api!");
});
router.use("/api", apiRouter);
router.use("/users", usersRouter);

export default router;
