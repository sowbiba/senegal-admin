;(function($) {

/**
  * class MeterChartNodePresentation
  *
  */

var MeterChartNodePresentation = function (htmlFragment, nodeEditorController) {
  this._init (htmlFragment, nodeEditorController);
}

MeterChartNodePresentation.prototype = $.extend(true, {}, CC.NodePresentation.prototype);

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.MeterChartNodePresentation = MeterChartNodePresentation;

}) (jQuery);