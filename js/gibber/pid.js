var Filters = module.exports = {
  Average: function() {
    var n = 0, sum = 0, lastAvg = 0, avg = 0
    
    var avg = function( p ) {
      sum += p
      n++
    }
    
    avg.setN   = function( v )  { n = v }
    avg.setSum = function( v )  { sum = v }
    avg.getLastAvg = function() { return lastAvg }
    
    avg.getAvg = function() { 
      avg = sum / n; 
      sum = n = 0;
      lastAvg = avg;
      return avg; 
    }

    return avg
  },
  RunningMean: function( N ) {
    var sum = 0, index = 0, n = 0, data = []
    
    for( var i = 0; i < N; i++ ) data[ i ] = 0
    
    return function( sample ) {
      if( n !== N ) n++
      
      sum -= data[ index ]
      data[ index ] = sample
      sum += sample
      index++
      
      if( index === N ) index = 0
      
      return sum / n
    }
  },
  PID: function() {
    var pid = {
      Kp: .01,
      Ki: .00001,
      initialized: false,
      phase: 0,
      targetCount: 44,
      integralPhaseCorrection:0,
      
      runningMean: Filters.RunningMean( 150 ),
      
      run: function( msg ) {
        var localPhase               = Gabber.localPhase,//Gibber.Audio.Clock.getPhase(),
            masterPhase              = msg.masterAudioPhase,
            immediatePhaseCorrection = masterPhase - Gabber.localPhase,
            controlledPhaseCorrection
        
        if( !this.initialized ) {
          //Gibber.Audio.Clock.setPhase( masterPhase )
          Gabber.localPhase = masterPhase
          this.initialized = 1
        }else{
          var meanPhaseCorrection = this.runningMean( immediatePhaseCorrection )
          
          ///console.log( meanPhaseCorrection, immediatePhaseCorrection )
          this.integralPhaseCorrection += immediatePhaseCorrection 
          
          //controlledPhaseCorrection = immediatePhaseCorrection + ( this.Kp * meanPhaseCorrection + this.Ki * this.integralPhaseCorrection )
          controlledPhaseCorrection = ( this.Kp * meanPhaseCorrection + this.Ki * this.integralPhaseCorrection )
          
          Gabber.localPhase += controlledPhaseCorrection
          
          for( var i = 0, l = Seq.children.length; i < l; i++ ) {
            var seq = Seq.children[i]
            seq.adjustPhase( controlledPhaseCorrection )
          }
          
          //if( Gabber.correctionBuffer.leng)
          Gabber.correctionBuffer[ this.phase++ % Gabber.correctionBufferSize ] = controlledPhaseCorrection
          //Gibber.Audio.Clock.setPhase( Gabber.localPhase )
          
          //console.log( controlledPhaseCorrection )
          //console.log( localPhase, masterPhase, immediatePhaseCorrection, controlledPhaseCorrection, this.integralPhaseCorrection )
          // console.log( 
          //   'master:', masterPhase, 
          //   'local:',  Gabber.localPhase + controlledPhaseCorrection, 
          //   'offBy:',  masterPhase - Gabber.localPhase + controlledPhaseCorrection  
          // )
        }
      }
    }
    
    return pid
  }
}