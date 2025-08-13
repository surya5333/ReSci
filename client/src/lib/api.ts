import { apiRequest } from "./queryClient";

export interface MethodsRecommendationRequest {
  hypothesis: string;
  variables: string;
  constraints?: string;
}

export interface SampleSizeCalculationRequest {
  testType: string;
  effectSize: number;
  power: number;
  alpha: number;
}

export interface CitationVerificationRequest {
  claim: string;
}

export interface ProtocolExportRequest {
  methodIds: string[];
  title: string;
  format: string;
  includeCitations?: boolean;
  includeEquipment?: boolean;
  includeCostEstimates?: boolean;
}

export const api = {
  methods: {
    recommend: async (data: MethodsRecommendationRequest) => {
      const response = await apiRequest("POST", "/api/methods/recommend", data);
      return response.json();
    },
    list: async () => {
      const response = await apiRequest("GET", "/api/methods");
      return response.json();
    }
  },

  sampleSize: {
    calculate: async (data: SampleSizeCalculationRequest) => {
      const response = await apiRequest("POST", "/api/sample-size/calculate", data);
      return response.json();
    },
    list: async () => {
      const response = await apiRequest("GET", "/api/sample-size");
      return response.json();
    }
  },

  citations: {
    verify: async (data: CitationVerificationRequest) => {
      const response = await apiRequest("POST", "/api/citations/verify", data);
      return response.json();
    },
    list: async () => {
      const response = await apiRequest("GET", "/api/citations");
      return response.json();
    }
  },

  protocols: {
    export: async (data: ProtocolExportRequest) => {
      const response = await apiRequest("POST", "/api/protocols/export", data);
      return response;
    },
    list: async () => {
      const response = await apiRequest("GET", "/api/protocols");
      return response.json();
    }
  },

  pubmed: {
    search: async (query: string, maxResults: number = 10) => {
      const response = await apiRequest("GET", `/api/pubmed/search?query=${encodeURIComponent(query)}&maxResults=${maxResults}`);
      return response.json();
    }
  }
};
