;(function($) {

/**
  * class NodeEditorCollection
  *
  */

var NodeEditorCollection = {
  editorPresentationCollection: {},
  _init : function() {

  },
  
  /**
   * Returns the nodeEditorPresentation relative to value of attribute "id" in the html fragments
   * 
   * @return instance of nodeEditorPresentation
   * @throws Error when noedId is empty or of undefined type
   */
  get : function(currentConfig) {
    var type = currentConfig["type"];
    
    if (typeof(type) == "undefined" || type == '') {
      throw new Error('param "type" undefined or empty in fragment');
    }
    
    //if the node does not exist in the collection, build one and put it in collection
    if(typeof(this.editorPresentationCollection[type]) == 'undefined') {
      
      var editorPresentation = CC.NodeEditorFactory.build(type);

      this.editorPresentationCollection[type] = editorPresentation;
    }
    
    return this.editorPresentationCollection[type];
  }
}

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.NodeEditorCollection = NodeEditorCollection;

}) (jQuery);