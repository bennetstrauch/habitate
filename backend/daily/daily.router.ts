import { Router } from "express";
import { getDaily } from "./daily.controller";

const router = Router();

router.get("/", getDaily);

export const dailyRouter = router;
