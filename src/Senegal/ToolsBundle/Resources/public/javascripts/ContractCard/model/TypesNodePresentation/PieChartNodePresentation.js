;(function($) {

/**
  * class PieChartNodePresentation
  *
  */

var PieChartNodePresentation = function (htmlFragment, nodeEditorController) {
  this._init (htmlFragment, nodeEditorController);
}

PieChartNodePresentation.prototype = $.extend(true, {}, CC.NodePresentation.prototype);

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.PieChartNodePresentation = PieChartNodePresentation;

}) (jQuery);