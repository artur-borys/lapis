import {
  Response,
  ServerRequest,
} from "https://deno.land/std@0.67.0/http/server.ts";

export class LapisResponse {
  private request: ServerRequest;
  private response: Response;

  constructor(request: ServerRequest) {
    this.request = request;
    this.response = {
      status: 200,
      headers: new Headers(),
    };
  }

  send(data?: string | object) {
    if (data) {
      if (typeof data === "object") {
        data = JSON.stringify(data);
        this.response.headers?.set("Content-Type", "application/json");
      } else {
        this.response.headers?.set("Content-Type", "text/plain");
      }
      this.response.body = data;
    }
    this.request.respond(this.response);
  }

  status(status: number) {
    this.response.status = status;
    return this;
  }

  get headers() {
    return this.response.headers;
  }
}
