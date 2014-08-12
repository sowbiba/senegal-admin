;(function($) {

/**
  * class FundsListNodeEditorPresentation
  *
  */

var FundsListNodeEditorPresentation = function () {
  this._init ();
}

FundsListNodeEditorPresentation.prototype = $.extend(true, {}, CC.NodeEditorPresentation.prototype);

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.FundsListNodeEditorPresentation = FundsListNodeEditorPresentation;

}) (jQuery);