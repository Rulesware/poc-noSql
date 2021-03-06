var http = require("http");
var couchbase = require('couchbase');
var nano = require('nano')('http://192.168.212.139:5984');
var fs = require('fs'), xml2js = require('xml2js');
var reader = require ("buffered-reader");
var _ = require("underscore");
var kHash = require("k-hash")
var cache = require('memory-cache');
var Guid = require('guid');
var cql = require('node-cassandra-cql');
var MongoClient = require('mongodb').MongoClient;

function onRequest(request, response) {
  var nodeTime = require('nodetime').profile({
    accountKey: '477c61a9ca315479a539e2e71562ac2c4dd71e8f',
    appName: 'Node.JS LinuxApp'
  });

  var processTag = ["bpmn2:endEvent","bpmn2:inclusiveGateway","bpmn2:startEvent","bpmn2:task"];

  switch (request.url){
   
    case ("/couchdb"):
      var dbCouchdb = nano.db.use("pdc_poc");
      getMapping(function(x){
        var insert = processData( x, processTag, "couchdb");
        dbCouchdb.bulk({"docs": insert}, function(err){
          if(!err) finishRequest(response, "data inserted into couchdb!");
        });
      });
      break;

    case ("/couchbase"):
      var dbCouchbase = new couchbase.Connection({host: "192.168.212.139:8091", bucket: 'pdc2', password: 'pdc'});
      getMapping(function(x){
        var insert = processData( x, processTag, "couchbase");
        dbCouchbase.setMulti( insert , {}, function(err) {
          if(!err) finishRequest(response, "data inserted into couchbase!");
        });
      });
      break;

    case ("/cassandra"):
      var dbCassandra = new cql.Client({hosts: ['192.168.212.139:9042'], keyspace: 'pdc',username:'cassandra',password:'cassandra'});
       getMapping(function(x){
        var insert = processData( x, processTag, "cassandra");
        dbCassandra.executeBatch (insert, 1, {}, function(err) {
          if(!err) finishRequest(response, "data inserted into cassandra!");
       });
      });
      break;

    case ("/select/couchdb"):
      var randomSkip = parseInt(getRandomIndex());
      var dbCouchdb = nano.db.use("pdc_poc");
      var newProccessId = 0;
      dbCouchdb.view("Where", "processid", { skip: randomSkip, limit: 1}, function(err, body){
        newProccessId = body.rows[0].value.processId;
        if (!err)
          dbCouchdb.view("Where", "processid" , {key: newProccessId }, function(err, body) {
            if (!err)
            {
              var amount = body.rows.length;
              var hashInfo = Date.now();
              var newElement = body.rows[0].value;
              kHash(newElement.shapeType + Date.now(), hashInfo);
              var _id = Guid.raw();
              newElement._id = _id;
              newElement.id = _id;
              newElement.hash = hashInfo;
              dbCouchdb.insert(newElement, function(error, body){
                if(!error) finishRequest(response, "data received from couchdb. Skip: "+randomSkip+", received: "+amount+". Inserted 1 new values.");
              });
            }
          });
      });
    break;

    case ("/select/couchbase"):
      var dbCouchbase = new couchbase.Connection({host: "192.168.212.139:8091", bucket: 'pdc2', password: 'pdc'});
      var randomValue = parseInt(getRandomIndex());
      var pid = 0;
      var amount = 0;
      dbCouchbase.view('Where', 'processid').query({ limit:1, skip: randomValue}, function(err, results) {
        pid = (results[0].value.processId);
        dbCouchbase.view('Where', 'processid').query({ key: pid }, function(err, results) {
          amount = results.length;
          var hashInfo = Date.now();
          var newElement = results[0].value;
          kHash(newElement.shapeType + Date.now(), hashInfo);
          var _id = Guid.raw();
          newElement._id = _id;
          newElement.id = _id;
          newElement.hash = hashInfo;
          dbCouchbase.set(newElement.id, newElement, function(err, results){
            if(!err) finishRequest(response, "data received from couchbase. Skip: "+randomValue+", received: "+amount+". Inserted 1 new values.");
          });
        });
      });
      break;

    case ("/select/cassandra"):
      var dbCassandra = new cql.Client({hosts: ['192.168.212.139:9042'], keyspace: 'pdc',username:'cassandra',password:'cassandra'});
      //var query = "select count(*) from tblstorage where processid = 'bdaf4fd7-c482-a3fc-9999-440849436610' ALLOW FILTERING;";
      var randomSkip =  parseInt(getRandomIndex());
      var query = "SELECT * FROM tblstorage LIMIT "+randomSkip;
      dbCassandra.execute(query, [],
        function(err, result) {
          if (!err) {
            var pid = result.rows[result.rows.length-1].processid;
            query = "SELECT * FROM tblstorage WHERE processid = '"+pid+"' ALLOW FILTERING";
            dbCassandra.execute(query, [], function(err, results){
              var hashInfo = Date.now();
              var newElement = result.rows[0];
              kHash(newElement.shapeType + Date.now(), hashInfo);
              //inserting new element
              query = "insert into tblstorage(id,processid,metadata,shapetype,hash,connectors, bounds, metadiagram) values ('" + Guid.raw() + "','" + pid + "','" + newElement.metadata + "','" + newElement.shapetype+ "','" + hashInfo + "','" + newElement.connectors + "','" + newElement.bounds + "','" + newElement.metadiagram+"')";
              dbCassandra.execute(query, [], function(err, result){
                finishRequest(response, "done!");
              });
            });
          }
        }
      );
    break;

    case ("/select/mongo"):
      MongoClient.connect("mongodb://pdc.rulesware.com/poc",function(err, db) {
        var retval;
        err?retval="Fail":retval="OK";
        var collection = db.collection("poc");
        if(collection=="undefined")
          return finishRequest(response, "I couldn't find any collection available @.@");
        var results =[];
        //random process
        collection.findOne({rnd: {$gte: Math.random()}},{limit:1},function(err, result) {
          //var queryLimit = Math.floor(Math.random() * (1000 - 100) + 100);
          //query for child objects
          collection.find({processId:result.processId},{},function(err,shapes){
            //inserting new object
            shapes.toArray(function(err,results){
              var newElement = results[0];
              var hashInfo = Date.now();
              kHash(newElement.shapeType + Date.now(), hashInfo);
              var _id = Guid.raw();
              newElement.id= _id;
              newElement._id= _id;
              collection.insert(newElement,function(err, element){
                finishRequest(response, "mongo request select finished mongodb! status:"+retval);
              });  
            });
          });
        });
       });
    break;

    case ("/mongo"):
      MongoClient.connect("mongodb://pdc.rulesware.com:27017/poc",function(err, db) {
          if(err!=null)
            finishRequest(response, "I could't connect to mongoDB");
          getMapping(function(x){
            var insert = processData(x, processTag, "mongo");
            db.collection("poc").insert(insert, function(err, result){
              finishRequest(response, "Data inserted in mongo!");
            })
          });
          var retval;
          err?retval="Fail":retval="OK";
          return finishRequest(response, "mongo insert finished mongodb! status:"+retval);
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
            var jsonFile = JSON.stringify(result);
            var newResult = result = JSON.parse(jsonFile);
            cache.put("mapping", newResult);
            callback( newResult );
          });
      });
    } else{
      callback( cache.get("mapping") );
    }
}



function processData(result, processTag, server, processId){
  var temp = getType(server);
  var proccessGuid = (processId == undefined) ? Guid.raw() : processId;
  var limit = Math.round((Math.random(900)+100)/6);

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
                                              "connectors" : { "incoming" : process[tag][i]["bpmn2:incoming"] == undefined ? [] : process[tag][i]["bpmn2:incoming"],
                                                                "outgoing" : process[tag][i]["bpmn2:outgoing"] == undefined ? [] : process[tag][i]["bpmn2:outgoing"] },
                                              "bounds" : bounds["dc:Bounds"]["$"],
                                              "metaDiagram" : bounds["$"],
                                              "rnd":Math.random()
                                            } : "insert into tblpdc(id,processid,metadata,shapetype,hash,connectors, bounds, metadiagram) values ('" + mongoose.Types.ObjectId() + "','" + proccessGuid + "','" + JSON.stringify(process[tag][i]["$"]) + "','" + tag+ "','" + hashInfo + "','" + ( JSON.stringify( process[tag][i]["bpmn2:incoming"] ) + " " + JSON.stringify(process[tag][i]["bpmn2:outgoing"]) ) + "','" + JSON.stringify(bounds) + "','" + JSON.stringify(result["bpmn2:definitions"]["process"][0]["bpmndi:BPMNDiagram"][0]["$"]) + "')";
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
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write(message);
  response.end();
}

function getRandomIndex(){
  return Math.round(Math.random()*(1080000) + Math.random()*(5400)+ 600);
}

var server = http.createServer(onRequest);
server.listen(8082);