import express from 'express';
import apiRouter from './v1';

const router = express.Router();

router.use('/', apiRouter)

export default router;