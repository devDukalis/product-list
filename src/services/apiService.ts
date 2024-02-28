import axios, { AxiosResponse } from "axios";
import md5 from "crypto-js/md5";

import { generateUniqueKey } from "@/utils";

import { ApiResponse, FieldParams, FilterParams, Product } from "@/models";

const BASE_URL = "http://api.valantis.store:40000/";
const PASSWORD = "Valantis";
const MAX_RETRIES = 2;

class ApiService {
  private async makeRequest<T>(action: string, params?: unknown, retries = 0): Promise<T> {
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
      const errorId = generateUniqueKey();
      console.error(errorId);

      if (retries < MAX_RETRIES) {
        return this.makeRequest(action, params, retries + 1);
      } else {
        throw new Error(`${error}`);
      }
    }
  }

  // получить id всех товаров
  async getIds(offset?: number, limit?: number): Promise<string[]> {
    return this.makeRequest<string[]>("get_ids", { offset, limit });
  }

  // получить список товаров
  async getItems(ids: string[]): Promise<Product[]> {
    return this.makeRequest<Product[]>("get_items", { ids });
  }

  // получить список полей товаров
  async getFields(params?: FieldParams): Promise<string[]> {
    return this.makeRequest<string[]>("get_fields", params);
  }

  // получить список id товаров с фильтрами из getFields
  async filter(params: FilterParams): Promise<string[]> {
    return this.makeRequest<string[]>("filter", params);
  }
}

const apiService = new ApiService();

export default apiService;
