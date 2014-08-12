;(function($) {

/**
  * class NodePresentation
  * 
  */

var NodePresentation = function (htmlFragment, nodeEditorController) {
  this._init (htmlFragment, nodeEditorController);
}

/**
 * _init sets all NodePresentation attributes to their default value. Make sure to
 * call this method within your class constructor
 */
NodePresentation.prototype._init = function (htmlFragment, nodeEditorController) {
  this.controller = new CC.NodeController($(htmlFragment).data('config'), this, nodeEditorController);
  this.domNode    = null;
  this.setDomNode(htmlFragment);
  this.isInDom    = false;
  this.expanded   = false;
}

/**
 * 
 * @param $htmlFragment jqueryObject 
 * 
 */
NodePresentation.prototype.render = function ($htmlFragment) {
  var nodeId   = this.controller.getId();
  
  if(!this.isInDom){ // add node in dom
    CC.Logger.info('Add node #' + nodeId + ' to DOM');

    if(this.controller.getPosition() == 0) {
      this.getParent().domNode.children('ul').prepend(this.domNode);
    } else {
      this.getParent().domNode.children('ul').append(this.domNode);
    }

    this.isInDom = true;
  } else {
    //refresh current title div by new title div
    CC.Logger.info('Refresh node #' + nodeId);
    var divTitle = $($htmlFragment).find(' > div.title');
    $('#' + this.getDomId()).find('> div.title').replaceWith(divTitle);

    var previousClasses = $('#' + this.getDomId()).attr('class');
    var currentClasses  = $($htmlFragment).attr('class');

    // possibly, the node has changed type (case of new node in table editor) => update li classes
    if(previousClasses != currentClasses) {
      $('#' + this.getDomId()).removeClass().addClass(currentClasses);
    }
  }
  
  // init behaviors for node
  var allowChildren = this.domNode.hasClass('allowChildren') && this.controller.getType() != 'table';
  if(allowChildren) {
    CC.Logger.info('Children allowed for node #' + nodeId);
    // force presentation expanded status
    this.expanded ? this.expand(false) : this.collapse(false);
    if(this.domNode.hasClass('allowChildren')) {
      CC.Behaviors.initDroppable($('#node_' + nodeId).find(' > div.title'));
    }    
  }
}

/**
 * 
 * @param $htmlFragment jqueryObject 
 * 
 */
NodePresentation.prototype.remove = function () {
  this.domNode.remove();
}

/**
 * Allows to expand the current node
 */
NodePresentation.prototype.expand = function (withFeedback) {
  if(typeof(withFeedback) == 'undefined') {
    withFeedback = true;
  }
  CC.Logger.info('Expand node #' + this.controller.getId());
  this.expanded = true;
  
  // Select the toggle tool for the section and switch its class  
  $(this.domNode).find('> div.title > div.toggleTool').removeClass('collapsed').addClass('expanded');

  var $oChildrenContainer = this.domNode.children('ul');
  // append ul if not exist
  if(!$oChildrenContainer.length) {
    // inits sortable on new ul dom
    CC.Behaviors.initSortable($('<ul></ul>').appendTo(this.domNode));
  }
  
  // ask the controller to load the children into the abstraction if required for example
  this.loadChildren();
  // Show the <ul> containing the children
  $oChildrenContainer.show();
  if(withFeedback) {
    CC.Feedback.addToOperationStack('Ouverture du noeud "' + this.controller.getConfigItem('editorConfig').title + '"', 'id:' + this.controller.getId());
  }}


/**
 * Allows to collapse the current node
 */
NodePresentation.prototype.collapse = function (withFeedback) {
  if(typeof(withFeedback) == 'undefined') {
    withFeedback = true;
  }
  CC.Logger.info('Collapse node #' + this.domNode.attr('id').replace('node_',''));
  this.expanded = false;
  // Select the toggle tool for this section and switch its class
  this.domNode.find('> div.title > div.toggleTool').removeClass('expanded').addClass('collapsed');

  // Hide the <ul> containing the children
  this.domNode.children('ul').hide();
  if(withFeedback) {
    CC.Feedback.addToOperationStack('Fermeture du noeud "' + this.controller.getConfigItem('editorConfig').title + '"', 'id:' + this.controller.getId());
  }
}

/**
 * 
 */
NodePresentation.prototype.confirm = function (message) {
  return confirm(message);
}

/**
 * 
 */
NodePresentation.prototype.getDomNode = function () {
  return this.domNode;
}

/**
 *
 */
NodePresentation.prototype.setDomNode = function (domNode) {
  this.domNode = $(domNode).removeAttr('data-config');
}

/**
 * 
 * @param jqueryObject
    *      
 */
NodePresentation.prototype.loadChildren = function () {
  this.controller.loadChildren();
}

/**
 * @param jqueryObject     
 */
NodePresentation.prototype.clearChildren = function () {
  CC.Logger.info('Clear children node #' + this.controller.getId());
  this.domNode.children('ul').empty();
}

NodePresentation.prototype.getParent = function () {
  if(this.controller.parentNode != null) {
    return this.controller.parentNode.presentation;
  }
}

/**************************** DOM DATA GETTER METHODS ************************/


/**
 * Get the element id of the logical DOM parent
 */
NodePresentation.prototype.getDOMParentId = function () {
  return $('#' + this.getDomId()).parents("li.node:first").attr("id");
}

/**
 * Get the element id of the logical DOM left sibling
 */
NodePresentation.prototype.getDOMLeftSiblingId = function () {
  if(CC.isTableEditor()) {
    // Table editor => the left node is the li in the previous td
    // BE CAREFUL : THIS BEHAVIOR IS ONLY VALID AS THE TABLE NODE TYPE DOES NOT ALLOW ANY GRANDCHILDREN

    var prevTd = $('#' + this.getDomId()).parents('td.cell').prev('td.cell');
    if(typeof(prevTd) == 'undefined' || prevTd.length == 0) {
      // if no previous cell on the same row, get the last cell of the previous row
      prevTd = $('#' + this.getDomId()).parents('tr.row').prev('tr.row').find('td.cell:last');
    }

    return prevTd.find('li.node').attr('id');
  }

  return $('#' + this.getDomId()).prev("li.node:first").attr("id");
}

/**
 * Get the element id of the logical DOM right sibling
 */
NodePresentation.prototype.getDOMRightSiblingId = function () {
  if(CC.isTableEditor()) {
    // Table editor => the left node is the li in the next td
    // BE CAREFUL : THIS BEHAVIOR IS ONLY VALID AS THE TABLE NODE TYPE DOES NOT ALLOW ANY GRANDCHILDREN

    var nextTd = $('#' + this.getDomId()).parents('td.cell').next('td.cell');
    if(typeof(nextTd) == 'undefined' || nextTd.length == 0) {
      // if no previous cell on the same row, get the first cell of the last row
      nextTd = $('#' + this.getDomId()).parents('tr.row').next('tr.row').find('td.cell:first');
    }

    return nextTd.find('li.node').attr('id');
  }

  return $('#' + this.getDomId()).next("li.node:first").attr("id");
}

/**
 * Get the element id of the logical DOM position
 */
NodePresentation.prototype.getDOMPosition = function () {
  if(CC.isTableEditor()) {
    // Table editor => count td befor the current one
    // BE CAREFUL : THIS BEHAVIOR IS ONLY VALID AS THE TABLE NODE TYPE DOES NOT ALLOW ANY GRANDCHILDREN

    var position = 0;
    position = position + $('#' + this.getDomId()).parents('td.cell').prevAll('td.cell').length;
    $('#' + this.getDomId()).parents('tr.row').prevAll('tr.row').each(function() {
      position = position + $(this).find('td.cell').length;
    });

    return position;
  }

  return $('#' + this.getDomId()).prevAll('li').length;
}

/**
 * Get the element id of the logical DOM children count
 */
NodePresentation.prototype.getDOMChildrenCount = function () {
  
  return $('#' + this.getDomId()).find(" > ul > li").length;
}

/**
 * Get the element id of the logical DOM children count
 */
NodePresentation.prototype.getDomId = function () {
  return this.domNode.attr('id');
}
/**
 * Get the element id of the logical DOM level
 * IS NOT RELEVANT FOR TABLE EDITOR AS THE TABLE NODE LEVEL IS NOT KNOWN,
 * SO CANNOT BE COMPARED TO THE DEPTH IN THE DOM TREE
 */
NodePresentation.prototype.getDOMLevel = function () {
  return ( Number($('#' + this.getDomId()).parents('li').length) + Number(CC.getBeginLevel()) );
}

/**************************** EVENT METHODS ************************/

NodePresentation.prototype.addChildEvent = function (htmlFragment,position) {
  this.controller.addChild(htmlFragment, position);
}

NodePresentation.prototype.removeEvent = function () {
  if (this.confirm('Voulez vous vraiment supprimer ce noeud ainsi que tous ses fils ?')) {
    this.controller.remove();
    CC.Feedback.addToOperationStack('Suppression du noeud "' + this.controller.getConfigItem('editorConfig').title + '"', 'id:' + this.controller.getId());
  } else {
    CC.Feedback.addToOperationStack('Suppression du noeud "' + this.controller.getConfigItem('editorConfig').title + '" annulée', 'id:' + this.controller.getId());
  }
}

NodePresentation.prototype.editEvent = function () {
  this.controller.edit();
}

NodePresentation.prototype.moveEvent = function (parent, position) {
  this.controller.move(parent.controller, position);
}

NodePresentation.prototype.updateTableElementEvent = function (position, isColumn, isDelete) {
  var element = isColumn ? 'colonne' : 'ligne';

  if (isDelete) {
    if (!this.confirm('Voulez vous vraiment supprimer cette ' + element + ' ?')) {
      CC.Feedback.addToOperationStack('Suppression d\'une ' + element + ' annulée', 'position:' + position);
      return;
    }
  }

  this.controller.updateTableElement(position, isColumn, isDelete);
}

NodePresentation.prototype.switchNodeEvent = function(secondNode) {
  if(this == secondNode) {
    return;
  }
  
  // update DOM
  var oFirstContainer  = $('#' + this.getDomId()).closest('ul');
  var oSecondContainer = $('#' + secondNode.getDomId()).closest('ul');

  $('#' + this.getDomId()).appendTo(oSecondContainer);
  $('#' + secondNode.getDomId()).appendTo(oFirstContainer);

  // notify controller
  this.controller.switchWithNode(secondNode.controller);
}

NodePresentation.prototype.replaceByNew = function(htmlFragment, doEdit) {
  // notify controller
  this.controller.replaceByNew(htmlFragment, doEdit);
}

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.NodePresentation = NodePresentation;

}) (jQuery);

