import { useNavigate } from "react-router-dom";
import React from "react";
export default function PredictionCard({ title, desc, route, icon }) {
  const navigate = useNavigate();

  return (
    <div className="prediction-card" onClick={() => navigate(route)}>
      <div className="icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}
