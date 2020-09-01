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

/**
 * Router stores route handlers and middlewares.
 * It can have a base URL specified, which will be prepended to every route.
 * Every middleware will only work on requests that point to URL that starts with that base.
 */
export class Router {
  private _middlewares: Middleware[] = [];
  private _base: string;

  /**
   * 
   * @param base - base URL to be prepended to every route
   */
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

  /**
   * @returns {(MiddlewareFunction | ErrorMiddlewareFunction)[]} - all middlewares, internal usage only
   */
  get middlewares() {
    return this._middlewares;
  }

  /**
   * Pushes given middleware or merges another router's middlewares with this router's middlewares
   * @param middlewareHandler - middleware to use or another router to merge with
   */
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
      this._middlewares.push(
        new Middleware(middlewareHandler, {
          path: () => `${this._base}/*`,
          method: HTTPMethods.ANY,
        }),
      );
    }
  }

  /**
   * Uses specified middleware(s) on given path, matching all HTTP methods
   * @param path - the path to handle
   * @param middlewares - one or more middlewares (NOT an array)
   */
  all(path: string, ...middlewares: MiddlewareFunction[]) {
    middlewares.forEach((middleware) => {
      this.route(path, HTTPMethods.ANY, middleware);
    });
  }

  /**
   * Uses specified middleware(s) on given path, if request method is GET.
   * All other methods match HTTP methods according to their name (post matches POST, delete matches DELETE etc.)
   * @param path - the path to hand;e
   * @param middlewares - one or more middlewares (NOT an array)
   */
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
