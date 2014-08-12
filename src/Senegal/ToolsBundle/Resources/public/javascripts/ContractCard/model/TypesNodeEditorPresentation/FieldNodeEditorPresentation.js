;(function($) {

/**
  * class FieldNodeEditorPresentation
  *
  */

var FieldNodeEditorPresentation = function () {
  this._init ();
}

FieldNodeEditorPresentation.prototype = $.extend(true, {}, CC.NodeEditorPresentation.prototype);

FieldNodeEditorPresentation.prototype.editCustomBehavior = function (currentConfig) {
  // Update the field selectors
  this.loadChaptersFromConfig(currentConfig.editorConfig.id);
}

FieldNodeEditorPresentation.prototype.addCustomBehavior = function (currentConfig) {
  // 2 different behaviors : 
  //    * first node added => load first level chapters (no select were previously loaded...)
  //    * next nodes => let the chapter selects as the user is probably working close to the last inserted node
  if(this.getForm().find('select.ccard-chapter-selector').length == 0) {
    // Update the field selectors with no preselected field
    this.loadChaptersFromConfig();
  }
  
  // reset the form with the previously setted values... kind of hacky as the form has been cleared earlier in common behavior, but it works
  this.getForm().find('select.ccard-chapter-selector').each(function () {
    var value = $(this).find('.chapters option[selected]').attr('value');
    $(this).val(value);
  });
}

FieldNodeEditorPresentation.prototype.loadChaptersFromConfig = function (field_id) {
  var data = { field_id: field_id, card_id: CC.getContractCardId() };
  this.form.find('.placeholder').load(CC.Urls.getparentchapters, data);
}

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.FieldNodeEditorPresentation = FieldNodeEditorPresentation;

}) (jQuery);