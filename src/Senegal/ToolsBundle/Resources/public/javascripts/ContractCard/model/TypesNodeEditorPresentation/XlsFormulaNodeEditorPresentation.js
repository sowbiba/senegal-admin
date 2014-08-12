;(function($) {

/**
  * class XlsFormulaNodeEditorPresentation
  *
  */

var XlsFormulaNodeEditorPresentation = function () {
  this._init ();
}

XlsFormulaNodeEditorPresentation.prototype = $.extend(true, {}, CC.NodeEditorPresentation.prototype);

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.XlsFormulaNodeEditorPresentation = XlsFormulaNodeEditorPresentation;

}) (jQuery);