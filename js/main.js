//$script( 'external/zepto.min', 'zepto')
$script( ['external/jquery.min', 'external/gibberish.2.0.min'], 'GO')

$script.ready( 'GO', function() {
  $script( 'gibber/gibber', function() {
    $script( 'gibber/environment', 'environment', function() {
    
      Gibber.init()
    
      Gibber.Environment.init( Gibber )
    
    })
  })
})
