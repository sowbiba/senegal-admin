;(function($) {

/**
  * class NodeCollection
  *
  * contains a collection of nodePresentation instances.
  */

var NodeCollection = {
  presentationCollection: {},
  _init: function() {

  },
  
  /**
   * Returns the nodePresentation relative to value of attribute "id" in the html fragments
   * 
   * @return instance of nodePresentation
   */
  get: function(htmlFragment) {
    // extract id from fragment
    var nodeId = $(htmlFragment).attr("id");
    if (typeof(nodeId) == "undefined" || nodeId == '') {
      throw new Error('param "id" undefined or empty in fragment');
    }
    
    //if the node does not exist in the collection, build one and put it in collection
    if(typeof(this.presentationCollection[nodeId]) == 'undefined') {      
      var presentation = CC.NodeFactory.build(htmlFragment);

      this.presentationCollection[nodeId] = presentation;
    } else {
      //update config
      if(typeof($(htmlFragment).attr('data-config')) != 'undefined') {
        CC.Logger.debug('Force update config when retrieve instance');
        this.presentationCollection[nodeId].controller.updateConfig($(htmlFragment).data('config'));
      }
    }
    
    return this.presentationCollection[nodeId];
  },
    
  /**
   * Returns the nodePresentation relative to value of id
   * 
   * @return instance of nodePresentation
   */
  getById: function(nodeId) {
    var presentation = null;
    
    if(typeof(this.presentationCollection[nodeId]) != 'undefined') {   
      presentation = this.presentationCollection[nodeId];
    }
    return presentation;
  },
  remove: function(nodeId) {
    CC.Logger.info('NodeCollection delete ' + nodeId);
    var controller = this.getById(nodeId).controller;
    if(controller) {
      controller._delete();
      this.presentationCollection[nodeId] = undefined;
    }
  },
  reset: function() {
    this.presentationCollection = {};
  }
}

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.NodeCollection = NodeCollection;

}) (jQuery);