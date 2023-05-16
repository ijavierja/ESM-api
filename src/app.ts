import express from "express";
import api from "./api";

const app = express();

app.use("/", api);

export default app;