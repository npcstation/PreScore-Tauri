import { invoke } from "@tauri-apps/api";

export class HTTP {
  static async getBinary(
    url: string,
    {
      headersMap,
      query,
    }: {
      headersMap?: Record<string, string | number | boolean>;
      query?: Record<string, any>;
    } = {}
  ): Promise<Uint8Array> {
    for (const key in headersMap) {
      headersMap[key] = String(headersMap[key]);
    }

    for (const key in query) {
      query[key] = String(query[key]);
    }
    const response: Array<number> = await invoke("http_get_binary", {
      url: url,
      headersMap: headersMap,
      query: query,
    });
    const response_u8 = new Uint8Array(response);
    return response_u8;
  }

  static async getBlob(
    url: string,
    mime: string,
    {
      headersMap,
      query,
    }: {
      headersMap?: Record<string, string | number | boolean>;
      query?: Record<string, any>;
    } = {}
  ): Promise<string> {
    const response_u8 = await this.getBinary(url, { headersMap, query });
    let blob = new Blob([response_u8], { type: mime });
    let fileURL = URL.createObjectURL(blob);
    return fileURL;
  }

  static async getText(
    url: string,
    {
      headersMap,
      query,
    }: {
      headersMap?: Record<string, string | number | boolean>;
      query?: Record<string, any>;
    } = {}
  ): Promise<string> {
    for (const key in headersMap) {
      headersMap[key] = String(headersMap[key]);
    }

    for (const key in query) {
      query[key] = String(query[key]);
    }
    const response = await invoke("http_get", {
      url: url,
      headersMap: headersMap,
      query: query,
    });
    var responseText = String(response).trim();
    return responseText;
  }

  static async getJson(
    url: string,
    {
      headersMap,
      query,
    }: {
      headersMap?: Record<string, string | number | boolean>;
      query?: Record<string, any>;
    } = {}
  ): Promise<Record<string, any>> {
    var responseText = await this.getText(url, { headersMap, query });
    var responseJson = JSON.parse(responseText);
    return responseJson;
  }

  static async postText(
    url: string,
    {
      headersMap,
      form,
      json,
    }: {
      headersMap?: Record<string, string | number | boolean>;
      form?: Record<string, any>;
      json?: Record<string, any>;
    } = {}
  ): Promise<string> {
    for (const key in headersMap) {
      headersMap[key] = String(headersMap[key]);
    }

    const response = await invoke("http_post", {
      url: url,
      headersMap: headersMap,
      form: form,
      json: json,
    });
    var responseText = String(response).trim();
    return responseText;
  }

  static async postJson(
    url: string,
    {
      headersMap,
      form,
      json,
    }: {
      headersMap?: Record<string, string | number | boolean>;
      form?: Record<string, any>;
      json?: Record<string, any>;
    } = {}
  ): Promise<Record<string, any>> {
    const response = await this.postText(url, {
      headersMap: headersMap,
      form: form,
      json: json,
    });
    var responseJson = JSON.parse(response);
    return responseJson;
  }

  static async getCookie(
    domain: string,
    path: string,
    name: string
  ): Promise<string> {
    return await invoke("get_cookie", {
      domain: domain,
      path: path,
      name: name,
    });
  }
}
