import {
  Response,
  ServerRequest,
} from "https://deno.land/std@0.67.0/http/server.ts";
import { CookieJar } from "./cookie_jar.ts";

export class LapisResponse {
  private request: ServerRequest;
  private response: Response;
  private sent: boolean = false;
  cookies?: CookieJar;

  constructor(request: ServerRequest) {
    this.request = request;
    this.response = {
      status: 200,
      headers: new Headers(),
    };
  }

  send(data?: string | object) {
    if (!this.sent) {
      this.sent = true;
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
    } else {
      console.warn("Response has been already sent, cancelling");
    }
  }

  status(status: number) {
    this.response.status = status;
    return this;
  }

  get headers(): Headers {
    return this.response.headers!;
  }
}
