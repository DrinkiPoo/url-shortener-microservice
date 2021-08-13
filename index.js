require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const validUrl = require("valid-url");

// Express App
const app = express();

// Mongoose Connection
mongoose.connect(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on("error", console.error.bind(console, "connection error:"));
mongoose.connection.once("open", () => console.log(`Database connection made!!`));

// Mongoose Profile
const Url = mongoose.model("Url", new mongoose.Schema({ url: String, _id: Number }));

app.use(express.static(path.resolve(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/api/shorturl", (req, res) => {
  const url = req.body.url;
  if (validUrl.isWebUri(url)) {
    Url.find()
      .sort({ _id: -1 })
      .limit(1)
      .then((doc) => {
        let num = doc[0]._id + 1;
        Url.create({ url: url, _id: num });
        res.json({
          original_url: url,
          short_url: num,
        });
      })
      .catch((err) => console.log(err.message));
  } else {
    res.json({
      error: "Invalid URL",
    });
  }
});

app.get("/api/shorturl/:id", (req, res) => {
  Url.find({ _id: req.params.id })
    .then((arr) => {
      res.redirect(arr[0].url);
    })
    .catch((err) => console.log(err.message));
});

const port = process.env.PORT || 5845;
app.listen(port, () => console.log(`App is listening on port ${port}`));
