import express from "express";
import {
  diabetesPrediction,
  heartPrediction,
  bpPrediction
} from "../controllers/prediction.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/diabetes", auth, diabetesPrediction);
router.post("/heart", auth, heartPrediction);
router.post("/bp", auth, bpPrediction);

export default router;
