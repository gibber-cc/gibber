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
    
    var rm = function( sample ) {
      if( n !== N ) n++
      
      sum -= data[ index ]
      data[ index ] = sample
      sum += sample
      index++
      
      if( index === N ) index = 0
      
      return sum / n
    }
    
    rm.reset = function() {
      for( var i = 0; i < N; i++ ) data[ i ] = 0
      sum = 0
      index = 0
      n = 0
    }
    
    return rm
  },
  PID: function() {
    var pid = {     
      initialized: false,
      phase: 0,
      targetCount: 88,
      integralPhaseCorrection:0,
      sampleRateRatio: Gibber.Audio.Core.context.sampleRate / 44100, // mySampleRate / masterSampleRate... which is always 44100
      
      runningMean: Filters.RunningMean( 50 ),
      runningMeanLong: Filters.RunningMean( 250 ),
      errorIntegral : 0,
      shouldRecord:false,
      recordBuffer:[],
      glitch: function( amount ) {
        Gabber.localPhase += amount
      },
      
      run: function( msg ) {
        var localPhase               = Gabber.localPhase,//Gibber.Audio.Clock.getPhase(),
            masterPhase              = msg.masterAudioPhase * this.sampleRateRatio,
            errorRaw                 = masterPhase - Gabber.localPhase,
            controlledPhaseCorrection
        
        this.errorIntegral += errorRaw
        //if( !this.initialized ) {
        if( Math.abs( errorRaw ) > Gabber.shared.brutalityThreshold ) {
          console.log("BRUTAL CORRECTION", errorRaw )
          Gabber.localPhase = masterPhase
          
          if( !this.initialized ) { 
            this.initialized = 1
            Gibber.Audio.Clock.setPhase( masterPhase )

            Clock.seq.start()
          }else{
            for( var i = 0, l = Seq.children.length; i < l; i++ ) {
              var seq = Seq.children[i]
              seq.adjustPhase( errorRaw )
            }
          }
          
          this.errorIntegral = 0
          this.runningMean.reset()
          this.runningMeanLong.reset()
          
          if( this.shouldRecord )
            this.recordBuffer.push( [ "brutal", localPhase, masterPhase, errorRaw ] )          

          return
        }else{
          // XXX (ky)
          // consider not using this mean stuff. a properly tuned PI-controller should take care of this in the I-part.
          var meanError = this.runningMean( errorRaw )
          var meanErrorLong = this.runningMeanLong( errorRaw )
          
          ///console.log( meanPhaseCorrection, immediatePhaseCorrection )
          //this.integralPhaseCorrection = this.Kp * meanPhaseCorrection
          var phaseCorrection = Gabber.shared.Kp * meanError + Gabber.shared.Ki * this.errorIntegral
          //this.integralPhaseCorrection += immediatePhaseCorrection 
          
          // XXX (ky)
          // this is actual PI control. 0.05 should be called Kp, the Kp below should be called KiMean
          //
          // controlledPhaseCorrection = this.Kp * immediatePhaseCorrection + ( this.KpMean * meanPhaseCorrection + this.Ki * this.integralPhaseCorrection )
          
          // XXX (ky)
          // this is actually just I-control (not PI). do not use this... 
          //controlledPhaseCorrection = ( this.Kp * meanPhaseCorrection + this.Ki * this.integralPhaseCorrection )
          // Gabber.beforeCorrectionBuffer[ this.phase % Gabber.correctionBufferSize ] = masterPhase - Gabber.localPhase//controlledPhaseCorrection
          
          Gabber.localPhase += phaseCorrection //this.integralPhaseCorrection //controlledPhaseCorrection
          
          for( var i = 0, l = Seq.children.length; i < l; i++ ) {
            var seq = Seq.children[i]
            seq.adjustPhase( phaseCorrection )
          }
           
          if( this.shouldRecord )
            this.recordBuffer.push( [ "gentle", localPhase, masterPhase, meanError, phaseCorrection, Gabber.localPhase ] )
          // store correction for displaying graph of error
          Gabber.correctionBuffer[ this.phase++ % Gabber.correctionBufferSize ] = meanError//controlledPhaseCorrection
        
          //console.log( controlledPhaseCorrection )
          //console.log( localPhase, masterPhase, immediatePhaseCorrection, controlledPhaseCorrection, this.integralPhaseCorrection )
          if( this.phase % this.targetCount === 0 ) {
            console.log( 
              'master:', masterPhase, 
              'local:',  Gabber.localPhase, 
              'meanError:',  meanError,
              'phaseCorrection:', phaseCorrection
            )
          }
        }
      }
    }
    
    return pid
  }
}