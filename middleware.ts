import { matchPath, extractParams } from "./utils/URL.ts";
import type { LapisRequest } from "./request.ts";
import type { LapisResponse } from "./response.ts";
import { HTTPMethods } from "./router.ts";

export type MiddlewareFunction = (
  req: LapisRequest,
  res: LapisResponse,
  next: Function,
) => any;
export type ErrorMiddlewareFunction = (
  error: any,
  req: LapisRequest,
  res: LapisResponse,
  next: Function,
) => any;

export interface Endpoint {
  path: Function | string;
  method: HTTPMethods;
}

export class Middleware {
  private endpoint?: Endpoint;
  handler: MiddlewareFunction | ErrorMiddlewareFunction;

  /**
   * 
   * @param handler - the function that handles request (or error)
   * @param endpoint - optional endpoint to match (path and method)
   */
  constructor(
    handler: MiddlewareFunction | ErrorMiddlewareFunction,
    endpoint?: Endpoint,
  ) {
    this.handler = handler;
    this.endpoint = endpoint;
  }

  /**
   * Sets request parameters, based on request URL and this endpoint's path
   * @param {LapisRequest} req - the request
   */
  setParams(req: LapisRequest): void {
    let params = {};
    if (this.endpoint) {
      const path = this.endpoint.path instanceof Function
        ? this.endpoint.path()
        : this.endpoint.path;
      params = extractParams(req.url, path);
    }

    req.params = params;
  }

  private matches(request: LapisRequest): boolean {
    if (this.endpoint) {
      if (
        this.endpoint.method === HTTPMethods.ANY ||
        this.endpoint.method === request.method
      ) {
        // if path is a function, it returns the actual path - kinda like computed properties
        // it's for router using another router, ex. router('/api') uses another router2
        // so every route in router2 has to be prepended with '/api'
        const path = this.endpoint.path instanceof Function
          ? this.endpoint.path()
          : this.endpoint.path;
        return matchPath(request.url, path);
      }
      return false;
    }
    // if no path specified - it is a global middleware and matches all routes
    return true;
  }

  /**
   * Returns middlewares from given collection, that match given request (based on path and method)
   * @param middlewares - middlewares to look through
   * @param request - request as filter param
   */
  static findMatching(
    middlewares: Middleware[],
    request: LapisRequest,
  ): Middleware[] {
    return middlewares.filter((middleware) => middleware.matches(request));
  }
}
