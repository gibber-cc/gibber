module.exports = function( Gibber ) {
  var GE,
      $ = require( './dollar' )
      
  var Preferences = {
    div: null,
    processShowWelcomeCheckBox : function() {
      var showWelcomeCheckbox = $( '#preferences_showWelcomeScreen' ),
          checked = showWelcomeCheckbox.is(':checked')

      Gibber.Environment.Storage.values.showWelcomeMessage = checked
    },
    processShowSampleCodeInNewEditorsCheckbox : function() {
      var showSampleCodeInNewEditorsCheckbox = $( '#preferences_showSampleCodeInNewEditors' ),
          checked = showSampleCodeInNewEditorsCheckbox.is(':checked')

      Gibber.Environment.Storage.values.showSampleCodeInNewEditors = checked
    },
    close: function() {
      Preferences.processShowWelcomeCheckBox()
      Preferences.processShowSampleCodeInNewEditorsCheckbox()
      
      Gibber.Environment.Storage.save()
    },
    open : function() {
      $.ajax({
        url: Gibber.Environment.SERVER_URL + "/preferences",
        dataType:'html'
      })
      .done( function( data ) {
        var preferencesHTML = $( data )
  
        var div = $('<div>').html( preferencesHTML )
  
        this.column = Layout.addColumn({ type:'form', fullScreen:false, header:'User Preferences' })
  
        this.column.bodyElement.append( div )
  
        $( '#preferences_showWelcomeScreen' ).attr( 'checked', Gibber.Environment.Storage.values.showWelcomeMessage ),
        $( '#preferences_showSampleCodeInNewEditors' ).attr( 'checked', Gibber.Environment.Storage.values.showSampleCodeInNewEditors ),
        
        this.column.onclose = this.close.bind( this )
  
      }.bind( this ) )
    },
  }
  
  return Preferences
}