import {
  ServerRequest,
  Server,
} from "https://deno.land/std@0.67.0/http/server.ts";

export class LapisRequest {
  private request: ServerRequest;
  private _body?: string | object;

  constructor(request: ServerRequest) {
    this.request = request;
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
