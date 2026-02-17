import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const signup = (userData) => {
  return axios.post(`${API_BASE_URL}/auth/signup`, userData);
};

export const login = (credentials) => {
  return axios.post(`${API_BASE_URL}/auth/login`, credentials);
};

export const getAllUsers = () => {
  return axios.get(`${API_BASE_URL}/users`);
};