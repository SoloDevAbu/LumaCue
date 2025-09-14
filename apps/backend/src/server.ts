import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRoutes);

app.listen(8080, () => {
    console.log("Server started on port 8080");
});
