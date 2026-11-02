import axios from "axios";

export const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong.",
) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const message = error.response.data?.message;
      return typeof message === "string" && message ? message : fallback;
    }
    return "Network error. Check your connection and try again.";
  }
  return fallback;
};
