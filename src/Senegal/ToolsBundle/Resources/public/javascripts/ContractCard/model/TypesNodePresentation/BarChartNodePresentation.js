;(function($) {

/**
  * class BarChartNodePresentation
  *
  */

var BarChartNodePresentation = function (htmlFragment, nodeEditorController) {
  this._init (htmlFragment, nodeEditorController);
}

BarChartNodePresentation.prototype = $.extend(true, {}, CC.NodePresentation.prototype);

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.BarChartNodePresentation = BarChartNodePresentation;

}) (jQuery);