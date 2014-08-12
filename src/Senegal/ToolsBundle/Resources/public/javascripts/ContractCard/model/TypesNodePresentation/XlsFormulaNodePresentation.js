;(function($) {

/**
  * class XlsFormulaNodePresentation
  *
  */

var XlsFormulaNodePresentation = function (htmlFragment, nodeEditorController) {
  this._init (htmlFragment, nodeEditorController);
}

XlsFormulaNodePresentation.prototype = $.extend(true, {}, CC.NodePresentation.prototype);

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.XlsFormulaNodePresentation = XlsFormulaNodePresentation;

}) (jQuery);