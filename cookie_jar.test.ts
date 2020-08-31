import { CookieJar } from "./cookie_jar.ts";
import {
  assertEquals,
  assertMatch,
} from "https://deno.land/std/testing/asserts.ts";
import { assert } from "https://deno.land/std@0.67.0/_util/assert.ts";

Deno.test("Parses cookies", () => {
  const requestHeaders = new Headers();
  requestHeaders.set(
    "Cookie",
    "cookie1=value1; cookie2=value2; cookie3=value3",
  );
  const request = {
    headers: requestHeaders,
  };

  const jar = new CookieJar(request, { headers: new Headers() });
  assertEquals(jar.get("cookie1"), "value1");
  assertEquals(jar.get("cookie2"), "value2");
  assertEquals(jar.get("cookie3"), "value3");
});

Deno.test("signals presence of cookie", () => {
  const headers = new Headers();
  headers.set("Cookie", "cookie1=value1");
  const request = { headers };
  const jar = new CookieJar(request, { headers: new Headers() });
  assert(jar.has("cookie1"));
  assert(!jar.has("cookie2"));
});

Deno.test("sets cookies", () => {
  let request = { headers: new Headers() };
  let response = { headers: new Headers() };

  let jar = new CookieJar(request, response);
  jar.set({ name: "cookie1", value: "value1" });
  assert(jar.has("cookie1"));
  assertEquals(jar.get("cookie1"), "value1");
  assertEquals(response.headers.get("Set-Cookie"), "cookie1=value1");
});

Deno.test("Removes cookies", () => {
  let request = { headers: new Headers({ Cookie: "cookie1=value1" }) };
  let response = { headers: new Headers() };

  let jar = new CookieJar(request, response);

  jar.delete("cookie1");
  assert(!jar.has("cookie1"));
  assertEquals(jar.get("cookie1"), undefined);
  assertMatch(
    response.headers.get("Set-Cookie") as string,
    /cookie1=; Expires=Thu, 01 Jan 1970 00:00:00/,
  );
  jar.delete("cookie2");
  assert(!jar.has("cookie2"));
  assertEquals(jar.get("cookie2"), undefined);
  assertMatch(
    response.headers.get("Set-Cookie") as string,
    /cookie2=; Expires=Thu, 01 Jan 1970 00:00:00/,
  );
});
