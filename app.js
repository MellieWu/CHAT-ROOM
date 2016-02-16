// Import all my dependencies
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var redis = require('redis');	
var cc = redis.createClient();
// store messages in array
var messages = [];

var storeMessage = function(name, data,time){
	//add messages to the end of the array
	var message = JSON.stringify({name:name, data:data,time:time});
	
	cc.lpush("messages", message);
}
//define a route handler / that gets called when we hit our website home.
app.get('/',function(req,res){
	res.sendFile(__dirname+'/index1.html');
});

//Listen for connection
io.on('connection', function(client){
	//Listens for new user
	client.on('join',function(name){
		client.nickname = name;
		cc.lrange("messages",0,-1,function(err,messages){
			//reverse so that they are in the right order
			messages = messages.reverse();
	       //iterate througn messages array and emit a message on the connecting client for each one
			messages.forEach(function(message){
				//parse into JSON object
				message = JSON.parse(message);
				client.emit("chat message", message.name +": "+message.data+" ____"+message.time );
			});
		});
    });
 //Listens for a new chat message
    client.on('chat message', function(msg){
        io.emit('chat message',client.nickname+ ": " +msg + "____"+ now());
		storeMessage(client.nickname,msg,now());//when client send a message, call storeMessage
    });
});


//make the http server listen on port 3000.
http.listen(3000, function(){
    console.log('listening on *:3000');
});

function now() {
  var date = new Date();
  var time = (date.getMonth() + 1)+ '.' + date.getDate() + '.' + date.getFullYear()  + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes());
  return time;
}

