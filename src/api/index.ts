import express from "express";
import apiRouter from "./v1";
import usersController from "../controllers/usersController";
import multer from "multer";

const router = express.Router();

const upload = multer({storage: multer.memoryStorage()});

router.get("/", (_, res) => {
  res.send("Welcome to employee salary management (ESM) api!");
});
router.use("/api", apiRouter);

router.post("/users/upload", upload.single("file"), usersController.uploadFile);

export default router;
