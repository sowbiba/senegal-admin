/* ========================================================================
 * Profideo - Schoko
 * ========================================================================
 * Copyright 2013 Profideo Services.
 * Author: Michel Niassy
 * Date: 19/11/2013
 * ======================================================================== */
/* JSLint */
/* jslint browser: true*/
/* global $, jQuery, pfdGlobals */

/*
 *   This file contains all functions and procedure for modals
 *   to be run on the Revision page and Document page
 *
 */
;(function ($) {
    "use strict";

    $(document).ready(function () {
        openGenericModal();
        bindRevisionButtons();
        bindDocumentButtons();
        bindLegacyAjaxModals();
        bindButtonDisability();



    /**
     * bindLegacyAjaxModals()
     *
     * replace the thickbox modal on legacy modal links
     * Case of basic links with ajax content injection
     *
     * the ajax call is done my GET
     * the caller link must have : class="legacy-ajax-modal" data-remote="ajax_url_to_query"
     *
     * Since we are delgating and using class on delegated item, the callback function need to test for the correct class the the event is not fired multiple times
     *
     * @returns {Boolean}
     */
        function bindLegacyAjaxModals(){
            $(document).on('click',$('.legacy-ajax-modal'), loadAndShowAjaxModal);
        }

        function loadAndShowAjaxModal(evt){
            var url,
                showModal = false;

             if ( $(evt.target).hasClass('legacy-ajax-modal') ){
                  url = $(evt.target).data('remote');
                  showModal = true;
             }

              if( $(evt.target).parent().hasClass('legacy-ajax-modal')){
                  url = $(evt.target).parent().data('remote');
                  showModal = true;
              }

            if (showModal){
                evt.preventDefault();
                $('#myModal').modal('show');
                $.ajax({
                    method : 'GET',
                    url    : url
                }).done(function (data) {
                    $('#myModal').find('.modal-body').html(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    alert('Ajax erreur : ' + errorThrown);
                    log('Ajax erreur : ' + jqXHR + ' ' + textStatus + ' ' + errorThrown);
                });
            }
        }


        /**
         * Reload current page
         */
        function refresh() {
            location.reload();
        }

        /**
         * Opens the generic modal with specific content retrieved from an AJAX call which url is in the data-modal-uri attribute
         */
        function openGenericModal() {
            //listens to modal showing
            $('#myModal').on('show.bs.modal', function(evt) {
                // create Nodes
                var modalHeader = $('<div/>').addClass('modal-header')
                                 .append('<h4/>')
                                       .addClass('modal-title')
                                       .html('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'),
                    modalBody    = $('<div/>').addClass('modal-body')
                                    .html('<p style="font-size:24px; text-align:center;"><i class="fa fa-spinner fa-3 fa-spin"></i>&nbsp;&nbsp;&nbsp;Chargement...</p>'),
                    modalFooter  = $('<div/>').addClass('modal-footer')
                                        .append('<p/>')
                                        .html('&nbsp;');
                // clean current & append correct nodes
                $('#myModal').find('.modal-content')
                             .empty()
                             .append(modalHeader, modalBody, modalFooter);
            });

          $('#myModal').on('hide.bs.modal', function(evt) {
            pfd.helpers.toggleButtonDisability($(".btn.disabled"));
          });

            return;
        }

        /**
         * Bind all listener to the sidebar revision buttons
         */
        function bindRevisionButtons() {
            bindDeleteRevisionButton();
            addLoadPopinEventOnButtons('#revision-set-as-clone');

            return;
        }

        /**
         * Bind all listener to the sidebar document buttons
         */
        function bindDocumentButtons() {
            bindAddUpdateDocumentButtons();
            bindExistingDocumentButton();
            bindDeleteDocumentButton();

            return;
        }

        /**
         * Bind events on click on add or update buttons for a document
         */
        function bindAddUpdateDocumentButtons() {
            addLoadPopinEventOnButtons('.createRevisionDocument, .createDocument, .editRevisionDocument, .editDocument');

            $('#myModal').on('click', '#documentModal', function (evt) {
                onDocumentFormSubmit(evt);
            });
        }

        /**
         * Load popin when click on buttons
         */
        function addLoadPopinEventOnButtons(buttons) {
            $(buttons).on('click', function (evt) {
                loadPopin($(this).data('modal-uri'));
            });
        }

        /**
         * Bind event on click delete revision
         */
        function bindDeleteRevisionButton() {
            $(document).on('click', '.deleteRevision', function (e) {
                loadPopin($(this).data('modal-uri'), initConfirmDeleteRevision);
            });

            return;
        }

        /**
         * Delete a Revision with confirm
         */
        function initConfirmDeleteRevision() {
            var confirmOK = 'supprimer' + $('#revisionNbr').attr('value');
            // activates or disables the submit button
            $('#deleteConfirmCheck')
                .on('keyup blur change',
                function () {
                    if ($(this).val() === confirmOK) {
                        $('#submitDelete').removeClass('disabled');
                    } else {
                        $('#submitDelete').addClass('disabled');
                    }
                }
            );
            // on submit, check that we have correction confirmation value
            // although a wrong confirm should disable the submit, we'll still make the check
            $('#revisionConfirmDeleteForm')
                .on('submit',
                function (evt) {
                    if ($('#deleteConfirmCheck').val() !== confirmOK) {
                        evt.preventDefault();
                        $('#submitDelete').addClass('disabled');

                        return false;
                    }

                }
            );
        }

        /**
         * Link existing documents to a revision button binds & events
         */
        function bindExistingDocumentButton() {
            //Opens document list popin when click on 'Document existant' button
            $('.linkDocuments').on('click', function (evt) {
                evt.preventDefault();

                //Uses the uri defines in the action button
                loadPopin($(this).data('modal-uri'));
            });

            //Posts the documents' association form
            $('#myModal').on( 'click','#link-doc-action', function (evt) {
                evt.preventDefault();

                var form = $('#link-doc'),
                    url  = form.attr('action'),
                    data = form.serialize();

                //shoots ajax
                $.ajax({
                    method : 'POST',
                    url    : url ,
                    data   : data
                }).done(function (data) {
                        if (data.success) {
                            documentSubmitOnSuccessActions(data);
                        } else {
                            $('#myModal .modal-body .alert-danger').remove();
                            $('#myModal .modal-body').prepend('<div class="alert alert-danger"></div>');
                            $('#myModal .modal-body .alert-danger').html(data.message);
                        }
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    alert('Ajax erreur : ' + errorThrown);
                    log('Ajax erreur : ' + jqXHR + ' ' + textStatus + ' ' + errorThrown);
                });
            });

            return;
        }

        /**
         * On document add/update form submit, prevents user if the date is empty, and submit the form with AJAX
         *
         * @param evt
         */
        function onDocumentFormSubmit(evt) {
            evt.preventDefault();

            var $form       = $('#myModal').find('form'),
                dateValue   = $('#releasedAt', $form).val(),
                postData    = $form.serialize(),
                postTarget  = $form.attr('action'),
                isRevision  = $('body').find('.createRevisionDocument, .editRevisionDocument').length > 0;

            // Shows the confirm alert when date value is empty
            // if the user didn't purposely left the date blank, exit, else, proceed
            if ('' === dateValue || undefined === dateValue) {
                if (!window.confirm('Vous n\'avez pas rempli la date d\'édition, êtes-vous sûr de vouloir indiquer que cette date est non-connue ?')) {
                     return false;
                }
            }

            //add fileupload files informations
            $form.find($('input[type="file"].jquery-file-upload')).each(function() {
                var $this            = $(this),
                    fieldName        = $this.attr('name'),
                    filename         = $this.data('filename'),
                    originalFilename = $this.data('original-filename');

                if (filename !== undefined) {
                    postData += '&' + fieldName + '[filename]=' + filename;
                }

                if (originalFilename !== undefined) {
                    postData += '&' + fieldName + '[originalFilename]=' + originalFilename;
                }
            });

            $.ajax({
                url : postTarget,
                data : postData,
                method : 'POST',
                beforeSend : function(xhr){
                    //Adds spinner and disables buttons
                    $('.modal-footer').prepend($('<i id="ajax-submit-spinner" class="fa fa-spinner fa-spin fa-2x"/>'));
                    $('.modal-footer').find('.btn').attr('disable', true);
                }
            })
            .done(function (data) {
                if (data.success) {
                    if(isRevision) {
                        documentSubmitOnSuccessActions(data);

                        // Displays link document buttonl
                        $('.linkDocuments').removeClass('hide');
                    } else {
                        $('#myModal').modal('hide');

                        // Reload the page
                        refresh();
                    }
                } else {
                    $('#myModal').find('.modal-content').html(data.html);
                    $('#myModal').trigger('ajax-call');
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                alert('Ajax erreur : ' + errorThrown);
                console.log('Ajax erreur : ' + jqXHR + ' ' + textStatus + ' ' + errorThrown);
            })
            .then(function () {
                //Removes spinner and enables buttons
                $("#ajax-submit-spinner").remove();
                $('.modal-footer').find('.btn').attr('disable', false);
            });
        }

        /**
         * Refresh document short list (if exists on page), bind events on buttons and displays message
         *
         * @param data
         */
        function documentSubmitOnSuccessActions(data) {
            // Refresh document short list (ex in revision page)
            refreshDocumentShortList($(data.html));

            // bind events in new buttons in DOM
            addLoadPopinEventOnButtons('.createRevisionDocument, .createDocument, .editRevisionDocument, .editDocument');

            // Displays the user message in top of revision form
            displayAjaxMessage(data);
        }

        /**
         * Bind event on click delete document
         */
        function bindDeleteDocumentButton() {
            //Opens document delete popin when click on the trash link in document list
            $(document).on('click', '.deleteDocument', function (e) {
                loadPopin($(this).data('modal-uri'));
            });

            //On delete document action
            $('#myModal').on('click', '#delete-doc-action', function (e) {

                // Execute request to delete document
                $.ajax({
                    url: $(this).data('action-uri')
                }).done(function (data) {

                    if (data.success) {
                        // Reload page
                        refresh();
                    } else {
                        // Display message
                        displayAjaxMessage(data);
                    }

                }).fail(function (jqXHR, textStatus) {
                    alert('Ajax erreur : ' + errorThrown);
                    log('Ajax erreur : ' + jqXHR + ' ' + textStatus + ' ' + errorThrown);
                });
            });

            return;
        }

        /**
         * Load popin content
         *
         * @param url
         */
        function loadPopin(url, callback) {
            //shoots ajax
            $.ajax({
                url: url
            }).done(function (data) {
                $('#myModal').find('.modal-content').html(data);
                $('#myModal').trigger('ajax-call');

                // Call function callback
                if (callback) {
                    callback();
                }
            }).fail(function (jqXHR, textStatus) {
                $('#myModal').find('.modal-content').html('<p class="error">Erreur de Traitement : Error ' + textStatus + '</p>');
            });

            return;
        }

        /**
         * Display ajax message success or fail
         *
         * @param data
         */
        function displayAjaxMessage(data) {

            $("#message-wrapper").empty();

            if (data.success) {
                // Add message to success
                $("#message-wrapper").append('<div class="alert alert-success">' + data.message + '</div>');
            } else {
                // Add message to fail
                $("#message-wrapper").append('<div class="alert alert-danger">' + data.message + '</div>');
            }

            $('#myModal').modal('hide');

            return;
        }

        /**
         * Removes all li elements of documents list, and add current documents in li elements
         *
         * @param Dom node el
         */
        function refreshDocumentShortList(el) {
            var $ul = $('.documentation-exist');
            $ul.find('li').remove().end().append(el);
        }

      function bindButtonDisability() {
        $(document).on('click', '.btn', function(e){
          pfd.helpers.toggleButtonDisability(this);

          return true;
        });
      }

    });
})(jQuery);