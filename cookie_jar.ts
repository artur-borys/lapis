import {
  Cookie,
  getCookies,
  setCookie,
  deleteCookie,
} from "https://deno.land/std@0.67.0/http/mod.ts";

interface HasHeaders {
  headers: Headers;
}

export class CookieJar {
  private cookies: Record<string, string | undefined>;
  private request: HasHeaders;
  private response: HasHeaders;

  constructor(request: HasHeaders, response: HasHeaders) {
    this.request = request;
    this.response = response;
    this.cookies = getCookies(request);
  }

  toString() {
    return JSON.stringify(this.cookies);
  }

  toJSON() {
    return JSON.stringify(this.cookies);
  }

  get(name: string): string | undefined {
    return this.cookies[name];
  }

  has(name: string): boolean {
    return this.cookies[name] !== undefined;
  }

  set(cookie: Cookie) {
    setCookie(this.response, cookie);
    this.cookies[cookie.name] = cookie.value;
  }

  delete(name: string) {
    if (this.has(name)) {
      this.cookies[name] = undefined;
    }
    deleteCookie(this.response, name);
  }
}
