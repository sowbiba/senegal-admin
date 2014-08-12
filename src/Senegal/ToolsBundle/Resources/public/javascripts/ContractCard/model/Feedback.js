;(function($) {

  var Feedback = {

    // Defines the timer error delay (in miliseconds - after what time we stop showing a 'loading')
    timerDelay:       30000,

    timer:            null,
    loadingTemplate:  null,
    errorTemplate:    null,
    feedbackDiv:      null,
    dialogConfig:     null,
    
    init : function() {

      // Retrieve the templates
      this.loadingTemplate = $('#feedback_loading_template');
      this.errorTemplate = $('#feedback_error_template');
      $('#feedback_templates').remove();

      // Create the feedback container
      var feedbackDiv = $('#feedbackOverlay');
      if(!feedbackDiv.length) {
        $('body').append('<div id="feedbackOverlay"></div>');
      }
      this.feedbackDiv = $('#feedbackOverlay');

      // Define the dialog config
      this.dialogConfig = {
        modal: true,
        closeOnEscape : false,
        draggable : false,
        resizable : false
      };
    },
    loading: function(message, noTimeOut) {
      CC.Logger.info('Feedback loading');
      // Clear the timer which might be set when loading was called
      this.clearTimer();

      // Default loading message
      if(typeof(message) == 'undefined') {
        message  = 'Chargement en cours ...';
      }

      // Create a copy of the template, we don't want to modify the original one
      var template = this.loadingTemplate.clone();
      
      // Populate the template with our message
      this.feedbackDiv.html(template.html().replace('#######', message));

      // Instantiate the dialog
      this.feedbackDiv.dialog(this.dialogConfig);

      // Give an id to the dialog div (for CSS)
      this.feedbackDiv.dialog('widget').attr('id', 'feedbackOverlayDialog').removeClass('feedback_error').addClass('feedback_template feedback_loading');

      if(typeof(noTimeOut) == 'undefined' || noTimeOut == false) {
        // Set up a timer after which we will display an error
        this.timer = setTimeout(function() {
          CC.Feedback.error();
        }, this.timerDelay);
      }
    },
    error: function(message, action, hideDetail) {

      // Clear the timer which might be set when loading was called
      this.clearTimer();
      
      // Default error message
      if(typeof(message) == 'undefined') {
        message = 'Une erreur est survenue !';
      }
      
      // Hide message detail
      if(typeof(hideDetail) == 'undefined') {
        hideDetail = false;
      }

      // Default action is to reload the page
      // actions are defined as a class of the link defined in the partial _feedback_templates
      if(typeof(action) == 'undefined') {
        action = 'reload';
      }
      if (action == 'hide') {
        this.addToOperationStack(message, '', true);
      }
      // Create a copy of the template, we don't want to modify the original one
      var template = this.errorTemplate.clone();

      // Remove all actions except the one allowed
      //template.find('a.action:not(.' + action +')').remove();

      // Give an id to the dialog div (for CSS)
      this.feedbackDiv.dialog('widget').attr('id', 'feedbackOverlayDialog').removeClass('feedback_loading').addClass('feedback_template feedback_error');
      CC.Logger.error(message);
      
      // add buttons to the dialog
      switch(action) {
       
        case 'reload' :
          this.feedbackDiv.dialog( "option", "buttons", { "Recharger la page": function() { location.reload(); } } );
        break;

        case 'close' :
        case 'hide' :
          this.feedbackDiv.dialog( "option", "buttons", { "Fermer": function() { $(this).dialog("close"); } } );
        break;
        
        case 'hide-close' :
          this.feedbackDiv.dialog( "option", "buttons", { "Fermer": function() {$(this).dialog("close");$('#editor_modal').dialog("close");} } );
          hideDetail = true;
        break;
      }
      
      if (hideDetail) {
        $('.detail', template).hide();
      }
      
      // Populate the template with our message
      this.feedbackDiv.html(template.html().replace('#######', message));

      // Instantiate the dialog
      this.feedbackDiv.dialog(this.dialogConfig);
      
    },
    hide: function() {

      // Clear the timer which might be set when loading was called
      this.clearTimer();

      // Hide the dialog
      this.feedbackDiv.dialog('close');
      CC.Logger.info('Feedback closed');
    },
    clearTimer: function() {
      clearTimeout(this.timer);
      this.timer = null;
    },
    addToOperationStack: function(message, titleInfo, isError) {
      if(typeof(titleInfo) == 'undefined') {
        titleInfo = '';
      }
      if(typeof(isError) == 'undefined') {
        isError = false;
      }
      var iconName = 'info';
      if (isError) {
        iconName = 'error';
      }
      var $content = $('<li class="' + iconName + '" title="' + titleInfo + '"> ' + message + '</li>');
      
      
      $('#operation_stack').prepend($content);
      
      $content.effect("pulsate", {times : 1}, 1000);
    }
  }

  // This class is available in namespace CC only
  // If this namespace doesn't exist, create it.
  if (typeof window.CC == "undefined") {
    window.CC = {};
  }

  window.CC.Feedback = Feedback;
  
}) (jQuery);