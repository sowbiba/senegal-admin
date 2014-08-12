
/*
 *  jQuery topLink Plugin
 *  http://davidwalsh.name/jquery-top-link
 *
*/
;jQuery.fn.topLink=function(e){e=jQuery.extend({min:1,fadeSpeed:200},e);return this.each(function(){var t=$(this);t.hide();$(window).scroll(function(){if($(window).scrollTop()>=e.min){t.fadeIn(e.fadeSpeed)}else{t.fadeOut(e.fadeSpeed)}})})};
