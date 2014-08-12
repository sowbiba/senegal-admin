;(function($) {

/**
  * class RadarChartNodePresentation
  *
  */

var RadarChartNodePresentation = function (htmlFragment, nodeEditorController) {
  this._init (htmlFragment, nodeEditorController);
}

RadarChartNodePresentation.prototype = $.extend(true, {}, CC.NodePresentation.prototype);

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.RadarChartNodePresentation = RadarChartNodePresentation;

}) (jQuery);