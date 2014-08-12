;(function($) {

  $(document).ready(function() {
    CC.Logger.activate();
    CC.Logger.setLogLevel('debug');
    CC.Logger.info('Start of loading ContractCard javascript');
    extendString();
    extendCC();
    initFeedback();
    initNodes();
    initUrls();
    initEventHandlers();
    initClone();
    initUniformCellHeight();
    CC.Logger.info('ContractCard javascript loaded');
  })

  /**
   * methods which extends String
   */
  function extendString() {
    //function to camelize a string (my_variable => MyVariable)
    //@param upperCamelCase : upper the first caracter
    String.prototype.camelize = function (upperCamelCase) {
      var stringSplited = this.split('_');
      var startIndex = upperCamelCase ? 0 : 1;

      for (var i = startIndex; i < stringSplited.length; i++) {
        var c = stringSplited[i];
        if (c.length) {
          stringSplited[i] = c.charAt(0).toUpperCase() + c.substring(1).toLowerCase();
        }
      }

      return stringSplited.join('');
    }
  }

  /**
   * methods which extends String
   */
  function extendCC() {
    CC.contractCardId = $('#contract_card_id').val();
    CC.readonly       = $('#cc_container').hasClass("readonly");
    CC.Logger.info('Contract card id #' + CC.contractCardId);
    CC.Logger.info('Contract card readonly status : ' + CC.readonly);
    // function to get Contract card ID
    CC.getContractCardId = function(){
      return CC.contractCardId;
    }
    // function to get Contract Readonly status
    CC.getContractReadonlyStatus = function(){
      return CC.readonly;
    }
    // function to get level to begin for calculate level nodes
    CC.getBeginLevel = function(){
      var beginLevel  = 0;
      var defineLevel = $('#contract_card_node_level');
      if(defineLevel.length) {
        beginLevel = defineLevel.val();
      }
      return beginLevel;
    }
    // function to get Contract card ID
    CC.isTableEditor = function(){
      var isEditorElmnt = $('#fieldList > ul > li.table');
      return isEditorElmnt.length > 0;
    }
    // function to compare 2 objects
    //@param object1 : First object to compare
    //@param object2 : Second object to compare
    CC.areEquals = function(object1, object2){
      var property = undefined;
      for(property in object1) {
        if(typeof(object2[property])=='undefined') {
          return false;
        }
      }
      for(property in object1) {
        if (object1[property]) {
          switch(typeof(object1[property])) {
            case 'object':
              if (!this.areEquals(object1[property], object2[property])) {
                return false;
              }
              break;
            case 'function':
              if (typeof(object2[property])=='undefined' || (property != 'equals' && object1[property].toString() != object2[property].toString())) {
                  return false;
                }
              break;
            default:
              if (object1[property] != object2[property]) {
                return false;
              }
          }
        } else {
          if (object2[property]) {
            return false;
          }
        }
      }

      for(property in object2) {
        if(typeof(object1[property])=='undefined') {
          return false;
        }
      }

      return true;
    }
  }

  /**
   * Initialize feedback overlay
   */
  function initFeedback() {
    CC.Feedback.init();
    CC.Logger.info('Feedback loaded');
  }

  /**
   * Creates the Node objects from the initial DOM elements
   */
  function initNodes() {
    CC.Logger.info('Begin of initial instantiation of the nodes');
    CC.Behaviors.initNode($('div#fieldList'));
    CC.Logger.info('End of initial instantiation of the nodes');
  }

  /**
   * Retrieve and initialize the URLs which will be used all along the edition
   * of the contract card
   */
  function initUrls() {
    CC.Urls = {};

    $('input.cc_url').each(function() {
      CC.Urls[$(this).attr('name')] = $(this).val();
    })
    CC.Logger.info('Ajax url loaded');
  }


  /**
   * Inits all the js event handlers
   */
  function initEventHandlers() {
    initAjaxError();
    initToggleSection();
    if(!CC.getContractReadonlyStatus()) {
      initEditorHandlers();
      initEditNode();
      initEditTable();
      initActionTableElement();
      initRemoveNode();
      initSortables();
      initCellActionButton();

      if(CC.isTableEditor()) {
        initDragAndDropTable();
      } else {
        initDragAndDrop();
      }
    }
  }

  /**
   * Bind the ajaxComplete, so that we can display errors
   */
  function initAjaxError() {
    $(document).ajaxError(function() {
      CC.Feedback.error('Une erreur est survenue.');
    });
  }

  /**
   * Inits events related to the editors
   */
  function initEditorHandlers() {
    CC.Logger.info('Editor handlers initialization');
    // Field Editor - Bind the chapter selectors
     $(document).on('change', 'form select.ccard-chapter-selector', function() {

      var $select   = $(this);

      $option = $select.find('option[value="' + $select.val() + '"]');
      $option.attr('selected', 'selected');

      if ($option.parent().hasClass('fields')) { // the selected option is a field

        $(".ccard-editor-field input#field_id").val($select.val());

        if(!$(".ccard-editor-field input#field_title").val().length || $(".ccard-editor-field input#field_title").val() == "vide") {
          $(".ccard-editor-field input#field_title").val($select.find(":selected").html().trim());
        }
      } else { // the selected option is a chapter => retrive children chapters/fields in a new select

        var chapterId = $select.val();

        $.ajax({
          data:     {"chapter_id": chapterId},
          url:      CC.Urls.getsubchapters,
          success:  function(data){

            // remove old fields
            $select.nextAll("select").remove();

            // add new fields for selected chapter
            $select.parent().append(data);
          }
        });
      }
    });


    $(document).on('click', 'form a#addCustomForm', function() {
      CC.Behaviors.addCustomForm($('form.ccard-editor'));
    });
  }

  /**
   * Inits the event handler for showing
   */
  function initToggleSection() {
    CC.Logger.info('Toggle section initialization');
    // Bind the click event of the toggleTool icon
    $('#cc_container').on('click', 'li.node div.toggleTool', function() {

      var oPresentation = CC.NodeCollection.get($(this).closest('li.node'));

      if(oPresentation) {
        $(this).hasClass('collapsed') ? oPresentation.expand() : oPresentation.collapse();
      }
    });
  }

  function initEditNode() {
    $('#cc_container').on('click', 'li.node div.editTools .node_action_edit', function() {
      var oPresentation = CC.NodeCollection.get($(this).closest('li.node'));

      if(oPresentation) {
        oPresentation.editEvent();
      }
    });
  }

  function initUpdateTableElement(element, isColumn, isDelete) {
    var position      = element.data('pos');
    var oPresentation = CC.NodeCollection.get(element.closest('li.node'));

    if(oPresentation) {
      oPresentation.updateTableElementEvent(position, isColumn, isDelete);
    }
  }

  function initActionTableElement() {
    $('#cc_container').on('click', '.editToolsColumn .node_action_add', function() {
      initUpdateTableElement($(this), true, false);
    });

    $('#cc_container').on('click', '.editToolsRow .node_action_add', function() {
      initUpdateTableElement($(this), false, false);
    });

    $('#cc_container').on('click', '.editToolsColumn .node_action_remove', function() {
      if ($(this).closest('tr').children('th').length == 2) {
        CC.Feedback.error('Impossible de supprimer cette dernière colonne.<br>Afin de la supprimer, créer d\'abord une nouvelle colonne.', 'close', true);
        CC.Feedback.addToOperationStack('Tentative de suppression de la dernière colonne', '', true);
        return;
      }

      initUpdateTableElement($(this), true, true);
    });

    $('#cc_container').on('click', '.editToolsRow .node_action_remove', function() {
      if ($(this).closest('tbody').children('tr').length == 1) {
        CC.Feedback.error('Impossible de supprimer cette dernière ligne.<br>Afin de la supprimer, créer d\'abord une nouvelle ligne', 'close', true);
        CC.Feedback.addToOperationStack('Tentative de suppression de la dernière ligne', '', true);
        return;
      }

      initUpdateTableElement($(this), false, true);
    });
  }

  function initEditTable() {
    $('#cc_container').on('click', 'li.node div.editTableTools .node_action_edit', function() {
      var oPresentation = CC.NodeCollection.get($(this).closest('li.node'));

      if(oPresentation) {
        //Redirection to edit table page
        $(location).attr('href', CC.Urls.editTable + '/id/' + oPresentation.controller.getId());
      }
    });
  }

  function initRemoveNode() {
    $('#cc_container').on('click', 'li.root li.node div.editTools .node_action_remove, li.root li.node div.editTableTools .node_action_remove', function() {
      var oPresentation = CC.NodeCollection.get($(this).closest('li.node'));

      if(oPresentation) {
        oPresentation.removeEvent();
      }
    });
    $('#cc_container').on('click', 'li.table li.node div.editTools .node_action_remove, li.table li.node div.editTableTools .node_action_remove', function() {
      CC.Logger.debug("####### Remove node in table => replace by empty static");

      var toBeRemovedNodePresentation = CC.NodeCollection.get($(this).closest('li.node'));

      var config = toBeRemovedNodePresentation.controller.getConfig();

      config['type'] = 'static';
      config['editorConfig'] = {title: 'vide', content: ''};

      toBeRemovedNodePresentation.replaceByNew(config, false);
    });
  }

  function initSortables() {
    CC.Logger.info('Sortables areas loaded');
    if(!CC.isTableEditor()) {
      // Table editor does not use the sortable
      CC.Behaviors.initSortable($( "li.root ul"));
    }
  }

  function initDragAndDrop() {
    CC.Logger.info('Draggables areas loaded');
    // init draggable nodes : new items from field chooser or movable item from the
    CC.Behaviors.initDraggable($("#fieldChooser > li"));

    CC.Logger.info('Droppables areas loaded');
    // droppable on standard editor, accepting only new nodes from the right panel
    CC.Behaviors.initDroppable($("li.root > div.title, li.allowChildren:not(.table) > div.title"), "#fieldChooser > li", CC.Behaviors.addChildDroppableCallback);
  }

  function initDragAndDropTable() {
    CC.Logger.info('Draggables areas loaded');
    // init draggable nodes : new items from field chooser or movable item from the
    CC.Behaviors.initDraggable($("#fieldChooser > li"));
    CC.Behaviors.initDraggable($("li.table td.cell > ul > li"), '.ccNodeTableContainer');

    CC.Logger.info('Droppables areas loaded');
    // add child droppable
    CC.Behaviors.initDroppable($("li.table td.cell"), "li", CC.Behaviors.tableDroppableCallback);
  }

  // Init button in table cells
  function initCellActionButton() {
    var buttonSelector = '#fieldList .ccNodeTable .ccNodeTableCellActions';
    var button = $(buttonSelector);
    if(!button.length) return;

    $('#cc_container').on('click', buttonSelector, function(data) {
        var cell   = $(this).closest('td, th');
        var menu   = $('.editTools', cell);

        if(cell.hasClass('editing')) {                                      // Si le menu est déjà ouvert
          CC.Behaviors.closeContextualMenu(menu);                                        // Fermeture du menu
        } else {
          CC.Behaviors.openContextualMenu(menu, cell, data.pageX, data.pageY);           // Ouverture du menu contextuel
          colorizeEditingCells($(this));                                    // Colorisation des cellules concernées par le menu
        }

        $('body').on('click', ':not(.editTools)',
          function() {
            CC.Behaviors.closeContextualMenu(menu);
          }
        );

        return false;
      }
    );
  }

  function colorizeEditingCells(button) {

    // Colorie la colonne
    if(button.hasClass('columnActions')) {
      var col = button.closest('th').attr('class');
      $('.' + col).addClass('editing');
    }

    // colorie la ligne
    else if(button.hasClass('rowActions')) {
      button.closest('tr').find('th, td').addClass('editing');
    }

    // Ne colorie que la cellule
    else {
      button.closest('td').addClass('editing');
    }
  }

  //print an overlay when click on clone
  function initClone() {
    $('#clone_card').on('click',
      function() {
        CC.Feedback.loading('Clonage en cours ...', true);
      }
    );
  }

  function initUniformCellHeight() {
    var table = $('.ccNodeTable');
    if(!table.length) return;

    var lines   = $('tbody tr', table);

    lines.each(
      function() {
        var maxHeight = 0;
        var cells     = $('td .label', $(this));

        cells.each(
          function() {
            if($(this).height() >  maxHeight) {
              maxHeight = $(this).height();
            }
          }
        );

        cells.height(maxHeight);
      }
    );
  }
})(jQuery)