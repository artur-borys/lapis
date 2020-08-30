import { Lapis } from "./lapis.ts";
import { Router } from "./router.ts";

const PORT = 3000;
const lapis = new Lapis();
const router = new Router("/api");

router.get("/user/:id/post/:post_id", (req, res, next) => {
  console.log(req.params);
  res.send({
    query: req.query,
    pararms: req.params,
  });
});

lapis.use(router);

lapis.use((error, req, res, next) => {
  if (error) {
    return res.send({
      ok: false,
      error: error.toString(),
    });
  } else {
    next!();
  }
});

lapis.listen({ port: PORT }).then(() => {
  console.log(`Listening on ${PORT}`);
});
