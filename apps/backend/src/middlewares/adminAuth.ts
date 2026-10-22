import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

export function getJwtSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET must be configured for admin authentication.");
  }
  return secret;
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authorization = req.header("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  try {
    const payload = jwt.verify(match[1], getJwtSecret());
    if (typeof payload === "string" || typeof payload.sub !== "string") {
      res.status(401).json({ error: "Invalid session." });
      return;
    }

    res.locals.adminEmail = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Your session has expired. Please sign in again." });
  }
}
