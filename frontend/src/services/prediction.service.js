import api from "./api";

export const predictDiabetes = (payload) =>
  api.post("/prediction/diabetes", payload);

export const predictHeart = (payload) =>
  api.post("/prediction/heart", payload);

export const predictBP = (payload) =>
  api.post("/prediction/bp", payload);

export const predictFever = (payload) =>
  api.post("/prediction/fever", payload);
