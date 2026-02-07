import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Predictions from "./pages/Predictions";
import TriageResult from "./pages/TriageResult";

import AnemiaPrediction from "./pages/predictions/AnemiaPrediction";
import DiabetesPrediction from "./pages/predictions/DiabetesPrediction";
import BPPrediction from "./pages/predictions/BPPrediction";
import HeartPrediction from "./pages/predictions/HeartPrediction";
import FeverPrediction from "./pages/predictions/FeverPrediction";

export default function App() {
  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/predictions" element={<Predictions />} />

        <Route path="/predictions/anemia" element={<AnemiaPrediction />} />
        <Route path="/predictions/diabetes" element={<DiabetesPrediction />} />
        <Route path="/predictions/bp" element={<BPPrediction />} />
        <Route path="/predictions/heart" element={<HeartPrediction />} />
        <Route path="/predictions/fever" element={<FeverPrediction />} />

        {/* 🔥 TRIAGE RESULT PAGE */}
        <Route path="/triage-result" element={<TriageResult />} />
      </Routes>
    </div>
  );
}
