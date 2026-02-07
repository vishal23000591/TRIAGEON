import axios from "axios";

const API_URL = "http://localhost:3001/api/triage";

export const submitTriage = async (formData) => {
  const res = await axios.post(API_URL, formData);
  return res.data;
};
