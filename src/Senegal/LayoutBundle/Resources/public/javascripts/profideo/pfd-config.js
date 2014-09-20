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

// GLOBAL VARIABLES AS CONSTANTS
// ==================


var pfdGlobals = {
  // Activate ot not console output for debugging
  DEBUG_CONSOLE: false,

  // #NAs
  NA_VALUE: ($('#naValue').length > 0) ? $('#naValue').val() : '#NA',

  // Revision form field Node ID prefixes
  NODE_ID_PREFIX: "dynamic_",

  // Revision form field Node ID prefixes
  NODE_NAME_REGEX: /dynamic%5B([0-9]+)%5D/gi,

  // Form Row class (: wrapper row for the field Item)
  FORM_ROW_CLASS: "form-row",

  // Form row Class used to hide / Show the row in the revision form
  HIDE_ROW_CLASS: "form-row-hidden",

  // Deepest Chapter level
  LEAF_LEVEL_CHAPTER: 6,

  // Class for chapter level, all levels
  CHAPTER_CLASS: 'chapter',

  // Class used to hide Chapters
  HIDE_CHAPTER_CLASS: 'chapter-hidden',
  // Class used to hide Chapters in the sidebar
  HIDE_CHAPTER_SIDEBAR_CLASS: 'chapter-sidebar-hidden',

  // The previous sibling of the error message on error massage DOM insertion for SO on AJAX Feedback
  ERROR_PREVIOUS_SIBLING_CLASS: '.row-label',

  // The previous sibling of the error message on error massage DOM insertion for SO in table on AJAX Feedback
  ERROR_PREVIOUS_TABLE_SIBLING_CLASS: '.row-chapter-table',

  ERROR_GENERIC_CLASS: 'error',

  ERROR_MARKUP_WRAPPER_CLASS: 'row-error alert alert-danger',

  ERROR_SOURCE_MARKUP_WRAPPER_CLASS: 'row-error errorCheckRuleNAIncoherence alert alert-danger',

  // Class for the errorSource fields
  ERROR_SOURCE_FIELD_CLASS: 'source-error',

  // Class for the errorTaget fields
  ERROR_TARGET_FIELD_CLASS: 'target-error',

  // Queue name for the SO ajax requests.
  QUEUE_NAME: 'soAjaxQueue',

  // data attribute for source fields
  SOURCE_DATA_ATTR: 'source',

  // data attribute for target fields
  TARGET_DATA_ATTR: 'target',

  ERROR_ICON_CLASS: 'fa fa-warning fa-color-danger fa-2x',
  WARN_ICON_CLASS: 'fa fa-exclamation fa-color-warning',
  VALID_ICON_CLASS: 'fa fa-check fa-color-success'

};