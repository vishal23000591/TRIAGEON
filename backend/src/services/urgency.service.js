export const anemiaUrgency = (hb) => {
  if (hb >= 11) return "LOW";
  if (hb >= 9) return "MODERATE";
  if (hb >= 7) return "HIGH";
  return "CRITICAL";
};
