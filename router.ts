import { LapisRequest } from "./request.ts";
import { LapisResponse } from "./response.ts";
import { matchPath } from "./utils/URL.ts";

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

function methodMatch(candidate: HTTPMethods, target: string) {
  if (candidate === HTTPMethods.ANY) {
    return true;
  } else {
    return candidate === target;
  }
}

export interface MiddlewareFunction extends Function {
  (req: LapisRequest, res: LapisResponse, next: Function): any;
}

export class Router {
  private _routes: MiddlewareFunction[] = [];
  private _base: string = "";

  private route(
    path: string,
    method: HTTPMethods,
    middleware: MiddlewareFunction,
  ) {
    const wrappedMiddleware: MiddlewareFunction = (req, res, next) => {
      if (matchPath(req.url, `${this._base}${path}`)) {
        if (methodMatch(method, req.method)) {
          return middleware(req, res, next);
        }
      }
      return next();
    };

    this._routes.push(wrappedMiddleware);
  }

  get routes() {
    return this._routes;
  }

  all(path: string, middleware: MiddlewareFunction) {
    this.route(path, HTTPMethods.ANY, middleware);
  }

  get(path: string, middleware: MiddlewareFunction) {
    this.route(path, HTTPMethods.GET, middleware);
  }

  post(path: string, middleware: MiddlewareFunction) {
    this.route(path, HTTPMethods.POST, middleware);
  }

  delete(path: string, middleware: MiddlewareFunction) {
    this.route(path, HTTPMethods.DELETE, middleware);
  }
}
