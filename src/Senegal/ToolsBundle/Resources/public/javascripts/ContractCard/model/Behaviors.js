;(function($) {
  
  var Behaviors = {

    initNode: function(oObject) {
      $('li.node', oObject).each(function() {
        var oPresentation = CC.NodeCollection.get(this);

        // Mark the children as loaded
        if(oPresentation) {
          var bChildrenLoaded = oPresentation.domNode.children('ul').children().length;

          oPresentation.controller.abstraction.childrenLoaded = bChildrenLoaded;
          oPresentation.isInDom = true;

          // Collapse the node if there is no child node
          bChildrenLoaded ? oPresentation.expand(false) : oPresentation.collapse(false);
        }
      });
    },
    initSortable: function(oObjects) { // Inits the sortable behavior on some object(s)
      $(oObjects).sortable({
        items:       "> li.node",
        handle:      "div.label",
        axis:        "y",
        cursor:      "n-resize",
        placeholder: "node sortablePlaceholder",
        connectWith: "#fieldList ul",
        revert:      true,
        toleranceElement : '> div',
        start:       CC.Behaviors.sortableStartCallback,
        stop:        CC.Behaviors.sortableStopCallback,
        over:        CC.Behaviors.sortableOverCallback
      }).disableSelection();
    },
    sortableStartCallback: function(event, ui) { // Default sortable start callback
      if(typeof(ui) != 'undefined') {
        CC.Behaviors.hideTools();
        if(CC.NodeCollection.get(ui.item).expanded) {
          $(ui.item).children('ul').hide();
        }
      }
    },
    sortableStopCallback: function(event, ui) { // Default sortable stop callback
      CC.Behaviors.showTools();
      if(CC.NodeCollection.get(ui.item).expanded) {
       $(ui.item).children('ul').show();
      }
      var oPresentation       = CC.NodeCollection.get(ui.item);
      var ulReceiver          = $(ui.item).parent('ul');
      var liParentNode        = ulReceiver.parent('li');
      var oParentPresentation = CC.NodeCollection.get(liParentNode);
      var iPosition           = $(ui.item).prevAll('li').length;
      if(liParentNode.hasClass("allowChildren") || liParentNode.hasClass("root")) {
        var regexp            = new RegExp("nbAllowedChildren_([0-9]+)", "g");
        var nbAllowedChildren = -1;
        if(regexp.test(liParentNode.attr('class'))) {
          regexp.exec(liParentNode.attr('class'));
          nbAllowedChildren = RegExp.$1;
        }
        if(nbAllowedChildren == -1 || (ulReceiver.children('li').length -1) < nbAllowedChildren ) {
          oPresentation.moveEvent(oParentPresentation, iPosition);
        } else {
          $(this).sortable('cancel');
          $(ui.sender).sortable('cancel');
          CC.Feedback.error("Limite de noeud fils atteinte : " + nbAllowedChildren + " autorisé(s).", 'hide', true);
        }
      }
               
    },
    initDroppable: function(oObjects, acceptSelector, dropCallback) { // Inits droppable behavior on given objects, accepting only specified elements, executing callback
      if(typeof(dropCallback) == 'undefined') {
        dropCallback = CC.Behaviors.addChildDroppableCallback;
      }

      if(typeof(acceptSelector) == 'undefined') {
        acceptSelector = "#fieldChooser > li";
      }
      

      $(oObjects).droppable({
        accept:      acceptSelector,
        activeClass: "availableDropZone",
        hoverClass:  "dropZone",
        tolerance:   "pointer",
        greedy:      true,
        drop:        dropCallback
      });
    },
    addChildDroppableCallback: function( event, ui) { // default droppable callback
      var oParentPresentation = CC.NodeCollection.get($(this).parent('li'));

      //CC.Logger.info(oParentPresentation);

      oParentPresentation.expand(false);
      var position = 0;
      if(event.ctrlKey) {
        position = $(this).parent('li').children("ul").children("li").length;
      }
      oParentPresentation.addChildEvent(ui.draggable,position);
    },
    tableDroppableCallback: function(event, ui) {
      if(ui.draggable.parents('#fieldChooser').length > 0) { // replace cell content by a new node
        CC.Behaviors.replaceByNewCellDroppableCallback(event, ui, this);
      } else { // replace cell content by an existing node
        CC.Behaviors.replaceByExistingCellDroppableCallback(event, ui, this);
      }
    },
    replaceByNewCellDroppableCallback: function( event, ui, droppable) {
      CC.Logger.info("replaceByNewCellDroppableCallback");
      var oDroppedPresentation = CC.NodeCollection.get($(droppable).find(' > ul > li.node'));

      oDroppedPresentation.replaceByNew(ui.draggable, true);
    },
    replaceByExistingCellDroppableCallback: function( event, ui, droppable) {
      var oDroppedPresentation = CC.NodeCollection.get($(droppable).find(' > ul > li.node'));
      var oDraggedPresentation = CC.NodeCollection.get(ui.draggable);

      oDroppedPresentation.switchNodeEvent(oDraggedPresentation);
    },
    initDraggable: function(oObjects, appendToSelector) {

      if(typeof(appendToSelector) == "undefined") {
        appendToSelector = '#cc_container';
      }

      $(oObjects).draggable({
        //connectToSortable:  "li.root ul",
        helper    : 'clone',
        appendTo  : appendToSelector,
        revert    : 'invalid',
        zIndex    : 2000,
        start     : function(event, ui) {
                      $(this).addClass('dragging-origin');
                      var cell = $(this).parents('td');
                      var menu = $('.tools');
                      CC.Behaviors.closeContextualMenu(menu);
                      CC.Behaviors.hideTools();
                    },
        stop      : function(event , ui) {
                      $(this).removeClass('dragging-origin');
                      CC.Behaviors.showTools();
                    }
        });
    },
    addCustomForm: function(oForm, name, value) { // add a new form for custom node
      CC.Logger.info('Add new form for custom editor');
      if(typeof(name) == 'undefined') {
        name = '';
      }
      if(typeof(value) == 'undefined') {
        value = '';
      }
      var newForm     = oForm.find('div#newCustomForm').clone().removeAttr('id');
      newForm.children('input').removeAttr('disabled').val(name);
      newForm.children('textarea').removeAttr('disabled').val(value);
      newForm.appendTo(oForm.children('div.ccard-editor-field'));
    },

    closeContextualMenu: function(menu) {// Fermeture du menu contextuel
      $('.ccNodeTable td, .ccNodeTable th').removeClass('editing');           // Retire les classes indiquant l'édition d'une cellule
      menu.hide();
    },
    openContextualMenu: function (menu, cell, pointerLeft, pointerTop) {// Ouverture du menu contextuel
      $('.ccNodeTable .editTools').hide();                                    // Fermeture des menus déjà ouverts
      menu.show();                                                            // Affichage du bon menu
      $('.ccNodeTable td, .ccNodeTable th').removeClass('editing');           // Retire les classes indiquant l'édition d'une cellule

      // Positionnement du menu contextuel en fonction de la position du curseur au moment du clic
      menu.css({
        'top'   : pointerTop,
        'left' : pointerLeft
      });

      // Ajustement de la position du menu
      menuBottom        = pointerTop + menu.height();                         // position basse du menu contextuel
      var screenHeight  = $('body').height();                                 // Hauteur de la fenêtre globale
      var delta         = screenHeight - menuBottom
      if(delta < 0){                                                          // Si le menu dépasse la limite basse de l'écran on le remonte
        menu.css('top', pointerTop + delta - 20);                             // NB : on se donne 10px de marge pour ne pas coller le menu au bord de la fenêtre
      }
    },
    
    // Hide tools link in contract card section header
    hideTools: function() {
      $('#fieldList .root .tools').hide();
    },

    // Show tools link in contract card section header
    showTools: function() {
      $('#fieldList .root .tools').show();
    },
  }


  // This class is available in namespace CC only
  // If this namespace doesn't exist, create it.
  if (typeof window.CC == "undefined") {
    window.CC = {};
  }

  window.CC.Behaviors = Behaviors;
})(jQuery)