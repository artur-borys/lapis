import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import {
  removeSlashDoubles,
  removeTrailingSlash,
  sanitize,
  matchPath,
  matchWithParams,
  hasParams,
  extractParams,
} from "./URL.ts";
import { assert } from "https://deno.land/std@0.67.0/_util/assert.ts";
import { QueryOrParams } from "../request.ts";

Deno.test("removeSlashDoubles", () => {
  const withDoubles = "//api/test////asd//makapaka/";
  const expected = "/api/test/asd/makapaka/";
  const result = removeSlashDoubles(withDoubles);
  assertEquals(result, expected);
});

Deno.test("removeTrailingSlash", () => {
  const single = "/";
  let expected = "/";
  let result = removeTrailingSlash(single);
  assertEquals(result, expected);

  const twoSlashes = "//";
  expected = "/";
  result = removeTrailingSlash("//");
  assertEquals(result, expected);

  const slashAtEnd = "/api/test/asd/makapaka/";
  expected = "/api/test/asd/makapaka";
  result = removeTrailingSlash(slashAtEnd);
  assertEquals(result, expected);
});

Deno.test("sanitize", () => {
  const slashAtEnd = "//api/test////asd//makapaka/";
  let expected = "/api/test/asd/makapaka";
  let result = sanitize(slashAtEnd);
  assertEquals(result, expected);
});

Deno.test("matchWithParams", () => {
  let model = "/api/user/:id";
  let request = "/api/user/1?sort=desc";
  assert(matchWithParams(request, model));

  model = "/api/user/:id/post/:post_id";
  request = "/api/user/1/post/2";
  assert(matchWithParams(request, model));

  model = "/api/user/:id";
  request = "/api/user";
  assert(!matchWithParams(request, model));
});

Deno.test("hasParams", () => {
  let model = "/api/user";
  assert(!hasParams(model));

  model = "/api/user/:id";
  assert(hasParams(model));
});

Deno.test("extractParams", () => {
  let request = "/api/user/1/post/2";
  let model = "/api/user/:id/post/:post_id";
  let expected: QueryOrParams = {
    id: "1",
    post_id: "2",
  };
  assertEquals(extractParams(request, model), expected);
});

Deno.test("matchPath", () => {
  let url = "/api/user?nick=user123";
  let model = "/api/user";
  assert(matchPath(url, model));

  url = "/api/user/1";
  model = "/api/user/:id";
  assert(matchPath(url, model));

  url = "/api/user/1/posts?sort=title";
  model = "/api/user/:id/posts";
  assert(matchPath(url, model));

  url = "/api/user/1/posts";
  model = "/api/*";
  assert(matchPath(url, model));
});
