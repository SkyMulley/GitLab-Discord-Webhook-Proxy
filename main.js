const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const morgan = require("morgan");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Static pages, like configuration ui
app.use(express.static(path.resolve(__dirname, 'public')));

// GitLab Converter
require("./converters/gitlab")(app);
require("./converters/gmod")(app);

app.use(function (err, req, res, next) {
  console.log(err.stack);
});

var port = 8100;
app.listen(port, function() {
  console.log("Server started at port " + port);
});
