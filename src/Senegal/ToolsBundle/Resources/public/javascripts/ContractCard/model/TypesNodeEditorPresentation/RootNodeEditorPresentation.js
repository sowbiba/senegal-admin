;(function($) {

/**
  * class RootNodeEditorPresentation
  *
  */

var RootNodeEditorPresentation = function () {
  this._init ();
}

RootNodeEditorPresentation.prototype = $.extend(true, {}, CC.NodeEditorPresentation.prototype);

RootNodeEditorPresentation.prototype.editCustomBehavior = function (currentConfig) {

  if(typeof(currentConfig.editorConfig) != 'undefined') {

    if(typeof(currentConfig.editorConfig.usage) != 'undefined') {
      var form = this.form;
      // Update the usage checkboxes
      $.each(currentConfig.editorConfig.usage, function(key, value) {
        var checkbox = form.find('#cc_usage_' + value);
        if(checkbox) {
          checkbox.attr('checked', 'checked');
        } else {
          CC.Logger.error('Unknown usage ID : ' + value);
        }
      });
    }
  }
}

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.RootNodeEditorPresentation = RootNodeEditorPresentation;

}) (jQuery);