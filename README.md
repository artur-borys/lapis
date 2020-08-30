# Lapis

This Deno module is created mainly for myself - to learn JS/TS.
I will try to make it resemble `express` in a way. It's a wrapper around deno's std/http module.

You can use this module if you wish, but it's not production ready and probably never will be - it's just for my own skills development.

## Example

```typescript
import { Lapis, Router, LapisRequest, LapisResponse } from "./mod.ts";

const PORT = 3000;

// Create a Lapis instance
const lapis = new Lapis();

// Create a router instance. Neccessary if you want to specify routes
// You can pass a baseURL parameter that will be prepended to all routes.
// Default is "/".
const router = new Router("/api");

// Define a middleware
function logger(req: LapisRequest, res: LapisResponse, next: Function) {
  console.log(`Got a request: ${req.method} ${req.url}`);
  next();
}

// use middleware on lapis instance (logging before route handling!)
lapis.use(logger);

// Define some routes
router.get("/user/:id", (req, res, next) => {
  const user = users.find((user) => {
    return user.id === Number(req.params.id);
  });
  res.send(user);
});

router.get("/user/:id/posts", (req, res, next) => {
  const _posts = posts.filter((post) => {
    return post.userId === Number(req.params.id);
  });
  res.send(_posts);
});

router.post("/user/:id/post", (req, res, next) => {
  const newPost = {
    id: posts.length + 1,
    userId: Number(req.params.id),
    content: req.body.content,
  };
  posts.push(newPost);
  res.status(201).send(newPost);
});

router.get("/posts", (req, res, next) => {
  res.send(posts);
});

router.get("/error", (req, res, next) => {
  next(new Error("SomeError"));
});

// use created router
lapis.use(router);

// use error middleware (at the end! IMPORTANT)
// error middleware has EXACTLY 4 parameters - very important
lapis.use((error, req, res, next) => {
  if (error) {
    return res.send({
      ok: false,
      error: error.message,
    });
  } else {
    next!();
  }
});

// Finally, listen
lapis.listen({ port: PORT }).then(() => {
  console.log(`Listening on ${PORT}`);
});
```
