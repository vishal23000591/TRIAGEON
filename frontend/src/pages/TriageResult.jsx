import React from "react";
import { useLocation } from "react-router-dom";

export default function TriageResult() {
  const location = useLocation();
  const { result } = location.state || {};

  if (!result) {
    return <div>No triage data available</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Triage Result</h2>

      <h3>
        Urgency Level:{" "}
        <span>{result.triage_decision.triage_level}</span>
      </h3>

      <p>
        <strong>Department:</strong>{" "}
        {result.triage_decision.department}
      </p>

      <p>
        <strong>Time to Treatment:</strong>{" "}
        {result.triage_decision.time_to_treatment}
      </p>

      <p>
        <strong>Message:</strong>{" "}
        {result.explanations.patient_message}
      </p>
    </div>
  );
}
