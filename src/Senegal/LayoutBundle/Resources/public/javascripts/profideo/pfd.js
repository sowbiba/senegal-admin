/**
 * Javascripts for Profideo
 *
 */

/* JSLint */
/* jslint browser: true*/
/* global $, jQuery, pfdGlobals */

;(function ($) {
    "use strict";

    $(document).ready(function () {
        initHelpers();
        initToolTips();
        initSidebarToggler();
        initDisplayDocumentDescription();
        transformTypeTextToDate();
        initRolesSidebarButtonsAction();
        initRolesAutoCheck();
        initFileUpload();

        if ($('#pageHomepage').length > 0){
            bindHomeInputs();
        }


//        $.removeCookie('bgcolor', {path: '/'});
        var userColor = $.cookie('bgcolor');
        if (userColor != undefined ){
            $('body, .page-wrapper').css('background-color', '#' + userColor);
        }


        /*
         *  Input on Homepage
         */
        function bindHomeInputs() {
            $('input').on('keypress', $('.home-wrapper'), function(evt){
                    var key         = evt.which,
                        targetInput = evt.target;
                    if (key === 13) {
                        var url       = $(targetInput).data('target'),
                            paramName = $(targetInput).prop('name'),
                            paramValue= $(targetInput).val();
                       window.location.href = url + "?" + paramName + '=' + paramValue;
                    }
            });
        }

        // the following 15 lines would need some coments !!!
        $('body').on('blur', 'input.date', function () {
            $(this).attr('date', $(this).val());
        });

        // gravatar click link
       if ( $('.gravatar').length > 0 ){
           $('.gravatar').on('click', function(evt){
                evt.preventDefault();
                window.open($(this).attr('href'));
           });
       }


        $('.bubbleInfo ').popover({
          trigger: 'hover',
          html: true,
          content : function(){ return $(this).find(".bubbleinfo-text").html()}
        });


        $('#myModal').on('ajax-call', initFileUpload);
        $('#myModal').on('ajax-call', initDisplayDocumentDescription);

        function initFileUpload() {
            $('input[type="file"].jquery-file-upload', $(this)).fileupload({
                dataType: 'json',
                maxNumberOfFiles: 1,
                start: function() {
                    //Add spinner
                    $(this).parents('.form-row:first').find('.fileinput-button').parent().append($('<i id="file-load-spinner" class="fa fa-spinner fa-spin fa-2x"/>'));
                },
                done: function (e, data) {
                    var $uploader = $(this),
                        $uploaderParent = $uploader.parents('.row-file');

                    if(data.result.filename !== undefined) {
                        // Fills data attributes and hide file errors bloc
                        $uploader.data('filename', data.result.filename);
                        $uploader.data('originalFilename', data.files[0].name);
                        $uploaderParent.find('.file-info').html('<div class="alert alert-info">Fichier actuel : '+data.files[0].name+'</div>');
                        $uploaderParent.find('.form-errors-list').remove();
                    } else {
                        // Cleans data attributes, shows the error message and cleans the original filename bloc if it's showing
                        $uploader.data('filename', '');
                        $uploader.data('originalFilename', '');
                        $uploaderParent.find('label').after('<ul class="form-errors-list"><li>Fichier trop volumineux</li></ul></ul>');
                        $uploaderParent.find('.file-info').html('');
                    }

                    // Removes spinner
                    $("#file-load-spinner").remove();
                }
            });
        }

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
            });

            // smooth scrolling for all anchors
            $.localScroll({
                duration: 500
            });

            // link to scroll in page top
            $('#top-link')
                .topLink({min: 400, fadeSpeed: 250})
                .click(function (evt) {
                    evt.preventDefault();
                    $.scrollTo(0, 300);
                }
            );

            // chosen plugin on select drop down for forms
            // will be used only in sidebar as it triggers lags
            $('aside select').chosen({
                allow_single_deselect:   true,
                no_results_text:         'Pas de résultat',
                placeholder_text_single: 'Veuillez choisir une option',
                width: '100%'
            });


           // generic pop-overs
            $(".popovers").popover();

           // color picker
           var defColor = ( $.cookie('bgcolor') != undefined ) ? $.cookie('bgcolor') : 'ffffff';
            $('#colorPicker').colpick({
                layout:'hex',
                submit:false,
                color : defColor,
                onChange:function(hsb,hex,rgb,el,bySetColor){
                     $('body, .page-wrapper').css('background-color', '#' + hex);
                     $.cookie('bgcolor', hex, { expires: 21, path: '/' });
                }
            });



         }

        /**
         * Tooltips
         */
        function initToolTips() {
            var tipTopOptions    = {}, // default = top
                tipBottomOptions = {'placement': 'bottom'},
                tipRightOptions  = {'placement': 'right'},
                tipLeftOptions   = {'placement': 'left'};

            $('.tip').tooltip(tipTopOptions);
            $('.tip-top').tooltip(tipTopOptions);
            $('.tip-bottom').tooltip(tipBottomOptions);
            $('.tip-right').tooltip(tipRightOptions);
            $('.tip-left').tooltip(tipLeftOptions);
        }



        function initSidebarToggler() {

               $('#sidebar-toggler').on('click', function(evt){
                   evt.preventDefault();
                   var $toggler = $(this);

                   if ($toggler.hasClass('sidebar-shown')){
                        $('aside.aside').fadeOut(250, function(){
                             $('section.content').addClass('col-12').removeClass('col-9');
                             $toggler.find('i.fa')
                                        .addClass('fa-angle-left')
                                        .removeClass('fa-angle-right')
                                        .end()
                                     .attr('data-original-title', 'Afficher la barre latérale')
                                     .addClass('sidebar-hidden').removeClass('sidebar-shown')
                                     .parent('div.clearfix')
                                     .appendTo('body');
                         });
                   }else{
                        $('section.content').removeClass('col-12').addClass('col-9');
                        $toggler.find('i.fa')
                                    .addClass('fa-angle-right')
                                    .removeClass('fa-angle-left')
                                    .end()
                                .attr('data-original-title', 'Masquer la barre latérale')
                                .addClass('sidebar-shown').removeClass('sidebar-hidden')
                                .parent('div.clearfix')
                                .prependTo('.aside-internal');

                        $('aside.aside').fadeIn(250);
                   }
               });
        }


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
                content: '<i class="fa fa-spinner fa-spin fa-2x"></i>',
                html: true
            };
            $('body').find('.doc-popover').popover(options);

            // cancel the click envent on link popover trigger
            $('body').find('.doc-popover').on('click', function () {
            });

            // get the document's details async & replace the initialized pop-over's .content div
            $('body').find('.doc-popover').on('mouseenter', function () {
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
            $('body').find('.doc-popover').on('mouseleave', function () {
                $(this).popover('hide');
            });

        }

        /**
         * initRolesSidebarButtonsAction
         *
         * Top buttons sidebar action save.
         * @link /utilisateur/1/roles/espri
         */
        function initRolesSidebarButtonsAction() {
            // save roles
            $('#roles-save').on('click', function (evt) {
                evt.preventDefault();
                $('#rolesEspriEdit').submit();
            });
        }

        /**
         * initRolesAutoCheck
         *
         * Checks automatically previous role in a scope when click on one and unchecked the next
         * when unchecks.
         *
         * @link /utilisateur/1/roles/espri
         */
        function initRolesAutoCheck() {
            $('.roles-auto-check input').on('click', function () {
                if ($(this).is(':checked')) {
                     $(this).parent('div').prevAll().find('input').prop('checked', true);
                } else {
                     $(this).parent('div').nextAll().find('input').prop('checked', false);
                }
            });
        }

        /**
         * Transform all type text field's with class date to type date because symfony is generate text type with single_text widget option
         */
        function transformTypeTextToDate() {
            // @TODO : Follow https://github.com/symfony/symfony/search?q=date+html5&type=Issues for a resolution in next releases of Symfony
            $('.date').each(function() {
                var $date      = $(this),
                    $dateValue = $date.val();

                // Change the type of field and define the date attr to work with it on blur of field
                $date
                    .prop('type', 'date')
                    .attr('date', $dateValue)
                ;

                if ($dateValue && checkInput('date')) {
                    // Check the format of date to rebuild the date or not
                    if ($dateValue.match(/.*\/.*\/.*/)) {
                        var $dateSplit = $dateValue.split('/'),
                            $dateValue = $dateSplit[2] + '-' + $dateSplit[1] + '-' + $dateSplit[0];
                    }

                    $date.val($dateValue);
                }
            });
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

    });

})(jQuery);
