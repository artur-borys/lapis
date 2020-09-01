import { Lapis, Router, MiddlewareFunction } from "../mod.ts";
const PORT = 3000;
const lapis = new Lapis();
const apiRouter = new Router("/api");
const usersRouter = new Router("/users");
const postsRouter = new Router("/posts");

const users = [
  {
    id: 1,
    nick: "user1",
    pro: true,
  },
  {
    id: 2,
    nick: "user2",
    pro: true,
  },
  {
    id: 3,
    nick: "user3",
    pro: false,
  },
];

const posts = [
  {
    id: 1,
    title: "Post 1",
    content: "This is post #1",
    authorId: 1,
  },
  {
    id: 2,
    title: "Post 2",
    content: "This is post #2",
    authorId: 3,
  },
  {
    id: 3,
    title: "Post 3",
    content: "THis is post #3",
    authorId: 1,
  },
];

// currently it's best to define standard middleware as a separate named function
// to get type hints - use() recognizes only Router and ErrorMiddlewareFunction for some reason
// I need to sort it out - I'm new to TypeScript
const requestLogger: MiddlewareFunction = (req, res, next) => {
  console.log(
    `Got a request from ${req.remoteAddr.hostname}: ${req.method} ${req.url}`,
  );
  next();
};

lapis.use(requestLogger);
lapis.use(Lapis.cookies);

lapis.get("/", (req, res) => {
  console.log(req.cookies?.toString());
  if (req.cookies?.has("someCookie")) {
    res.cookies?.delete("someCookie");
  } else {
    res.cookies?.set({ name: "someCookie", value: "someValue" });
  }

  res.send("Welcome to my API server");
});

apiRouter.get("/error", (req, res, next) => {
  // this will be handled by error handler set on lapis instance
  next(new Error("Oh no! Expected error has occured!"));
});

apiRouter.get("/unhandled", (req, res, next) => {
  // will be handled by Lapis default error handler
  // it will print error to console and send to user 500 { ok: false }
  throw new Error("Oh no! Unexpected error!");
});

usersRouter.get("/", (req, res) => {
  if (req.query.pro !== undefined) {
    // let's assume that pro can be 0 or 1
    const pro = Boolean(Number(req.query.pro));
    const foundUsers = users.filter((user) => user.pro === pro);
    res.send(foundUsers);
  } else {
    res.send(users);
  }
});

usersRouter.get("/:id", (req, res, next) => {
  const user = users.find((candidate) =>
    candidate.id === Number(req.params.id)
  );
  if (!user) {
    // IMPORTANT - next() has to be called on logical leaf of a function
    return next(new Error("NOT_FOUND"));
  }
  // we could remove return above and insert else {} here
  res.send(user);
});

usersRouter.get("/:id/posts", (req, res, next) => {
  const userPosts = posts.filter((post) =>
    post.authorId === Number(req.params.id)
  );
  res.send(userPosts);
});

// it doesn't make sense, but it's just an example
// also, this route will confuse the previous route /:id/posts
// but it's only for example purpose
usersRouter.get("/:id/posts/:post_id", (req, res, next) => {
  console.log(req.params); // both id and post_id should show up here
  const post = posts.find((_post) => _post.id === Number(req.params.post_id));
  res.send(post);
});

postsRouter.get("/", (req, res, next) => {
  res.send(posts);
});

postsRouter.get("/:id", (req, res, next) => {
  const post = posts.find((_post) => _post.id === Number(req.params.id));
  if (!post) {
    /*
      this error doesn't have any handler in postsRouter.
      usersRouter "doesn't have jurisdiction" in here, so it can't handle it
      lapis instance will handle it (see error middleware at the bottom)
    */
    next(new Error("POST_NOT_FOUND"));
  } else {
    res.send(post);
  }
});

// You can specify more than one middleware!
postsRouter.post("/", (req, res, next) => {
  const valid = req.body.title && req.body.content && req.body.authorId;
  if (valid) {
    next();
  } else {
    res.status(400).send({
      error: "INVALID_BODY",
    });
  }
}, (req, res, next) => {
  // Request content-type should be application/json
  const newPost = {
    id: posts.length + 1,
    authorId: req.body.authorId,
    title: req.body.title,
    content: req.body.content,
  };
  posts.push(newPost);
  res.status(201).send(newPost);
});

// this error handler will match only errors that occured in /api/users/*
usersRouter.use((err, req, res, next) => {
  if (err instanceof Error) {
    if (err.message === "NOT_FOUND") {
      return res.status(404).send({
        error: err.message,
      });
    } else {
      res.status(400).send({
        error: "BAD_REQUEST",
      });
    }
  } else {
    res.status(500).send({
      error: "INTERNAL_SERVER_ERROR",
    });
  }
});

apiRouter.use(usersRouter);
apiRouter.use(postsRouter);

lapis.use(apiRouter);

/*
  error handler MUST ALWAYS have 4 parameters -
  it's neccessary for Lapis to recognize if that middleware is able to handle an error
*/
lapis.use((err, req, res, next) => {
  res.status(500).send({
    ok: false,
    fromServerRoot: true,
    error: err instanceof Error ? err.message : err,
  });
});

lapis.listen({ port: PORT }).then(() => {
  console.log(`Listening on ${PORT}`);
});
