var http = require("http");
var mongoose = require('mongoose');
var couchbase = require('couchbase');
var nano = require('nano')('http://pdc.rulesware.com:5984');
var fs = require('fs'), xml2js = require('xml2js');
var reader = require ("buffered-reader");
var _ = require("underscore");
var kHash = require("k-hash")
var cache = require('memory-cache');
var Guid = require('guid');
var cql = require('node-cassandra-cql');

function onRequest(request, response) {
 	var db = mongoose.createConnection('mongodb://pdc.rulesware.com/poc');
 	var dbCouchbase  = new couchbase.Connection({host: "pdc.rulesware.com:8091", bucket: 'pdc', password: 'pdc'});  
	var dbCouchdb = nano.db.use("pdc_poc");
  var dbCassandra = new cql.Client({hosts: ['192.168.212.139:9042'], keyspace: 'test',username:'cassandra',password:'cassandra'});

  if(request.url == "/mongo")
    getMapping("mongo", function(x){
        db.collection('poc').insert(x, function(obj){
          finishRequest(response, "data inserted into mongodb!");
        });
    });

  if(request.url == "/couchdb" )
    getMapping("couchdb", function(x){
      dbCouchdb.bulk({"docs": x}, function(e,resData){
        finishRequest(response, "data inserted into couchdb!");
      });
    });    

  if(request.url == "/couchbase")
    getMapping("couchbase", function(x){
      dbCouchbase.setMulti( x , {}, function(err, results) {
        if (err) console.log(err); else finishRequest(response, "data inserted into couchbase!");;
      });
    });    

  if(request.url == "/cassandra")
     getMapping("cassandra", function(x){
      dbCassandra.executeBatch (x, 1, {}, function(err) {
        if (err) console.log(err); else finishRequest(response, "data inserted into cassandra!");         
     });
    });
};

var getMapping = function(server, callback){
    if( cache.get("mapping") == null ){
      var processTag = ["bpmn2:endEvent","bpmn2:inclusiveGateway","bpmn2:startEvent","bpmn2:task"];
      var parser = new xml2js.Parser();

      fs.readFile('flow.xml', function(err, data) {
          parser.parseString(data, function (err, result) {
            callback(processData(result, processTag, server));
          });
      });
    } else{
      callback( cache.get("mapping") );
    }
}

function processData(result, processTag, server){
  var jsonFile =  JSON.stringify(result)  ;
  result = JSON.parse(jsonFile);
  var temp = getType(server);

  var process = result["bpmn2:definitions"]["process"][0]["bpmn2:process"][0];
  for(var i=0;i<17;i++)
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

      var _id = mongoose.Types.ObjectId();
      var data = (server != "cassandra") ? {
                                              "_id": _id,
                                              "id" : Guid.raw(),
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
  cache.put("mapping", temp);
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
  console.log(message);
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write(message);
  response.end();
}

var server = http.createServer(onRequest);
server.listen(8081);
console.log("> NODE.JS STARTED");