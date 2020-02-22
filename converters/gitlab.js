const utils = require("../utils");
const request = require("request");

module.exports = function(app) {
  app.post("/hooks/:id/:token/gitlab", function(req, res) {
    if(!req.body) return res.sendStatus(500);

    if(req.body.object_kind === "push") {

      var description = "";

      if(req.body.total_commits_count===1) {
        description = req.body.commits[0].message
      }else{
        req.body.commits.forEach(function(commit) {
          description += utils.short("- "+commit.message.split("\n")[0], 150) + "\n";
        });
      }

      var discord = {
        "embeds": [{
          "type": "rich",
          "url": req.body.project.web_url,
          "description": description,
          "author": {
            "name": req.body.user_name,
            "url" : req.body.project.web_url,
            "icon_url": req.body.user_avatar,
          },
          "color": 226760,
          "timestamp" : new Date(new Date().getTime()).toISOString(),
          "footer": {
            "icon_url": "https://images-ext-1.discordapp.net/external/rOLw2OEhv18sWefG0BXKB24jkol03LmNTODnUsRxRxs/https/www.gillware.com/wp-content/uploads/2017/02/gitlab-logo-square-300x300.png",
            "text": req.body.project.name+"/"+req.body.ref.slice(11,req.body.ref.length)
          },
        }]
      }
      request.post("https://discordapp.com/api/webhooks/" + req.params.id + "/" + req.params.token)
      .json(discord)
      .on("response", function(response) {
        //console.log(response);
      }
      );
      //console.log(discord);
      res.send("");
    }if(req.body.object_kind==="pipeline") {
      var desc = "";
      var rgb = 0;
      if(req.body.object_attributes.status==="success") {
        desc = "Update has been pushed to the server successfully\nPush took "+req.body.object_attributes.duration+" seconds."
        rgb = 40000
      }
      if(req.body.object_attributes.status==="failed"){
        desc = "Update has failed! Poke Sky to get him to check the pipeline logs"
        rgb = 10430000
      }
      var discord = {
        "embeds": [{
          "type": "rich",
          "url": req.body.project.web_url,
          "description": desc,
          "author": {
            "name": req.body.user.name,
            "url" : req.body.project.web_url,
            "icon_url": req.body.user.avatar_url,
          },
          "color": rgb,
          "timestamp" : new Date(new Date().getTime()).toISOString(),
          "footer": {
            "icon_url": "https://images-ext-1.discordapp.net/external/rOLw2OEhv18sWefG0BXKB24jkol03LmNTODnUsRxRxs/https/www.gillware.com/wp-content/uploads/2017/02/gitlab-logo-square-300x300.png",
            "text": req.body.project.name+"/"+req.body.object_attributes.ref,
          },
        }]
      };

      if(desc!="") {

      request.post("https://discordapp.com/api/webhooks/" + req.params.id + "/" + req.params.token)
      .json(discord)
      .on("response", function(response) {
        //console.log(response);
      }
      );

      //console.log(discord);
      res.send("");
    }
    }
  });
}
