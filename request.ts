import {
  ServerRequest,
  Server,
} from "https://deno.land/std@0.67.0/http/server.ts";

export interface QueryOrParams {
  [name: string]: string | string[];
}

export class LapisRequest {
  private request: ServerRequest;
  private _body?: string | object;
  private _query: QueryOrParams;
  private _params: QueryOrParams = {};

  constructor(request: ServerRequest) {
    this.request = request;
    this._query = {};
    this.parseQuery();
  }

  get params() {
    return this._params;
  }

  set params(value) {
    this._params = value;
  }

  private parseQuery() {
    const parts = this.request.url.split("?");
    if (parts[1]) {
      const queryString = parts[1];
      const queryParams = queryString.split("&");
      queryParams.forEach((param) => {
        const parts = param.split("=");
        const name = parts[0];
        const value = parts[1];
        if (this._query[name]) {
          if (Array.isArray(this._query[name])) {
            (this._query[name] as string[]).push(value);
          } else {
            this._query[name] = [(this.query[name] as string), value];
          }
        } else {
          this._query[name] = value;
        }
      });
    }
  }

  get query() {
    return this._query;
  }

  async parseBody() {
    if (this.headers.has("Content-Type")) {
      const contentType = this.headers.get("Content-Type");
      const bodyRaw = await Deno.readAll(this.request.body);
      const body = new TextDecoder("utf-8").decode(bodyRaw);
      console.log(body);
      if (contentType === "application/json") {
        this._body = JSON.parse(body.toString());
      } else if (contentType === "text/plain") {
        this._body = body;
      } else {
        this._body = this.request.body;
      }
    } else {
      this._body = this.request.body;
    }
  }

  get headers() {
    return this.request.headers;
  }

  get url() {
    return this.request.url;
  }

  get method() {
    return this.request.method;
  }

  get body() {
    return this._body;
  }

  get contentLength() {
    return this.request.contentLength;
  }
}
