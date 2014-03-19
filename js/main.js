//$script( 'external/zepto.min', 'zepto')
$script( ['external/jquery.min', 'external/gibberish.2.0.min'], 'GO')

$script.ready( 'GO', function() {
  // pubsub as taken from here: https://gist.github.com/addyosmani/1321768
  (function( $ ) {
    var o = $( {} );

    $.subscribe = function() { o.on.apply( o, arguments ) }
    $.unsubscribe = function() { o.off.apply( o, arguments ) }
    $.publish = function() { o.trigger.apply( o, arguments ) }

  }( jQuery ))
  
  $script( 'gibber/gibber', function() {
    $script( 'gibber/environment', 'environment', function() {
    
      Gibber.init()
    
      Gibber.Environment.init( Gibber )
    
    })
  })
})
