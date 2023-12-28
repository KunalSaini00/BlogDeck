const Server = require('ws').Server;
const { readFileSync, writeFileSync } = require('fs');

const wss = new Server({port : 2303});

let db = {};

try
{
    db = JSON.parse(readFileSync("database.json", 'utf8'));
}catch{
    db = {
        posts : [],
        users : []
    }
}


wss.on("connection", client=>
{
    client.on('message', msg=>
    {
        let data = null;

        try
        {
            data = JSON.parse(msg);
        }
        catch(err)
        {
            console.log("An error occured while parsing JSON data: " + err);
            return;
        }

        if(data.type == "get_post")
        {
            let limit = 0;
            if(typeof(data.limit) == "number" && !isNaN(data.limit))
            {
                limit = Math.min(data.limit, db.posts.length) - 1;
            }
            else
            {
                limit = db.posts.length - 1;
            }

            
            let p = [];

            for(let i = limit; i >= 0; i --)
            {
                p.push({
                    title : db.posts[i].title,
                    subtitle : db.posts[i].subtitle,
                    user_name : db.posts[i].user_name,
                    id : db.posts[i].id
                });
            }  

            client.send(JSON.stringify(
                {
                    type : "get_post",
                    posts : p
                }
            ));
        }


        if(data.type == "register")
        {
            let k = [];
            let st = false;

            for(let i = 0; i < db.users.length; i ++)
            {
                let user = db.users[i];

                if(user.email == data.email)
                {
                    k.push("An account with that email already exists");
                    st = true;
                    break;
                }
            }

            for(let i = 0; i < db.users.length; i ++)
            {
                let user = db.users[i];

                if(user.username == data.username)
                {
                    k.push("The username is already taken");
                    st = true;
                    break;
                }
            }

            k = k.join(" and ");

            if(!st)
            {
                db.users.push({
                    email : data.email,
                    username : data.username,
                    password : data.password,
                });

                saveDatabase();
            }

            client.send(
                JSON.stringify(
                {
                    type : "register",
                    status : !st,
                    reason : k
                }
                )
            );
        }

        if(data.type == "login")
        {
            let f = false;
            let v = false;
            let k = "";

            for(let i = 0; i < db.users.length; i ++)
            {
                const user = db.users[i];

                if(user.email == data.email)
                {
                    f = true;
                    if(user.password == data.password)
                    {
                        v = true;
                    }
                    else
                    {
                        k = "Invalid password";
                    }
                }
            }

            if(!f)
            {
                k = "User with the email doesn't exists";
            }

            client.send(JSON.stringify({
                type : "login",
                status : f && v,
                reason : k
            }));
        }


        if(data.type == "get_post_id")
        {
            let p;
            for(let i = 0; i < db.posts.length; i ++)
            {
                if(db.posts[i].id == data.id)
                {
                    p = db.posts[i];
                }
            }

            client.send(JSON.stringify({
                type : "get_post_id",
                post : p
            }));
        }

        if(data.type == "get_comment")
        {
            let comm = [];
            for(let i = 0; i < db.posts.length; i ++)
            {
                if(db.posts[i].id == data.id)
                {
                    comm = db.posts[i].comments;
                    break;
                }
            }

            client.send({
                type : "get_comment",
                comments : comm
            });
        }


    });
});

const saveDatabase = function()
{
    writeFileSync("database.json", JSON.stringify(db, undefined, 4));
}