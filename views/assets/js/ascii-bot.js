/****************************************************************
 * AsciiBot 													*
 * ------------------------------------------------------------ *
 * Animated Ascii Bot with emotions that can be changed         *
 *																*
 * Depends on: jQuery											*
 *																*
 * Creator: Frank Urbainsky <fu@zuckerrausch.de>                *
 ****************************************************************/

var fayeClient;

$.fn.asciiBot = function ( options ){
	// -------------------------------
	// statics
	// -------------------------------

	this.NEUTRAL 		       = 0;
	this.HAPPY 			       = 1;
	this.CUTE     	        = 2;
	this.DEFUNCT 		       = 3;
	this.BLINKING		       = 4;
    this.CURIOUS            = 5;
    this.PLANT		          = 6;
    this.LOVE             = 7;
    this.POINT_LEFT		     = 10;
	this.POINT_RIGHT	      = 20;
	this.POINT_LEFT_UP	    = 30;
	this.POINT_RIGHT_UP	   = 40;
    this.POINT_LEFT_DOWN	  = 50;
    this.POINT_RIGHT_DOWN	 = 60;

	// html
	this.botID = 'bot_'+Math.random();

	this.leftHTML 		= '<div class="asciiBot '+this.botID+'" >';
	this.rightHTML 		= '</div>';

	// ascii-art
	this.face = new Array();
	this.face[this.NEUTRAL]  = '[\'_\']';
	this.face[this.HAPPY]	   = '[^_^]';
	this.face[this.CUTE]     = '[✿‿✿]';
	this.face[this.DEFUNCT]  = '[X_X]';
	this.face[this.BLINKING] = '[-_-]';
	this.face[this.CURIOUS]	 = '[✿_✿]';
	//this.face[this.OEH]	     = '[∩‿∩]';
    this.face[this.LOVE]     = '[❤.❤]';
	//this.face[this.OEH3]	   = '[˘̩‿˘̩]';
	this.face[this.PLANT]	   = '✿✿✿';
	this.pointLeft		       = '&lt;';
	this.pointRight		       = '&gt;';
	this.pointLeftUp	       = '\\';
	this.pointRightUp	       = '/';
    this.pointLeftDown	     = '=';
    this.pointRightDown	     = 'v';
 	// -------------------------------
 	// variables
 	// -------------------------------

 	// render Variables
 	this.state;
 	this.direction;

 	this.isBlinking;

 	// time between blinks;
 	this.blinkTime = 300;

  this.blinkEvents = 0;
  this.timers = 0;

 	// -------------------------------
 	// functions
 	// -------------------------------

 	// return HTML-Elements that display a Bot
 	this.render = function ( state, direction ) {

 		// the basic HTML construct will be put into 'output'
 		var output = this.leftHTML; // left side of html div

 		// left arm
 		switch ( direction ){
 			case this.POINT_LEFT: {
 				output += this.pointLeft;
 				break;
 			}
 			case this.POINT_LEFT_UP: {
 				output += this.pointLeftUp;
 				break;
 			}
     case this.POINT_LEFT_DOWN: {
         output += this.pointLeftDown;
         break;
       }
 			default: {
 				break;
 			}
 		};
 		// body
 		output += this.face[state];

 		// right arm
 		switch ( direction ){
 			case this.POINT_RIGHT: {
 				output += this.pointRight;
 				break;
 			}
 			case this.POINT_RIGHT_UP: {
 				output += this.pointRightUp;
 				break;
 			}
       case this.POINT_RIGHT_DOWN: {
         output += this.pointRightDown;
         break;
       }
 			default: {
 				break;
 			}
 		};

 		// closing html
 		output += this.rightHTML;
 		return output;
 	};

 	this.getBot = function( state, direction ) {
 	 	this.state = state;
 		this.direction = direction;
 		this.finalizedBot = $(this.render(state, direction) );
 		this.startBlinking();
    var bot = this;
    $(document).click(function(){
      bot.doBlinkOnce();
    });
 		this.html(this.finalizedBot);
 	}

 	// -------------------------------
 	// basic Animation
 	// -------------------------------

 	// blinking
 	this.startBlinking = function(){
 		this.isBlinking = true;
 		var scope = this;
    if ( this.timers == 0){
      this.timers++;
      setTimeout(function () {
          scope.timers--;
          scope.doBlink();
      }, this.getBlinkTime() );
    }
 	};

 	this.doBlink = function(){
 		if ( this.isBlinking ){
 			this.doBlinkOnce();
 		}
 	};

 	this.doBlinkOnce = function(){
    if ( this.blinkEvents > 0) return;
    this.blinkEvents++;
    var wasBlinking = this.isBlinking;
    this.isBlinking = false;
 		this.blinkingBot = $( this.render(this.BLINKING, this.direction) );
 		this.finalizedBot.replaceWith( this.blinkingBot );
 		var scope = this;
 		setTimeout(function () {
 			scope.blinkingBot.replaceWith(scope.finalizedBot );
      scope.blinkEvents--;
      if ( wasBlinking ){
        this.isBlinking = true;
        scope.startBlinking();
      }
		}, 300 );
    
 	};

 	// returns random number around the actual blinktime
 	this.getBlinkTime = function(){
    var blinkage = Math.floor( ( this.blinkTime + ( 1  - (Math.random() * 2) )* 100 )*25 );
 		return blinkage;
 	};
  if ( options.state && options.hands ){
    this.getBot( this[options.state], this[options.hands] ); 
  }
  
  if ( options.message ){
    this.attr('data-content',options.message);
    this.popover({content: options.message }).popover('show');
    setTimeout(function(){
      $('.asciibot').popover('hide');
    }, options.timeout || 7000);
  }
	var bot = this;
	var timeout;
	if (! fayeClient ){
		fayeClient = new Faye.Client('/faye');
		var asciiChannel = fayeClient.subscribe('/asciiBot/messages', function(data){
			console.log('got Data via faye to asciibot/messages',data);
			bot.attr('data-content',data.message);
			bot.popover({content: data.message, placement: 'bottom' }).popover('show');
			$('.popover').click(function() {
				console.log('gets called');
				$(this).fadeOut();
			});
			if ( timeout != null ){
				clearTimeout(timeout);
			}

			timeout = setTimeout(function(){
				timeout = null;
				$('.popover').fadeOut();
			},  5000);

		});
	}
};
