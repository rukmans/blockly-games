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


};

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
  localStorage.clear();
  console.log('local storage cleared!');
  currentIndex = 1;
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
    if(items.length == 3)
    {
      var cell = resultView.document.createElement("td");
      var cellText = resultView.document.createTextNode(items[0].toString());
      cell.appendChild(cellText);
      row.appendChild(cell);
      var actionCell = resultView.document.createElement("td");
      cellText = resultView.document.createTextNode(items[1].toString());
      actionCell.appendChild(cellText);
      row.appendChild(actionCell);
      var stateCell = resultView.document.createElement("td");
      cellText = resultView.document.createTextNode(items[2].toString());
      stateCell.appendChild(cellText);
      row.appendChild(stateCell);

    }
    if(items.length == 2)
    {
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

  var currentTime = new Date();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  var seconds = currentTime.getSeconds();

  if (minutes < 10)
  minutes = "0" + minutes;

  console.log("Action: Documentation Closed, Time: " + hours + ":" + minutes + ":" + seconds);

  if(storageSupported)
  {
    try{
    //  workspaceIndex = "workspace"+currentIndex.toString();
      timestampIndex = "timestamp"+currentIndex.toString();
      console.log("Writing Documentation Opened to local Storage.");
      //localStorage.setItem(workspaceIndex, startXmlText);
      var record = currentTime.toString() + "::" + "Documentation";
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

  var currentTime = new Date();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  var seconds = currentTime.getSeconds();

  if (minutes < 10)
  minutes = "0" + minutes;

  if(firstRun)
  {


    console.log("Action: Run Button Pressed, Time: " + hours + ":" + minutes + ":" + seconds);
    console.log("Timestamp: " + currentTime.toString());
    var startXmlDom = Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace());
    var startXmlText = Blockly.Xml.domToText(startXmlDom);

/*
    resultView = window.open("");
    resultView.document.write("<html><head><title>Measuring Skills</title></head><body><div id=\"results\">Testing</div></body></html>");

    resultView.document.getElementById("results").innerHTML = startXmlText;
*/
    console.log(startXmlText);
    
    firstRun = false;
  }
  else
  {
    console.log("--------------------------------------------");
    var startXmlDom = Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace());
    var startXmlText = Blockly.Xml.domToText(startXmlDom);
    
    /*resultView.document.getElementById("results").innerHTML = startXmlText;
    console.log(resultView.document.getElementById("results").innerHTML);
    */
  }

  

  if(storageSupported)
  {
    try{
    //  workspaceIndex = "workspace"+currentIndex.toString();
      timestampIndex = "timestamp"+currentIndex.toString();
      console.log("Writing workspace state to local storage.");
      //localStorage.setItem(workspaceIndex, startXmlText);
      var record = currentTime.toString() + "::" + "Run" +"::" + startXmlText;
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

  var currentTime = new Date();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  var seconds = currentTime.getSeconds();

  if (minutes < 10)
  minutes = "0" + minutes;

  console.log("Action: Reset Button Pressed, Time: " + hours + ":" + minutes + ":" + seconds);

  if(storageSupported)
  {
    try{
    //  workspaceIndex = "workspace"+currentIndex.toString();
      timestampIndex = "timestamp"+currentIndex.toString();
      console.log("Writing Documentation Opened to local Storage.");
      //localStorage.setItem(workspaceIndex, startXmlText);
      var record = currentTime.toString() + "::" + "Reset";
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

  Pond.reset();
};

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
  BlocklyDialogs.showDialog(help, button, true, true, style,
      BlocklyDialogs.stopDialogKeyDown);
  BlocklyDialogs.startDialogKeyDown();
};
