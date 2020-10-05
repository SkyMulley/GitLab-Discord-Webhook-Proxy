const utils = require("../utils");
const request = require("request");

module.exports = function(app) {
  app.post("/hooks/:id/:token/gitlab", function(req, res) {
    if(!req.body) return res.sendStatus(500);

    if(req.body.object_kind === "push" && req.body.commits[0].message.charAt(0)!=="#") {

      var description = "";
      if(req.body.total_commits_count===1) {
        commit = req.body.commits[0].message
        if(commit.charAt(0)==="~") {
          description = "This commit has been marked as private"
        }else {
          description = commit
        }
      }else{
        req.body.commits.forEach(function(commit) {
          if(!commit.message.includes("Merge") && !commit.message.includes("branch")) {
            if(commit.message.charAt(0)==="~") {
              description += "- This commit has been marked as private\n"
            }else{
              description += "- "+commit.message.split("\n")[0] + "\n";
            }
          }
        });
      }

      description = utils.short(description);

      var discord = {
        "embeds": [{
          "type": "rich",
          "url": req.body.project.web_url,
          "description": description,
          "author": {
            "name": req.body.user_name,
            "url" : req.body.project.web_url+"/commit/"+req.body.commits[0].id,
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
        desc = "Pipeline event was **successful**\nTook "+req.body.object_attributes.duration+" seconds."
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
            "url" : req.body.project.web_url+"/pipelines/"+req.body.object_attributes.id,
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
    }if(req.body.object_kind==="merge_request" && req.body.object_attributes.created_at==req.body.object_attributes.updated_at) {
      var desc = "";
      var content = "";
      var rgb = 0;
      if(req.body.object_attributes.state==="opened") {
        desc = req.body.user.name + " is looking to merge branch `"+req.body.object_attributes.source_branch+"` into `"+req.body.object_attributes.target_branch+"`"
        if(req.body.object_attributes.description!=="") {
          content=req.body.object_attributes.description
        }
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
      var discord;
      if (content !== "") {
        var discord = {
          "embeds": [{
            "type": "rich",
            "url": req.body.project.web_url,
            "fields": [
              {
                "name": desc,
                "value": content,
                "inline": false
              },
            ],
            "author": {
              "name": req.body.user.name,
              "url" : req.body.project.web_url+"/merge_requests/"+req.body.object_attributes.iid,
              "icon_url": req.body.user.avatar_url,
            },
            "color": rgb,
            "timestamp" : new Date(new Date().getTime()).toISOString(),
            "footer": {
              "icon_url": "https://images-ext-1.discordapp.net/external/rOLw2OEhv18sWefG0BXKB24jkol03LmNTODnUsRxRxs/https/www.gillware.com/wp-content/uploads/2017/02/gitlab-logo-square-300x300.png",
              "text": req.body.project.name + " | Merge Request",
            },
          }]
        };
      }else{
        var discord = {
          "embeds": [{
            "type": "rich",
            "url": req.body.project.web_url,
            "description": desc,
            "author": {
              "name": req.body.user.name,
              "url" : req.body.project.web_url+"/merge_requests/"+req.body.object_attributes.iid,
              "icon_url": req.body.user.avatar_url,
            },
            "color": rgb,
            "timestamp" : new Date(new Date().getTime()).toISOString(),
            "footer": {
              "icon_url": "https://images-ext-1.discordapp.net/external/rOLw2OEhv18sWefG0BXKB24jkol03LmNTODnUsRxRxs/https/www.gillware.com/wp-content/uploads/2017/02/gitlab-logo-square-300x300.png",
              "text": req.body.project.name + " | Merge Request",
            },
          }]
        };
      }

        request.post("https://discordapp.com/api/webhooks/" + req.params.id + "/" + req.params.token)
        .json(discord)
        .on("response", function(response) {
          //console.log(response);
        }
        );
  
        //console.log(discord);
        res.send("");
    }if(req.body.object_kind==="note"){
      var title = ""
      if(req.body.object_attributes.noteable_type=="Commit") {
        title = req.body.user.name+" commented on Commit `"+req.body.commit.message+"`"
      }
      if(req.body.object_attributes.noteable_type=="MergeRequest") {
        title = req.body.user.name+" commented on Merge Request `"+req.body.merge_request.title+"`"
      }
      if(req.body.object_attributes.noteable_type=="Issue") {
        title = req.body.user.name+" commented on Issue `"+req.body.issue.title+"`"
      }
      var discord = {
        "embeds": [{
          "type": "rich",
          "url": req.body.object_attributes.url,
          "fields": [
            {
              "name": title,
              "value": req.body.object_attributes.note,
              "inline": false
            },
          ],
          "author": {
            "name": req.body.user.name,
            "url" : req.body.object_attributes.url,
            "icon_url": req.body.user.avatar_url,
          },
          "color": 8311585,
          "timestamp" : new Date(new Date().getTime()).toISOString(),
          "footer": {
            "icon_url": "https://images-ext-1.discordapp.net/external/rOLw2OEhv18sWefG0BXKB24jkol03LmNTODnUsRxRxs/https/www.gillware.com/wp-content/uploads/2017/02/gitlab-logo-square-300x300.png",
            "text": req.body.project.name + " | Comment",
          },
        }]
      };
      if(req.body.object_attributes.note!="") {

        request.post("https://discordapp.com/api/webhooks/" + req.params.id + "/" + req.params.token)
        .json(discord)
        .on("response", function(response) {
          //console.log(response);
        }
        );
  
        //console.log(discord);
        res.send("");
      }
    }if(req.body.object_kind==="issue" && (req.body.object_attributes.action==="open" || req.body.object_attributes.action==="close")) {
      var desc = "";
      var content = "";
      var rgb = 0;
      if(req.body.object_attributes.state==="opened") {
        desc = req.body.user.name + " has opened an issue `"+req.body.object_attributes.title+"`"
        if(req.body.object_attributes.description!=="") {
          content=req.body.object_attributes.description
        }
        rgb = 8069775
      }
      if(req.body.object_attributes.state==="closed") {
        desc = req.body.user.name + " has closed an issue `"+req.body.object_attributes.title+"`"
        rgb = 16711682
      }
      var discord;
      if (content !== "") {
        var discord = {
          "embeds": [{
            "type": "rich",
            "url": req.body.project.web_url,
            "fields": [
              {
                "name": desc,
                "value": content,
                "inline": false
              },
            ],
            "author": {
              "name": req.body.user.name,
              "url" : req.body.project.web_url+"/issues/"+req.body.object_attributes.iid,
              "icon_url": req.body.user.avatar_url,
            },
            "color": rgb,
            "timestamp" : new Date(new Date().getTime()).toISOString(),
            "footer": {
              "icon_url": "https://images-ext-1.discordapp.net/external/rOLw2OEhv18sWefG0BXKB24jkol03LmNTODnUsRxRxs/https/www.gillware.com/wp-content/uploads/2017/02/gitlab-logo-square-300x300.png",
              "text": req.body.project.name + " | Issue",
            },
          }]
        };
      }else{
        var discord = {
          "embeds": [{
            "type": "rich",
            "url": req.body.project.web_url,
            "description": desc,
            "author": {
              "name": req.body.user.name,
              "url" : req.body.project.web_url+"/Issue/"+req.body.object_attributes.id,
              "icon_url": req.body.user.avatar_url,
            },
            "color": rgb,
            "timestamp" : new Date(new Date().getTime()).toISOString(),
            "footer": {
              "icon_url": "https://images-ext-1.discordapp.net/external/rOLw2OEhv18sWefG0BXKB24jkol03LmNTODnUsRxRxs/https/www.gillware.com/wp-content/uploads/2017/02/gitlab-logo-square-300x300.png",
              "text": req.body.project.name + " | Merge Request",
            },
          }]
        };
      }

        request.post("https://discordapp.com/api/webhooks/" + req.params.id + "/" + req.params.token)
        .json(discord)
        .on("response", function(response) {
          //console.log(response);
        }
        );
  
        //console.log(discord);
        res.send("");
    }
  });
}
