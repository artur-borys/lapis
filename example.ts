import { Lapis } from "./lapis.ts";
import { Router } from "./router.ts";
import { LapisRequest } from "./request.ts";
import { LapisResponse } from "./response.ts";

const PORT = 3000;
const lapis = new Lapis();
const router = new Router("/api");

const users = [
  {
    id: 1,
    nick: "user1",
  },
  {
    id: 2,
    nick: "user2",
  },
];

const posts = [
  {
    id: 1,
    userId: 1,
    content: "This is a post",
  },
  {
    id: 2,
    userId: 1,
    content: "This is another post",
  },
  {
    id: 3,
    userId: 2,
    content: "This is some other user's post",
  },
];

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
    id: posts.length,
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

function logger(req: LapisRequest, res: LapisResponse, next: Function) {
  console.log(`Got a request: ${req.method} ${req.url}`);
  next();
}

lapis.use(logger);

lapis.use(router);

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

lapis.listen({ port: PORT }).then(() => {
  console.log(`Listening on ${PORT}`);
});
