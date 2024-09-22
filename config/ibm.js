import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configuration
const IBM_AUTH_URL = "https://iam.cloud.ibm.com";
const IBM_API_KEY = "Ctgnqpjrm5vLfZUAspBipnlehIn9TSPAPrhwQ2xMpXqv";
const IBM_API_BASE_URL = "https://us-south.ml.cloud.ibm.com/ml/v1";
const IBM_PROJECT_ID = "a173faa1-6471-4207-a9d3-7b4f763622bd";

// Create an axios instance
const api = axios.create({
  baseURL: IBM_API_BASE_URL,
});

// Function to generate new tokens
// Function to generate new token
const generateToken = async () => {
  try {
    const params = new URLSearchParams({
      grant_type: "urn:ibm:params:oauth:grant-type:apikey",
      apikey: IBM_API_KEY,
    }).toString();
    const response = await axios.post(
      IBM_AUTH_URL + "/identity/token",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, expires_in } = response.data;

    // Store token and expiration time
    await AsyncStorage.setItem("accessToken", access_token);
    await AsyncStorage.setItem(
      "tokenExpiration",
      (Date.now() + expires_in * 1000).toString()
    );

    return access_token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
};

// Axios request interceptor
api.interceptors.request.use(
  async (config) => {
    const tokenExpiration = await AsyncStorage.getItem("tokenExpiration");

    if (tokenExpiration && Date.now() > parseInt(tokenExpiration)) {
      const newToken = await generateToken();
      config.headers["Authorization"] = `Bearer ${newToken}`;
    } else {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function for physio chat assistance using Granite Instruct 13B
const getPhysioChatAssistance = async (conversationHistory) => {
  try {
    const response = await api.post(
      "/text/generation?version=2023-05-29",
      {
        input: conversationHistory,
        parameters: {
          decoding_method: "greedy",
          max_new_tokens: 900,
          min_new_tokens: 0,
          stop_sequences: [],
          repetition_penalty: 1.05,
        },
        model_id: "ibm/granite-13b-instruct-v2",
        project_id: IBM_PROJECT_ID,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting physio chat assistance:", error);
    return [];
  }
};

// Function for personalized physio treatment plan using LLaMA 3 8B Instruct
const getPersonalizedPhysioTreatmentPlan = async (patientInfo) => {
  try {
    const prompt = `Generate a personalized physiotherapy plan for the patient, including recommended exercises, duration, and progression plan.

Input: ${JSON.stringify(patientInfo)}
Output:`;

    const response = await api.post(
      "/text/generation?version=2023-05-29",
      {
        input: prompt,
        parameters: {
          decoding_method: "greedy",
          max_new_tokens: 250,
          min_new_tokens: 0,
          stop_sequences: ["Input"],
          repetition_penalty: 1,
        },
        model_id: "meta-llama/llama-3-8b-instruct",
        project_id: IBM_PROJECT_ID,
        moderations: {
          hap: {
            input: {
              enabled: true,
              threshold: 0.5,
              mask: {
                remove_entity_value: true,
              },
            },
            output: {
              enabled: true,
              threshold: 0.5,
              mask: {
                remove_entity_value: true,
              },
            },
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response.data.results[0].generated_text;
  } catch (error) {
    console.error("Error getting personalized physio treatment plan:", error);
    throw error;
  }
};

// Initialize tokens
const initializeTokens = async () => {
  const accessToken = await AsyncStorage.getItem("accessToken");
  if (!accessToken) {
    await generateToken();
  }
};

export {
  initializeTokens,
  getPhysioChatAssistance,
  getPersonalizedPhysioTreatmentPlan,
};
