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
	var pdcDB = nano.db.use("pdc_poc");
  var client = new cql.Client({hosts: ['192.168.212.139:9042'], keyspace: 'test',username:'cassandra',password:'cassandra'});

  var docs = {
  'test-doc100': {value: {name: 'Frank00'}},
  'test-doc200': {value: {name: 'Bob00'}},
  'test-doc300': {value: {name: 'Jones00'}}
};

    var a = [];
    var b= { "test-doc12": { "value": { "name": "Frank" } } };
    a.push(b);
    a.push(b)

  if(request.url == "/mongo"){
    getMapping("mongo", function(x){
        db.collection('poc').insert(x,function(obj){
          console.log("data inserted into mongodb!");
        });
    });
  }

  if(request.url == "/couchdb" ){
    getMapping("couchdb", function(x){
      pdcDB.bulk({"docs": x},function(e,resData){
        console.log("data inserted into couchdb!");
      });
    });    
  }

  if(request.url == "/couchbase"){
    getMapping("couchbase", function(x){
      dbCouchbase.setMulti( x , {}, function(err, results) {
        if (err) console.log(err); else console.log("data inserted into couchbase!");
      });
    });
    
  }

  if(request.url == "/cassandra"){
     getMapping("cassandra", function(x){
      client.executeBatch (x, 1, {}, function(err) {
        if (err) console.log(err); else console.log("data inserted into cassandra!");         
     });
    });
  }

  response.writeHead(200, {"Content-Type": "text/plain"});
	response.write("write done");
	response.end();
};

var getMapping = function(server, callback){
  if( cache.get("mapping") == null ){
    var processTag = ["bpmn2:endEvent","bpmn2:inclusiveGateway","bpmn2:startEvent","bpmn2:task"];
    var parser = new xml2js.Parser();

    fs.readFile('flow.xml', function(err, data) {
        parser.parseString(data, function (err, result) {
          if(server == "mongo" || server == "couchdb" )
            callback(processData(result, processTag));
          else if( server == "couchbase" )
              callback(processDataCB(result, processTag));
          else if( server == "cassandra")
            callback(processDataCassandra(result, processTag));
        });
    });
  } else{
    callback( cache.get("mapping") );
  }
}

function processData(result, processTag){
  var jsonFile =  JSON.stringify(result)  ;
  result = JSON.parse(jsonFile);
  var temp = [];

  var process = result["bpmn2:definitions"]["process"][0]["bpmn2:process"][0];
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

      var data = {
        "_id": mongoose.Types.ObjectId(),
        "id" : Guid.raw(),
        "metaData" : process[tag][i]["$"],
        "shapeType" : tag,
        "hash" : hashInfo,
        "connectors" : {  "incoming" : process[tag][i]["bpmn2:incoming"] == undefined ? [] : process[tag][i]["bpmn2:incoming"],
                          "outgoing" : process[tag][i]["bpmn2:outgoing"] == undefined ? [] : process[tag][i]["bpmn2:outgoing"] },
        "bounds" : bounds["dc:Bounds"]["$"],
        "metaDiagram" : bounds["$"]
      }             
      temp.push(data);
    });
  });
  cache.put("mapping", temp);
  return temp;
}

function processDataCB(result, processTag){
  var jsonFile =  JSON.stringify(result)  ;
  result = JSON.parse(jsonFile);
  var temp = {};

  var process = result["bpmn2:definitions"]["process"][0]["bpmn2:process"][0];
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

      var data = {
        //"_id": mongoose.Types.ObjectId(),
        "id" : Guid.raw(),
        "metaData" : process[tag][i]["$"],
        "shapeType" : tag,
        "hash" : hashInfo,
        "connectors" : {  "incoming" : process[tag][i]["bpmn2:incoming"] == undefined ? [] : process[tag][i]["bpmn2:incoming"],
                          "outgoing" : process[tag][i]["bpmn2:outgoing"] == undefined ? [] : process[tag][i]["bpmn2:outgoing"] },
        "bounds" : bounds["dc:Bounds"]["$"],
        "metaDiagram" : bounds["$"]
      }

      var key = mongoose.Types.ObjectId();     
      temp[key] = {"value" : data};
    });
  });
  cache.put("mapping", temp);
  console.log(temp);
  return temp;
} 



var processDataCassandra = function(result, processTag){
  var jsonFile =  JSON.stringify(result)  ;
  result = JSON.parse(jsonFile);
  var temp = [];

  var process = result["bpmn2:definitions"]["process"][0]["bpmn2:process"][0];
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

      var data= "insert into tblstorage(id,metadata,shapetype,hash,connectors, bounds, metadiagram) values ('" + mongoose.Types.ObjectId() + "','" + process[tag][i]["$"] + "','" + tag+ "','" + hashInfo + "','" +  process[tag][i]["bpmn2:incoming"] +","+process[tag][i]["bpmn2:outgoing"] + "','" + bounds + "','" + result["bpmn2:definitions"]["process"][0]["bpmndi:BPMNDiagram"][0]["$"] + "')";                    
      temp.push(data);
    });
  });
  cache.put("mapping", temp);
  return temp;              
}


var server = http.createServer(onRequest);
server.listen(8080);
console.log("> NODE.JS STARTED");
