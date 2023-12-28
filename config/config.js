//host (server hosted on codesandbox)
$host = "qc8phk-2303.csb.app";

//port
$port = 80

//dbname
$dbname = "blogdeck";

//user
$user = "root";

//pass
$pass = "";

const ws = new WebSocket(`ws://${$host}:${$port}`);

ws.addEventListener('open', ()=>{
    console.log("Connected to server");
    wsload();
});

ws.addEventListener('message', e=>{
    const data = JSON.parse(e.data);

    get_data(data);
});

const send_data = function(data)
{
    if(!ws.readyState == 1) return;
    
    ws.send(JSON.stringify(data));
}


// This is an event function

function get_data(data)
{

}

// This is also an event function

function wsload()
{

}