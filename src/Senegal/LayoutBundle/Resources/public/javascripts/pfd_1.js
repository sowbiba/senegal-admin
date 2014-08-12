/**
 * Javascripts for Profideo
 */
;
(function ($) {
    $(document).ready(function () {
        initHelpers();
        initToolTips();
        initDeleteRevision();
        //initSidebarToggler();
     //   initDisplayDocumentDescription();
      //  initDisplayDocumentForm();
       // transformTypeTextToDate();
       // openModalIfError();

//        $('body').delegate('input.date', 'blur', function() {
//            $(this).attr('date', $(this).val());
//        });
//
//        $('body').delegate('input#documentModal, input#editDocumentModal','click', function(e) {
//            e.preventDefault();
//
//            var form       = $(this).parents('.modal').children('.modal-body').children('form');
//            var $dateInput = form.find('input.date');
//            var dateValue  = $dateInput.attr('date');
//
//            if ('' === dateValue) {
//                if (window.confirm('Vous n\'avez pas rempli la date d\'édition, êtes-vous sûr de vouloir indiquer que cette date est non-connue ?')) {
//                    form.submit();
//                }
//            } else {
//                form.submit();
//            }
//        });
//





       // smooth scrolling for all anchors
        $.localScroll({
            duration:500
        });

        // chosen plugin on select drop down for forms
        // will be used only in sidebar as it triggers lags
//        $('aside select').chosen({
//            allow_single_deselect:   true,
//            no_results_text:         'Pas de résultat',
//            placeholder_text_single: 'Veuillez choisir une option'
//        });

        // link to scroll in page top
        $('#top-link').click(function(e) {
            e.preventDefault();
            console.log('toto');
            $.scrollTo(0,300);
        });

        // Manages the running speed
        $('#top-link').topLink({
            min: 400,
            fadeSpeed: 500
        });



        /**
         * initHelpers
         *
         * Generic helpers.
         */
        function initHelpers() {
            // all .nogo classes elements will have their click event cancelled
            $('.nogo').on('click', function (evt) {
                evt.preventDefault();
                return false;
            })
            // close a modal window link
            $('.btn-close-modal').on('click',
                function (evt) {
                    evt.preventDefault();
                    modalID = $(this).data('modal-id');
                    $('#' + modalID).modal('hide');
                });
        }





        /**
         * Tooltips
         */
        function initToolTips() {
            var tipTopOptions = {}, // default = top
                tipBottomOptions = {'placement': 'bottom'},
                tipRightOptions = {'placement': 'right'};

            $('.tip').tooltip(tipTopOptions);
            $('.tip-top').tooltip(tipTopOptions);
            $('.tip-bottom').tooltip(tipBottomOptions);
            $('.tip-right').tooltip(tipRightOptions);
        }

        /* / Tooltips */


        /**
         * Delete a Revision
         */
        function initDeleteRevision() {
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
            )
            // on submit, check that we have correction confirmation value
            // althought a wrong confirm should disable the submit, we'll still make the check
            $('#revisionConfirmDeleteForm')
                .on('submit',
                function (evt) {
                    if ($('#deleteConfirmCheck').val() != confirmOK) {
                        evt.preventDefault();
                        $('#submitDelete').addClass('disabled');
                        return false;
                    }

                }
            );
        }

        /**
         * initDeleteRevision
         */

        /**
         * DisplayDocumentDescription
         *
         * display the data for a documents in an .popover
         *
         * @TODO : check TBS for popover events callbacks
         */
        function initDisplayDocumentDescription() {
            //default options for the pop-over init
            var options = { title: 'Détails du document',
                trigger: 'hover',
                content: '<i class="icon-spinner icon-spin icon-2x"></i>',
                html: true
            };
            $(".doc-popover").popover(options);

            // cancel the click envent on link popover trigger
            $(".doc-popover").on('click', function () {
            });

            // get the document's details async & replace the initialized pop-over's .content div
            $(".doc-popover").on('mouseenter', function () {
                var $this = $(this),
                    targetUri = $this.data('target');

                $.ajax({
                    url: targetUri
                }).done(function (data) {
                        $this.next('.popover').find('.popover-content').html(data);
                    }).fail(function (jqXHR, textStatus) {
                        $this.next('.popover').find('.popover-content').html('<p class="error">Erreur de Traitement : Error ' + textStatus + '</p>');
                    });
            });

            // if not hidden, hide it... Just in case.. Should be taken care of
            $(".doc-popover").on('mouseleave', function () {
                $(this).popover('hide');
            });

        }

        /**
         * initDisplayDocumentDescription
         */
        function initDisplayDocumentForm() {
            $('.link-update').on('click', function () {
                var id = $(this).data('id'),
                    target = $(this).data('url'),
                    modalEmpty = 'Chargement...',
                    modalClone = $('#DocEditModal').clone();

                $('#DocEditModal').on('show', function () {
                    $.ajax({
                        url: target
                    }).done(function (data) {
                            $('#DocEditModal').find('.modal-body').html(data);
                            transformTypeTextToDate();
                        }).fail(function (jqXHR, textStatus) {
                            $('#DocEditModal').find('.modal-body').html('<p class="error">Erreur de Traitement : Error ' + textStatus + '</p>');
                        }).always(function (data) {
                            //console.log(modalClone);
                        });
                })
                    .on('hidden', function () {
                        $(this).remove('#DocEditModal');
                        $('body').append(modalClone);
                    });
            });
        }

    });

    /**
     * Transform all type text field's with class date to type date
     */
    function transformTypeTextToDate() {
        // @TODO: [DATE FORMAT] PR needed to remove that (Bad validation on a date type if we constraint format with symfony form)
        $('.date').each(function() {
            var $date      = $(this);
            var $dateValue = $date.val();

            console.log($date);
            console.log($dateValue);

            $date.prop('type', 'date');
            $date.attr('date', $dateValue);

            if ($dateValue && checkInput('date')) {
                if ($dateValue.match(/.*\/.*\/.*/)) {
                    var $dateSplit = $dateValue.split('/');
                    var $dateValue = $dateSplit[2] + '-' + $dateSplit[1] + '-' + $dateSplit[0];
                }

                $date.val($dateValue);
            }
        });
    }

    /**
     * Check if modal is on error and open form
     */
    function openModalIfError() {
        var $modal    = $('#DocAddModal');
        var isOnError = $modal.data('error');

        if (isOnError) {
            $modal.modal({
                'show' : true
            });
        }
    }

    /**
     * Check support for html5 type
     *
     * @param type
     * @returns {boolean}
     */
    function checkInput(type) {
        var input = document.createElement("input");
        input.setAttribute('type', type);
        return input.type == type;
    }
})(jQuery);