import { LapisRequest } from "./request.ts";
import { LapisResponse } from "./response.ts";
import { matchPath, extractParams } from "./utils/URL.ts";
import {
  Middleware,
  MiddlewareFunction,
  ErrorMiddlewareFunction,
  Endpoint,
} from "./middleware.ts";

export enum HTTPMethods {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  OPTIONS = "OPTIONS",
  HEAD = "HEAD",
  ANY = "*",
}

export class Router {
  private _middlewares: Middleware[] = [];
  private _base: string;

  constructor(base: string = "") {
    this._base = base;
  }

  private route(
    path: string,
    method: HTTPMethods,
    middlewareHandler: MiddlewareFunction | ErrorMiddlewareFunction,
  ) {
    const endpoint: Endpoint = {
      path: () => `${this._base}${path}`,
      method: method,
    };
    this._middlewares.push(new Middleware(middlewareHandler, endpoint));
  }

  get middlewares() {
    return this._middlewares;
  }

  use(
    middlewareHandler: MiddlewareFunction | ErrorMiddlewareFunction | Router,
  ) {
    if (middlewareHandler instanceof Router) {
      // prepend this router's base to the router's being used base
      middlewareHandler._base = this._base + middlewareHandler._base;
      this._middlewares = this._middlewares.concat(
        middlewareHandler.middlewares,
      );
    } else {
      this._middlewares.push(new Middleware(middlewareHandler));
    }
  }

  all(path: string, middleware: MiddlewareFunction) {
    this.route(path, HTTPMethods.ANY, middleware);
  }

  get(path: string, ...middlewares: MiddlewareFunction[]) {
    middlewares.forEach((middleware) => {
      this.route(path, HTTPMethods.GET, middleware);
    });
  }

  head(path: string, ...middlewares: MiddlewareFunction[]) {
    middlewares.forEach((middleware) => {
      this.route(path, HTTPMethods.HEAD, middleware);
    });
  }

  post(path: string, ...middlewares: MiddlewareFunction[]) {
    middlewares.forEach((middleware) => {
      this.route(path, HTTPMethods.POST, middleware);
    });
  }

  put(path: string, ...middlewares: MiddlewareFunction[]) {
    middlewares.forEach((middleware) => {
      this.route(path, HTTPMethods.PUT, middleware);
    });
  }

  patch(path: string, ...middlewares: MiddlewareFunction[]) {
    middlewares.forEach((middleware) => {
      this.route(path, HTTPMethods.PATCH, middleware);
    });
  }

  delete(path: string, ...middlewares: MiddlewareFunction[]) {
    middlewares.forEach((middleware) => {
      this.route(path, HTTPMethods.DELETE, middleware);
    });
  }
}
