import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api", #localmente usa seu backend local; no deploy, o Render do front vai receber uma variável chamada VITE_API_URL apontando para o backend publicado.
});

export default api;