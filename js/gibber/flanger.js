// Gibber - flanger.js
// ========================

// ###Flanger
// A traditional flanger using a variable-length comb filter by thecharlie.  
//
// param **rate**: Float. Default = .25. Measure in Hz, this is the speed that the delay line size fluctuates at  
// param **amount**: Int. Default = 125. The amount that the size of the delay line fluctuates by  
// param **feedback**: Float. Default = .25. Feedback for the flanger. Increase to get a more pronounced effect  
// param **offset**: Int. Default = amount. The offset of the flanger's comb filter from the current sample. By default this is the same as the amount parameter  
//
// example usage:    
// `p = Pluck(0, 1, "pink");    
//  p.fx.add( Flanger() );   
//  p.note( "A3" );  ` 

function Flanger(rate, amount, feedback, offset) {
	var that = {
		rate: (typeof rate !== "undefined") ? rate : .1,
		amount: (typeof amount !== "undefined") ? amount : 125,
		feedback:	isNaN(feedback) ? .5 : feedback,
		offset:		isNaN(offset) ? 125 : offset,
	}
	
	that = Gibberish.Flanger(that);
	
	return that;
}

// ###Chorus
// cheap chorus using a flanger with an extreme offset see http://denniscronin.net/dsp/article.html
//
// param **rate**: Float. Default = .25. Measure in Hz, this is the speed that the delay line size fluctuates at  
// param **amount**: Int. Default = 125. The amount that the size of the delay line fluctuates by  

function Chorus(rate, amount) {
	var _rate = rate || 2;
	var _amount = amount || 50;
	that = Flanger(rate, amount, 0, 880); // 20ms offset
	that.name = "Chorus";
	
	return that;
}
