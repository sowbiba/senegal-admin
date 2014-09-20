(function (window) {

  var helpers = function() {};

  helpers.prototype.toggleButtonDisability = function (node) {

    if (typeof node == "undefined") {
      return;
    }

    var node = $(node);
    if(node.length <= 0) {
      return;
    }

    // we must post the 2 following buttons in order for the controller to be able to use is_clicked()
    // thus we must not apply this "disabling" feature to the form submit buttons.
    // both for submit (=save) & reject revision.
    var nodeId = node.attr('id');
    if(nodeId == 'dynamic_save' || nodeId == 'dynamic_submit' || nodeId == 'dynamic_reject' || nodeId == 'dynamic_valid' || nodeId == "dynamic_publish" || nodeId == "dynamic_unpublish") {
        return;
    }

    var nodeName = node.get(0).nodeName;

    if (node.hasClass("disabled")) {
      node.removeClass("disabled");
      node.removeAttr("disabled");

      return true;
    }

    if ("BUTTON" == nodeName) {
      node.attr("disabled", "disabled");
      if(node.attr("type") =="submit") {
        node.closest("form").submit();
      }
    }
    node.addClass("disabled");

    return true;
  }

  // Enable all buttons form + sidebar
  helpers.prototype.enableButtons = function () {
    return setButtonsDisability(false);
  };

  // Disable all buttons form + sidebar
  helpers.prototype.disableButtons = function () {
    return setButtonsDisability(true);
  };

  // Set disability of all buttons of form an sidebar
  // param disabled Disable if true, and enable if false
  setButtonsDisability = function (disabled) {
    var $form = $('section.content').find('form'),

    // get all the buttons in the form
    formButtonsList = $form.find('.btn'),

    // get all the buttons in sidebar
    asideButtonList = $('aside').find('.btn'),

    allButtons = $.merge(formButtonsList, asideButtonList);

    allButtons.attr('disabled', disabled);
  };

  // Returns true if a form contains error, false otherwise
  helpers.prototype.formContainsError = function () {
    return !$(".form-control.error").length && !$( '.' + pfdGlobals.ERROR_ICON_CLASS.replace(/ /g, '.')).length;
  };

  if (typeof window.pfd == "undefined") {
    window.pfd = {};
  }

  window.pfd.helpers = new helpers();

}(window));
