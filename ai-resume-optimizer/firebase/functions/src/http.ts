import cors from "cors";
import type { Request, Response } from "firebase-functions/v2/https";

const corsMiddleware = cors({ origin: true });

export const runCors = (req: Request, res: Response) =>
  new Promise<void>((resolve, reject) => {
    corsMiddleware(req, res, (result) => {
      if (result instanceof Error) {
        reject(result);
        return;
      }

      resolve();
    });
  });
