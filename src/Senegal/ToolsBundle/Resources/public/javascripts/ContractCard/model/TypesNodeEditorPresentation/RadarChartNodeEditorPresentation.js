;(function($) {

/**
  * class RadarChartNodeEditorPresentation
  *
  */

var RadarChartNodeEditorPresentation = function () {
  this._init ();
}

RadarChartNodeEditorPresentation.prototype = $.extend(true, {}, CC.NodeEditorPresentation.prototype);

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.RadarChartNodeEditorPresentation = RadarChartNodeEditorPresentation;

}) (jQuery);