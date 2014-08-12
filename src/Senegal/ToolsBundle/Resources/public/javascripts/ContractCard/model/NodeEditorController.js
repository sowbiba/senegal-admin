;(function($) {

/**
  * class NodeEditorController
  *
  */

var NodeEditorController = function () {
  this._init ();
}


/**
 * _init sets all NodeEditorController attributes to their default value. Make sure
 * to call this method within your class constructor
 */
NodeEditorController.prototype._init = function () {
  this.currentEditorPresentation = null;
  this.nodeController            = undefined;
}

/**
 * To add a new node
 */
NodeEditorController.prototype.add = function (newNodeController) {
  this.submitCallback            = this.addSubmitCallback;
  this.currentEditorPresentation = CC.NodeEditorCollection.get(newNodeController.getConfig());
  this.nodeController            = newNodeController;
  this.currentEditorPresentation.setNodeEditorController(this);
  this.currentEditorPresentation.add(newNodeController.getConfig());
}

/**
 * To replace an existing node by a new one
 */
NodeEditorController.prototype.createAndReplace = function (oldNodeController, config) {
  this.submitCallback            = this.createAndReplaceSubmitCallback;
  this.currentEditorPresentation = CC.NodeEditorCollection.get(config);
  this.nodeController            = oldNodeController;
  this.currentEditorPresentation.setNodeEditorController(this);
  this.currentEditorPresentation.add(oldNodeController.getConfig());
}

/**
 * To edit a node
 */
NodeEditorController.prototype.edit = function (currentConfig) {
  this.submitCallback            = this.editSubmitCallback;
  this.currentEditorPresentation = CC.NodeEditorCollection.get(currentConfig);
  this.nodeController            = undefined;
  this.currentEditorPresentation.setNodeEditorController(this);
  this.currentEditorPresentation.edit(currentConfig);
}

/**
 * To hide the current editor presentation
 */
NodeEditorController.prototype.hide = function () {
  this.submitCallback = null;
  if(this.currentEditorPresentation) {
    this.currentEditorPresentation.hide();
    this.currentEditorPresentation = null;
  }
}

/**
 * Submit handler for the editor forms
 */
NodeEditorController.prototype.submitHandler = function ($oForm) {
  // Init overlay
  CC.Feedback.loading();

  //Load data submit
  var aData = $oForm.serializeArray();
  var oData = {};
  $(aData).each(function(index, object) {
    // If the posted param is an array
    // @note: this only works for linear arrays (i.e. : usage[] )
    if(object.name.substr(object.name.length - 2, 2) == '[]') {

      var sParamName = object.name.replace('[]', '');

      if(typeof(oData[sParamName]) == 'undefined') {
        oData[sParamName] = [];
      }
      oData[sParamName].push(object.value);
    } else {
      oData[object.name] = object.value;
    }
  });

  if(typeof(oData.extraConfigNames) != 'undefined' && oData.extraConfigNames.length && typeof(oData.extraConfigValues) != 'undefined' &&  oData.extraConfigValues.length) {
    var names = oData.extraConfigNames;
    var values = oData.extraConfigValues;
    for (var index in names) {
      if(!oData[names[index]]) {
        oData[names[index]] = values[index];
      }
    }
    oData.extraConfigNames  = undefined;
    oData.extraConfigValues = undefined;
  }
  this.submitCallback(oData);
}


NodeEditorController.prototype.editSubmitCallback = function(oData) { // edit mode
  CC.Logger.debug('Submit Editor > Editor mode');
  // Retrieve presentation by node_id (to retrieve its controller actually)
  var presentation    = CC.NodeCollection.getById("node_" + oData["node_id"]);

  // Delete param node_id
  delete oData["node_id"];

  // Call the save action on node controller with user typed data
  presentation.controller.save(oData);
}

NodeEditorController.prototype.addSubmitCallback = function(oData) {
  CC.Logger.debug('Submit Editor > Create new node mode');
  // Call the create action on node controller with user typed data
  this.nodeController.create(oData);
}

NodeEditorController.prototype.createAndReplaceSubmitCallback = function(oData) {
  CC.Logger.debug('Submit Editor > Create new node mode for table');
  if(CC.isTableEditor()) {
    
    oData["node_id"] = this.nodeController.getId();
    
    // replace old node by using data posted in the form
    this.nodeController.replace(this.currentEditorPresentation.getType(), oData);
    // update node for a futur edition
    this.edit(this.nodeController.getConfig());
  } else {
    CC.Logger.error("createAndReplace available in table editor only");
  }
}

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.NodeEditorController = NodeEditorController;

}) (jQuery);
