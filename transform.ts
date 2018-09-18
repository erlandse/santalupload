var connection = null;
var oradb;
export let mainRowsProcessed = 0;
export let proc = null;
export let najax = null;


var prefixFile = ["eng", "nor", "sat"];
var xmlTag = ["ENG", "NOR", "SAT"];
let docObjects = [];
let fieldArray = [];
let mainResult = null;
export function setOracle(ora) {
  oradb = ora;
}

export function setConnection(conn) {
  connection = conn;
}


export function loadResultset(connection, sql: string, functionToCall) {
  connection.execute(
    sql,
    {},
    {
      resultSet: true
    },
    function (err, result) {
      if (err) { console.error(err); }
      mainResult = result;
      console.log("hallo");
      functionToCall(result);
    });
}

export function runThroughMainTable(result) {
  result.resultSet.getRow(function (err, row) {
    if (err)
      return;
    if (row) {
      docObjects = new Array();
      for (var temp = 0; temp < prefixFile.length; temp++)
        docObjects.push(new Object());
      mainRowsProcessed += 1;
      processMainTable(result, row);
      return;
    }
    result.resultSet.close();
    console.log("finish processing");
    connection.close();
    proc.exit();

  })
}

function processMainTable(result, row) {
  var abstract: string = row.GJENSTANDSBESKRIVELSE;
  if (abstract != null) {
    for (var temp = 0; temp < xmlTag.length; temp++) {
      var pos = abstract.indexOf("<" + xmlTag[temp] + ">");
      if (pos != -1) {
        pos += 2 + xmlTag[temp].length;
        var pos2 = abstract.indexOf("</" + xmlTag[temp] + ">")
        if (pos2 == -1)
          docObjects[temp].gjenstandsbeskrivelse = abstract.substring(pos);
        else
          docObjects[temp].gjenstandsbeskrivelse = abstract.substring(pos, pos2);
      } else docObjects[temp].gjenstandsbeskrivelse = "";
    }
  }else{
    for(let temp =0;temp < xmlTag.length;temp++)
      docObjects[temp].gjenstandsbeskrivelse = "";
  }
  var fotoId = row.FOTOID;
  let hasPhoto = false;
  if (fotoId != null)
    hasPhoto = true
  else
    hasPhoto = false;

  for (var temp = 0; temp < xmlTag.length; temp++) {
    docObjects[temp].id = row.GJENSTANDID;
    docObjects[temp].museumsnr = row.MUSEUMSNR;
    docObjects[temp].unr = row.UNR;
    docObjects[temp].fotoid = row.FOTOID;
    docObjects[temp].fotograf = row.FOTOGRAF;
    if (hasPhoto == true) {
      docObjects[temp].mediaId = fotoId;
      docObjects[temp].harFoto = 1;
    } else
      docObjects[temp].harFoto = 0;
  }

  loadGTyper(row.GJENSTANDID);
  //  proc.exit();
  //  runThroughMainTable(result);
}

function loadGTyper(gjenstandid) {
  let sql: string = null;
  sql = "SELECT * from USD_ETNO_GJENSTAND_O.web_gjoa_gjenstand_gjtype where gjenstandid = " + gjenstandid;
  connection.execute(
    sql,
    {},
    {
      resultSet: true
    },
    function (err, result) {
      if (err) { console.error(err); return; }
      fieldArray = new Array();
      for (var temp = 0; temp < prefixFile.length - 1; temp++)
        fieldArray.push(new Array());
      runGTyper(result, gjenstandid);
      //        functionToCall(result);
    });
}

function runGTyper(result, gjenstandsid) {
  result.resultSet.getRow(function (err, row) {
    if (err)
      return;
    if (row) {
      for (var temp = 0; temp < prefixFile.length - 1; temp++) {
        var st = "row." + prefixFile[temp].toUpperCase() + "_TYPE";
        var st2 = eval(st);
        if (st2 != null && st2.length > 0)
          fieldArray[temp].push(st2);
        //        eval("fieldArray[temp].push("+st+")");
      }
      runGTyper(result, gjenstandsid);
      return;
    }
    for (var i = 0; i < docObjects.length - 1; i++)
      docObjects[i].gjtype = fieldArray[i];
    result.resultSet.close();
    loadGTermer(gjenstandsid)

  })

}

function loadGTermer(gjenstandid) {
  let sql: string = null;
  sql = "SELECT * from USD_ETNO_GJENSTAND_O.web_gjoa_gjenstand_gjterm where gjenstandid = " + gjenstandid;
  connection.execute(
    sql,
    {},
    {
      resultSet: true
    },
    function (err, result) {
      if (err) { console.error(err); return; }
      fieldArray = new Array();
      for (var temp = 0; temp < prefixFile.length - 1; temp++)
        fieldArray.push(new Array());
      runGTermer(result, gjenstandid);
      //        functionToCall(result);
    });
}
function runGTermer(result, gjenstandid) {
  result.resultSet.getRow(function (err, row) {
    if (err)
      return;
    if (row) {
      for (var temp = 0; temp < prefixFile.length - 1; temp++) {
        var st = "row." + prefixFile[temp].toUpperCase() + "_TERM";
        var st2 = eval(st);
        if (st2 != null && st2.length > 0)
          fieldArray[temp].push(st2);
      }
      runGTermer(result, gjenstandid);
      return;
    }
    for (var i = 0; i < docObjects.length - 1; i++)
      docObjects[i].gjenstandsterm = fieldArray[i];
    result.resultSet.close();
    loadMateriale(gjenstandid);

  })
}

let materialeArray = [];
let materialeFacetArray = [];

function loadMateriale(gjenstandid) {
  let sql: string = null;
  sql = "SELECT * from USD_ETNO_GJENSTAND_O.web_gjoa_gjenstand_materiale where gjenstandid = " + gjenstandid;
  connection.execute(
    sql,
    {},
    {
      resultSet: true
    },
    function (err, result) {
      if (err) { console.error(err); return; }
      materialeArray = new Array();
      materialeFacetArray = new Array();
      for (var i = 0; i < prefixFile.length - 1; i++) {
        materialeArray.push(new Array());
        materialeFacetArray.push(new Array());
      }
      runMateriale(result, gjenstandid);
      //        functionToCall(result);
    });
}

// loadMaterialTyper(gjenstandid,languagePrefix+"_materialtype",languagePrefix+"_materiale");
function runMateriale(result, gjenstandid) {
  result.resultSet.getRow(function (err, row) {
    if (err)
      return;
    if (row) {
      for (var temp = 0; temp < prefixFile.length - 1; temp++) {
        var st = "row." + prefixFile[temp].toUpperCase() + "_MATERIALTYPE";
        var materialType = eval(st);
        st = "row." + prefixFile[temp].toUpperCase() + "_MATERIALE";
        var materiale = eval(st);
        loadFacetMateriale(temp, materialType, materiale);
      }
      runMateriale(result, gjenstandid);
      return;
    }
    for (var i = 0; i < docObjects.length - 1; i++) {
      docObjects[i].facetMateriale = materialeFacetArray[i];
      docObjects[i].materiale = materialeArray[i];
    }
    result.resultSet.close();
    loadGEmisk(gjenstandid);

  })
}

function loadFacetMateriale(index, materialType, materiale) {
  var substitute = "Not given";
  var path = "";
  if (materialType == null && materiale == null)
    return;
  path += materialType == null ? substitute : materialType;
  materialeFacetArray[index].push(path);
  if (materiale != null) {
    if (materialType != null && materialType == materiale) {
      materialeArray[index].push(path);
      return;
    }
    path += "$" + materiale;
    materialeFacetArray[index].push(path);
  }
  materialeArray[index].push(path);
}



let emiskArray = [];
function loadGEmisk(gjenstandid) {
  let sql: string = null;
  sql = "SELECT * from USD_ETNO_GJENSTAND_O.web_gjenstand_gjenstandemisk where gjenstandid = " + gjenstandid;
  connection.execute(
    sql,
    {},
    {
      resultSet: true
    },
    function (err, result) {
      if (err) { console.error(err); return; }
      emiskArray = new Array();
      runEmisk(result, gjenstandid);
      //        functionToCall(result);
    });
}

function runEmisk(result, gjenstandid) {
  result.resultSet.getRow(function (err, row) {
    if (err)
      return;
    if (row) {
      emiskArray.push(row.GJENSTANDEMISK);
      runEmisk(result, gjenstandid);
      return;
    }
    docObjects[docObjects.length - 1].gjenstandemisk = emiskArray;
    result.resultSet.close();
    loadMaterialeEmisk(gjenstandid);

  })
}

let emiskMaterialeArray = [];
let matremiskArray = [];
function loadMaterialeEmisk(gjenstandid) {
  let sql: string = null;
  sql = "SELECT * from USD_ETNO_GJENSTAND_O.web_gjenstand_materialemisk where gjenstandid = " + gjenstandid;
  connection.execute(
    sql,
    {},
    {
      resultSet: true
    },
    function (err, result) {
      if (err) { console.error(err); return; }
      emiskMaterialeArray = new Array();
      matremiskArray = new Array();
      runMaterialeEmisk(result, gjenstandid);
      //        functionToCall(result);
    });
}

function runMaterialeEmisk(result, gjenstandid) {
  result.resultSet.getRow(function (err, row) {
    if (err)
      return;
    if (row) {
      var st: string = row.MATREMISK;
      if (st.length > 0 && st.charCodeAt(0) > 4000)
        emiskMaterialeArray.push(st);
      matremiskArray.push(st);
      runMaterialeEmisk(result, gjenstandid);
      return;
    }
    docObjects[docObjects.length - 1].materiale = emiskMaterialeArray;
    docObjects[docObjects.length - 1].matremisk = matremiskArray;
    result.resultSet.close();
    //    runThroughMainTable(mainResult);
    writeToIndex(0);

  })
}

function writeToIndex(index) {
  if (index >= docObjects.length) {
    runThroughMainTable(mainResult);
    return;
  }
  var formData: any = new Object();
  formData.language = prefixFile[index];
  formData.elasticdata = JSON.stringify(docObjects[index], null, 2);
  formData.id = docObjects[index].id;
  najax({
    url: 'http://itfds-prod03.uio.no/es/SantalUpdate.php',
    type: 'POST',
    data: formData,
    success: function (data) {
      if (index == 0)
        console.log(data);
      writeToIndex(index + 1);
    }
  });
}