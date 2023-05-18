import express from 'express'
import multer from 'multer';
import usersController from '../../controllers/usersController';

const usersRouter = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

usersRouter.post("/upload", upload.single("file"), usersController.uploadFile);
usersRouter.get("/", usersController.getUsers);

export default usersRouter;