import express from "express";
import cors from "cors";
import axios from "axios";
import triageRoutes from "./routes/triage.routes.js";
const app = express();

app.use(cors({ origin: "http://localhost:5179" }));
app.use(express.json());

app.use("/api/triage", triageRoutes);


/* =======================
   DIABETES PREDICTION
======================= */
app.post("/api/prediction/diabetes", async (req, res) => {
  try {
    console.log("➡️ Diabetes request:", req.body);

    const response = await axios.post(
      "http://localhost:8002/predict",
      req.body,
      { timeout: 10000 }
    );

    console.log("⬅️ Diabetes ML response:", response.data);
    res.status(200).json(response.data);

  } catch (err) {
    console.error("🔥 DIABETES BACKEND ERROR 🔥");

    if (err.response) {
      return res.status(500).json({
        error: "Diabetes ML failed",
        details: err.response.data
      });
    }

    if (err.request) {
      return res.status(502).json({
        error: "Diabetes ML not responding"
      });
    }

    return res.status(500).json({
      error: "Internal diabetes prediction error"
    });
  }
});

/* =======================
   HEART PREDICTION
======================= */
app.post("/api/prediction/heart", async (req, res) => {
  try {
    console.log("➡️ Heart request:", req.body);

    const response = await axios.post(
      "http://localhost:8004/predict",
      req.body,
      { timeout: 10000 }
    );

    console.log("⬅️ Heart ML response:", response.data);
    res.status(200).json(response.data);

  } catch (err) {
    console.error("🔥 HEART BACKEND ERROR 🔥");

    if (err.response) {
      return res.status(500).json({
        error: "Heart ML failed",
        details: err.response.data
      });
    }

    if (err.request) {
      return res.status(502).json({
        error: "Heart ML not responding"
      });
    }

    return res.status(500).json({
      error: "Internal heart prediction error"
    });
  }
});

/* =======================
   BP / HYPERTENSION
======================= */
app.post("/api/prediction/bp", async (req, res) => {
  try {
    console.log("➡️ BP request:", req.body);

    const response = await axios.post(
      "http://localhost:8003/predict",
      req.body,
      { timeout: 10000 }
    );

    console.log("⬅️ BP ML response:", response.data);
    res.status(200).json(response.data);

  } catch (err) {
    console.error("🔥 BP BACKEND ERROR 🔥");

    if (err.response) {
      return res.status(500).json({
        error: "BP ML failed",
        details: err.response.data
      });
    }

    if (err.request) {
      return res.status(502).json({
        error: "BP ML not responding"
      });
    }

    return res.status(500).json({
      error: "Internal BP prediction error"
    });
  }
});

/* =======================
   FEVER / INFECTION
======================= */
app.post("/api/prediction/fever", async (req, res) => {
  try {
    console.log("➡️ Fever request:", req.body);

    const response = await axios.post(
      "http://localhost:8005/predict",
      req.body,
      { timeout: 10000 }
    );

    console.log("⬅️ Fever ML response:", response.data);
    res.status(200).json(response.data);

  } catch (err) {
    console.error("🔥 FEVER BACKEND ERROR 🔥");

    if (err.response) {
      return res.status(500).json({
        error: "Fever ML failed",
        details: err.response.data
      });
    }

    if (err.request) {
      return res.status(502).json({
        error: "Fever ML not responding"
      });
    }

    return res.status(500).json({
      error: "Internal fever prediction error"
    });
  }
});


export default app;
