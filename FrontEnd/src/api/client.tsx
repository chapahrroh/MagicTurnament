import { useAuth } from "../context/playerContext";

export const useApi = () => {
  const { token } = useAuth();

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      // Handle unauthorized access
      throw new Error("Unauthorized");
    }
    return response;
  };

  return { fetchWithAuth };
};
