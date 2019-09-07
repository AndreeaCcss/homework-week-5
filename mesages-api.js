const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const parserMiddleware = bodyParser.json();
app.use(parserMiddleware);

const port = 3000;

let i = 0;

app.use((req, res, next) => {
  if (i < 5) {
    next();
  } else {
    res.status(429).end();
  }
});
app.post("/messages", (req, res, next) => {
  for (i; i < 5; i++) {
    if (!req.body.text || req.body.text.length === 0) {
      res.status(400).end();
    } else {
      console.log(req.body.text);
      res.json({ message: "Message received loud and clear" });
    }
  }
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
