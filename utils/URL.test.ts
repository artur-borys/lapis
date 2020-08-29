import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { removeSlashDoubles, removeTrailingSlash, sanitize } from "./URL.ts";

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
