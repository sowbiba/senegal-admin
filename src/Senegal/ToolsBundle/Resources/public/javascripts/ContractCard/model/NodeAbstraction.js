;(function($) {

/**
  * class NodeAbstraction
  * 
  */

var NodeAbstraction = function (config, controller) {
  this._init (config, controller);
}


/**
 * _init sets all NodeAbstraction attributes to their default value. Make sure to
 * call this method within your class constructor
 */
NodeAbstraction.prototype._init = function (config, controller) {
  this.config         = config;
  this.childrenLoaded = false;
  this.controller     = controller;
  this.typeHasChanged = false;
  CC.Logger.info('Building node #' + this.getId());
}

/**
 * @param config  
 */
NodeAbstraction.prototype.setConfig = function (config) {
  if(config.type != this.config.type) { // no check if the attribute exists as raising an error in such a case would be a good thing
    // set a new type will force refreshing the li classes when rendering (because icon has to be changed...)
    this.setType(config.type)
  }
  this.config = config;
}


/**
 * @param type    
 */
NodeAbstraction.prototype.setType = function (type) {
  if(type != this.getType()) {
    this.typeHasChanged = true;
    this.setConfigItem('type', type);
  }
}


/**
 * 
 */
NodeAbstraction.prototype.getType = function () {
  return this.getConfigItem('type');
}


/**
 * 
 */
NodeAbstraction.prototype.getConfig = function () {
  return this.config;
}

/**
 * @param editorConfig    
 */
NodeAbstraction.prototype.setEditorConfig = function (editorConfig) {
  if(typeof(editorConfig) == "undefined") {
    editorConfig = null;
  }
  if(editorConfig == null) {
    throw new Error("Can not assign a editorConfig to null");
  }
  this.setConfigItem('editorConfig', editorConfig);
}

/**
 * @param parentId    
 */
NodeAbstraction.prototype.setParentId = function (parentId) {
  if(typeof(parentId) == "undefined") {
    parentId = null;
  }
  if(parentId == null) {
    throw new Error("Can not assign a parentId to null");
  }
  this.setConfigItem('parentId', parentId);
}


/** 
 * @param position    
 */
NodeAbstraction.prototype.setPosition = function (position) {
  if(typeof(position) == "undefined") {
    position = 0;
  }
  this.setConfigItem('position', position)
}

/** 
 * Compare the current config content with the given one
 *
 * @param otherConfig
 */
NodeAbstraction.prototype.equalsConfig = function (otherConfig) {
  return CC.areEquals(this.getConfig(), otherConfig);
}

/**
 * AJAX request to create a node
 */
NodeAbstraction.prototype.create = function () {

  var abstraction  = this;
  CC.Logger.info('AJAX - Create new node'); 
  
  var data = this.config;
  data.contractCardId = CC.getContractCardId();

  // Do request for save this node with new config
  $.post(CC.Urls.createnode,
            data,
            function (results) {abstraction.controller.createCallback(results);});
}

/**
 * AJAX request to save the config of a node
 */
NodeAbstraction.prototype.save = function () {

  var abstraction  = this;
  CC.Logger.info('Update node #' + this.getId()); 
  // Do request for save this node with new config
  var url = null;

  if(this.typeHasChanged) { // type changed => table editor - drop new node
    url = CC.Urls.replacenode;
    this.controller.updateNodeControllerType();
  } else {
    url = CC.Urls.savenodeconfig;
  }

  $.get(url,
            this.config,
            function(results) {abstraction.controller.saveCallback(results);});
}

/**
 * AJAX request to add/delete column/row of a node
 */
NodeAbstraction.prototype.updateTableElement = function (position, isColumn, isDelete) {
  var url         = null;
  var abstraction = this;

  if (isColumn) {
    if (isDelete) {
      url = CC.Urls.deleteColumnToTable;
      CC.Logger.info('Update node #' + this.getId() + ' due to its delete column');
    } else {
      url = CC.Urls.addColumnToTable;
      CC.Logger.info('Update node #' + this.getId() + ' due to its added column');
    }
  } else {
    if (isDelete) {
      url = CC.Urls.deleteRowToTable;
      CC.Logger.info('Update node #' + this.getId() + ' due to its deleted row');
    } else {
      url = CC.Urls.addRowToTable;
      CC.Logger.info('Update node #' + this.getId() + ' due to its added row');
    }

  }

  // Do request for save this movement of node
  $.post(url,
        {id: this.getId(), position: position},
        function(results) {abstraction.controller.updateTableElementCallback(results, position, isColumn, isDelete);}
  );
}

/**
 * AJAX request to save movement of a node
 */
NodeAbstraction.prototype.move = function () {

  var abstraction  = this;
  CC.Logger.info('Update node #' + this.getId() + ' due to its movement');
  // Do request for save this movement of node
  $.post(CC.Urls.movenode,
            this.config,
            function(results) {abstraction.controller.moveCallback(results);}
        );
}

/**
 * AJAX request to save movement of a node
 */
NodeAbstraction.prototype.switchNodes = function (firstNodeId, secondNodeId) {

  var abstraction  = this;
  CC.Logger.info('Switch nodes #' + firstNodeId + ' and ' + secondNodeId);
  // Do request for save this movement of node
  $.post(CC.Urls.switchnodes,
            {firstNodeId: firstNodeId, secondNodeId: secondNodeId},
            function(results) {abstraction.controller.moveCallback(results);}
        );
}


/**
 * AJAX request to load the children of a node
 */
NodeAbstraction.prototype.loadChildren = function () {

  var abstraction = this;
  CC.Logger.info('Loading children node #' + this.getId());
  $.post(CC.Urls.loadnodechildren,
            this.config,
            function(result){abstraction.controller.loadChildrenCallback(result);});
  
}

/**
 * AJAX request to remove a node
 */
NodeAbstraction.prototype.removeChild = function (childNodeController) {

  var abstraction  = this;
  CC.Logger.info('Remove child node #' + childNodeController.getId() + ' in parent node #' + this.getId()); 
  // Do request for remove node and his descendant
  $.post(CC.Urls.removenode,
            childNodeController.getConfig(),
            function(results) {abstraction.controller.removeChildCallback(results);});
}

/**
 * return a config item 
 * @param itemName
 * @throw error if item does not exist of config can be loaded     
 */
NodeAbstraction.prototype.getConfigItem = function (itemName) {
  if ($.isEmptyObject(this.config)) {
    throw new Error('No config loaded');
  }
  if (typeof(this.config[itemName]) == "undefined") {
    throw new Error("The property "+ itemName +" does not exist");
  }
  return this.config[itemName];
}

/**
 * 
 */
NodeAbstraction.prototype.getId = function () {
  return this.getConfigItem("id");
}

/**
 *
 */
NodeAbstraction.prototype.getParentId = function () {
  return this.getConfigItem("parentId");
}

/**
 * 
 */
NodeAbstraction.prototype.getPosition = function () {
  return this.getConfigItem("position");
}

/**
 * 
 */
NodeAbstraction.prototype.getEditorConfig = function () {
  return this.getConfigItem("editorConfig");
}

/**
 * 
 * @param itemName
 *      
 * @param itemValue
 *      
 */
NodeAbstraction.prototype.setConfigItem = function (itemName, itemValue) {
  if (typeof(this.config[itemName]) != "undefined") {
    this.config[itemName] = itemValue;
  }
}


// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.NodeAbstraction = NodeAbstraction;

}) (jQuery);