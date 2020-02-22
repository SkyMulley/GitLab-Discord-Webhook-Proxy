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
      }
      );
      res.send("");
    }if(req.body.object_kind==="pipeline") {
      var desc = "";
      var rgb = 0;
      if(req.body.object_attributes.status==="success") {
        desc = "Pipeline event was **successful**\nTook `"+req.body.object_attributes.duration+"` seconds."
        rgb = 40000
      }
      if(req.body.object_attributes.status==="failed"){
        desc = "Pipeline event has **failed**. Check the logs!"
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
    }if(req.body.object_kind==="merge_request") {
      var desc = "";
      var rgb = 0;
      if(req.body.object_attributes.state==="opened") {
        desc = req.body.user.name + " is looking to merge branch `"+req.body.object_attributes.source_branch+"` into `"+req.body.object_attributes.target_branch+"`\n**Merge Request Description**\n"+req.body.object_attributes.description
        rgb = 8069775
      }
      if(req.body.object_attributes.state==="merged") {
        desc = req.body.user.name + " has merged branch `"+req.body.object_attributes.source_branch+"` into `"+req.body.object_attributes.target_branch+"`"
        rgb = 8311585
      }
      if(req.body.object_attributes.state==="closed") {
        desc = req.body.user.name + " has closed the merge request for branch `"+req.body.object_attributes.source_branch+"` into `"+req.body.object_attributes.target_branch+"`"
        rgb = 16711682
      }
      var discord = {
        "embeds": [{
          "type": "rich",
          "url": req.body.project.web_url,
          "description": desc,
          "author": {
            "name": req.body.object_attributes.title,
            "url" : req.body.project.web_url,
          },
          "color": rgb,
          "timestamp" : new Date(new Date().getTime()).toISOString(),
          "footer": {
            "icon_url": "https://images-ext-1.discordapp.net/external/rOLw2OEhv18sWefG0BXKB24jkol03LmNTODnUsRxRxs/https/www.gillware.com/wp-content/uploads/2017/02/gitlab-logo-square-300x300.png",
            "text": req.body.project.name + " | Merge Request",
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
