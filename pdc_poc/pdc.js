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
  var nodeTime = require('nodetime').profile({
    accountKey: '477c61a9ca315479a539e2e71562ac2c4dd71e8f', 
    appName: 'Node.JS LinuxApp'
  });

  var processTag = ["bpmn2:endEvent","bpmn2:inclusiveGateway","bpmn2:startEvent","bpmn2:task"];

  switch (request.url){
    case ("/mongo"):
      var db = mongoose.createConnection('mongodb://192.168.212.139/poc');
      getMapping(function(x){
          var insert  = processData( x, processTag, "mongo");
          db.collection('poc').insert(insert, function(err){
            finishRequest(response, "data inserted into mongodb!");
            if(err) console.log(err);
          });
      });
      break;

    case ("/couchdb"):
      var dbCouchdb = nano.db.use("pdc_poc");    
      getMapping(function(x){
        var insert  = processData( x, processTag, "couchdb");
        dbCouchdb.bulk({"docs": insert}, function(err){
          if(err) console.log(err);
          else finishRequest(response, "data inserted into couchdb!");
        });
      });
      break;

    case ("/couchbase"):
      var dbCouchbase  = new couchbase.Connection({host: "192.168.212.139:8091", bucket: 'pdc2', password: 'pdc'});
      getMapping(function(x){
        var insert  = processData( x, processTag, "couchbase");
        dbCouchbase.setMulti( insert , {}, function(err) {
          if(err) console.log(err);
          finishRequest(response, "data inserted into couchbase!");;
        });
      });
      break;

    case ("/cassandra"):
      var dbCassandra = new cql.Client({hosts: ['192.168.212.139:9042'], keyspace: 'test',username:'cassandra',password:'cassandra'});
       getMapping(function(x){
        var insert  = processData( x, processTag, "cassandra");
        dbCassandra.executeBatch (insert, 1, {}, function(err) {
          if(err) console.log(err);
          finishRequest(response, "data inserted into cassandra!");         
       });
      });
      break;

    case ("/select/couchbase"):
      var dbCouchbase  = new couchbase.Connection({host: "192.168.212.139:8091", bucket: 'pdc2', password: 'pdc'});
      var q = {processId : "000f32ff-0ba5-abfd-4a5b-cab0f79a17e3"};
      dbCouchbase.view('dev_1', 'where').query({ options: q }, function(err, results) {
        finishRequest(response, JSON.stringify(results.length) );
      });
      break;

    case ("/select/cassandra"):
      var dbCassandra = new cql.Client({hosts: ['192.168.212.139:9042'], keyspace: 'test',username:'cassandra',password:'cassandra'});
       getMapping(function(x){
       //var query = "select count(*) from tblstorage where processid = 'bdaf4fd7-c482-a3fc-9999-440849436610' ALLOW FILTERING;";
       var query = "select count(*) from tblstorage where processid = 'bdaf4fd7-c482-a3fc-9999-440849436610' ALLOW FILTERING;";
       dbCassandra.execute(query, [],
          function(err, result) {
            if (err) console.log(err);
            else finishRequest(response, "Total of records: " + result.rows[0].count.low );   
          }
        );
      });
    break;

    default:
      finishRequest(response, "404 Error");
      break;
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
                                            } : "insert into tblstorage(id,processid,metadata,shapetype,hash,connectors, bounds, metadiagram) values ('" + mongoose.Types.ObjectId() + "','" + proccessGuid + "','" + JSON.stringify(process[tag][i]["$"]) + "','" + tag+ "','" + hashInfo + "','" + ( JSON.stringify( process[tag][i]["bpmn2:incoming"] ) + " " + JSON.stringify(process[tag][i]["bpmn2:outgoing"])  ) + "','" + JSON.stringify(bounds) + "','" + JSON.stringify(result["bpmn2:definitions"]["process"][0]["bpmndi:BPMNDiagram"][0]["$"]) + "')";
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
server.listen(8081);
console.log("> NODE.JS STARTED");