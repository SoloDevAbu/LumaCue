import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { prisma } from "@lumacue/db";
dotenv.config();

const ACCESS_KEY = process.env.ACCESS_KEY!;
const REFRESH_KEY = process.env.REFRESH_KEY!;

export const register = async (req: Request, res: Response) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
        });

        const accessToken = jwt.sign({ userId: user.id }, ACCESS_KEY, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ userId: user.id }, REFRESH_KEY, { expiresIn: "7d" });
        return res.status(201).json({ accessToken, refreshToken });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const accessToken = jwt.sign({ userId: user.id }, ACCESS_KEY, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ userId: user.id }, REFRESH_KEY, { expiresIn: "7d" });
        return res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const refreshToken = async (req: Request, res: Response) => {
    const { token } = req.body;
    if (!token)
        return res.status(403).json({ error: "Invalid refresh token" });    
    try {
        
        const payload = jwt.verify(token, REFRESH_KEY) as any;
        const accessToken = jwt.sign({ userId: payload.userId }, ACCESS_KEY, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ userId: payload.userId }, REFRESH_KEY, { expiresIn: "7d" });
        return res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
