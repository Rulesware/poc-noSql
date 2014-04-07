var http = require("http");
var couchbase = require('couchbase');
var guid = require("guid");

var new_beer = {};


function onRequest(request, response) {

	var hostname = "192.168.212.139:8091";

	


	if( request.method == "GET" && request.url == "/"){

		var db = new couchbase.Connection({host: hostname, bucket: 'pdc', password: 'pdc'}, function(error){
			//console.log(error);
		});

		var docs = {
		    "test-doc12": {
		        "value": {
		            "name": "Frank"
		        }
		    },
		    "test-doc22": {
		        "value": {
		            "name": "Bob"
		        }
		    },
		    "test-doc32": {
		        "value": {
		            "name": "Jones"
		        }
		    }
		};


			db.setMulti(docs, {}, function(err, results) {
			  if (err) throw err;

			  db.getMulti(docs, {},
			              function(err, results) {
			    if (err) throw err;

			    console.log(results);
			    response.writeHead(200, {"Content-Type": "text/plain"});
				response.write("message");
				response.end();
			  });
			});

	}
	


	
}



var server = http.createServer(onRequest);
server.listen(8080);

console.log("> SERVER STARTED");
