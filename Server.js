var express = require('express');
var bodyParser = require("body-parser");
var oracledb = require('oracledb');
var tools = require('./tools');
var transform = require('./transform');
var app = express();
var result;
var path = require('path');
var fs = require('fs');
var ejs = require('ejs');
var najax = require('najax');
var message = "";
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/public", express.static(path.join(__dirname, 'public')));

let conn=null;



var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port
  
  transform.proc = process;
  console.log("Listening at http://%s:%s", host, port);
  oracledb.outFormat = oracledb.OBJECT;
  oracledb.fetchAsString = [ oracledb.DATE];
  oracledb.fetchAsString = [ oracledb.CLOB ];
  transform.setOracle(oracledb);
  transform.najax = najax;
  console.log(JSON.stringify(tools.dbConnecction,null,2));
  openConnection(generateIndex);
})

//WEB_SANTAL_GJENSTANDER 
function generateIndex(){
  if(conn==null){
    console.log("openconnection returnerer null");  
    return;
  }  
  console.log("fik connection");  
  transform.setConnection(conn);
  transform.loadResultset(conn,"SELECT *  FROM  USD_ETNO_GJENSTAND_O.WEB_SANTAL_GJENSTANDER  order by gjenstandid",transform.runThroughMainTable);
}

function openConnection(functionToCall){
oracledb.getConnection(tools.dbConnecction,
  function(err, connection)
  {
    if (err) { console.error(err); return null; }
    conn = connection;
    functionToCall();
  });

}



app.get('/ServerClose', function (req, res) {
  console.log("kalder ServerClose");
  process.exit();
/*  server.close(function() {
    console.log("gar ind i funktionen");
    console.log("Closed out remaining connections.");
    process.exit()
  });*/
})



function run_cmd(cmd, args, callBack ) {
    var spawn = require('child_process').spawn;
    var child = spawn(cmd, args);
    var resp = "";
    child.stdout.on('data', function (buffer) { resp += buffer.toString() });

    child.stdout.on('end', function() { callBack (resp) });
} 

