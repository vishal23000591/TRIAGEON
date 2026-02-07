import { runTriageAI } from "../services/mlProxy.service.js";

export const triagePatient = async (req, res) => {
  try {
    const triageResult = await runTriageAI(req.body);
    res.json(triageResult);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
