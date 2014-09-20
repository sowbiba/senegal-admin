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

// @INFO
// BASIC ALGORYTHM DESCRIPTION
// ==================
//
// we'll walk the DOM without knowledge of it's structure
// start at leaf level chapter.
// foreach :
//   count of visible rows
//   count =0 => hide, >0 => leave visible
// end foreach
// Move up one level
// foreach :
//   parent level... check first for occurence of direct chapter children
//   has at least one ? => exit
//   No sub ? => check row counts
// end foreach
// Loop Up in the DOM until top level is processed
//

 //
 // Show or Hide a Chapter
 //
 //  Check if Chapter has visible Sub-Chapters YES=exit, NO=continue
 //  Check if Chapter has visible Rows YES=exit, NO=hide
 //  Checks are done for direct children only
function showHideChapter(el) {

    "use strict";

    // jQuery Node Item
    var $context = $('#revision-form-content');
    var $el = $(el, $context);

    // The Chapter has visible children sub-chapters
    // only make sure to show the Chapter if hidden & the entry in the sidebar then exit
    if ($el.find('.' + pfdGlobals.CHAPTER_CLASS).not('.' + pfdGlobals.HIDE_CHAPTER_CLASS).length > 0) {

        if ($el.hasClass(pfdGlobals.HIDE_CHAPTER_CLASS)) {
            $el.removeClass(pfdGlobals.HIDE_CHAPTER_CLASS);
            showHideChapterInSidebar(el, 'show');
        }
        if (pfdGlobals.DEBUG_CONSOLE) {
            log(el, 'has non hidden child chapters');
        }

        return;
    }

    // check the form rows
    // get all the rows that are not hidden rows
    var non_hidden_rows = $el.find('.' + pfdGlobals.FORM_ROW_CLASS).not('.' + pfdGlobals.HIDE_ROW_CLASS);

    // if > 0; then we have visible rows hence no hidding the chaper
    // Make sure we show the Chapter then exit & the entry in th sidebar
    if (non_hidden_rows.length > 0) {
        if ($el.hasClass(pfdGlobals.HIDE_CHAPTER_CLASS)) {
            $el.removeClass(pfdGlobals.HIDE_CHAPTER_CLASS);
            showHideChapterInSidebar(el, 'show');
        }
        if (pfdGlobals.DEBUG_CONSOLE) {
            log(el, ' has visible rows');
        }

        return;
    }

     // if we arrived here, then we shall hide the Chapter
    $(el).addClass(pfdGlobals.HIDE_CHAPTER_CLASS);

    // we need to hide the chapter in the sidebar nav
    showHideChapterInSidebar(el, 'hide');

    if (pfdGlobals.DEBUG_CONSOLE) {
        log(el, 'Hide Chapter');
    }

    return;
};


 //
 // Show or Hide a Chapter in the Sidebar
 //
 //  input : el = chapter element from content
 //  action : show / hide action to perform
 //
function showHideChapterInSidebar(el, action){

    var chapterId = $(el).attr('id'),
        sidebarContext = $('#chapterNav'),
        sidebarEntries = $('a', sidebarContext ),
        sidebarElement = sidebarEntries.filter( function(index){
            return $(this).attr('href') === '#' + chapterId;
        });

        // since we" have only 2 levels in the sidebar, check the that the entry we want actually exists or exit
        if (!($(sidebarElement).length > 0)) {
            if (pfdGlobals.DEBUG_CONSOLE) {
                log('No Sidebar Entry for chapter : ' + '#' + chapterId);
            }
            return false;
        }

        if (action == 'hide'){
            $(sidebarElement)
                    .parent('li')
                    .addClass(pfdGlobals.HIDE_CHAPTER_SIDEBAR_CLASS);

            if (pfdGlobals.DEBUG_CONSOLE) {
                log('Hidding Sidebar chapter : ' + '#' + chapterId);
            }
        }else{
            $(sidebarElement)
                    .parent('li')
                    .removeClass(pfdGlobals.HIDE_CHAPTER_SIDEBAR_CLASS);

            if (pfdGlobals.DEBUG_CONSOLE) {
                log('Showing Sidebar chapter : ' + '#' + chapterId);
            }
        }

        return;
}


 //
 // Show or Hide all Chapters based on a level
 //
 //  if no level assigned, start at max_level
 //  Get all chapters of the current level
 //  for each show or hide the processed occurence
 //
 //  When all processed at the current level, move up in the levels
 //
 //  Loop until top level
function showHideChapters(level) {

    "use strict";

     // top of tree
    if (level === 0) {
        if (pfdGlobals.DEBUG_CONSOLE) {
             log('Done all levels. We are at top');
        }

        return;
    }

    // general context of our tree : only content not dealing with sidebarnav
    var $context = $('#revision-form-content'),

     // make sure it works with empty call; will start at constant defined bottom max level
        current_level = (level === "" || level === "undefined" || !level) ? pfdGlobals.LEAF_LEVEL_CHAPTER : level ,

     // get the chapters Node items
        $chapter = $('.level-' + current_level, $context);

    // Deal with the Chapters from the current level if we have some
    if ($chapter.length != 0) {
        if (pfdGlobals.DEBUG_CONSOLE) {
            log('Deal with ' + $chapter.length + ' chapters level-' + current_level);
        }
        $.each($chapter, function (k, v) {
            showHideChapter(v);
        });
    } else {
      if (pfdGlobals.DEBUG_CONSOLE) {
        log('No Chapter level: ' + current_level);
      }
    }

    // Done with the Current level, move UP one level
    showHideChapters(parseInt(current_level, 10) - 1);

    return;
};
