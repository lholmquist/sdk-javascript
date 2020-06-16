/* eslint-disable no-console */

const express = require("express");
const { Receiver } = require("cloudevents-sdk");

const app = express();
const receiver = new Receiver();

app.use((req, res, next) => {
  let data = "";

  req.setEncoding("utf8");
  req.on("data", function(chunk) {
    data += chunk;
  });

  req.on("end", function() {
    req.body = data;
    next();
  });
});

app.post("/", function(req, res) {
  console.log("HEADERS", req.headers);
  console.log("BODY", req.body);

  try {
    const event = receiver.accept(req.headers, req.body);
    // event.validate();
    const asJSON = JSON.stringify(event);
    console.log(`Accepted event: ${asJSON}`);
    res.status(201).json(asJSON);
  } catch (err) {
    console.error(err);
    res.status(415)
      .header("Content-Type", "application/json")
      .send(JSON.stringify(err));
  }
});

app.listen(3000, function() {
  console.log("Example app listening on port 3000!");
});
