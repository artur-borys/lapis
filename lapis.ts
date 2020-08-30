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
  MiddlewareFunction,
  ErrorMiddlewareFunction,
} from "./router.ts";

export class Lapis {
  port?: number;
  hostname?: string;
  certFile?: string;
  keyFile?: string;
  server?: Server;
  middlewares: (MiddlewareFunction | ErrorMiddlewareFunction)[] = [];

  end(req: LapisRequest, res: LapisResponse) {
    res.status(404).send(`Cannot ${req.method} ${req.url}`);
  }

  async _loop() {
    if (this.server) {
      for await (const request of this.server!) {
        let res = new LapisResponse(request);
        const req = new LapisRequest(request);
        await req.parseBody();
        res.headers?.set("Content-Type", "application/json");
        const middlewares = [...this.middlewares, this.end].map(
          (
            middleware,
            i,
          ) =>
            (error?: Error) => {
              if (middleware.length === 4) {
                return (middleware as ErrorMiddlewareFunction)(
                  error,
                  req,
                  res,
                  middlewares[i + 1],
                );
              } else {
                return (middleware as MiddlewareFunction)(
                  req,
                  res,
                  middlewares[i + 1],
                );
              }
            },
        );
        middlewares[0]();
      }
    }
  }

  use(middleware: MiddlewareFunction | ErrorMiddlewareFunction | Router) {
    if (middleware instanceof Router) {
      this.middlewares = this.middlewares.concat(middleware.routes);
    } else {
      this.middlewares.push(middleware);
    }
  }

  listen(options: HTTPOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = serve(options);
        this._loop();
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  listenTLS(options: HTTPSOptions): Promise<void> {
    const server = serveTLS(options);
    return Promise.resolve();
  }
}
