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

type MiddlewareFunction = (
  req: LapisRequest,
  res: LapisResponse,
  next?: Function,
) => any;

export class Lapis {
  port?: number;
  hostname?: string;
  certFile?: string;
  keyFile?: string;
  server?: Server;
  middlewares: Function[] = [];

  end(req: LapisRequest, res: LapisResponse) {
    res.status(404).send(`Cannot ${req.method} ${req.url}`);
  }

  async _loop() {
    if (this.server) {
      for await (const req of this.server!) {
        let res = new LapisResponse(req);
        const request = new LapisRequest(req);
        await request.parseBody();
        res.headers?.set("Content-Type", "application/json");
        const middlewares = [...this.middlewares, this.end].map(
          (
            middleware,
            i,
          ) => () => middleware(request, res, middlewares[i + 1]),
        );
        middlewares[0]();
      }
    }
  }

  use(middleware: MiddlewareFunction) {
    this.middlewares.push(middleware);
  }

  get(path: string, middleware: MiddlewareFunction) {
    this.middlewares.push(
      (req: LapisRequest, res: LapisResponse, next: Function) => {
        if (req.method === "GET" && req.url === path) {
          return middleware(req, res, next);
        } else {
          return next();
        }
      },
    );
  }

  post(path: string, middleware: MiddlewareFunction) {
    this.middlewares.push(
      (req: LapisRequest, res: LapisResponse, next: Function) => {
        if (req.method === "POST" && req.url === path) {
          return middleware(req, res, next);
        } else {
          return next();
        }
      },
    );
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
