/* ========================================================================
 * Profideo - Schoko
 * ========================================================================
 * Copyright 2013 Profideo Services.
 * Author: Ronan Donniou
 * Date: 17/10/2013
 * ======================================================================== */
/* JSLint */
/* jslint browser: true*/
/* global $, jQuery, pfdGlobals */


/*
 *   fieldObject
 *
 *   Object to manipulate fields within a form on SO operations
 *
 */
(function (window) {
  "use strict";

  // FIELD OBJECT CLASS DEFINITON
  // ==================
  var fieldObject = function () {

    // public vars
    this.fieldNodeId = null; // DOM ID of field (string)
    this.fieldType = null; // type of field (string, input, select, textare...)
    this.fieldNode = null; // DOM Node of field
    this.fieldRowNode = null; // Parent DOM Node of form row for the field
    this.errorMessage = ""; // Error Message for Source fields
    this.ruleId = null; // The Id of the rule applyed on this field
    this.isInChapterTable = null; // whether or not the fields is a part of a chapter Table
    this.isSource = false;
    this.isTarget = false;
    this.value = null;
    this.hasError = false;
  };

  //
  // privates functions
  // ==================

  // retrieve type of field
  //
  // for inputs, we get the attr of the node
  // for select & textarea we need the tagName prop of the node itself
  //
  fieldObject.prototype.getFieldType = function () {
    var $field = $(this.fieldNodeId),
      elementType = (!$field.attr('type')) ? ($field.prop('tagName')).toLowerCase() : $field.attr('type');

    return elementType;
  };

  // retrieve DOM node
  fieldObject.prototype.getFieldNode = function () {
    return $(this.fieldNodeId).length > 0 ? $(this.fieldNodeId) : null;
  };

  // retrieve Form Row, parent of field node
  fieldObject.prototype.getFieldRowNode = function () {
    return this.fieldNode.parents('.' + pfdGlobals.FORM_ROW_CLASS);
  };

  // hide form Row
  fieldObject.prototype.hideRow = function () {
    return this.fieldRowNode.addClass(pfdGlobals.HIDE_ROW_CLASS);
  };

  // show form Row
  fieldObject.prototype.showRow = function () {
    return this.fieldRowNode.removeClass(pfdGlobals.HIDE_ROW_CLASS);
  };

  // Builds the chunk og HTML used for the error messages.
  fieldObject.prototype.buildErrorSourceMarkup = function () {
    if (this.errorMessage == "") {
      return false;
    }

    var $el = $('<div/>').attr("data-rule-id", this.ruleId)
      .addClass(pfdGlobals.ERROR_SOURCE_MARKUP_WRAPPER_CLASS)
      .html(this.errorMessage);
    return $el;
  };

  // Get whether the field is in a table or not
  fieldObject.prototype.getIsInChapterTable = function () {
    var $field = $(this.fieldNodeId);

    return (($field.parents('td')).length > 0) ? true : false;
  };

  // Get whether the field is in a table or not
  fieldObject.prototype.hasErrors = function () {
      var $field = $(this.fieldNodeId);

      return($field.hasClass(pfdGlobals.ERROR_SOURCE_FIELD_CLASS) || $field.hasClass(pfdGlobals.ERROR_TARGET_FIELD_CLASS));
  };


  //
  // public functions
  // ==================

  // populate public vars
  fieldObject.prototype.init = function (fieldId) {
    this.fieldNodeId = fieldId;
    this.fieldNode = this.getFieldNode();

    // exit on non-existing field
    if (!(this.fieldNode)) {
      if (pfdGlobals.DEBUG_CONSOLE) {
        log("Field ID=" + this.fieldNodeId + " does not exist.");
      }
      this.fieldNodeId = null;
      return;
    }
    this.fieldType = this.getFieldType();
    this.fieldRowNode = this.getFieldRowNode();
    this.isInChapterTable = this.getIsInChapterTable();
    this.isSource = this.fieldNode.data("source") ? true : false;
    this.isTarget = this.fieldNode.data("target") ? true : false;
    this.value    = this.fieldNode.val();
  };

  // set field to NA
  //
  // hide field Row & disable field in form
  // In case the field is an error target, it need to loose it's error target class
  //
  fieldObject.prototype.setFieldNA = function () {
    console.log("Disable field " + this.fieldNodeId);
    this.hideRow();
    this.fieldNode.prop('disabled', true);
    this.removeErrorTarget();

    return true;
  };

  // unset field NA
  //
  // enable field in form & clean value
  //
  fieldObject.prototype.unsetFieldNA = function () {
    // enable only if parent row has hidden class. Must do otherwise field's value is always cleanned
    // and we have some rules that ask to show the source field !
    // still, this field might have recieved a target error class... tss tss.. remove it !
    console.log("Enable field " + this.fieldNodeId);
    this.removeErrorTarget();

    if (this.fieldRowNode.hasClass(pfdGlobals.HIDE_ROW_CLASS)) {
      this.fieldNode.prop('disabled', false).val('');
      this.showRow();
    }

    return;
  };

  // Add the Error message before the Source field of a rule
  //
  // /!\ Looks like dead code /!\
  fieldObject.prototype.addErrorSource = function () {
    // we don't want to add empty message containers... Yeah, it happens...
    // so the container builder will return false if empty msg or the markup on case there is a msg
    var errMarkup = this.buildErrorSourceMarkup();

    if (errMarkup) {
        console.log("Add sources errors on field " + this.fieldNodeId);
        if(this.isInChapterTable){
            this.fieldRowNode
                .closest(pfdGlobals.ERROR_PREVIOUS_TABLE_SIBLING_CLASS)
                .prepend(errMarkup);
        } else {
            this.fieldRowNode
                .find(pfdGlobals.ERROR_PREVIOUS_SIBLING_CLASS)
                .append(errMarkup);
        }

      this.fieldNode.addClass(pfdGlobals.ERROR_SOURCE_FIELD_CLASS + " " + pfdGlobals.ERROR_GENERIC_CLASS);
    }

    return;
  };

  // Remove the Error message before the Source field of a rule
  //
  // /!\ Looks like dead code /!\
  fieldObject.prototype.removeErrorSource = function () {
      if(!this.fieldNode.hasClass(pfdGlobals.ERROR_SOURCE_FIELD_CLASS)){
          return;
      }
      console.log("Remove sources errors on field " + this.fieldNodeId);
      if(this.isInChapterTable){
          this.fieldRowNode
              .closest(pfdGlobals.ERROR_PREVIOUS_TABLE_SIBLING_CLASS)
              .find('div[data-rule-id=' + this.ruleId + ']').remove();
      } else {
          this.fieldRowNode
              .find('div[data-rule-id=' + this.ruleId + ']').remove();
      }
      this.fieldNode.removeClass(pfdGlobals.ERROR_SOURCE_FIELD_CLASS + " " + pfdGlobals.ERROR_GENERIC_CLASS);

      this.fieldRowNode.find('.error').removeClass('error');

    return;
  };

  //Add the Error Class on the rule target field
  //
  fieldObject.prototype.addErrorTarget = function () {
      console.log("Add targets errors on field " + this.fieldNodeId);

      (this.fieldNode).addClass(pfdGlobals.ERROR_TARGET_FIELD_CLASS  + " " + pfdGlobals.ERROR_GENERIC_CLASS);

    return;
  };

  // Remove the Error Class on the rule target field
  //
  fieldObject.prototype.removeErrorTarget = function () {
      if(!this.fieldNode.hasClass(pfdGlobals.ERROR_TARGET_FIELD_CLASS)){
          return;
      }
      console.log("Remove targets errors on field " + this.fieldNodeId);

      (this.fieldNode).removeClass(pfdGlobals.ERROR_TARGET_FIELD_CLASS  + " " + pfdGlobals.ERROR_GENERIC_CLASS);

    return;
  };

  // Remove the Error Class on the field
  //
  fieldObject.prototype.removeErrors = function () {
   console.log("Remove errors on field " + this.fieldNodeId);

    this.fieldRowNode.removeClass(pfdGlobals.ERROR_GENERIC_CLASS)
        .find('div[data-error=' + this.fieldNodeId + ']').remove();
    this.fieldRowNode.find('.error').removeClass('error');

    return;
  };

  //Add the errors on fields
  //
  fieldObject.prototype.addErrors = function (errors) {
    console.log("Add errors on field " + this.fieldNodeId);
    var errMarkup = this.buildErrorsMarkup(errors);
    if (errMarkup) {
      this.fieldRowNode.addClass(pfdGlobals.ERROR_GENERIC_CLASS)
        .find('div.row-data')
        .prepend(errMarkup)
      this.fieldNode.addClass(pfdGlobals.ERROR_GENERIC_CLASS);
    }
    return;
  };

  // Builds the chunk og HTML used for the error messages.
  fieldObject.prototype.buildErrorsMarkup = function (errors) {
    if (errors == "") {
      return false;
    }


    if (typeof(errors) === "string") {
      this.errorMessage = errors;
    } else if (typeof(errors) === "object") {
      for (var i in errors) {
        this.errorMessage += errors[i];
      }
    }

    var $el = $('<div/>')
      .attr("data-error", this.fieldNodeId)
      .addClass(pfdGlobals.ERROR_MARKUP_WRAPPER_CLASS)
      .html(this.errorMessage);
    return $el;
  };

  fieldObject.prototype.udpateStatusIcon = function () {
    var fieldStatusRow = this.fieldRowNode.find(".row-field-ico").find("#field-status");

    if (this.errorMessage) {
      fieldStatusRow.removeClass().addClass(pfdGlobals.ERROR_ICON_CLASS);
    } else if (this.value == "") {
      fieldStatusRow.removeClass().addClass(pfdGlobals.WARN_ICON_CLASS);
    } else {
      fieldStatusRow.removeClass().addClass(pfdGlobals.VALID_ICON_CLASS);
    }
  }



  window.fieldObject = fieldObject;

}(window));