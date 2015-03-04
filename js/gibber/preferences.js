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
    processShowBrowserOnLaunchCheckbox : function() {
      var showBrowserOnLaunchCheckbox = $( '#preferences_showBrowserOnLaunch' ),
          checked = showBrowserOnLaunchCheckbox.is(':checked')

      Gibber.Environment.Storage.values.showBrowserOnLaunch = checked
    },
    processDefaultLanguageForEditorsMenu : function() {
      var opt = $( '#preferences_defaultLanguageForEditors' ).find( ':selected' ), idx = opt.index(), val = opt.text()
      
      Gibber.Environment.Storage.values.defaultLanguageForEditors = val
    },
    processSaveSoundFonts : function() {
      var soundFontsCheckbox = $( '#preferences_saveSoundFonts' ),
          checked = soundFontsCheckbox.is(':checked')
      
      Gibber.Environment.Storage.values.saveSoundFonts = checked
    },
    close: function() {
      Preferences.processShowWelcomeCheckBox()
      Preferences.processShowSampleCodeInNewEditorsCheckbox()
      Preferences.processDefaultLanguageForEditorsMenu()
      Preferences.processSaveSoundFonts()
      Preferences.processShowBrowserOnLaunchCheckbox()      
      
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
        
        var language = Gibber.Environment.Storage.values.defaultLanguageForEditors,
            languageIndex = 0, count = 0
            
        for( var key in Gibber.Environment.modes ) {
          if( key !== 'nameMappings' ) {
            if( key === language ) languageIndex = count
            count++
            $( '#preferences_defaultLanguageForEditors' ).append( $( '<option>' ).text( key ) )
          }
        }
        
        $( '#preferences_defaultLanguageForEditors' ).find( 'option' )[ languageIndex ].selected = true;        
        $( '#preferences_showWelcomeScreen' ).attr( 'checked', Gibber.Environment.Storage.values.showWelcomeMessage )
        $( '#preferences_showSampleCodeInNewEditors' ).attr( 'checked', Gibber.Environment.Storage.values.showSampleCodeInNewEditors )
        $( '#preferences_saveSoundFonts' ).attr( 'checked', Gibber.Environment.Storage.values.saveSoundFonts )
        $( '#preferences_showBrowserOnLaunch' ).attr( 'checked', Gibber.Environment.Storage.values.showBrowserOnLaunch )
        
        this.column.onclose = this.close.bind( this )
  
      }.bind( this ) )
    },
  }
  
  return Preferences
}