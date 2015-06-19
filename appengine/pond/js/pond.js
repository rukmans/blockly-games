/**
 * Blockly Games: Pond
 *
 * Copyright 2013 Google Inc.
 * https://github.com/google/blockly-games
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Creates an pond for players to compete in.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pond');

goog.require('Pond.Battle');
goog.require('Pond.Visualization');
goog.require('BlocklyGames');
goog.require('goog.math.Coordinate');


/**
 * Optinal callback function for when a game ends.
 * @type Function
 */
Pond.endBattle = null;

var firstRun = true;
var storageSupported = false; //Used to store support for HTML5 storage
var currentIndex = 0;         //Used to point to localStorage index
var workspaceIndex = null;    //Current index used to store workspace
var timestampIndex = null;    //Current index used to store time stamps
var resultView = null;        //The windows used to show results
var reportView = null;        //The window used to show formatted HTML table
var currentIndexKey = 'currentIndex'; //Used as key to store and retrieve current index in localStorage

/**
 * Initialize the pond.  Called on page load.
 */
Pond.init = function() {
  BlocklyInterface.init();
  Pond.Visualization.init();

  BlocklyGames.bindClick('runButton', Pond.runButtonClick);
  BlocklyGames.bindClick('resetButton', Pond.resetButtonClick);
  BlocklyGames.bindClick('docsButton', Pond.docsButtonClick);
  BlocklyGames.bindClick('closeDocs', Pond.docsCloseClick);
  BlocklyGames.bindClick('clearButton', Pond.clearButtonClick);
  BlocklyGames.bindClick('exportButton', Pond.exportButtonClick);
  BlocklyGames.bindClick('reportButton', Pond.reportButtonClick);

  // Lazy-load the JavaScript interpreter.
  setTimeout(BlocklyInterface.importInterpreter, 1);
  // Lazy-load the syntax-highlighting.
  setTimeout(BlocklyInterface.importPrettify, 1);

  BlocklyGames.bindClick('helpButton', Pond.showHelp);
  if (location.hash.length < 2 &&
      !BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
                                         BlocklyGames.LEVEL)) {
    setTimeout(Pond.showHelp, 1000);
  }

  Pond.initStorage();


};

Pond.initStorage = function() {
  if('localStorage' in window && window['localStorage'] !== null)
  {
    storageSupported = true;
    currentIndex = localStorage.getItem(currentIndexKey);
    if(currentIndex !== null)
      console.log('Index retrieved: ' + currentIndex.toString());
    else
    {
      currentIndex = 1;
      console.log('Index not found, initializing to 1');
      localStorage.setItem(currentIndexKey, currentIndex);
    }
  }
  else
    alert("HTML5 Storage not supported in your browser, Semantic Interactions will not be saved!");
}

/**
 * Is the documentation open?
 * @private
 */
Pond.isDocsVisible_ = false

/**
 * Open the documentation frame.
 */
Pond.docsButtonClick = function() {
  if (Pond.isDocsVisible_) {
    return;
  }
  var origin = document.getElementById('docsButton');
  var dialog = document.getElementById('dialogDocs');
  var frame = document.getElementById('frameDocs');
  if (!frame.src) {
    frame.src = 'pond/docs.html?lang=' + BlocklyGames.LANG +
        '&app=' + BlocklyGames.NAME + '&level=' + BlocklyGames.LEVEL;
  }

  function endResult() {
    dialog.style.visibility = 'visible';
    var border = document.getElementById('dialogBorder');
    border.style.visibility = 'hidden';
  }
  Pond.isDocsVisible_ = true;
  BlocklyDialogs.matchBorder_(origin, false, 0.2);
  BlocklyDialogs.matchBorder_(dialog, true, 0.8);
  // In 175ms show the dialog and hide the animated border.
  setTimeout(endResult, 175);

  var currentTime = new Date();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  var seconds = currentTime.getSeconds();

  if (minutes < 10)
  minutes = "0" + minutes;

  console.log("Action: Documentation Opened, Time: " + hours + ":" + minutes + ":" + seconds);

  Pond.recordAction("Documentation_Opened");

};


/**
* Clear the local storage
*/
Pond.clearButtonClick = function() {

  if(!storageSupported)
  {
    alert('Your browser does not support local storage, nothing to clear!');
    return;
  }

  console.log('Starting to clear localStorage!');

  for(var i = 1; i<currentIndex; i++){
    var index =  "timestamp"+i.toString();
    localStorage.removeItem(index);
    localStorage.setItem(currentIndexKey, 1);
  }

  //localStorage.clear();
  console.log('local storage cleared!');
  currentIndex = 1;
}

/**
* Export the locally stored results as formatted HTML table
*/
Pond.reportButtonClick = function() {
  console.log('Exporting locally stored results as an HTML table.');
  reportView = window.open("");
  reportView.document.write("<html><head><title>Measuring Skills, CTL, CSL, VT</title></head><body><div id=\"results\"></div></body></html>");
  //reportView.document.getElementById("results").innerHTML = startXmlText;

  var table = reportView.document.createElement("table");
  table.style.border = '1em solid #59323C';
  
  var header = table.createTHead();
  var headerRow = header.insertRow(0);
  var c1 = headerRow.insertCell(0);
  c1.innerHTML = "<b>Level</b>";
  var c2 = headerRow.insertCell(1);
  c2.innerHTML = "<b>Time Stamp</b>";
  var c3 = headerRow.insertCell(2);
  c3.innerHTML = "<b>Semantic Interaction</b>";
  var c4 = headerRow.insertCell(3);
  c4.innerHTML = "<b>Workspace State</b>";
  
  headerRow.style.backgroundColor = "260126";
  headerRow.style.color = "F2EEB3";


  var tableBody = reportView.document.createElement("tbody");
  table.appendChild(tableBody);
  reportView.document.body.appendChild(table);

  

  for(var i = 1; i < currentIndex; i++) {
    var row = reportView.document.createElement("tr");
    var index = "timestamp"+i.toString();
    var rec = localStorage.getItem(index);
    console.log(rec.toString());

    if(i%2==0){
      row.style.backgroundColor = "998C66";
      row.style.color = "FEFEF8";
    }
    else
    {
      row.style.backgroundColor = "8C6954";
      row.style.color = "FEFEF8";
    }

    var items = rec.split("::");
    if(items.length == 4)
    {
      var levelCell = reportView.document.createElement("td");
      var levelText = reportView.document.createTextNode(items[3].toString());
      levelCell.appendChild(levelText);
      row.appendChild(levelCell);

      var timeCell = reportView.document.createElement("td");
      var cellText = reportView.document.createTextNode(items[0].toString());
      timeCell.appendChild(cellText);
      row.appendChild(timeCell);

      var actionCell = reportView.document.createElement("td");
      cellText = reportView.document.createTextNode(items[1].toString());
      actionCell.appendChild(cellText);
      row.appendChild(actionCell);
      
      var stateCell = reportView.document.createElement("td");
      cellText = reportView.document.createTextNode(items[2].toString());
      stateCell.appendChild(cellText);
      row.appendChild(stateCell);

    }
    if(items.length == 3)
    {
      var levelCell = reportView.document.createElement("td");
      var levelText = reportView.document.createTextNode(items[2].toString());
      levelCell.appendChild(levelText);
      row.appendChild(levelCell);

      var cell = reportView.document.createElement("td");
      var cellText = reportView.document.createTextNode(items[0].toString());
      cell.appendChild(cellText);
      row.appendChild(cell);

      var actionCell = reportView.document.createElement("td");
      cellText = reportView.document.createTextNode(items[1].toString());
      actionCell.appendChild(cellText);
      row.appendChild(actionCell);
      
      var stateCell = reportView.document.createElement("td");
      cellText = reportView.document.createTextNode("NULL");
      stateCell.appendChild(cellText);
      row.appendChild(stateCell);

    }


    tableBody.appendChild(row);

  }

  reportView.document.getElementById("results").appendChild(table);
}


/**
* Export the locally stored results as an HTML table
*/
Pond.exportButtonClick = function() {
  console.log('Exporting locally stored results as an HTML table.');
  resultView = window.open("");
  resultView.document.write("<html><head><title>Measuring Skills, CTL, CSL, VT</title></head><body><div id=\"results\"></div></body></html>");
  //resultView.document.getElementById("results").innerHTML = startXmlText;

  var table = resultView.document.createElement("table");
  var tableBody = resultView.document.createElement("tbody");
  table.appendChild(tableBody);
  resultView.document.body.appendChild(table);

  for(var i = 1; i < currentIndex; i++) {
    var row = resultView.document.createElement("tr");
    var index = "timestamp"+i.toString();
    var rec = localStorage.getItem(index);
    console.log(rec.toString());

    var items = rec.split("::");
    if(items.length == 4)
    {
      var levelCell = resultView.document.createElement("td");
      var levelText = resultView.document.createTextNode(items[3].toString());
      levelCell.appendChild(levelText);
      row.appendChild(levelCell);

      var timeCell = resultView.document.createElement("td");
      var cellText = resultView.document.createTextNode(items[0].toString());
      timeCell.appendChild(cellText);
      row.appendChild(timeCell);

      var actionCell = resultView.document.createElement("td");
      cellText = resultView.document.createTextNode(items[1].toString());
      actionCell.appendChild(cellText);
      row.appendChild(actionCell);
      
      var stateCell = resultView.document.createElement("td");
      cellText = resultView.document.createTextNode(items[2].toString());
      stateCell.appendChild(cellText);
      row.appendChild(stateCell);

    }
    if(items.length == 3)
    {
      var levelCell = resultView.document.createElement("td");
      var levelText = resultView.document.createTextNode(items[2].toString());
      levelCell.appendChild(levelText);
      row.appendChild(levelCell);

      var cell = resultView.document.createElement("td");
      var cellText = resultView.document.createTextNode(items[0].toString());
      cell.appendChild(cellText);
      row.appendChild(cell);

      var actionCell = resultView.document.createElement("td");
      cellText = resultView.document.createTextNode(items[1].toString());
      actionCell.appendChild(cellText);
      row.appendChild(actionCell);
      
      var stateCell = resultView.document.createElement("td");
      cellText = resultView.document.createTextNode("NULL");
      stateCell.appendChild(cellText);
      row.appendChild(stateCell);

    }

    tableBody.appendChild(row);

  }

  resultView.document.getElementById("results").appendChild(table);
}



/**
 * Close the documentation frame.
 */
Pond.docsCloseClick = function() {
  var origin = document.getElementById('docsButton');
  var dialog = document.getElementById('dialogDocs');

  function endResult() {
    var border = document.getElementById('dialogBorder');
    border.style.visibility = 'hidden';
  }
  Pond.isDocsVisible_ = false;
  BlocklyDialogs.matchBorder_(dialog, false, 0.8);
  BlocklyDialogs.matchBorder_(origin, true, 0.2);
  // In 175ms hide the animated border.
  setTimeout(endResult, 175);
  dialog.style.visibility = 'hidden';

  Pond.recordAction("Documentation_Closed");

};

/**
 * Click the run button.  Start the Pond.
 * @param {!Event} e Mouse or touch event.
 */
Pond.runButtonClick = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');
  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  runButton.style.display = 'none';
  resetButton.style.display = 'inline';

  var startXmlDom = Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace());
  var startXmlText = Blockly.Xml.domToText(startXmlDom);

  Pond.recordWorkspaceAction("Run", startXmlText);

  Pond.execute();
};





/**
 * Click the reset button.  Reset the Pond.
 * @param {!Event} e Mouse or touch event.
 */
Pond.resetButtonClick = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  var runButton = document.getElementById('runButton');
  runButton.style.display = 'inline';
  document.getElementById('resetButton').style.display = 'none';

  Pond.recordAction("Reset");

  Pond.reset();
};

Pond.recordAction = function(actionName) {

  var currentTime = new Date();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  var seconds = currentTime.getSeconds();
  var actionType = actionName;

  if (minutes < 10)
  minutes = "0" + minutes;

  console.log("Action: " + actionType.toString()+", Time: " + hours + ":" + minutes + ":" + seconds);

  if(storageSupported)
  {
    try{
    //  workspaceIndex = "workspace"+currentIndex.toString();
      timestampIndex = "timestamp"+currentIndex.toString();
      console.log("Writing " + actionType.toString() + " to local Storage.");
      //localStorage.setItem(workspaceIndex, startXmlText);
      var record = currentTime.toString() + "::" + actionType.toString() + "::" + BlocklyGames.LEVEL.toString();
      localStorage.setItem(timestampIndex, record);
      currentIndex++;
      localStorage.setItem(currentIndexKey,currentIndex);
    }
    catch (e) {
      if(e == 'QUOTA_EXCEEDED_ERR') {
        alert ('Local storage quota exceeded trying to store semantic interactions!');
      }
      else
      {
        alert ('Unknown error occured trying to store semantic interactions!');
      }
    }
  }
  else
  {
    console.log('HTML5 Storage not supported, skipping writig worlspace state.');
  }

}

Pond.recordWorkspaceAction = function(actionName, workspaceXML) {

  var currentTime = new Date();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  var seconds = currentTime.getSeconds();
  var actionType = actionName;
  var xmlString = workspaceXML;

  if (minutes < 10)
  minutes = "0" + minutes;

  console.log("Action: " + actionType.toString()+", Time: " + hours + ":" + minutes + ":" + seconds);

  if(storageSupported)
  {
    try{
    //  workspaceIndex = "workspace"+currentIndex.toString();
      timestampIndex = "timestamp"+currentIndex.toString();
      console.log("Writing " + actionType.toString() + " to local Storage.");
      //localStorage.setItem(workspaceIndex, startXmlText);
      var record = currentTime.toString() + "::" + actionType.toString() + "::" + xmlString + "::" + BlocklyGames.LEVEL.toString();
      localStorage.setItem(timestampIndex, record);
      currentIndex++;
      localStorage.setItem(currentIndexKey,currentIndex);
    }
    catch (e) {
      if(e == 'QUOTA_EXCEEDED_ERR') {
        alert ('Local storage quota exceeded trying to store semantic interactions!');
      }
      else
      {
        alert ('Unknown error occured trying to store semantic interactions!');
      }
    }
  }
  else
  {
    console.log('HTML5 Storage not supported, skipping writig worlspace state.');
  }

}

/**
 * Execute the users' code.  Heaven help us...
 */
Pond.execute = function() {
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(Pond.execute, 250);
    return;
  }
  Pond.reset();

  Pond.Battle.start(Pond.endBattle);
  Pond.Visualization.start();
};

/**
 * Reset the pond and kill any pending tasks.
 */
Pond.reset = function() {
  Pond.Battle.reset();
  Pond.Visualization.reset();
};

/**
 * Show the help pop-up.
 */
Pond.showHelp = function() {
  var help = document.getElementById('help');
  var button = document.getElementById('helpButton');
  var style = {
    width: '50%',
    left: '25%',
    top: '5em'
  };

  //console.log("Show Help called by -> "+ Pond.showHelp.caller.toString());
  var d = new Date();
  console.log("Time stamp: " + d.toJSON().toString())
  Pond.recordAction("Help");

  BlocklyDialogs.showDialog(help, button, true, true, style,
      BlocklyDialogs.stopDialogKeyDown);
  BlocklyDialogs.startDialogKeyDown();
};
