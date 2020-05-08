const utils = require("../utils");
const request = require("request");

module.exports = function(app) {
  app.post("/hooks/:id/:token/gmod", function(req, res) {
    if(!req.body) return res.sendStatus(500);
    var data = req.body;

      var discord = {
        "embeds": [{
          "type": "rich",
          "description": data.msg,
          "author": {
            "name": data.play,
          },
          "color": 226760,
          "timestamp" : new Date(new Date().getTime()).toISOString(),
          "footer": {
            "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Gmodlogo.svg/1200px-Gmodlogo.svg.png",
            "text": data.titl,
          },
        }]
      }
      request.post("https://discordapp.com/api/webhooks/" + req.params.id + "/" + req.params.token)
      .json(discord)
      .on("response", function(response) {
      });
      res.send("");
    });
}