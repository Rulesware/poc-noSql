var http = require("http");
var mongoose = require('mongoose');
var couchbase = require('couchbase');
var nano = require('nano')('http://192.168.212.139:5984');
var fs = require('fs'), xml2js = require('xml2js');
var reader = require ("buffered-reader");
var _ = require("underscore");
var kHash = require("k-hash")
var cache = require('memory-cache');
var Guid = require('guid');
var cql = require('node-cassandra-cql');

function onRequest(request, response) {
  var processTag = ["bpmn2:endEvent","bpmn2:inclusiveGateway","bpmn2:startEvent","bpmn2:task"];

  if(request.url == "/select/couchdb")
  { 
    var randomSkip = Math.round(Math.random()*(1080000) + Math.random()*(5400)+ 600);
    console.log("getting data from couchdb...");
    var dbCouchdb = nano.db.use("pdc_poc");
    //getting the random process id
    dbCouchdb.list({ skip: randomSkip, limit: 1 }, function(err, body) {
      if (err) 
      {
        //getting the list of shapes for the random process.
        console.log(body);
        console.log(randomSkip);
        finishRequest(response, "done !");
        /*
        dbCouchdb.view("Where", "processid" , {key: body.rows[0].processId}, function(err, body) {
          if (!err) {
            console.log("data received from couchdb. received: "+body.rows.length);
            finishRequest(response, "data received from couchdb. received: "+body.rows.length);
          }else {console.log(err); finishRequest(response, "error, look console log.")}
        });
*/
      } else console.log(err);
    });
  }
    

  if(request.url == "/mongo"){
    var db = mongoose.createConnection('mongodb://localhost/poc');
    getMapping(function(x){
        var insert  = processData( x, processTag, "mongo");
        db.collection('poc').insert(insert, function(err){
          finishRequest(response, "data inserted into mongodb!");
          if(err) console.log(err);
        });
    });
  }

  if(request.url == "/couchdb" ){
    var dbCouchdb = nano.db.use("pdc_poc");    
    getMapping(function(x){
      var insert  = processData( x, processTag, "couchdb");
      dbCouchdb.bulk({"docs": insert}, function(err){
        if(err) console.log(err);
        else finishRequest(response, "data inserted into couchdb!");
      });
    });    
  }

  var dbCouchbase  = new couchbase.Connection({host: "192.168.212.139:8091", bucket: 'pdc2', password: 'pdc'});
  if(request.url == "/couchbase"){
    getMapping(function(x){
      var insert  = processData( x, processTag, "couchbase");
      dbCouchbase.setMulti( insert , {}, function(err) {
        console.log(err);
        finishRequest(response, "data inserted into couchbase!");;
      });
    });
  }

  if(request.url == "/cassandra"){
    var dbCassandra = new cql.Client({hosts: ['localhost:9042'], keyspace: 'test',username:'cassandra',password:'cassandra'});
     getMapping(function(x){
      var insert  = processData( x, processTag, "cassandra");
      dbCassandra.executeBatch (insert, 1, {}, function(err) {
        finishRequest(response, "data inserted into cassandra!");         
     });
    });
  }
};

var getMapping = function(callback){
    if( cache.get("mapping") == null ){      
      var parser = new xml2js.Parser();
      fs.readFile('flow.xml', function(err, data) {
          parser.parseString(data, function (err, result) {
            var jsonFile =  JSON.stringify(result);
            var newResult = result = JSON.parse(jsonFile);
            cache.put("mapping", newResult);
            callback( newResult );
          });
      });
    } else{
      callback( cache.get("mapping") );
    }
}

function processData(result, processTag, server){
  var temp = getType(server);
  var proccessGuid = Guid.raw();
  var limit = Math.random()*900 + 100;

  var process = result["bpmn2:definitions"]["process"][0]["bpmn2:process"][0];
  for(var i=0;i<limit;i++)
  _.each(processTag, function(tag){
    _.each(process[tag], function(t,i){
      var shapes = result["bpmn2:definitions"]["process"][0]["bpmndi:BPMNDiagram"][0]["bpmndi:BPMNPlane"][0]["bpmndi:BPMNShape"];
      var bounds = [];
      var hashInfo = Date.now();
      kHash(tag + Date.now(), hashInfo);

      if(shapes.length > 0 )
        _.each(shapes, function(shape){
          _.each(process[tag], function(jtag){
            if(jtag["$"]["id"] == shape["$"]["bpmnElement"] )
              bounds = shape;
          })
        });

      var _id = Guid.raw();
      var data = (server != "cassandra") ? {
                                              "_id": _id,
                                              "id" : _id,
                                              "processId": proccessGuid,
                                              "metaData" : process[tag][i]["$"],
                                              "shapeType" : tag,
                                              "hash" : hashInfo,
                                              "connectors" : {  "incoming" : process[tag][i]["bpmn2:incoming"] == undefined ? [] : process[tag][i]["bpmn2:incoming"],
                                                                "outgoing" : process[tag][i]["bpmn2:outgoing"] == undefined ? [] : process[tag][i]["bpmn2:outgoing"] },
                                              "bounds" : bounds["dc:Bounds"]["$"],
                                              "metaDiagram" : bounds["$"]
                                            } : "insert into tblstorage(id,metadata,shapetype,hash,connectors, bounds, metadiagram) values ('" + mongoose.Types.ObjectId() + "','" + process[tag][i]["$"] + "','" + tag+ "','" + hashInfo + "','" +  process[tag][i]["bpmn2:incoming"] +","+process[tag][i]["bpmn2:outgoing"] + "','" + bounds + "','" + result["bpmn2:definitions"]["process"][0]["bpmndi:BPMNDiagram"][0]["$"] + "')";

      if(server != "couchbase")
        temp.push(data);
      else  
        temp[_id] = {"value" : data};
    });
  });
  return temp;
}

function getType(server){
  switch (server){    
    case "couchbase":
      return {};
    default:
      return [];
  }
}

function finishRequest(response, message){
  //console.log(message);
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write(message);
  response.end();
}

var server = http.createServer(onRequest);
server.listen(8082);
console.log("> NODE.JS STARTED");