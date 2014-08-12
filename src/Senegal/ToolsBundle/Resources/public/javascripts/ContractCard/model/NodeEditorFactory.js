;(function($) {

/**
  * class NodeEditorFactory
  *
  */

var NodeEditorFactory = {
  
  /**
   * build an  instance of NodeEditorPresentation object relative to type in attribut data-config
   * of currentConfig
   * 
   * @param currentConfig 
   * @return instance of NodeEditorPresentation
   * @throws Error - when fragment does not contain param "type" or when type is unknown
   */
  build : function(type) {

    if (typeof(type) == "undefined" || type == '') {
      throw new Error('param "type" undefined or empty in fragment');
    }
    
    var className = type.camelize(true) + 'NodeEditorPresentation';
    if (typeof(CC[className]) == 'undefined') {
      throw new Error(className + ' does not exist');
    }
   
    var oNodeEditorPresentation = new CC[className]();
    oNodeEditorPresentation.setType(type);

    // Construct the form template for this NodeEditorPresentation
    var oTemplate = $(".ccard-editor." + type);
    var sForm = "<form class='ccard-editor' style='display: block;'><input id='node_id' name='node_id' type='hidden' value=''/>";
    sForm    += oTemplate.html() + "</form>";

    // Remove the template from the DOM ( may cause problems with elements having the same ids, etc.)
    oTemplate.remove();
    
    // Set form for this NodeEditorPresentation
    oNodeEditorPresentation.setForm($(sForm));
    
    return oNodeEditorPresentation;
  }
}

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.NodeEditorFactory = NodeEditorFactory;

}) (jQuery);