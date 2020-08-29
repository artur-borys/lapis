import { Lapis } from "./lapis.ts";
import { Router } from "./router.ts";

const PORT = 3000;
const lapis = new Lapis();
const router = new Router();

router.get("/", (req, res, next) => {
  res.send({
    ok: true,
  });
});

lapis.useRouter(router);

lapis.listen({ port: PORT }).then(() => {
  console.log(`Listening on ${PORT}`);
});
