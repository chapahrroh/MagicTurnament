import axios from "axios";

const fetchWithRetry = async <T>(url: string, retries = 3): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error("Maximum retries reached");
};

export { fetchWithRetry };
