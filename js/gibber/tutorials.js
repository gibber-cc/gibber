requirejs(['gibber/gibber'], function(_Gibber) {

_Gibber.tutorials = {
"intro" : "// This is simple tutorial to get started with Gibber and making drum patterns.\n" +
'// Note that at any time you can stop all audio using Ctrl-` (the backtick character above the tab key)\n'+
'// You can also restart the intro from the Help menu\n\n'+
'// First, we are going to make some Drums and assign them to the letter d.\n' +
'\n' +	
'd = Drums("xoxo");\n' +
'\n' +
'// To run the above line of code, select it with your cursor and then type Cntrl + Enter.\n' +
'// Congrats! You should now have a beat! Click the link below to move to the next tutorial,\n' +
'// and remember, we\'ve stored our Drums in the letter d.\n' +
'\n' +
'next tutorial:adding_fx',

"adding_fx" : '// Let\'s add some audio effects to the drums we stored inside the letter d.\n'+
'\n'+
'd.fx.add( Delay(_8) );\n'+
'\n'+
'// The above line of code adds an echo effects, where the echoes are spaced an 1/8th note apart.\n'+
'// In Gibber, any time you use an underscore in front of a number, that combination represents\n'+
'// a division of a measure. So, _1 = a whole note, _2 = a half note, _4 = a quarter note... etc.\n'+
'\n'+
'// We can remove using the line below. Remember, to run a line of code, simply select it and hit\n'+
'// Cntrl + Return\n'+
'\n'+
'd.fx.remove();\n'+
'\n'+
'// Let\'s add a BitCrusher and a Reverb\n'+
'\n'+
'd.fx.add( Crush(6), Reverb() );\n'+
'\n'+
'// Gibber comes with lots of audio effects to liven up your music. Next lets change our beat up.\n'+
'\n'+
'next tutorial:changing_the_beat_\n',

"changing_the_beat" : '// Remembering our first line of code? d = Drums("xoxo"); When creating Drum loops,\n'+
'// x represents a kick drum and o represents a snare drum. * represents a cowbell. We can\n'+
'// create different loops using different combinations of these letters.\n'+
'\n'+
'd = Drums("x*o*xxo*");\n'+
'\n'+
'// Try changing the order of the letters in the Drum sequence and re-running the code\n'+
'// (using Cntrl+Enter). You can also add silence using periods or spaces.\n'+
'\n'+
'// We can also randomize the order of the Drums at anytime using the shuffle command\n'+
'\n'+
'd.shuffle();\n'+
'\n'+
'// Try running the above line multiple times. After shuffling, we can reset the original value:\n'+
'\n'+
'd.reset();\n'+
'\n'+
'// We can also change the pitch of the drums\n'+
'\n'+
'd.pitch = d.pitch * .5;\n'+
'\n'+
'// Try changing the number in the above line to see the results. Higher numbers increase\n'+
'// the pitch, numbers between 0 - 1 lower it.\n'+
'\n'+
'// Make sure you reset the drums, and then move on to the next tutorial to add some bass.\n'+
'\n'+
'// That\'s all for this simple tutorial. Try loading some of the other files in the "Load" menu\n'+
'// to get an idea of how to do other tasks in Gibber.\n'+
'\n'+
'next tutorial:intro\n',
};

});