//$script( 'external/zepto.min', 'zepto')
$script( 'external/jquery.min', 'jquery')

$script.ready( 'jquery', function() {
  $script( 'gibber/gibber', function() {
    $script( 'gibber/environment', 'environment', function() {
    
      Gibber.init()
    
      Gibber.Environment.init( Gibber )
    
    })
  })
}) 
