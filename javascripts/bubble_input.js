/**
 * BubbleInput class
 */
var BubbleInput = function BubbleInput() {};
BubbleInput.version = "0.1";

BubbleInput.prototype.cssBubbleArea = "bubble-input";
BubbleInput.prototype.cssBubbleAreaCurrent = "bubble-input-current";
BubbleInput.prototype.cssBubble = "bubble";
BubbleInput.prototype.cssDisplay = "display";
BubbleInput.prototype.cssEdit = "edit";
BubbleInput.prototype.cssActions = "actions";
BubbleInput.prototype.cssActionsDelete = "delete";
BubbleInput.prototype.cssBubbleActive = "bubble-active";
BubbleInput.prototype.cssBubbleEditable = "bubble-edit";
BubbleInput.prototype.cssBubbleNew = "bubble-new";
BubbleInput.prototype.cssBubbleInvalid = "bubble-invalid";

BubbleInput.prototype.bubbleAreaTemplate = "<ul class='" + 
                                         BubbleInput.prototype.cssBubbleArea + 
                                         "'></ul>";
                                           
BubbleInput.prototype.bubbleTemplate = "<li class='" + 
                                     BubbleInput.prototype.cssBubble  + 
                                     " #{custom-class}'>" +
                                     "<span class='" + 
                                     BubbleInput.prototype.cssDisplay + 
                                     "'>#{con}</span>" +
                                     "<input class='" + 
                                     BubbleInput.prototype.cssEdit + 
                                     "' type='text' value='#{con}' />" +
                                     "<span class='" + 
                                     BubbleInput.prototype.cssActions + 
                                     "'>" +
                                       "<a class='" + 
                                       BubbleInput.prototype.cssActionsDelete + 
                                       "' href='#'>[X]</a>" + 
                                     "</span>" + 
                                    "</li>";

BubbleInput.prototype.separatorRegex = new RegExp(/,\s*|\r\n|\r|\n/);
BubbleInput.prototype.separatorString = ", ";
BubbleInput.prototype.validationRegex = new RegExp(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/);

BubbleInput.prototype.targetSelector = "";
BubbleInput.prototype.targetObj = null;

BubbleInput.prototype.bubbleAreaObj = null;

/*
 * Rearranges all bubble input bubbles: removes duplets and sorts them.
 */
BubbleInput.prototype.refresh = function(){
  var items = this.exportBubbles();
  this.bubbleAreaObj.find( "." + this.cssBubble + ":not(." + this.cssBubbleNew +")" ).remove();
  this.importBubbles( items );
  this.activateBubble( this.bubbleAreaObj.find( "." + this.cssBubbleNew ) );
};

/*
 * Returns the next sybling bubble input DOM element on page according
 * given direction. Possible direction variants: 'next', 'prev'.
 */
BubbleInput.prototype.getSyblingBubbleInput = function( direction ){
  var bi = jQuery(".bubble-input").toArray();
  var index = 0;
  var i;
  for (i = 0; i < bi.length; i++){
    if ( jQuery(bi[i]).hasClass( this.cssBubbleAreaCurrent ) ) break;
    index = index + 1;
  }
  switch(direction) {
  case 'next':
      // get next or first
      return jQuery( bi[ index + 1 < bi.length ? index + 1 : 0  ] );
    break;
  case 'prev':
      // get previous or last
      return jQuery( bi[ index - 1 >= 0 ? index - 1 : bi.length - 1 ] );
    break;
  default: 
      // default ist 'next'
      return jQuery( bi[ index + 1 < bi.length ? index + 1 : 0  ] );
  }
};

/*
 * Returns new content input bubble ( blinking cursor in front ).
 */
BubbleInput.prototype.newContentInputBubble = function(){
  return this.bubbleAreaObj.find( "." + this.cssBubbleNew );
};

/*
 * Returns new content input field.
 */
BubbleInput.prototype.newContentInputField = function(){
  return this.newContentInputBubble().find( "." + this.cssEdit );
};

/*
 * Returns true if current bubble input area focused at this moment.
 */
BubbleInput.prototype.isCurrent = function() {
  return this.bubbleAreaObj.hasClass( this.cssBubbleAreaCurrent );
};

/*
 * Generate bubble input.
 */
BubbleInput.prototype.generate = function(options) {
  this.readOptions(options);
  this.initActions();
};

/*
 * Read parameter values.
 */
BubbleInput.prototype.readOptions = function(options) {
  this.targetSelector = options.targetSelector;
  this.targetObj = jQuery( this.targetSelector );
  this.separatorRegex = options.separatorRegex || this.separatorRegex;
  this.separatorString = options.separatorString || this.separatorString;
  this.validationRegex = options.validationRegex || this.validationRegex;
};

/*
 * Rearranges bubbles in current bubble area cba so that 
 * new bubble is always last in line. 
 */
BubbleInput.prototype.moveNewBubbleToFront = function( cba ){
  var currentBubbleArea = jQuery( cba );
  var bubbles = currentBubbleArea.find( "." + this.cssBubble + ":not(." + this.cssBubbleNew + ")" );
  var bubblesCopy = bubbles.clone();
  bubbles.remove();
  currentBubbleArea.find("." + this.cssBubbleNew).before( bubblesCopy );
  currentBubbleArea.find( "." + this.cssBubbleNew + " ." + this.cssEdit ).focus();
};

/*
 * Validates bubbles in given current bubble area cba.
 */
BubbleInput.prototype.validateBubbleArea = function( cba ){
  var $t = this;
  var currentBubbleArea = jQuery( cba );
  var bubbles = currentBubbleArea.find( "." + $t.cssBubble + ":not(." + $t.cssBubbleNew + ")" );
  bubbles.each(function(){
    var b = jQuery(this);
    var con = b.find('.' + $t.cssEdit).val();
    if ( !$t.validationRegex.test( bubbleContent ) ){
      b.addClass( $t.cssBubbleInvalid );
    }
  });
};

/*
 * Manages click event in bubble input area. We have one single click event
 * for all bubble input area and bubbles inside of it.
 */
BubbleInput.prototype.manageClickEvent = function( elem ){
  var targetElementClass = elem.attr("class");
  var clickedBubble = elem.parents("." + this.cssBubble);
  
  if ( elem.hasClass( this.cssBubbleArea ) ){
    this.activateBubble( this.newContentInputBubble() );
  } else if ( targetElementClass === this.cssActionsDelete ){
    //clicked on 'x' icon in bubble - delete bubble
    this.deleteBubble( clickedBubble );
  } else if ( !clickedBubble.hasClass( this.cssBubbleActive ) ){
    //clicked on inactive bubble - mark it as active
    this.activateBubble( clickedBubble );
  } else if ( clickedBubble.hasClass( this.cssBubbleActive ) && 
       !clickedBubble.hasClass( this.cssBubbleEditable ) ){
    //clicked on active bubble - switch bubble to edit modus
    this.toEditModusBubble( clickedBubble );
  } else if ( clickedBubble.hasClass( this.cssBubbleActive ) && 
       clickedBubble.hasClass( this.cssBubbleEditable ) ){
    //clicked on active bubble in edit modus - update bubble
    this.updateBubble( clickedBubble );
  }
};

/*
 * Focuses next bubble.
 */
BubbleInput.prototype.focusNextBubble = function(bubbleObj){
  var $t = this;
  if ( !bubbleObj.hasClass($t.cssBubbleEditable) || bubbleObj.find("." + $t.cssEdit).val() === ""  ) {
     var nextBubble = bubbleObj.next().length === 0 ? $t.bubbleAreaObj.find("." + $t.cssBubble + ":first") : bubbleObj.next();
     $t.activateBubble(nextBubble);
  }
};

/*
 * Focus previous bubble.
 */
BubbleInput.prototype.focusPreviousBubble = function(bubbleObj){
  var $t = this;
  if ( !bubbleObj.hasClass($t.cssBubbleEditable) || bubbleObj.find("." + $t.cssEdit).val() === "" ) {
   var prevBubble = bubbleObj.prev().length === 0  ? $t.bubbleAreaObj.find("." + $t.cssBubble + ":last") : bubbleObj.prev();
   $t.activateBubble( prevBubble );
  }
};

/*
 * Manages keyboard events such as left, right, up, down, enter, etc.
 */
BubbleInput.prototype.manageKeyboardEvents = function(){
  var $t = this;
  jQuery(document).bind('keyup', function(event) {
    if ( $t.isCurrent() ) {
      var currentlyActiveBubble = $t.bubbleAreaObj.find("." + $t.cssBubbleActive);
      var activeNewInput = currentlyActiveBubble.hasClass( $t.cssBubbleNew ) ? currentlyActiveBubble.find('.' + $t.cssEdit) : [];
      if( !jQuery.browser.msie ){
        activeNewInput = $t.bubbleAreaObj.find("." + $t.cssBubbleNew + " ." + $t.cssEdit + ":focus");
      }
      switch( event.keyCode ) {
        case 8:
          // pressed backspace - so we should delete currently active bubble
          // if it is not new bubble. If it is new bubble and it is empty, then
          // activate previous bubble.
          var victimBubble = currentlyActiveBubble;
          if ( currentlyActiveBubble.hasClass( $t.cssBubbleNew ) && currentlyActiveBubble.find( '.' + $t.cssEdit ).val() === "" ){
            victimBubble = currentlyActiveBubble.prev();
            $t.activateBubble( victimBubble );
            break;
          }
          if ( !victimBubble.hasClass( $t.cssBubbleEditable ) ){
            $t.deleteBubble( victimBubble );
          }
          break;
        case 13:
             if ( activeNewInput.length > 0 ){
              //when new bubble is focused - insert new bubble
              var currentContent = activeNewInput.val();
              activeNewInput.val("");
              $t.toNormalModusBubble( $t.newContentInputBubble() );
              $t.importBubbles( currentContent );
             } else if ( currentlyActiveBubble.length > 0 ) {
               if (currentlyActiveBubble.hasClass( $t.cssBubbleEditable )) {
                 //when some bubble is active and in edit modus - save changes in bubble
                 $t.updateBubble(currentlyActiveBubble);
               } else {
                //when some bubble is active - switch it to edit modus
                $t.toEditModusBubble(currentlyActiveBubble);
               }
             } 
          break;
        case 37:
             //mark previous (or last if no previous) bubble as active
             $t.focusPreviousBubble( currentlyActiveBubble );
          break;
        case 39:
             //mark next (or first if no next) bubble as active
             $t.focusNextBubble( currentlyActiveBubble );
          break;
        case 38:
             //UP
             //mark previous (or last if no previous) bubble as active
             //$t.focusPreviousBubble( currentlyActiveBubble );
          break;
        case 40:
             //DOWN
             //mark next (or first if no next) bubble as active
             //$t.focusNextBubble( currentlyActiveBubble );
          break;
        case 46:
             //delete currently active bubble
             $t.deleteBubble( currentlyActiveBubble );
          break;
        case 35:
             //mark last bubble as active
             $t.activateBubble( $t.bubbleAreaObj.find("." + $t.cssBubble + ":last") );
          break;
        case 36:
              //mark first bubble as active
              $t.activateBubble( $t.bubbleAreaObj.find("." + $t.cssBubble + ":first") );
          break;
        case 9:
             //used TAB to sitch to other bubble area
             var bi = jQuery("." + $t.cssBubbleArea + " ." + $t.cssBubbleNew + " ." + $t.cssEdit + ":focus");
             if ( bi.length > 0 ){
               var ba = bi.parents("." + $t.cssBubbleArea);
               jQuery("." + $t.cssBubbleArea).removeClass( $t.cssBubbleAreaCurrent );
               ba.addClass( $t.cssBubbleAreaCurrent );
               $t.activateBubble( ba.find("." + $t.cssBubbleNew) );
             }
          break;
        default: 
          //we have no default action...
      }
    }
  });
};

/*
 * Manages paste action to insert new bubbles.
 */
BubbleInput.prototype.managePasteFromClipboard = function(){
  var $t = this;
  $t.bubbleAreaObj.bind('paste', function(event) {
    var pasteTrg = $t.newContentInputField();
    var oldValue = pasteTrg.val();
    window.setTimeout( function(){
      $t.importBubbles( pasteTrg.val().replace(oldValue, "") );
      pasteTrg.val( oldValue );
      $t.refresh();
    } ,0.5 * 1000);
  }).bind('copy', function(event) {
    return false;
  });
};

/*
 * Perform initial actions.
 */
BubbleInput.prototype.initActions = function(){
  var $t = this;
  $t.bubbleAreaObj = jQuery( $t.bubbleAreaTemplate ).insertAfter( $t.targetObj );
  $t.targetObj.hide();
  $t.importBubbles( $t.targetObj.val() );
  $t.createBubble("", $t.cssBubbleNew);
  $t.bubbleAreaObj.sortable( { connectWith: "." + $t.cssBubbleArea,
                               cancel: "." + $t.cssBubbleNew,
                               updtade: function(event, ui) {
                                 jQuery( this ).dblclick();
                               },
                               receive: function(event, ui) {
                                 jQuery("." + $t.cssBubbleArea).removeClass( $t.cssBubbleAreaCurrent );
                                 jQuery( this ).addClass( $t.cssBubbleAreaCurrent )
                                               .dblclick();
                               } } );


  jQuery("." + $t.cssBubbleArea).removeClass( $t.cssBubbleAreaCurrent );
  $t.bubbleAreaObj.addClass( $t.cssBubbleAreaCurrent );
  $t.activateBubble( this.bubbleAreaObj.find( "." + $t.cssBubbleNew ) );
  
  $t.bubbleAreaObj.dblclick(function(event){
    $t.refresh();
  });
  
  $t.newContentInputField().focusout(function(){
    var contentField = jQuery(this);
    $t.importBubbles( contentField.val() );
    contentField.val("");
  });
  
  $t.bubbleAreaObj.click(function(event){
    jQuery("." + $t.cssBubbleArea).removeClass( $t.cssBubbleAreaCurrent );
    jQuery(this).addClass( $t.cssBubbleAreaCurrent );
    $t.manageClickEvent( jQuery(event.target) );
  });
  $t.managePasteFromClipboard();
  $t.manageKeyboardEvents();
    
  function suppressBackspace(evt) {
      evt = evt || window.event;
      var target = evt.target || evt.srcElement;
  
      if (evt.keyCode == 8 && !/input|textarea/i.test(target.nodeName)) {
          return false;
      }
  }
  document.onkeydown = suppressBackspace;
  document.onkeypress = suppressBackspace;

};

/*
 * Delete given bubble if it is not new bubble 
 * and focus the new bubble after delete.
 */
BubbleInput.prototype.deleteBubble = function(bubbleObj){
  var bubble = jQuery( bubbleObj );
  if ( !bubble.hasClass( this.cssBubbleNew ) ){
    bubble.remove();
    this.activateBubble( this.bubbleAreaObj.find( "." + this.cssBubbleNew ) );
  }
};

/*
 * Marks given bubble as active.
 */
BubbleInput.prototype.activateBubble = function(bubbleObj){
  var $t = this;
  var bubble = jQuery( bubbleObj );
  jQuery( '.' + $t.cssBubble ).each( function(){
    $t.deactivateBubble( this );
  } );
  bubble.addClass( $t.cssBubbleActive );
  if ( bubble.hasClass( $t.cssBubbleNew ) ){
    this.toEditModusBubble( bubble );
  }
};

/*
 * Marks given bubble as inactive.
 */
BubbleInput.prototype.deactivateBubble = function(bubbleObj){
  var bubble = jQuery( bubbleObj );
  bubble.removeClass( this.cssBubbleActive );
  bubble.find('.' + this.cssEdit ).blur();
};

/*
 * Switches given bubble to edit modus.
 */
BubbleInput.prototype.toEditModusBubble = function(bubbleObj){
  var $t = this;
  jQuery( '.' + $t.cssBubble ).each( function(){
    $t.toNormalModusBubble( this );
  } );
  jQuery( bubbleObj ).addClass( $t.cssBubbleEditable )
                     .find('.' + this.cssEdit ).focus();
};

/*
 * Switches given bubble to normal modus.
 */
BubbleInput.prototype.toNormalModusBubble = function(bubbleObj){
  jQuery( bubbleObj ).removeClass( this.cssBubbleEditable );
};

/*
 * Updates given bubble after its content was edited.
 */
BubbleInput.prototype.updateBubble = function(bubbleObj){
  var disp = jQuery( bubbleObj ).find('.' + this.cssDisplay );
  var edit = jQuery( bubbleObj ).find('.' + this.cssEdit );
  if ( edit.val() === "" ){
    this.deleteBubble( bubbleObj );
  }else{
    disp.html( edit.val() );
    if ( this.validationRegex.test( edit.val() ) ){
      bubbleObj.removeClass( this.cssBubbleInvalid );
    }else{
      bubbleObj.addClass( this.cssBubbleInvalid );
    }
    this.toNormalModusBubble( bubbleObj );
  }
};

/*
 * Creates a bubble for given content and bubble type and appends it
 * to the bubble input area.
 */
BubbleInput.prototype.createBubble = function( bubbleContent, bubbleType ){
  var validationClass = this.validationRegex.test( bubbleContent ) ? "" : " " + this.cssBubbleInvalid;
  validationClass = bubbleType === this.cssBubbleNew ? "" : validationClass;
  var bubble = this.bubbleTemplate.replace(/#{con}/gi, bubbleContent)
                                  .replace("#{custom-class}", bubbleType + validationClass);
  
  // insert bubble before new content input bubble or append it to bubble area
  // object if new content input bubble does not exist
  if ( this.newContentInputBubble().length > 0 ){
    this.newContentInputBubble().before( bubble );
  }else{
    this.bubbleAreaObj.append( bubble );
  }
  
};

/*
 * Takes given itemsString, creates bubbles out of it and adds / appends
 * them to the bubble input area.
 */
BubbleInput.prototype.importBubbles = function( itemsString ){
  var $t = this;
  var items = itemsString.split( $t.separatorRegex );
  items = items.sort();
  for ( var i = 0; i < items.length; i++ ){
    if ( items[i] !== "" && items[i] !== items[i + 1] ) {
      $t.createBubble(items[i], "");
    }
  }
};

/*
 * Takes bubbles from the bubble input area and converts them to 
 * a string containing a list of all items. 
 */
BubbleInput.prototype.exportBubbles = function(){
  var $t = this;
  var ret = [];
  $t.bubbleAreaObj.find( "." + $t.cssBubble ).each(function(){
    var el = jQuery(this).find("." + $t.cssDisplay ).html();
    if ( el !== "" ){
      ret.push( el );
    }
  });
  return ret.join( $t.separatorString );
};
