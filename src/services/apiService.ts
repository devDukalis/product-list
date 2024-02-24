import axios, { AxiosResponse } from "axios";

import md5 from "crypto-js/md5";

import { ApiResponse, FilterParams, Product } from "@/models";

const BASE_URL = "http://api.valantis.store:40000/";
const PASSWORD = "Valantis";

class ApiService {
  private async makeRequest<T>(action: string, params: unknown = {}): Promise<T> {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const authToken = md5(`${PASSWORD}_${timestamp}`).toString();

    try {
      const response: AxiosResponse<ApiResponse<T>> = await axios.post(
        BASE_URL,
        {
          action,
          params,
        },
        {
          headers: {
            "X-Auth": authToken,
          },
        },
      );
      return response.data.result;
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  async getIds(offset?: number, limit?: number): Promise<string[]> {
    return this.makeRequest<string[]>("get_ids", { offset, limit });
  }

  async getItems(ids: string[]): Promise<Product[]> {
    return this.makeRequest<Product[]>("get_items", { ids });
  }

  async getFields(field?: string, offset?: number, limit?: number): Promise<unknown[]> {
    return this.makeRequest<unknown[]>("get_fields", { field, offset, limit });
  }

  async filter(params: FilterParams): Promise<string[]> {
    return this.makeRequest<string[]>("filter", { params });
  }
}

const apiService = new ApiService();

export default apiService;
