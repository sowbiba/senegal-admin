;(function($) {

/**
  * class NodeController
  *
  */

var NodeController = function (config, presentation, nodeEditorController) {
  this._init (config, presentation, nodeEditorController);
}

/**
 * _init sets all NodeController attributes to their default value. Make sure to
 * call this method within your class constructor
 */
NodeController.prototype._init = function (config, presentation, nodeEditorController) {
  this.presentation         = presentation; // NodePresentation()
  this.abstraction          = new CC.NodeAbstraction(config, this); // NodeAbstraction()
  this.nodeEditorController = nodeEditorController;
  var oParentPresentation   = CC.NodeCollection.getById(config.parentId);
  this.parentNode           = oParentPresentation != null ? oParentPresentation.controller : null;
}

/**
 * _delete remove all reference between presentation, controller, abstraction
 */
NodeController.prototype._delete = function (config, presentation, nodeEditorController) {
  delete(this.presentation.controller);
  delete(this.abstraction.controller);
  delete(this.presentation);
  delete(this.abstraction);
  delete(this.nodeEditorController);
  delete(this.parentNode);
}


/********************* GETTERS ************************/

/**
 *
 */
NodeController.prototype.getConfig = function () {
  return this.abstraction.getConfig();
}

/**
 *
 */
NodeController.prototype.getConfigItem = function (itemName) {
  return this.abstraction.getConfigItem(itemName);
}

/**
 *
 */
NodeController.prototype.getId = function () {
  return this.abstraction.getId();
}

/**
 * 
 */
NodeController.prototype.getPosition = function () {
  return this.abstraction.getPosition();
}

/**
 *
 */
NodeController.prototype.getType = function () {
  return this.abstraction.getType();
}

/**
 *
 */
NodeController.prototype.getParentNode = function () {
  return this.parentNode;
}

/********************* SETTERS ************************/

/** 
 * @param config    
 */
NodeController.prototype.updateConfig = function (config) {
  CC.Logger.info('Update config for node #' + this.getId() + ' => ' + config);
  this.abstraction.setConfig(config);
}

/**
 *
 * @param parent
 *
 */
NodeController.prototype.setParentNode = function (parent) {
  if(typeof(parent) == "undefined") {
    parent = null;
  }
  if(parent == null) {
    throw new Error("Can not assign a parent to null");
  }
  this.parentNode = parent;
  
  this.setParentId(this.parentNode.getId());
}


/**
 *
 * @param parentId
 *
 */
NodeController.prototype.setParentId = function (parentId) {
  this.abstraction.setParentId(parentId);
}

/**
 *
 * @param position
 *
 */
NodeController.prototype.setPosition = function (position) {
  this.abstraction.setPosition(position);
}

/**
 * @param type
 */
NodeController.prototype.setType = function (type) {
  this.abstraction.setType(type);
}

/**
 *
 */
NodeController.prototype.updateNodeControllerType = function () {
  this.nodeEditorController = CC.NodeEditorCollection.get(this.getConfig())
}

/********************* ACTIONS ************************/

/**
 *
 * @param htmlFragment
 *
 * @param position
 *
 */
NodeController.prototype.addChild = function (htmlFragment, position) {
  if(typeof(position) == "undefined") {
    position = 0;
  }

  var $htmlFragment = $(htmlFragment);

  // if no data config in the fragment, when adding a node => reuse the previously added config cleaned up
  if(typeof($htmlFragment.attr('data-config')) == 'undefined') {
    var previousAddedDataConfig = $htmlFragment.data('config');
    previousAddedDataConfig.editorConfig.title = '';
    previousAddedDataConfig.editorConfig.id    = '';
    $htmlFragment.data('config', previousAddedDataConfig);
  }

  var oChildPresentation = CC.NodeFactory.build($htmlFragment);
  var oChildController   = oChildPresentation.controller;

  oChildController.setParentNode(this);
  oChildController.setPosition(position);

  oChildController.add();
}

/**
 * call the editor presentation of this node
 */
NodeController.prototype.add = function () {
  this.nodeEditorController.add(this);
}

/**
 * call the editor presentation of this node
 */
NodeController.prototype.edit = function () {
  this.nodeEditorController.edit(this.abstraction.getConfig());
}

/**
 * Load the children of the node
 */
NodeController.prototype.loadChildren = function () {
  if(!this.abstraction.childrenLoaded) {
    CC.Feedback.loading();
    this.abstraction.loadChildren();
  }
}

/**
 * Callback for abstraction.loadChildren() ajax request
 */
NodeController.prototype.loadChildrenCallback = function (ajaxResponse) {
  // If the operation was successfull
  if(this.parseJsonResponse(ajaxResponse)) {

    this.abstraction.childrenLoaded = true;
    var position;
    var oNode;
    var oPresentation;
    // Instantiate each child node
    var aData = ajaxResponse.data;
    for (position in aData){
      oNode         = aData[position];
      oPresentation = CC.NodeCollection.get(oNode.htmlFragment);
      oPresentation.controller.parentNode = this;
      oPresentation.render(oNode.htmlFragment);
    }

    // Check integrity for each child node
    for (position in aData){
      oNode         = aData[position];
      oPresentation = CC.NodeCollection.get(oNode.htmlFragment);
      
      if (!oPresentation.controller.checkDOMIntegrity(oNode.integrity)) {
        CC.Feedback.error("L'intégrité du noeud (DOM) est compromise.");

        return false;
      }
    }

    // Hide the feedback
    CC.Feedback.hide();
    return true;
  }
  // If the submitted field is unknown or is not inL the same 'gamme', replace the default action
  // actions are defined as a class of the link defined in the partial _feedback_templates
  var action = 'reload';
  var message;
  if(typeof(ajaxResponse.action) != 'undefined') {
    action = ajaxResponse.action;
  }
  
  if(typeof(ajaxResponse.message)) {
    message = ajaxResponse.message;
  }

  CC.Feedback.error(message, action);
  
  return false;
}

/**
 * Callback for reload html table
 */
NodeController.prototype.reloadTableCallback = function (htmlTable) {
  //Remove each nodes for table
  $(this.presentation.getDomNode()).find('table:first li.node').each(function() {
    CC.NodeCollection.remove($(this).attr('id'));
  });
  
  $(this.presentation.getDomNode()).children('div.ccNodeTableContainer').find('table').replaceWith(htmlTable);

  //Build each nodes for new table
  CC.Behaviors.initNode(htmlTable);

  //Load all event
  CC.Behaviors.initDroppable($("li.table td.cell"), "li", CC.Behaviors.tableDroppableCallback);
  CC.Behaviors.initDraggable($("#fieldChooser > li, li.table td.cell > ul > li"), '.ccNodeTableContainer');
  
  /*CC.Feedback.loading();
  window.location.reload();*/
  
}

/**
 * add/delete column/row for node table
 */
NodeController.prototype.updateTableElement = function (position, isColumn, isDelete) {
  if (isColumn) {
    if (isDelete) {
      CC.Logger.info('Remove column node #' + this.getId());
      CC.Logger.info(' > Column\'s position ' + position);
    } else {
      CC.Logger.info('Add column node #' + this.getId());
      CC.Logger.info(' > Column\'s position ' + position);
    }
  } else {
    if (isDelete) {
      CC.Logger.info('Remove row node #' + this.getId());
      CC.Logger.info(' > Row\'s position ' + position);
    } else {
      CC.Logger.info('Add row node #' + this.getId());
      CC.Logger.info(' > Row\'s position ' + position);
    }
  }

  CC.Feedback.loading();
  this.abstraction.updateTableElement(position, isColumn, isDelete);
}

/**
 * Callback for abstraction.updateTableElement() ajax request
 */
NodeController.prototype.updateTableElementCallback = function (ajaxResponse, position, isColumn, isDelete) {
  if(typeof(ajaxResponse.code) != 'undefined' && ajaxResponse.code == 0) {
    this.reloadTableCallback(ajaxResponse.data);

    var titleOperationStack = 'id:' + this.getId();
    titleOperationStack     += '/position:' + this.abstraction.getPosition();
    titleOperationStack     += '/parent_id:' + this.abstraction.getParentId();

    var action = (isDelete ? 'Suppression' : 'Ajout');
    var element = (isColumn ? 'column' : 'ligne');
    CC.Feedback.addToOperationStack(action + ' d\'une ' + element + ' en position ' + position, titleOperationStack);

    // Hide the feedback
    CC.Feedback.hide();
  } else {
    // If the submitted field is unknown or is not inL the same 'gamme', replace the default action
    // actions are defined as a class of the link defined in the partial _feedback_templates
    var action = 'reload';
    var message;
    if(typeof(ajaxResponse.action) != 'undefined') {
      action = ajaxResponse.action;
    }

    if(typeof(ajaxResponse.message)) {
      message = ajaxResponse.message;
    }

    CC.Feedback.error(message, action);
  }
}

/**
 * move node
 */
NodeController.prototype.move = function (parent, position) {
  CC.Logger.info('Move node #' + this.getId());
  CC.Logger.info(' > Parent node #' + this.parentNode.getId());
  CC.Logger.info(' > Parent receiver #' + parent.getId());
  CC.Logger.info(' > From position Position node ' + this.getPosition() + ' to  #' + position);

  if(parent == this.parentNode && this.abstraction.getPosition() == position) {
    return;
  }
  CC.Feedback.loading();
  this.setParentNode(parent);
  this.abstraction.setConfigItem('parentId', parent.abstraction.getId());
  this.setPosition(position);
  this.abstraction.move();
}


/**
 * Callback for abstraction.move() ajax request
 */
NodeController.prototype.moveCallback = function (ajaxResponse) {
  // If the operation was successfull
  if(this.parseJsonResponse(ajaxResponse)) {
    var aData = ajaxResponse.data;
   
    // Check integrity for each child node
    for (var position in aData){
      var oNode         = aData[position];
      var oPresentation = CC.NodeCollection.get(oNode.htmlFragment);
      
      if (!oPresentation.controller.checkDOMIntegrity(oNode.integrity)) {
        CC.Feedback.error("L'intégrité du noeud est compromise.");

        return;
      }
    }


    // Hide the feedback
    CC.Feedback.hide();
    var titleOperationStack = 'id:' + this.getId();
    titleOperationStack     += '/position:' + this.abstraction.getPosition();
    titleOperationStack     += '/parent_id:' + this.abstraction.getParentId();
    
    CC.Feedback.addToOperationStack('Déplacement du noeud "' + this.getConfigItem('editorConfig').title + '"', titleOperationStack);
    return;
  }

  var message;
  if(typeof(ajaxResponse.message)) {
    message = ajaxResponse.message;
  }

  CC.Feedback.error(message);
}

/**
 *
 */
NodeController.prototype.remove = function () {
  this.parentNode.removeChild(this);
  this.presentation.remove();
}

/**
 * 
 */
NodeController.prototype.removeChild = function (childNodeController) {
  CC.Feedback.loading();
  this.abstraction.removeChild(childNodeController);
}

/**
 * Callback for abstraction.removeChild() ajax request
 */
NodeController.prototype.removeChildCallback = function (ajaxResponse) {
  // If the operation was successfull
  if(this.parseJsonResponse(ajaxResponse)) {

    // remove descendant nodes
    var oDeletedDescendants = ajaxResponse.deletedDescendants;
    for (var key in oDeletedDescendants){
      oPresentation = CC.NodeCollection.remove('node_' + DeletedDescendants[key]);
    }

    this.abstraction.childrenLoaded = false;
    this.loadChildrenCallback(ajaxResponse);

    return;
  }

  var message;
  if(typeof(ajaxResponse.message)) {
  	message = ajaxResponse.message;
  }
  CC.Feedback.error(message);
}

/**
 * Saves the node config
 */
NodeController.prototype.create = function(oData) {
  // Set new editorConfig for abstraction and save this node
  CC.Feedback.loading();
  this.abstraction.setEditorConfig(oData);
  this.abstraction.create(oData);
}

/**
 * Callback for abstraction.save() ajax request
 */
NodeController.prototype.createCallback = function (ajaxResponse) {
  if(this.getParentNode().loadChildrenCallback(ajaxResponse)) {
    // Hide the editorIntegrity if evertythign went fine
    this.nodeEditorController.hide();
    CC.Feedback.addToOperationStack('Création du noeud "' + this.getConfigItem('editorConfig').title + '"', 'id:' + this.getId());
  }
}

/**
 * Saves the node config
 */
NodeController.prototype.replace = function(type, oData) {
  // Set new editorConfig for abstraction and save this node
  this.setType(type);
  this.abstraction.setEditorConfig(oData);
  this.abstraction.save();
}

/**
 * Saves the node config
 */
NodeController.prototype.save = function(oData) {
  // Set new editorConfig for abstraction and save this node
  this.abstraction.setEditorConfig(oData);
  this.abstraction.save();
}

/**
 * Callback for abstraction.save() ajax request
 */
NodeController.prototype.saveCallback = function (ajaxResponse) {
  // If the operation was successfull
  if(this.parseJsonResponse(ajaxResponse)) {
    var controller = this;
    $.each(ajaxResponse.data, function(key,value){
      
      var htmlFragment = value["htmlFragment"];
      var integrity    = value["integrity"];
      // Set current config
      controller.updateConfig($(htmlFragment).data('config'));

      // Set presentation render
      controller.presentation.render(htmlFragment);

      // Hide the feedback
      CC.Feedback.hide();

      // Hide the editorIntegrity is OK
      CC.NodeEditorCollection.get(controller.getConfig()).hide();
      //controller.nodeEditorController.hide();

      // Check integrity
      if (!controller.checkDOMIntegrity(integrity)) {
        CC.Feedback.error("L'intégrité du noeud (DOM) est compromise.");
      } else {
        CC.Feedback.addToOperationStack('Modification du noeud "' + controller.getConfigItem('editorConfig').title +'"', 'id:' + controller.getId());
      }

    });
    return;
  } else {
    var dataKey = (this.parentNode != null ? this.parentNode.getId() : 'root') + '_' + this.getPosition();
    if(typeof(ajaxResponse.data[dataKey]) != 'undefined') {
      this.updateConfig($(ajaxResponse.data[dataKey].htmlFragment).data('config'));
    }
  }
  // If the submitted field is unknown or is not inL the same 'gamme', replace the default action
  // actions are defined as a class of the link defined in the partial _feedback_templates
  var action = 'reload';
  var message;
  if(typeof(ajaxResponse.action) != 'undefined') {
    action = ajaxResponse.action;
  }
  
  if(typeof(ajaxResponse.message)) {
    message = ajaxResponse.message;
  }

  CC.Feedback.error(message, action);
}

NodeController.prototype.switchWithNode = function (secondNode) {
  CC.Feedback.loading();

  // update JS objects config
  var previousPosition = this.getPosition();
  
  this.setPosition(secondNode.getPosition());
  secondNode.setPosition(previousPosition);
  
  // AJAX call, sending 
  this.abstraction.switchNodes(this.getId(), secondNode.getId());
}

NodeController.prototype.replaceByNew = function (htmlOrConfig, doEdit) {
  var config = undefined;
  if(htmlOrConfig.editorConfig) { // this is a config
    config = htmlOrConfig;
  } else { // this is a html fragment
    var $htmlFragment = $(htmlOrConfig);

    // if no data config in the fragment, when adding a node => reuse the previously added config cleaned up
    // ( => htmlFragment object can have a data('config') defined but no attr('data-config'), meaning the is from a previous parsing of a similar fragment ... )
    if(typeof($htmlFragment.attr('data-config')) == 'undefined') {
      var previousAddedDataConfig = $htmlFragment.data('config');
      previousAddedDataConfig.editorConfig.title = 'vide';
      previousAddedDataConfig.editorConfig.id    = '';
      $htmlFragment.data('config', previousAddedDataConfig);
    }

    var oNewNodePresentation = CC.NodeFactory.build($htmlFragment);
    var oNewNodeController   = oNewNodePresentation.controller;

    oNewNodeController.setParentNode(this.getParentNode());

    config = oNewNodeController.getConfig();
  }

  if(doEdit) {// Add new node in table cell
    // open editor => the submit callback will handle the new config
    oNewNodeController.nodeEditorController.createAndReplace(this, config);
  } else { // Delete cell ( replace by a new static cell )
    CC.Feedback.loading();
    // just replace by the given config
    this.replace(config.type, config.editorConfig);
  }
}

/********************* TOOLS ************************/

/**
 * Check DOM integrity
 */
NodeController.prototype.checkDOMIntegrity = function (integrity) {
  CC.Logger.info('Check DOM integrity for node #' + this.getId());
  var bIntegrity = true;
  
  // do not check dom integrity for a table node in table editor mode
  if(CC.isTableEditor() && this.getType() == 'table') {
    return true;
  }

  //check integrity for this node with the neighbor nodes
  if (!this.checkDOMIntegrityNode(integrity.parentNode, "parent")) {
    bIntegrity = false;
  } else if (!this.checkDOMIntegrityNode(integrity.leftNode, "left")) {
    bIntegrity = false;
    CC.Logger.error('DOM integrity Left (' + integrity.leftNode + ') false #' + this.getId());
  } else if (!this.checkDOMIntegrityNode(integrity.rightNode, "right")) {
    bIntegrity = false;
    CC.Logger.error('DOM integrity Right (' + integrity.rightNode + ') false #' + this.getId());
  }

  // Check consistency on the position node
  var iPosition = this.presentation.getDOMPosition();
  if (bIntegrity && integrity.position != iPosition) {
    bIntegrity = false;
    CC.Logger.error('DOM integrity Position (' + integrity.position + ' != ' + iPosition + ') false #' + this.getId());
  }

  // Check consistency on the number of children
  var nbChildren = this.presentation.getDOMChildrenCount();
  if (bIntegrity && this.abstraction.childrenLoaded && integrity.nbChildren != nbChildren) {
    bIntegrity = false;
    CC.Logger.error('DOM integrity number of children (' + integrity.nbChildren + ' != ' + nbChildren + ') false #' + this.getId());
  }

  // Check level of node
  var level = this.presentation.getDOMLevel();
  if (bIntegrity && integrity.level != level) {
    bIntegrity = false;
    CC.Logger.error('DOM integrity level (' + integrity.level + ' != ' + level + ') false #' + this.getId());
  }
  
  
  if (!bIntegrity) {
    CC.Logger.info('DOM integrity is compromised');
  } else {
    CC.Logger.info('DOM integrity is OK');
  }
  return bIntegrity;
}

/**
 * Check object integrity
 */
NodeController.prototype.checkObjectIntegrity = function (data) {
  CC.Logger.info('Object integrity - Check for node #' + this.getId());
  var integrity  = data.integrity;
  var bIntegrity = true;
  var parentId   = this.abstraction.getParentId();
  
  // some nodes objects do not have to be checked as their change is a consequence of what has been posted, and not the posted data
  if(integrity.checkAgainsObject === false) {
    return true;
  }

  // Translate parentId to int
  if (typeof(parentId)=='string') {
    parentId = parseInt(parentId.replace("node_", ""));
  }

  // Check integrity for this node with the parent node
  if (integrity.parentNode != parentId) {
    //Integrity contains errors :
    // -- this parent node doesn't correspond to that returned by server
    CC.Logger.error('Object integrity - check failed - object.parentId : |' + parentId + '| - server integrity : |' + integrity.parentNode + '| for node #' + this.getId());
    bIntegrity = false;
  }

  // Check consistency on the position node
  if (bIntegrity && integrity.position != this.abstraction.getConfigItem("position")) {
    CC.Logger.error('Object integrity - check failed - object.position : |' + this.abstraction.getConfigItem("position") + '| - server integrity : |' + integrity.position + '| for node #' + this.getId());
    bIntegrity = false;
  }

  // check if returned editor config data from server is the same than the posted editor config data
  var responseConfig = $(data.htmlFragment).data('config');

  if(!this.abstraction.equalsConfig(responseConfig)) {
    bIntegrity = false;
  }

  if (!bIntegrity) {
    CC.Logger.info('Object integrity is compromised');
  } else {
    CC.Logger.info('Object integrity is OK');
  }

  return bIntegrity;
}

/**
 * Check all integrity between this node and (node's parent, node's left or node's right)
 */
NodeController.prototype.checkDOMIntegrityNode = function (integrityNodeId, nodePosition) {
  // Check consistency on the type (=parent|left|right) node
  var nodeId = null;

  if (nodePosition == "parent") {
    nodeId = this.presentation.getDOMParentId();
  } else if (nodePosition == "left") {
    nodeId = this.presentation.getDOMLeftSiblingId();
  } else if (nodePosition == "right") {
    nodeId = this.presentation.getDOMRightSiblingId();
  }

  if ((typeof nodeId) != "undefined") { // This node has a type (=parent|left|right) node in the DOM
    var presentation = CC.NodeCollection.getById(nodeId);

    if (integrityNodeId != presentation.controller.getId()) {
      //Integrity contains errors :
      // -- either the server replied that the node hasn't a type (=parent|left|right) node
      // -- either the waiter replied that the node has a type (=parent|left|right) node, but the node doesn't correspond to that present in the dom
      CC.Logger.error('DOM node integrity - check failed - dom.' + nodePosition + ': |' + nodeId + '| - server returned : |' + integrityNodeId + '| for node #' + this.getId());
      return false;
    }

  } else if (integrityNodeId != null) {
    //Integrity contains errors :
    // -- the server replied that the node has a type (=parent|left|right) node, unlike DOM who we answered that does the node hasn't a type (=parent|left|right) node
    CC.Logger.error('DOM node integrity - check failed - dom.' + nodePosition + ': |' + nodeId + '| - server returned : |' + integrityNodeId + '| for node #' + this.getId());
    return false;
  }

  return true;
}

/**
 * Determines if an ajax operation was successfull or not
 */
NodeController.prototype.parseJsonResponse = function (ajaxResponse) {
  if(typeof(ajaxResponse.code) != 'undefined' && ajaxResponse.code == 0) {
    $.each(ajaxResponse.data, function(position, data){
      if (data) {
        // Check integrity
        var oController = CC.NodeCollection.get(data['htmlFragment']).controller;
        if (!oController.checkObjectIntegrity(data)) {
          CC.Feedback.error("L'intégrité du noeud (Object) est compromise.");
          throw new Error("L'intégrité du noeud (Object) est compromise.");
        }
      }
    });
    return true;
  }

  return false;
}

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.NodeController = NodeController;

}) (jQuery);
