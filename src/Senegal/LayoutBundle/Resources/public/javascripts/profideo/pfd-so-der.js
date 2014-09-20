/* ========================================================================
 * Profideo - Schoko
 * ========================================================================
 * Copyright 2013 Profideo Services.
 * Author: Ronan Donniou
 * Date: 05/11/2013
 * ======================================================================== */
/* JSLint */
/* jslint browser: true*/
/* global $, jQuery, pfdGlobals */

/*
 *   This file contains all functions and procedure for der (Data Entry Rules)
 *   to be run on the Revision page
 *
 *  @dependancy pfd-so-config.js, pfd-so-chapters.js, pfd-so-fields.js
 *
 */

;
(function ($) {
  "use strict";

  // Init on DOM ready
  $(document).ready(function () {

    initFieldsManagement();

  });


  /* ========================================================================
   *  Main functions -> Init Event Listeners & behavors
   *                 -> Perform AJAX Actions
   *  ======================================================================== */
//
// Inject and Error Modal in the DOM & display it
//
// This function has been removed du to some heavy latency that was wreated in FF
// Need to be rebuilt
  function injectErrorModal(options) {
    var modalTitle = options.modalTitle || '<h4 class="modal-title error"><i class="fa fa-warning"></i>Erreur</h4>',
      modalContent = options.modalContent || '<p>Une erreur inconnue s\'est produite.</p>';
//            modalMarkup  = '<div class="modal fade" role="dialog" id="errorModal"> \
//                            <div class="modal-dialog"> \
//                              <div class="modal-content"> \
//                                <div class="modal-header"> \
//                                  <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> \
//                                    ' + modalTitle + ' \
//                                </div> \
//                                <div class="modal-body"> \
//                                  ' +  modalContent + ' \
//                                </div> \
//                                <div class="modal-footer"> \
//                                  <button type="button" class="btn btn-default" data-dismiss="modal">Close</button> \
//                                </div> \
//                              </div><!-- /.modal-content --> \
//                            </div><!-- /.modal-dialog --> \
//                          </div><!-- /.modal -->';
//        $('body').append(modalMarkup);
//        $('#errorModal').modal();

    alert(modalContent);


  }
  //
  // Init all events & behaviors on page control items
  //

  function initFieldsManagement() {

    var keyUpTimer,
      $form = $('#pageEditRevisions').find('#dynamic-form'),
      $selects = $form.find('select'),
      $inputs = $form.find('input'),
      $textareas = $form.find('textarea'),
      $texts = $.merge($textareas, $inputs);

    // prevent form submission in case there is on error source
    $form.on('submit', function (evt) {
      var hasErrors = $form.find('.' + pfdGlobals.ERROR_GENERIC_CLASS),
        hasErrorSources = $form.find('.' + pfdGlobals.ERROR_SOURCE_FIELD_CLASS);

      if (hasErrorSources.length > 0 || hasErrors.length > 0) {
        injectErrorModal({
          'modalContent': 'Il reste de erreurs dans votre formulaire.\nVeuillez corriger ces erreurs et essayer de nouveau.\nAction Impossible'
        });
        evt.preventDefault();
        return false;
      }
    });

    // all controls : drop Down change + deal with mouse events in text inputs
    $selects.on('change', function () {
      var $this = $(this);
      ajaxCall($this);
    });

    // all text input & textarea since they behave identically
    $texts.on('keyup paste', function () {
      var $this = $(this);

      // we dont want to shoot an request on every key up event we'll use a timer
      // new key pressed = reset timer
      if (keyUpTimer) {
        clearTimeout(keyUpTimer);
      }
      // start timer
      keyUpTimer = setTimeout(function () {
        ajaxCall($this);
      }, 1000);
    });
  };
  /* / end initFieldsVisibilitiesManagement */

  //
  // AJAX actions
  //
  //  Manage the data reteival
  //  Perform the calls using the ajaxqueue plugin.
  var ajaxCall = function (el) {
    // disable save buttons & show precessing feedback
    pfd.helpers.disableButtons();
    $('#modalProcessing').slideDown(500);

    // retrieve the data te send
    var fieldId = (el.attr('id')).replace(pfdGlobals.NODE_ID_PREFIX, ''),
      fieldVal = el.val() ? el.val() : 0 ,
      target = Routing.generate('pfd_contract_revision_field_visibility', { id: $('#contractId').val(), revisionNumber: $('#revisionNumber').val()}),
      fieldConstraintUrl = Routing.generate('pfd_field_validate_constraint', { id: fieldId }),
      formData = $('#dynamic-form').serialize();

    var field = new fieldObject();
    field.init('#' + pfdGlobals.NODE_ID_PREFIX + fieldId);

    formData = formData.replace(pfdGlobals.NODE_NAME_REGEX, '$1');

    // data to send
    var postData = {
      fieldId: fieldId,
      fieldVal: fieldVal,
      formData: formData
    };

    $.ajaxq(pfdGlobals.QUEUE_NAME, {
      url: fieldConstraintUrl,
      method: 'POST',
      dataType: 'json',
      data: postData
    })
      .done(function (data) {
        // case we have a error in the submitted format, the return false we need to stop it all... for now
        if (typeof(data) === 'boolean') {
          $.ajaxq.clearQueue(pfdGlobals.QUEUE_NAME);
          injectErrorModal({
            'modalContent': 'Une erreur de traitement s\'est produite.\nVeuillez recharger votre page.'
          });
          return false;
        }
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        log('ajax fail ', jqXHR, '  ', textStatus, ' ', errorThrown);
        alert('Ajax Error :' + textStatus + ', ' + errorThrown);
      })
      .then(function (jqXHR, textStatus) {
        // hide processing feeedback & activate buttons if ajax queue is empty
        if (!$.ajaxq.isRunning()) {
          field.removeErrors();
          if (!jqXHR.valid) {
            field.addErrors(jqXHR.errors);
          } else if (field.isSource || field.isTarget) {
            // $.ajaxq is used instead of $.ajax => plugin to manage queue of ajax calls. See plugin.js for more info
            $.ajaxq(pfdGlobals.QUEUE_NAME, {
              url: target,
              method: 'POST',
              dataType: 'json',
              data: postData
            })
              .done(function (data) {
                // case we have a error in the submitted format, the return false we need to stop it all... for now
                if (typeof(data) === 'boolean') {
                  $.ajaxq.clearQueue(pfdGlobals.QUEUE_NAME);
                  injectErrorModal({
                    'modalContent': 'Une erreur de traitement s\'est produite.\nVeuillez recharger votre page.'
                  });
                  $('#modalProcessing').slideUp(250);
                  if(pfd.helpers.formContainsError()) {
                    pfd.helpers.enableButtons();
                  }
                  return false;
                }
                // we have some correct data format
                errorTargets(data.error_targets);
                errorSources(data.error_sources);
                hideFields(data.fields_to_hide);
                showFields(data.fields_to_show);
                showHideRowsInChapterTables();
                showHideColsInChapterTables();
                showHideChapters();
              })
              .fail(function (jqXHR, textStatus, errorThrown) {
                log('ajax fail ', jqXHR, '  ', textStatus, ' ', errorThrown);
                alert('Ajax Error :' + textStatus + ', ' + errorThrown);
              })
              .then( function(data) {
                 field.udpateStatusIcon();
                 $('#modalProcessing').slideUp(250);
               if( data.error_targets.length == 0 && pfd.helpers.formContainsError()){
                 pfd.helpers.enableButtons();
               } else {
                 pfd.helpers.disableButtons();
                 return false;
               }
              });
          } else {
            field.udpateStatusIcon();
            $('#modalProcessing').slideUp(250);
            if(pfd.helpers.formContainsError()) {
              pfd.helpers.enableButtons();
            }
          }
        }
      });
  };
  /* / end ajaxcall  */


    //
    //  Hide Empty rows & show non-Empty in a Chapter Table
    //
    //  Since we want to minimize DOM manipulation and paint actions we'll use temporary array to store
    //  the list of rows to hide or show then then do 2 batch paints : show & hide
    //
    function showHideRowsInChapterTables(){
        var tables     = $('.table-chapter'),
            rowsToHide = new Array(),
            rowsToShow = new Array;

        //all tables in the page
        $.each(tables, function(){
            // get rows but only in tbody, exclude thead
            var $rows = $(this).find('tbody').find('tr');

            //get all form-row field wrappers filtered by visible only
            $.each($rows, function(){
                var $row = $(this),
                    hasVisibleChild = ($row.find('.form-row').not('.form-row-hidden')).length,
                    rowId = $row.attr('id');

                // got visible => show row if not, hide row
                if (hasVisibleChild > 0) {
                    rowsToShow.push('#' + rowId);
                }else{
                    rowsToHide.push('#' + rowId);
                }
            });
        });
        // add or remove hide row class
        $(rowsToHide.join(', ')).addClass('chapter-row-hidden'),
        $(rowsToShow.join(', ')).removeClass('chapter-row-hidden');

        return;
    }


   function showHideColsInChapterTables(){
        var tables     = $('.table-chapter');

        //all tables in the page, for each
        $.each(tables, function(){
            var $table = $(this),
                // number of cols & rows
                nbrCols = $table.find('tr:first-child').find('td').length;

                // loop through cols in the current table
                for( var i=1 ; i < parseInt(nbrCols)+1 ; i++ )
                {
                    // get all cells in the col & from thoses, the ones that have a data-field that are not hidden
                    var $cellsInCol = $table.find('td[data-field-column='+i+']'),
                        $cellsNotEmpty = $cellsInCol.find('.form-row').not('.form-row-hidden');

                        // no visible data field in th whole col => hide it (dont forget the thead items) else Show
                        if ( $cellsNotEmpty.length == 0 ){
                            $table.find('th[data-title-column='+i+']').addClass('chapter-col-hidden');
                            $cellsInCol.addClass('chapter-col-hidden');
                        }else{
                            $cellsInCol.removeClass('chapter-col-hidden');
                            $table.find('th[data-title-column='+i+']').removeClass('chapter-col-hidden');
                        }
                }
        });

        return;
    }



/* ========================================================================
 *  AJAX CALLBACKS
 * ======================================================================== */
  //
  //  Hide Empty rows & show non-Empty in a Chapter Table
  //
  //  Since we want to minimize DOM manipulation and paint actions we'll use temporary array to store
  //  the list of rows to hide or show then then do 2 batch paints : show & hide
  //
  function hideRowsInChapterTables() {
    var tables = $('.table-chapter'),
      rowsToHide = new Array(),
      rowsToShow = new Array;

    //all tables in the page
    $.each(tables, function () {
      // get rows but only in tbody, exclude thead
      var $rows = $(this).find('tbody').find('tr');

      //get all form-row field wrappers filtered by visible only
      $.each($rows, function () {
        var $row = $(this),
          hasVisibleChild = ($row.find('.form-row').not('.form-row-hidden')).length,
          rowId = $row.attr('id');

        // got visible => show row if not, hide row
        if (hasVisibleChild > 0) {
          rowsToShow.push('#' + rowId);
        } else {
          rowsToHide.push('#' + rowId);
        }
      });
    });
    // add
    $(rowsToHide.join(', ')).addClass('chapter-row-hidden'),
      $(rowsToShow.join(', ')).removeClass('chapter-row-hidden');

    return;
  }

  /* ========================================================================
   *  AJAX CALLBACKS
   * ======================================================================== */

  //
  //  Hide fields & set their NA values
  //
  function hideFields(fields_to_hide) {
    // map the items with correct DOM prefix
    var field_list = fields_to_hide.map(function (fieldId) {
        return '#' + pfdGlobals.NODE_ID_PREFIX + fieldId;
      }),
      field = new fieldObject(); // field we'll be manipulating

    // loop & add correct class to hide row then set field to it's NA value
    $.each(field_list, function (array_idx, field_ID) {
      field.init(field_ID);
      if (field.fieldNodeId !== null) {
        field.setFieldNA();
      } else {
        if (pfdGlobals.DEBUG_CONSOLE) {
          log('unable to set non-existing field ' + field_ID + ' to ' + pfdGlobals.NA_VALUE);
        }
      }
    });
  }

  //
  // Hide fields & unsset their NA values
  function showFields(fields_to_show) {
    // map the items with correct DOM prefix
    var field_list = fields_to_show.map(function (fieldId) {
        return '#' + pfdGlobals.NODE_ID_PREFIX + fieldId;
      }),
      field = new fieldObject();// field we'll be manipulating

    // loop & unset field's NA value then remove hidding class to show row
    $.each(field_list, function (array_idx, field_ID) {
      field.init(field_ID);
      if (field.fieldNodeId !== null) {
        field.unsetFieldNA();
      } else {
        if (pfdGlobals.DEBUG_CONSOLE) {
          log('unable to unset non-existing field ' + field_ID + ' to ' + pfdGlobals.NA_VALUE);
        }
      }
    });
  }

  //
  //  Manage the Error Sources returned
  //
  function errorSources(errorSrc) {
    // inlike ErrorTarget management (see below) the call to this method can be done either before or after field & Row processing
    // for consistency with legacy & Error Management clusturing it'll be done right after ErrorTarget management
    var field = new fieldObject(); // field we'll be manipulating

    for (var i in errorSrc) {
      field.init('#' + pfdGlobals.NODE_ID_PREFIX + errorSrc[i].source_field_id);
      field.ruleId = errorSrc[i].rule_id;
      field.removeErrorSource();
    }

    for (var i in errorSrc) {
      // Legacy code can feedback some empty messages that we don't want to display
      // they were not visible on legacy as their containers where floated left & would collapse
      if ((errorSrc[i].error_message).length > 0) {
        field.init('#' + pfdGlobals.NODE_ID_PREFIX + errorSrc[i].source_field_id);
        field.errorMessage = (errorSrc[i].error_message).join('<br />').replace(/\n/g, '<br />');
        field.ruleId = errorSrc[i].rule_id;
        field.addErrorSource();
      }
    }
  }

  //
  //  Manage the Error Targets
  //
  function errorTargets(errorTrg) {
    var field = new fieldObject(); // field we'll be manipulating
    // since whe have no control on the targets that need "removing", it'll be done at some other place
    // (when showing / hide a field / Row, we'll remove every existing ErrorTarget class
    // Here we'll just be adding the classes from the target list
    // Hence the call to this method done before dealing with the show / Hide fields (where removing is done)

    for (var i in errorTrg) {
      field.init('#' + pfdGlobals.NODE_ID_PREFIX + errorTrg[i]);
//      field.removeErrorTarget();
      field.addErrorTarget();
    }
  }
})(jQuery);
