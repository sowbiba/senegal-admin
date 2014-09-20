/* ========================================================================
 * Profideo - Schoko
 * ========================================================================
 * Copyright 2013 Profideo Services.
 * Author: Ronan Donniou
 * Date: 29/11/2013
 * ======================================================================== */
/* JSLint */
/* jslint browser: true*/
/* global $, jQuery, pfdGlobals */



/*
* ----------------------
*  AFFIX SIDEBAR
* ----------------------
*/

;(function ($) {
    "use strict";

    // Init on DOM ready
    $(document).ready(function () {

        // init affix on load
        enableIfNeededAffixSidebar();

        // on resize enable or disable sidebar depending on needs
        $(window).on('resize', function(){
            enableIfNeededAffixSidebar();
        });

        // we are on the revision form page => init scroll spy on chapterNav
        if ($('#pageEditRevisions').length > 0){
            $('body').scrollspy({ target: '#chapterNav' });
        }
    });


    // enable affix = init or disable/remove in case of screen resolution problems
    // => if the viewport is of lower height than the sidebar height,
    // do not affix the sidebar or we wont be able to view the sidebar's bottom
    // and there is a scrolling bug if the content is of lower height than the sidebar #7155
    function enableIfNeededAffixSidebar(){
        // if we have a sdebar
        if($('aside.aside').length > 0) {
            // if we are in a buggy case = low height resolutions
            if ($('.aside-internal').outerHeight() > $(window).height()){
                $(window).off('.affix');
                $(".aside-internal")
                    .removeClass("affix affix-top affix-bottom")
                    .removeData("bs.affix");
            }else{
                initAffixSidebar();
            }
        }
    }

    // get and apply width and height to element of the sidebar
    // since we use the viewport's height some other places, we'll get that as the returned value
    function computeAndApplyAffixWidth(){
        // vh = viewport height
        // tlp = "top link" position from bottom
        // acp = accordion position in the affix from top
        // nbrp = number of panels in accordion
        // ah = height available for the accordion
        // pheadh = height of one panel's heading
         var tlp    = $('#top-link').css('bottom'),
             vh     = $(window).height(),
             accordion = $('#accordion');

        if (accordion.length > 0) {
             var acp    = accordion.position(),
                 nbrp   = $('.panel-default', accordion).length,
                 pheadh = $('.panel-heading:first', accordion).outerHeight(true);

            tlp =  parseInt(tlp.replace('px',''));
            acp = acp.top;

            // ah = accordion overall height
            // ph = height of one panel of the accordion
            var ah = vh - tlp - acp - nbrp*pheadh,
                ph = ah - nbrp*pheadh - nbrp*4 - 2; // we got a 4px margin between panels & a 2px border

            $('.panel-body', accordion).css({'max-height': ph +'px', 'overflow-y':'auto'});
            $('#accordion').css({'height': ah +'px', 'overflow-y':'hidden'});
        }

        return vh;
    }

    /**
     * Make the sidebar always visible
     *
     * @param type
     * @returns {boolean}
     */
    function initAffixSidebar() {
        // aside top can be different => affix top is where aside starts,  minus 10(e.g. affix top offset position)
        var affixTop = $('aside.aside').offset().top;

        // set affix on correct element & assign correct width as it's a fixed element
        $('.aside-internal').affix({
          offset: {top: parseInt(affixTop)-10 }
        }).css({'width': parseInt($('aside').width())-2 }); // -2px because of border-width

        var x = computeAndApplyAffixWidth();
        // if window is resized, we must reset the afix container's width & internal sidebar elements.
        $(window).on('resize', function(){
            $('.affix').css({'width':parseInt($('aside').width())-2 });
            $('.affix-top').css({'width': parseInt($('aside').width())-2 })
            computeAndApplyAffixWidth();
        });
    }

})(jQuery);
