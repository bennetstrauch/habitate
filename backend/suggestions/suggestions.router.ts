import { Router } from "express";
import {
  getSent,
  getSuggestions,
  postSuggestion,
  putSuggestion,
} from "./suggestions.controller";

const router = Router();

router.post("/", postSuggestion);
router.get("/sent", getSent);  // must be before /:id
router.get("/", getSuggestions);
router.put("/:id", putSuggestion);

export const suggestionsRouter = router;
