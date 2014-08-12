/**
 * Javascript behavior of Contract Cards
 */
(function($){
  var aAccept = {
    // droppable node types, accept only listed node types
    "root":         '*',
    "section":      '*',
    "custom":       '*',
    "bar_chart":    'field',
    "radar_chart":  'field',
    "pie_chart":    'field',
    "meter_chart":  'field',
    "table":        '*',

    // not droppable node types
    "field":        null,
    "fund_field":   null,
    "static":       null,
    "xls_formula":  null,
    "html":         null,
    "funds_list":   null
  }
  var isTableEditorVar = false;

  // Init event listeners and other DOM-dependent behaviors when DOM is ready
  $(document).ready(function() {
    isTableEditorVar = jQuery('td.cell').length;
    initSortableLists();
    initDraggableOnNewItem();
    initDroppables();
    initNodeToolsEvents();
    initChangePositionEventOnListItems();
    initEditors();
    initChapters();
    initTableActionEvents();

  });

  /*************************
   * Private functions
   *************************/

  // UID utils
  var uid = 1;
  function getNewUID() {
    return "new_" + uid++;
  }

  function setNodeUID($node, uid) {
    return $node.attr("uid", uid);
  }

  function getNodeUID($node) {
    return $node.attr("uid");
  }

  // easier node data access
  function getNodeData($node) {
    if (!$node.hasClass('node')) {
      return {};
    }

    var data = $node.find("#data_" + getNodeUID($node)).val();
    var type = $node.attr("data-node-type");

    if (typeof data === 'string') {
      data = jQuery.parseJSON(data);
    }

    if(data == undefined){
      data       = {};
      data.type  = type;
      data.title = "";
    }

    if(data.title == undefined) {
      data.title = data.name; // name not a valid key => still undefined
    }
    delete data.name;

    return data;
  }

  function setNodeData($node, data) {
    // update displayed title

    var sData = data["title"];

    // If editing a static node
    if($node.attr('data-node-type') == 'static') {
      // From a table
      if($('#editingFromTable').val()) {
        sData = data["content"];
      } else { // From the CC itself
        sData = data["title"] ? data["title"] : '';
        sData += (data["title"] && data["content"]) ? ' : '  : '';
        sData += data["content"] ? data["content"].substr(0, 100) : '';
        sData += data["content"].length > 100 ? ' ...' : '';
      }
    }

    $node.find(" > .title > .label > span").html(sData);

    if (typeof data !== 'string') {
      data = JSON.stringify(data);
    }
    $node.find("#data_" + getNodeUID($node)).val(data);

  }

  /*
   * Bind action when user click on icon to remove a chapter or a field
   */
  function removeNode($node) {
    $node.remove();
    serializeListItemsPositionsAndParentId($node.closest("ul"));
  }



  function isTableEditor() {
    return isTableEditorVar;
  }

  function getDroppableNodes($context) {
    if (undefined == $context) {
      $context = $("#fieldList");
    }

    // droppables are slightly different on full cc editor and on table editor

    // init droppables nodes => sections and tables
    var baseNodeSelector = "", droppableSelector = "";

    if( isTableEditor() ) { // this is a table editor
      baseNodeSelector = "td.cell > li.";
      droppableSelector = "td.cell, ";
    }
    else{
      baseNodeSelector = "li.";
    }

    jQuery.each(aAccept, function(index, value){
      if(value != null) {
        if(droppableSelector.length > 0 ) {
          droppableSelector += ", ";
        }
//        droppableSelector += "li." + index + ":not(.ui-droppable), ";
        droppableSelector += baseNodeSelector + index + " > .title:not(.ui-droppable)";
      }
    });
    return jQuery(droppableSelector, $context);

    return $droppables
  }

  /*
   * Make lists sortable (and "drag&droppable"...)
   */
  function initSortableLists(context) {

    var
      $context        = typeof context == "undefined" ? $("#fieldList li.root") : $(context),
      $nodes          = $(".node", $context),
      $chapterTitles  = $(".section > .title", $context),

      // Create collections and remove allready setted elements
      $draggables     = $nodes.add($chapterTitles).not(".ui-draggable, .root"),
      $sortables      = $("ul", $context).not(".ui-sortable");

    // Make fields and chapter titles draggables
    $draggables.draggable({
      helper:             "clone",
      opacity:            0.7,
      handle:             ".label",
      cancel:             ".tools, input",
      revert:             "invalid",
      cursor:             "move",
      cursorAt:           {left: -10, top: -5},
      scrollSensitivity:  60
    }).disableSelection();

//    $draggables.is('.cell').sibling('.cell').live("sortstart", function () {
//      var originalWidth =
//    });

    // Make all lists sortable
    $sortables.not(".cell").sortable({
      items:        "> li",
      handle:       "> .title .move",
      axis:         "y",
      cursor:      "n-resize",
      placeholder: "node sortablePlaceholder"
    });

  } // End of initSortableLists

  function initDraggableOnNewItem() {

    // init draggable nodes : new items from field chooser
    jQuery("#fieldChooser .ccard-new-item").draggable({
      helper:             "clone",
      opacity:            0.7,
      revert:             "revert",
      cursor:             "move",
      start: function(event, ui) {
      }
    });

  }

  function initDroppables(context) {
    var $context  = typeof context == "undefined" ? $("#fieldList") : $(context);

    $droppables = getDroppableNodes($context)

    // drop event is defined separately as it has a similar behavior to sortupdate
    $droppables.droppable({
      accept: function($draggable) {
          // TODO - return false if dragged for sorting purpose... => how to distinct drop in a section and sort inside a list ?
          if (isTableEditor()) {
            if ($draggable.hasClass('ccard-new-item')) {
              // new nodes can be dropped only on empty nodes...
              if (jQuery(this).find('li.node').length) {
                return false;
              }
            }
            return true;
          }

          var $droppable  = jQuery(this).closest('li.node:not(.ui-sortable-helper)'),
              drpNodeType = $droppable.attr('data-node-type'),
              drpAccept   = aAccept[drpNodeType],
              drgNodeType = $draggable.hasClass('ccard-new-item') ? $draggable.attr('data-node-type') : $draggable.closest('li.node').attr('data-node-type');

          if (drpAccept == null) {
            return false;
          }

          if (drpAccept == '*') {
            return true;
          }

          if (new RegExp("\\b" + drgNodeType + "\\b").test(drpAccept)) {
            return true;
          }

          return false;
        },
      activeClass: "availableDropZone",
      hoverClass:  "dropZone",
      tolerance:   "pointer",
      greedy:      true
    });
  }


  function initNodeToolsEvents() {
    initClickEventOnArrowIcons();
    initClickEventOnToggleChapterIcons();

    // Init click events on tools
    $("#fieldList .tools img").live("click", function(event, ui){
      var $this = $(this),
          $node = $this.closest("li.node");

      if ($this.hasClass('table_edit')) {
        $form = jQuery('#cc_form');
        $form.prepend('<input type="hidden" id="table_node_id" name="table_node_uid" value="' + $this.closest('li.node').attr('uid') + '" />');
        jQuery('#submit').click();
      }
      else if ($this.hasClass("remove")) {
        removeNode($node);
      }
      else if ($this.hasClass("edit")) {
        loadEditor(event, $(this).closest(".node"));
      }
      else if ($this.hasClass("edit-cc")) {
        var oldValues = {},
            $editor = jQuery('#cc-editor');

        // tmp of current values in case of cancellation
        $editor.find('input').each(function(){
          oldValues[$(this).attr('id')] = $(this).val();
        });

        $editor.dialog({
          buttons: {
            "Annuler": function() {
                // reset current values
                $editor.find('input').each(function(){
                  $(this).val( oldValues[$(this).attr('id')] );
                });
                jQuery(this).dialog( "destroy" ).insertBefore('#fieldList li.root');
              },
            "Valider": function() {
                jQuery('#fieldList li.root > .title > .label > span').html(jQuery(this).find("input.cc_name").val());
                jQuery(this).dialog( "destroy" ).insertBefore('#fieldList li.root');
              }
          },
          modal: true,
          title: "Paramètres généraux de la fiche",
          width: 600,
          height: 600
        });
      }
      else {
//        console.log("unknown action : " + $this.attr("class"));
      }
    });
  }

  // Root node editor => edit general parameters of the contract card, require specific behavior as the root does not need to be updated
  function initRootEditor() {
    /*
    jQuery('#fieldList li.root .edit-cc').click(function(){
      var oldValues = {}, $editor = jQuery('#cc-editor');
      // tmp of current values in case of cancellation
      $editor.find('input').each(function(){
        oldValues[$(this).attr('id')] = $(this).val();
      });
      $editor.dialog({
        buttons: {
          "Annuler": function() {
              // reset current values
              $editor.find('input').each(function(){
                $(this).val( oldValues[$(this).attr('id')] );
              });
              jQuery(this).dialog( "destroy" ).insertBefore('#fieldList li.root');
            },
          "Valider": function() {
              jQuery('#fieldList li.root > .title > .label > span').html(jQuery(this).find("input.cc_name").val());
              jQuery(this).dialog( "destroy" ).insertBefore('#fieldList li.root');
            }
        },
        modal: true,
        title: "Paramètres généraux de la fiche",
        width: 600,
        height: 600
      });
    });
    */
  }

  // Bind actions on up/down icons on chapters and fields title
  function initClickEventOnArrowIcons() {
    var selector =  "#fieldList .tools .up," +
                    "#fieldList .tools .down," +
                    "#fieldList .tools .parent";

    $(selector).live("click", function(){
      var $icon = $(this),
          $elementToMove = $icon.closest("li"),
          $listContainer = $elementToMove.parent("ul");

      if ($icon.is(".up")) {
        $elementToMove.insertBefore($elementToMove.prev("li"));
      }
      else if ($icon.is(".down")) {
        $elementToMove.insertAfter($elementToMove.next("li"));
      }
      else if ($icon.is(".parent")) {
        $parentChapter = $elementToMove.parent().closest("li.section");
        $elementToMove.insertBefore($parentChapter);
        $listContainer = $parentChapter.closest("ul");
      }

      serializeListItemsPositionsAndParentId($listContainer);
    })
  }

  /*
   * Bind action on open/close icon on chapter titles
   */
  function initClickEventOnToggleChapterIcons() {
    $("#fieldList .toggleTool").live("click", function(event) {
      $(this).closest(".section").each(function(){
        toggleChapter($(this), event.ctrlKey)
      });
    });
  }

  /*
   * Toggle given chapter and change toggle icon state
   */
  function toggleChapter($chapter, isDeep, isCloseAction) {
    if (undefined == isDeep) {
      isDeep = false;
    }

    if (isCloseAction) {
      isCloseAction = $icon.is(".close");
    }

    var
      $ul           = $chapter.find((isDeep ? "" : "> ") + "ul"),
      $icon         = $chapter.find((isDeep ? "" : "> ") + ".title .toggleTool"),
      classToRemove = isCloseAction ? "close" : "open",
      classToAdd    = isCloseAction ? "open" : "close";

    $ul[isCloseAction ? "hide" : "show"]();
    $icon.removeClass(classToRemove).addClass(classToAdd);
  }

  function loadEditor(event, $sourceNode) {
    var isNew           = $sourceNode.is('.ccard-new-item');
    var nodeType        = $sourceNode.attr('data-node-type');
    var currentNodeData = getNodeData($sourceNode);
    var $editor         = jQuery(".ccard-editor." + nodeType);
    var title;

    if (isNew) {
      title = "Ajout d'un nœud de type " + nodeType;
    }
    else {
      title = "Édition du nœud " + $sourceNode.find('.title:eq(0) .label span').text();
    }

    var onOpen  = false;

    if (nodeType == 'custom') {
      currentNodeData.type = "custom";

      // specific behavior for custom nodes
      $editor.find('.ccard-editor-field').remove(); // remove all field rows, all will be reinserted after

      jQuery.each(currentNodeData, function(name, value){
        addAttributeFormRowToCustomNodeEditor($editor, name, value);
      });
      if(currentNodeData.title == undefined) {
        addAttributeFormRowToCustomNodeEditor($editor, "title", "");
      }
    }
    else {
      // reset all checkboxes to unchecked, even a checkbox without value in config will be correctly displayed
      $editor.find(":checkbox").attr('checked', false);
      jQuery.each(currentNodeData, function(name, value){
        selector = "input[name=\"" + name + "\"], select[name=\"" + name + "\"], textarea[name=\"" + name + "\"]";
        $inputs = $editor.find(selector);
        $inputs.each(function() {
          var $this = $(this);
          if($this.attr('type') == "checkbox") {
            $this.attr('checked', value);
          }
          else {
            $this.val(value);
          }
        });
      });
    }

    if (nodeType == 'field') {
      onOpen = function(event, ui) {
        var id = null;
        if (isNew) {
          // blank fields
          $editor.find('input:text').val('');
        }
        else {
          id = $editor.find('input[name=id]').val();
        }

        // Load the select menus
        $editor.find('.placeholder')
          .empty()
          .addClass('loading')
          .load(OBS.urls.contractcard_getparentchapters, {field_id: id, card_id: OBS.ccard.id}, function() {
            $(this).removeClass('loading');
          });
      }
    }

    $editor.dialog({
      buttons: {
        "Annuler": function() {
            jQuery(this).dialog("close");
          },
        "Valider": function() {
            validateEditorForm($editor, currentNodeData, event, $sourceNode);
            jQuery(this).dialog("close");
          }
      },
      modal: true,
      title: title,
      width: 500,
      height: 400,
      open: onOpen
    });

    return true;
  }

  function validateEditorForm($editor, nodeData, event, $node) {
    if(nodeData.type == "custom") {
      // retrieve modified node data and update node data collection
      $editor.find('.ccard-editor-field').each(function () {
        $fieldFormElement = $(this);
        name  = $fieldFormElement.find('input').val();
        value = $fieldFormElement.find('textarea').val();
        if (name.length > 0) {
          try {
            value = JSON.parse(value);
          }
          catch(err) {
            //
          }
          nodeData[name] = value;
        }
      });
    }
    else {
      // retrieve modified node data and update node data collection
      $editor.find('input[type=checkbox]:checked, input[type!=checkbox], textarea, select').each(function () {
        $fieldFormElement = $(this);
        if( $fieldFormElement.attr('name').length > 0 ) {
          nodeData[$fieldFormElement.attr('name')] = $fieldFormElement.val();
        }

        // reset form element value for easier reusage of the same editor for a different node
        if($fieldFormElement.is('[type=checkbox]')) {
          // TODO
        }
        else {
          $fieldFormElement.val('');
        }
      });
    }

    // update node with its new node data
    setNodeData($node, nodeData)

    // On drop action for a new field
    if ($node.is(".ccard-new-item")) {
      var $parentChapter = $(event.target).closest(".node");
      if(isTableEditor() && $parentChapter.hasClass("root")) {
        // adding a node as a table cell
        $parentChapter = $(event.target);
      }

      nodeData["type"] = $node.attr("data-node-type");

      addNewNode(nodeData, $parentChapter, event.ctrlKey ? "end" : "beginning");
    }
    else{
      // On existing node edit form validation => not dropped

      // TODO update node
      var $source = $node.is(".field") ? $node : $node.closest(".section");

      // event implies a node move => is this really possible ??
      if(event.type == "drop" || event.type == "sortupdate") {
        $target = $(event.target).closest(".section").next("ul");
        moveNodeTo($source, $target, event.ctrlKey ? "end" : "beginning");
      }
    }
  }

  /*
   * Request server for the new chapter HTML template and insert it as
   * a child of the given parent chapter
   */
  function addNewNode(data, parentNode, position) {
    // Return error if a needed parameter is missing
    if (typeof parentNode == "undefined" || typeof OBS.urls["contractcard_getnode"] == "undefined") {
      alert("Erreur : la requête n'a pas pu être effectuée car un paramètre est manquant");
      return;
    }

    // If fieldId is provieded, send it as request param
    var params = {
      uid:  getNewUID(),
      data: data
    };

    // Do request
    $.ajax({
      url:      OBS.urls["contractcard_getnode"],
      data:     params,
      success:  function(newNode) {
        var $newNode       = $(newNode).filter("li.node"),
            $parentNode    = $(parentNode);

        // Return error if server response doesn't contains a chapter HTML fragment
        if ($newNode.length == 0) {
          alert("Erreur : la réponse du serveur n'a pas la forme attendue...");
          //return;
        }

        // Insert new node HTML fragment
        moveNodeTo($newNode, $parentNode, position);
      }
    });
  }

  /*
   * Serialize each list item position (relative to its UL container)
   * -> The position is stored in an hidden field with class "position"
   *
   * Serialize each list item parent ID
   * -> The parent ID is retrieved from an hidden field with class "itemId" in the closest chapter
   * -> The parent ID is stored in an hidden field with class "parentId"
   */
  function serializeListItemsPositionsAndParentId(listContainer) {
    var $listContainer = $(listContainer), parentId = getNodeUID($listContainer.closest("li.node"));

    $listContainer.find("li").each(function(position, listItem){
      $(listItem).find("input.position").val(position);
    });

    parentId = parentId || "";
    $listContainer.find("> li > input.parentId").val(parentId);
  }

  /**
   * Bind action when the order of some list items is changed or when dropping a new element to the list
   */
  function initChangePositionEventOnListItems() {
    var $context = $("#fieldList li.root"), context = $context.get(0);
    $context.find(".ui-droppable, .ui-sortable").live("drop sortupdate", function(event, ui) {

      // display editor when dropping a new node
      if (event.type == "drop" && ui.draggable.is(".ccard-new-item")) {
        loadEditor(event, ui.draggable);
      }
      else {
        $movedNode     = $(ui.draggable).closest("li.node");
        if(isTableEditor()) {
          $targetNode    = $(event.target);
        }
        else {
          $targetNode    = $(event.target).closest('li.node');
        }
        moveNodeTo($movedNode, $targetNode, event.ctrlKey ? "end" : "beginning" );
      }

      if(isTableEditor()) {
        //
      }
      else {
        // always recalculate integrity data
        var $listContainer = $(this).closest("li, #fieldList").children("ul");
      }
      serializeListItemsPositionsAndParentId($listContainer);

    });
  }

  function moveNodeTo($movedNode, $targetNode, position) {
    targetNodeData = getNodeData($targetNode);

    if( $targetNode.is('td.cell') ) { // this is table editor, moving node into a cell
      var $previousNode = $targetNode.find(' > li'), $sourceCell = null;
      if($previousNode.length > 0) {
        $previousNode = $previousNode.detach();
        $sourceCell = $movedNode.closest('td');
        if($sourceCell.length > 0) {
          $sourceCell.append($previousNode);
        }
      }
      $targetNode.append($movedNode);
      if($sourceCell != null) {
        $sourceCell.find('input.cell_index').val(getNodeUID($previousNode));
      }
      $targetNode.find('input.cell_index').val(getNodeUID($movedNode));
      tableCols = targetNodeData.cols;
      $targetListContainer = $targetNode.closest('li.node');
    }
    else {
      $movedNode.width('auto');
      $targetListContainer = $targetNode.find('> ul');
      // Insert new node HTML fragment
      switch (position) {
        case "end":
          if($targetNode.is('td')) {
            $targetListContainer.find("> .clear").first().before($movedNode);
          }
          else {
            $targetListContainer.append($movedNode);
          }

          break;
        case "after":
          $targetListContainer.after($movedNode);
          break;
        case "beginning": // default;
        default:
          $targetListContainer.prepend($movedNode);
          break;
      }
    }

    // Make new inserted chapter sortable (and "drag&droppable"...)
    initSortableLists($targetListContainer);
    initDroppables($targetListContainer);

    // Update positions and parent IDs
    serializeListItemsPositionsAndParentId($targetListContainer);

  }

  /* TABLE EDITOR CODE */
  function initTableActionEvents() {
    if(!isTableEditor()){return;}

    jQuery('.table_add_up').click(function(){
      $table = addRow("up");
      // make cells droppable
      initDroppables($table);
      serializeListItemsPositionsAndParentId($table);
    });
    jQuery('.table_add_down').click(function(){
      $table = addRow("down");
      // make cells droppable
      initDroppables($table);
      serializeListItemsPositionsAndParentId($table);
    });
    jQuery('.table_add_left').click(function(){
      $table = addColumn("left");
      // make cells droppable
      initDroppables($table);
      serializeListItemsPositionsAndParentId($table);
      updateTableColumnCount();
    });
    jQuery('.table_add_right').click(function(){
      $table = addColumn("right");
      // make cells droppable
      initDroppables($table);
      serializeListItemsPositionsAndParentId($table);
      updateTableColumnCount();
    });

    jQuery('.table_remove_up').click(function(){
      $table = removeRow("up");
      serializeListItemsPositionsAndParentId($table);
    });
    jQuery('.table_remove_down').click(function(){
      $table = removeRow("down");
      serializeListItemsPositionsAndParentId($table);
    });
    jQuery('.table_remove_left').click(function(){
      $table = removeColumn("left");
      serializeListItemsPositionsAndParentId($table);
      updateTableColumnCount();
    });
    jQuery('.table_remove_right').click(function(){
      $table = removeColumn("right");
      serializeListItemsPositionsAndParentId($table);
      updateTableColumnCount();
    });
  }

  var cellTemplate = '<td class="cell"><input type="hidden" name="cell_index[]" class="cell_index" /></td>';

  function updateTableColumnCount() {
    colCount = jQuery('li.root > table > tbody > tr').first().find(' > td').length;
    jQuery('#cols').val(colCount);
  }

  function addRow(direction) {
    if (!isTableEditor()) {
      return null;
    }

    $table = jQuery('li.root > table > tbody');

    newRow  = '<tr class="row">';
    for(var i = jQuery('#cols').val() ; i >0 ; i--) {
      newRow += cellTemplate;
    }
    newRow += '</tr>';

    if( direction == "up" ) {
      $table.prepend(newRow);
    }
    else {
      $table.append(newRow);
    }

    return $table;
  }

  function addColumn(direction) {
    if (!isTableEditor()) {
      return null;
    }

    $table = jQuery('li.root > table > tbody');

    newCell = cellTemplate;
    $table.find(' > tr').each(function() {
      $row = $(this);
      if( direction == "left" ) {
        $row.prepend(newCell);
      }
      else {
        $row.append(newCell);
      }
    });

    return $table;
  }

  function removeRow(direction) {
    if (!isTableEditor()) {
      return null;
    }

    var $table = jQuery('li.root > table > tbody'), allowDelete = true, confirmed = true;

    if( direction == "up" ) {
      $row = $table.find(' > tr').first();
    }
    else {
      $row = $table.find(' > tr').last();
    }

    $row.find(' > td.cell').each(function() {
      $cell = $(this);
      if($cell.find('li.node').length > 0) {
        allowDelete = false;
      }
    });

    if(!allowDelete) {
      confirmed = confirm('Seule une colonne complètement vide peut-être supprimée');
    }

    if(confirmed) {
      $row.remove();
      return $table;
    }

    return false;
  }

  function removeColumn(direction) {
    if (!isTableEditor()) {
      return;
    }

    var $table = jQuery('li.root > table > tbody'), $cellsToRemove = new Array(), allowDelete = true, confirmed = true;

    $table.find(' > tr').each(function() {
      $cells = $(this).find(' > td.cell');
      if( direction == "left" ) {
        $cell = $cells.first();
      }
      else {
        $cell = $cells.last();
      }
      if($cell.find('li.node').length > 0) {
        allowDelete = false;
      }
      $cellsToRemove.push($cell);
    });

    if(!allowDelete) {
      confirmed = confirm('Seule une colonne complètement vide peut-être supprimée');
    }

    if(confirmed) {
      jQuery.each($cellsToRemove, function(){
        $(this).remove();
      });
      return $table;
    }

    return false;
  }



  /*************************************************
   *      SPECIFIC CODE FOR CC NODE EDITOR         *
   *************************************************/

   function initEditors() {
     initEditorField();
     initEditorHtml();
     initEditorCustom();
   }

   /*
   *  on load, only first level chapters are open
   */

   function initChapters(){
     $('.section .ui-sortable .section .ui-sortable').hide();
     $('.ui-sortable .ui-sortable .toggleTool').removeClass('close').addClass('open');

   }

  /*
   * Bind action when user changes value of a chapter select box
   */
  function initEditorField(level) {
    // Init chapter selectors click handler
    jQuery('.ccard-editor.field select.ccard-chapter-selector').live("change", function() {
      var $select   = jQuery(this);
      var chapterId = $select.val();
  
      if ($select.find('option[value="' + $select.val() + '"]').parent().hasClass('fields')) {
        jQuery(".ccard-editor-field input#field-id").val($select.val());
        if(jQuery(".ccard-editor-field input#field-title").val().length == 0) {
          jQuery(".ccard-editor-field input#field-title").val($select.find(":selected").html().trim());
        }
        return;
      }
  
      jQuery.ajax({
        data:     {"chapter_id": chapterId},
        url:      OBS.urls["contractcard_getsubchapters"],
        success:  function(data){
          // remove old fields
          $select.nextAll("select").remove();
  
          // add new fields for selected chapter
          $select.parent().append(data);
        }
      });
    });
  
    // prettify menu entries with sample values
    jQuery('.ccard-editor.field option').html(function(index, oldval){
      return oldval.replace(/\[(.*?)]/, '<span class="sample">$1</span>');
    })
  }

  /**
   * Init the TinyMCE editor for static HTML content nodes edition
   */
  function initEditorHtml(){
    tinyMCE.init({
      strict_loading_mode: true,  // fixes some loading problems with firefox
      mode : "specific_textareas",
      theme: 'advanced',
      theme_advanced_buttons1: 'bold,italic,underline,forecolor,backcolor,separator,' +
                               'undo,redo,separator,' +
                               'bullist,numlist,separator,cleanup,code',
      theme_advanced_buttons2: '',
      theme_advanced_buttons3: '',
      editor_selector:         'easy_editor'
    });
  }

  function initEditorCustom() {
    $editor = jQuery('.ccard-editor.custom');
    $editor.find('a').click(function () {
      addAttributeFormRowToCustomNodeEditor($editor, "", "");
    });
  }

  function addAttributeFormRowToCustomNodeEditor($editor, name, value) {
    var reservedFields = [ "type", "node_id", "level", "parent_id" ];
    if( jQuery.inArray(name, reservedFields) != -1 ) {return;}

    var editorFormRow = ' \
<div class="ccard-editor-field"> \
  Nom: <input type="text" value="' + name + '" /> <br />\
  Valeur: <textarea>' + ( typeof value == "string" ? value : JSON.stringify(value) ) + '</textarea> \
</div>';

    $lastRow = $editor.find('div.ccard-editor-field').last();
    if( $lastRow.length >=1 ) {
      $lastRow.after( editorFormRow );
    }
    else {
      $editor.prepend( editorFormRow )
    }
  }

})(jQuery);
