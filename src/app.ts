import express from "express";
import api from "./api";
import cors from "cors";

const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));

app.use("/", api);

export default app;
