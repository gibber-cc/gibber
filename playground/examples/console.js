/* __--__--__--__--__--__--__--____

using the console
   
The browser console can help you debug 
errors and understand what gibber is 
doing. There are intructions for 
opening the console when you first 
open gibber, here they are again:

               chrome/edge               firefox
win/lin |   ctrl + shift + j    |    ctrl + shift + i
mac     | command + option + j  |  command + option + i

This tutorial will go over some
useful tricks for using the conse.
    
** __--__--__--__--__--__--__--__*/

// when you create a new gibber object, you'll see
// a notification appear in the console. run the
// line below with ctrl+enter to see this happen.

k = Kick()

// you also get notifications for when you launch
// sequences or tidal patterns:

k.trigger.seq( 1,1/4 )

// we can also use the console to inspect all
// the properties of a synth

k.inspect()

// after a few of these run, you mght want to clear
// your console. You can do this with the following:

Console.clear()

// ...or you can hit Ctrl+\ as a keyboard shortcut.
// run the line below, and then try Ctrl+\

l = Synth().note.seq( 0, 1 )

// you might have noticed when you ran the above
// line, the messages were collapsed in the console.
// click the disclosure triangle next to this type
// of message show each of them individually. by
// default, any code that is executed that generates
// more than one message is grouped like this. however,
// you can change this with the Console.detail property,
// which determines the minimum number of messages that
// should create a group.

Console.detail = 5
// all messages shown
m = Synth().note.seq( 0, 1/4 )

// more than five messages, so messages are grouped
// and collapsed (be susre to run all the code below
// at once):
verb = Reverb('space').bus()
synth = Synth[3]('square.perc').connect( verb, .1 )
synth.note.seq( 0, 1 )
synth.note.seq( 1, 1/2, 1 )
synth.note.seq( 2, 1/4, 2 )

// that's it for using the console! make sure to
// watch for messages, and remember to use .inspect()
// when you want to know the state of a synth.
