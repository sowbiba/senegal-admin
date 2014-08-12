;(function($) {

/**
  * class HtmlNodeEditorPresentation
  *
  */

var HtmlNodeEditorPresentation = function () {
  this._init ();
}

HtmlNodeEditorPresentation.prototype = $.extend(true, {}, CC.NodeEditorPresentation.prototype);

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.HtmlNodeEditorPresentation = HtmlNodeEditorPresentation;

}) (jQuery);