import { Lapis } from "./lapis.ts";

const lapis = new Lapis();

lapis.get("/", (req, res, next) => {
  res.status(201).send({
    root: true,
  });
});

lapis.post("/", (req, res, next) => {
  res.status(201).send(req.body);
});

lapis.get("/asd", (req, res) => {
  res.send({
    root: false,
    children: true,
  });
});

lapis.get("/bca", (req, res) => {
  res.send("asd");
});

lapis.listen({ port: 3000 }).then(() => {
  console.log(`Listening on 3000`);
});
