import {
  serve,
  HTTPOptions,
  HTTPSOptions,
  serveTLS,
  Server,
  ServerRequest,
  Response,
} from "https://deno.land/std/http/server.ts";
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
            // if there are no more defined middlewares, fallback to the default one
            let next = middlewaresToRun[i + 1]
              ? middlewaresToRun[i + 1]
              : () => this.defaultHandler(req, res);
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
          middlewaresToRun[0]();
        } catch (err) {
          res.status(500).send({
            ok: false,
            error: err.message,
          });
        }
      }
    }
  }

  defaultHandler(req: LapisRequest, res: LapisResponse) {
    res.status(404).send({
      code: 404,
      message: `Cannot ${req.method} ${req.url}`,
    });
  }

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
}
