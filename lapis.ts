import {
  serve,
  HTTPOptions,
  Server,
} from "https://deno.land/std@0.67.0/http/server.ts";
import { LapisResponse } from "./response.ts";
import { LapisRequest } from "./request.ts";
import {
  Router,
} from "./router.ts";
import {
  Middleware,
  ErrorMiddlewareFunction,
  MiddlewareFunction,
} from "./middleware.ts";

export class Lapis extends Router {
  port?: number;
  hostname?: string;
  certFile?: string;
  keyFile?: string;
  server?: Server;

  private async run() {
    if (this.server) {
      for await (const request of this.server!) {
        let res = new LapisResponse(request);
        const req = new LapisRequest(request);
        await req.parseBody();
        // get middlewares that match the request
        let matchingMiddlewares = Middleware.findMatching(
          this.middlewares,
          req,
        );
        // create functions which take optional error parameter and call middleware
        const middlewaresToRun = matchingMiddlewares.map((
          middleware,
          i,
        ) =>
          (error?: Error): any => {
            middleware.setParams(req);
            // if there are no more defined middlewares, fallback to the default one
            let next = middlewaresToRun[i + 1]
              ? middlewaresToRun[i + 1]
              : ((error?: any) =>
                error
                  ? this.defaultErrorHandler(error, req, res)
                  : this.defaultHandler(req, res));
            // there can either be an error or not
            if (error) {
              // if this middleware is an error handler - ok
              if (middleware.handler.length === 4) {
                return (middleware.handler as ErrorMiddlewareFunction)(
                  error,
                  req,
                  res,
                  next,
                );
              } else {
                // if not, call the next middleware wrapper (hopefully it will recursively reach an error handler)
                return next(error);
              }
            } else {
              if (middleware.handler.length === 4) {
                return next();
              } else {
                return (middleware.handler as MiddlewareFunction)(
                  req,
                  res,
                  next,
                );
              }
            }
          }
        );
        try {
          if (middlewaresToRun.length === 0) {
            this.defaultHandler(req, res);
          } else {
            middlewaresToRun[0]();
          }
        } catch (err) {
          this.defaultErrorHandler(err, req, res);
        }
      }
    }
  }

  private defaultHandler(req: LapisRequest, res: LapisResponse) {
    res.status(404).send({
      code: 404,
      message: `Cannot ${req.method} ${req.url}`,
    });
  }

  private defaultErrorHandler(
    err: any,
    req: LapisRequest,
    res: LapisResponse,
  ) {
    console.error(err);
    res.status(500).send({
      ok: false,
    });
  }

  /**
   * Starts an http server with given options
   * @param {HTTPOptions} options - options for server instance 
   */
  listen(options: HTTPOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = serve(options);
        this.run();
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Currently not implemented - will be in the future
   */
  listenTLS() {
    throw new Error("NotImplemented");
  }
}
