import axios from "axios";

const evolutionApi = axios.create({
  baseURL: process.env.EVOLUTION_API_URL || 'https://tolkien.prontdental.cloud',
});

evolutionApi.defaults.headers.common['apikey'] =
  process.env.EVOLUTION_API_TOKEN || "oqJg3100SVKsBiOBBHRjz9MM9OKZQWYEYHbQS05d6SQIMitiI7k0t7B2U0rzxd3M";

export default evolutionApi;
