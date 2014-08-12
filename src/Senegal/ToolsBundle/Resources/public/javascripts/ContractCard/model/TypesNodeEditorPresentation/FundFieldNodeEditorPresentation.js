;(function($) {

/**
  * class FundFieldNodeEditorPresentation
  *
  */

var FundFieldNodeEditorPresentation = function () {
  this._init ();
}

FundFieldNodeEditorPresentation.prototype = $.extend(true, {}, CC.NodeEditorPresentation.prototype);

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.FundFieldNodeEditorPresentation = FundFieldNodeEditorPresentation;

}) (jQuery);