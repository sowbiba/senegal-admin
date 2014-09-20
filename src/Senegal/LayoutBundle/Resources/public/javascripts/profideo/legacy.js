/**
 * Javascripts for Profideo
 *
 *
 * This file shall contains function used in the observer Legacy application that need to be loaded here and there
 * on some embedded schok-obs pages
 */

/* JSLint */
/* jslint browser: true*/
/* global $, jQuery, pfdGlobals */



/* double_list_submit*/



;(function ($) {
    "use strict";

    $(document).ready(function () {

        /* Module Invoice
        ------------------ */
        if ($('#a_invoice_list').length > 0) {
            initInvoiceReportingDatePickers();
            checkInvoiceReportingDatesOnSubmit();
       }

       if ($('#a_listesvaleur_edit').length > 0) {
       }

        /* Module Champs
        ------------------ */
        if ($('#a_champs_edit').length > 0) {
            confirmDisableSourceableFieldOnSubmit();
        }

    });



    /* Module Invoice
    ------------------ */
    /**
    * Check that export start_date and end_date have a value
    */
    function checkInvoiceReportingDatesOnSubmit() {
        var $form = $('#export_invoice_reporting');

        $('#btn_export_invoice_reporting').on('click', $form, function(event) {
            event.preventDefault()  ;
            if( ( $('#start_date').val() === '' ) || ( $('#end_date').val() === '' ) ) {
                alert( 'Merci d\'entrer une date de début et de fin' );
                return false;
            }
           $form.submit();
        });
    }

    /**
    * When clicking on our dayes picto, open the matching datepicker
    */
    function initInvoiceReportingDatePickers() {
        $('#img_start_date, #img_end_date').on('click', function(evt) {
            $(evt.target).prevAll('input').trigger('focus');
        });
    }

    /* Module Champs
    ------------------ */
    /**
     * In field form edition, display a confirm popup after submit when the sourceable option is disabled
     */
    function confirmDisableSourceableFieldOnSubmit() {

        var $form = $('#sf_admin_edit_form');

        $('#sf_admin_action_save_field, #sf_admin_action_save_field_and_add').on('click', $form, function() {
            var $checkbox = $('#champs_is_sourceable');

            if (!$checkbox.is(':checked') && $checkbox.data('is-sourceable')) {
                if (!confirm('Attention cette opération va supprimer de la base toutes les sources éventuellement déjà renseignées pour ce champ.\n'
                              + 'Cette suppression sera irrévocable. Etes-vous sûr de vouloir continuer ?')) {
                     return false;
                }
            }
            $form.submit();
        });
    }

})(jQuery);




/*
 *
 *  Multi Modules Function that are not bound  to any DOM element but called inline
 *
 */

     /*
     Multi Select selection swapper
      *
      */
    function double_list_move( src, dest) {
            src.find('option:selected').remove().appendTo(dest);
    }


    function double_list_submit(form_name) {
      // default id to allow using a custom form id
      if( ! form_name ) {
        var form_name = '#sf_admin_edit_form';
      }
      var form = $(form_name);

      var $multiples = $('.sf_admin_multiple-selected');
      $.each($multiples, function(){
          $el = $(this);
          $el.find('option').attr('selected','selected');
      });
    }


