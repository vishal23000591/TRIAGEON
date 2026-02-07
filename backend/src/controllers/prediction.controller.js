import {
  predictDiabetes,
  predictHeart,
  predictBP
} from "../services/mlProxy.service.js";

import Prediction from "../models/Prediction.js";

export const diabetesPrediction = async (req, res, next) => {
  try {
    const result = await predictDiabetes(req.body);

    const saved = await Prediction.create({
      patientId: req.body.patientId,
      disease: "diabetes",
      probability: result.risk_probability,
      severity: result.severity,
      confidence: result.confidence,
      rawResult: result
    });

    res.status(200).json(saved);
  } catch (err) {
    next(err);
  }
};

export const heartPrediction = async (req, res, next) => {
  try {
    const result = await predictHeart(req.body);

    const saved = await Prediction.create({
      patientId: req.body.patientId,
      disease: "heart_disease",
      probability: result.risk_probability,
      severity: result.severity,
      confidence: result.confidence,
      rawResult: result
    });

    res.status(200).json(saved);
  } catch (err) {
    next(err);
  }
};

export const bpPrediction = async (req, res, next) => {
  try {
    const result = await predictBP(req.body);

    const saved = await Prediction.create({
      patientId: req.body.patientId,
      disease: "hypertension",
      probability: result.risk_probability,
      severity: result.severity,
      confidence: result.confidence,
      rawResult: result
    });

    res.status(200).json(saved);
  } catch (err) {
    next(err);
  }
};
