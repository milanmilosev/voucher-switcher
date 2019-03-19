import express from "express";
import cors from "cors";
const app = express();
require('dotenv').config({ path: 'process.env' })

import authRouter from "./routes/auth";
import indexRouter from "./routes/index";

// Allow CORS
app.use(cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
  );

  next();
});

app.use("/", authRouter);
app.use("/", indexRouter);

app.listen(process.env.PORT || 3000);
