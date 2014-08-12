;(function($) {

/**
  * class MeterChartNodeEditorPresentation
  *
  */

var MeterChartNodeEditorPresentation = function () {
  this._init ();
}

MeterChartNodeEditorPresentation.prototype = $.extend(true, {}, CC.NodeEditorPresentation.prototype);

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.MeterChartNodeEditorPresentation = MeterChartNodeEditorPresentation;

}) (jQuery);