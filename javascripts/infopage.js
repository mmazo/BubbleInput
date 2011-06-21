jQuery(document).ready( function(){
	
	var bi1 = new BubbleInput();
      bi1.generate( { targetSelector:  "#mails",
			                separatorRegex:  new RegExp(/,\s*|\r\n|\r|\n/),
                      separatorString: ", ",
                      validationRegex: new RegExp(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/)  } );
					
			jQuery("#mails-export").click( function(){
				alert( bi1.exportBubbles() );
			} );
			
  var bi2 = new BubbleInput();
      bi2.generate( { targetSelector: "#names",
                      separatorRegex:  new RegExp(/;\s*|\r\n|\r|\n/),
                      separatorString: "; ",
                      validationRegex: new RegExp(/^[^\d]+$/)  } );
      
			jQuery("#names-export").click( function(){
        alert( bi2.exportBubbles() );
      } );
			


	var availableTags = [
	      "Aaron",
	      "Boris",
	      "Cindirella",
	      "Dorian",
	      "Eragon",
	      "Fritz",
	      "Gloria",
	      "Harald"
	    ];
	    jQuery( jQuery('#names').next('.bubble-input').find('.bubble-new .edit') ).autocomplete({
	      source: availableTags,
				position: { of: jQuery('#names').next('.bubble-input') }
  });


			
  var bi3 = new BubbleInput();
      bi3.generate( { targetSelector: "#phones",
                      separatorRegex:  new RegExp(/\s\s*|\r\n|\r|\n/),
                      separatorString: " ",
                      validationRegex: new RegExp(/^\d+$/)  } );
      
			jQuery("#phones-export").click( function(){
        alert( bi3.exportBubbles() );
      } );
	
	
} );
