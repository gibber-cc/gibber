var Filters = module.exports = {
  RunningMean: function( N ) {
    var sum = 0, index = 0, n = 0, data = []

    for( var i = 0; i < N; i++ ) data[ i ] = 0

    var runningMean = function( sample ) {
      if( n !== N ) n++

      sum -= data[ index ]
      data[ index ] = sample
      sum += sample
      index++

      if( index === N ) index = 0

      return sum / n
    }

    runningMean.reset = function() {
      for( var i = 0; i < N; i++ ) data[ i ] = 0
      sum = 0
      index = 0
      n = 0
    }

    return runningMean
  },

  PID: function() {
    var pid = {
      Kp: .005,
      Ki: .00000, // XXX may be removed in the future
      initialized: false,
      phase: 0,
      targetCount: 88,
      // XXX make this use actual sample rate
      brutalityThreshold: .1 * 44100, //Gibber.Audio.Core.sampleRate,

      runningMean: Filters.RunningMean( 50 ),
      errorIntegral : 0,

      run: function( msg ) {
        var masterPhase              = msg.masterAudioPhase,
            errorRaw                 = masterPhase - Gabber.localPhase

        // integrate (aka sum, accumulate) all the raw error measurements
        // XXX may be removed in the future
        this.errorIntegral += errorRaw

        if( Math.abs( errorRaw ) > this.brutalityThreshold ) {

          // "brutal" control regime: we are noticably, musically "off time" so
          // we should jump forward (or backward) to the correct moment in the
          // piece.

          console.log("BRUTAL CORRECTION", errorRaw )

          // "brutally" adjust the variable under control
          //
          Gabber.localPhase = masterPhase

          // perform control "actuation": this is where we try to make Gibber's
          // state and behaviour reflect the controlled timing of the PID.
          //
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

          // clear/reset now invalid memory/history of the PID controller
          //
          this.errorIntegral = 0
          this.runningMean.reset()

        }else{

          // de-noise the error signal using a running mean. the error signal
          // is the difference between the reported master/server phase and our
          // local phase, but this can be very noisy.
          //
          var meanError = this.runningMean( errorRaw )

          // use PID controller to calulate how we should correct our local
          // phase to match that of the server/master. XXX the integral term
          // may be removed in the future.
          //
          var phaseCorrection = this.Kp * meanError + this.Ki * this.errorIntegral

          // adjust the variable under control
          //
          Gabber.localPhase += phaseCorrection

          // perform control "actuation": this is where we try to make Gibber's
          // state and behaviour reflect the controlled timing of the PID.
          //
          for( var i = 0, l = Seq.children.length; i < l; i++ ) {
            var seq = Seq.children[i]
            seq.adjustPhase( phaseCorrection )
          }

          // store and display information useful if tuning, testing, and debugging
          //

          Gabber.correctionBuffer[ this.phase++ % Gabber.correctionBufferSize ] = meanError

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
