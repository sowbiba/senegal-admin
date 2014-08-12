;(function($) {

/**
  * class NodeEditorPresentation
  *
  */

var NodeEditorPresentation = function () {
  this._init ();
}


/**
 * _init sets all NodeEditorPresentation attributes to their default value. Make
 * sure to call this method within your class constructor
 */
NodeEditorPresentation.prototype._init = function () {
  this.editorController = null;
  this.form             = null;
  this.editorForm           = null;
  this.type             = null;

  // Defines the base title for this dialog
  this.dialogBaseTitle      = 'Propriétés du nœud';

  // Dialog title to be used (constructed in edit() )
  this.dialogTitle      = null;
}

/**
 * Renders the node editor into a dialog box
 */
NodeEditorPresentation.prototype.render = function () {

  // Create a container
  this.editorForm = $('#editor_modal');

  if(!this.editorForm.length) {
    this.editorForm = $('<div id="editor_modal"></div>').appendTo('body');
  }

  // Load the form into the container
  this.editorForm.html(this.form);

  // Bind the submit handler
  var presentation = this;
  $(this.form).submit(function() {

    presentation.editorController.submitHandler($(this));

    return false;
  });

  //if press key 'Enter' then submit form
  $(this.form).bind('keypress', function(e) {
    if(e.keyCode==13){ // Enter pressed... do anything here...
      presentation.editorForm.find('form').submit();
    }
  });

  // Instantiate the dialog
  this.editorForm.dialog({
    title: this.dialogTitle,
    modal: true,
    height: 'auto',
    width: 'auto',
    draggable: false,
    closeOnEscape : false,
    resizable: false,
    buttons: {
      "Sauvegarder": function() {
        $(this).find('form').submit();
      },
      "Fermer": function() {
        $(this).dialog('close');
      }
    }
  });
}


/**
 * Fills in the form template with the config of the node and renders it
 *
 * @param currentConfig
 */
NodeEditorPresentation.prototype.edit = function (currentConfig) {

  if(typeof(currentConfig) == 'undefined' || $.isEmptyObject(currentConfig)) {
    throw new Error('currentConfig is undefined');
  }

  // Construct the dialog title for this node
  this.dialogTitle = this.dialogBaseTitle;
  if(typeof(currentConfig.editorConfig) != 'undefined' && typeof(currentConfig.editorConfig.title) != 'undefined') {
    this.dialogTitle += " : " + currentConfig.editorConfig.title;
  }

  this.initializeValues(currentConfig);

  // Child class editor custom behavior
  this.editCustomBehavior(currentConfig);

  // Fill in the node metas
  this.form.find('input[name="node_id"]').val(currentConfig.id);

  CC.Logger.info('Display ' + this.type + ' editor for node #' + currentConfig.id);
  // Display the form
  this.render();
}

NodeEditorPresentation.prototype.editCustomBehavior = function (currentConfig) {

}

/**
 * reset input values and insert values form config
**/
NodeEditorPresentation.prototype.initializeValues = function (currentConfig) {
  CC.Logger.info('Values initialization ' + this.type + ' editor for node #' + currentConfig.id);
  // Reset all inputs
  $('input[type="checkbox"]', this.form).prop('checked', false);
  $('input[type!="checkbox"], select, textarea', this.form).val(null);

  // Retrieve the form elements corresponding to this config element
  $('input, select, textarea', this.form).each(function () {
    var key = typeof $(this).attr('name') != "undefined" ? $(this).attr('name').replace("[]", "") : $(this).attr('name');
    if (typeof(currentConfig.editorConfig[key]) != 'undefined') {
      if ($(this).attr('type') == 'checkbox') {
        // If a checkbox, tick it
        if (currentConfig.editorConfig[key][$(this).val()] == "true" || currentConfig.editorConfig[key][$(this).val()] == $(this).val()) {
          $(this).prop("checked", true);
        }
      } else {// Otherwise, set the value to the config value
        $(this).val(currentConfig.editorConfig[key]);
      }
    }


  });

  // remove input for custom editor
  $('div.customForm').not('#newCustomForm').remove();
}
/**
 * New form template with the config of the node and renders it
 *
 * @param currentConfig
 */
NodeEditorPresentation.prototype.add = function (currentConfig) {

  if(typeof(currentConfig) == 'undefined' || $.isEmptyObject(currentConfig)) {
    throw new Error('currentConfig is undefined');
  }

  // Construct the dialog title for this node
  this.dialogTitle = this.dialogBaseTitle;
  if(typeof(currentConfig.editorConfig) != 'undefined' && typeof(currentConfig.editorConfig.title) != 'undefined') {
    this.dialogTitle += " : " + currentConfig.editorConfig.title;
  }

  this.initializeValues(currentConfig);

  // Child class editor custom behavior
  this.addCustomBehavior(currentConfig);

  // Fill in the node metas
  //this.form.find('input[name="node_id"]').val(currentConfig.id);

  CC.Logger.info('Display ' + this.type + ' editor for new node ');
  // Display the form
  this.render();
}

NodeEditorPresentation.prototype.addCustomBehavior = function (currentConfig) {

}


/**
 * Hides the dialog of an editor
 */
NodeEditorPresentation.prototype.hide = function () {
  CC.Logger.info('Hide ' + this.type + ' editor');
  this.editorForm.dialog('close');
}

/**
 *
 */
NodeEditorPresentation.prototype.setNodeEditorController = function (editorController) {
  this.editorController = editorController;
}

/**
 *
 */
NodeEditorPresentation.prototype.getNodeEditorController = function () {
  return this.editorController;
}

/**
 *
 */
NodeEditorPresentation.prototype.setForm = function (oForm) {
  this.form = oForm;
}

/**
 *
 */
NodeEditorPresentation.prototype.getForm = function () {
  return this.form;
}

/**
 *
 */
NodeEditorPresentation.prototype.setType = function (sType) {
  this.type             = sType;
  this.dialogBaseTitle  = '<img style="vertical-align: bottom;" \
                            src="/images/back/contractCard/node/' + sType + '.png" \
                            alt="" /> Propriétés du nœud';
}

/**
 *
 */
NodeEditorPresentation.prototype.getType = function () {
  return this.type;
}

// This class is available in namespace CC only
// If this namespace doesn't exist, create it.
if (typeof window.CC == "undefined") {
  window.CC = {};
}

window.CC.NodeEditorPresentation = NodeEditorPresentation;

}) (jQuery);