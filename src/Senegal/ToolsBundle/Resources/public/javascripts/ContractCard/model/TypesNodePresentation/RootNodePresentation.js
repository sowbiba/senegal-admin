;(function($) {

/**
  * class RootNodePresentation
  *
  */

var RootNodePresentation = function (htmlFragment, nodeEditorController) {
  this._init (htmlFragment, nodeEditorController);
}

RootNodePresentation.prototype = $.extend(true, {}, CC.NodePresentation.prototype);

if (typeof window.CC == "undefined") {
  window.CC = {};
}

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
window.CC.RootNodePresentation = RootNodePresentation;

}) (jQuery);