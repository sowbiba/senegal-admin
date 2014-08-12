;(function($) {

/**
  * class NodeFactory
  * Factory of NodePresentation
  */

var NodeFactory = {
  
  /**
   * build an  instance of NodePresentation object relative to type in attribut data-config
   * of the html fragment
   * 
   * @param htmlFragment 
   * @return instance of NodePresentation
   * @throws Error - when fragment does not contain param "type" or when type is unknown
   */
  build : function(htmlFragment) {
    
    var dataConfig = $(htmlFragment).data('config');

    if (typeof(dataConfig['type']) == "undefined" || dataConfig['type'] == '') {
      throw new Error('param "type" undefined or empty in fragment');
    }
    
    var className = dataConfig['type'].camelize(true) + 'NodePresentation';
    if (typeof(CC[className]) == 'undefined') {
      throw new Error(className + ' does not exist.');
    }
    // Create an unique nodeEditorController for all node.
    if (typeof(nodeEditorController) == 'undefined') {
      var nodeEditorController = new CC.NodeEditorController();
    }
    var nodePresentation = new CC[className](htmlFragment, nodeEditorController);
    
    return nodePresentation;
  }
}

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.NodeFactory = NodeFactory;

}) (jQuery);