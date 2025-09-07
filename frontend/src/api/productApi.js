import axios from "axios";
import axiosClient from "./axiosClient";
const BASE = "/products";


async function getAll() {
  const res = await axiosClient.get(`${BASE}/home`);
  return res.data;
}

export default {
  getAll,
};
