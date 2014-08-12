;(function($) {

/**
  * class CustomNodeEditorPresentation
  *
  */

var CustomNodeEditorPresentation = function () {
  this._init ();
}

CustomNodeEditorPresentation.prototype = $.extend(true, {}, CC.NodeEditorPresentation.prototype);

CustomNodeEditorPresentation.prototype.editCustomBehavior = function (currentConfig) {
  var editorConfig = currentConfig.editorConfig;
  // load extra config
  for(var name in editorConfig) {
    this.insertExtraField(name, editorConfig[name]);
  }
}

CustomNodeEditorPresentation.prototype.insertExtraField = function (name, value) {
  CC.Behaviors.addCustomForm(this.form, name, value);
}
// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.CustomNodeEditorPresentation = CustomNodeEditorPresentation;

}) (jQuery);