;(function($) {

/**
  * class CustomNodePresentation
  *
  */

var CustomNodePresentation = function (htmlFragment, nodeEditorController) {
  this._init (htmlFragment, nodeEditorController);
}

CustomNodePresentation.prototype = $.extend(true, {}, CC.NodePresentation.prototype);

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.CustomNodePresentation = CustomNodePresentation;

}) (jQuery);