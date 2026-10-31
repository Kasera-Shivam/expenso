import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) throw new Error("Api url is required.");

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

let accessToken: string | null = null;
export const setAccessToken = (t: string | null) => (accessToken = t);

let refreshPromise: Promise<string> | null = null;

export const refreshAccessToken = () => {
  refreshPromise ??= api
    .post("/account/refresh")
    .then((r) => (accessToken = r.data.data.accessToken as string))
    .finally(() => (refreshPromise = null));
  return refreshPromise;
};

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAccountRoute = original.url?.includes("/account/");
    if (error.response?.status === 401 && !original._retry && !isAccountRoute) {
      original._retry = true;
      try {
        await refreshAccessToken();
      } catch (error) {
        setAccessToken(null);
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(error);
      }
      return api(original);
    }
    return Promise.reject(error);
  },
);
