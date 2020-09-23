const global = typeof window === 'undefined' ? {} : window;
        let Gibberish = null; 
        let initialized = false;
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Gibberish = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
let ugen = require('../ugen.js');

let analyzer = Object.create(ugen);

Object.assign(analyzer, {
  __type__: 'analyzer',
  priority: 0
});

module.exports = analyzer;

},{"../ugen.js":69}],2:[function(require,module,exports){
module.exports = function (Gibberish) {
  const { In, Out, SSD } = require('./singlesampledelay.js')(Gibberish);

  const analyzers = {
    SSD,
    SSD_In: In,
    SSD_Out: Out,
    Follow: require('./follow.dsp.js')(Gibberish)
  };
  analyzers.Follow_out = analyzers.Follow.out;
  analyzers.Follow_in = analyzers.Follow.in;

  analyzers.export = target => {
    for (let key in analyzers) {
      if (key !== 'export') {
        target[key] = analyzers[key];
      }
    }
  };

  return analyzers;
};

},{"./follow.dsp.js":3,"./singlesampledelay.js":4}],3:[function(require,module,exports){
const g = require('genish.js'),
      analyzer = require('./analyzer.js'),
      ugen = require('../ugen.js');

const genish = g;

/*
 * XXX need to also enable following of non-abs values.
 * ,,, or do we? what are valid negative property values in this
 * version of Gibberish?
 */
module.exports = function (Gibberish) {

  const Follow = function (__props) {
    const props = Object.assign({}, Follow.defaults, __props);

    let isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false;

    let out = props;

    /* if we are in the main thread,
     * only send a command to make a Follow instance
     * to the processor thread and include the id #
     * of the input ugen.
     */

    //console.log( 'isStereo:', Gibberish.mode, isStereo, props.input )
    if (Gibberish.mode === 'worklet') {
      // send obj to be made in processor thread
      props.input = { id: props.input.id };
      props.isStereo = isStereo;

      // creates clashes in processor thread unless
      // we skip a number here... nice
      Gibberish.utilities.getUID();

      props.overrideid = Gibberish.utilities.getUID();

      // XXX seems like this id gets overridden somewhere
      // hence .overrideid
      props.id = props.overrideid;

      Gibberish.worklet.port.postMessage({
        address: 'add',

        properties: JSON.stringify(props),

        name: ['analysis', 'Follow']
      });

      Gibberish.worklet.ugens.set(props.overrideid, out);

      let mult = props.multiplier;

      Object.defineProperty(out, 'multiplier', {
        get() {
          return mult;
        },
        set(v) {
          mult = v;
          Gibberish.worklet.port.postMessage({
            address: 'set',
            object: props.overrideid,
            name: 'multiplier',
            value: mult
          });
        }
      });

      let offset = props.offset;
      Object.defineProperty(out, 'offset', {
        get() {
          return offset;
        },
        set(v) {
          offset = v;
          Gibberish.worklet.port.postMessage({
            address: 'set',
            object: props.overrideid,
            name: 'offset',
            value: offset
          });
        }
      });
    } else {
      //isStereo = props.isStereo

      const buffer = g.data(props.bufferSize, 1);
      const input = g.in('input');
      const multiplier = g.in('multiplier');
      const offset = g.in('offset');

      const follow_out = Object.create(analyzer);
      follow_out.id = props.id = __props.overrideid;

      let avg = g.data(1, 1, { meta: true }); // output; make available outside jsdsp block
      const idx = avg.memory.values.idx;

      const callback = function (memory) {
        return avg[0];
      };

      const out = {
        callback,
        input: props.input,
        isStereo,
        dirty: true,
        inputNames: ['input', 'memory'],
        inputs: [props.input],
        id: Gibberish.utilities.getUID(),

        __properties__: { input: props.input }

        // nonsense to make our custom function work
      };out.callback.ugenName = out.ugenName = `follow_out_${follow_out.id}`;
      out.id = __props.overrideid;

      // begin input tracker
      const follow_in = Object.create(ugen);

      if (isStereo === true) {
        {
          "use jsdsp";
          // phase to write to follow buffer
          const bufferPhaseOut = g.accum(1, 0, { max: props.bufferSize, min: 0 });

          // hold running sum
          const sum = g.data(1, 1, { meta: true });

          const mono = g.abs(genish.add(input[0], input[1]));

          sum[0] = genish.sub(genish.add(sum[0], mono), g.peek(buffer, bufferPhaseOut, { mode: 'simple' }));

          g.poke(buffer, g.abs(mono), bufferPhaseOut);

          avg = genish.add(genish.mul(genish.div(sum[0], props.bufferSize), multiplier), offset);
        }
      } else {
        {
          "use jsdsp";
          // phase to write to follow buffer
          const bufferPhaseOut = g.accum(1, 0, { max: props.bufferSize, min: 0 });

          // hold running sum
          const sum = g.data(1, 1, { meta: true });

          sum[0] = genish.sub(genish.add(sum[0], g.abs(input)), g.peek(buffer, bufferPhaseOut, { mode: 'simple' }));

          g.poke(buffer, g.abs(input), bufferPhaseOut);

          avg = genish.add(genish.mul(genish.div(sum[0], props.bufferSize), multiplier), offset);
        }
      }
      Gibberish.utilities.getUID();

      props.isStereo = false;
      const record = Gibberish.factory(follow_in, avg, ['analysis', 'follow_in'], props);

      // nonsense to make our custom function work
      record.callback.ugenName = record.ugenName = `follow_in_${follow_out.id}`;

      if (Gibberish.analyzers.indexOf(record) === -1) Gibberish.analyzers.push(record);

      Gibberish.dirty(Gibberish.analyzers);

      Gibberish.ugens.set(__props.overrideid, record);

      out.record = record;
    }

    return out;
  };

  Follow.defaults = {
    input: 0,
    bufferSize: 1024,
    multiplier: 1,
    offset: 0
  };

  return Follow;
};

},{"../ugen.js":69,"./analyzer.js":1,"genish.js":114}],4:[function(require,module,exports){
const g = require('genish.js'),
      analyzer = require('./analyzer.js'),
      proxy = require('../workletProxy.js'),
      ugen = require('../ugen.js');

module.exports = function (Gibberish) {

  // an SSD ugen is in effect two-in-one,
  // one for input and one for output.  

  const SSD = inputProps => {
    const ssd = Object.create(analyzer);

    const props = Object.assign({}, SSD.defaults, inputProps);
    const isStereo = props.isStereo;
    const input = g.in('input');
    const historyL = g.history(0);
    const historyR = g.history(0);

    ssd.out = Out([historyL, historyR], props);
    ssd.in = In([historyL, historyR], props);

    ssd.listen = ssd.in.listen;

    return ssd;
  };

  const Out = (histories, props) => {
    let history;
    // if we don't find our history ugen in the processor thread,
    // just go ahead and make a new one, they're cheap...
    if (Gibberish.mode === 'processor') {
      const id = Array.isArray(histories) ? histories[0].id : histories.id;
      history = Gibberish.ugens.get(id);
      if (history === undefined) {
        history = g.history(0);
        Gibberish.ugens.set(id, history);
      }
      if (props === undefined) props = { id };
    } else {
      history = histories[0];
    }

    return Gibberish.factory(Object.create(ugen), history.out, ['analysis', 'SSD_Out'], props, null);
  };

  const In = histories => {
    const input = g.in('input');
    let historyL, historyR;

    if (Gibberish.mode === 'processor') {
      // for some reason the proessor id is always one off from the main thread id
      historyL = Gibberish.ugens.get(histories.id - 1);
      historyR = Gibberish.ugens.get(histories.id);
    } else {
      historyL = histories[0];
      historyR = histories[1];
    }

    // deliberate let
    let ssdin = Object.create(ugen);

    ssdin.listen = function (input) {
      ssdin.input = input;
      // changing the input must trigger codegen
      Gibberish.dirty(Gibberish.analyzers);

      let isStereo = input.isStereo;
      if (input.isStereo === undefined && input.isop === true) {
        isStereo = input.inputs[0].isStereo === true || input.inputs[1].isStereo === true;
      }
      if (isStereo === true && Gibberish.mode === 'processor') {
        const idx = historyL.graph.memory.value.idx;
        ssdin.callback = function (input, memory) {
          memory[idx] = input[0];
          memory[idx + 1] = input[1];
          return 0;
        };

        // when each ugen callback is passed to the master callback function
        // it needs to have a ugenName property; we'll just copy this over
        ssdin.callback.ugenName = ssdin.ugenName;
      }
    };

    ssdin = Gibberish.factory(ssdin, input, ['analysis', 'SSD_In'], { 'input': 0 });

    // overwrite the callback function in the processor thread...
    if (Gibberish.mode === 'processor') {
      const idx = historyL.graph.memory.value.idx;

      ssdin.callback = function (input, memory) {
        memory[idx] = input;
        return 0;
      };

      // when each ugen callback is passed to the master callback function
      // it needs to have a ugenName property; we'll just copy this over
      ssdin.callback.ugenName = ssdin.ugenName;
    }

    ssdin.type = 'analysis';
    Gibberish.analyzers.push(ssdin);

    return ssdin;
  };

  SSD.defaults = {
    input: 0,
    isStereo: false
  };

  return { In, Out, SSD };
};

},{"../ugen.js":69,"../workletProxy.js":71,"./analyzer.js":1,"genish.js":114}],5:[function(require,module,exports){
const ugen = require('../ugen.js'),
      g = require('genish.js');

module.exports = function (Gibberish) {

      const AD = function (argumentProps) {
            const ad = Object.create(ugen),
                  attack = g.in('attack'),
                  decay = g.in('decay');

            const props = Object.assign({}, AD.defaults, argumentProps);

            const graph = g.ad(attack, decay, { shape: props.shape, alpha: props.alpha });

            ad.trigger = graph.trigger;

            const __out = Gibberish.factory(ad, graph, ['envelopes', 'AD'], props);

            return __out;
      };

      AD.defaults = { attack: 44100, decay: 44100, shape: 'exponential', alpha: 5 };

      return AD;
};

},{"../ugen.js":69,"genish.js":114}],6:[function(require,module,exports){
const ugen = require('../ugen.js'),
      g = require('genish.js');

module.exports = function (Gibberish) {

  const ADSR = function (argumentProps) {
    const adsr = Object.create(ugen),
          attack = g.in('attack'),
          decay = g.in('decay'),
          sustain = g.in('sustain'),
          release = g.in('release'),
          sustainLevel = g.in('sustainLevel');

    const props = Object.assign({}, ADSR.defaults, argumentProps);

    Object.assign(adsr, props);

    const graph = g.adsr(attack, decay, sustain, sustainLevel, release, { triggerRelease: props.triggerRelease, shape: props.shape, alpha: props.alpha });

    adsr.trigger = graph.trigger;
    adsr.advance = graph.release;

    const __out = Gibberish.factory(adsr, graph, ['envelopes', 'ADSR'], props);

    return __out;
  };

  ADSR.defaults = {
    attack: 22050,
    decay: 22050,
    sustain: 44100,
    sustainLevel: .6,
    release: 44100,
    triggerRelease: false,
    shape: 'exponential',
    alpha: 5
  };

  return ADSR;
};

},{"../ugen.js":69,"genish.js":114}],7:[function(require,module,exports){
const g = require('genish.js');

module.exports = function (Gibberish) {

  const Envelopes = {
    AD: require('./ad.js')(Gibberish),
    ADSR: require('./adsr.js')(Gibberish),
    Ramp: require('./ramp.js')(Gibberish),

    export: target => {
      for (let key in Envelopes) {
        if (key !== 'export' && key !== 'factory') {
          target[key] = Envelopes[key];
        }
      }
    },

    factory(useADSR, shape, attack, decay, sustain, sustainLevel, release, triggerRelease = false) {
      let env;

      // deliberate use of single = to accomodate both 1 and true
      if (useADSR != true) {
        env = g.ad(attack, decay, { shape });
      } else {
        env = g.adsr(attack, decay, sustain, sustainLevel, release, { shape, triggerRelease });
        env.advance = env.release;
      }

      return env;
    }
  };

  return Envelopes;
};

},{"./ad.js":5,"./adsr.js":6,"./ramp.js":8,"genish.js":114}],8:[function(require,module,exports){
const ugen = require('../ugen.js'),
      g = require('genish.js');

module.exports = function (Gibberish) {

      const Ramp = function (argumentProps) {
            const ramp = Object.create(ugen),
                  length = g.in('length'),
                  from = g.in('from'),
                  to = g.in('to');

            const props = Object.assign({}, Ramp.defaults, argumentProps);

            const reset = g.bang();

            const phase = g.accum(g.div(1, length), reset, { shouldWrap: props.shouldLoop, shouldClamp: true }),
                  diff = g.sub(to, from),
                  graph = g.add(from, g.mul(phase, diff));

            ramp.trigger = reset.trigger;

            const out = Gibberish.factory(ramp, graph, ['envelopes', 'ramp'], props);

            return out;
      };

      Ramp.defaults = { from: 0, to: 1, length: g.gen.samplerate, shouldLoop: false };

      return Ramp;
};

},{"../ugen.js":69,"genish.js":114}],9:[function(require,module,exports){
/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

// originally from:
// https://github.com/GoogleChromeLabs/audioworklet-polyfill
// I am modifying it to accept variable buffer sizes
// and to get rid of some strange global initialization that seems required to use it
// with browserify. Also, I added changes to fix a bug in Safari for the AudioWorkletProcessor
// property not having a prototype (see:https://github.com/GoogleChromeLabs/audioworklet-polyfill/pull/25)
// TODO: Why is there an iframe involved? (realm.js)

const Realm = require('./realm.js');

const AWPF = function (self = window, bufferSize = 4096) {
  const PARAMS = [];
  let nextPort;

  if (typeof AudioWorkletNode !== 'function' || !("audioWorklet" in AudioContext.prototype)) {
    self.AudioWorkletNode = function AudioWorkletNode(context, name, options) {
      const processor = getProcessorsForContext(context)[name];
      const outputChannels = options && options.outputChannelCount ? options.outputChannelCount[0] : 2;
      const scriptProcessor = context.createScriptProcessor(bufferSize, 2, outputChannels);

      scriptProcessor.parameters = new Map();
      if (processor.properties) {
        for (let i = 0; i < processor.properties.length; i++) {
          const prop = processor.properties[i];
          const node = context.createGain().gain;
          node.value = prop.defaultValue;
          // @TODO there's no good way to construct the proxy AudioParam here
          scriptProcessor.parameters.set(prop.name, node);
        }
      }

      const mc = new MessageChannel();
      nextPort = mc.port2;
      const inst = new processor.Processor(options || {});
      nextPort = null;

      scriptProcessor.port = mc.port1;
      scriptProcessor.processor = processor;
      scriptProcessor.instance = inst;
      scriptProcessor.onaudioprocess = onAudioProcess;
      return scriptProcessor;
    };

    Object.defineProperty((self.AudioContext || self.webkitAudioContext).prototype, 'audioWorklet', {
      get() {
        return this.$$audioWorklet || (this.$$audioWorklet = new self.AudioWorklet(this));
      }
    });

    /* XXX - ADDED TO OVERCOME PROBLEM IN SAFARI WHERE AUDIOWORKLETPROCESSOR PROTOTYPE IS NOT AN OBJECT */
    const AudioWorkletProcessor = function () {
      this.port = nextPort;
    };
    AudioWorkletProcessor.prototype = {};

    self.AudioWorklet = class AudioWorklet {
      constructor(audioContext) {
        this.$$context = audioContext;
      }

      addModule(url, options) {
        return fetch(url).then(r => {
          if (!r.ok) throw Error(r.status);
          return r.text();
        }).then(code => {
          const context = {
            sampleRate: this.$$context.sampleRate,
            currentTime: this.$$context.currentTime,
            AudioWorkletProcessor,
            registerProcessor: (name, Processor) => {
              const processors = getProcessorsForContext(this.$$context);
              processors[name] = {
                realm,
                context,
                Processor,
                properties: Processor.parameterDescriptors || []
              };
            }
          };

          context.self = context;
          const realm = new Realm(context, document.documentElement);
          realm.exec((options && options.transpile || String)(code));
          return null;
        });
      }
    };
  }

  function onAudioProcess(e) {
    const parameters = {};
    let index = -1;
    this.parameters.forEach((value, key) => {
      const arr = PARAMS[++index] || (PARAMS[index] = new Float32Array(this.bufferSize));
      // @TODO proper values here if possible
      arr.fill(value.value);
      parameters[key] = arr;
    });
    this.processor.realm.exec('self.sampleRate=sampleRate=' + this.context.sampleRate + ';' + 'self.currentTime=currentTime=' + this.context.currentTime);
    const inputs = channelToArray(e.inputBuffer);
    const outputs = channelToArray(e.outputBuffer);
    this.instance.process([inputs], [outputs], parameters);
  }

  function channelToArray(ch) {
    const out = [];
    for (let i = 0; i < ch.numberOfChannels; i++) {
      out[i] = ch.getChannelData(i);
    }
    return out;
  }

  function getProcessorsForContext(audioContext) {
    return audioContext.$$processors || (audioContext.$$processors = {});
  }
};

module.exports = AWPF;

},{"./realm.js":11}],10:[function(require,module,exports){
/*
 * https://github.com/antimatter15/heapqueue.js/blob/master/heapqueue.js
 *
 * This implementation is very loosely based off js-priority-queue
 * by Adam Hooper from https://github.com/adamhooper/js-priority-queue
 *
 * The js-priority-queue implementation seemed a teensy bit bloated
 * with its require.js dependency and multiple storage strategies
 * when all but one were strongly discouraged. So here is a kind of
 * condensed version of the functionality with only the features that
 * I particularly needed.
 *
 * Using it is pretty simple, you just create an instance of HeapQueue
 * while optionally specifying a comparator as the argument:
 *
 * var heapq = new HeapQueue();
 *
 * //IF NEGATIVE, RETURN A
 *
 * var customq = new HeapQueue(function(a, b){
 *   // if b > a, return negative
 *   // means that it spits out the smallest item first
 *   return a - b;
 * });
 *
 * Note that in this case, the default comparator is identical to
 * the comparator which is used explicitly in the second queue.
 *
 * Once you've initialized the heapqueue, you can plop some new
 * elements into the queue with the push method (vaguely reminiscent
 * of typical javascript arays)
 *
 * heapq.push(42);
 * heapq.push("kitten");
 *
 * The push method returns the new number of elements of the queue.
 *
 * You can push anything you'd like onto the queue, so long as your
 * comparator function is capable of handling it. The default
 * comparator is really stupid so it won't be able to handle anything
 * other than an number by default.
 *
 * You can preview the smallest item by using peek.
 *
 * heapq.push(-9999);
 * heapq.peek(); // ==> -9999
 *
 * The useful complement to to the push method is the pop method,
 * which returns the smallest item and then removes it from the
 * queue.
 *
 * heapq.push(1);
 * heapq.push(2);
 * heapq.push(3);
 * heapq.pop(); // ==> 1
 * heapq.pop(); // ==> 2
 * heapq.pop(); // ==> 3
 */
const HeapQueue = function (cmp) {
  this.cmp = cmp || function (a, b) {
    return a - b;
  };
  this.length = 0;
  this.data = [];
};
HeapQueue.prototype.peek = function () {
  return this.data[0];
};
HeapQueue.prototype.push = function (value) {
  this.data.push(value);

  var pos = this.data.length - 1,
      parent,
      x;

  while (pos > 0) {
    parent = pos - 1 >>> 1;
    if (this.cmp(this.data[pos], this.data[parent]) < 0) {
      x = this.data[parent];
      this.data[parent] = this.data[pos];
      this.data[pos] = x;
      pos = parent;
    } else break;
  }
  return this.length++;
};
HeapQueue.prototype.pop = function () {
  var last_val = this.data.pop(),
      ret = this.data[0];
  if (this.data.length > 0) {
    this.data[0] = last_val;
    var pos = 0,
        last = this.data.length - 1,
        left,
        right,
        minIndex,
        x;
    while (1) {
      left = (pos << 1) + 1;
      right = left + 1;
      minIndex = pos;
      if (left <= last && this.cmp(this.data[left], this.data[minIndex]) < 0) minIndex = left;
      if (right <= last && this.cmp(this.data[right], this.data[minIndex]) < 0) minIndex = right;
      if (minIndex !== pos) {
        x = this.data[minIndex];
        this.data[minIndex] = this.data[pos];
        this.data[pos] = x;
        pos = minIndex;
      } else break;
    }
  } else {
    ret = last_val;
  }
  this.length--;
  return ret;
};

module.exports = HeapQueue;

},{}],11:[function(require,module,exports){

/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

module.exports = function Realm(scope, parentElement) {
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:absolute;left:0;top:-999px;width:1px;height:1px;';
  parentElement.appendChild(frame);
  const win = frame.contentWindow;
  const doc = win.document;
  let vars = 'var window,$hook';
  for (const i in win) {
    if (!(i in scope) && i !== 'eval') {
      vars += ',';
      vars += i;
    }
  }
  for (const i in scope) {
    vars += ',';
    vars += i;
    vars += '=self.';
    vars += i;
  }
  const script = doc.createElement('script');
  script.appendChild(doc.createTextNode(`function $hook(self,console) {"use strict";
        ${vars};return function() {return eval(arguments[0])}}`));
  doc.body.appendChild(script);
  this.exec = win.$hook.call(scope, scope, console);
};

},{}],12:[function(require,module,exports){
const __proxy = require('./workletProxy.js');
const effectProto = require('./fx/effect.js');

module.exports = function (Gibberish) {
  const proxy = __proxy(Gibberish);

  const factory = function (ugen, graph, __name, values, cb = null, shouldProxy = true) {
    if (Gibberish.mode === 'processor') ugen.callback = cb === null ? Gibberish.genish.gen.createCallback(graph, Gibberish.memory, false, true) : cb;else ugen.callback = { out: [] };

    let name = Array.isArray(__name) ? __name[__name.length - 1] : __name;

    Object.assign(ugen, {
      //type: 'ugen',
      id: values.id || Gibberish.utilities.getUID(),
      ugenName: name + '_',
      graph: graph,
      inputNames: ugen.inputNames || new Set(Gibberish.genish.gen.parameters),
      isStereo: Array.isArray(graph),
      dirty: true,
      __properties__: values,
      __addresses__: {}
    });

    ugen.ugenName += ugen.id;
    if (Gibberish.mode === 'processor') {
      ugen.callback.ugenName = ugen.ugenName; // XXX hacky
      ugen.callback.id = ugen.id;
    }

    //console.log( 'ugen name/id:', ugen.ugenName, ugen.id )
    //console.log( 'callback name/id:', ugen.callback.ugenName, ugen.callback.id )

    for (let param of ugen.inputNames) {
      if (param === 'memory') continue;

      let value = values[param],
          isNumber = typeof value === 'object' || isNaN(value) ? false : true,
          idx;

      if (isNumber) {
        idx = Gibberish.memory.alloc(1);
        Gibberish.memory.heap[idx] = value;
        ugen.__addresses__[param] = idx;
      }

      // TODO: do we need to check for a setter?
      let desc = Object.getOwnPropertyDescriptor(ugen, param),
          setter;

      if (desc !== undefined) {
        setter = desc.set;
      }

      Object.defineProperty(ugen, param, {
        configurable: true,
        get() {
          if (isNumber) {
            return Gibberish.memory.heap[idx];
          } else {
            return value;
          }
        },
        set(v) {
          //if( param === 'input' ) console.log( 'INPUT:', v, isNumber )
          if (value !== v) {
            if (setter !== undefined) setter(v);
            if (typeof v === 'number') {
              Gibberish.memory.heap[idx] = value = v;
              if (isNumber === false) Gibberish.dirty(ugen);
              isNumber = true;
            } else {
              value = v;
              /*if( isNumber === true )*/Gibberish.dirty(ugen);
              //console.log( 'switching from number:', param, value )
              isNumber = false;
            }
          }
        }
      });
    }

    // add bypass 
    if (effectProto.isPrototypeOf(ugen)) {
      let value = ugen.bypass;
      Object.defineProperty(ugen, 'bypass', {
        configurable: true,
        get() {
          return value;
        },
        set(v) {
          if (value !== v) {
            Gibberish.dirty(ugen);
            value = v;
          }
        }
      });
    }

    if (ugen.__requiresRecompilation !== undefined) {
      ugen.__requiresRecompilation.forEach(prop => {
        let value = values[prop];
        let isNumber = !isNaN(value);

        Object.defineProperty(ugen, prop, {
          configurable: true,
          get() {
            if (isNumber) {
              let idx = ugen.__addresses__[prop];
              return Gibberish.memory.heap[idx];
            } else {
              //console.log( 'returning:', prop, value, Gibberish.mode )
              return value;
            }
          },
          set(v) {
            if (value !== v) {
              if (typeof v === 'number') {
                let idx = ugen.__addresses__[prop];
                if (idx === undefined) {
                  idx = Gibberish.memory.alloc(1);
                  ugen.__addresses__[prop] = idx;
                }
                value = values[prop] = Gibberish.memory.heap[idx] = v;
                isNumber = true;
              } else {
                value = values[prop] = v;
                isNumber = false;
                //console.log( 'setting ugen', value, Gibberish.mode )
                Gibberish.dirty(ugen);
              }

              //console.log( 'SETTING REDO GRAPH', prop, Gibberish.mode )

              // needed for filterType at the very least, becauae the props
              // are reused when re-creating the graph. This seems like a cheaper
              // way to solve this problem.
              //values[ prop ] = v

              this.__redoGraph();
            }
          }
        });
      });
    }

    // will only create proxy if worklets are being used
    // otherwise will return unaltered ugen

    if (values.shouldAddToUgen === true) Object.assign(ugen, values);

    return shouldProxy ? proxy(__name, values, ugen) : ugen;
  };

  factory.getUID = () => {
    return Gibberish.utilities.getUID();
  };

  return factory;
};

},{"./fx/effect.js":27,"./workletProxy.js":71}],13:[function(require,module,exports){
let g = require('genish.js');

// constructor for schroeder allpass filters
let allPass = function (_input, length = 500, feedback = .5) {
  let index = g.counter(1, 0, length),
      buffer = g.data(length),
      bufferSample = g.peek(buffer, index, { interp: 'none', mode: 'samples' }),
      out = g.memo(g.add(g.mul(-1, _input), bufferSample));

  g.poke(buffer, g.add(_input, g.mul(bufferSample, feedback)), index);

  return out;
};

module.exports = allPass;

},{"genish.js":114}],14:[function(require,module,exports){
let g = require('genish.js'),
    filter = require('./filter.js');

module.exports = function (Gibberish) {

  const genish = g;
  Gibberish.genish.biquad = (input, __cutoff, __Q, mode, isStereo) => {
    'use jsdsp';

    let in1a0, x0a1, x1a2, y0b0, y1b1, in1a0_r, x0a1_r, x1a2_r, y0b0_r, y1b1_r, c;

    let returnValue;

    const x = genish.data([0, 0], 1, { meta: true });
    const y = genish.data([0, 0], 1, { meta: true });
    const a = genish.data([0, 0, 0], 1, { meta: true });
    const b = genish.data([0, 0], 1, { meta: true });

    const Q = g.min(genish.add(.5, genish.mul(__Q, 22)), 22.5);
    const cutoff = genish.div(genish.mul(g.max(.005, g.min(__cutoff, .995)), g.gen.samplerate), 4);
    //let w0 = g.memo( g.mul( 2 * Math.PI, g.div( g.max(.005, g.min(cutoff,.995)),  g.gen.samplerate ) ) ),
    let w0 = genish.mul(genish.mul(2, Math.PI), genish.div(cutoff, g.gen.samplerate)),
        sinw0 = g.sin(w0),
        cosw0 = g.cos(w0),
        alpha = genish.div(sinw0, genish.mul(2, Q));

    //let w0 = g.memo( g.mul( 2 * Math.PI, g.div( cutoff,  g.gen.samplerate ) ) ),

    let oneMinusCosW = genish.sub(1, cosw0);

    /******** process coefficients ********/
    switch (mode) {
      case 1:
        a[0] = genish.div(genish.add(1, cosw0), 2);
        a[1] = genish.mul(genish.add(1, cosw0), -1);
        a[2] = a[0];
        c = genish.add(1, alpha);
        b[0] = genish.mul(-2, cosw0);
        b[1] = genish.sub(1, alpha);
        break;
      case 2:
        a[0] = genish.mul(Q, alpha);
        a[1] = 0;
        a[2] = genish.mul(a[0], -1);
        c = genish.add(1, alpha);
        b[0] = genish.mul(-2, cosw0);
        b[1] = genish.sub(1, alpha);
        break;
      default:
        // LP
        a[0] = genish.div(oneMinusCosW, 2);
        a[1] = oneMinusCosW;
        a[2] = a[0];
        c = genish.add(1, alpha);
        b[0] = genish.mul(-2, cosw0);
        b[1] = genish.sub(1, alpha);
    }

    a[0] = genish.div(a[0], c);a[1] = genish.div(a[1], c);a[2] = genish.div(a[2], c);
    b[0] = genish.div(b[0], c);b[1] = genish.div(b[1], c);

    /******** end coefficients ********/

    /****** left / mono output ********/

    let l = isStereo === true ? input[0] : input;
    in1a0 = genish.mul(l, a[0]);
    x0a1 = genish.mul(x[0], a[1]);
    x1a2 = genish.mul(x[1], a[2]);

    x[1] = x[0];
    x[0] = l;

    let sumLeft = genish.add(genish.add(in1a0, x0a1), x1a2);

    y0b0 = genish.mul(y[0], b[0]);
    y1b1 = genish.mul(y[1], b[1]);
    y[1] = y[0];

    let sumRight = genish.add(y0b0, y1b1);

    let diff = genish.sub(sumLeft, sumRight);

    y[0] = diff;

    /******** end left/mono **********/

    if (isStereo) {
      const xr = genish.data([0, 0], 1, { meta: true });
      const yr = genish.data([0, 0], 1, { meta: true });
      //let x1_1 = g.history(), x2_1 = g.history(), y1_1 = g.history(), y2_1 = g.history()

      const r = input[1];
      in1a0_r = genish.mul(r, a[0]); //g.mul( x1_1.in( input[1] ), a0 )
      x0a1_r = genish.mul(xr[0], a[1]); //g.mul( x2_1.in( x1_1.out ), a1 )
      x1a2_r = genish.mul(xr[1], a[2]); //g.mul( x2_1.out,            a2 )

      xr[1] = xr[0];
      xr[0] = r;

      const sumLeft_r = genish.add(genish.add(in1a0_r, x0a1_r), x1a2_r);

      y0b0_r = genish.mul(yr[0], b[0]); //g.mul( y2_1.in( y1_1.out ), b1 )
      y1b1_r = genish.mul(yr[1], b[1]); //g.mul( y2_1.out, b2 )
      yr[1] = yr[0];

      const sumRight_r = genish.add(y0b0_r, y1b1_r);

      const diff_r = genish.sub(sumLeft_r, sumRight_r);

      yr[0] = diff_r;

      returnValue = [diff, diff_r];
    } else {
      returnValue = diff;
    }

    return returnValue;
  };

  let Biquad = inputProps => {
    const biquad = Object.create(filter);
    const props = Object.assign({}, Biquad.defaults, inputProps);
    let __out;

    Object.assign(biquad, props);

    biquad.__createGraph = function () {
      let isStereo = false;
      if (__out === undefined) {
        isStereo = props.input !== undefined && props.input.isStereo !== undefined ? props.input.isStereo : false;
      } else {
        isStereo = __out.input.isStereo;
        __out.isStereo = isStereo;
      }
      biquad.graph = Gibberish.genish.biquad(g.in('input'), g.in('cutoff'), g.in('Q'), biquad.mode, isStereo);
    };

    biquad.__createGraph();
    biquad.__requiresRecompilation = ['mode', 'input'];

    __out = Gibberish.factory(biquad, biquad.graph, ['filters', 'Filter12Biquad'], props);

    return __out;
  };

  Biquad.defaults = {
    input: 0,
    Q: .15,
    cutoff: .05,
    mode: 0
  };

  return Biquad;
};

},{"./filter.js":17,"genish.js":114}],15:[function(require,module,exports){
let g = require('genish.js');

let combFilter = function (_input, combLength, damping = .5 * .4, feedbackCoeff = .84) {
  let lastSample = g.history(),
      readWriteIdx = g.counter(1, 0, combLength),
      combBuffer = g.data(combLength),
      out = g.peek(combBuffer, readWriteIdx, { interp: 'none', mode: 'samples' }),
      storeInput = g.memo(g.add(g.mul(out, g.sub(1, damping)), g.mul(lastSample.out, damping)));

  lastSample.in(storeInput);

  g.poke(combBuffer, g.add(_input, g.mul(storeInput, feedbackCoeff)), readWriteIdx);

  return out;
};

module.exports = combFilter;

},{"genish.js":114}],16:[function(require,module,exports){
const g = require('genish.js'),
      filter = require('./filter.js');

const genish = g;
module.exports = function (Gibberish) {
  Gibberish.genish.diodeZDF = (input, __Q, __freq, saturation, isStereo = false) => {
    const iT = 1 / g.gen.samplerate,
          kz1 = g.history(0),
          kz2 = g.history(0),
          kz3 = g.history(0),
          kz4 = g.history(0);

    let ka1 = 1.0,
        ka2 = 0.5,
        ka3 = 0.5,
        ka4 = 0.5,
        kindx = 0;

    const freq = g.mul(g.max(.005, g.min(__freq, .995)), genish.gen.samplerate / 2);
    //const freq = g.max(.005, g.min( __freq, .995))

    // XXX this is where the magic number hapens for Q...
    const Q = g.memo(g.add(.5, g.mul(__Q, g.add(5, g.sub(5, g.mul(g.div(freq, 20000), 5))))));
    // kwd = 2 * $M_PI * acf[kindx]
    const kwd = g.memo(g.mul(Math.PI * 2, freq));

    // kwa = (2/iT) * tan(kwd * iT/2) 
    const kwa = g.memo(g.mul(2 / iT, g.tan(g.mul(kwd, iT / 2))));

    // kG  = kwa * iT/2 
    const kg = g.memo(g.mul(kwa, iT / 2));

    const kG4 = g.memo(g.mul(.5, g.div(kg, g.add(1, kg))));
    const kG3 = g.memo(g.mul(.5, g.div(kg, g.sub(g.add(1, kg), g.mul(g.mul(.5, kg), kG4)))));
    const kG2 = g.memo(g.mul(.5, g.div(kg, g.sub(g.add(1, kg), g.mul(g.mul(.5, kg), kG3)))));
    const kG1 = g.memo(g.div(kg, g.sub(g.add(1, kg), g.mul(kg, kG2))));

    const kGAMMA = g.memo(g.mul(g.mul(kG4, kG3), g.mul(kG2, kG1)));

    const kSG1 = g.memo(g.mul(g.mul(kG4, kG3), kG2));

    const kSG2 = g.memo(g.mul(kG4, kG3));
    const kSG3 = kG4;
    let kSG4 = 1.0;
    // kk = 4.0*(kQ - 0.5)/(25.0 - 0.5)
    const kalpha = g.memo(g.div(kg, g.add(1.0, kg)));

    const kbeta1 = g.memo(g.div(1.0, g.sub(g.add(1, kg), g.mul(kg, kG2))));
    const kbeta2 = g.memo(g.div(1.0, g.sub(g.add(1, kg), g.mul(g.mul(.5, kg), kG3))));
    const kbeta3 = g.memo(g.div(1.0, g.sub(g.add(1, kg), g.mul(g.mul(.5, kg), kG4))));
    const kbeta4 = g.memo(g.div(1.0, g.add(1, kg)));

    const kgamma1 = g.memo(g.add(1, g.mul(kG1, kG2)));
    const kgamma2 = g.memo(g.add(1, g.mul(kG2, kG3)));
    const kgamma3 = g.memo(g.add(1, g.mul(kG3, kG4)));

    const kdelta1 = kg;
    const kdelta2 = g.memo(g.mul(0.5, kg));
    const kdelta3 = g.memo(g.mul(0.5, kg));

    const kepsilon1 = kG2;
    const kepsilon2 = kG3;
    const kepsilon3 = kG4;

    const klastcut = freq;

    //;; feedback inputs 
    const kfb4 = g.memo(g.mul(kbeta4, kz4.out));
    const kfb3 = g.memo(g.mul(kbeta3, g.add(kz3.out, g.mul(kfb4, kdelta3))));
    const kfb2 = g.memo(g.mul(kbeta2, g.add(kz2.out, g.mul(kfb3, kdelta2))));

    //;; feedback process

    const kfbo1 = g.memo(g.mul(kbeta1, g.add(kz1.out, g.mul(kfb2, kdelta1))));
    const kfbo2 = g.memo(g.mul(kbeta2, g.add(kz2.out, g.mul(kfb3, kdelta2))));
    const kfbo3 = g.memo(g.mul(kbeta3, g.add(kz3.out, g.mul(kfb4, kdelta3))));
    const kfbo4 = kfb4;

    const kSIGMA = g.memo(g.add(g.add(g.mul(kSG1, kfbo1), g.mul(kSG2, kfbo2)), g.add(g.mul(kSG3, kfbo3), g.mul(kSG4, kfbo4))));

    //const kSIGMA = 1
    //;; non-linear processing
    //if (knlp == 1) then
    //  kin = (1.0 / tanh(ksaturation)) * tanh(ksaturation * kin)
    //elseif (knlp == 2) then
    //  kin = tanh(ksaturation * kin) 
    //endif
    //
    //const kin = input 
    let kin = isStereo === true ? g.add(input[0], input[1]) : input; //g.memo( g.mul( g.div( 1, g.tanh( saturation ) ), g.tanh( g.mul( saturation, input ) ) ) )
    kin = g.tanh(g.mul(saturation, kin));

    const kun = g.div(g.sub(kin, g.mul(Q, kSIGMA)), g.add(1, g.mul(Q, kGAMMA)));
    //const kun = g.div( 1, g.add( 1, g.mul( Q, kGAMMA ) ) )
    //(kin - kk * kSIGMA) / (1.0 + kk * kGAMMA)

    //;; 1st stage
    let kxin = g.memo(g.add(g.add(g.mul(kun, kgamma1), kfb2), g.mul(kepsilon1, kfbo1)));
    // (kun * kgamma1 + kfb2 + kepsilon1 * kfbo1)
    let kv = g.memo(g.mul(g.sub(g.mul(ka1, kxin), kz1.out), kalpha));
    //kv = (ka1 * kxin - kz1) * kalpha 
    let klp = g.add(kv, kz1.out);
    //klp = kv + kz1
    kz1.in(g.add(klp, kv));
    //kz1 = klp + kv

    //;; 2nd stage
    //kxin = (klp * kgamma2 + kfb3 + kepsilon2 * kfbo2)
    //kv = (ka2 * kxin - kz2) * kalpha 
    //klp = kv + kz2
    //kz2 = klp + kv

    kxin = g.memo(g.add(g.add(g.mul(klp, kgamma2), kfb3), g.mul(kepsilon2, kfbo2)));
    // (kun * kgamma1 + kfb2 + kepsilon1 * kfbo1)
    kv = g.memo(g.mul(g.sub(g.mul(ka2, kxin), kz2.out), kalpha));
    //kv = (ka1 * kxin - kz1) * kalpha 
    klp = g.add(kv, kz2.out);
    //klp = kv + kz1
    kz2.in(g.add(klp, kv));
    //kz1 = klp + kv

    //;; 3rd stage
    //kxin = (klp * kgamma3 + kfb4 + kepsilon3 * kfbo3)
    //kv = (ka3 * kxin - kz3) * kalpha 
    //klp = kv + kz3
    //kz3 = klp + kv

    kxin = g.memo(g.add(g.add(g.mul(klp, kgamma3), kfb4), g.mul(kepsilon3, kfbo3)));
    // (kun * kgamma1 + kfb2 + kepsilon1 * kfbo1)
    kv = g.memo(g.mul(g.sub(g.mul(ka3, kxin), kz3.out), kalpha));
    //kv = (ka1 * kxin - kz1) * kalpha 
    klp = g.add(kv, kz3.out);
    //klp = kv + kz1
    kz3.in(g.add(klp, kv));
    //kz1 = klp + kv

    //;; 4th stage
    //kv = (ka4 * klp - kz4) * kalpha 
    //klp = kv + kz4
    //kz4 = klp + kv

    // (kun * kgamma1 + kfb2 + kepsilon1 * kfbo1)
    kv = g.memo(g.mul(g.sub(g.mul(ka4, kxin), kz4.out), kalpha));
    //kv = (ka1 * kxin - kz1) * kalpha 
    klp = g.add(kv, kz4.out);
    //klp = kv + kz1
    kz4.in(g.add(klp, kv));

    //kz1 = klp + kv
    if (isStereo) {
      //let polesR = g.data([ 0,0,0,0 ], 1, { meta:true }),
      //    rezzR = g.clamp( g.mul( polesR[3], rez ) ),
      //    outputR = g.sub( input[1], rezzR )         

      //polesR[0] = g.add( polesR[0], g.mul( g.add( g.mul(-1, polesR[0] ), outputR   ), cutoff ))
      //polesR[1] = g.add( polesR[1], g.mul( g.add( g.mul(-1, polesR[1] ), polesR[0] ), cutoff ))
      //polesR[2] = g.add( polesR[2], g.mul( g.add( g.mul(-1, polesR[2] ), polesR[1] ), cutoff ))
      //polesR[3] = g.add( polesR[3], g.mul( g.add( g.mul(-1, polesR[3] ), polesR[2] ), cutoff ))

      //let right = g.switch( isLowPass, polesR[3], g.sub( outputR, polesR[3] ) )

      //returnValue = [left, right]
    } else {}
      // returnValue = klp

      //returnValue = klp

    return klp;
  };

  const DiodeZDF = inputProps => {
    const zdf = Object.create(filter);
    const props = Object.assign({}, DiodeZDF.defaults, filter.defaults, inputProps);
    const isStereo = props.input.isStereo;

    Object.assign(zdf, props);

    const __out = Gibberish.factory(zdf, Gibberish.genish.diodeZDF(g.in('input'), g.in('Q'), g.in('cutoff'), g.in('saturation'), isStereo), ['filters', 'Filter24TB303'], props);

    return __out;
  };

  DiodeZDF.defaults = {
    input: 0,
    Q: .65,
    saturation: 1,
    cutoff: .5
  };

  return DiodeZDF;
};

},{"./filter.js":17,"genish.js":114}],17:[function(require,module,exports){
let ugen = require('../ugen.js')();

let filter = Object.create(ugen);

Object.assign(filter, {
  defaults: { bypass: false }
});

module.exports = filter;

},{"../ugen.js":69}],18:[function(require,module,exports){
let g = require('genish.js'),
    filter = require('./filter.js');

module.exports = function (Gibberish) {

  Gibberish.genish.filter24 = (input, _rez, _cutoff, isLowPass, isStereo = false) => {
    let returnValue,
        polesL = g.data([0, 0, 0, 0], 1, { meta: true }),
        peekProps = { interp: 'none', mode: 'simple' },
        rez = g.memo(g.mul(_rez, 5)),
        cutoff = g.memo(g.div(_cutoff, 11025)),
        rezzL = g.clamp(g.mul(polesL[3], rez)),
        outputL = g.sub(isStereo ? input[0] : input, rezzL);

    polesL[0] = g.add(polesL[0], g.mul(g.add(g.mul(-1, polesL[0]), outputL), cutoff));
    polesL[1] = g.add(polesL[1], g.mul(g.add(g.mul(-1, polesL[1]), polesL[0]), cutoff));
    polesL[2] = g.add(polesL[2], g.mul(g.add(g.mul(-1, polesL[2]), polesL[1]), cutoff));
    polesL[3] = g.add(polesL[3], g.mul(g.add(g.mul(-1, polesL[3]), polesL[2]), cutoff));

    let left = g.switch(isLowPass, polesL[3], g.sub(outputL, polesL[3]));

    if (isStereo) {
      let polesR = g.data([0, 0, 0, 0], 1, { meta: true }),
          rezzR = g.clamp(g.mul(polesR[3], rez)),
          outputR = g.sub(input[1], rezzR);

      polesR[0] = g.add(polesR[0], g.mul(g.add(g.mul(-1, polesR[0]), outputR), cutoff));
      polesR[1] = g.add(polesR[1], g.mul(g.add(g.mul(-1, polesR[1]), polesR[0]), cutoff));
      polesR[2] = g.add(polesR[2], g.mul(g.add(g.mul(-1, polesR[2]), polesR[1]), cutoff));
      polesR[3] = g.add(polesR[3], g.mul(g.add(g.mul(-1, polesR[3]), polesR[2]), cutoff));

      let right = g.switch(isLowPass, polesR[3], g.sub(outputR, polesR[3]));

      returnValue = [left, right];
    } else {
      returnValue = left;
    }

    return returnValue;
  };

  let Filter24 = inputProps => {
    let filter24 = Object.create(filter);
    let props = Object.assign({}, Filter24.defaults, filter.defaults, inputProps);
    let isStereo = props.input.isStereo;

    const __out = Gibberish.factory(filter24, Gibberish.genish.filter24(g.in('input'), g.in('Q'), g.in('cutoff'), g.in('isLowPass'), isStereo), ['filters', 'Filter24Classic'], props);

    return __out;
  };

  Filter24.defaults = {
    input: 0,
    Q: .25,
    cutoff: 880,
    isLowPass: 1
  };

  return Filter24;
};

},{"./filter.js":17,"genish.js":114}],19:[function(require,module,exports){
module.exports = function (Gibberish) {

  const g = Gibberish.genish;

  const filters = {
    Filter24Classic: require('./filter24.js')(Gibberish),
    Filter24Moog: require('./ladder.dsp.js')(Gibberish),
    Filter24TB303: require('./diodeFilterZDF.js')(Gibberish),
    Filter12Biquad: require('./biquad.dsp.js')(Gibberish),
    Filter12SVF: require('./svf.js')(Gibberish),

    // not for use by end-users
    genish: {
      Comb: require('./combfilter.js'),
      AllPass: require('./allpass.js')
    },

    factory(input, cutoff, saturation, _props, isStereo = false) {
      let filteredOsc;

      let props = Object.assign({}, filters.defaults, _props);

      switch (props.filterType) {
        case 1:
          filteredOsc = g.zd24(input, g.min(g.in('Q'), .9999), cutoff, 0); // g.max(.005, g.min( cutoff, 1 ) ) )
          break;
        case 2:
          filteredOsc = g.diodeZDF(input, g.min(g.in('Q'), .9999), cutoff, saturation, isStereo);
          break;
        case 3:
          filteredOsc = g.svf(input, cutoff, g.sub(1, g.in('Q')), props.filterMode, isStereo, true);
          break;
        case 4:
          filteredOsc = g.biquad(input, cutoff, g.in('Q'), props.filterMode, isStereo);
          break;
        case 5:
          //isLowPass = g.param( 'lowPass', 1 ),
          filteredOsc = g.filter24(input, g.in('Q'), cutoff, props.filterMode, isStereo);
          break;
        default:
          // return unfiltered signal
          filteredOsc = input; //g.filter24( oscWithGain, g.in('resonance'), cutoff, isLowPass )
          break;
      }

      return filteredOsc;
    },

    defaults: { filterMode: 0, filterType: 0 }
  };

  filters.export = target => {
    for (let key in filters) {
      if (key !== 'export' && key !== 'genish') {
        target[key] = filters[key];
      }
    }
  };

  return filters;
};

},{"./allpass.js":13,"./biquad.dsp.js":14,"./combfilter.js":15,"./diodeFilterZDF.js":16,"./filter24.js":18,"./ladder.dsp.js":20,"./svf.js":21}],20:[function(require,module,exports){
const genish = require('genish.js'),
      filterProto = require('./filter.js');

module.exports = function (Gibberish) {

  const makeChannel = function (input, _Q, _freq) {
    'use jsdsp';

    const iT = genish.div(1, genish.gen.samplerate),
          z = genish.data([0, 0, 0, 0], 1, { meta: true });

    const freq = genish.max(.005, genish.min(_freq, 1));
    const Q = genish.add(.5, genish.mul(_Q, 23));
    // kwd = 2 * $M_PI * acf[kindx]
    const kwd = genish.div(genish.mul(genish.mul(genish.mul(Math.PI, 2), freq), genish.gen.samplerate), 2);

    // kwa = (2/iT) * tan(kwd * iT/2) 
    const kwa = genish.mul(genish.div(2, iT), genish.tan(genish.div(genish.mul(kwd, iT), 2)));

    // kG  = kwa * iT/2 
    const kg = genish.div(genish.mul(kwa, iT), 2);

    // kk = 4.0*(kQ - 0.5)/(25.0 - 0.5)
    const kk = genish.div(genish.mul(4, genish.sub(Q, .5)), 24.5);

    // kg_plus_1 = (1.0 + kg)
    const kg_plus_1 = genish.add(1, kg);

    // kG = kg / kg_plus_1 
    const kG = genish.div(kg, kg_plus_1),
          kG_2 = genish.mul(kG, kG),
          kG_3 = genish.mul(kG_2, kG),
          kGAMMA = genish.mul(kG_2, kG_2);

    const kS1 = genish.div(z[0], kg_plus_1),
          kS2 = genish.div(z[1], kg_plus_1),
          kS3 = genish.div(z[2], kg_plus_1),
          kS4 = genish.div(z[3], kg_plus_1);

    //kS = kG_3 * kS1  + kG_2 * kS2 + kG * kS3 + kS4 
    const kS = genish.add(genish.add(genish.add(genish.mul(kG_3, kS1), genish.mul(kG_2, kS2)), genish.mul(kG, kS3)), kS4);

    //ku = (kin - kk *  kS) / (1 + kk * kGAMMA)
    const ku = genish.div(genish.sub(input, genish.mul(kk, kS)), genish.add(1, genish.mul(kk, kGAMMA)));

    let kv = genish.mul(genish.sub(ku, z[0]), kG);
    let klp = genish.add(kv, z[0]);
    z[0] = genish.add(klp, kv);

    kv = genish.mul(genish.sub(klp, z[1]), kG);
    klp = genish.add(kv, z[1]);
    z[1] = genish.add(klp, kv);

    kv = genish.mul(genish.sub(klp, z[2]), kG);
    klp = genish.add(kv, z[2]);
    z[2] = genish.add(klp, kv);

    kv = genish.mul(genish.sub(klp, z[3]), kG);
    klp = genish.add(kv, z[3]);
    z[3] = genish.add(klp, kv);

    return klp;
  };

  Gibberish.genish.zd24 = (input, _Q, freq, isStereo = false) => {
    const leftInput = isStereo === true ? input[0] : input;
    const left = makeChannel(leftInput, _Q, freq);

    let out;
    if (isStereo === true) {
      const right = makeChannel(input[1], _Q, freq);
      out = [left, right];
    } else {
      out = left;
    }

    return out;
  };

  const Zd24 = inputProps => {
    const filter = Object.create(filterProto);
    const props = Object.assign({}, Zd24.defaults, filter.defaults, inputProps);
    let out;

    filter.__requiresRecompilation = ['input'];
    filter.__createGraph = function () {
      let isStereo = false;
      if (out === undefined) {
        isStereo = props.input !== undefined && props.input.isStereo !== undefined ? props.input.isStereo : false;
      } else {
        isStereo = out.input.isStereo;
        out.isStereo = isStereo;
      }

      filter.graph = Gibberish.genish.zd24(genish.in('input'), genish.in('Q'), genish.in('cutoff'), isStereo);
    };

    filter.__createGraph();

    out = Gibberish.factory(filter, filter.graph, ['filters', 'Filter24Moog'], props);

    return out;
  };

  Zd24.defaults = {
    input: 0,
    Q: .75,
    cutoff: .25
  };

  return Zd24;
};

},{"./filter.js":17,"genish.js":114}],21:[function(require,module,exports){
const g = require('genish.js'),
      filter = require('./filter.js');

module.exports = function (Gibberish) {
  Gibberish.genish.svf = (input, cutoff, Q, mode, isStereo = false, shouldConvertFreqQ = false) => {
    let d1 = g.data([0, 0], 1, { meta: true }),
        d2 = g.data([0, 0], 1, { meta: true }),
        peekProps = { mode: 'simple', interp: 'none' };

    if (shouldConvertFreqQ === true) {
      //Q = g.min( g.add(.01 , __Q), 1 ) 
      cutoff = g.mul(g.max(.005, g.min(cutoff, .995)), g.div(g.gen.samplerate, 4));
    }

    let f1 = g.memo(g.mul(2 * Math.PI, g.div(cutoff, g.gen.samplerate)));
    let oneOverQ = g.memo(g.div(1, Q));
    let l = g.memo(g.add(d2[0], g.mul(f1, d1[0]))),
        h = g.memo(g.sub(g.sub(isStereo ? input[0] : input, l), g.mul(Q, d1[0]))),
        b = g.memo(g.add(g.mul(f1, h), d1[0])),
        n = g.memo(g.add(h, l));

    d1[0] = b;
    d2[0] = l;

    let out = g.selector(mode, l, h, b, n);

    let returnValue;
    if (isStereo) {
      let d12 = g.data([0, 0], 1, { meta: true }),
          d22 = g.data([0, 0], 1, { meta: true });
      let l2 = g.memo(g.add(d22[0], g.mul(f1, d12[0]))),
          h2 = g.memo(g.sub(g.sub(input[1], l2), g.mul(Q, d12[0]))),
          b2 = g.memo(g.add(g.mul(f1, h2), d12[0])),
          n2 = g.memo(g.add(h2, l2));

      d12[0] = b2;
      d22[0] = l2;

      let out2 = g.selector(mode, l2, h2, b2, n2);

      returnValue = [out, out2];
    } else {
      returnValue = out;
    }

    return returnValue;
  };

  let SVF = inputProps => {
    const svf = Object.create(filter);
    const props = Object.assign({}, SVF.defaults, filter.defaults, inputProps);

    const isStereo = props.input.isStereo;

    // XXX NEEDS REFACTORING
    const __out = Gibberish.factory(svf,
    //Gibberish.genish.svf( g.in('input'), g.mul( g.in('cutoff'), g.gen.samplerate / 5 ), g.sub( 1, g.in('Q') ), g.in('mode'), isStereo ), 
    Gibberish.genish.svf(g.in('input'), g.mul(g.in('cutoff'), g.gen.samplerate / 5), g.sub(1, g.in('Q')), g.in('mode'), isStereo, true), ['filters', 'Filter12SVF'], props);

    return __out;
  };

  SVF.defaults = {
    input: 0,
    Q: .65,
    cutoff: .25,
    mode: 0
  };

  return SVF;
};

},{"./filter.js":17,"genish.js":114}],22:[function(require,module,exports){
let g = require('genish.js'),
    effect = require('./effect.js');

module.exports = function (Gibberish) {

  let BitCrusher = inputProps => {
    const props = Object.assign({ bitCrusherLength: 44100 }, BitCrusher.defaults, effect.defaults, inputProps),
          bitCrusher = Object.create(effect);

    let out;

    bitCrusher.__createGraph = function () {
      let isStereo = false;
      if (out === undefined) {
        isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false;
      } else {
        isStereo = out.input.isStereo;
        out.isStereo = isStereo;
      }

      let input = g.in('input'),
          inputGain = g.in('inputGain'),
          bitDepth = g.in('bitDepth'),
          sampleRate = g.in('sampleRate'),
          leftInput = isStereo ? input[0] : input,
          rightInput = isStereo ? input[1] : null;

      let storeL = g.history(0);
      let sampleReduxCounter = g.counter(sampleRate, 0, 1);

      let bitMult = g.pow(g.mul(bitDepth, 16), 2);
      let crushedL = g.div(g.floor(g.mul(g.mul(leftInput, inputGain), bitMult)), bitMult);

      let outL = g.switch(sampleReduxCounter.wrap, crushedL, storeL.out);

      if (isStereo) {
        let storeR = g.history(0);
        let crushedR = g.div(g.floor(g.mul(g.mul(rightInput, inputGain), bitMult)), bitMult);

        let outR = g.switch(sampleReduxCounter.wrap, crushedR, storeL.out);

        bitCrusher.graph = [outL, outR];
      } else {
        bitCrusher.graph = outL;
      }
    };

    bitCrusher.__createGraph();
    bitCrusher.__requiresRecompilation = ['input'];

    out = Gibberish.factory(bitCrusher, bitCrusher.graph, ['fx', 'bitCrusher'], props);
    return out;
  };

  BitCrusher.defaults = {
    input: 0,
    bitDepth: .5,
    sampleRate: .5
  };

  return BitCrusher;
};

},{"./effect.js":27,"genish.js":114}],23:[function(require,module,exports){
let g = require('genish.js'),
    effect = require('./effect.js');

module.exports = function (Gibberish) {
  let proto = Object.create(effect);

  let Shuffler = inputProps => {
    let bufferShuffler = Object.create(proto),
        bufferSize = 88200;

    const props = Object.assign({}, Shuffler.defaults, effect.defaults, inputProps);

    let out;
    bufferShuffler.__createGraph = function () {
      let isStereo = false;
      if (out === undefined) {
        isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : true;
      } else {
        isStereo = out.input.isStereo;
        //out.isStereo = isStereo
      }

      const phase = g.accum(1, 0, { shouldWrap: false });

      const input = g.in('input'),
            inputGain = g.in('inputGain'),
            __leftInput = isStereo ? input[0] : input,
            __rightInput = isStereo ? input[1] : null,
            leftInput = g.mul(__leftInput, inputGain),
            rightInput = g.mul(__rightInput, inputGain),
            rateOfShuffling = g.in('rate'),
            chanceOfShuffling = g.in('chance'),
            reverseChance = g.in('reverseChance'),
            repitchChance = g.in('repitchChance'),
            repitchMin = g.in('repitchMin'),
            repitchMax = g.in('repitchMax');

      let pitchMemory = g.history(1);

      let shouldShuffleCheck = g.eq(g.mod(phase, rateOfShuffling), 0);
      let isShuffling = g.memo(g.sah(g.lt(g.noise(), chanceOfShuffling), shouldShuffleCheck, 0));

      // if we are shuffling and on a repeat boundary...
      let shuffleChanged = g.memo(g.and(shouldShuffleCheck, isShuffling));
      let shouldReverse = g.lt(g.noise(), reverseChance),
          reverseMod = g.switch(shouldReverse, -1, 1);

      let pitch = g.ifelse(g.and(shuffleChanged, g.lt(g.noise(), repitchChance)), g.memo(g.mul(g.add(repitchMin, g.mul(g.sub(repitchMax, repitchMin), g.noise())), reverseMod)), reverseMod);

      // only switch pitches on repeat boundaries
      pitchMemory.in(g.switch(shuffleChanged, pitch, pitchMemory.out));

      let fadeLength = g.memo(g.div(rateOfShuffling, 100)),
          fadeIncr = g.memo(g.div(1, fadeLength));

      const bufferL = g.data(bufferSize);
      const bufferR = isStereo ? g.data(bufferSize) : null;
      let readPhase = g.accum(pitchMemory.out, 0, { shouldWrap: false });
      let stutter = g.wrap(g.sub(g.mod(readPhase, bufferSize), 22050), 0, bufferSize);

      let normalSample = g.peek(bufferL, g.accum(1, 0, { max: 88200 }), { mode: 'simple' });

      let stutterSamplePhase = g.switch(isShuffling, stutter, g.mod(readPhase, bufferSize));
      let stutterSample = g.memo(g.peek(bufferL, stutterSamplePhase, { mode: 'samples' }));

      let stutterShouldFadeIn = g.and(shuffleChanged, isShuffling);
      let stutterPhase = g.accum(1, shuffleChanged, { shouldWrap: false });

      let fadeInAmount = g.memo(g.div(stutterPhase, fadeLength));
      let fadeOutAmount = g.div(g.sub(rateOfShuffling, stutterPhase), g.sub(rateOfShuffling, fadeLength));

      let fadedStutter = g.ifelse(g.lt(stutterPhase, fadeLength), g.memo(g.mul(g.switch(g.lt(fadeInAmount, 1), fadeInAmount, 1), stutterSample)), g.gt(stutterPhase, g.sub(rateOfShuffling, fadeLength)), g.memo(g.mul(g.gtp(fadeOutAmount, 0), stutterSample)), stutterSample);

      let outputL = g.mix(normalSample, fadedStutter, isShuffling);

      let pokeL = g.poke(bufferL, leftInput, g.mod(g.add(phase, 44100), 88200));

      let panner = g.pan(outputL, outputL, g.in('pan'));

      bufferShuffler.graph = [panner.left, panner.right];
    };

    bufferShuffler.__createGraph();
    bufferShuffler.__requiresRecompilation = ['input'];

    out = Gibberish.factory(bufferShuffler, bufferShuffler.graph, ['fx', 'shuffler'], props);

    return out;
  };

  Shuffler.defaults = {
    input: 0,
    rate: 22050,
    chance: .25,
    reverseChance: .5,
    repitchChance: .5,
    repitchMin: .5,
    repitchMax: 2,
    pan: .5,
    mix: .5
  };

  return Shuffler;
};

},{"./effect.js":27,"genish.js":114}],24:[function(require,module,exports){
const g = require('genish.js'),
      effect = require('./effect.js');

module.exports = function (Gibberish) {

      let __Chorus = inputProps => {
            const props = Object.assign({}, __Chorus.defaults, effect.defaults, inputProps);
            let out;

            const chorus = Object.create(effect);

            chorus.__createGraph = function () {
                  const input = g.in('input'),
                        inputGain = g.in('inputGain'),
                        freq1 = g.in('slowFrequency'),
                        freq2 = g.in('fastFrequency'),
                        amp1 = g.in('slowGain'),
                        amp2 = g.in('fastGain');

                  let isStereo = false;
                  if (out === undefined) {
                        isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false;
                  } else {
                        isStereo = out.input.isStereo;
                        out.isStereo = isStereo;
                  }

                  const leftInput = isStereo ? g.mul(input[0], inputGain) : g.mul(input, inputGain);

                  const win0 = g.env('inversewelch', 1024),
                        win120 = g.env('inversewelch', 1024, 0, .333),
                        win240 = g.env('inversewelch', 1024, 0, .666);

                  const slowPhasor = g.phasor(freq1, 0, { min: 0 }),
                        slowPeek1 = g.mul(g.peek(win0, slowPhasor), amp1),
                        slowPeek2 = g.mul(g.peek(win120, slowPhasor), amp1),
                        slowPeek3 = g.mul(g.peek(win240, slowPhasor), amp1);

                  const fastPhasor = g.phasor(freq2, 0, { min: 0 }),
                        fastPeek1 = g.mul(g.peek(win0, fastPhasor), amp2),
                        fastPeek2 = g.mul(g.peek(win120, fastPhasor), amp2),
                        fastPeek3 = g.mul(g.peek(win240, fastPhasor), amp2);

                  let sampleRate = Gibberish.ctx.sampleRate;

                  const ms = sampleRate / 1000;
                  const maxDelayTime = 1000 * ms;

                  //console.log( 'sr:', sampleRate, 'ms:', ms, 'maxDelayTime:', maxDelayTime )

                  const time1 = g.mul(g.add(slowPeek1, fastPeek1, 5), ms),
                        time2 = g.mul(g.add(slowPeek2, fastPeek2, 5), ms),
                        time3 = g.mul(g.add(slowPeek3, fastPeek3, 5), ms);

                  const delay1L = g.delay(leftInput, time1, { size: maxDelayTime }),
                        delay2L = g.delay(leftInput, time2, { size: maxDelayTime }),
                        delay3L = g.delay(leftInput, time3, { size: maxDelayTime });

                  const leftOutput = g.add(delay1L, delay2L, delay3L);
                  if (isStereo) {
                        const rightInput = g.mul(input[1], inputGain);
                        const delay1R = g.delay(rightInput, time1, { size: maxDelayTime }),
                              delay2R = g.delay(rightInput, time2, { size: maxDelayTime }),
                              delay3R = g.delay(rightInput, time3, { size: maxDelayTime });

                        // flip a couple delay lines for stereo effect?
                        const rightOutput = g.add(delay1R, delay2L, delay3R);
                        chorus.graph = [g.add(delay1L, delay2R, delay3L), rightOutput];
                  } else {
                        chorus.graph = leftOutput;
                  }
            };

            chorus.__createGraph();
            chorus.__requiresRecompilation = ['input'];

            out = Gibberish.factory(chorus, chorus.graph, ['fx', 'chorus'], props);

            return out;
      };

      __Chorus.defaults = {
            input: 0,
            slowFrequency: .18,
            slowGain: 3,
            fastFrequency: 6,
            fastGain: 1,
            inputGain: 1
      };

      return __Chorus;
};

},{"./effect.js":27,"genish.js":114}],25:[function(require,module,exports){
let g = require('genish.js'),
    effect = require('./effect.js');

module.exports = function (Gibberish) {

  let Delay = inputProps => {
    let props = Object.assign({ delayLength: 88200 }, effect.defaults, Delay.defaults, inputProps),
        delay = Object.create(effect);

    let out;
    delay.__createGraph = function () {
      let isStereo = false;
      if (out === undefined) {
        isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false;
      } else {
        isStereo = out.input.isStereo;
        out.isStereo = isStereo;
      }

      const input = g.in('input'),
            inputGain = g.in('inputGain'),
            delayTime = g.in('time'),
            wetdry = g.in('wetdry'),
            leftInput = isStereo ? g.mul(input[0], inputGain) : g.mul(input, inputGain),
            rightInput = isStereo ? g.mul(input[1], inputGain) : null;

      const feedback = g.in('feedback');

      // left channel
      const feedbackHistoryL = g.history();
      const echoL = g.delay(g.add(leftInput, g.mul(feedbackHistoryL.out, feedback)), delayTime, { size: props.delayLength });
      feedbackHistoryL.in(echoL);
      const left = g.mix(leftInput, echoL, wetdry);

      if (isStereo) {
        // right channel
        const feedbackHistoryR = g.history();
        const echoR = g.delay(g.add(rightInput, g.mul(feedbackHistoryR.out, feedback)), delayTime, { size: props.delayLength });
        feedbackHistoryR.in(echoR);
        const right = g.mix(rightInput, echoR, wetdry);

        delay.graph = [left, right];
      } else {
        delay.graph = left;
      }
    };

    delay.__createGraph();
    delay.__requiresRecompilation = ['input'];

    out = Gibberish.factory(delay, delay.graph, ['fx', 'delay'], props);

    return out;
  };

  Delay.defaults = {
    input: 0,
    feedback: .5,
    time: 11025,
    wetdry: .5
  };

  return Delay;
};

},{"./effect.js":27,"genish.js":114}],26:[function(require,module,exports){
const g = require('genish.js'),
      effect = require('./effect.js');

const genish = g;

// taken from csound: http://manual.freeshell.org/csound5/distort1.html
/*

         exp(asig * (shape1 + pregain)) - exp(asig * (shape2 - pregain))
  aout = ---------------------------------------------------------------
         exp(asig * pregain)            + exp(-asig * pregain)

*/

module.exports = function (Gibberish) {

  let Distortion = inputProps => {
    let props = Object.assign({}, effect.defaults, Distortion.defaults, inputProps),
        distortion = Object.create(effect),
        out;

    distortion.__createGraph = function () {
      let isStereo = false;
      if (out === undefined) {
        isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false;
      } else {
        isStereo = out.input.isStereo;
        out.isStereo = isStereo;
      }

      const input = g.in('input'),
            inputGain = g.in('inputGain'),
            shape1 = g.in('shape1'),
            shape2 = g.in('shape2'),
            pregain = g.in('pregain'),
            postgain = g.in('postgain');

      let lout;
      {
        'use jsdsp';
        const linput = isStereo ? g.mul(input[0], inputGain) : g.mul(input, inputGain);
        const ltop = genish.sub(g.exp(genish.mul(linput, genish.add(shape1, pregain))), g.exp(genish.mul(linput, genish.sub(shape2, pregain))));
        const lbottom = genish.add(g.exp(genish.mul(linput, pregain)), g.exp(genish.mul(genish.mul(-1, linput), pregain)));
        lout = genish.mul(genish.div(ltop, lbottom), postgain);
      }

      if (isStereo) {
        let rout;
        {
          'use jsdsp';
          const rinput = isStereo ? g.mul(input[1], inputGain) : g.mul(input, inputGain);
          const rtop = genish.sub(g.exp(genish.mul(rinput, genish.add(shape1, pregain))), g.exp(genish.mul(rinput, genish.sub(shape2, pregain))));
          const rbottom = genish.add(g.exp(genish.mul(rinput, pregain)), g.exp(genish.mul(genish.mul(-1, rinput), pregain)));
          rout = genish.mul(genish.div(rtop, rbottom), postgain);
        }

        distortion.graph = [lout, rout];
      } else {
        distortion.graph = lout;
      }
    };

    distortion.__createGraph();
    distortion.__requiresRecompilation = ['input'];

    out = Gibberish.factory(distortion, distortion.graph, ['fx', 'distortion'], props);
    return out;
  };

  Distortion.defaults = {
    input: 0,
    shape1: .1,
    shape2: .1,
    pregain: 5,
    postgain: .5
  };

  return Distortion;
};

},{"./effect.js":27,"genish.js":114}],27:[function(require,module,exports){
let ugen = require('../ugen.js')();

let effect = Object.create(ugen);

Object.assign(effect, {
  defaults: { bypass: false, inputGain: 1 },
  type: 'effect'
});

module.exports = effect;

},{"../ugen.js":69}],28:[function(require,module,exports){
module.exports = function (Gibberish) {

  const effects = {
    Freeverb: require('./freeverb.js')(Gibberish),
    //Plate       : require( './dattorro.dsp.js' )( Gibberish ),
    Flanger: require('./flanger.js')(Gibberish),
    Vibrato: require('./vibrato.js')(Gibberish),
    Delay: require('./delay.js')(Gibberish),
    BitCrusher: require('./bitCrusher.js')(Gibberish),
    Distortion: require('./distortion.dsp.js')(Gibberish),
    RingMod: require('./ringMod.js')(Gibberish),
    Tremolo: require('./tremolo.js')(Gibberish),
    Chorus: require('./chorus.js')(Gibberish),
    Wavefolder: require('./wavefolder.dsp.js')(Gibberish)[0],
    Shuffler: require('./bufferShuffler.js')(Gibberish)
    //Gate        : require( './gate.js'      )( Gibberish ),
  };

  effects.export = target => {
    for (let key in effects) {
      if (key !== 'export') {
        target[key] = effects[key];
      }
    }
  };

  return effects;
};

},{"./bitCrusher.js":22,"./bufferShuffler.js":23,"./chorus.js":24,"./delay.js":25,"./distortion.dsp.js":26,"./flanger.js":29,"./freeverb.js":30,"./ringMod.js":31,"./tremolo.js":32,"./vibrato.js":33,"./wavefolder.dsp.js":34}],29:[function(require,module,exports){
let g = require('genish.js'),
    proto = require('./effect.js');

module.exports = function (Gibberish) {

  let Flanger = inputProps => {
    let props = Object.assign({ delayLength: 44100 }, Flanger.defaults, proto.defaults, inputProps),
        flanger = Object.create(proto),
        out;

    flanger.__createGraph = function () {
      let isStereo = false;
      if (out === undefined) {
        isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false;
      } else {
        isStereo = out.input.isStereo;
        out.isStereo = isStereo;
      }

      const input = g.in('input'),
            inputGain = g.in('inputGain'),
            delayLength = props.delayLength,
            feedbackCoeff = g.in('feedback'),
            modAmount = g.in('offset'),
            frequency = g.in('frequency'),
            delayBufferL = g.data(delayLength);

      const writeIdx = g.accum(1, 0, { min: 0, max: delayLength, interp: 'none', mode: 'samples' });

      const offset = g.mul(modAmount, 500);

      const mod = props.mod === undefined ? g.cycle(frequency) : props.mod;

      const readIdx = g.wrap(g.add(g.sub(writeIdx, offset), mod //g.mul( mod, g.sub( offset, 1 ) ) 
      ), 0, delayLength);

      const leftInput = isStereo ? input[0] : input;

      const delayedOutL = g.peek(delayBufferL, readIdx, { interp: 'linear', mode: 'samples' });

      g.poke(delayBufferL, g.add(leftInput, g.mul(delayedOutL, feedbackCoeff)), writeIdx);

      const left = g.add(leftInput, delayedOutL);

      if (isStereo === true) {
        const rightInput = input[1];
        const delayBufferR = g.data(delayLength);

        let delayedOutR = g.peek(delayBufferR, readIdx, { interp: 'linear', mode: 'samples' });

        g.poke(delayBufferR, g.add(rightInput, g.mul(delayedOutR, feedbackCoeff)), writeIdx);
        const right = g.add(rightInput, delayedOutR);

        flanger.graph = [left, right];
      } else {
        flanger.graph = left;
      }
    };

    flanger.__createGraph();
    flanger.__requiresRecompilation = ['input'];

    out = Gibberish.factory(flanger, flanger.graph, ['fx', 'flanger'], props);

    return out;
  };

  Flanger.defaults = {
    input: 0,
    feedback: .81,
    offset: .125,
    frequency: 1
  };

  return Flanger;
};

},{"./effect.js":27,"genish.js":114}],30:[function(require,module,exports){
const g = require('genish.js'),
      effect = require('./effect.js');

module.exports = function (Gibberish) {

  const allPass = Gibberish.filters.genish.AllPass;
  const combFilter = Gibberish.filters.genish.Comb;

  const tuning = {
    combCount: 8,
    combTuning: [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617],
    allPassCount: 4,
    allPassTuning: [225, 556, 441, 341],
    allPassFeedback: 0.5,
    fixedGain: 0.015,
    scaleDamping: 0.4,
    scaleRoom: 0.28,
    offsetRoom: 0.7,
    stereoSpread: 23
  };

  const Freeverb = inputProps => {
    const props = Object.assign({}, effect.defaults, Freeverb.defaults, inputProps),
          reverb = Object.create(effect);

    let out;
    reverb.__createGraph = function () {
      let isStereo = false;
      if (out === undefined) {
        isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false;
      } else {
        isStereo = out.input.isStereo;
      }

      const combsL = [],
            combsR = [];

      const input = g.in('input'),
            inputGain = g.in('inputGain'),
            wet1 = g.in('wet1'),
            wet2 = g.in('wet2'),
            dry = g.in('dry'),
            roomSize = g.in('roomSize'),
            damping = g.in('damping');

      const __summedInput = isStereo === true ? g.add(input[0], input[1]) : input,
            summedInput = g.mul(__summedInput, inputGain),
            attenuatedInput = g.memo(g.mul(summedInput, tuning.fixedGain));

      // create comb filters in parallel...
      for (let i = 0; i < 8; i++) {
        combsL.push(combFilter(attenuatedInput, tuning.combTuning[i], g.mul(damping, .4), g.mul(tuning.scaleRoom + tuning.offsetRoom, roomSize)));
        combsR.push(combFilter(attenuatedInput, tuning.combTuning[i] + tuning.stereoSpread, g.mul(damping, .4), g.mul(tuning.scaleRoom + tuning.offsetRoom, roomSize)));
      }

      // ... and sum them with attenuated input, use of let is deliberate here
      let outL = g.add(attenuatedInput, ...combsL);
      let outR = g.add(attenuatedInput, ...combsR);

      // run through allpass filters in series
      for (let i = 0; i < 4; i++) {
        outL = allPass(outL, tuning.allPassTuning[i] + tuning.stereoSpread);
        outR = allPass(outR, tuning.allPassTuning[i] + tuning.stereoSpread);
      }

      const outputL = g.add(g.mul(outL, wet1), g.mul(outR, wet2), g.mul(isStereo === true ? input[0] : input, dry)),
            outputR = g.add(g.mul(outR, wet1), g.mul(outL, wet2), g.mul(isStereo === true ? input[1] : input, dry));

      reverb.graph = [outputL, outputR];
    };

    reverb.__createGraph();
    reverb.__requiresRecompilation = ['input'];

    out = Gibberish.factory(reverb, reverb.graph, ['fx', 'freeverb'], props);

    return out;
  };

  Freeverb.defaults = {
    input: 0,
    wet1: 1,
    wet2: 0,
    dry: .5,
    roomSize: .925,
    damping: .5
  };

  return Freeverb;
};

},{"./effect.js":27,"genish.js":114}],31:[function(require,module,exports){
let g = require('genish.js'),
    effect = require('./effect.js');

module.exports = function (Gibberish) {

  let RingMod = inputProps => {
    let props = Object.assign({}, RingMod.defaults, effect.defaults, inputProps),
        ringMod = Object.create(effect),
        out;

    ringMod.__createGraph = function () {
      let isStereo = false;
      if (out === undefined) {
        isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false;
      } else {
        isStereo = out.input.isStereo;
        out.isStereo = isStereo;
      }

      const input = g.in('input'),
            inputGain = g.in('inputGain'),
            frequency = g.in('frequency'),
            gain = g.in('gain'),
            mix = g.in('mix');

      const leftInput = isStereo ? g.mul(input[0], inputGain) : g.mul(input, inputGain),
            sine = g.mul(g.cycle(frequency), gain);

      const left = g.add(g.mul(leftInput, g.sub(1, mix)), g.mul(g.mul(leftInput, sine), mix));

      if (isStereo === true) {
        const rightInput = g.mul(input[1], inputGain),
              right = g.add(g.mul(rightInput, g.sub(1, mix)), g.mul(g.mul(rightInput, sine), mix));

        ringMod.graph = [left, right];
      } else {
        ringMod.graph = left;
      }
    };

    ringMod.__createGraph();
    ringMod.__requiresRecompilation = ['input'];

    out = Gibberish.factory(ringMod, ringMod.graph, ['fx', 'ringMod'], props);

    return out;
  };

  RingMod.defaults = {
    input: 0,
    frequency: 220,
    gain: 1,
    mix: 1
  };

  return RingMod;
};

},{"./effect.js":27,"genish.js":114}],32:[function(require,module,exports){
const g = require('genish.js'),
      effect = require('./effect.js');

module.exports = function (Gibberish) {

  const Tremolo = inputProps => {
    const props = Object.assign({}, Tremolo.defaults, effect.defaults, inputProps),
          tremolo = Object.create(effect);

    let out;
    tremolo.__createGraph = function () {
      let isStereo = false;
      if (out === undefined) {
        isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false;
      } else {
        isStereo = out.input.isStereo;
        out.isStereo = isStereo;
      }

      const input = g.in('input'),
            inputGain = g.in('inputGain'),
            frequency = g.in('frequency'),
            amount = g.in('amount');

      const leftInput = isStereo ? g.mul(input[0], inputGain) : g.mul(input, inputGain);

      let osc;
      if (props.shape === 'square') {
        osc = g.gt(g.phasor(frequency), 0);
      } else if (props.shape === 'saw') {
        osc = g.gtp(g.phasor(frequency), 0);
      } else {
        osc = g.cycle(frequency);
      }

      const mod = g.mul(osc, amount);

      const left = g.sub(leftInput, g.mul(leftInput, mod));

      if (isStereo === true) {
        const rightInput = g.mul(input[1], inputGain),
              right = g.mul(rightInput, mod);

        tremolo.graph = [left, right];
      } else {
        tremolo.graph = left;
      }
    };

    tremolo.__createGraph();
    tremolo.__requiresRecompilation = ['input'];

    out = Gibberish.factory(tremolo, tremolo.graph, ['fx', 'tremolo'], props);
    return out;
  };

  Tremolo.defaults = {
    input: 0,
    frequency: 2,
    amount: 1,
    shape: 'sine'
  };

  return Tremolo;
};

},{"./effect.js":27,"genish.js":114}],33:[function(require,module,exports){
const g = require('genish.js'),
      effect = require('./effect.js');

module.exports = function (Gibberish) {

  const Vibrato = inputProps => {
    const props = Object.assign({}, Vibrato.defaults, effect.defaults, inputProps),
          vibrato = Object.create(effect);

    let out;
    vibrato.__createGraph = function () {
      let isStereo = false;
      if (out === undefined) {
        isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false;
      } else {
        isStereo = out.input.isStereo;
        out.isStereo = isStereo;
      }

      const input = g.in('input'),
            inputGain = g.in('inputGain'),
            delayLength = 44100,
            feedbackCoeff = g.in('feedback'),
            modAmount = g.in('amount'),
            frequency = g.in('frequency'),
            delayBufferL = g.data(delayLength);

      const writeIdx = g.accum(1, 0, { min: 0, max: delayLength, interp: 'none', mode: 'samples' });

      const offset = g.mul(modAmount, 500);

      const readIdx = g.wrap(g.add(g.sub(writeIdx, offset), g.mul(g.cycle(frequency), g.sub(offset, 1))), 0, delayLength);

      const leftInput = isStereo ? g.mul(input[0], inputGain) : g.mul(input, inputGain);

      const delayedOutL = g.peek(delayBufferL, readIdx, { interp: 'linear', mode: 'samples' });

      g.poke(delayBufferL, g.add(leftInput, g.mul(delayedOutL, feedbackCoeff)), writeIdx);

      const left = delayedOutL;

      if (isStereo === true) {
        const rightInput = g.mul(input[1], inputGain);
        const delayBufferR = g.data(delayLength);

        const delayedOutR = g.peek(delayBufferR, readIdx, { interp: 'linear', mode: 'samples' });

        g.poke(delayBufferR, g.add(rightInput, mul(delayedOutR, feedbackCoeff)), writeIdx);
        const right = delayedOutR;

        vibrato.graph = [left, right];
      } else {
        vibrato.graph = left;
      }
    };

    vibrato.__createGraph();
    vibrato.__requiresRecompilation = ['input'];

    out = Gibberish.factory(vibrato, vibrato.graph, ['fx', 'vibrato'], props);
    return out;
  };

  Vibrato.defaults = {
    input: 0,
    feedback: .01,
    amount: .5,
    frequency: 4
  };

  return Vibrato;
};

},{"./effect.js":27,"genish.js":114}],34:[function(require,module,exports){
const g = require('genish.js'),
      effect = require('./effect.js');

const genish = g;

const RL = 7.5e3,
      R = 15e3,
      VT = 26e-3,
      Is = 10e-16,
      a = 2 * RL / R,
      b = (R + 2 * RL) / (VT * R),
      d = RL * Is / VT;

// Antialiasing error threshold
const thresh = 10e-10;

const wavestage = in1 => {
  const body = `  const thresh = 10e-10;

  let w = Ln1;
  let expw, p, r, s;

  const e = Math.E
  const pow = Math.pow
  const abs = Math.abs
  for(let i=0; i<1000; i++) {
    expw = pow(e,w);

    p = w*expw - x;
    r = (w+1)*expw;
    s = (w+2)/(2*(w+1));        
    err = (p/(r-(p*s)));

    if (abs(err)<thresh) {
      break;
    }

    w = w - err;
  }

  return w;`;

  const Lambert_W = g.process('x', 'Ln1', body);

  const Ln1 = g.history(0),
        Fn1 = g.history(0),
        xn1 = g.history(0);

  {
    'use jsdsp';
    // Compute Antiderivative
    const l = g.sign(in1);
    let u = genish.mul(d, g.pow(Math.E, genish.mul(genish.mul(l, b), in1)));
    let Ln = Lambert_W.call(u, Ln1.out);
    const Fn = genish.sub(genish.mul(genish.div(genish.mul(0.5, VT), b), genish.mul(Ln, genish.add(Ln, 2))), genish.mul(genish.mul(genish.mul(0.5, a), in1), in1));

    let xn = genish.mul(0.5, genish.add(in1, xn1.out));
    u = genish.mul(d, g.pow(Math.E, genish.mul(genish.mul(l, b), xn)));
    Ln = Lambert_W.call(u, Ln1.out);

    //out1 = ;
    // Check for ill-conditioning
    const out1 = g.ifelse(g.lt(g.abs(genish.sub(in1, xn1.out)), thresh), genish.sub(genish.mul(genish.mul(l, VT), Ln), genish.mul(a, xn)), genish.div(genish.sub(Fn, Fn1.out), genish.sub(in1, xn1.out)));

    // Update States
    Ln1.in(Ln);
    Fn1.in(Fn);
    xn1.in(in1);

    return out1;
  }
};

module.exports = function (Gibberish) {

  const Wavefolder = inputProps => {

    let props = Object.assign({}, effect.defaults, Wavefolder.defaults, inputProps),
        wavefolder = Object.create(effect),
        out;

    wavefolder.__createGraph = function () {
      let isStereo = false;
      if (out === undefined) {
        isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false;
      } else {
        isStereo = out.input.isStereo;
        out.isStereo = isStereo;
      }

      const input = g.in('input'),
            gain = g.in('gain'),
            postgain = g.in('postgain');

      let lout;
      {
        'use jsdsp';

        const linput = isStereo ? genish.mul(input[0], gain) : genish.mul(input, gain);
        lout = genish.mul(linput, .333);
        lout = wavestage(wavestage(wavestage(wavestage(lout))));
        lout = genish.mul(lout, .6);
        lout = genish.mul(g.tanh(lout), postgain);
      }

      wavefolder.graph = lout;

      if (isStereo) {
        let rout;
        {
          'use jsdsp';
          const rinput = isStereo ? genish.mul(input[1], gain) : genish.mul(input, gain);
          rout = genish.mul(rinput, .333);
          rout = wavestage(wavestage(wavestage(wavestage(rout))));
          rout = genish.mul(rout, .6);
          rout = genish.mul(g.tanh(rout), postgain);
        }

        wavefolder.graph = [lout, rout];
      }
    };

    wavefolder.__createGraph();
    wavefolder.__requiresRecompilation = ['input'];

    out = Gibberish.factory(wavefolder, wavefolder.graph, ['fx', 'wavefolder'], props);

    return out;
  };

  Wavefolder.defaults = {
    input: 0,
    gain: 2,
    postgain: 1
  };

  return [Wavefolder, wavestage];
};

},{"./effect.js":27,"genish.js":114}],35:[function(require,module,exports){
let MemoryHelper = require('memory-helper'),
    genish = require('genish.js');

let Gibberish = {
  blockCallbacks: [], // called every block
  dirtyUgens: [],
  callbackUgens: [],
  callbackNames: [],
  analyzers: [],
  graphIsDirty: false,
  ugens: {},
  debug: false,
  id: -1,
  preventProxy: false,
  proxyEnabled: true,

  output: null,

  memory: null, // 20 minutes by default?
  factory: null,
  genish,
  scheduler: require('./scheduling/scheduler.js'),
  //workletProcessorLoader: require( './workletProcessor.js' ),
  workletProcessor: null,

  memoed: {},
  mode: 'scriptProcessor',

  prototypes: {
    ugen: null, //require('./ugen.js'),
    instrument: require('./instruments/instrument.js'),
    effect: require('./fx/effect.js'),
    analyzer: require('./analysis/analyzer.js')
  },

  mixins: {
    polyinstrument: require('./instruments/polyMixin.js')
  },

  workletPath: './gibberish_worklet.js',

  init(memAmount, ctx, mode = 'worklet') {
    let numBytes = isNaN(memAmount) ? 20 * 60 * 44100 : memAmount;

    // regardless of whether or not gibberish is using worklets,
    // we still want genish to output vanilla js functions instead
    // of audio worklet classes; these functions will be called
    // from within the gibberish audioworklet processor node.
    this.genish.gen.mode = 'scriptProcessor';

    this.memory = MemoryHelper.create(numBytes, Float64Array);

    this.mode = mode;

    const startup = this.utilities.createWorklet;

    this.scheduler.init(this);

    this.analyzers.dirty = false;

    if (this.mode === 'worklet') {

      const p = new Promise((resolve, reject) => {

        const pp = new Promise((__resolve, __reject) => {
          this.utilities.createContext(ctx, startup.bind(this.utilities), __resolve);
        }).then(() => {
          Gibberish.preventProxy = true;
          Gibberish.load();
          Gibberish.preventProxy = false;
          Gibberish.output = this.Bus2();

          // Gibberish.output needs to be assign so that ugens can
          // connect to it by default. There's no other way to assign it
          // outside of evaling code at this point.
          Gibberish.worklet.port.postMessage({
            address: 'eval',
            code: `Gibberish.output = this.ugens.get(${Gibberish.output.id});`
          });

          resolve();
        });
      });

      return p;
    } else if (this.mode === 'processor') {
      Gibberish.load();
    }
  },

  load() {
    this.factory = require('./factory.js')(this);

    this.Panner = require('./misc/panner.js')(this);
    this.PolyTemplate = require('./instruments/polytemplate.js')(this);
    this.oscillators = require('./oscillators/oscillators.js')(this);
    this.filters = require('./filters/filters.js')(this);
    this.binops = require('./misc/binops.js')(this);
    this.monops = require('./misc/monops.js')(this);
    this.Bus = require('./misc/bus.js')(this);
    this.Bus2 = require('./misc/bus2.js')(this);
    this.instruments = require('./instruments/instruments.js')(this);
    this.fx = require('./fx/effects.js')(this);
    this.Sequencer = require('./scheduling/sequencer.js')(this);
    this.Sequencer2 = require('./scheduling/seq2.js')(this);
    this.Tidal = require('./scheduling/tidal.js')(this);
    this.envelopes = require('./envelopes/envelopes.js')(this);
    this.analysis = require('./analysis/analyzers.js')(this);
    this.time = require('./misc/time.js')(this);
    this.Proxy = require('./workletProxy.js')(this);
  },

  export(target, shouldExportGenish = false) {
    if (target === undefined) throw Error('You must define a target object for Gibberish to export variables to.');

    if (shouldExportGenish) this.genish.export(target);

    this.instruments.export(target);
    this.fx.export(target);
    this.filters.export(target);
    this.oscillators.export(target);
    this.binops.export(target);
    this.monops.export(target);
    this.envelopes.export(target);
    this.analysis.export(target);
    target.Sequencer = this.Sequencer;
    target.Sequencer2 = this.Sequencer2;
    target.Bus = this.Bus;
    target.Bus2 = this.Bus2;
    target.Scheduler = this.scheduler;
    target.Tidal = this.Tidal;
    this.time.export(target);
    this.utilities.export(target);
  },

  printcb() {
    Gibberish.worklet.port.postMessage({ address: 'callback' });
  },
  printobj(obj) {
    Gibberish.worklet.port.postMessage({ address: 'print', object: obj.id });
  },
  send(msg) {
    Gibberish.worklet.port.postMessage(msg);
  },

  dirty(ugen) {
    if (ugen === this.analyzers) {
      this.graphIsDirty = true;
      this.analyzers.dirty = true;
    } else {
      this.dirtyUgens.push(ugen);
      this.graphIsDirty = true;
      if (this.memoed[ugen.ugenName]) {
        delete this.memoed[ugen.ugenName];
      }
    }
  },

  clear() {
    // do not delete the gain and the pan of the master bus 
    this.output.inputs.splice(0, this.output.inputs.length - 2);
    //this.output.inputNames.length = 0
    this.analyzers.length = 0;
    this.scheduler.clear();
    this.dirty(this.output);
    if (this.mode === 'worklet') {
      this.worklet.port.postMessage({
        address: 'method',
        object: this.id,
        name: 'clear',
        args: []
      });
    }
    // clear memory... XXX should this be a MemoryHelper function?
    //this.memory.heap.fill(0)
    //this.memory.list = {}

    Gibberish.genish.gen.removeAllListeners('memory init');
    Gibberish.genish.gen.histories.clear();

    //Gibberish.output = this.Bus2()
  },

  // used to sort analysis ugens by priority.
  // higher priorities mean lower ordering in the array,
  // which means they will run first in the callback function.
  // by defult, analysis ugens are assigned a priority of 0 in the
  // analysis prototype.
  analysisCompare(a, b) {
    return (isNaN(b.priority) ? 0 : b.priority) - (isNaN(a.priority) ? 0 : a.priority);
  },

  generateCallback() {
    if (this.mode === 'worklet') {
      Gibberish.callback = function () {
        return 0;
      };
      Gibberish.callback.out = [];
      return Gibberish.callback;
    }
    let uid = 0,
        callbackBody,
        lastLine,
        analysis = '';

    this.memoed = {};

    callbackBody = this.processGraph(this.output);
    lastLine = callbackBody[callbackBody.length - 1];
    callbackBody.unshift("\t'use strict'");

    this.analyzers.sort(this.analysisCompare).forEach(v => {
      const analysisBlock = Gibberish.processUgen(v);
      //if( Gibberish.mode === 'processor' ) {
      //  console.log( 'analysis:', analysisBlock, v  )
      //}
      let analysisLine;

      if (typeof analysisBlock === 'object') {
        analysisLine = analysisBlock.pop();

        analysisBlock.forEach(v => {
          callbackBody.splice(callbackBody.length - 1, 0, v);
        });
      } else {
        analysisLine = analysisBlock;
      }

      callbackBody.push(analysisLine);
    });

    this.analyzers.forEach(v => {
      if (this.callbackUgens.indexOf(v.callback) === -1) this.callbackUgens.push(v.callback);
    });

    this.callbackNames = this.callbackUgens.map(v => v.ugenName);

    callbackBody.push('\n\treturn ' + lastLine.split('=')[0].split(' ')[1]);

    if (this.debug === true) console.log('callback:\n', callbackBody.join('\n'));

    this.callbackNames.push('mem');
    this.callbackUgens.push(this.memory.heap);
    this.callback = Function(...this.callbackNames, callbackBody.join('\n')); //.bind( null, ...this.callbackUgens )
    this.callback.out = [];

    if (this.oncallback) this.oncallback(this.callback);

    return this.callback;
  },

  processGraph(output) {
    this.callbackUgens.length = 0;
    this.callbackNames.length = 0;

    this.callbackUgens.push(output.callback);

    let body = this.processUgen(output);

    this.dirtyUgens.length = 0;
    this.graphIsDirty = false;

    return body;
  },
  proxyReplace(obj) {
    if (typeof obj === 'object' && obj !== null) {
      if (obj.id !== undefined) {
        const __obj = Gibberish.processor.ugens.get(obj.id);
        //console.log( 'retrieved:', __obj.name )

        //if( obj.prop !== undefined ) console.log( 'got a ssd.out', obj )
        return obj.prop !== undefined ? __obj[obj.prop] : __obj;
      } else if (obj.isFunc === true) {
        let func = eval('(' + obj.value + ')');

        //console.log( 'replacing function:', func )

        return func;
      }
    }

    return obj;
  },

  processUgen(ugen, block) {
    if (block === undefined) block = [];
    if (ugen === undefined) return block;

    let dirtyIdx = Gibberish.dirtyUgens.indexOf(ugen);

    let memo = Gibberish.memoed[ugen.ugenName];

    if (memo !== undefined) {
      return memo;
    } else if (ugen === true || ugen === false) {
      throw "Why is ugen a boolean? [true] or [false]";
    } else if (ugen.block === undefined || dirtyIndex !== -1) {
      // weird edge case with analysis (follow) ugen
      if (ugen.id === undefined) {
        ugen.id = ugen.__properties__.overrideid;
      }

      let line = `\tconst v_${ugen.id} = `;
      if (!ugen.isop) line += `${ugen.ugenName}( `;

      // must get array so we can keep track of length for comma insertion
      const keys = ugen.isop === true || ugen.type === 'bus' ? Object.keys(ugen.inputs) : [...ugen.inputNames];

      line = ugen.isop === true ? Gibberish.__processBinop(ugen, line, block, keys) : Gibberish.__processNonBinop(ugen, line, block, keys);

      line = Gibberish.__addLineEnding(line, ugen, keys);

      block.push(line);

      Gibberish.memoed[ugen.ugenName] = `v_${ugen.id}`;

      if (dirtyIdx !== -1) {
        Gibberish.dirtyUgens.splice(dirtyIdx, 1);
      }
    } else if (ugen.block) {
      return ugen.block;
    }

    return block;
  },

  __processBinop(ugen, line, block, keys) {
    //__getInputString( line, input, block, key, ugen ) {
    const isLeftStereo = Gibberish.__isStereo(ugen.inputs[0]),
          isRightStereo = Gibberish.__isStereo(ugen.inputs[1]),
          left = Gibberish.__getInputString(line, ugen.inputs[0], block, '0', keys),
          right = Gibberish.__getInputString(line, ugen.inputs[1], block, '1', keys),
          op = ugen.op;

    let graph, out;

    if (isLeftStereo === true && isRightStereo === false) {
      line += `[ ${left}[0] ${op} ${right}, ${left}[1] ${op} ${right} ]`;
      //graph = [ g.add( args[0].graph[0], args[1] ), g.add( args[0].graph[1], args[1] )]
    } else if (isLeftStereo === false && isRightStereo === true) {
      //graph = [ g.add( args[0], args[1].graph[0] ), g.add( args[0], args[1].graph[1] )]
      line += `[ ${left} ${op} ${right}[0], ${left} ${op} ${right}[1] ]`;
    } else if (isLeftStereo === true && isRightStereo === true) {
      //graph = [ g.add( args[0].graph[0], args[1].graph[0] ), g.add( args[0].graph[1], args[1].graph[1] )]
      line += `[ ${left}[0] ${op} ${right}[0], ${left}[1] ${op} ${right}[1] ]`;
    } else {
      // XXX important, must re-assign when calling processNonBinop
      line = Gibberish.__processNonBinop(ugen, line, block, keys);
    }

    return line;
  },

  __processNonBinop(ugen, line, block, keys) {
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      // binop.inputs is actual values, not just property names
      let input;
      if (ugen.isop || ugen.type === 'bus') {
        input = ugen.inputs[key];
      } else {
        input = ugen[key];
      }

      if (input !== undefined) {
        input = Gibberish.__getBypassedInput(input);
        line += Gibberish.__getInputString(line, input, block, key, ugen);
        line = Gibberish.__addSeparator(line, input, ugen, i < keys.length - 1);
      }
    }

    return line;
  },

  // determine if a ugen is stereo
  __isStereo(ugen) {
    let isStereo = false;

    if (ugen === undefined || ugen === null) return false;

    if (ugen.isStereo === true) return true;

    if (ugen.isop === true) {
      return Gibberish.__isStereo(ugen.inputs[0]) || Gibberish.__isStereo(ugen.inputs[1]);
    }

    return isStereo;
  },

  // if an effect is bypassed, get next one in chain (or output destination)
  __getBypassedInput(input) {
    if (input.bypass === true) {
      // loop through inputs of chain until one is found
      // that is not being bypassed

      let found = false;

      while (input.input !== 'undefined' && found === false) {
        if (typeof input.input.bypass !== 'undefined') {
          input = input.input;
          if (input.bypass === false) found = true;
        } else {
          input = input.input;
          found = true;
        }
      }
    }

    return input;
  },

  // get a string representing a ugen for insertion into callback.
  // if a ugen contains other ugens, trigger codegen for those ugens as well.
  __getInputString(line, input, block, key, ugen) {
    let value = '';
    if (typeof input === 'number') {
      if (isNaN(key)) {
        value += `mem[${ugen.__addresses__[key]}]`; //input
      } else {
        value += input;
      }
    } else if (typeof input === 'boolean') {
      value += '' + input;
    } else {
      //console.log( 'key:', key, 'input:', ugen.inputs, ugen.inputs[ key ] ) 
      // XXX not sure why this has to be here, but somehow non-processed objects
      // that only contain id numbers are being passed here...

      if (input !== undefined) {
        if (Gibberish.mode === 'processor') {
          if (input.ugenName === undefined && input.id !== undefined) {
            if (ugen === undefined) {
              input = Gibberish.processor.ugens.get(input.id);
            } else {
              if (ugen.type !== 'seq') {
                input = Gibberish.processor.ugens.get(input.id);
              }
            }
          }
        }

        Gibberish.processUgen(input, block);

        if (!input.isop) {
          // check is needed so that graphs with ssds that refer to themselves
          // don't add the ssd in more than once
          if (Gibberish.callbackUgens.indexOf(input.callback) === -1) {
            Gibberish.callbackUgens.push(input.callback);
          }
        }

        value += `v_${input.id}`;
        input.__varname = value;
      }
    }

    return value;
  },

  // add separators for function calls and handle binops (mono only)
  __addSeparator(line, input, ugen, isNotEndOfLine) {
    if (isNotEndOfLine === true) {
      if (ugen.isop === true) {
        if (ugen.op === '*' || ugen.op === '/') {
          if (input !== 1) {
            line += ' ' + ugen.op + ' ';
          } else {
            line = line.slice(0, -1 * ('' + input).length);
          }
        } else {
          line += ' ' + ugen.op + ' ';
        }
      } else {
        line += ', ';
      }
    }

    return line;
  },

  // add memory to end of function calls and close parenthesis 
  __addLineEnding(line, ugen, keys) {
    if (ugen.type === 'bus' && keys.length > 0) line += ', ';
    if (!ugen.isop && ugen.type !== 'seq') line += 'mem';
    line += ugen.isop ? '' : ' )';

    return line;
  }

};

Gibberish.prototypes.Ugen = Gibberish.prototypes.ugen = require('./ugen.js')(Gibberish);
Gibberish.utilities = require('./utilities.js')(Gibberish);

module.exports = Gibberish;

},{"./analysis/analyzer.js":1,"./analysis/analyzers.js":2,"./envelopes/envelopes.js":7,"./factory.js":12,"./filters/filters.js":19,"./fx/effect.js":27,"./fx/effects.js":28,"./instruments/instrument.js":42,"./instruments/instruments.js":43,"./instruments/polyMixin.js":47,"./instruments/polytemplate.js":48,"./misc/binops.js":53,"./misc/bus.js":54,"./misc/bus2.js":55,"./misc/monops.js":56,"./misc/panner.js":57,"./misc/time.js":58,"./oscillators/oscillators.js":61,"./scheduling/scheduler.js":65,"./scheduling/seq2.js":66,"./scheduling/sequencer.js":67,"./scheduling/tidal.js":68,"./ugen.js":69,"./utilities.js":70,"./workletProxy.js":71,"genish.js":114,"memory-helper":153}],36:[function(require,module,exports){
const g = require('genish.js'),
      instrument = require('./instrument.js');

const genish = g;

module.exports = function (Gibberish) {

  const Clap = argumentProps => {
    'use jsdsp';

    const clap = Object.create(instrument),
          decay = g.in('decay'),
          // 0-1 input value
    scaledDecay = genish.mul(decay, genish.mul(g.gen.samplerate, 2)),
          gain = g.in('gain'),
          spacing = g.in('spacing'),
          // spacing between clap, in Hzs
    loudness = g.in('loudness'),
          triggerLoudness = g.in('__triggerLoudness'),
          cutoff = g.in('cutoff'),
          Q = g.in('Q');

    const props = Object.assign({}, Clap.defaults, argumentProps);

    const eg = g.decay(scaledDecay, { initValue: 0 }),
          check = g.gt(eg, .0005),
          noise = genish.add(-1, genish.mul(g.noise(), 2)),
          rnd = noise,
          //g.gtp( noise, 0 ),// * eg,
    b = g.bang(),
          saw = g.phasor(spacing, b, { min: 0 }),
          rsaw = genish.sub(1, saw),
          saw_env = g.ad(0, genish.mul(.035, g.gen.samplerate), { shape: 'linear' }),
          b2 = g.bang(),
          count = g.accum(1, b2, { max: Infinity, min: 0, initialValue: 0 }),
          delayedNoise = g.switch(g.gte(count, genish.mul(g.gen.samplerate, .035)), rnd, 0),
          bpf1 = g.svf(delayedNoise, 1000, .5, 2, false),
          scaledOut = genish.mul(genish.mul(genish.mul(genish.add(genish.mul(bpf1, eg), genish.mul(genish.mul(rnd, rsaw), saw_env)), gain), loudness), triggerLoudness),
          out = g.svf(scaledOut, cutoff, Q, 1, false);

    // XXX TODO : make this work with ifelse. the problem is that poke ugens put their
    // code at the bottom of the callback function, instead of at the end of the
    // associated if/else block.
    const ife = g.switch(check, out, 0);

    clap.env = {
      trigger(vol) {
        b.trigger();
        eg.trigger(vol);
        b2.trigger();
        saw_env.trigger();
      }
    };

    return Gibberish.factory(clap, ife, ['instruments', 'clap'], props);
  };

  Clap.defaults = {
    gain: 1,
    spacing: 100,
    decay: .2,
    loudness: 1,
    __triggerLoudness: 1,
    cutoff: 900,
    Q: .85
  };

  return Clap;
};

},{"./instrument.js":42,"genish.js":114}],37:[function(require,module,exports){
const g = require('genish.js'),
      instrument = require('./instrument.js'),
      __wavefold = require('../fx/wavefolder.dsp.js');

const genish = g;

module.exports = function (Gibberish) {
  const wavefold = __wavefold(Gibberish)[1];

  const Complex = inputProps => {
    const syn = Object.create(instrument);

    const frequency = g.in('frequency'),
          loudness = g.in('loudness'),
          triggerLoudness = g.in('__triggerLoudness'),
          glide = g.in('glide'),
          slidingFreq = g.slide(frequency, glide, glide),
          attack = g.in('attack'),
          decay = g.in('decay'),
          sustain = g.in('sustain'),
          sustainLevel = g.in('sustainLevel'),
          release = g.in('release'),
          pregain = g.in('pregain'),
          postgain = g.in('postgain');

    const props = Object.assign({}, Complex.defaults, inputProps);
    Object.assign(syn, props);

    syn.__createGraph = function () {
      const osc = Gibberish.oscillators.factory(syn.waveform, slidingFreq, syn.antialias);

      const env = Gibberish.envelopes.factory(props.useADSR, props.shape, attack, decay, sustain, sustainLevel, release, props.triggerRelease);

      const saturation = g.in('saturation');

      // below doesn't work as it attempts to assign to release property triggering codegen...
      // syn.release = ()=> { syn.env.release() }

      {
        'use jsdsp';
        let oscWithEnv = genish.mul(genish.mul(genish.mul(osc, env), loudness), triggerLoudness),
            panner;

        let foldedOsc = wavefold(wavefold(wavefold(wavefold(genish.mul(genish.mul(oscWithEnv, genish.mul(pregain, env)), .333)))));
        foldedOsc = genish.mul(g.tanh(genish.mul(foldedOsc, .6)), postgain);

        // 16 is an unfortunate empirically derived magic number...
        const baseCutoffFreq = genish.mul(g.in('cutoff'), genish.div(frequency, genish.div(g.gen.samplerate, 16)));
        const cutoff = g.min(genish.mul(genish.mul(baseCutoffFreq, g.pow(2, genish.mul(genish.mul(g.in('filterMult'), loudness), triggerLoudness))), env), .995);
        const filteredOsc = Gibberish.filters.factory(foldedOsc, cutoff, saturation, props);

        let complexWithGain = genish.mul(filteredOsc, g.in('gain'));
        // XXX ugly, ugly hack
        if (props.filterType !== 2) complexWithGain = genish.mul(complexWithGain, saturation);

        if (syn.panVoices === true) {
          panner = g.pan(complexWithGain, complexWithGain, g.in('pan'));
          syn.graph = [panner.left, panner.right];
        } else {
          syn.graph = complexWithGain;
        }

        syn.env = env;
        syn.osc = osc;
        syn.filter = filteredOsc;
      }
    };

    syn.__requiresRecompilation = ['waveform', 'antialias', 'filterType', 'filterMode', 'useADSR', 'shape'];
    syn.__createGraph();

    const out = Gibberish.factory(syn, syn.graph, ['instruments', 'complex'], props);

    return out;
  };

  Complex.defaults = {
    waveform: 'triangle',
    attack: 44,
    decay: 22050,
    sustain: 44100,
    sustainLevel: .6,
    release: 22050,
    useADSR: false,
    shape: 'exponential',
    triggerRelease: false,
    gain: .5,
    pulsewidth: .25,
    frequency: 220,
    pan: .5,
    antialias: true,
    panVoices: false,
    loudness: 1,
    __triggerLoudness: 1,
    glide: 1,
    saturation: 1,
    filterMult: 2,
    Q: .25,
    cutoff: .5,
    filterType: 1,
    filterMode: 0,
    isStereo: false,
    pregain: 4,
    postgain: 1

    // do not include velocity, which shoudl always be per voice
  };let PolyComplex = Gibberish.PolyTemplate(Complex, ['frequency', 'attack', 'decay', 'pulsewidth', 'pan', 'gain', 'glide', 'saturation', 'filterMult', 'Q', 'cutoff', 'resonance', 'antialias', 'filterType', 'waveform', 'filterMode', '__triggerLoudness', 'loudness', 'pregain', 'postgain']);
  PolyComplex.defaults = Complex.defaults;

  return [Complex, PolyComplex];
};

},{"../fx/wavefolder.dsp.js":34,"./instrument.js":42,"genish.js":114}],38:[function(require,module,exports){
let g = require('genish.js'),
    instrument = require('./instrument.js');

module.exports = function (Gibberish) {

  const Conga = argumentProps => {
    const conga = Object.create(instrument),
          frequency = g.in('frequency'),
          decay = g.in('decay'),
          gain = g.in('gain'),
          loudness = g.in('loudness'),
          triggerLoudness = g.in('__triggerLoudness');

    const props = Object.assign({}, Conga.defaults, argumentProps);

    const trigger = g.bang(),
          impulse = g.mul(trigger, 60),
          _decay = g.sub(.101, g.div(decay, 10)),
          // create range of .001 - .099
    bpf = g.svf(impulse, frequency, _decay, 2, false),
          out = g.mul(bpf, g.mul(g.mul(triggerLoudness, loudness), gain));

    conga.isStereo = false;
    conga.env = trigger;
    return Gibberish.factory(conga, out, ['instruments', 'conga'], props);
  };

  Conga.defaults = {
    gain: .125,
    frequency: 190,
    decay: .85,
    loudness: 1,
    __triggerLoudness: 1
  };

  const PolyConga = Gibberish.PolyTemplate(Conga, ['gain', 'frequency', 'decay', 'loudness', '__triggerLoudness']);
  PolyConga.defaults = Conga.defaults;

  return [Conga, PolyConga];
};

},{"./instrument.js":42,"genish.js":114}],39:[function(require,module,exports){
let g = require('genish.js'),
    instrument = require('./instrument.js');

module.exports = function (Gibberish) {

  const Cowbell = argumentProps => {
    let cowbell = Object.create(instrument);

    const decay = g.in('decay'),
          gain = g.in('gain'),
          loudness = g.in('loudness'),
          triggerLoudness = g.in('__triggerLoudness');

    const props = Object.assign({}, Cowbell.defaults, argumentProps);

    const bpfCutoff = g.param('bpfc', 1000),
          s1 = Gibberish.oscillators.factory('square', 560),
          s2 = Gibberish.oscillators.factory('square', 845),
          eg = g.decay(g.mul(decay, g.gen.samplerate * 2), { initValue: 0 }),
          bpf = g.svf(g.add(s1, s2), bpfCutoff, 3, 2, false),
          envBpf = g.mul(bpf, eg),
          out = g.mul(envBpf, g.mul(gain, loudness, triggerLoudness));

    cowbell.env = eg;

    cowbell.isStereo = false;

    cowbell = Gibberish.factory(cowbell, out, ['instruments', 'cowbell'], props);

    return cowbell;
  };

  Cowbell.defaults = {
    gain: 1,
    decay: .5,
    loudness: 1,
    __triggerLoudness: 1
  };

  return Cowbell;
};

},{"./instrument.js":42,"genish.js":114}],40:[function(require,module,exports){
const g = require('genish.js'),
      instrument = require('./instrument.js');

const genish = g;

module.exports = function (Gibberish) {

  const FM = inputProps => {
    let syn = Object.create(instrument);

    let frequency = g.in('frequency'),
        glide = g.in('glide'),
        slidingFreq = g.slide(frequency, glide, glide),
        cmRatio = g.in('cmRatio'),
        index = g.in('index'),
        feedback = g.in('feedback'),
        attack = g.in('attack'),
        decay = g.in('decay'),
        sustain = g.in('sustain'),
        sustainLevel = g.in('sustainLevel'),
        release = g.in('release'),
        loudness = g.in('loudness'),
        triggerLoudness = g.in('__triggerLoudness'),
        saturation = g.in('saturation');

    const props = Object.assign({}, FM.defaults, inputProps);
    Object.assign(syn, props);

    syn.__createGraph = function () {
      const env = Gibberish.envelopes.factory(props.useADSR, props.shape, attack, decay, sustain, sustainLevel, release, props.triggerRelease);

      syn.advance = () => {
        env.release();
      };

      const feedbackssd = g.history(0);

      const modOsc = Gibberish.oscillators.factory(syn.modulatorWaveform, g.add(g.mul(slidingFreq, cmRatio), g.mul(feedbackssd.out, feedback, index)), syn.antialias);

      {
        'use jsdsp';
        const Loudness = genish.mul(loudness, triggerLoudness);
        const modOscWithIndex = genish.mul(genish.mul(genish.mul(modOsc, slidingFreq), index), Loudness);
        const modOscWithEnv = genish.mul(modOscWithIndex, env);

        const modOscWithEnvAvg = genish.mul(.5, genish.add(modOscWithEnv, feedbackssd.out));

        feedbackssd.in(modOscWithEnvAvg);

        const carrierOsc = Gibberish.oscillators.factory(syn.carrierWaveform, g.add(slidingFreq, modOscWithEnvAvg), syn.antialias);

        // XXX horrible hack below to "use" saturation even when not using a diode filter 
        const carrierOscWithEnv = props.filterType === 2 ? genish.mul(carrierOsc, env) : g.mul(carrierOsc, g.mul(env, saturation));

        const baseCutoffFreq = genish.mul(g.in('cutoff'), genish.div(frequency, genish.div(g.gen.samplerate, 16)));
        const cutoff = g.min(genish.mul(genish.mul(baseCutoffFreq, g.pow(2, genish.mul(g.in('filterMult'), Loudness))), env), .995);
        const filteredOsc = Gibberish.filters.factory(carrierOscWithEnv, cutoff, saturation, syn);
        const synthWithGain = genish.mul(genish.mul(filteredOsc, g.in('gain')), Loudness);

        let panner;
        if (props.panVoices === true) {
          panner = g.pan(synthWithGain, synthWithGain, g.in('pan'));
          syn.graph = [panner.left, panner.right];
          syn.isStereo = true;
        } else {
          syn.graph = synthWithGain;
          syn.isStereo = false;
        }
      }

      syn.env = env;

      return env;
    };

    syn.__requiresRecompilation = ['carrierWaveform', 'modulatorWaveform', 'antialias', 'filterType', 'filterMode'];
    const env = syn.__createGraph();

    const out = Gibberish.factory(syn, syn.graph, ['instruments', 'FM'], props);

    out.env.advance = out.advance;
    return out;
  };

  FM.defaults = {
    carrierWaveform: 'sine',
    modulatorWaveform: 'sine',
    attack: 44,
    feedback: 0,
    decay: 22050,
    sustain: 44100,
    sustainLevel: .6,
    release: 22050,
    useADSR: false,
    shape: 'linear',
    triggerRelease: false,
    gain: .25,
    cmRatio: 2,
    index: 5,
    pulsewidth: .25,
    frequency: 220,
    pan: .5,
    antialias: false,
    panVoices: false,
    glide: 1,
    saturation: 1,
    filterMult: 1.5,
    Q: .25,
    cutoff: .35,
    filterType: 0,
    filterMode: 0,
    loudness: 1,
    __triggerLoudness: 1

  };

  const PolyFM = Gibberish.PolyTemplate(FM, ['glide', 'frequency', 'attack', 'decay', 'pulsewidth', 'pan', 'gain', 'cmRatio', 'index', 'saturation', 'filterMult', 'Q', 'cutoff', 'antialias', 'filterType', 'carrierWaveform', 'modulatorWaveform', 'filterMode', 'feedback', 'useADSR', 'sustain', 'release', 'sustainLevel', '__triggerLoudness', 'loudness']);
  PolyFM.defaults = FM.defaults;

  return [FM, PolyFM];
};

},{"./instrument.js":42,"genish.js":114}],41:[function(require,module,exports){
let g = require('genish.js'),
    instrument = require('./instrument.js');

module.exports = function (Gibberish) {

    let Hat = argumentProps => {
        let hat = Object.create(instrument),
            tune = g.in('tune'),
            scaledTune = g.memo(g.add(.4, tune)),
            decay = g.in('decay'),
            gain = g.in('gain'),
            loudness = g.in('loudness'),
            triggerLoudness = g.in('__triggerLoudness');

        let props = Object.assign({}, Hat.defaults, argumentProps);

        let baseFreq = g.mul(325, scaledTune),
            // range of 162.5 - 487.5
        bpfCutoff = g.mul(g.param('bpfc', 7000), scaledTune),
            hpfCutoff = g.mul(g.param('hpfc', 11000), scaledTune),
            s1 = Gibberish.oscillators.factory('square', baseFreq, false),
            s2 = Gibberish.oscillators.factory('square', g.mul(baseFreq, 1.4471)),
            s3 = Gibberish.oscillators.factory('square', g.mul(baseFreq, 1.6170)),
            s4 = Gibberish.oscillators.factory('square', g.mul(baseFreq, 1.9265)),
            s5 = Gibberish.oscillators.factory('square', g.mul(baseFreq, 2.5028)),
            s6 = Gibberish.oscillators.factory('square', g.mul(baseFreq, 2.6637)),
            sum = g.add(s1, s2, s3, s4, s5, s6),
            eg = g.decay(g.mul(decay, g.gen.samplerate * 2), { initValue: 0 }),
            bpf = g.svf(sum, bpfCutoff, .5, 2, false),
            envBpf = g.mul(bpf, eg),
            hpf = g.filter24(envBpf, 0, hpfCutoff, 0),
            out = g.mul(hpf, g.mul(gain, g.mul(loudness, triggerLoudness)));

        hat.env = eg;
        hat.isStereo = false;

        const __hat = Gibberish.factory(hat, out, ['instruments', 'hat'], props);

        return __hat;
    };

    Hat.defaults = {
        gain: .5,
        tune: .6,
        decay: .1,
        loudness: 1,
        __triggerLoudness: 1
    };

    return Hat;
};

},{"./instrument.js":42,"genish.js":114}],42:[function(require,module,exports){
const ugen = require('../ugen.js')();

const instrument = Object.create(ugen);

Object.assign(instrument, {
  type: 'instrument',

  note(freq, loudness = null) {
    // if binop is should be used...
    if (isNaN(this.frequency)) {
      // and if we are assigning binop for the first time...

      let obj = Gibberish.processor.ugens.get(this.frequency.id);
      if (obj.isop !== true) {
        obj.inputs[0] = freq;
      } else {
        obj.inputs[1] = freq;
        Gibberish.dirty(this);
      }
      this.frequency = obj;
    } else {
      this.frequency = freq;
    }

    if (loudness !== null) {
      this.__triggerLoudness = loudness;
    }

    this.env.trigger();
  },

  trigger(loudness = 1) {
    this.__triggerLoudness = loudness;
    this.env.trigger();
  }

});

module.exports = instrument;

},{"../ugen.js":69}],43:[function(require,module,exports){
module.exports = function (Gibberish) {

  const instruments = {
    Kick: require('./kick.js')(Gibberish),
    Clave: require('./conga.js')(Gibberish)[0], // clave is same as conga with different defaults, see below
    Hat: require('./hat.js')(Gibberish),
    Snare: require('./snare.js')(Gibberish),
    Cowbell: require('./cowbell.js')(Gibberish),
    Tom: require('./tom.js')(Gibberish),
    Clap: require('./clap.dsp.js')(Gibberish)
  };

  instruments.Clave.defaults.frequency = 2500;
  instruments.Clave.defaults.decay = .5;

  [instruments.Synth, instruments.PolySynth] = require('./synth.dsp.js')(Gibberish);
  [instruments.Complex, instruments.PolyComplex] = require('./complex.dsp.js')(Gibberish);
  [instruments.Monosynth, instruments.PolyMono] = require('./monosynth.dsp.js')(Gibberish);
  [instruments.FM, instruments.PolyFM] = require('./fm.dsp.js')(Gibberish);
  [instruments.Sampler, instruments.PolySampler] = require('./sampler.js')(Gibberish);
  [instruments.Karplus, instruments.PolyKarplus] = require('./karplusstrong.js')(Gibberish);
  [instruments.Conga, instruments.PolyConga] = require('./conga.js')(Gibberish);

  instruments.export = target => {
    for (let key in instruments) {
      if (key !== 'export') {
        target[key] = instruments[key];
      }
    }
  };

  return instruments;
};

},{"./clap.dsp.js":36,"./complex.dsp.js":37,"./conga.js":38,"./cowbell.js":39,"./fm.dsp.js":40,"./hat.js":41,"./karplusstrong.js":44,"./kick.js":45,"./monosynth.dsp.js":46,"./sampler.js":49,"./snare.js":50,"./synth.dsp.js":51,"./tom.js":52}],44:[function(require,module,exports){
const g = require('genish.js'),
      instrument = require('./instrument.js');

module.exports = function (Gibberish) {

  const Karplus = inputProps => {

    const props = Object.assign({}, Karplus.defaults, inputProps);
    let syn = Object.create(instrument);

    let sampleRate = Gibberish.ctx.sampleRate;

    const trigger = g.bang(),

    // high initialValue stops triggering on initialization
    phase = g.accum(1, trigger, { shouldWrapMax: false, initialValue: 1000000 }),
          env = g.gtp(g.sub(1, g.div(phase, 200)), 0),
          impulse = g.mul(g.noise(), env),
          feedback = g.history(),
          frequency = g.in('frequency'),
          glide = g.in('glide'),
          slidingFrequency = g.slide(frequency, glide, glide),
          delay = g.delay(g.add(impulse, feedback.out), g.div(sampleRate, slidingFrequency)),
          decayed = g.mul(delay, g.t60(g.mul(g.in('decay'), slidingFrequency))),
          damped = g.mix(decayed, feedback.out, g.in('damping')),
          n = g.noise(),
          blendValue = g.switch(g.gt(n, g.in('blend')), -1, 1),
          withGain = g.mul(g.mul(blendValue, damped), g.mul(g.mul(g.in('loudness'), g.in('__triggerLoudness')), g.in('gain')));

    feedback.in(damped);

    const properties = Object.assign({}, Karplus.defaults, props);

    Object.assign(syn, {
      properties: props,

      env: trigger,
      phase,

      getPhase() {
        return Gibberish.memory.heap[phase.memory.value.idx];
      }
    });

    if (properties.panVoices) {
      const panner = g.pan(withGain, withGain, g.in('pan'));
      syn = Gibberish.factory(syn, [panner.left, panner.right], ['instruments', 'karplus'], props);
      syn.isStereo = true;
    } else {
      syn = Gibberish.factory(syn, withGain, ['instruments', 'karplus'], props);
      syn.isStereo = false;
    }

    return syn;
  };

  Karplus.defaults = {
    decay: .97,
    damping: .2,
    gain: .15,
    frequency: 220,
    pan: .5,
    glide: 1,
    panVoices: false,
    loudness: 1,
    __triggerLoudness: 1,
    blend: 1
  };

  let envCheckFactory = (syn, synth) => {
    let envCheck = () => {
      let phase = syn.getPhase(),
          endTime = synth.decay * sampleRate;

      if (phase > endTime) {
        synth.disconnectUgen(syn);
        syn.isConnected = false;
        Gibberish.memory.heap[syn.phase.memory.value.idx] = 0; // trigger doesn't seem to reset for some reason
      } else {
        Gibberish.blockCallbacks.push(envCheck);
      }
    };
    return envCheck;
  };

  const PolyKarplus = Gibberish.PolyTemplate(Karplus, ['frequency', 'decay', 'damping', 'pan', 'gain', 'glide', 'loudness', '__triggerLoudness'], envCheckFactory);
  PolyKarplus.defaults = Karplus.defaults;

  return [Karplus, PolyKarplus];
};

},{"./instrument.js":42,"genish.js":114}],45:[function(require,module,exports){
let g = require('genish.js'),
    instrument = require('./instrument.js');

module.exports = function (Gibberish) {

  const Kick = inputProps => {
    // establish prototype chain
    const kick = Object.create(instrument);

    // define inputs
    const frequency = g.in('frequency'),
          decay = g.in('decay'),
          tone = g.in('tone'),
          gain = g.in('gain'),
          loudness = g.in('loudness'),
          triggerLoudness = g.in('__triggerLoudness'),
          Loudness = g.mul(loudness, triggerLoudness);

    // create initial property set
    const props = Object.assign({}, Kick.defaults, inputProps);
    Object.assign(kick, props);

    // create DSP graph
    const trigger = g.bang(),
          impulse = g.mul(trigger, 60),
          scaledDecay = g.sub(1.005, decay),
          // -> range { .005, 1.005 }
    scaledTone = g.add(50, g.mul(tone, g.mul(4000, Loudness))),
          // -> range { 50, 4050 }
    bpf = g.svf(impulse, frequency, scaledDecay, 2, false),
          lpf = g.svf(bpf, scaledTone, .5, 0, false),
          graph = g.mul(lpf, g.mul(gain, Loudness));

    kick.env = trigger;
    const out = Gibberish.factory(kick, graph, ['instruments', 'kick'], props);

    return out;
  };

  Kick.defaults = {
    gain: 1,
    frequency: 85,
    tone: .25,
    decay: .9,
    loudness: 1,
    __triggerLoudness: 1
  };

  return Kick;
};

},{"./instrument.js":42,"genish.js":114}],46:[function(require,module,exports){
const g = require('genish.js'),
      instrument = require('./instrument.js'),
      feedbackOsc = require('../oscillators/fmfeedbackosc.js');

module.exports = function (Gibberish) {

  const Mono = argumentProps => {
    const syn = Object.create(instrument),
          oscs = [],
          frequency = g.in('frequency'),
          glide = g.in('glide'),
          slidingFreq = g.memo(g.slide(frequency, glide, glide)),
          attack = g.in('attack'),
          decay = g.in('decay'),
          sustain = g.in('sustain'),
          sustainLevel = g.in('sustainLevel'),
          release = g.in('release'),
          loudness = g.in('loudness'),
          triggerLoudness = g.in('__triggerLoudness'),
          Loudness = g.mul(loudness, triggerLoudness),
          saturation = g.in('saturation');

    const props = Object.assign({}, Mono.defaults, argumentProps);
    Object.assign(syn, props);

    syn.__createGraph = function () {
      const env = Gibberish.envelopes.factory(props.useADSR, props.shape, attack, decay, sustain, sustainLevel, release, props.triggerRelease);

      for (let i = 0; i < 3; i++) {
        let osc, freq;

        switch (i) {
          case 1:
            freq = g.add(slidingFreq, g.mul(slidingFreq, g.in('detune2')));
            break;
          case 2:
            freq = g.add(slidingFreq, g.mul(slidingFreq, g.in('detune3')));
            break;
          default:
            freq = slidingFreq;
        }

        osc = Gibberish.oscillators.factory(syn.waveform, freq, syn.antialias);

        oscs[i] = osc;
      }

      //const baseCutoffFreq = g.in('cutoff') * (frequency /  (g.gen.samplerate / 16 ))
      //const cutoff = baseCutoffFreq * g.pow( 2, g.in('filterMult') * loudness ) * env 
      const oscSum = g.add(...oscs),

      // XXX horrible hack below to "use" saturation even when not using a diode filter 
      oscWithEnv = props.filterType === 2 ? g.mul(oscSum, env) : g.sub(g.add(g.mul(oscSum, env), saturation), saturation),
            baseCutoffFreq = g.mul(g.in('cutoff'), g.div(frequency, g.gen.samplerate / 16)),
            cutoff = g.mul(g.mul(baseCutoffFreq, g.pow(2, g.mul(g.in('filterMult'), Loudness))), env),
            filteredOsc = Gibberish.filters.factory(oscWithEnv, cutoff, g.in('saturation'), syn);

      if (props.panVoices) {
        const panner = g.pan(filteredOsc, filteredOsc, g.in('pan'));
        syn.graph = [g.mul(panner.left, g.in('gain'), Loudness), g.mul(panner.right, g.in('gain'), Loudness)];
        syn.isStereo = true;
      } else {
        syn.graph = g.mul(filteredOsc, g.in('gain'), Loudness);
        syn.isStereo = false;
      }

      syn.env = env;
    };

    syn.__requiresRecompilation = ['waveform', 'antialias', 'filterType', 'filterMode'];
    syn.__createGraph();

    const out = Gibberish.factory(syn, syn.graph, ['instruments', 'Monosynth'], props);

    return out;
  };

  Mono.defaults = {
    waveform: 'saw',
    attack: 44,
    decay: 22050,
    sustain: 44100,
    sustainLevel: .6,
    release: 22050,
    useADSR: false,
    shape: 'linear',
    triggerRelease: false,
    gain: .25,
    pulsewidth: .25,
    frequency: 220,
    pan: .5,
    detune2: .005,
    detune3: -.005,
    cutoff: .5,
    Q: .25,
    panVoices: false,
    glide: 1,
    antialias: false,
    filterType: 1,
    filterMode: 0, // 0 = LP, 1 = HP, 2 = BP, 3 = Notch
    saturation: .5,
    filterMult: 2,
    isLowPass: true,
    loudness: 1,
    __triggerLoudness: 1
  };

  let PolyMono = Gibberish.PolyTemplate(Mono, ['frequency', 'attack', 'decay', 'cutoff', 'Q', 'detune2', 'detune3', 'pulsewidth', 'pan', 'gain', 'glide', 'saturation', 'filterMult', 'antialias', 'filterType', 'waveform', 'filterMode', 'loudness', '__triggerLoudness']);
  PolyMono.defaults = Mono.defaults;

  return [Mono, PolyMono];
};

},{"../oscillators/fmfeedbackosc.js":60,"./instrument.js":42,"genish.js":114}],47:[function(require,module,exports){
// XXX TOO MANY GLOBAL GIBBERISH VALUES

const Gibberish = require('../index.js');

module.exports = {
  note(freq) {
    // will be sent to processor node via proxy method...
    if (Gibberish.mode !== 'worklet') {
      let voice = this.__getVoice__();
      //Object.assign( voice, this.properties )
      //if( gain === undefined ) gain = this.gain
      //voice.gain = gain
      voice.__triggerLoudness = this.__triggerLoudness;
      voice.note(freq, this.__triggerLoudness);
      this.__runVoice__(voice, this);
      this.triggerNote = freq;
    }
  },

  // XXX this is not particularly satisfying...
  // must check for both notes and chords
  trigger(loudness) {
    if (this.triggerChord !== null) {
      this.triggerChord.forEach(v => {
        let voice = this.__getVoice__();
        Object.assign(voice, this.properties);
        voice.note(v, loudness);
        this.__runVoice__(voice, this);
      });
    } else if (this.triggerNote !== null) {
      let voice = this.__getVoice__();
      Object.assign(voice, this.properties);
      voice.note(this.triggerNote, loudness);
      this.__runVoice__(voice, this);
    } else {
      let voice = this.__getVoice__();
      Object.assign(voice, this.properties);
      voice.trigger(loudness);
      this.__runVoice__(voice, this);
    }
  },

  __runVoice__(voice, _poly) {
    if (!voice.isConnected) {
      voice.connect(_poly);
      voice.isConnected = true;
    }

    //let envCheck
    //if( _poly.envCheck === undefined ) {
    //  envCheck = function() {
    //    if( voice.env.isComplete() ) {
    //      _poly.disconnectUgen( voice )
    //      voice.isConnected = false
    //    }else{
    //      Gibberish.blockCallbacks.push( envCheck )
    //    }
    //  }
    //}else{
    //  envCheck = _poly.envCheck( voice, _poly )
    //}

    // XXX uncomment this line to turn on dynamically connecting
    // disconnecting individual voices from graph
    //Gibberish.blockCallbacks.push( envCheck )
  },

  __getVoice__() {
    return this.voices[this.voiceCount++ % this.voices.length];
  },

  chord(frequencies) {
    // will be sent to processor node via proxy method...
    if (Gibberish !== undefined && Gibberish.mode !== 'worklet') {
      frequencies.forEach(v => this.note(v));
      this.triggerChord = frequencies;
    }
  },

  free() {
    for (let child of this.voices) child.free();
  },

  triggerChord: null,
  triggerNote: null
};

},{"../index.js":35}],48:[function(require,module,exports){
/*
 * This files creates a factory generating polysynth constructors.
 */

const g = require('genish.js');
const __proxy = require('../workletProxy.js');

module.exports = function (Gibberish) {
  const proxy = __proxy(Gibberish);

  const TemplateFactory = (ugen, propertyList, _envCheck) => {

    const Template = props => {
      const properties = Object.assign({}, { isStereo: true, maxVoices: 4 }, props);

      //const synth = properties.isStereo === true ? Object.create( stereoProto ) : Object.create( monoProto )
      const synth = properties.isStereo === true ? Gibberish.Bus2({ __useProxy__: false }) : Gibberish.Bus({ __useProxy__: false });

      Object.assign(synth, {
        maxVoices: properties.maxVoices,
        voiceCount: 0,
        envCheck: _envCheck,
        dirty: true,
        ugenName: 'poly' + ugen.name + '_' + synth.id + '_' + (properties.isStereo ? 2 : 1),
        properties
      }, Gibberish.mixins.polyinstrument);

      properties.panVoices = true; //false//properties.isStereo
      synth.callback.ugenName = synth.ugenName;

      const storedId = properties.id;
      if (properties.id !== undefined) delete properties.id;

      const voices = [];
      for (let i = 0; i < synth.maxVoices; i++) {
        properties.id = synth.id + '_' + i;
        voices[i] = ugen(properties);
        if (Gibberish.mode === 'processor') voices[i].callback.ugenName = voices[i].ugenName;

        voices[i].isConnected = false;
        //synth.__voices[i] = proxy( ['instruments', ugen.name], properties, synth.voices[i] )
      }

      let _propertyList;
      if (properties.isStereo === false) {
        _propertyList = propertyList.slice(0);
        const idx = _propertyList.indexOf('pan');
        if (idx > -1) _propertyList.splice(idx, 1);
      }

      properties.id = storedId;

      TemplateFactory.setupProperties(synth, ugen, properties.isStereo ? propertyList : _propertyList);

      const p = proxy(['instruments', 'Poly' + ugen.name], properties, synth);

      // proxy workaround nightmare... if we include the voices when we create
      // the proxy, they wind up being strangely unaddressable. perhaps they
      // are being overwritting in the Processor.ugens map object?
      // manually adding each one seems to work around the problem
      if (Gibberish.mode === 'worklet') {
        p.voices = [];
        let count = 0;
        for (let v of voices) {
          Gibberish.worklet.port.postMessage({
            address: 'addObjectToProperty',
            object: synth.id,
            name: 'voices',
            key: count,
            value: v.id
          });

          p.voices[count] = v;
          count++;
        }
      }

      return p;
    };

    return Template;
  };

  TemplateFactory.setupProperties = function (synth, ugen, props) {
    for (let property of props) {
      if (property === 'pan' || property === 'id') continue;
      Object.defineProperty(synth, property, {
        get() {
          return synth.properties[property] || ugen.defaults[property];
        },
        set(v) {
          synth.properties[property] = v;
          for (let child of synth.voices) {
            child[property] = v;
          }
        }
      });
    }
  };

  return TemplateFactory;
};

},{"../workletProxy.js":71,"genish.js":114}],49:[function(require,module,exports){
const g = require('genish.js'),
      instrument = require('./instrument.js');

module.exports = function (Gibberish) {
  const proto = Object.create(instrument);
  const memo = {};

  Object.assign(proto, {
    note(rate) {
      this.rate = rate;
      if (rate > 0) {
        this.__trigger();
      } else {
        this.__phase__.value = this.end * (this.data.buffer.length - 1);
      }
    },
    trigger(volume) {
      if (volume !== undefined) this.gain = volume;

      if (Gibberish.mode === 'processor') {
        // if we're playing the sample forwards...
        if (Gibberish.memory.heap[this.__rateStorage__.memory.values.idx] > 0) {
          this.__trigger();
        } else {
          this.__phase__.value = this.end * (this.data.buffer.length - 1);
        }
      }
    }
  });

  const Sampler = inputProps => {
    const syn = Object.create(proto);

    const props = Object.assign({ onload: null }, Sampler.defaults, inputProps);

    syn.isStereo = props.isStereo !== undefined ? props.isStereo : false;

    const start = g.in('start'),
          end = g.in('end'),
          bufferLength = g.in('bufferLength'),
          rate = g.in('rate'),
          shouldLoop = g.in('loops'),
          loudness = g.in('loudness'),
          triggerLoudness = g.in('__triggerLoudness'),

    // rate storage is used to determine whether we're playing
    // the sample forward or in reverse, for use in the 'trigger' method.
    rateStorage = g.data([0], 1, { meta: true });

    Object.assign(syn, props);

    if (Gibberish.mode === 'worklet') {
      syn.__meta__ = {
        address: 'add',
        name: ['instruments', 'Sampler'],
        properties: JSON.stringify(props),
        id: syn.id
      };

      Gibberish.worklet.ugens.set(syn.id, syn);

      Gibberish.worklet.port.postMessage(syn.__meta__);
    }

    syn.__createGraph = function () {
      syn.__bang__ = g.bang();
      syn.__trigger = syn.__bang__.trigger;

      syn.__phase__ = g.counter(rate, g.mul(start, bufferLength), g.mul(end, bufferLength), syn.__bang__, shouldLoop, { shouldWrap: false, initialValue: 9999999 });

      syn.__rateStorage__ = rateStorage;
      rateStorage[0] = rate;

      // XXX we added our recorded 'rate' param and then effectively subtract it,
      // so that its presence in the graph will force genish to actually record the 
      // rate as the input. this is extremely hacky... there should be a way to record
      // value without having to include it in the graph!
      syn.graph = g.add(g.mul(g.ifelse(g.and(g.gte(syn.__phase__, g.mul(start, bufferLength)), g.lt(syn.__phase__, g.mul(end, bufferLength))), g.peek(syn.data, syn.__phase__, { mode: 'samples' }), 0), g.mul(g.mul(loudness, triggerLoudness), g.in('gain'))), rateStorage[0], g.mul(rateStorage[0], -1));

      if (syn.panVoices === true) {
        const panner = g.pan(syn.graph, syn.graph, g.in('pan'));
        syn.graph = [panner.left, panner.right];
      }
    };

    const onload = (buffer, filename) => {
      if (buffer === undefined) return;
      if (Gibberish.mode === 'worklet') {
        //const memIdx = memo[ filename ].idx !== undefined ? memo[ filename ].idx : Gibberish.memory.alloc( syn.data.memory.values.length, true )

        const memIdx = Gibberish.memory.alloc(buffer.length, true);
        //memo[ filename ].idx = memIdx

        Gibberish.worklet.port.postMessage({
          address: 'copy',
          id: syn.id,
          idx: memIdx,
          buffer
        });
      } else if (Gibberish.mode === 'processor') {
        syn.data.buffer = buffer;
        syn.data.memory.values.length = syn.data.dim = buffer.length;
        syn.__redoGraph();
      }

      if (typeof syn.onload === 'function') {
        syn.onload(buffer || syn.data.buffer);
      }
      if (syn.bufferLength === -999999999 && syn.data.buffer !== undefined) syn.bufferLength = syn.data.buffer.length - 1;
    };

    //if( props.filename ) {
    syn.loadFile = function (filename) {
      //if( memo[ filename ] === undefined ) {
      if (Gibberish.mode !== 'processor') {
        syn.data = g.data(filename, 1, { onload });

        // check to see if a promise is returned; a valid
        // data object is only return if the file has been
        // previously loaded and the corresponding buffer has
        // been cached.
        if (syn.data instanceof Promise) {
          syn.data.then(d => {
            syn.data = d;
            memo[filename] = syn.data;
            onload(d.buffer, filename);
          });
        } else {
          // using a cached data buffer, no need
          // for asynchronous loading.
          memo[filename] = syn.data;
          onload(syn.data.buffer, filename);
        }
      } else {
        syn.data = g.data(new Float32Array(), 1, { onload, filename });
        //memo[ filename ] = syn.data
      }
      //}else{
      //  syn.data = memo[ filename ]
      //  console.log( 'memo data:', syn.data )
      //  onload( syn.data.buffer, filename )
      //}
    };

    syn.loadBuffer = function (buffer) {
      if (Gibberish.mode === 'processor') {
        syn.data.buffer = buffer;
        syn.data.memory.values.length = syn.data.dim = buffer.length;
        syn.__redoGraph();
      }
    };

    if (props.filename !== undefined) {
      syn.loadFile(props.filename);
    } else {
      syn.data = g.data(new Float32Array());
    }

    if (syn.data !== undefined) {
      syn.data.onload = onload;

      syn.__createGraph();
    }

    const out = Gibberish.factory(syn, syn.graph, ['instruments', 'sampler'], props);

    return out;
  };

  Sampler.defaults = {
    gain: 1,
    pan: .5,
    rate: 1,
    panVoices: false,
    loops: 0,
    start: 0,
    end: 1,
    bufferLength: -999999999,
    loudness: 1,
    __triggerLoudness: 1
  };

  const envCheckFactory = function (voice, _poly) {

    const envCheck = () => {
      const phase = Gibberish.memory.heap[voice.__phase__.memory.value.idx];
      if (voice.rate > 0 && phase > voice.end || voice.rate < 0 && phase < 0) {
        _poly.disconnectUgen.call(_poly, voice);
        voice.isConnected = false;
      } else {
        Gibberish.blockCallbacks.push(envCheck);
      }
    };

    return envCheck;
  };

  const PolySampler = Gibberish.PolyTemplate(Sampler, ['rate', 'pan', 'gain', 'start', 'end', 'loops', 'bufferLength', '__triggerLoudness', 'loudness'], envCheckFactory);

  return [Sampler, PolySampler];
};

},{"./instrument.js":42,"genish.js":114}],50:[function(require,module,exports){
const g = require('genish.js'),
      instrument = require('./instrument.js');

module.exports = function (Gibberish) {

  const Snare = argumentProps => {
    const snare = Object.create(instrument),
          decay = g.in('decay'),
          scaledDecay = g.mul(decay, g.gen.samplerate * 2),
          snappy = g.in('snappy'),
          tune = g.in('tune'),
          gain = g.in('gain'),
          loudness = g.in('loudness'),
          triggerLoudness = g.in('__triggerLoudness'),
          Loudness = g.mul(loudness, triggerLoudness),
          eg = g.decay(scaledDecay, { initValue: 0 }),
          check = g.memo(g.gt(eg, .0005)),
          rnd = g.mul(g.noise(), eg),
          hpf = g.svf(rnd, g.add(1000, g.mul(g.add(1, tune), 1000)), .5, 1, false),
          snap = g.mul(g.gtp(g.mul(hpf, snappy), 0), Loudness),
          // rectify
    bpf1 = g.svf(eg, g.mul(180, g.add(tune, 1)), .05, 2, false),
          bpf2 = g.svf(eg, g.mul(330, g.add(tune, 1)), .05, 2, false),
          out = g.memo(g.add(snap, bpf1, g.mul(bpf2, .8))),
          //XXX why is memo needed?
    scaledOut = g.mul(out, g.mul(gain, Loudness)),
          ife = g.switch(check, scaledOut, 0),
          props = Object.assign({}, Snare.defaults, argumentProps);

    // XXX TODO : make above switch work with ifelse. the problem is that poke ugens put their
    // code at the bottom of the callback function, instead of at the end of the
    // associated if/else block.

    snare.env = eg;
    const __snare = Gibberish.factory(snare, ife, ['instruments', 'snare'], props);

    return __snare;
  };

  Snare.defaults = {
    gain: .5,
    tune: 0,
    snappy: 1,
    decay: .1,
    loudness: 1,
    __triggerLoudness: 1
  };

  return Snare;
};

},{"./instrument.js":42,"genish.js":114}],51:[function(require,module,exports){
const g = require('genish.js'),
      instrument = require('./instrument.js');

const genish = g;

module.exports = function (Gibberish) {

  const Synth = inputProps => {
    const syn = Object.create(instrument);

    const frequency = g.in('frequency'),
          loudness = g.in('loudness'),
          triggerLoudness = g.in('__triggerLoudness'),
          glide = g.in('glide'),
          slidingFreq = g.slide(frequency, glide, glide),
          attack = g.in('attack'),
          decay = g.in('decay'),
          sustain = g.in('sustain'),
          sustainLevel = g.in('sustainLevel'),
          release = g.in('release');

    const props = Object.assign({}, Synth.defaults, inputProps);
    Object.assign(syn, props);

    syn.__createGraph = function () {
      const osc = Gibberish.oscillators.factory(syn.waveform, slidingFreq, syn.antialias);

      const env = Gibberish.envelopes.factory(props.useADSR, props.shape, attack, decay, sustain, sustainLevel, release, props.triggerRelease);

      // syn.env = env
      // below doesn't work as it attempts to assign to release property triggering codegen...
      syn.advance = () => {
        env.release();
      };

      {
        'use jsdsp';
        let oscWithEnv = genish.mul(genish.mul(genish.mul(osc, env), loudness), triggerLoudness),
            saturation = g.in('saturation'),
            panner;

        // 16 is an unfortunate empirically derived magic number...
        const baseCutoffFreq = genish.mul(g.in('cutoff'), genish.div(frequency, genish.div(g.gen.samplerate, 16)));
        const cutoff = g.min(genish.mul(genish.mul(baseCutoffFreq, g.pow(2, genish.mul(genish.mul(g.in('filterMult'), loudness), triggerLoudness))), env), .995);
        const filteredOsc = Gibberish.filters.factory(oscWithEnv, cutoff, saturation, props);

        let synthWithGain = genish.mul(filteredOsc, g.in('gain'));

        // XXX This line has to be here for correct code generation to work when
        // saturation is not being used... obviously this should cancel out. 
        if (syn.filterType !== 2) synthWithGain = genish.sub(genish.add(synthWithGain, saturation), saturation);

        if (syn.panVoices === true) {
          panner = g.pan(synthWithGain, synthWithGain, g.in('pan'));
          syn.graph = [panner.left, panner.right];
          syn.isStereo = true;
        } else {
          syn.graph = synthWithGain;
          syn.isStereo = false;
        }

        syn.env = env;
        syn.osc = osc;
        syn.filter = filteredOsc;
      }

      return env;
    };

    syn.__requiresRecompilation = ['waveform', 'antialias', 'filterType', 'filterMode', 'useADSR', 'shape'];
    const env = syn.__createGraph();

    const out = Gibberish.factory(syn, syn.graph, ['instruments', 'synth'], props, null, true, ['saturation']);

    out.env.advance = out.advance;

    return out;
  };

  Synth.defaults = {
    waveform: 'saw',
    attack: 44,
    decay: 22050,
    sustain: 44100,
    sustainLevel: .6,
    release: 22050,
    useADSR: false,
    shape: 'linear',
    triggerRelease: false,
    gain: .5,
    pulsewidth: .25,
    frequency: 220,
    pan: .5,
    antialias: false,
    panVoices: false,
    loudness: 1,
    __triggerLoudness: 1,
    glide: 1,
    saturation: 1,
    filterMult: 2,
    Q: .25,
    cutoff: .5,
    filterType: 1,
    filterMode: 0

    // do not include velocity, which shoudl always be per voice
  };let PolySynth = Gibberish.PolyTemplate(Synth, ['frequency', 'attack', 'decay', 'pulsewidth', 'pan', 'gain', 'glide', 'saturation', 'filterMult', 'Q', 'cutoff', 'resonance', 'antialias', 'filterType', 'waveform', 'filterMode', '__triggerLoudness', 'loudness']);
  PolySynth.defaults = Synth.defaults;

  return [Synth, PolySynth];
};

},{"./instrument.js":42,"genish.js":114}],52:[function(require,module,exports){
const g = require('genish.js'),
      instrument = require('./instrument.js');

module.exports = function (Gibberish) {

  const Tom = argumentProps => {
    let tom = Object.create(instrument);

    const decay = g.in('decay'),
          pitch = g.in('frequency'),
          gain = g.in('gain'),
          loudness = g.in('loudness'),
          triggerLoudness = g.in('__triggerLoudness');

    const props = Object.assign({}, Tom.defaults, argumentProps);

    const trigger = g.bang(),
          impulse = g.mul(trigger, 1),
          eg = g.decay(g.mul(decay, g.gen.samplerate * 2), { initValue: 0 }),
          bpf = g.mul(g.svf(impulse, pitch, .0175, 2, false), 10),
          noise = g.gtp(g.noise(), 0),
          // rectify noise
    envelopedNoise = g.mul(noise, eg),
          lpf = g.mul(g.svf(envelopedNoise, 120, .5, 0, false), 2.5),
          out = g.mul(g.add(bpf, lpf), g.mul(gain, g.mul(loudness, triggerLoudness)));

    tom.env = {
      trigger: function () {
        eg.trigger();
        trigger.trigger();
      }
    };

    tom.isStereo = false;

    tom = Gibberish.factory(tom, out, ['instruments', 'tom'], props);

    return tom;
  };

  Tom.defaults = {
    gain: 1,
    decay: .7,
    frequency: 120,
    loudness: 1,
    __triggerLoudness: 1
  };

  return Tom;
};

},{"./instrument.js":42,"genish.js":114}],53:[function(require,module,exports){
const ugenproto = require('../ugen.js')(),
      __proxy = require('../workletProxy.js'),
      g = require('genish.js');

module.exports = function (Gibberish) {
  const proxy = __proxy(Gibberish);

  const createProperties = function (p, id) {
    for (let i = 0; i < 2; i++) {
      Object.defineProperty(p, i, {
        get() {
          return p.inputs[i];
        },
        set(v) {
          p.inputs[i] = v;
          if (Gibberish.mode === 'worklet') {
            if (typeof v === 'number') {
              Gibberish.worklet.port.postMessage({
                address: 'addToProperty',
                object: id,
                name: 'inputs',
                key: i,
                value: v
              });
            } else {
              Gibberish.worklet.port.postMessage({
                address: 'addObjectToProperty',
                object: id,
                name: 'inputs',
                key: i,
                value: v.id
              });
            }
            Gibberish.worklet.port.postMessage({
              address: 'dirty',
              id
            });
          }
        }
      });
    }
  };

  const Binops = {
    export(obj) {
      for (let key in Binops) {
        if (key !== 'export') {
          obj[key] = Binops[key];
        }
      }
    },

    Add(...args) {
      const id = Gibberish.factory.getUID();
      const ugen = Object.create(ugenproto);
      const isStereo = Gibberish.__isStereo(args[0]) || Gibberish.__isStereo(args[1]);
      Object.assign(ugen, { isop: true, op: '+', inputs: args, ugenName: 'add' + id, id, isStereo });

      const p = proxy(['binops', 'Add'], { isop: true, inputs: args }, ugen);
      createProperties(p, id);

      return p;
    },

    Sub(...args) {
      const id = Gibberish.factory.getUID();
      const ugen = Object.create(ugenproto);
      const isStereo = Gibberish.__isStereo(args[0]) || Gibberish.__isStereo(args[1]);
      Object.assign(ugen, { isop: true, op: '-', inputs: args, ugenName: 'sub' + id, id, isStereo });

      return proxy(['binops', 'Sub'], { isop: true, inputs: args }, ugen);
    },

    Mul(...args) {
      const id = Gibberish.factory.getUID();
      const ugen = Object.create(ugenproto);
      const isStereo = Gibberish.__isStereo(args[0]) || Gibberish.__isStereo(args[1]);
      Object.assign(ugen, { isop: true, op: '*', inputs: args, ugenName: 'mul' + id, id, isStereo });

      const p = proxy(['binops', 'Mul'], { isop: true, inputs: args }, ugen);
      createProperties(p, id);
      return p;
    },

    Div(...args) {
      const id = Gibberish.factory.getUID();
      const ugen = Object.create(ugenproto);
      const isStereo = Gibberish.__isStereo(args[0]) || Gibberish.__isStereo(args[1]);
      Object.assign(ugen, { isop: true, op: '/', inputs: args, ugenName: 'div' + id, id, isStereo });

      const p = proxy(['binops', 'Div'], { isop: true, inputs: args }, ugen);
      createProperties(p, id);

      return p;
    },

    Mod(...args) {
      const id = Gibberish.factory.getUID();
      const ugen = Object.create(ugenproto);
      const isStereo = Gibberish.__isStereo(args[0]) || Gibberish.__isStereo(args[1]);
      Object.assign(ugen, { isop: true, op: '%', inputs: args, ugenName: 'mod' + id, id, isStereo });

      const p = proxy(['binops', 'Mod'], { isop: true, inputs: args }, ugen);
      createProperties(p, id);

      return p;
    }
  };

  for (let key in Binops) {
    Binops[key].defaults = { 0: 0, 1: 0 };
  }

  return Binops;
};

},{"../ugen.js":69,"../workletProxy.js":71,"genish.js":114}],54:[function(require,module,exports){
let g = require('genish.js'),
    ugen = require('../ugen.js')(),
    __proxy = require('../workletProxy.js');

module.exports = function (Gibberish) {
  const proxy = __proxy(Gibberish);
  const Bus = Object.create(ugen);

  Object.assign(Bus, {
    gain: {
      set(v) {
        this.mul.inputs[1] = v;
        Gibberish.dirty(this);
      },
      get() {
        return this.mul[1];
      }
    },

    __addInput(input) {
      this.sum.inputs.push(input);
      Gibberish.dirty(this);
    },

    create(_props) {
      const props = Object.assign({}, Bus.defaults, { inputs: [0] }, _props);

      // MUST PREVENT PROXY
      // Othherwise these binops are created in the worklet and sent
      // across the thread to be instantiated, and then instantiated again
      // when the bus is created in the processor thread, messing up the various
      // uids involved. By preventing proxying the binops are only created
      // a single time when the bus is sent across the thread.
      Gibberish.preventProxy = true;
      const sum = Gibberish.binops.Add(...props.inputs);
      const mul = Gibberish.binops.Mul(sum, props.gain);
      Gibberish.preventProxy = false;

      const graph = Gibberish.Panner({ input: mul, pan: props.pan });

      graph.sum = sum;
      graph.mul = mul;
      graph.disconnectUgen = Bus.disconnectUgen;

      graph.__properties__ = props;

      const out = props.__useProxy__ === true ? proxy(['Bus'], props, graph) : graph;

      Object.defineProperty(out, 'gain', Bus.gain);

      if (false && Gibberish.preventProxy === false && Gibberish.mode === 'worklet') {
        const meta = {
          address: 'add',
          name: ['Bus'],
          props,
          id: graph.id
        };
        Gibberish.worklet.port.postMessage(meta);
        Gibberish.worklet.port.postMessage({
          address: 'method',
          object: graph.id,
          name: 'connect',
          args: []
        });
      }

      return out;
    },

    disconnectUgen(ugen) {
      let removeIdx = this.sum.inputs.indexOf(ugen);

      if (removeIdx !== -1) {
        this.sum.inputs.splice(removeIdx, 1);
        Gibberish.dirty(this);
      }
    },

    // can't include inputs here as it will be sucked up by Gibber,
    // instead pass during Object.assign() after defaults.
    defaults: { gain: 1, pan: .5, __useProxy__: true }
  });

  const constructor = Bus.create.bind(Bus);
  constructor.defaults = Bus.defaults;

  return constructor;
};

},{"../ugen.js":69,"../workletProxy.js":71,"genish.js":114}],55:[function(require,module,exports){
const g = require('genish.js'),
      ugen = require('../ugen.js')(),
      __proxy = require('../workletProxy.js');

module.exports = function (Gibberish) {
  const Bus2 = Object.create(ugen);
  const proxy = __proxy(Gibberish);

  let bufferL, bufferR;

  Object.assign(Bus2, {
    create(__props) {

      if (bufferL === undefined) {
        const p = g.pan();

        // copy memory... otherwise the wavetables don't have memory indices.
        bufferL = Gibberish.memory.alloc(1024);
        Gibberish.memory.heap.set(Gibberish.genish.gen.globals.panL.buffer, bufferL);

        bufferR = Gibberish.memory.alloc(1024);
        Gibberish.memory.heap.set(Gibberish.genish.gen.globals.panR.buffer, bufferR);
      }

      // XXX must be same type as what is returned by genish for type checks to work correctly
      const output = new Float64Array(2);

      const bus = Object.create(Bus2);

      let init = false;

      const props = Object.assign({}, Bus2.defaults, __props);

      Object.assign(bus, {
        callback() {
          output[0] = output[1] = 0;
          const lastIdx = arguments.length - 1;
          const memory = arguments[lastIdx];
          let pan = arguments[lastIdx - 1];
          const gain = arguments[lastIdx - 2];

          for (let i = 0; i < lastIdx - 2; i += 3) {
            const input = arguments[i],
                  level = arguments[i + 1],
                  isStereo = arguments[i + 2];

            output[0] += isStereo === true ? input[0] * level : input * level;

            output[1] += isStereo === true ? input[1] * level : input * level;
          }

          if (pan < 0) {
            pan = 0;
          } else if (pan > 1) {
            pan = 1;
          }

          const panRawIndex = pan * 1023,
                panBaseIndex = panRawIndex | 0,
                panNextIndex = panBaseIndex + 1 & 1023,
                interpAmount = panRawIndex - panBaseIndex,
                panL = memory[bufferL + panBaseIndex] + interpAmount * (memory[bufferL + panNextIndex] - memory[bufferL + panBaseIndex]),
                panR = memory[bufferR + panBaseIndex] + interpAmount * (memory[bufferR + panNextIndex] - memory[bufferR + panBaseIndex]);

          output[0] *= gain * panL;
          output[1] *= gain * panR;

          return output;
        },
        id: Gibberish.factory.getUID(),
        dirty: false,
        type: 'bus',
        inputs: [1, .5],
        isStereo: true,
        __properties__: props
      }, Bus2.defaults, props);

      bus.ugenName = bus.callback.ugenName = 'bus2_' + bus.id;

      const out = bus.__useProxy__ === true ? proxy(['Bus2'], props, bus) : bus;

      // we have to include custom properties for these as the argument list for
      // the compiled output function is variable
      // so codegen can't know the correct argument order for the function
      let pan = .5;
      Object.defineProperty(out, 'pan', {
        get() {
          return pan;
        },
        set(v) {
          pan = v;
          out.inputs[out.inputs.length - 1] = pan;
          Gibberish.dirty(out);
        }
      });

      let gain = 1;
      Object.defineProperty(out, 'gain', {
        get() {
          return gain;
        },
        set(v) {
          gain = v;
          out.inputs[out.inputs.length - 2] = gain;
          Gibberish.dirty(out);
        }
      });

      return out;
    },

    disconnectUgen(ugen) {
      let removeIdx = this.inputs.indexOf(ugen);

      if (removeIdx !== -1) {
        this.inputs.splice(removeIdx, 3);
        Gibberish.dirty(this);
      }
    },

    defaults: { gain: 1, pan: .5, __useProxy__: true }
  });

  const constructor = Bus2.create.bind(Bus2);
  constructor.defaults = Bus2.defaults;

  return constructor;
};

},{"../ugen.js":69,"../workletProxy.js":71,"genish.js":114}],56:[function(require,module,exports){
const g = require('genish.js'),
      ugen = require('../ugen.js')();

module.exports = function (Gibberish) {

  const Monops = {
    export(obj) {
      for (let key in Monops) {
        if (key !== 'export') {
          obj[key] = Monops[key];
        }
      }
    },

    Abs(input) {
      const abs = Object.create(ugen);
      const graph = g.abs(g.in('input'));

      const __out = Gibberish.factory(abs, graph, ['monops', 'abs'], Object.assign({}, Monops.defaults, { inputs: [input], isop: true }));

      return __out;
    },

    Pow(input, exponent) {
      const pow = Object.create(ugen);
      const graph = g.pow(g.in('input'), g.in('exponent'));

      Gibberish.factory(pow, graph, ['monops', 'pow'], Object.assign({}, Monops.defaults, { inputs: [input], exponent, isop: true }));

      return pow;
    },
    Clamp(input, min, max) {
      const clamp = Object.create(ugen);
      const graph = g.clamp(g.in('input'), g.in('min'), g.in('max'));

      const __out = Gibberish.factory(clamp, graph, ['monops', 'clamp'], Object.assign({}, Monops.defaults, { inputs: [input], isop: true, min, max }));

      return __out;
    },

    Merge(input) {
      const merger = Object.create(ugen);
      const cb = function (_input) {
        return _input[0] + _input[1];
      };

      Gibberish.factory(merger, g.in('input'), ['monops', 'merge'], { inputs: [input], isop: true }, cb);
      merger.type = 'analysis';
      merger.inputNames = ['input'];
      merger.inputs = [input];
      merger.input = input;

      return merger;
    }
  };

  Monops.defaults = { input: 0 };

  return Monops;
};

},{"../ugen.js":69,"genish.js":114}],57:[function(require,module,exports){
const g = require('genish.js');

const ugen = require('../ugen.js')();

module.exports = function (Gibberish) {

  let Panner = inputProps => {
    const props = Object.assign({}, Panner.defaults, inputProps),
          panner = Object.create(ugen);

    const isStereo = props.input.isStereo !== undefined ? props.input.isStereo : Array.isArray(props.input);

    const input = g.in('input'),
          pan = g.in('pan');

    let graph;
    if (isStereo) {
      graph = g.pan(input[0], input[1], pan);
    } else {
      graph = g.pan(input, input, pan);
    }

    Gibberish.factory(panner, [graph.left, graph.right], ['panner'], props);

    return panner;
  };

  Panner.defaults = {
    input: 0,
    pan: .5
  };

  return Panner;
};

},{"../ugen.js":69,"genish.js":114}],58:[function(require,module,exports){
module.exports = function (Gibberish) {

  const Time = {
    bpm: 120,

    export: function (target) {
      Object.assign(target, Time);
    },

    ms: function (val) {
      return val * Gibberish.ctx.sampleRate / 1000;
    },

    seconds: function (val) {
      return val * Gibberish.ctx.sampleRate;
    },

    beats: function (val) {
      return function () {
        var samplesPerBeat = Gibberish.ctx.sampleRate / (Gibberish.Time.bpm / 60);
        return samplesPerBeat * val;
      };
    }
  };

  return Time;
};

},{}],59:[function(require,module,exports){
const genish = require('genish.js'),
      ssd = genish.history,
      noise = genish.noise;

module.exports = function () {
  "use jsdsp";

  const last = ssd(0);

  const white = genish.sub(genish.mul(noise(), 2), 1);

  let out = genish.div(genish.add(last.out, genish.mul(.02, white)), 1.02);

  last.in(out);

  out = genish.mul(out, 3.5);

  return out;
};

},{"genish.js":114}],60:[function(require,module,exports){
let g = require('genish.js');

let feedbackOsc = function (frequency, filter, pulsewidth = .5, argumentProps) {
  if (argumentProps === undefined) argumentProps = { type: 0 };

  let lastSample = g.history(),

  // determine phase increment and memoize result
  w = g.memo(g.div(frequency, g.gen.samplerate)),

  // create scaling factor
  n = g.sub(-.5, w),
      scaling = g.mul(g.mul(13, filter), g.pow(n, 5)),

  // calculate dc offset and normalization factors
  DC = g.sub(.376, g.mul(w, .752)),
      norm = g.sub(1, g.mul(2, w)),

  // determine phase
  osc1Phase = g.accum(w, 0, { min: -1 }),
      osc1,
      out;

  // create current sample... from the paper:
  // osc = (osc + sin(2*pi*(phase + osc*scaling)))*0.5f;
  osc1 = g.memo(g.mul(g.add(lastSample.out, g.sin(g.mul(Math.PI * 2, g.memo(g.add(osc1Phase, g.mul(lastSample.out, scaling)))))), .5));

  // store sample to use as modulation
  lastSample.in(osc1);

  // if pwm / square waveform instead of sawtooth...
  if (argumentProps.type === 1) {
    const lastSample2 = g.history(); // for osc 2
    const lastSampleMaster = g.history(); // for sum of osc1,osc2

    const osc2 = g.mul(g.add(lastSample2.out, g.sin(g.mul(Math.PI * 2, g.memo(g.add(osc1Phase, g.mul(lastSample2.out, scaling), pulsewidth))))), .5);

    lastSample2.in(osc2);
    out = g.memo(g.sub(lastSample.out, lastSample2.out));
    out = g.memo(g.add(g.mul(2.5, out), g.mul(-1.5, lastSampleMaster.out)));

    lastSampleMaster.in(g.sub(osc1, osc2));
  } else {
    // offset and normalize
    osc1 = g.add(g.mul(2.5, osc1), g.mul(-1.5, lastSample.out));
    osc1 = g.add(osc1, DC);

    out = osc1;
  }

  return g.mul(out, norm);
};

module.exports = feedbackOsc;

},{"genish.js":114}],61:[function(require,module,exports){
const g = require('genish.js'),
      ugen = require('../ugen.js')(),
      feedbackOsc = require('./fmfeedbackosc.js'),
      polyBlep = require('./polyblep.dsp.js');

//  __makeOscillator__( type, frequency, antialias ) {

module.exports = function (Gibberish) {
  let Oscillators = {
    export(obj) {
      for (let key in Oscillators) {
        if (key !== 'export') {
          obj[key] = Oscillators[key];
        }
      }
    },

    genish: {
      Brown: require('./brownnoise.dsp.js'),
      Pink: require('./pinknoise.dsp.js')
    },

    Wavetable: require('./wavetable.js')(Gibberish),

    Square(inputProps) {
      const sqr = Object.create(ugen);
      const props = Object.assign({ antialias: false }, Oscillators.defaults, inputProps);
      const osc = Oscillators.factory('square', g.in('frequency'), props.antialias);
      const graph = g.mul(osc, g.in('gain'));

      const out = Gibberish.factory(sqr, graph, ['oscillators', 'square'], props);

      return out;
    },

    Triangle(inputProps) {
      const tri = Object.create(ugen);
      const props = Object.assign({ antialias: false }, Oscillators.defaults, inputProps);
      const osc = Oscillators.factory('triangle', g.in('frequency'), props.antialias);
      const graph = g.mul(osc, g.in('gain'));

      const out = Gibberish.factory(tri, graph, ['oscillators', 'triangle'], props);

      return out;
    },

    PWM(inputProps) {
      const pwm = Object.create(ugen);
      const props = Object.assign({ antialias: false, pulsewidth: .25 }, Oscillators.defaults, inputProps);
      const osc = Oscillators.factory('pwm', g.in('frequency'), props.antialias);
      const graph = g.mul(osc, g.in('gain'));

      const out = Gibberish.factory(pwm, graph, ['oscillators', 'PWM'], props);

      return out;
    },

    Sine(inputProps) {
      const sine = Object.create(ugen);
      const props = Object.assign({}, Oscillators.defaults, inputProps);
      const graph = g.mul(g.cycle(g.in('frequency')), g.in('gain'));

      const out = Gibberish.factory(sine, graph, ['oscillators', 'sine'], props);

      return out;
    },

    Noise(inputProps) {
      const noise = Object.create(ugen);
      const props = Object.assign({}, { gain: 1, color: 'white' }, inputProps);
      let graph;

      switch (props.color) {
        case 'brown':
          graph = g.mul(Oscillators.genish.Brown(), g.in('gain'));
          break;
        case 'pink':
          graph = g.mul(Oscillators.genish.Pink(), g.in('gain'));
          break;
        default:
          graph = g.mul(g.noise(), g.in('gain'));
          break;
      }

      const out = Gibberish.factory(noise, graph, ['oscillators', 'noise'], props);

      return out;
    },

    Saw(inputProps) {
      const saw = Object.create(ugen);
      const props = Object.assign({ antialias: false }, Oscillators.defaults, inputProps);
      const osc = Oscillators.factory('saw', g.in('frequency'), props.antialias);
      const graph = g.mul(osc, g.in('gain'));

      const out = Gibberish.factory(saw, graph, ['oscillators', 'saw'], props);

      return out;
    },

    ReverseSaw(inputProps) {
      const saw = Object.create(ugen);
      const props = Object.assign({ antialias: false }, Oscillators.defaults, inputProps);
      const osc = g.sub(1, Oscillators.factory('saw', g.in('frequency'), props.antialias));
      const graph = g.mul(osc, g.in('gain'));

      const out = Gibberish.factory(saw, graph, ['oscillators', 'ReverseSaw'], props);

      return out;
    },

    factory(type, frequency, antialias = false) {
      let osc;

      switch (type) {
        case 'pwm':
          let pulsewidth = g.in('pulsewidth');
          if (antialias == true) {
            osc = feedbackOsc(frequency, 1, pulsewidth, { type: 1 });
          } else {
            let phase = g.phasor(frequency, 0, { min: 0 });
            osc = g.lt(phase, pulsewidth);
          }
          break;
        case 'saw':
          if (antialias == false) {
            osc = g.phasor(frequency);
          } else {
            osc = polyBlep(frequency, { type });
          }
          break;
        case 'sine':
          osc = g.cycle(frequency);
          break;
        case 'square':
          if (antialias === true) {
            //osc = feedbackOsc( frequency, 1, .5, { type:1 })
            osc = polyBlep(frequency, { type });
          } else {
            osc = g.wavetable(frequency, { buffer: Oscillators.Square.buffer, name: 'square' });
          }
          break;
        case 'triangle':
          if (antialias == true) {
            osc = polyBlep(frequency, { type });
          } else {
            osc = g.wavetable(frequency, { buffer: Oscillators.Triangle.buffer, name: 'triangle' });
          }
          break;
        case 'noise':
          osc = g.noise();
          break;
      }

      return osc;
    }
  };

  Oscillators.Square.buffer = new Float32Array(1024);

  for (let i = 1023; i >= 0; i--) {
    Oscillators.Square.buffer[i] = i / 1024 > .5 ? 1 : -1;
  }

  Oscillators.Triangle.buffer = new Float32Array(1024);

  for (let i = 1024; i--; i = i) {
    Oscillators.Triangle.buffer[i] = 1 - 4 * Math.abs((i / 1024 + 0.25) % 1 - 0.5);
  }

  Oscillators.defaults = {
    frequency: 440,
    gain: 1
  };

  return Oscillators;
};

},{"../ugen.js":69,"./brownnoise.dsp.js":59,"./fmfeedbackosc.js":60,"./pinknoise.dsp.js":62,"./polyblep.dsp.js":63,"./wavetable.js":64,"genish.js":114}],62:[function(require,module,exports){
const genish = require('genish.js'),
      ssd = genish.history,
      data = genish.data,
      noise = genish.noise;

module.exports = function () {
  "use jsdsp";

  const b = data(8, 1, { meta: true });
  const white = genish.sub(genish.mul(noise(), 2), 1);

  b[0] = genish.add(genish.mul(.99886, b[0]), genish.mul(white, .0555179));
  b[1] = genish.add(genish.mul(.99332, b[1]), genish.mul(white, .0750579));
  b[2] = genish.add(genish.mul(.96900, b[2]), genish.mul(white, .1538520));
  b[3] = genish.add(genish.mul(.88650, b[3]), genish.mul(white, .3104856));
  b[4] = genish.add(genish.mul(.55000, b[4]), genish.mul(white, .5329522));
  b[5] = genish.sub(genish.mul(-.7616, b[5]), genish.mul(white, .0168980));

  const out = genish.mul(genish.add(genish.add(genish.add(genish.add(genish.add(genish.add(genish.add(b[0], b[1]), b[2]), b[3]), b[4]), b[5]), b[6]), genish.mul(white, .5362)), .11);

  b[6] = genish.mul(white, .115926);

  return out;
};

},{"genish.js":114}],63:[function(require,module,exports){
const genish = require('genish.js');
const g = genish;

// based on http://www.martin-finke.de/blog/articles/audio-plugins-018-polyblep-oscillator/
const polyBlep = function (__frequency, argumentProps) {
  'use jsdsp';

  if (argumentProps === undefined) argumentProps = { type: 'saw' };

  const mem = g.history(0);
  const type = argumentProps.type;
  const frequency = __frequency === undefined ? 220 : __frequency;
  const dt = genish.div(frequency, g.gen.samplerate);

  const t = g.accum(dt, 0, { min: 0 });
  let osc;

  // triangle waves are integrated square waves, so the below case accomodates both types
  if (type === 'triangle' || type === 'square') {
    // lt NOT gt to get correct phase
    osc = genish.sub(genish.mul(2, g.lt(t, .5)), 1);
  } else {
    osc = genish.sub(genish.mul(2, t), 1);
  }
  const case1 = g.lt(t, dt);
  const case2 = g.gt(t, genish.sub(1, dt));
  const adjustedT = g.switch(case1, genish.div(t, dt), g.switch(case2, genish.div(genish.sub(t, 1), dt), t));

  // if/elseif/else with nested ternary operators
  const blep = g.switch(case1, genish.sub(genish.sub(genish.add(adjustedT, adjustedT), genish.mul(adjustedT, adjustedT)), 1), g.switch(case2, genish.add(genish.add(genish.add(genish.mul(adjustedT, adjustedT), adjustedT), adjustedT), 1),
  // final else case is 0
  0));

  // triangle waves are integrated square waves, so the below case accomodates both types
  if (type !== 'saw') {
    osc = genish.add(osc, blep);
    const t_2 = g.memo(g.mod(genish.add(t, .5), 1));
    const case1_2 = g.lt(t_2, dt);
    const case2_2 = g.gt(t_2, genish.sub(1, dt));
    const adjustedT_2 = g.switch(case1_2, genish.div(t_2, dt), g.switch(case2_2, genish.div(genish.sub(t_2, 1), dt), t_2));

    const blep2 = g.switch(case1_2, genish.sub(genish.sub(genish.add(adjustedT_2, adjustedT_2), genish.mul(adjustedT_2, adjustedT_2)), 1), g.switch(case2_2, genish.add(genish.add(genish.add(genish.mul(adjustedT_2, adjustedT_2), adjustedT_2), adjustedT_2), 1), 0));
    osc = genish.sub(osc, blep2);

    // leaky integrator to create triangle from square wave
    if (type === 'triangle') {
      osc = genish.add(genish.mul(dt, osc), genish.mul(genish.sub(1, dt), mem.out));
      mem.in(osc);
    }
  } else {
    osc = genish.sub(osc, blep);
  }

  return osc;
};

module.exports = polyBlep;

},{"genish.js":114}],64:[function(require,module,exports){
let g = require('genish.js'),
    ugen = require('../ugen.js')();

module.exports = function (Gibberish) {

  const Wavetable = function (inputProps) {
    const wavetable = Object.create(ugen);
    const props = Object.assign({}, Gibberish.oscillators.defaults, inputProps);
    const osc = g.wavetable(g.in('frequency'), props);
    const graph = g.mul(osc, g.in('gain'));

    Gibberish.factory(wavetable, graph, 'wavetable', props);

    return wavetable;
  };

  g.wavetable = function (frequency, props) {
    let dataProps = { immutable: true

      // use global references if applicable
    };if (props.name !== undefined) dataProps.global = props.name;

    const buffer = g.data(props.buffer, 1, dataProps);

    return g.peek(buffer, g.phasor(frequency, 0, { min: 0 }));
  };

  return Wavetable;
};

},{"../ugen.js":69,"genish.js":114}],65:[function(require,module,exports){
const Queue = require('../external/priorityqueue.js');

let Gibberish = null;

const Scheduler = {
  phase: 0,

  queue: new Queue((a, b) => {
    if (a.time === b.time) {
      return a.priority < b.priority ? -1 : a.priority > b.priority ? 1 : 0;
    } else {
      return a.time - b.time; //a.time.minus( b.time )
    }
  }),

  init(__Gibberish) {
    Gibberish = __Gibberish;
  },

  clear() {
    this.queue.data.length = 0;
    this.queue.length = 0;
  },

  add(time, func, priority = 0) {
    time += this.phase;

    this.queue.push({ time, func, priority });
  },

  tick(usingSync = false) {
    if (this.shouldSync === usingSync) {
      if (this.queue.length) {
        let next = this.queue.peek();

        if (isNaN(next.time)) {
          this.queue.pop();
        }

        while (this.phase >= next.time) {
          next.func(next.priority);
          this.queue.pop();
          next = this.queue.peek();

          // XXX this happens when calling sequencer.stop()... why?
          if (next === undefined) break;
        }
      }

      this.phase++;
    }
  },

  advance(amt) {
    this.phase += amt;
    this.tick(true);
  }
};

let shouldSync = false;
Object.defineProperty(Scheduler, 'shouldSync', {
  get() {
    return shouldSync;
  },
  set(v) {
    shouldSync = v;
    if (Gibberish.mode === 'worklet') {
      Gibberish.worklet.port.postMessage({
        address: 'eval',
        code: 'Gibberish.scheduler.shouldSync = ' + v
      });
    }
  }
});

module.exports = Scheduler;

},{"../external/priorityqueue.js":10}],66:[function(require,module,exports){
const g = require('genish.js'),
      __proxy = require('../workletProxy.js'),
      ugen = require('../ugen.js')();

module.exports = function (Gibberish) {
  const __proto__ = Object.create(ugen);

  const proxy = __proxy(Gibberish);

  Object.assign(__proto__, {
    start(delay = 0) {
      if (delay !== 0) {
        Gibberish.scheduler.add(delay, () => {
          Gibberish.analyzers.push(this);
          Gibberish.dirty(Gibberish.analyzers);
        });
      } else {
        Gibberish.analyzers.push(this);
        Gibberish.dirty(Gibberish.analyzers);
      }
      return this;
    },
    stop(delay = 0) {
      const idx = Gibberish.analyzers.indexOf(this);
      if (delay === 0) {
        if (idx > -1) {
          Gibberish.analyzers.splice(idx, 1);
          Gibberish.dirty(Gibberish.analyzers);
        }
        this.phase = 0;
        this.nextTime = 0;
      } else {
        Gibberish.scheduler.add(delay, () => {
          if (idx > -1) {
            Gibberish.analyzers.splice(idx, 1);
            Gibberish.dirty(Gibberish.analyzers);
          }
          this.phase = 0;
          this.nextTime = 0;
        });
      }

      return this;
    },
    fire() {
      let value = typeof this.values === 'function' ? this.values : this.values[this.__valuesPhase++ % this.values.length];
      if (typeof value === 'function' && this.target === undefined) {
        value();
      } else if (typeof this.target[this.key] === 'function') {
        if (typeof value === 'function') {
          value = value();
        }
        if (value !== this.DNR) {
          this.target[this.key](value);
        }
      } else {
        if (typeof value === 'function') value = value();
        if (value !== this.DNR) this.target[this.key] = value;
      }
    }
  });

  // XXX we need to implement priority, which will in turn determine the order
  // that the sequencers are added to the callback function.
  const Seq2 = {
    create(inputProps) {
      const seq = Object.create(__proto__),
            properties = Object.assign({}, Seq2.defaults, inputProps);

      seq.phase = 0;
      seq.inputNames = ['rate', 'density'];
      seq.inputs = [1, 1];
      seq.nextTime = 0;
      seq.__valuesPhase = 0;
      seq.__timingsPhase = 0;
      seq.id = Gibberish.factory.getUID();
      seq.dirty = true;
      seq.type = 'seq';
      seq.__addresses__ = {};
      seq.DNR = -987654321;

      properties.id = Gibberish.factory.getUID();

      Object.assign(seq, properties);
      seq.__properties__ = properties;

      // support for sequences that are triggered via other means,
      // in Gibber this is when you provide timing to one sequence
      // on an object and want to use that one pattern to trigger
      // multiple sequences.
      if (seq.timings === null) {
        seq.nextTime = Infinity;
      }

      // XXX this needs to be optimized as much as humanly possible, since it's running at audio rate...
      seq.callback = function (rate, density) {
        while (seq.phase >= seq.nextTime) {
          let value = typeof seq.values === 'function' ? seq.values : seq.values[seq.__valuesPhase++ % seq.values.length],
              shouldRun = true;

          let timing = null;
          if (seq.timings !== null && seq.timings !== undefined) {
            timing = typeof seq.timings === 'function' ? seq.timings : seq.timings[seq.__timingsPhase++ % seq.timings.length];
            if (typeof timing === 'function') timing = timing();
          }

          let shouldIncreaseSpeed = density <= 1 ? false : true;

          // XXX this supports an edge case in Gibber, where patterns like Euclid / Hex return
          // objects indicating both whether or not they should should trigger values as well
          // as the next time they should run. perhaps this could be made more generalizable?
          if (timing !== null && typeof timing === 'object') {
            if (timing.shouldExecute === 1) {
              shouldRun = true;
            } else {
              shouldRun = false;
            }
            timing = timing.time;
          } else if (timing !== null) {
            if (Math.random() >= density) shouldRun = false;
          }

          if (shouldRun) {
            if (seq.mainthreadonly !== undefined) {
              if (typeof value === 'function') {
                value = value();
              }
              Gibberish.processor.messages.push(seq.mainthreadonly, seq.key, value);
            } else if (typeof value === 'function' && seq.target === undefined) {
              value();
            } else if (typeof seq.target[seq.key] === 'function') {
              if (typeof value === 'function') {
                value = value();
              }
              if (value !== seq.DNR) {
                seq.target[seq.key](value);
              }
            } else {
              if (typeof value === 'function') value = value();
              if (value !== seq.DNR) seq.target[seq.key] = value;
            }
          }

          if (timing === null) return;

          seq.phase -= seq.nextTime;

          if (shouldIncreaseSpeed) {
            timing = Math.random() > 2 - density ? timing / 2 : timing;
          }
          seq.nextTime = timing;
        }

        seq.phase += rate;

        return 0;
      };

      seq.ugenName = seq.callback.ugenName = 'seq_' + seq.id;

      // since we're not passing our sequencer through the ugen template, we need
      // to grab a memory address for its rate so it can be sequenced and define
      // a property that manipulates that memory address.
      const idx = Gibberish.memory.alloc(1);
      Gibberish.memory.heap[idx] = seq.rate;
      seq.__addresses__.rate = idx;

      let value = seq.rate;
      Object.defineProperty(seq, 'rate', {
        get() {
          return value;
        },
        set(v) {
          if (value !== v) {
            if (typeof v === 'number') Gibberish.memory.heap[idx] = v;

            Gibberish.dirty(Gibberish.analyzers);
            value = v;
          }
        }
      });

      const didx = Gibberish.memory.alloc(1);
      Gibberish.memory.heap[didx] = seq.density;
      seq.__addresses__.density = didx;

      let dvalue = seq.density;
      Object.defineProperty(seq, 'density', {
        get() {
          return dvalue;
        },
        set(v) {
          if (dvalue !== v) {
            if (typeof v === 'number') Gibberish.memory.heap[didx] = v;

            Gibberish.dirty(Gibberish.analyzers);
            dvalue = v;
          }
        }
      });

      if (Gibberish.mode === 'worklet') {
        Gibberish.utilities.createPubSub(seq);
      }

      return proxy(['Sequencer2'], properties, seq);
    }
  };

  Seq2.defaults = { rate: 1, density: 1, priority: 0, phase: 0 };
  Seq2.create.DO_NOT_OUTPUT = -987654321;

  return Seq2.create;
};

},{"../ugen.js":69,"../workletProxy.js":71,"genish.js":114}],67:[function(require,module,exports){
const __proxy = require('../workletProxy.js');

module.exports = function (Gibberish) {

  const proxy = __proxy(Gibberish);

  const Sequencer = props => {
    let __seq;
    const seq = {
      __isRunning: false,

      __valuesPhase: 0,
      __timingsPhase: 0,
      __type: 'seq',
      __onlyRunsOnce: false,
      __repeatCount: null,

      tick(priority) {
        let value = typeof seq.values === 'function' ? seq.values : seq.values[seq.__valuesPhase++ % seq.values.length],
            timing = typeof seq.timings === 'function' ? seq.timings : seq.timings[seq.__timingsPhase++ % seq.timings.length],
            shouldRun = true;

        if (seq.__onlyRunsOnce === true) {
          if (seq.__valuesPhase === seq.values.length) {
            seq.stop();
          }
        } else if (seq.__repeatCount !== null) {
          if (seq.__valuesPhase % seq.values.length === 0) {
            seq.__repeatCount--;
            if (seq.__repeatCount === 0) {
              seq.stop();
              seq.__repeatCount = null;
            }
          }
        }

        if (typeof timing === 'function') timing = timing();

        // XXX this supports an edge case in Gibber, where patterns like Euclid / Hex return
        // objects indicating both whether or not they should should trigger values as well
        // as the next time they should run. perhaps this could be made more generalizable?
        if (typeof timing === 'object') {
          if (timing.shouldExecute === 1) {
            shouldRun = true;
          } else {
            shouldRun = false;
          }
          timing = timing.time;
        }

        timing *= seq.rate;

        if (shouldRun) {
          if (seq.mainthreadonly !== undefined) {
            if (typeof value === 'function') {
              value = value();
            }
            Gibberish.processor.messages.push(seq.mainthreadonly, seq.key, value);
          } else if (typeof value === 'function' && seq.target === undefined) {
            value();
          } else if (typeof seq.target[seq.key] === 'function') {
            if (typeof value === 'function') value = value();
            seq.target[seq.key](value);
          } else {
            if (typeof value === 'function') value = value();
            seq.target[seq.key] = value;
          }

          if (seq.reportOutput === true) {
            Gibberish.processor.port.postMessage({
              address: '__sequencer',
              id: seq.id,
              name: 'output',
              value,
              phase: seq.__valuesPhase,
              length: seq.values.length
            });
          }
        }

        if (Gibberish.mode === 'processor') {
          if (seq.__isRunning === true && !isNaN(timing)) {
            Gibberish.scheduler.add(timing, seq.tick, seq.priority);
          }
        }
      },

      start(delay = 0) {
        seq.__isRunning = true;
        if (Gibberish.mode === 'processor') {
          Gibberish.scheduler.add(delay, priority => {
            seq.tick(priority);
            Gibberish.processor.port.postMessage({
              address: '__sequencer',
              id: seq.id,
              name: 'start'
            });
          }, seq.priority);
        }
        return __seq;
      },

      stop(delay = null) {
        if (delay === null) {
          seq.__isRunning = false;

          if (Gibberish.mode === 'processor') {
            Gibberish.processor.port.postMessage({
              address: '__sequencer',
              id: seq.id,
              name: 'stop'
            });
          }
        } else {
          Gibberish.scheduler.add(delay, seq.stop);
        }
        return __seq;
      },

      once() {
        seq.__onlyRunsOnce = true;
        return __seq;
      },

      repeat(repeatCount = 2) {
        seq.__repeatCount = repeatCount;
        return __seq;
      }
    };

    props.id = Gibberish.factory.getUID();

    if (Gibberish.mode === 'worklet') {
      Gibberish.utilities.createPubSub(seq);
    }
    // need a separate reference to the properties for worklet meta-programming
    const properties = Object.assign({}, Sequencer.defaults, props);
    Object.assign(seq, properties);
    seq.__properties__ = properties;

    __seq = proxy(['Sequencer'], properties, seq);

    return __seq;
  };

  Sequencer.defaults = { priority: 100000, values: [], timings: [], rate: 1, reportOutput: false };

  Sequencer.make = function (values, timings, target, key, priority, reportOutput) {
    return Sequencer({ values, timings, target, key, priority, reportOutput });
  };

  return Sequencer;
};

},{"../workletProxy.js":71}],68:[function(require,module,exports){
const __proxy = require('../workletProxy.js');
const Pattern = require('tidal.pegjs');

module.exports = function (Gibberish) {

  const proxy = __proxy(Gibberish);

  const Sequencer = props => {
    let __seq;
    const seq = {
      __isRunning: false,

      __phase: 0,
      __type: 'seq',
      __pattern: Pattern(props.pattern, { addLocations: true, addUID: true, enclose: true }),
      __events: null,

      tick(priority) {
        // running for first time, perform a query
        if (seq.__events === null || seq.__events.length === 0) {
          seq.__events = seq.__pattern.query(seq.__phase++, 1);
        }

        // used when scheduling events that are very far apart
        if (seq.__events.length <= 0) {
          if (Gibberish.mode === 'processor') {
            if (seq.__isRunning === true) {
              Gibberish.scheduler.add(Gibberish.ctx.sampleRate / Sequencer.clock.cps, seq.tick, seq.priority);
            }
          }

          return;
        }

        const startTime = seq.__events[0].arc.start;

        if (seq.key !== 'chord') {
          while (seq.__events.length > 0 && startTime.valueOf() === seq.__events[0].arc.start.valueOf()) {
            let event = seq.__events.shift(),
                value = event.value,
                uid = event.uid;

            // for bjorklund etc.
            if (typeof value === 'object') value = value.value;

            if (seq.filters !== null) value = seq.filters.reduce((currentValue, filter) => filter(currentValue, seq, uid), value);
            if (seq.mainthreadonly !== undefined) {
              if (typeof value === 'function') {
                value = value();
              }
              Gibberish.processor.messages.push(seq.mainthreadonly, seq.key, value);
            } else if (typeof seq.target[seq.key] === 'function') {
              seq.target[seq.key](value);
            } else {
              seq.target[seq.key] = value;
            }
          }
        } else {
          let value = seq.__events.filter(evt => startTime.valueOf() === evt.arc.start.valueOf()).map(evt => evt.value);
          let uid = seq.__events[0].uid;

          const events = seq.__events.splice(0, value.length);

          if (seq.filters !== null) {
            if (value.length === 1) {
              value = seq.filters.reduce((currentValue, filter) => filter(currentValue, seq, uid), value);
            } else {
              value.forEach((v, i) => seq.filters.reduce((currentValue, filter) => filter(currentValue, seq, events[i].uid), v));
            }
          }

          if (typeof seq.target[seq.key] === 'function') {
            seq.target[seq.key](value);
          } else {
            seq.target[seq.key] = value;
          }
        }

        if (Gibberish.mode === 'processor') {
          let timing;
          if (seq.__events.length <= 0) {
            let time = 0;
            while (seq.__events.length <= 0) {
              seq.__events = seq.__pattern.query(seq.__phase++, 1);
              time++;
            }
            //seq.__events.forEach( evt => {
            //  evt.arc.start = evt.arc.start.add( 1 ).sub( startTime ) 
            //  evt.arc.end   = evt.arc.end.add( 1 ).sub( startTime )
            //})

            timing = time - startTime.valueOf();
          } else {
            timing = seq.__events[0].arc.start.sub(startTime).valueOf();
          }

          timing *= Math.ceil(Gibberish.ctx.sampleRate / Sequencer.clock.cps) + 1;

          if (seq.__isRunning === true && !isNaN(timing) && timing > 0) {
            // XXX this supports an edge case in Gibber, where patterns like Euclid / Hex return
            // objects indicating both whether or not they should should trigger values as well
            // as the next time they should run. perhaps this could be made more generalizable?

            //if( typeof timing === 'object' ) {
            //  if( timing.shouldExecute === 1 ) {
            //    shouldRun = true
            //  }else{
            //    shouldRun = false
            //  }
            //  timing = timing.time 
            //}

            //timing *= seq.rate

            Gibberish.scheduler.add(timing, seq.tick, seq.priority);
          }
        }
      },

      rotate(amt) {
        seq.__phase += amt;
        return __seq;
      },

      start(delay = 0) {
        seq.__isRunning = true;
        Gibberish.scheduler.add(delay, seq.tick, seq.priority);
        return __seq;
      },

      stop() {
        seq.__isRunning = false;
        return __seq;
      }
    };

    props.id = Gibberish.factory.getUID();

    // need a separate reference to the properties for worklet meta-programming
    const properties = Object.assign({}, Sequencer.defaults, props);
    Object.assign(seq, properties);
    seq.__properties__ = properties;

    __seq = proxy(['Tidal'], properties, seq);

    return __seq;
  };

  Sequencer.defaults = { priority: 100000, pattern: '', rate: 1, filters: null };

  Sequencer.make = function (values, timings, target, key, priority) {
    return Sequencer({ values, timings, target, key, priority });
  };

  let __uid = 0;
  Sequencer.getUID = () => {
    return __uid++;
  };

  Sequencer.clock = { cps: 1 };

  Sequencer.id = Gibberish.utilities.getUID();

  if (Gibberish.mode === 'worklet') {
    Gibberish.worklet.port.postMessage({
      address: 'eval',
      code: `Gibberish.Tidal.clock.id = ${Sequencer.id}; Gibberish.ugens.set( ${Sequencer.id}, Gibberish.Tidal.clock )`
    });

    let cps = 1;
    Object.defineProperty(Sequencer, 'cps', {
      get() {
        return cps;
      },
      set(v) {
        cps = v;
        if (Gibberish.mode === 'worklet') {
          Gibberish.worklet.port.postMessage({
            address: 'set',
            object: Sequencer.id,
            name: 'cps',
            value: cps
          });
        }
      }
    });
  }

  return Sequencer;
};

},{"../workletProxy.js":71,"tidal.pegjs":165}],69:[function(require,module,exports){
let Gibberish = null;

const __ugen = function (__Gibberish) {
  if (__Gibberish !== undefined && Gibberish == null) Gibberish = __Gibberish;

  const replace = obj => {
    if (typeof obj === 'object') {
      if (obj.id !== undefined) {
        return processor.ugens.get(obj.id);
      }
    }

    return obj;
  };

  const ugen = {
    __Gibberish: Gibberish,

    free: function () {
      Gibberish.genish.gen.free(this.graph);
    },

    print: function () {
      console.log(this.callback.toString());
    },

    connect: function (target, level = 1) {
      if (this.connected === undefined) this.connected = [];

      //let input = level === 1 ? this : Gibberish.binops.Mul( this, level )
      let input = this;

      if (target === undefined || target === null) target = Gibberish.output;

      // XXX I forgot, where is __addInput found? Can we control the
      // level of the input?
      if (typeof target.__addInput == 'function') {
        target.__addInput(input);
      } else if (target.sum && target.sum.inputs) {
        target.sum.inputs.push(input);
      } else if (target.inputs) {
        const idx = target.inputs.indexOf(input);

        // if no connection exists...
        if (idx === -1) {
          target.inputs.unshift(input, level, input.isStereo);
        } else {
          // ... otherwise update the connection's level, which is stored
          // one index higher in the input list.
          target.inputs[idx + 1] = level;
        }
      } else {
        target.input = input;
        target.inputGain = level;
      }

      Gibberish.dirty(target);

      this.connected.push([target, input, level]);

      return this;
    },

    disconnect: function (target) {
      if (target === undefined) {
        if (Array.isArray(this.connected)) {
          for (let connection of this.connected) {
            if (connection[0].disconnectUgen !== undefined) {
              connection[0].disconnectUgen(connection[1]);
            } else if (connection[0].input === this) {
              connection[0].input = 0;
            }
          }
          this.connected.length = 0;
        }
      } else {
        const connection = this.connected.find(v => v[0] === target);
        // if target is a bus...
        if (target.disconnectUgen !== undefined) {
          if (connection !== undefined) {
            target.disconnectUgen(connection[1]);
          }
        } else {
          // must be an effect, set input to 0
          target.input = 0;
        }

        const targetIdx = this.connected.indexOf(connection);

        if (targetIdx !== -1) {
          this.connected.splice(targetIdx, 1);
        }
      }
    },

    chain: function (target, level = 1) {
      this.connect(target, level);

      return target;
    },

    __redoGraph: function () {
      let isStereo = this.isStereo;
      this.__createGraph();
      this.callback = Gibberish.genish.gen.createCallback(this.graph, Gibberish.memory, false, true);
      this.inputNames = new Set(Gibberish.genish.gen.parameters);
      this.callback.ugenName = this.ugenName;
      Gibberish.dirty(this);

      // if channel count has changed after recompiling graph...
      if (isStereo !== this.isStereo) {

        // check for any connections before iterating...
        if (this.connected === undefined) return;
        // loop through all busses the ugen is connected to
        for (let connection of this.connected) {
          // set the dirty flag of the bus
          Gibberish.dirty(connection[0]);

          // check for inputs array, which indicates connection is to a bus
          if (connection[0].inputs !== undefined) {
            // find the input in the busses 'inputs' array
            const inputIdx = connection[0].inputs.indexOf(connection[1]);

            // assumiing it is found...
            if (inputIdx !== -1) {
              // change stereo field
              connection[0].inputs[inputIdx + 2] = this.isStereo;
            }
          } else if (connection[0].input !== undefined) {
            if (connection[0].__redoGraph !== undefined) {
              connection[0].__redoGraph();
            }
          }
        }
      }
    }
  };

  return ugen;
};

module.exports = __ugen;

},{}],70:[function(require,module,exports){
const genish = require('genish.js'),
      AWPF = require('./external/audioworklet-polyfill.js');

module.exports = function (Gibberish) {

  let uid = 0;
  const utilities = {
    Make: function (props) {
      const name = props.name || 'Ugen' + Math.floor(Math.random() * 10000);
      const type = props.type || 'Ugen';
      const properties = props.properties || {};
      const block = `
    const ugen = Object.create( Gibberish.prototypes[ '${type}' ] )
    const graphfnc = ${props.constructor.toString()}

    const proxy = Gibberish.factory( ugen, graphfnc(), '${name}', ${JSON.stringify(properties)} )
    if( typeof props === 'object' ) Object.assign( proxy, props )

    return proxy`;

      Gibberish[name] = new Function('props', block);

      Gibberish.worklet.port.postMessage({
        name,
        address: 'addConstructor',
        constructorString: `function( Gibberish ) {
      const fnc = ${Gibberish[name].toString()}

      return fnc
    }`
      });

      return Gibberish[name];
    },

    createContext(ctx, cb, resolve, bufferSize = 2048) {
      let AC = typeof AudioContext === 'undefined' ? webkitAudioContext : AudioContext;

      AWPF(window, bufferSize);

      const start = () => {
        if (typeof AC !== 'undefined') {
          this.ctx = Gibberish.ctx = ctx === undefined ? new AC({ latencyHint: .025 }) : ctx;

          genish.gen.samplerate = this.ctx.sampleRate;
          genish.utilities.ctx = this.ctx;

          if (document && document.documentElement && 'ontouchstart' in document.documentElement) {
            window.removeEventListener('touchstart', start);
          } else {
            window.removeEventListener('mousedown', start);
            window.removeEventListener('keydown', start);
          }

          const mySource = utilities.ctx.createBufferSource();
          mySource.connect(utilities.ctx.destination);
          mySource.start();
        }

        if (typeof cb === 'function') cb(resolve);
      };

      if (document && document.documentElement && 'ontouchstart' in document.documentElement) {
        window.addEventListener('touchstart', start);
      } else {
        window.addEventListener('mousedown', start);
        window.addEventListener('keydown', start);
      }

      return Gibberish.ctx;
    },

    createWorklet(resolve) {
      Gibberish.ctx.audioWorklet.addModule(Gibberish.workletPath).then(() => {
        Gibberish.worklet = new AudioWorkletNode(Gibberish.ctx, 'gibberish', { outputChannelCount: [2] });

        Gibberish.worklet.connect(Gibberish.ctx.destination);
        Gibberish.worklet.port.onmessage = event => {
          Gibberish.utilities.workletHandlers[event.data.address](event);
        };
        Gibberish.worklet.ugens = new Map();

        resolve();
      });
    },

    future(fnc, time, dict) {
      const keys = Object.keys(dict);
      const code = `
      const fnc = ${fnc.toString()}
      const args = [${keys.map(key => dict[key].id).join(',')}]
      const objs = args.map( v => Gibberish.processor.ugens.get(v) )
      Gibberish.scheduler.add( ${time}, ()=> fnc( ...objs ), 1 )
    `;
      Gibberish.worklet.port.postMessage({
        address: 'eval',
        code
      });
    },

    workletHandlers: {
      __sequencer(event) {
        const message = event.data;
        const id = message.id;
        const eventName = message.name;
        const obj = Gibberish.worklet.ugens.get(id);
        if (obj !== undefined) obj.publish(eventName, message);
      },
      callback(event) {
        if (typeof Gibberish.oncallback === 'function') {
          Gibberish.oncallback(event.data.code);
        }
      },
      get(event) {
        let name = event.data.name;
        let value;
        if (name[0] === 'Gibberish') {
          value = Gibberish;
          name.shift();
        }
        for (let segment of name) {
          value = value[segment];
        }

        Gibberish.worklet.port.postMessage({
          address: 'set',
          name: 'Gibberish.' + name.join('.'),
          value
        });
      },
      state(event) {
        const messages = event.data.messages;
        if (messages.length === 0) return;

        // XXX is preventProxy actually used?
        Gibberish.preventProxy = true;
        Gibberish.proxyEnabled = false;

        for (let i = 0; i < messages.length; i += 3) {
          const id = messages[i];
          const propName = messages[i + 1];
          const value = messages[i + 2];
          const obj = Gibberish.worklet.ugens.get(id);

          if (Gibberish.worklet.debug === true) {
            if (propName !== 'output') console.log(propName, value, id);
            console.log(propName, value, id);
          }

          if (obj !== undefined && propName.indexOf('.') === -1 && propName !== 'id') {
            if (obj[propName] !== undefined) {
              if (typeof obj[propName] !== 'function') {
                obj[propName] = value;
              } else {
                obj[propName](value);
              }
            } else {
              obj[propName] = value;
            }
          } else if (obj !== undefined) {
            const propSplit = propName.split('.');
            if (obj[propSplit[0]] !== undefined) {
              if (typeof obj[propSplit[0]][propSplit[1]] !== 'function') {
                obj[propSplit[0]][propSplit[1]] = value;
              } else {
                obj[propSplit[0]][propSplit[1]](value);
              }
            } else {
              //console.log( 'undefined split property!', id, propSplit[0], propSplit[1], value, obj )
            }
          }
          // XXX double check and make sure this isn't getting sent back to processornode...
          // console.log( propName, value, obj )
        }
        Gibberish.preventProxy = false;
        Gibberish.proxyEnabled = true;
      }
    },

    createPubSub(obj) {
      const events = {};
      obj.on = function (key, fcn) {
        if (typeof events[key] === 'undefined') {
          events[key] = [];
        }
        events[key].push(fcn);
        return obj;
      };

      obj.off = function (key, fcn) {
        if (typeof events[key] !== 'undefined') {
          const arr = events[key];

          arr.splice(arr.indexOf(fcn), 1);
        }
        return obj;
      };

      obj.publish = function (key, data) {
        if (typeof events[key] !== 'undefined') {
          const arr = events[key];

          arr.forEach(v => v(data));
        }
        return obj;
      };
    },

    wrap(func, ...args) {
      const out = {
        action: 'wrap',
        value: func,
        // must return objects containing only the id number to avoid
        // creating circular JSON references that would result from passing actual ugens
        args: args.map(v => {
          return { id: v.id };
        })
      };
      return out;
    },

    export(obj) {
      obj.wrap = this.wrap;
      obj.future = this.future;
      obj.Make = this.Make;
    },

    getUID() {
      return uid++;
    }
  };

  return utilities;
};

},{"./external/audioworklet-polyfill.js":9,"genish.js":114}],71:[function(require,module,exports){
const serialize = require('serialize-javascript');

module.exports = function (Gibberish) {

  const replaceObj = function (obj, shouldSerializeFunctions = true) {
    if (typeof obj === 'object' && obj !== null && obj.id !== undefined) {
      if (obj.__type !== 'seq') {
        // XXX why?
        return { id: obj.id, prop: obj.prop };
      } else {
        // shouldn't I be serializing most objects, not just seqs?
        return serialize(obj);
      }
    } else if (typeof obj === 'function' && shouldSerializeFunctions === true) {
      return { isFunc: true, value: serialize(obj) };
    }
    return obj;
  };

  const makeAndSendObject = function (__name, values, obj) {
    const properties = {};

    // object has already been sent through messageport...

    for (let key in values) {
      const alreadyProcessed = typeof values[key] === 'object' && values[key] !== null && values[key].__meta__ !== undefined || typeof values[key] === 'function' && values[key].__meta__ !== undefined;

      if (alreadyProcessed) {
        properties[key] = { id: values[key].__meta__.id };
      } else if (Array.isArray(values[key])) {
        const arr = [];
        for (let i = 0; i < values[key].length; i++) {
          arr[i] = replaceObj(values[key][i], false);
        }
        properties[key] = arr;
      } else if (typeof values[key] === 'object' && values[key] !== null) {
        properties[key] = replaceObj(values[key], false);
      } else {
        properties[key] = values[key];
      }
    }

    let serializedProperties = serialize(properties);

    if (Array.isArray(__name)) {
      const oldName = __name[__name.length - 1];
      __name[__name.length - 1] = oldName[0].toUpperCase() + oldName.substring(1);
    } else {
      __name = [__name[0].toUpperCase() + __name.substring(1)];
    }

    obj.__meta__ = {
      address: 'add',
      name: __name,
      properties: serializedProperties,
      id: obj.id
    };

    Gibberish.worklet.ugens.set(obj.id, obj);

    Gibberish.worklet.port.postMessage(obj.__meta__);
  };

  const doNotProxy = ['connected', 'input', 'callback', 'inputNames', 'on', 'off', 'publish'];

  const __proxy = function (__name, values, obj) {

    if (Gibberish.mode === 'worklet' && Gibberish.preventProxy === false) {
      makeAndSendObject(__name, values, obj);

      // proxy for all method calls to send to worklet
      const proxy = new Proxy(obj, {
        get(target, prop, receiver) {
          if (typeof target[prop] === 'function' && prop.indexOf('__') === -1 && doNotProxy.indexOf(prop) === -1) {
            const proxy = new Proxy(target[prop], {
              apply(__target, thisArg, args) {

                if (Gibberish.proxyEnabled === true) {
                  const __args = args.map(__value => replaceObj(__value, true));

                  Gibberish.worklet.port.postMessage({
                    address: 'method',
                    object: obj.id,
                    name: prop,
                    args: __args
                  });
                }

                const temp = Gibberish.proxyEnabled;
                Gibberish.proxyEnabled = false;
                const out = __target.apply(thisArg, args);
                Gibberish.proxyEnabled = temp;
                return out;
              }
            });

            return proxy;
          }

          return target[prop];
        },
        set(target, prop, value, receiver) {
          if (doNotProxy.indexOf(prop) === -1) {
            if (Gibberish.proxyEnabled === true) {
              const __value = replaceObj(value);

              if (__value !== undefined) {
                Gibberish.worklet.port.postMessage({
                  address: 'set',
                  object: obj.id,
                  name: prop,
                  value: __value
                });
              }
            }
          }

          target[prop] = value;

          // must return true for any ES6 proxy setter
          return true;
        }
      });

      // XXX XXX XXX XXX XXX XXX
      // REMEMBER THAT YOU MUST ASSIGN THE RETURNED VALUE TO YOUR UGEN,
      // YOU CANNOT USE THIS FUNCTION TO MODIFY A UGEN IN PLACE.
      // XXX XXX XXX XXX XXX XXX

      return proxy;
    } else if (Gibberish.mode === 'processor' && Gibberish.preventProxy === false) {

      const proxy = new Proxy(obj, {
        //get( target, prop, receiver ) { return target[ prop ] },
        set(target, prop, value, receiver) {
          let valueType = typeof value;
          if (prop.indexOf('__') === -1 && valueType !== 'function' && valueType !== 'object') {
            if (Gibberish.processor !== undefined) {
              Gibberish.processor.messages.push(obj.id, prop, value);
            }
          }
          target[prop] = value;

          // must return true for any ES6 proxy setter
          return true;
        }
      });

      return proxy;
    }

    return obj;
  };

  return __proxy;
};

},{"serialize-javascript":163}],72:[function(require,module,exports){
function bjorklund(slots, pulses){
  var pattern = [],
      count = [],
      remainder = [pulses],
      divisor = slots - pulses,
      level = 0,
      build_pattern = function(lv){
        if( lv == -1 ){ pattern.push(0); }
        else if( lv == -2 ){ pattern.push(1); }
        else{
          for(var x=0; x<count[lv]; x++){
            build_pattern(lv-1);
          }

          if(remainder[lv]){
            build_pattern(lv-2);
          }
        }
      }
  ;

  while(remainder[level] > 1){
    count.push(Math.floor(divisor/remainder[level]));
    remainder.push(divisor%remainder[level]);
    divisor = remainder[level];
    level++;
  }
  count.push(divisor);

  build_pattern(level);

  return pattern.reverse();
}


module.exports = function(m, k){
  if(m > k) return bjorklund(m, k);
  else return bjorklund(k, m);
};

},{}],73:[function(require,module,exports){

},{}],74:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],75:[function(require,module,exports){
/**
 * @license Fraction.js v4.0.12 09/09/2015
 * http://www.xarg.org/2014/03/rational-numbers-in-javascript/
 *
 * Copyright (c) 2015, Robert Eisele (robert@xarg.org)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 **/


/**
 *
 * This class offers the possibility to calculate fractions.
 * You can pass a fraction in different formats. Either as array, as double, as string or as an integer.
 *
 * Array/Object form
 * [ 0 => <nominator>, 1 => <denominator> ]
 * [ n => <nominator>, d => <denominator> ]
 *
 * Integer form
 * - Single integer value
 *
 * Double form
 * - Single double value
 *
 * String form
 * 123.456 - a simple double
 * 123/456 - a string fraction
 * 123.'456' - a double with repeating decimal places
 * 123.(456) - synonym
 * 123.45'6' - a double with repeating last place
 * 123.45(6) - synonym
 *
 * Example:
 *
 * var f = new Fraction("9.4'31'");
 * f.mul([-4, 3]).div(4.9);
 *
 */

(function(root) {

  "use strict";

  // Maximum search depth for cyclic rational numbers. 2000 should be more than enough.
  // Example: 1/7 = 0.(142857) has 6 repeating decimal places.
  // If MAX_CYCLE_LEN gets reduced, long cycles will not be detected and toString() only gets the first 10 digits
  var MAX_CYCLE_LEN = 2000;

  // Parsed data to avoid calling "new" all the time
  var P = {
    "s": 1,
    "n": 0,
    "d": 1
  };

  function createError(name) {

    function errorConstructor() {
      var temp = Error.apply(this, arguments);
      temp['name'] = this['name'] = name;
      this['stack'] = temp['stack'];
      this['message'] = temp['message'];
    }

    /**
     * Error constructor
     *
     * @constructor
     */
    function IntermediateInheritor() {}
    IntermediateInheritor.prototype = Error.prototype;
    errorConstructor.prototype = new IntermediateInheritor();

    return errorConstructor;
  }

  var DivisionByZero = Fraction['DivisionByZero'] = createError('DivisionByZero');
  var InvalidParameter = Fraction['InvalidParameter'] = createError('InvalidParameter');

  function assign(n, s) {

    if (isNaN(n = parseInt(n, 10))) {
      throwInvalidParam();
    }
    return n * s;
  }

  function throwInvalidParam() {
    throw new InvalidParameter();
  }

  var parse = function(p1, p2) {

    var n = 0, d = 1, s = 1;
    var v = 0, w = 0, x = 0, y = 1, z = 1;

    var A = 0, B = 1;
    var C = 1, D = 1;

    var N = 10000000;
    var M;

    if (p1 === undefined || p1 === null) {
      /* void */
    } else if (p2 !== undefined) {
      n = p1;
      d = p2;
      s = n * d;
    } else
      switch (typeof p1) {

        case "object":
        {
          if ("d" in p1 && "n" in p1) {
            n = p1["n"];
            d = p1["d"];
            if ("s" in p1)
              n *= p1["s"];
          } else if (0 in p1) {
            n = p1[0];
            if (1 in p1)
              d = p1[1];
          } else {
            throwInvalidParam();
          }
          s = n * d;
          break;
        }
        case "number":
        {
          if (p1 < 0) {
            s = p1;
            p1 = -p1;
          }

          if (p1 % 1 === 0) {
            n = p1;
          } else if (p1 > 0) { // check for != 0, scale would become NaN (log(0)), which converges really slow

            if (p1 >= 1) {
              z = Math.pow(10, Math.floor(1 + Math.log(p1) / Math.LN10));
              p1 /= z;
            }

            // Using Farey Sequences
            // http://www.johndcook.com/blog/2010/10/20/best-rational-approximation/

            while (B <= N && D <= N) {
              M = (A + C) / (B + D);

              if (p1 === M) {
                if (B + D <= N) {
                  n = A + C;
                  d = B + D;
                } else if (D > B) {
                  n = C;
                  d = D;
                } else {
                  n = A;
                  d = B;
                }
                break;

              } else {

                if (p1 > M) {
                  A += C;
                  B += D;
                } else {
                  C += A;
                  D += B;
                }

                if (B > N) {
                  n = C;
                  d = D;
                } else {
                  n = A;
                  d = B;
                }
              }
            }
            n *= z;
          } else if (isNaN(p1) || isNaN(p2)) {
            d = n = NaN;
          }
          break;
        }
        case "string":
        {
          B = p1.match(/\d+|./g);

          if (B === null)
            throwInvalidParam();

          if (B[A] === '-') {// Check for minus sign at the beginning
            s = -1;
            A++;
          } else if (B[A] === '+') {// Check for plus sign at the beginning
            A++;
          }

          if (B.length === A + 1) { // Check if it's just a simple number "1234"
            w = assign(B[A++], s);
          } else if (B[A + 1] === '.' || B[A] === '.') { // Check if it's a decimal number

            if (B[A] !== '.') { // Handle 0.5 and .5
              v = assign(B[A++], s);
            }
            A++;

            // Check for decimal places
            if (A + 1 === B.length || B[A + 1] === '(' && B[A + 3] === ')' || B[A + 1] === "'" && B[A + 3] === "'") {
              w = assign(B[A], s);
              y = Math.pow(10, B[A].length);
              A++;
            }

            // Check for repeating places
            if (B[A] === '(' && B[A + 2] === ')' || B[A] === "'" && B[A + 2] === "'") {
              x = assign(B[A + 1], s);
              z = Math.pow(10, B[A + 1].length) - 1;
              A += 3;
            }

          } else if (B[A + 1] === '/' || B[A + 1] === ':') { // Check for a simple fraction "123/456" or "123:456"
            w = assign(B[A], s);
            y = assign(B[A + 2], 1);
            A += 3;
          } else if (B[A + 3] === '/' && B[A + 1] === ' ') { // Check for a complex fraction "123 1/2"
            v = assign(B[A], s);
            w = assign(B[A + 2], s);
            y = assign(B[A + 4], 1);
            A += 5;
          }

          if (B.length <= A) { // Check for more tokens on the stack
            d = y * z;
            s = /* void */
                    n = x + d * v + z * w;
            break;
          }

          /* Fall through on error */
        }
        default:
          throwInvalidParam();
      }

    if (d === 0) {
      throw new DivisionByZero();
    }

    P["s"] = s < 0 ? -1 : 1;
    P["n"] = Math.abs(n);
    P["d"] = Math.abs(d);
  };

  function modpow(b, e, m) {

    var r = 1;
    for (; e > 0; b = (b * b) % m, e >>= 1) {

      if (e & 1) {
        r = (r * b) % m;
      }
    }
    return r;
  }


  function cycleLen(n, d) {

    for (; d % 2 === 0;
            d /= 2) {
    }

    for (; d % 5 === 0;
            d /= 5) {
    }

    if (d === 1) // Catch non-cyclic numbers
      return 0;

    // If we would like to compute really large numbers quicker, we could make use of Fermat's little theorem:
    // 10^(d-1) % d == 1
    // However, we don't need such large numbers and MAX_CYCLE_LEN should be the capstone,
    // as we want to translate the numbers to strings.

    var rem = 10 % d;
    var t = 1;

    for (; rem !== 1; t++) {
      rem = rem * 10 % d;

      if (t > MAX_CYCLE_LEN)
        return 0; // Returning 0 here means that we don't print it as a cyclic number. It's likely that the answer is `d-1`
    }
    return t;
  }


     function cycleStart(n, d, len) {

    var rem1 = 1;
    var rem2 = modpow(10, len, d);

    for (var t = 0; t < 300; t++) { // s < ~log10(Number.MAX_VALUE)
      // Solve 10^s == 10^(s+t) (mod d)

      if (rem1 === rem2)
        return t;

      rem1 = rem1 * 10 % d;
      rem2 = rem2 * 10 % d;
    }
    return 0;
  }

  function gcd(a, b) {

    if (!a)
      return b;
    if (!b)
      return a;

    while (1) {
      a %= b;
      if (!a)
        return b;
      b %= a;
      if (!b)
        return a;
    }
  };

  /**
   * Module constructor
   *
   * @constructor
   * @param {number|Fraction=} a
   * @param {number=} b
   */
  function Fraction(a, b) {

    if (!(this instanceof Fraction)) {
      return new Fraction(a, b);
    }

    parse(a, b);

    if (Fraction['REDUCE']) {
      a = gcd(P["d"], P["n"]); // Abuse a
    } else {
      a = 1;
    }

    this["s"] = P["s"];
    this["n"] = P["n"] / a;
    this["d"] = P["d"] / a;
  }

  /**
   * Boolean global variable to be able to disable automatic reduction of the fraction
   *
   */
  Fraction['REDUCE'] = 1;

  Fraction.prototype = {

    "s": 1,
    "n": 0,
    "d": 1,

    /**
     * Calculates the absolute value
     *
     * Ex: new Fraction(-4).abs() => 4
     **/
    "abs": function() {

      return new Fraction(this["n"], this["d"]);
    },

    /**
     * Inverts the sign of the current fraction
     *
     * Ex: new Fraction(-4).neg() => 4
     **/
    "neg": function() {

      return new Fraction(-this["s"] * this["n"], this["d"]);
    },

    /**
     * Adds two rational numbers
     *
     * Ex: new Fraction({n: 2, d: 3}).add("14.9") => 467 / 30
     **/
    "add": function(a, b) {

      parse(a, b);
      return new Fraction(
              this["s"] * this["n"] * P["d"] + P["s"] * this["d"] * P["n"],
              this["d"] * P["d"]
              );
    },

    /**
     * Subtracts two rational numbers
     *
     * Ex: new Fraction({n: 2, d: 3}).add("14.9") => -427 / 30
     **/
    "sub": function(a, b) {

      parse(a, b);
      return new Fraction(
              this["s"] * this["n"] * P["d"] - P["s"] * this["d"] * P["n"],
              this["d"] * P["d"]
              );
    },

    /**
     * Multiplies two rational numbers
     *
     * Ex: new Fraction("-17.(345)").mul(3) => 5776 / 111
     **/
    "mul": function(a, b) {

      parse(a, b);
      return new Fraction(
              this["s"] * P["s"] * this["n"] * P["n"],
              this["d"] * P["d"]
              );
    },

    /**
     * Divides two rational numbers
     *
     * Ex: new Fraction("-17.(345)").inverse().div(3)
     **/
    "div": function(a, b) {

      parse(a, b);
      return new Fraction(
              this["s"] * P["s"] * this["n"] * P["d"],
              this["d"] * P["n"]
              );
    },

    /**
     * Clones the actual object
     *
     * Ex: new Fraction("-17.(345)").clone()
     **/
    "clone": function() {
      return new Fraction(this);
    },

    /**
     * Calculates the modulo of two rational numbers - a more precise fmod
     *
     * Ex: new Fraction('4.(3)').mod([7, 8]) => (13/3) % (7/8) = (5/6)
     **/
    "mod": function(a, b) {

      if (isNaN(this['n']) || isNaN(this['d'])) {
        return new Fraction(NaN);
      }

      if (a === undefined) {
        return new Fraction(this["s"] * this["n"] % this["d"], 1);
      }

      parse(a, b);
      if (0 === P["n"] && 0 === this["d"]) {
        Fraction(0, 0); // Throw DivisionByZero
      }

      /*
       * First silly attempt, kinda slow
       *
       return that["sub"]({
       "n": num["n"] * Math.floor((this.n / this.d) / (num.n / num.d)),
       "d": num["d"],
       "s": this["s"]
       });*/

      /*
       * New attempt: a1 / b1 = a2 / b2 * q + r
       * => b2 * a1 = a2 * b1 * q + b1 * b2 * r
       * => (b2 * a1 % a2 * b1) / (b1 * b2)
       */
      return new Fraction(
              this["s"] * (P["d"] * this["n"]) % (P["n"] * this["d"]),
              P["d"] * this["d"]
              );
    },

    /**
     * Calculates the fractional gcd of two rational numbers
     *
     * Ex: new Fraction(5,8).gcd(3,7) => 1/56
     */
    "gcd": function(a, b) {

      parse(a, b);

      // gcd(a / b, c / d) = gcd(a, c) / lcm(b, d)

      return new Fraction(gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]), P["d"] * this["d"]);
    },

    /**
     * Calculates the fractional lcm of two rational numbers
     *
     * Ex: new Fraction(5,8).lcm(3,7) => 15
     */
    "lcm": function(a, b) {

      parse(a, b);

      // lcm(a / b, c / d) = lcm(a, c) / gcd(b, d)

      if (P["n"] === 0 && this["n"] === 0) {
        return new Fraction;
      }
      return new Fraction(P["n"] * this["n"], gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]));
    },

    /**
     * Calculates the ceil of a rational number
     *
     * Ex: new Fraction('4.(3)').ceil() => (5 / 1)
     **/
    "ceil": function(places) {

      places = Math.pow(10, places || 0);

      if (isNaN(this["n"]) || isNaN(this["d"])) {
        return new Fraction(NaN);
      }
      return new Fraction(Math.ceil(places * this["s"] * this["n"] / this["d"]), places);
    },

    /**
     * Calculates the floor of a rational number
     *
     * Ex: new Fraction('4.(3)').floor() => (4 / 1)
     **/
    "floor": function(places) {

      places = Math.pow(10, places || 0);

      if (isNaN(this["n"]) || isNaN(this["d"])) {
        return new Fraction(NaN);
      }
      return new Fraction(Math.floor(places * this["s"] * this["n"] / this["d"]), places);
    },

    /**
     * Rounds a rational numbers
     *
     * Ex: new Fraction('4.(3)').round() => (4 / 1)
     **/
    "round": function(places) {

      places = Math.pow(10, places || 0);

      if (isNaN(this["n"]) || isNaN(this["d"])) {
        return new Fraction(NaN);
      }
      return new Fraction(Math.round(places * this["s"] * this["n"] / this["d"]), places);
    },

    /**
     * Gets the inverse of the fraction, means numerator and denumerator are exchanged
     *
     * Ex: new Fraction([-3, 4]).inverse() => -4 / 3
     **/
    "inverse": function() {

      return new Fraction(this["s"] * this["d"], this["n"]);
    },

    /**
     * Calculates the fraction to some integer exponent
     *
     * Ex: new Fraction(-1,2).pow(-3) => -8
     */
    "pow": function(m) {

      if (m < 0) {
        return new Fraction(Math.pow(this['s'] * this["d"], -m), Math.pow(this["n"], -m));
      } else {
        return new Fraction(Math.pow(this['s'] * this["n"], m), Math.pow(this["d"], m));
      }
    },

    /**
     * Check if two rational numbers are the same
     *
     * Ex: new Fraction(19.6).equals([98, 5]);
     **/
    "equals": function(a, b) {

      parse(a, b);
      return this["s"] * this["n"] * P["d"] === P["s"] * P["n"] * this["d"]; // Same as compare() === 0
    },

    /**
     * Check if two rational numbers are the same
     *
     * Ex: new Fraction(19.6).equals([98, 5]);
     **/
    "compare": function(a, b) {

      parse(a, b);
      var t = (this["s"] * this["n"] * P["d"] - P["s"] * P["n"] * this["d"]);
      return (0 < t) - (t < 0);
    },

    "simplify": function(eps) {

      // First naive implementation, needs improvement

      if (isNaN(this['n']) || isNaN(this['d'])) {
        return this;
      }

      var cont = this['abs']()['toContinued']();

      eps = eps || 0.001;

      function rec(a) {
        if (a.length === 1)
          return new Fraction(a[0]);
        return rec(a.slice(1))['inverse']()['add'](a[0]);
      }

      for (var i = 0; i < cont.length; i++) {
        var tmp = rec(cont.slice(0, i + 1));
        if (tmp['sub'](this['abs']())['abs']().valueOf() < eps) {
          return tmp['mul'](this['s']);
        }
      }
      return this;
    },

    /**
     * Check if two rational numbers are divisible
     *
     * Ex: new Fraction(19.6).divisible(1.5);
     */
    "divisible": function(a, b) {

      parse(a, b);
      return !(!(P["n"] * this["d"]) || ((this["n"] * P["d"]) % (P["n"] * this["d"])));
    },

    /**
     * Returns a decimal representation of the fraction
     *
     * Ex: new Fraction("100.'91823'").valueOf() => 100.91823918239183
     **/
    'valueOf': function() {

      return this["s"] * this["n"] / this["d"];
    },

    /**
     * Returns a string-fraction representation of a Fraction object
     *
     * Ex: new Fraction("1.'3'").toFraction() => "4 1/3"
     **/
    'toFraction': function(excludeWhole) {

      var whole, str = "";
      var n = this["n"];
      var d = this["d"];
      if (this["s"] < 0) {
        str += '-';
      }

      if (d === 1) {
        str += n;
      } else {

        if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
          str += whole;
          str += " ";
          n %= d;
        }

        str += n;
        str += '/';
        str += d;
      }
      return str;
    },

    /**
     * Returns a latex representation of a Fraction object
     *
     * Ex: new Fraction("1.'3'").toLatex() => "\frac{4}{3}"
     **/
    'toLatex': function(excludeWhole) {

      var whole, str = "";
      var n = this["n"];
      var d = this["d"];
      if (this["s"] < 0) {
        str += '-';
      }

      if (d === 1) {
        str += n;
      } else {

        if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
          str += whole;
          n %= d;
        }

        str += "\\frac{";
        str += n;
        str += '}{';
        str += d;
        str += '}';
      }
      return str;
    },

    /**
     * Returns an array of continued fraction elements
     *
     * Ex: new Fraction("7/8").toContinued() => [0,1,7]
     */
    'toContinued': function() {

      var t;
      var a = this['n'];
      var b = this['d'];
      var res = [];

      if (isNaN(this['n']) || isNaN(this['d'])) {
        return res;
      }

      do {
        res.push(Math.floor(a / b));
        t = a % b;
        a = b;
        b = t;
      } while (a !== 1);

      return res;
    },

    /**
     * Creates a string representation of a fraction with all digits
     *
     * Ex: new Fraction("100.'91823'").toString() => "100.(91823)"
     **/
    'toString': function(dec) {

      var g;
      var N = this["n"];
      var D = this["d"];

      if (isNaN(N) || isNaN(D)) {
        return "NaN";
      }

      if (!Fraction['REDUCE']) {
        g = gcd(N, D);
        N /= g;
        D /= g;
      }

      dec = dec || 15; // 15 = decimal places when no repitation

      var cycLen = cycleLen(N, D); // Cycle length
      var cycOff = cycleStart(N, D, cycLen); // Cycle start

      var str = this['s'] === -1 ? "-" : "";

      str += N / D | 0;

      N %= D;
      N *= 10;

      if (N)
        str += ".";

      if (cycLen) {

        for (var i = cycOff; i--; ) {
          str += N / D | 0;
          N %= D;
          N *= 10;
        }
        str += "(";
        for (var i = cycLen; i--; ) {
          str += N / D | 0;
          N %= D;
          N *= 10;
        }
        str += ")";
      } else {
        for (var i = dec; N && i--; ) {
          str += N / D | 0;
          N %= D;
          N *= 10;
        }
      }
      return str;
    }
  };

  if (typeof define === "function" && define["amd"]) {
    define([], function() {
      return Fraction;
    });
  } else if (typeof exports === "object") {
    Object.defineProperty(exports, "__esModule", {'value': true});
    Fraction['default'] = Fraction;
    Fraction['Fraction'] = Fraction;
    module['exports'] = Fraction;
  } else {
    root['Fraction'] = Fraction;
  }

})(this);

},{}],76:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'abs',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet ? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: isWorklet ? 'Math.abs' : Math.abs })

      out = `${ref}abs( ${inputs[0]} )`

    } else {
      out = Math.abs( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let abs = Object.create( proto )

  abs.inputs = [ x ]

  return abs
}

},{"./gen.js":107}],77:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'accum',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        genName = 'gen.' + this.name,
        functionBody

    gen.requestMemory( this.memory )

    gen.memory.heap[ this.memory.value.idx ] = this.initialValue

    functionBody = this.callback( genName, inputs[0], inputs[1], `memory[${this.memory.value.idx}]` )

    //gen.closures.add({ [ this.name ]: this }) 

    gen.memo[ this.name ] = this.name + '_value'
    
    return [ this.name + '_value', functionBody ]
  },

  callback( _name, _incr, _reset, valueRef ) {
    let diff = this.max - this.min,
        out = '',
        wrap = ''
    
    /* three different methods of wrapping, third is most expensive:
     *
     * 1: range {0,1}: y = x - (x | 0)
     * 2: log2(this.max) == integer: y = x & (this.max - 1)
     * 3: all others: if( x >= this.max ) y = this.max -x
     *
     */

    // must check for reset before storing value for output
    if( !(typeof this.inputs[1] === 'number' && this.inputs[1] < 1) ) { 
      if( this.resetValue !== this.min ) {

        out += `  if( ${_reset} >=1 ) ${valueRef} = ${this.resetValue}\n\n`
        //out += `  if( ${_reset} >=1 ) ${valueRef} = ${this.min}\n\n`
      }else{
        out += `  if( ${_reset} >=1 ) ${valueRef} = ${this.min}\n\n`
        //out += `  if( ${_reset} >=1 ) ${valueRef} = ${this.initialValue}\n\n`
      }
    }

    out += `  var ${this.name}_value = ${valueRef}\n`
    
    if( this.shouldWrap === false && this.shouldClamp === true ) {
      out += `  if( ${valueRef} < ${this.max } ) ${valueRef} += ${_incr}\n`
    }else{
      out += `  ${valueRef} += ${_incr}\n` // store output value before accumulating  
    }

    if( this.max !== Infinity  && this.shouldWrapMax ) wrap += `  if( ${valueRef} >= ${this.max} ) ${valueRef} -= ${diff}\n`
    if( this.min !== -Infinity && this.shouldWrapMin ) wrap += `  if( ${valueRef} < ${this.min} ) ${valueRef} += ${diff}\n`

    //if( this.min === 0 && this.max === 1 ) { 
    //  wrap =  `  ${valueRef} = ${valueRef} - (${valueRef} | 0)\n\n`
    //} else if( this.min === 0 && ( Math.log2( this.max ) | 0 ) === Math.log2( this.max ) ) {
    //  wrap =  `  ${valueRef} = ${valueRef} & (${this.max} - 1)\n\n`
    //} else if( this.max !== Infinity ){
    //  wrap = `  if( ${valueRef} >= ${this.max} ) ${valueRef} -= ${diff}\n\n`
    //}

    out = out + wrap + '\n'

    return out
  },

  defaults : { min:0, max:1, resetValue:0, initialValue:0, shouldWrap:true, shouldWrapMax: true, shouldWrapMin:true, shouldClamp:false }
}

module.exports = ( incr, reset=0, properties ) => {
  const ugen = Object.create( proto )
      
  Object.assign( ugen, 
    { 
      uid:    gen.getUID(),
      inputs: [ incr, reset ],
      memory: {
        value: { length:1, idx:null }
      }
    },
    proto.defaults,
    properties 
  )

  if( properties !== undefined && properties.shouldWrapMax === undefined && properties.shouldWrapMin === undefined ) {
    if( properties.shouldWrap !== undefined ) {
      ugen.shouldWrapMin = ugen.shouldWrapMax = properties.shouldWrap
    }
  }

  if( properties !== undefined && properties.resetValue === undefined ) {
    ugen.resetValue = ugen.min
  }

  if( ugen.initialValue === undefined ) ugen.initialValue = ugen.min

  Object.defineProperty( ugen, 'value', {
    get()  { 
      //console.log( 'gen:', gen, gen.memory )
      return gen.memory.heap[ this.memory.value.idx ] 
    },
    set(v) { gen.memory.heap[ this.memory.value.idx ] = v }
  })

  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":107}],78:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'acos',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    

    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet ? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'acos': isWorklet ? 'Math.acos' :Math.acos })

      out = `${ref}acos( ${inputs[0]} )` 

    } else {
      out = Math.acos( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let acos = Object.create( proto )

  acos.inputs = [ x ]
  acos.id = gen.getUID()
  acos.name = `${acos.basename}{acos.id}`

  return acos
}

},{"./gen.js":107}],79:[function(require,module,exports){
'use strict'

let gen      = require( './gen.js' ),
    mul      = require( './mul.js' ),
    sub      = require( './sub.js' ),
    div      = require( './div.js' ),
    data     = require( './data.js' ),
    peek     = require( './peek.js' ),
    accum    = require( './accum.js' ),
    ifelse   = require( './ifelseif.js' ),
    lt       = require( './lt.js' ),
    bang     = require( './bang.js' ),
    env      = require( './env.js' ),
    add      = require( './add.js' ),
    poke     = require( './poke.js' ),
    neq      = require( './neq.js' ),
    and      = require( './and.js' ),
    gte      = require( './gte.js' ),
    memo     = require( './memo.js' ),
    utilities= require( './utilities.js' )

module.exports = ( attackTime = 44100, decayTime = 44100, _props ) => {
  const props = Object.assign({}, { shape:'exponential', alpha:5, trigger:null }, _props )
  const _bang = props.trigger !== null ? props.trigger : bang(),
        phase = accum( 1, _bang, { min:0, max: Infinity, initialValue:-Infinity, shouldWrap:false })
      
  let bufferData, bufferDataReverse, decayData, out, buffer

  //console.log( 'shape:', props.shape, 'attack time:', attackTime, 'decay time:', decayTime )
  let completeFlag = data( [0] )
  
  // slightly more efficient to use existing phase accumulator for linear envelopes
  if( props.shape === 'linear' ) {
    out = ifelse( 
      and( gte( phase, 0), lt( phase, attackTime )),
      div( phase, attackTime ),

      and( gte( phase, 0),  lt( phase, add( attackTime, decayTime ) ) ),
      sub( 1, div( sub( phase, attackTime ), decayTime ) ),
      
      neq( phase, -Infinity),
      poke( completeFlag, 1, 0, { inline:0 }),

      0 
    )
  } else {
    bufferData = env({ length:1024, type:props.shape, alpha:props.alpha })
    bufferDataReverse = env({ length:1024, type:props.shape, alpha:props.alpha, reverse:true })

    out = ifelse( 
      and( gte( phase, 0), lt( phase, attackTime ) ), 
      peek( bufferData, div( phase, attackTime ), { boundmode:'clamp' } ), 

      and( gte(phase,0), lt( phase, add( attackTime, decayTime ) ) ), 
      peek( bufferDataReverse, div( sub( phase, attackTime ), decayTime ), { boundmode:'clamp' }),

      neq( phase, -Infinity ),
      poke( completeFlag, 1, 0, { inline:0 }),

      0
    )
  }

  const usingWorklet = gen.mode === 'worklet'
  if( usingWorklet === true ) {
    out.node = null
    utilities.register( out )
  }

  // needed for gibberish... getting this to work right with worklets
  // via promises will probably be tricky
  out.isComplete = ()=> {
    if( usingWorklet === true && out.node !== null ) {
      const p = new Promise( resolve => {
        out.node.getMemoryValue( completeFlag.memory.values.idx, resolve )
      })

      return p
    }else{
      return gen.memory.heap[ completeFlag.memory.values.idx ]
    }
  }

  out.trigger = ()=> {
    if( usingWorklet === true && out.node !== null ) {
      out.node.port.postMessage({ key:'set', idx:completeFlag.memory.values.idx, value:0 })
    }else{
      gen.memory.heap[ completeFlag.memory.values.idx ] = 0
    }
    _bang.trigger()
  }

  return out 
}

},{"./accum.js":77,"./add.js":80,"./and.js":82,"./bang.js":86,"./data.js":93,"./div.js":98,"./env.js":99,"./gen.js":107,"./gte.js":109,"./ifelseif.js":112,"./lt.js":115,"./memo.js":119,"./mul.js":125,"./neq.js":126,"./peek.js":131,"./poke.js":133,"./sub.js":144,"./utilities.js":150}],80:[function(require,module,exports){
'use strict'

const gen = require('./gen.js')

const proto = { 
  basename:'add',
  gen() {
    let inputs = gen.getInputs( this ),
        out='',
        sum = 0, numCount = 0, adderAtEnd = false, alreadyFullSummed = true

    if( inputs.length === 0 ) return 0

    out = `  var ${this.name} = `

    inputs.forEach( (v,i) => {
      if( isNaN( v ) ) {
        out += v
        if( i < inputs.length -1 ) {
          adderAtEnd = true
          out += ' + '
        }
        alreadyFullSummed = false
      }else{
        sum += parseFloat( v )
        numCount++
      }
    })

    if( numCount > 0 ) {
      out += adderAtEnd || alreadyFullSummed ? sum : ' + ' + sum
    }

    out += '\n'

    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  }
}

module.exports = ( ...args ) => {
  const add = Object.create( proto )
  add.id = gen.getUID()
  add.name = add.basename + add.id
  add.inputs = args

  return add
}

},{"./gen.js":107}],81:[function(require,module,exports){
'use strict'

let gen      = require( './gen.js' ),
    mul      = require( './mul.js' ),
    sub      = require( './sub.js' ),
    div      = require( './div.js' ),
    data     = require( './data.js' ),
    peek     = require( './peek.js' ),
    accum    = require( './accum.js' ),
    ifelse   = require( './ifelseif.js' ),
    lt       = require( './lt.js' ),
    bang     = require( './bang.js' ),
    env      = require( './env.js' ),
    param    = require( './param.js' ),
    add      = require( './add.js' ),
    gtp      = require( './gtp.js' ),
    not      = require( './not.js' ),
    and      = require( './and.js' ),
    neq      = require( './neq.js' ),
    poke     = require( './poke.js' )

module.exports = ( attackTime=44, decayTime=22050, sustainTime=44100, sustainLevel=.6, releaseTime=44100, _props ) => {
  let envTrigger = bang(),
      phase = accum( 1, envTrigger, { max: Infinity, shouldWrap:false, initialValue:Infinity }),
      shouldSustain = param( 1 ),
      defaults = {
         shape: 'exponential',
         alpha: 5,
         triggerRelease: false,
      },
      props = Object.assign({}, defaults, _props ),
      bufferData, decayData, out, buffer, sustainCondition, releaseAccum, releaseCondition


  const completeFlag = data( [0] )

  bufferData = env({ length:1024, alpha:props.alpha, shift:0, type:props.shape })

  sustainCondition = props.triggerRelease 
    ? shouldSustain
    : lt( phase, add( attackTime, decayTime, sustainTime ) )

  releaseAccum = props.triggerRelease
    ? gtp( sub( sustainLevel, accum( div( sustainLevel, releaseTime ) , 0, { shouldWrap:false }) ), 0 )
    : sub( sustainLevel, mul( div( sub( phase, add( attackTime, decayTime, sustainTime ) ), releaseTime ), sustainLevel ) ), 

  releaseCondition = props.triggerRelease
    ? not( shouldSustain )
    : lt( phase, add( attackTime, decayTime, sustainTime, releaseTime ) )

  out = ifelse(
    // attack 
    lt( phase,  attackTime ), 
    peek( bufferData, div( phase, attackTime ), { boundmode:'clamp' } ), 

    // decay
    lt( phase, add( attackTime, decayTime ) ), 
    peek( bufferData, sub( 1, mul( div( sub( phase,  attackTime ),  decayTime ), sub( 1,  sustainLevel ) ) ), { boundmode:'clamp' }),

    // sustain
    and( sustainCondition, neq( phase, Infinity ) ),
    peek( bufferData,  sustainLevel ),

    // release
    releaseCondition, //lt( phase,  attackTime +  decayTime +  sustainTime +  releaseTime ),
    peek( 
      bufferData,
      releaseAccum, 
      //sub(  sustainLevel, mul( div( sub( phase,  attackTime +  decayTime +  sustainTime),  releaseTime ),  sustainLevel ) ), 
      { boundmode:'clamp' }
    ),

    neq( phase, Infinity ),
    poke( completeFlag, 1, 0, { inline:0 }),

    0
  )
   
  const usingWorklet = gen.mode === 'worklet'
  if( usingWorklet === true ) {
    out.node = null
    utilities.register( out )
  }

  out.trigger = ()=> {
    shouldSustain.value = 1
    envTrigger.trigger()
  }
 
  // needed for gibberish... getting this to work right with worklets
  // via promises will probably be tricky
  out.isComplete = ()=> {
    if( usingWorklet === true && out.node !== null ) {
      const p = new Promise( resolve => {
        out.node.getMemoryValue( completeFlag.memory.values.idx, resolve )
      })

      return p
    }else{
      return gen.memory.heap[ completeFlag.memory.values.idx ]
    }
  }


  out.release = ()=> {
    shouldSustain.value = 0
    // XXX pretty nasty... grabs accum inside of gtp and resets value manually
    // unfortunately envTrigger won't work as it's back to 0 by the time the release block is triggered...
    if( usingWorklet && out.node !== null ) {
      out.node.port.postMessage({ key:'set', idx:releaseAccum.inputs[0].inputs[1].memory.value.idx, value:0 })
    }else{
      gen.memory.heap[ releaseAccum.inputs[0].inputs[1].memory.value.idx ] = 0
    }
  }

  return out 
}

},{"./accum.js":77,"./add.js":80,"./and.js":82,"./bang.js":86,"./data.js":93,"./div.js":98,"./env.js":99,"./gen.js":107,"./gtp.js":110,"./ifelseif.js":112,"./lt.js":115,"./mul.js":125,"./neq.js":126,"./not.js":128,"./param.js":130,"./peek.js":131,"./poke.js":133,"./sub.js":144}],82:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'and',

  gen() {
    let inputs = gen.getInputs( this ), out

    out = `  var ${this.name} = (${inputs[0]} !== 0 && ${inputs[1]} !== 0) | 0\n\n`

    gen.memo[ this.name ] = `${this.name}`

    return [ `${this.name}`, out ]
  },

}

module.exports = ( in1, in2 ) => {
  let ugen = Object.create( proto )
  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ in1, in2 ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":107}],83:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'asin',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet ? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'asin': isWorklet ? 'Math.sin' : Math.asin })

      out = `${ref}asin( ${inputs[0]} )` 

    } else {
      out = Math.asin( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let asin = Object.create( proto )

  asin.inputs = [ x ]
  asin.id = gen.getUID()
  asin.name = `${asin.basename}{asin.id}`

  return asin
}

},{"./gen.js":107}],84:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'atan',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet ? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'atan': isWorklet ? 'Math.atan' : Math.atan })

      out = `${ref}atan( ${inputs[0]} )` 

    } else {
      out = Math.atan( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let atan = Object.create( proto )

  atan.inputs = [ x ]
  atan.id = gen.getUID()
  atan.name = `${atan.basename}{atan.id}`

  return atan
}

},{"./gen.js":107}],85:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    mul     = require( './mul.js' ),
    sub     = require( './sub.js' )

module.exports = ( decayTime = 44100 ) => {
  let ssd = history ( 1 ),
      t60 = Math.exp( -6.907755278921 / decayTime )

  ssd.in( mul( ssd.out, t60 ) )

  ssd.out.trigger = ()=> {
    ssd.value = 1
  }

  return sub( 1, ssd.out )
}

},{"./gen.js":107,"./history.js":111,"./mul.js":125,"./sub.js":144}],86:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

let proto = {
  gen() {
    gen.requestMemory( this.memory )
    
    let out = 
`  var ${this.name} = memory[${this.memory.value.idx}]
  if( ${this.name} === 1 ) memory[${this.memory.value.idx}] = 0      
      
`
    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  } 
}

module.exports = ( _props ) => {
  let ugen = Object.create( proto ),
      props = Object.assign({}, { min:0, max:1 }, _props )

  ugen.name = 'bang' + gen.getUID()

  ugen.min = props.min
  ugen.max = props.max

  const usingWorklet = gen.mode === 'worklet'
  if( usingWorklet === true ) {
    ugen.node = null
    utilities.register( ugen )
  }

  ugen.trigger = () => {
    if( usingWorklet === true && ugen.node !== null ) {
      ugen.node.port.postMessage({ key:'set', idx:ugen.memory.value.idx, value:ugen.max })
    }else{
      gen.memory.heap[ ugen.memory.value.idx ] = ugen.max 
    }
  }

  ugen.memory = {
    value: { length:1, idx:null }
  }

  return ugen
}

},{"./gen.js":107}],87:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'bool',

  gen() {
    let inputs = gen.getInputs( this ), out

    out = `${inputs[0]} === 0 ? 0 : 1`
    
    //gen.memo[ this.name ] = `gen.data.${this.name}`

    //return [ `gen.data.${this.name}`, ' ' +out ]
    return out
  }
}

module.exports = ( in1 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    uid:        gen.getUID(),
    inputs:     [ in1 ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}


},{"./gen.js":107}],88:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'ceil',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet ? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: isWorklet ? 'Math.ceil' : Math.ceil })

      out = `${ref}ceil( ${inputs[0]} )`

    } else {
      out = Math.ceil( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let ceil = Object.create( proto )

  ceil.inputs = [ x ]

  return ceil
}

},{"./gen.js":107}],89:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js'),
    floor= require('./floor.js'),
    sub  = require('./sub.js'),
    memo = require('./memo.js')

let proto = {
  basename:'clip',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        out

    out =

` var ${this.name} = ${inputs[0]}
  if( ${this.name} > ${inputs[2]} ) ${this.name} = ${inputs[2]}
  else if( ${this.name} < ${inputs[1]} ) ${this.name} = ${inputs[1]}
`
    out = ' ' + out
    
    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  },
}

module.exports = ( in1, min=-1, max=1 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    min, 
    max,
    uid:    gen.getUID(),
    inputs: [ in1, min, max ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./floor.js":104,"./gen.js":107,"./memo.js":119,"./sub.js":144}],90:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'cos',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    
    const isWorklet = gen.mode === 'worklet'

    const ref = isWorklet ? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'cos': isWorklet ? 'Math.cos' : Math.cos })

      out = `${ref}cos( ${inputs[0]} )` 

    } else {
      out = Math.cos( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let cos = Object.create( proto )

  cos.inputs = [ x ]
  cos.id = gen.getUID()
  cos.name = `${cos.basename}{cos.id}`

  return cos
}

},{"./gen.js":107}],91:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'counter',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        genName = 'gen.' + this.name,
        functionBody
       
    if( this.memory.value.idx === null ) gen.requestMemory( this.memory )
    gen.memory.heap[ this.memory.value.idx ] = this.initialValue
    
    functionBody  = this.callback( genName, inputs[0], inputs[1], inputs[2], inputs[3], inputs[4],  `memory[${this.memory.value.idx}]`, `memory[${this.memory.wrap.idx}]`  )

    gen.memo[ this.name ] = this.name + '_value'
   
    if( gen.memo[ this.wrap.name ] === undefined ) this.wrap.gen()

    return [ this.name + '_value', functionBody ]
  },

  callback( _name, _incr, _min, _max, _reset, loops, valueRef, wrapRef ) {
    let diff = this.max - this.min,
        out = '',
        wrap = ''
    // must check for reset before storing value for output
    if( !(typeof this.inputs[3] === 'number' && this.inputs[3] < 1) ) { 
      out += `  if( ${_reset} >= 1 ) ${valueRef} = ${_min}\n`
    }

    out += `  var ${this.name}_value = ${valueRef};\n  ${valueRef} += ${_incr}\n` // store output value before accumulating  
    
    if( typeof this.max === 'number' && this.max !== Infinity && typeof this.min !== 'number' ) {
      wrap = 
`  if( ${valueRef} >= ${this.max} &&  ${loops} > 0) {
    ${valueRef} -= ${diff}
    ${wrapRef} = 1
  }else{
    ${wrapRef} = 0
  }\n`
    }else if( this.max !== Infinity && this.min !== Infinity ) {
      wrap = 
`  if( ${valueRef} >= ${_max} &&  ${loops} > 0) {
    ${valueRef} -= ${_max} - ${_min}
    ${wrapRef} = 1
  }else if( ${valueRef} < ${_min} &&  ${loops} > 0) {
    ${valueRef} += ${_max} - ${_min}
    ${wrapRef} = 1
  }else{
    ${wrapRef} = 0
  }\n`
    }else{
      out += '\n'
    }

    out = out + wrap

    return out
  }
}

module.exports = ( incr=1, min=0, max=Infinity, reset=0, loops=1,  properties ) => {
  let ugen = Object.create( proto ),
      defaults = Object.assign( { initialValue: 0, shouldWrap:true }, properties )

  Object.assign( ugen, { 
    min:    min, 
    max:    max,
    initialValue: defaults.initialValue,
    value:  defaults.initialValue,
    uid:    gen.getUID(),
    inputs: [ incr, min, max, reset, loops ],
    memory: {
      value: { length:1, idx: null },
      wrap:  { length:1, idx: null } 
    },
    wrap : {
      gen() { 
        if( ugen.memory.wrap.idx === null ) {
          gen.requestMemory( ugen.memory )
        }
        gen.getInputs( this )
        gen.memo[ this.name ] = `memory[ ${ugen.memory.wrap.idx} ]`
        return `memory[ ${ugen.memory.wrap.idx} ]` 
      }
    }
  },
  defaults )
 
  Object.defineProperty( ugen, 'value', {
    get() {
      if( this.memory.value.idx !== null ) {
        return gen.memory.heap[ this.memory.value.idx ]
      }
    },
    set( v ) {
      if( this.memory.value.idx !== null ) {
        gen.memory.heap[ this.memory.value.idx ] = v 
      }
    }
  })
  
  ugen.wrap.inputs = [ ugen ]
  ugen.name = `${ugen.basename}${ugen.uid}`
  ugen.wrap.name = ugen.name + '_wrap'
  return ugen
} 

},{"./gen.js":107}],92:[function(require,module,exports){
'use strict'

let gen  = require( './gen.js' ),
    accum= require( './phasor.js' ),
    data = require( './data.js' ),
    peek = require( './peek.js' ),
    mul  = require( './mul.js' ),
    phasor=require( './phasor.js')

let proto = {
  basename:'cycle',

  initTable() {    
    let buffer = new Float32Array( 1024 )

    for( let i = 0, l = buffer.length; i < l; i++ ) {
      buffer[ i ] = Math.sin( ( i / l ) * ( Math.PI * 2 ) )
    }

    gen.globals.cycle = data( buffer, 1, { immutable:true } )
  }

}

module.exports = ( frequency=1, reset=0, _props ) => {
  if( typeof gen.globals.cycle === 'undefined' ) proto.initTable() 
  const props = Object.assign({}, { min:0 }, _props )

  const ugen = peek( gen.globals.cycle, phasor( frequency, reset, props ))
  ugen.name = 'cycle' + gen.getUID()

  return ugen
}

},{"./data.js":93,"./gen.js":107,"./mul.js":125,"./peek.js":131,"./phasor.js":132}],93:[function(require,module,exports){
'use strict'

const gen  = require('./gen.js'),
      utilities = require( './utilities.js' ),
      peek = require('./peek.js'),
      poke = require('./poke.js')

const proto = {
  basename:'data',
  globals: {},
  memo:{},

  gen() {
    let idx
    //console.log( 'data name:', this.name, proto.memo )
    //debugger
    if( gen.memo[ this.name ] === undefined ) {
      let ugen = this
      gen.requestMemory( this.memory, this.immutable ) 
      idx = this.memory.values.idx
      if( this.buffer !== undefined ) {
        try {
          gen.memory.heap.set( this.buffer, idx )
        }catch( e ) {
          console.log( e )
          throw Error( 'error with request. asking for ' + this.buffer.length +'. current index: ' + gen.memoryIndex + ' of ' + gen.memory.heap.length )
        }
      }
      //gen.data[ this.name ] = this
      //return 'gen.memory' + this.name + '.buffer'
      if( this.name.indexOf('data') === -1 ) {
        proto.memo[ this.name ] = idx
      }else{
        gen.memo[ this.name ] = idx
      }
    }else{
      //console.log( 'using gen data memo', proto.memo[ this.name ] )
      idx = gen.memo[ this.name ]
    }
    return idx
  },
}

module.exports = ( x, y=1, properties ) => {
  let ugen, buffer, shouldLoad = false
  
  if( properties !== undefined && properties.global !== undefined ) {
    if( gen.globals[ properties.global ] ) {
      return gen.globals[ properties.global ]
    }
  }

  if( typeof x === 'number' ) {
    if( y !== 1 ) {
      buffer = []
      for( let i = 0; i < y; i++ ) {
        buffer[ i ] = new Float32Array( x )
      }
    }else{
      buffer = new Float32Array( x )
    }
  }else if( Array.isArray( x ) ) { //! (x instanceof Float32Array ) ) {
    let size = x.length
    buffer = new Float32Array( size )
    for( let i = 0; i < x.length; i++ ) {
      buffer[ i ] = x[ i ]
    }
  }else if( typeof x === 'string' ) {
    //buffer = { length: y > 1 ? y : gen.samplerate * 60 } // XXX what???
    //if( proto.memo[ x ] === undefined ) {
      buffer = { length: y > 1 ? y : 1 } // XXX what???
      shouldLoad = true
    //}else{
      //buffer = proto.memo[ x ]
    //}
  }else if( x instanceof Float32Array ) {
    buffer = x
  }
  
  ugen = Object.create( proto ) 

  Object.assign( ugen, 
  { 
    buffer,
    name: proto.basename + gen.getUID(),
    dim:  buffer !== undefined ? buffer.length : 1, // XXX how do we dynamically allocate this?
    channels : 1,
    onload: null,
    //then( fnc ) {
    //  ugen.onload = fnc
    //  return ugen
    //},
    immutable: properties !== undefined && properties.immutable === true ? true : false,
    load( filename, __resolve ) {
      let promise = utilities.loadSample( filename, ugen )
      promise.then( _buffer => { 
        proto.memo[ x ] = _buffer
        ugen.name = filename
        ugen.memory.values.length = ugen.dim = _buffer.length

        gen.requestMemory( ugen.memory, ugen.immutable ) 
        gen.memory.heap.set( _buffer, ugen.memory.values.idx )
        if( typeof ugen.onload === 'function' ) ugen.onload( _buffer ) 
        __resolve( ugen )
      })
    },
    memory : {
      values: { length:buffer !== undefined ? buffer.length : 1, idx:null }
    }
  },
  properties
  )

  
  if( properties !== undefined ) {
    if( properties.global !== undefined ) {
      gen.globals[ properties.global ] = ugen
    }
    if( properties.meta === true ) {
      for( let i = 0, length = ugen.buffer.length; i < length; i++ ) {
        Object.defineProperty( ugen, i, {
          get () {
            return peek( ugen, i, { mode:'simple', interp:'none' } )
          },
          set( v ) {
            return poke( ugen, v, i )
          }
        })
      }
    }
  }

  let returnValue
  if( shouldLoad === true ) {
    returnValue = new Promise( (resolve,reject) => {
      //ugen.load( x, resolve )
      let promise = utilities.loadSample( x, ugen )
      promise.then( _buffer => { 
        proto.memo[ x ] = _buffer
        ugen.memory.values.length = ugen.dim = _buffer.length

        ugen.buffer = _buffer
        //gen.once( 'memory init', ()=> {
        //  console.log( "CALLED", ugen.memory )
        //  gen.requestMemory( ugen.memory, ugen.immutable ) 
        //  gen.memory.heap.set( _buffer, ugen.memory.values.idx )
        //  if( typeof ugen.onload === 'function' ) ugen.onload( _buffer ) 
        //})
        
        resolve( ugen )
      })     
    })
  }else if( proto.memo[ x ] !== undefined ) {

    gen.once( 'memory init', ()=> {
      gen.requestMemory( ugen.memory, ugen.immutable ) 
      gen.memory.heap.set( ugen.buffer, ugen.memory.values.idx )
      if( typeof ugen.onload === 'function' ) ugen.onload( ugen.buffer ) 
    })

    returnValue = ugen
  }else{
    returnValue = ugen
  }

  return returnValue 
}


},{"./gen.js":107,"./peek.js":131,"./poke.js":133,"./utilities.js":150}],94:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    sub     = require( './sub.js' ),
    add     = require( './add.js' ),
    mul     = require( './mul.js' ),
    memo    = require( './memo.js' )

module.exports = ( in1 ) => {
  let x1 = history(),
      y1 = history(),
      filter

  //History x1, y1; y = in1 - x1 + y1*0.9997; x1 = in1; y1 = y; out1 = y;
  filter = memo( add( sub( in1, x1.out ), mul( y1.out, .9997 ) ) )
  x1.in( in1 )
  y1.in( filter )

  return filter
}

},{"./add.js":80,"./gen.js":107,"./history.js":111,"./memo.js":119,"./mul.js":125,"./sub.js":144}],95:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    mul     = require( './mul.js' ),
    t60     = require( './t60.js' )

module.exports = ( decayTime = 44100, props ) => {
  let properties = Object.assign({}, { initValue:1 }, props ),
      ssd = history ( properties.initValue )

  ssd.in( mul( ssd.out, t60( decayTime ) ) )

  ssd.out.trigger = ()=> {
    ssd.value = 1
  }

  return ssd.out 
}

},{"./gen.js":107,"./history.js":111,"./mul.js":125,"./t60.js":146}],96:[function(require,module,exports){
'use strict'

const gen  = require( './gen.js'  ),
      data = require( './data.js' ),
      poke = require( './poke.js' ),
      peek = require( './peek.js' ),
      sub  = require( './sub.js'  ),
      wrap = require( './wrap.js' ),
      accum= require( './accum.js'),
      memo = require( './memo.js' )

const proto = {
  basename:'delay',

  gen() {
    let inputs = gen.getInputs( this )
    
    gen.memo[ this.name ] = inputs[0]
    
    return inputs[0]
  },
}

const defaults = { size: 512, interp:'none' }

module.exports = ( in1, taps, properties ) => {
  const ugen = Object.create( proto )
  let writeIdx, readIdx, delaydata

  if( Array.isArray( taps ) === false ) taps = [ taps ]
  
  const props = Object.assign( {}, defaults, properties )

  const maxTapSize = Math.max( ...taps )
  if( props.size < maxTapSize ) props.size = maxTapSize

  delaydata = data( props.size )
  
  ugen.inputs = []

  writeIdx = accum( 1, 0, { max:props.size, min:0 })
  
  for( let i = 0; i < taps.length; i++ ) {
    ugen.inputs[ i ] = peek( delaydata, wrap( sub( writeIdx, taps[i] ), 0, props.size ),{ mode:'samples', interp:props.interp })
  }
  
  ugen.outputs = ugen.inputs // XXX ugh, Ugh, UGH! but i guess it works.

  poke( delaydata, in1, writeIdx )

  ugen.name = `${ugen.basename}${gen.getUID()}`

  return ugen
}

},{"./accum.js":77,"./data.js":93,"./gen.js":107,"./memo.js":119,"./peek.js":131,"./poke.js":133,"./sub.js":144,"./wrap.js":152}],97:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    sub     = require( './sub.js' )

module.exports = ( in1 ) => {
  let n1 = history()
    
  n1.in( in1 )

  let ugen = sub( in1, n1.out )
  ugen.name = 'delta'+gen.getUID()

  return ugen
}

},{"./gen.js":107,"./history.js":111,"./sub.js":144}],98:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

const proto = {
  basename:'div',
  gen() {
    let inputs = gen.getInputs( this ),
        out=`  var ${this.name} = `,
        diff = 0, 
        numCount = 0,
        lastNumber = inputs[ 0 ],
        lastNumberIsUgen = isNaN( lastNumber ), 
        divAtEnd = false

    inputs.forEach( (v,i) => {
      if( i === 0 ) return

      let isNumberUgen = isNaN( v ),
        isFinalIdx   = i === inputs.length - 1

      if( !lastNumberIsUgen && !isNumberUgen ) {
        lastNumber = lastNumber / v
        out += lastNumber
      }else{
        out += `${lastNumber} / ${v}`
      }

      if( !isFinalIdx ) out += ' / ' 
    })

    out += '\n'

    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  }
}

module.exports = (...args) => {
  const div = Object.create( proto )
  
  Object.assign( div, {
    id:     gen.getUID(),
    inputs: args,
  })

  div.name = div.basename + div.id
  
  return div
}

},{"./gen.js":107}],99:[function(require,module,exports){
'use strict'

let gen     = require( './gen' ),
    windows = require( './windows' ),
    data    = require( './data' ),
    peek    = require( './peek' ),
    phasor  = require( './phasor' ),
    defaults = {
      type:'triangular', length:1024, alpha:.15, shift:0, reverse:false 
    }

module.exports = props => {
  
  let properties = Object.assign( {}, defaults, props )
  let buffer = new Float32Array( properties.length )

  let name = properties.type + '_' + properties.length + '_' + properties.shift + '_' + properties.reverse + '_' + properties.alpha
  if( typeof gen.globals.windows[ name ] === 'undefined' ) { 

    for( let i = 0; i < properties.length; i++ ) {
      buffer[ i ] = windows[ properties.type ]( properties.length, i, properties.alpha, properties.shift )
    }

    if( properties.reverse === true ) { 
      buffer.reverse()
    }
    gen.globals.windows[ name ] = data( buffer )
  }

  let ugen = gen.globals.windows[ name ] 
  ugen.name = 'env' + gen.getUID()

  return ugen
}

},{"./data":93,"./gen":107,"./peek":131,"./phasor":132,"./windows":151}],100:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'eq',

  gen() {
    let inputs = gen.getInputs( this ), out

    out = this.inputs[0] === this.inputs[1] ? 1 : `  var ${this.name} = (${inputs[0]} === ${inputs[1]}) | 0\n\n`

    gen.memo[ this.name ] = `${this.name}`

    return [ `${this.name}`, out ]
  },

}

module.exports = ( in1, in2 ) => {
  let ugen = Object.create( proto )
  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ in1, in2 ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":107}],101:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'exp',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: isWorklet ? 'Math.exp' : Math.exp })

      out = `${ref}exp( ${inputs[0]} )`

    } else {
      out = Math.exp( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let exp = Object.create( proto )

  exp.inputs = [ x ]

  return exp
}

},{"./gen.js":107}],102:[function(require,module,exports){
/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

// originally from:
// https://github.com/GoogleChromeLabs/audioworklet-polyfill
// I am modifying it to accept variable buffer sizes
// and to get rid of some strange global initialization that seems required to use it
// with browserify. Also, I added changes to fix a bug in Safari for the AudioWorkletProcessor
// property not having a prototype (see:https://github.com/GoogleChromeLabs/audioworklet-polyfill/pull/25)
// TODO: Why is there an iframe involved? (realm.js)

const Realm = require( './realm.js' )

const AWPF = function( self = window, bufferSize = 4096 ) {
  const PARAMS = []
  let nextPort

  if (typeof AudioWorkletNode !== 'function' || !("audioWorklet" in AudioContext.prototype)) {
    self.AudioWorkletNode = function AudioWorkletNode (context, name, options) {
      const processor = getProcessorsForContext(context)[name];
      const outputChannels = options && options.outputChannelCount ? options.outputChannelCount[0] : 2;
      const scriptProcessor = context.createScriptProcessor( bufferSize, 2, outputChannels);

      scriptProcessor.parameters = new Map();
      if (processor.properties) {
        for (let i = 0; i < processor.properties.length; i++) {
          const prop = processor.properties[i];
          const node = context.createGain().gain;
          node.value = prop.defaultValue;
          // @TODO there's no good way to construct the proxy AudioParam here
          scriptProcessor.parameters.set(prop.name, node);
        }
      }

      const mc = new MessageChannel();
      nextPort = mc.port2;
      const inst = new processor.Processor(options || {});
      nextPort = null;

      scriptProcessor.port = mc.port1;
      scriptProcessor.processor = processor;
      scriptProcessor.instance = inst;
      scriptProcessor.onaudioprocess = onAudioProcess;
      return scriptProcessor;
    };

    Object.defineProperty((self.AudioContext || self.webkitAudioContext).prototype, 'audioWorklet', {
      get () {
        return this.$$audioWorklet || (this.$$audioWorklet = new self.AudioWorklet(this));
      }
    });

    /* XXX - ADDED TO OVERCOME PROBLEM IN SAFARI WHERE AUDIOWORKLETPROCESSOR PROTOTYPE IS NOT AN OBJECT */
    const AudioWorkletProcessor = function() {
      this.port = nextPort
    }
    AudioWorkletProcessor.prototype = {}

    self.AudioWorklet = class AudioWorklet {
      constructor (audioContext) {
        this.$$context = audioContext;
      }

      addModule (url, options) {
        return fetch(url).then(r => {
          if (!r.ok) throw Error(r.status);
          return r.text();
        }).then( code => {
          const context = {
            sampleRate: this.$$context.sampleRate,
            currentTime: this.$$context.currentTime,
            AudioWorkletProcessor,
            registerProcessor: (name, Processor) => {
              const processors = getProcessorsForContext(this.$$context);
              processors[name] = {
                realm,
                context,
                Processor,
                properties: Processor.parameterDescriptors || []
              };
            }
          };

          context.self = context;
          const realm = new Realm(context, document.documentElement);
          realm.exec(((options && options.transpile) || String)(code));
          return null;
        });
      }
    };
  }

  function onAudioProcess (e) {
    const parameters = {};
    let index = -1;
    this.parameters.forEach((value, key) => {
      const arr = PARAMS[++index] || (PARAMS[index] = new Float32Array(this.bufferSize));
      // @TODO proper values here if possible
      arr.fill(value.value);
      parameters[key] = arr;
    });
    this.processor.realm.exec(
      'self.sampleRate=sampleRate=' + this.context.sampleRate + ';' +
      'self.currentTime=currentTime=' + this.context.currentTime
    );
    const inputs = channelToArray(e.inputBuffer);
    const outputs = channelToArray(e.outputBuffer);
    this.instance.process([inputs], [outputs], parameters);
  }

  function channelToArray (ch) {
    const out = [];
    for (let i = 0; i < ch.numberOfChannels; i++) {
      out[i] = ch.getChannelData(i);
    }
    return out;
  }

  function getProcessorsForContext (audioContext) {
    return audioContext.$$processors || (audioContext.$$processors = {});
  }
}

module.exports = AWPF

},{"./realm.js":103}],103:[function(require,module,exports){
/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

module.exports = function Realm (scope, parentElement) {
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:absolute;left:0;top:-999px;width:1px;height:1px;';
  parentElement.appendChild(frame);
  const win = frame.contentWindow;
  const doc = win.document;
  let vars = 'var window,$hook';
  for (const i in win) {
    if (!(i in scope) && i !== 'eval') {
      vars += ',';
      vars += i;
    }
  }
  for (const i in scope) {
    vars += ',';
    vars += i;
    vars += '=self.';
    vars += i;
  }
  const script = doc.createElement('script');
  script.appendChild(doc.createTextNode(
    `function $hook(self,console) {"use strict";
        ${vars};return function() {return eval(arguments[0])}}`
  ));
  doc.body.appendChild(script);
  this.exec = win.$hook.call(scope, scope, console);
}

},{}],104:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'floor',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      //gen.closures.add({ [ this.name ]: Math.floor })

      out = `( ${inputs[0]} | 0 )`

    } else {
      out = inputs[0] | 0
    }
    
    return out
  }
}

module.exports = x => {
  let floor = Object.create( proto )

  floor.inputs = [ x ]

  return floor
}

},{"./gen.js":107}],105:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'fold',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        out

    out = this.createCallback( inputs[0], this.min, this.max ) 

    gen.memo[ this.name ] = this.name + '_value'

    return [ this.name + '_value', out ]
  },

  createCallback( v, lo, hi ) {
    let out =
` var ${this.name}_value = ${v},
      ${this.name}_range = ${hi} - ${lo},
      ${this.name}_numWraps = 0

  if(${this.name}_value >= ${hi}){
    ${this.name}_value -= ${this.name}_range
    if(${this.name}_value >= ${hi}){
      ${this.name}_numWraps = ((${this.name}_value - ${lo}) / ${this.name}_range) | 0
      ${this.name}_value -= ${this.name}_range * ${this.name}_numWraps
    }
    ${this.name}_numWraps++
  } else if(${this.name}_value < ${lo}){
    ${this.name}_value += ${this.name}_range
    if(${this.name}_value < ${lo}){
      ${this.name}_numWraps = ((${this.name}_value - ${lo}) / ${this.name}_range- 1) | 0
      ${this.name}_value -= ${this.name}_range * ${this.name}_numWraps
    }
    ${this.name}_numWraps--
  }
  if(${this.name}_numWraps & 1) ${this.name}_value = ${hi} + ${lo} - ${this.name}_value
`
    return ' ' + out
  }
}

module.exports = ( in1, min=0, max=1 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    min, 
    max,
    uid:    gen.getUID(),
    inputs: [ in1 ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":107}],106:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'gate',
  controlString:null, // insert into output codegen for determining indexing
  gen() {
    let inputs = gen.getInputs( this ), out
    
    gen.requestMemory( this.memory )
    
    let lastInputMemoryIdx = 'memory[ ' + this.memory.lastInput.idx + ' ]',
        outputMemoryStartIdx = this.memory.lastInput.idx + 1,
        inputSignal = inputs[0],
        controlSignal = inputs[1]
    
    /* 
     * we check to see if the current control inputs equals our last input
     * if so, we store the signal input in the memory associated with the currently
     * selected index. If not, we put 0 in the memory associated with the last selected index,
     * change the selected index, and then store the signal in put in the memery assoicated
     * with the newly selected index
     */
    
    out =

` if( ${controlSignal} !== ${lastInputMemoryIdx} ) {
    memory[ ${lastInputMemoryIdx} + ${outputMemoryStartIdx}  ] = 0 
    ${lastInputMemoryIdx} = ${controlSignal}
  }
  memory[ ${outputMemoryStartIdx} + ${controlSignal} ] = ${inputSignal}

`
    this.controlString = inputs[1]
    this.initialized = true

    gen.memo[ this.name ] = this.name

    this.outputs.forEach( v => v.gen() )

    return [ null, ' ' + out ]
  },

  childgen() {
    if( this.parent.initialized === false ) {
      gen.getInputs( this ) // parent gate is only input of a gate output, should only be gen'd once.
    }

    if( gen.memo[ this.name ] === undefined ) {
      gen.requestMemory( this.memory )

      gen.memo[ this.name ] = `memory[ ${this.memory.value.idx} ]`
    }
    
    return  `memory[ ${this.memory.value.idx} ]`
  }
}

module.exports = ( control, in1, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { count: 2 }

  if( typeof properties !== undefined ) Object.assign( defaults, properties )

  Object.assign( ugen, {
    outputs: [],
    uid:     gen.getUID(),
    inputs:  [ in1, control ],
    memory: {
      lastInput: { length:1, idx:null }
    },
    initialized:false
  },
  defaults )
  
  ugen.name = `${ugen.basename}${gen.getUID()}`

  for( let i = 0; i < ugen.count; i++ ) {
    ugen.outputs.push({
      index:i,
      gen: proto.childgen,
      parent:ugen,
      inputs: [ ugen ],
      memory: {
        value: { length:1, idx:null }
      },
      initialized:false,
      name: `${ugen.name}_out${gen.getUID()}`
    })
  }

  return ugen
}

},{"./gen.js":107}],107:[function(require,module,exports){
'use strict'

/* gen.js
 *
 * low-level code generation for unit generators
 *
 */
const MemoryHelper = require( 'memory-helper' )
const EE = require( 'events' ).EventEmitter

const gen = {

  accum:0,
  getUID() { return this.accum++ },
  debug:false,
  samplerate: 44100, // change on audiocontext creation
  shouldLocalize: false,
  graph:null,
  globals:{
    windows: {},
  },
  mode:'worklet',
  
  /* closures
   *
   * Functions that are included as arguments to master callback. Examples: Math.abs, Math.random etc.
   * XXX Should probably be renamed callbackProperties or something similar... closures are no longer used.
   */

  closures: new Set(),
  params:   new Set(),
  inputs:   new Set(),

  parameters: new Set(),
  endBlock: new Set(),
  histories: new Map(),

  memo: {},

  //data: {},
  
  /* export
   *
   * place gen functions into another object for easier reference
   */

  export( obj ) {},

  addToEndBlock( v ) {
    this.endBlock.add( '  ' + v )
  },
  
  requestMemory( memorySpec, immutable=false ) {
    for( let key in memorySpec ) {
      let request = memorySpec[ key ]

      //console.log( 'requesting ' + key + ':' , JSON.stringify( request ) )

      if( request.length === undefined ) {
        console.log( 'undefined length for:', key )

        continue
      }

      request.idx = gen.memory.alloc( request.length, immutable )
    }
  },

  createMemory( amount=4096, type ) {
    const mem = MemoryHelper.create( amount, type )
    return mem
  },

  createCallback( ugen, mem, debug = false, shouldInlineMemory=false, memType = Float64Array ) {
    let isStereo = Array.isArray( ugen ) && ugen.length > 1,
        callback, 
        channel1, channel2

    if( typeof mem === 'number' || mem === undefined ) {
      this.memory = this.createMemory( mem, memType )
    }else{
      this.memory = mem
    }
    
    this.outputIdx = this.memory.alloc( 2, true )
    this.emit( 'memory init' )

    //console.log( 'cb memory:', mem )
    this.graph = ugen
    this.memo = {} 
    this.endBlock.clear()
    this.closures.clear()
    this.inputs.clear()
    this.params.clear()
    this.globals = { windows:{} }
    
    this.parameters.clear()
    
    this.functionBody = "  'use strict'\n"
    if( shouldInlineMemory===false ) {
      this.functionBody += this.mode === 'worklet' ? 
        "  var memory = this.memory\n\n" :
        "  var memory = gen.memory\n\n"
    }

    // call .gen() on the head of the graph we are generating the callback for
    //console.log( 'HEAD', ugen )
    for( let i = 0; i < 1 + isStereo; i++ ) {
      if( typeof ugen[i] === 'number' ) continue

      //let channel = isStereo ? ugen[i].gen() : ugen.gen(),
      let channel = isStereo ? this.getInput( ugen[i] ) : this.getInput( ugen ), 
          body = ''

      // if .gen() returns array, add ugen callback (graphOutput[1]) to our output functions body
      // and then return name of ugen. If .gen() only generates a number (for really simple graphs)
      // just return that number (graphOutput[0]).
      body += Array.isArray( channel ) ? channel[1] + '\n' + channel[0] : channel

      // split body to inject return keyword on last line
      body = body.split('\n')
     
      //if( debug ) console.log( 'functionBody length', body )
      
      // next line is to accommodate memo as graph head
      if( body[ body.length -1 ].trim().indexOf('let') > -1 ) { body.push( '\n' ) } 

      // get index of last line
      let lastidx = body.length - 1

      // insert return keyword
      body[ lastidx ] = '  memory[' + (this.outputIdx + i) + ']  = ' + body[ lastidx ] + '\n'

      this.functionBody += body.join('\n')
    }
    
    this.histories.forEach( value => {
      if( value !== null )
        value.gen()      
    })

    const returnStatement = isStereo ? `  return [ memory[${this.outputIdx}], memory[${this.outputIdx + 1}] ]` : `  return memory[${this.outputIdx}]`
    
    this.functionBody = this.functionBody.split('\n')

    if( this.endBlock.size ) { 
      this.functionBody = this.functionBody.concat( Array.from( this.endBlock ) )
      this.functionBody.push( returnStatement )
    }else{
      this.functionBody.push( returnStatement )
    }
    // reassemble function body
    this.functionBody = this.functionBody.join('\n')

    // we can only dynamically create a named function by dynamically creating another function
    // to construct the named function! sheesh...
    //
    if( shouldInlineMemory === true ) {
      this.parameters.add( 'memory' )
    }

    let paramString = ''
    if( this.mode === 'worklet' ) {
      for( let name of this.parameters.values() ) {
        paramString += name + ','
      }
      paramString = paramString.slice(0,-1)
    }

    const separator = this.parameters.size !== 0 && this.inputs.size > 0 ? ', ' : ''

    let inputString = ''
    if( this.mode === 'worklet' ) {
      for( let ugen of this.inputs.values() ) {
        inputString += ugen.name + ','
      }
      inputString = inputString.slice(0,-1)
    }

    let buildString = this.mode === 'worklet'
      ? `return function( ${inputString} ${separator} ${paramString} ){ \n${ this.functionBody }\n}`
      : `return function gen( ${ [...this.parameters].join(',') } ){ \n${ this.functionBody }\n}`
    
    if( this.debug || debug ) console.log( buildString ) 

    callback = new Function( buildString )()

    // assign properties to named function
    for( let dict of this.closures.values() ) {
      let name = Object.keys( dict )[0],
          value = dict[ name ]

      callback[ name ] = value
    }

    for( let dict of this.params.values() ) {
      let name = Object.keys( dict )[0],
          ugen = dict[ name ]
      
      Object.defineProperty( callback, name, {
        configurable: true,
        get() { return ugen.value },
        set(v){ ugen.value = v }
      })
      //callback[ name ] = value
    }

    callback.members = this.closures
    callback.data = this.data
    callback.params = this.params
    callback.inputs = this.inputs
    callback.parameters = this.parameters//.slice( 0 )
    callback.out = this.memory.heap.subarray( this.outputIdx, this.outputIdx + 2 )
    callback.isStereo = isStereo

    //if( MemoryHelper.isPrototypeOf( this.memory ) ) 
    callback.memory = this.memory.heap

    this.histories.clear()

    return callback
  },
  
  /* getInputs
   *
   * Called by each individual ugen when their .gen() method is called to resolve their various inputs.
   * If an input is a number, return the number. If
   * it is an ugen, call .gen() on the ugen, memoize the result and return the result. If the
   * ugen has previously been memoized return the memoized value.
   *
   */
  getInputs( ugen ) {
    return ugen.inputs.map( gen.getInput ) 
  },

  getInput( input ) {
    let isObject = typeof input === 'object',
        processedInput

    if( isObject ) { // if input is a ugen... 
      //console.log( input.name, gen.memo[ input.name ] )
      if( gen.memo[ input.name ] ) { // if it has been memoized...
        processedInput = gen.memo[ input.name ]
      }else if( Array.isArray( input ) ) {
        gen.getInput( input[0] )
        gen.getInput( input[1] )
      }else{ // if not memoized generate code  
        if( typeof input.gen !== 'function' ) {
          console.log( 'no gen found:', input, input.gen )
          input = input.graph
        }
        let code = input.gen()
        //if( code.indexOf( 'Object' ) > -1 ) console.log( 'bad input:', input, code )
        
        if( Array.isArray( code ) ) {
          if( !gen.shouldLocalize ) {
            gen.functionBody += code[1]
          }else{
            gen.codeName = code[0]
            gen.localizedCode.push( code[1] )
          }
          //console.log( 'after GEN' , this.functionBody )
          processedInput = code[0]
        }else{
          processedInput = code
        }
      }
    }else{ // it input is a number
      processedInput = input
    }

    return processedInput
  },

  startLocalize() {
    this.localizedCode = []
    this.shouldLocalize = true
  },
  endLocalize() {
    this.shouldLocalize = false

    return [ this.codeName, this.localizedCode.slice(0) ]
  },

  free( graph ) {
    if( Array.isArray( graph ) ) { // stereo ugen
      for( let channel of graph ) {
        this.free( channel )
      }
    } else {
      if( typeof graph === 'object' ) {
        if( graph.memory !== undefined ) {
          for( let memoryKey in graph.memory ) {
            this.memory.free( graph.memory[ memoryKey ].idx )
          }
        }
        if( Array.isArray( graph.inputs ) ) {
          for( let ugen of graph.inputs ) {
            this.free( ugen )
          }
        }
      }
    }
  }
}

gen.__proto__ = new EE()

module.exports = gen

},{"events":74,"memory-helper":153}],108:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'gt',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    out = `  var ${this.name} = `  

    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
      out += `(( ${inputs[0]} > ${inputs[1]}) | 0 )`
    } else {
      out += inputs[0] > inputs[1] ? 1 : 0 
    }
    out += '\n\n'

    gen.memo[ this.name ] = this.name

    return [this.name, out]
  }
}

module.exports = (x,y) => {
  let gt = Object.create( proto )

  gt.inputs = [ x,y ]
  gt.name = gt.basename + gen.getUID()

  return gt
}

},{"./gen.js":107}],109:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

let proto = {
  name:'gte',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    out = `  var ${this.name} = `  

    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
      out += `( ${inputs[0]} >= ${inputs[1]} | 0 )`
    } else {
      out += inputs[0] >= inputs[1] ? 1 : 0 
    }
    out += '\n\n'

    gen.memo[ this.name ] = this.name

    return [this.name, out]
  }
}

module.exports = (x,y) => {
  let gt = Object.create( proto )

  gt.inputs = [ x,y ]
  gt.name = 'gte' + gen.getUID()

  return gt
}

},{"./gen.js":107}],110:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'gtp',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
      out = `(${inputs[ 0 ]} * ( ( ${inputs[0]} > ${inputs[1]} ) | 0 ) )` 
    } else {
      out = inputs[0] * ( ( inputs[0] > inputs[1] ) | 0 )
    }
    
    return out
  }
}

module.exports = (x,y) => {
  let gtp = Object.create( proto )

  gtp.inputs = [ x,y ]

  return gtp
}

},{"./gen.js":107}],111:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

module.exports = ( in1=0 ) => {
  let ugen = {
    inputs: [ in1 ],
    memory: { value: { length:1, idx: null } },
    recorder: null,

    in( v ) {
      if( gen.histories.has( v ) ){
        let memoHistory = gen.histories.get( v )
        ugen.name = memoHistory.name
        return memoHistory
      }

      let obj = {
        gen() {
          let inputs = gen.getInputs( ugen )

          if( ugen.memory.value.idx === null ) {
            gen.requestMemory( ugen.memory )
            gen.memory.heap[ ugen.memory.value.idx ] = in1
          }

          let idx = ugen.memory.value.idx
          
          gen.addToEndBlock( 'memory[ ' + idx + ' ] = ' + inputs[ 0 ] )
          
          // return ugen that is being recorded instead of ssd.
          // this effectively makes a call to ssd.record() transparent to the graph.
          // recording is triggered by prior call to gen.addToEndBlock.
          gen.histories.set( v, obj )

          return inputs[ 0 ]
        },
        name: ugen.name + '_in'+gen.getUID(),
        memory: ugen.memory
      }

      this.inputs[ 0 ] = v
      
      ugen.recorder = obj

      return obj
    },
    
    out: {
            
      gen() {
        if( ugen.memory.value.idx === null ) {
          if( gen.histories.get( ugen.inputs[0] ) === undefined ) {
            gen.histories.set( ugen.inputs[0], ugen.recorder )
          }
          gen.requestMemory( ugen.memory )
          gen.memory.heap[ ugen.memory.value.idx ] = parseFloat( in1 )
        }
        let idx = ugen.memory.value.idx
         
        return 'memory[ ' + idx + ' ] '
      },
    },

    uid: gen.getUID(),
  }
  
  ugen.out.memory = ugen.memory 

  ugen.name = 'history' + ugen.uid
  ugen.out.name = ugen.name + '_out'
  ugen.in._name  = ugen.name = '_in'

  Object.defineProperty( ugen, 'value', {
    get() {
      if( this.memory.value.idx !== null ) {
        return gen.memory.heap[ this.memory.value.idx ]
      }
    },
    set( v ) {
      if( this.memory.value.idx !== null ) {
        gen.memory.heap[ this.memory.value.idx ] = v 
      }
    }
  })

  return ugen
}

},{"./gen.js":107}],112:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'ifelse',

  gen() {
    let conditionals = this.inputs[0],
        defaultValue = gen.getInput( conditionals[ conditionals.length - 1] ),
        out = `  var ${this.name}_out = ${defaultValue}\n` 

    //console.log( 'conditionals:', this.name, conditionals )

    //console.log( 'defaultValue:', defaultValue )

    for( let i = 0; i < conditionals.length - 2; i+= 2 ) {
      let isEndBlock = i === conditionals.length - 3,
          cond  = gen.getInput( conditionals[ i ] ),
          preblock = conditionals[ i+1 ],
          block, blockName, output

      //console.log( 'pb', preblock )

      if( typeof preblock === 'number' ){
        block = preblock
        blockName = null
      }else{
        if( gen.memo[ preblock.name ] === undefined ) {
          // used to place all code dependencies in appropriate blocks
          gen.startLocalize()

          gen.getInput( preblock )

          block = gen.endLocalize()
          blockName = block[0]
          block = block[ 1 ].join('')
          block = '  ' + block.replace( /\n/gi, '\n  ' )
        }else{
          block = ''
          blockName = gen.memo[ preblock.name ]
        }
      }

      output = blockName === null ? 
        `  ${this.name}_out = ${block}` :
        `${block}  ${this.name}_out = ${blockName}`
      
      if( i===0 ) out += ' '
      out += 
` if( ${cond} === 1 ) {
${output}
  }`

      if( !isEndBlock ) {
        out += ` else`
      }else{
        out += `\n`
      }
    }

    gen.memo[ this.name ] = `${this.name}_out`

    return [ `${this.name}_out`, out ]
  }
}

module.exports = ( ...args  ) => {
  let ugen = Object.create( proto ),
      conditions = Array.isArray( args[0] ) ? args[0] : args

  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ conditions ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":107}],113:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

let proto = {
  basename:'in',

  gen() {
    const isWorklet = gen.mode === 'worklet'

    if( isWorklet ) {
      gen.inputs.add( this )
    }else{
      gen.parameters.add( this.name )
    }

    gen.memo[ this.name ] = isWorklet === true ? this.name + '[i]' : this.name

    return gen.memo[ this.name ]
  } 
}

module.exports = ( name, inputNumber=0, channelNumber=0, defaultValue=0, min=0, max=1 ) => {
  let input = Object.create( proto )

  input.id   = gen.getUID()
  input.name = name !== undefined ? name : `${input.basename}${input.id}`
  Object.assign( input, { defaultValue, min, max, inputNumber, channelNumber })

  input[0] = {
    gen() {
      if( ! gen.parameters.has( input.name ) ) gen.parameters.add( input.name )
      return input.name + '[0]'
    }
  }
  input[1] = {
    gen() {
      if( ! gen.parameters.has( input.name ) ) gen.parameters.add( input.name )
      return input.name + '[1]'
    }
  }


  return input
}

},{"./gen.js":107}],114:[function(require,module,exports){
'use strict'

const library = {
  export( destination ) {
    if( destination === window ) {
      destination.ssd = library.history    // history is window object property, so use ssd as alias
      destination.input = library.in       // in is a keyword in javascript
      destination.ternary = library.switch // switch is a keyword in javascript

      delete library.history
      delete library.in
      delete library.switch
    }

    Object.assign( destination, library )

    Object.defineProperty( library, 'samplerate', {
      get() { return library.gen.samplerate },
      set(v) {}
    })

    library.in = destination.input
    library.history = destination.ssd
    library.switch = destination.ternary

    destination.clip = library.clamp
  },

  gen:      require( './gen.js' ),
  
  abs:      require( './abs.js' ),
  round:    require( './round.js' ),
  param:    require( './param.js' ),
  add:      require( './add.js' ),
  sub:      require( './sub.js' ),
  mul:      require( './mul.js' ),
  div:      require( './div.js' ),
  accum:    require( './accum.js' ),
  counter:  require( './counter.js' ),
  sin:      require( './sin.js' ),
  cos:      require( './cos.js' ),
  tan:      require( './tan.js' ),
  tanh:     require( './tanh.js' ),
  asin:     require( './asin.js' ),
  acos:     require( './acos.js' ),
  atan:     require( './atan.js' ),  
  phasor:   require( './phasor.js' ),
  data:     require( './data.js' ),
  peek:     require( './peek.js' ),
  cycle:    require( './cycle.js' ),
  history:  require( './history.js' ),
  delta:    require( './delta.js' ),
  floor:    require( './floor.js' ),
  ceil:     require( './ceil.js' ),
  min:      require( './min.js' ),
  max:      require( './max.js' ),
  sign:     require( './sign.js' ),
  dcblock:  require( './dcblock.js' ),
  memo:     require( './memo.js' ),
  rate:     require( './rate.js' ),
  wrap:     require( './wrap.js' ),
  mix:      require( './mix.js' ),
  clamp:    require( './clamp.js' ),
  poke:     require( './poke.js' ),
  delay:    require( './delay.js' ),
  fold:     require( './fold.js' ),
  mod :     require( './mod.js' ),
  sah :     require( './sah.js' ),
  noise:    require( './noise.js' ),
  not:      require( './not.js' ),
  gt:       require( './gt.js' ),
  gte:      require( './gte.js' ),
  lt:       require( './lt.js' ), 
  lte:      require( './lte.js' ), 
  bool:     require( './bool.js' ),
  gate:     require( './gate.js' ),
  train:    require( './train.js' ),
  slide:    require( './slide.js' ),
  in:       require( './in.js' ),
  t60:      require( './t60.js'),
  mtof:     require( './mtof.js'),
  ltp:      require( './ltp.js'),        // TODO: test
  gtp:      require( './gtp.js'),        // TODO: test
  switch:   require( './switch.js' ),
  mstosamps:require( './mstosamps.js' ), // TODO: needs test,
  selector: require( './selector.js' ),
  utilities:require( './utilities.js' ),
  pow:      require( './pow.js' ),
  attack:   require( './attack.js' ),
  decay:    require( './decay.js' ),
  windows:  require( './windows.js' ),
  env:      require( './env.js' ),
  ad:       require( './ad.js'  ),
  adsr:     require( './adsr.js' ),
  ifelse:   require( './ifelseif.js' ),
  bang:     require( './bang.js' ),
  and:      require( './and.js' ),
  pan:      require( './pan.js' ),
  eq:       require( './eq.js' ),
  neq:      require( './neq.js' ),
  exp:      require( './exp.js' ),
  process:  require( './process.js' ),
  seq:      require( './seq.js' )
}

library.gen.lib = library

module.exports = library

},{"./abs.js":76,"./accum.js":77,"./acos.js":78,"./ad.js":79,"./add.js":80,"./adsr.js":81,"./and.js":82,"./asin.js":83,"./atan.js":84,"./attack.js":85,"./bang.js":86,"./bool.js":87,"./ceil.js":88,"./clamp.js":89,"./cos.js":90,"./counter.js":91,"./cycle.js":92,"./data.js":93,"./dcblock.js":94,"./decay.js":95,"./delay.js":96,"./delta.js":97,"./div.js":98,"./env.js":99,"./eq.js":100,"./exp.js":101,"./floor.js":104,"./fold.js":105,"./gate.js":106,"./gen.js":107,"./gt.js":108,"./gte.js":109,"./gtp.js":110,"./history.js":111,"./ifelseif.js":112,"./in.js":113,"./lt.js":115,"./lte.js":116,"./ltp.js":117,"./max.js":118,"./memo.js":119,"./min.js":120,"./mix.js":121,"./mod.js":122,"./mstosamps.js":123,"./mtof.js":124,"./mul.js":125,"./neq.js":126,"./noise.js":127,"./not.js":128,"./pan.js":129,"./param.js":130,"./peek.js":131,"./phasor.js":132,"./poke.js":133,"./pow.js":134,"./process.js":135,"./rate.js":136,"./round.js":137,"./sah.js":138,"./selector.js":139,"./seq.js":140,"./sign.js":141,"./sin.js":142,"./slide.js":143,"./sub.js":144,"./switch.js":145,"./t60.js":146,"./tan.js":147,"./tanh.js":148,"./train.js":149,"./utilities.js":150,"./windows.js":151,"./wrap.js":152}],115:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'lt',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    out = `  var ${this.name} = `  

    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
      out += `(( ${inputs[0]} < ${inputs[1]}) | 0  )`
    } else {
      out += inputs[0] < inputs[1] ? 1 : 0 
    }
    out += '\n'

    gen.memo[ this.name ] = this.name

    return [this.name, out]
    
    return out
  }
}

module.exports = (x,y) => {
  let lt = Object.create( proto )

  lt.inputs = [ x,y ]
  lt.name = lt.basename + gen.getUID()

  return lt
}

},{"./gen.js":107}],116:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'lte',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    out = `  var ${this.name} = `  

    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
      out += `( ${inputs[0]} <= ${inputs[1]} | 0  )`
    } else {
      out += inputs[0] <= inputs[1] ? 1 : 0 
    }
    out += '\n'

    gen.memo[ this.name ] = this.name

    return [this.name, out]
    
    return out
  }
}

module.exports = (x,y) => {
  let lt = Object.create( proto )

  lt.inputs = [ x,y ]
  lt.name = 'lte' + gen.getUID()

  return lt
}

},{"./gen.js":107}],117:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'ltp',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
      out = `(${inputs[ 0 ]} * (( ${inputs[0]} < ${inputs[1]} ) | 0 ) )` 
    } else {
      out = inputs[0] * (( inputs[0] < inputs[1] ) | 0 )
    }
    
    return out
  }
}

module.exports = (x,y) => {
  let ltp = Object.create( proto )

  ltp.inputs = [ x,y ]

  return ltp
}

},{"./gen.js":107}],118:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'max',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    if( isNaN( inputs[0] ) || isNaN( inputs[1] ) ) {
      gen.closures.add({ [ this.name ]: isWorklet ? 'Math.max' : Math.max })

      out = `${ref}max( ${inputs[0]}, ${inputs[1]} )`

    } else {
      out = Math.max( parseFloat( inputs[0] ), parseFloat( inputs[1] ) )
    }
    
    return out
  }
}

module.exports = (x,y) => {
  let max = Object.create( proto )

  max.inputs = [ x,y ]

  return max
}

},{"./gen.js":107}],119:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

let proto = {
  basename:'memo',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    out = `  var ${this.name} = ${inputs[0]}\n`

    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  } 
}

module.exports = (in1,memoName) => {
  let memo = Object.create( proto )
  
  memo.inputs = [ in1 ]
  memo.id   = gen.getUID()
  memo.name = memoName !== undefined ? memoName + '_' + gen.getUID() : `${memo.basename}${memo.id}`

  return memo
}

},{"./gen.js":107}],120:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'min',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    if( isNaN( inputs[0] ) || isNaN( inputs[1] ) ) {
      gen.closures.add({ [ this.name ]: isWorklet ? 'Math.min' : Math.min })

      out = `${ref}min( ${inputs[0]}, ${inputs[1]} )`

    } else {
      out = Math.min( parseFloat( inputs[0] ), parseFloat( inputs[1] ) )
    }
    
    return out
  }
}

module.exports = (x,y) => {
  let min = Object.create( proto )

  min.inputs = [ x,y ]

  return min
}

},{"./gen.js":107}],121:[function(require,module,exports){
'use strict'

let gen = require('./gen.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js'),
    memo= require('./memo.js')

module.exports = ( in1, in2, t=.5 ) => {
  let ugen = memo( add( mul(in1, sub(1,t ) ), mul( in2, t ) ) )
  ugen.name = 'mix' + gen.getUID()

  return ugen
}

},{"./add.js":80,"./gen.js":107,"./memo.js":119,"./mul.js":125,"./sub.js":144}],122:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

module.exports = (...args) => {
  let mod = {
    id:     gen.getUID(),
    inputs: args,

    gen() {
      let inputs = gen.getInputs( this ),
          out='(',
          diff = 0, 
          numCount = 0,
          lastNumber = inputs[ 0 ],
          lastNumberIsUgen = isNaN( lastNumber ), 
          modAtEnd = false

      inputs.forEach( (v,i) => {
        if( i === 0 ) return

        let isNumberUgen = isNaN( v ),
            isFinalIdx   = i === inputs.length - 1

        if( !lastNumberIsUgen && !isNumberUgen ) {
          lastNumber = lastNumber % v
          out += lastNumber
        }else{
          out += `${lastNumber} % ${v}`
        }

        if( !isFinalIdx ) out += ' % ' 
      })

      out += ')'

      return out
    }
  }
  
  return mod
}

},{"./gen.js":107}],123:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'mstosamps',

  gen() {
    let out,
        inputs = gen.getInputs( this ),
        returnValue

    if( isNaN( inputs[0] ) ) {
      out = `  var ${this.name } = ${gen.samplerate} / 1000 * ${inputs[0]} \n\n`
     
      gen.memo[ this.name ] = out
      
      returnValue = [ this.name, out ]
    } else {
      out = gen.samplerate / 1000 * this.inputs[0]

      returnValue = out
    }    

    return returnValue
  }
}

module.exports = x => {
  let mstosamps = Object.create( proto )

  mstosamps.inputs = [ x ]
  mstosamps.name = proto.basename + gen.getUID()

  return mstosamps
}

},{"./gen.js":107}],124:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'mtof',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: Math.exp })

      out = `( ${this.tuning} * gen.exp( .057762265 * (${inputs[0]} - 69) ) )`

    } else {
      out = this.tuning * Math.exp( .057762265 * ( inputs[0] - 69) )
    }
    
    return out
  }
}

module.exports = ( x, props ) => {
  let ugen = Object.create( proto ),
      defaults = { tuning:440 }
  
  if( props !== undefined ) Object.assign( props.defaults )

  Object.assign( ugen, defaults )
  ugen.inputs = [ x ]
  

  return ugen
}

},{"./gen.js":107}],125:[function(require,module,exports){
'use strict'

const gen = require('./gen.js')

const proto = {
  basename: 'mul',

  gen() {
    let inputs = gen.getInputs( this ),
        out = `  var ${this.name} = `,
        sum = 1, numCount = 0, mulAtEnd = false, alreadyFullSummed = true

    inputs.forEach( (v,i) => {
      if( isNaN( v ) ) {
        out += v
        if( i < inputs.length -1 ) {
          mulAtEnd = true
          out += ' * '
        }
        alreadyFullSummed = false
      }else{
        if( i === 0 ) {
          sum = v
        }else{
          sum *= parseFloat( v )
        }
        numCount++
      }
    })

    if( numCount > 0 ) {
      out += mulAtEnd || alreadyFullSummed ? sum : ' * ' + sum
    }

    out += '\n'

    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  }
}

module.exports = ( ...args ) => {
  const mul = Object.create( proto )
  
  Object.assign( mul, {
      id:     gen.getUID(),
      inputs: args,
  })
  
  mul.name = mul.basename + mul.id

  return mul
}

},{"./gen.js":107}],126:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'neq',

  gen() {
    let inputs = gen.getInputs( this ), out

    out = /*this.inputs[0] !== this.inputs[1] ? 1 :*/ `  var ${this.name} = (${inputs[0]} !== ${inputs[1]}) | 0\n\n`

    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  },

}

module.exports = ( in1, in2 ) => {
  let ugen = Object.create( proto )
  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ in1, in2 ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":107}],127:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'noise',

  gen() {
    let out

    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    gen.closures.add({ 'noise' : isWorklet ? 'Math.random' : Math.random })

    out = `  var ${this.name} = ${ref}noise()\n`
    
    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  }
}

module.exports = x => {
  let noise = Object.create( proto )
  noise.name = proto.name + gen.getUID()

  return noise
}

},{"./gen.js":107}],128:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'not',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( this.inputs[0] ) ) {
      out = `( ${inputs[0]} === 0 ? 1 : 0 )`
    } else {
      out = !inputs[0] === 0 ? 1 : 0
    }
    
    return out
  }
}

module.exports = x => {
  let not = Object.create( proto )

  not.inputs = [ x ]

  return not
}

},{"./gen.js":107}],129:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' ),
    data = require( './data.js' ),
    peek = require( './peek.js' ),
    mul  = require( './mul.js' )

let proto = {
  basename:'pan', 
  initTable() {    
    let bufferL = new Float32Array( 1024 ),
        bufferR = new Float32Array( 1024 )

    const angToRad = Math.PI / 180
    for( let i = 0; i < 1024; i++ ) { 
      let pan = i * ( 90 / 1024 )
      bufferL[i] = Math.cos( pan * angToRad ) 
      bufferR[i] = Math.sin( pan * angToRad )
    }

    gen.globals.panL = data( bufferL, 1, { immutable:true })
    gen.globals.panR = data( bufferR, 1, { immutable:true })
  }

}

module.exports = ( leftInput, rightInput, pan =.5, properties ) => {
  if( gen.globals.panL === undefined ) proto.initTable()

  let ugen = Object.create( proto )

  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ leftInput, rightInput ],
    left:    mul( leftInput, peek( gen.globals.panL, pan, { boundmode:'clamp' }) ),
    right:   mul( rightInput, peek( gen.globals.panR, pan, { boundmode:'clamp' }) )
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./data.js":93,"./gen.js":107,"./mul.js":125,"./peek.js":131}],130:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

let proto = {
  basename: 'param',

  gen() {
    gen.requestMemory( this.memory )
    
    gen.params.add( this )

    const isWorklet = gen.mode === 'worklet'

    if( isWorklet ) gen.parameters.add( this.name )

    this.value = this.initialValue

    gen.memo[ this.name ] = isWorklet ? this.name : `memory[${this.memory.value.idx}]`

    return gen.memo[ this.name ]
  } 
}

module.exports = ( propName=0, value=0, min=0, max=1 ) => {
  let ugen = Object.create( proto )
  
  if( typeof propName !== 'string' ) {
    ugen.name = ugen.basename + gen.getUID()
    ugen.initialValue = propName
  }else{
    ugen.name = propName
    ugen.initialValue = value
  }

  ugen.min = min
  ugen.max = max
  ugen.defaultValue = ugen.initialValue

  // for storing worklet nodes once they're instantiated
  ugen.waapi = null

  ugen.isWorklet = gen.mode === 'worklet'

  Object.defineProperty( ugen, 'value', {
    get() {
      if( this.memory.value.idx !== null ) {
        return gen.memory.heap[ this.memory.value.idx ]
      }else{
        return this.initialValue
      }
    },
    set( v ) {
      if( this.memory.value.idx !== null ) {
        if( this.isWorklet && this.waapi !== null ) {
          this.waapi.value = v
        }else{
          gen.memory.heap[ this.memory.value.idx ] = v
        } 
      }
    }
  })

  ugen.memory = {
    value: { length:1, idx:null }
  }

  return ugen
}

},{"./gen.js":107}],131:[function(require,module,exports){

const gen  = require('./gen.js'),
      dataUgen = require('./data.js')

let proto = {
  basename:'peek',

  gen() {
    let genName = 'gen.' + this.name,
        inputs = gen.getInputs( this ),
        out, functionBody, next, lengthIsLog2, idx
    
    idx = inputs[1]
    lengthIsLog2 = (Math.log2( this.data.buffer.length ) | 0)  === Math.log2( this.data.buffer.length )

    if( this.mode !== 'simple' ) {

    functionBody = `  var ${this.name}_dataIdx  = ${idx}, 
      ${this.name}_phase = ${this.mode === 'samples' ? inputs[0] : inputs[0] + ' * ' + (this.data.buffer.length) }, 
      ${this.name}_index = ${this.name}_phase | 0,\n`

    if( this.boundmode === 'wrap' ) {
      next = lengthIsLog2 ?
      `( ${this.name}_index + 1 ) & (${this.data.buffer.length} - 1)` :
      `${this.name}_index + 1 >= ${this.data.buffer.length} ? ${this.name}_index + 1 - ${this.data.buffer.length} : ${this.name}_index + 1`
    }else if( this.boundmode === 'clamp' ) {
      next = 
        `${this.name}_index + 1 >= ${this.data.buffer.length - 1} ? ${this.data.buffer.length - 1} : ${this.name}_index + 1`
    } else if( this.boundmode === 'fold' || this.boundmode === 'mirror' ) {
      next = 
        `${this.name}_index + 1 >= ${this.data.buffer.length - 1} ? ${this.name}_index - ${this.data.buffer.length - 1} : ${this.name}_index + 1`
    }else{
       next = 
      `${this.name}_index + 1`     
    }

    if( this.interp === 'linear' ) {      
    functionBody += `      ${this.name}_frac  = ${this.name}_phase - ${this.name}_index,
      ${this.name}_base  = memory[ ${this.name}_dataIdx +  ${this.name}_index ],
      ${this.name}_next  = ${next},`
      
      if( this.boundmode === 'ignore' ) {
        functionBody += `
      ${this.name}_out   = ${this.name}_index >= ${this.data.buffer.length - 1} || ${this.name}_index < 0 ? 0 : ${this.name}_base + ${this.name}_frac * ( memory[ ${this.name}_dataIdx + ${this.name}_next ] - ${this.name}_base )\n\n`
      }else{
        functionBody += `
      ${this.name}_out   = ${this.name}_base + ${this.name}_frac * ( memory[ ${this.name}_dataIdx + ${this.name}_next ] - ${this.name}_base )\n\n`
      }
    }else{
      functionBody += `      ${this.name}_out = memory[ ${this.name}_dataIdx + ${this.name}_index ]\n\n`
    }

    } else { // mode is simple
      functionBody = `memory[ ${idx} + ${ inputs[0] } ]`
      
      return functionBody
    }

    gen.memo[ this.name ] = this.name + '_out'

    return [ this.name+'_out', functionBody ]
  },

  defaults : { channels:1, mode:'phase', interp:'linear', boundmode:'wrap' }
}

module.exports = ( input_data, index=0, properties ) => {
  let ugen = Object.create( proto )

  //console.log( dataUgen, gen.data )

  // XXX why is dataUgen not the actual function? some type of browserify nonsense...
  const finalData = typeof input_data.basename === 'undefined' ? gen.lib.data( input_data ) : input_data

  Object.assign( ugen, 
    { 
      'data':     finalData,
      dataName:   finalData.name,
      uid:        gen.getUID(),
      inputs:     [ index, finalData ],
    },
    proto.defaults,
    properties 
  )
  
  ugen.name = ugen.basename + ugen.uid

  return ugen
}


},{"./data.js":93,"./gen.js":107}],132:[function(require,module,exports){
'use strict'

let gen   = require( './gen.js' ),
    accum = require( './accum.js' ),
    mul   = require( './mul.js' ),
    proto = { basename:'phasor' },
    div   = require( './div.js' )

const defaults = { min: -1, max: 1 }

module.exports = ( frequency = 1, reset = 0, _props ) => {
  const props = Object.assign( {}, defaults, _props )

  const range = props.max - props.min

  const ugen = typeof frequency === 'number' 
    ? accum( (frequency * range) / gen.samplerate, reset, props ) 
    : accum( 
        div( 
          mul( frequency, range ),
          gen.samplerate
        ), 
        reset, props 
    )

  ugen.name = proto.basename + gen.getUID()

  return ugen
}

},{"./accum.js":77,"./div.js":98,"./gen.js":107,"./mul.js":125}],133:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js'),
    mul  = require('./mul.js'),
    wrap = require('./wrap.js')

let proto = {
  basename:'poke',

  gen() {
    let dataName = 'memory',
        inputs = gen.getInputs( this ),
        idx, out, wrapped
    
    idx = this.data.gen()

    //gen.requestMemory( this.memory )
    //wrapped = wrap( this.inputs[1], 0, this.dataLength ).gen()
    //idx = wrapped[0]
    //gen.functionBody += wrapped[1]
    let outputStr = this.inputs[1] === 0 ?
      `  ${dataName}[ ${idx} ] = ${inputs[0]}\n` :
      `  ${dataName}[ ${idx} + ${inputs[1]} ] = ${inputs[0]}\n`

    if( this.inline === undefined ) {
      gen.functionBody += outputStr
    }else{
      return [ this.inline, outputStr ]
    }
  }
}
module.exports = ( data, value, index, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { channels:1 } 

  if( properties !== undefined ) Object.assign( defaults, properties )

  Object.assign( ugen, { 
    data,
    dataName:   data.name,
    dataLength: data.buffer.length,
    uid:        gen.getUID(),
    inputs:     [ value, index ],
  },
  defaults )


  ugen.name = ugen.basename + ugen.uid
  
  gen.histories.set( ugen.name, ugen )

  return ugen
}

},{"./gen.js":107,"./mul.js":125,"./wrap.js":152}],134:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'pow',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    if( isNaN( inputs[0] ) || isNaN( inputs[1] ) ) {
      gen.closures.add({ 'pow': isWorklet ? 'Math.pow' : Math.pow })

      out = `${ref}pow( ${inputs[0]}, ${inputs[1]} )` 

    } else {
      if( typeof inputs[0] === 'string' && inputs[0][0] === '(' ) {
        inputs[0] = inputs[0].slice(1,-1)
      }
      if( typeof inputs[1] === 'string' && inputs[1][0] === '(' ) {
        inputs[1] = inputs[1].slice(1,-1)
      }

      out = Math.pow( parseFloat( inputs[0] ), parseFloat( inputs[1]) )
    }
    
    return out
  }
}

module.exports = (x,y) => {
  let pow = Object.create( proto )

  pow.inputs = [ x,y ]
  pow.id = gen.getUID()
  pow.name = `${pow.basename}{pow.id}`

  return pow
}

},{"./gen.js":107}],135:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')
const proto = {
  basename:'process',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    gen.closures.add({ [''+this.funcname] : this.func })

    out = `  var ${this.name} = gen['${this.funcname}'](`

    inputs.forEach( (v,i,arr ) => {
      out += arr[ i ]
      if( i < arr.length - 1 ) out += ','
    })

    out += ')\n'

    gen.memo[ this.name ] = this.name

    return [this.name, out]
    
    return out
  }
}

module.exports = (...args) => {
  const process = {}// Object.create( proto )
  const id = gen.getUID()
  process.name = 'process' + id 

  process.func = new Function( ...args )

  //gen.globals[ process.name ] = process.func

  process.call = function( ...args  ) {
    const output = Object.create( proto )
    output.funcname = process.name
    output.func = process.func
    output.name = 'process_out_' + id
    output.process = process

    output.inputs = args

    return output
  }

  return process 
}

},{"./gen.js":107}],136:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    sub     = require( './sub.js' ),
    add     = require( './add.js' ),
    mul     = require( './mul.js' ),
    memo    = require( './memo.js' ),
    delta   = require( './delta.js' ),
    wrap    = require( './wrap.js' )

let proto = {
  basename:'rate',

  gen() {
    let inputs = gen.getInputs( this ),
        phase  = history(),
        inMinus1 = history(),
        genName = 'gen.' + this.name,
        filter, sum, out

    gen.closures.add({ [ this.name ]: this }) 

    out = 
` var ${this.name}_diff = ${inputs[0]} - ${genName}.lastSample
  if( ${this.name}_diff < -.5 ) ${this.name}_diff += 1
  ${genName}.phase += ${this.name}_diff * ${inputs[1]}
  if( ${genName}.phase > 1 ) ${genName}.phase -= 1
  ${genName}.lastSample = ${inputs[0]}
`
    out = ' ' + out

    return [ genName + '.phase', out ]
  }
}

module.exports = ( in1, rate ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    phase:      0,
    lastSample: 0,
    uid:        gen.getUID(),
    inputs:     [ in1, rate ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./add.js":80,"./delta.js":97,"./gen.js":107,"./history.js":111,"./memo.js":119,"./mul.js":125,"./sub.js":144,"./wrap.js":152}],137:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'round',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: isWorklet ? 'Math.round' : Math.round })

      out = `${ref}round( ${inputs[0]} )`

    } else {
      out = Math.round( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let round = Object.create( proto )

  round.inputs = [ x ]

  return round
}

},{"./gen.js":107}],138:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' )

let proto = {
  basename:'sah',

  gen() {
    let inputs = gen.getInputs( this ), out

    //gen.data[ this.name ] = 0
    //gen.data[ this.name + '_control' ] = 0

    gen.requestMemory( this.memory )


    out = 
` var ${this.name}_control = memory[${this.memory.control.idx}],
      ${this.name}_trigger = ${inputs[1]} > ${inputs[2]} ? 1 : 0

  if( ${this.name}_trigger !== ${this.name}_control  ) {
    if( ${this.name}_trigger === 1 ) 
      memory[${this.memory.value.idx}] = ${inputs[0]}
    
    memory[${this.memory.control.idx}] = ${this.name}_trigger
  }
`
    
    gen.memo[ this.name ] = `memory[${this.memory.value.idx}]`//`gen.data.${this.name}`

    return [ `memory[${this.memory.value.idx}]`, ' ' +out ]
  }
}

module.exports = ( in1, control, threshold=0, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { init:0 }

  if( properties !== undefined ) Object.assign( defaults, properties )

  Object.assign( ugen, { 
    lastSample: 0,
    uid:        gen.getUID(),
    inputs:     [ in1, control,threshold ],
    memory: {
      control: { idx:null, length:1 },
      value:   { idx:null, length:1 },
    }
  },
  defaults )
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":107}],139:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'selector',

  gen() {
    let inputs = gen.getInputs( this ), out, returnValue = 0
    
    switch( inputs.length ) {
      case 2 :
        returnValue = inputs[1]
        break;
      case 3 :
        out = `  var ${this.name}_out = ${inputs[0]} === 1 ? ${inputs[1]} : ${inputs[2]}\n\n`;
        returnValue = [ this.name + '_out', out ]
        break;  
      default:
        out = 
` var ${this.name}_out = 0
  switch( ${inputs[0]} + 1 ) {\n`

        for( let i = 1; i < inputs.length; i++ ){
          out +=`    case ${i}: ${this.name}_out = ${inputs[i]}; break;\n` 
        }

        out += '  }\n\n'
        
        returnValue = [ this.name + '_out', ' ' + out ]
    }

    gen.memo[ this.name ] = this.name + '_out'

    return returnValue
  },
}

module.exports = ( ...inputs ) => {
  let ugen = Object.create( proto )
  
  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":107}],140:[function(require,module,exports){
'use strict'

let gen   = require( './gen.js' ),
    accum = require( './accum.js' ),
    counter= require( './counter.js' ),
    peek  = require( './peek.js' ),
    ssd   = require( './history.js' ),
    data  = require( './data.js' ),
    proto = { basename:'seq' }

module.exports = ( durations = 11025, values = [0,1], phaseIncrement = 1) => {
  let clock
  
  if( Array.isArray( durations ) ) {
    // we want a counter that is using our current
    // rate value, but we want the rate value to be derived from
    // the counter. must insert a single-sample dealy to avoid
    // infinite loop.
    const clock2 = counter( 0, 0, durations.length )
    const __durations = peek( data( durations ), clock2, { mode:'simple' }) 
    clock = counter( phaseIncrement, 0, __durations )
    
    // add one sample delay to avoid codegen loop
    const s = ssd()
    s.in( clock.wrap )
    clock2.inputs[0] = s.out
  }else{
    // if the rate argument is a single value we don't need to
    // do anything tricky.
    clock = counter( phaseIncrement, 0, durations )
  }
  
  const stepper = accum( clock.wrap, 0, { min:0, max:values.length })
   
  const ugen = peek( data( values ), stepper, { mode:'simple' })

  ugen.name = proto.basename + gen.getUID()
  ugen.trigger = clock.wrap

  return ugen
}

},{"./accum.js":77,"./counter.js":91,"./data.js":93,"./gen.js":107,"./history.js":111,"./peek.js":131}],141:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'sign',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: isWorklet ? 'Math.sign' : Math.sign })

      out = `${ref}sign( ${inputs[0]} )`

    } else {
      out = Math.sign( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let sign = Object.create( proto )

  sign.inputs = [ x ]

  return sign
}

},{"./gen.js":107}],142:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'sin',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'sin': isWorklet ? 'Math.sin' : Math.sin })

      out = `${ref}sin( ${inputs[0]} )` 

    } else {
      out = Math.sin( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let sin = Object.create( proto )

  sin.inputs = [ x ]
  sin.id = gen.getUID()
  sin.name = `${sin.basename}{sin.id}`

  return sin
}

},{"./gen.js":107}],143:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    sub     = require( './sub.js' ),
    add     = require( './add.js' ),
    mul     = require( './mul.js' ),
    memo    = require( './memo.js' ),
    gt      = require( './gt.js' ),
    div     = require( './div.js' ),
    _switch = require( './switch.js' )

module.exports = ( in1, slideUp = 1, slideDown = 1 ) => {
  let y1 = history(0),
      filter, slideAmount

  //y (n) = y (n-1) + ((x (n) - y (n-1))/slide) 
  slideAmount = _switch( gt(in1,y1.out), slideUp, slideDown )

  filter = memo( add( y1.out, div( sub( in1, y1.out ), slideAmount ) ) )

  y1.in( filter )

  return filter
}

},{"./add.js":80,"./div.js":98,"./gen.js":107,"./gt.js":108,"./history.js":111,"./memo.js":119,"./mul.js":125,"./sub.js":144,"./switch.js":145}],144:[function(require,module,exports){
'use strict'

const gen = require('./gen.js')

const proto = {
  basename:'sub',
  gen() {
    let inputs = gen.getInputs( this ),
        out=0,
        diff = 0,
        needsParens = false, 
        numCount = 0,
        lastNumber = inputs[ 0 ],
        lastNumberIsUgen = isNaN( lastNumber ), 
        subAtEnd = false,
        hasUgens = false,
        returnValue = 0

    this.inputs.forEach( value => { if( isNaN( value ) ) hasUgens = true })

    out = '  var ' + this.name + ' = '

    inputs.forEach( (v,i) => {
      if( i === 0 ) return

      let isNumberUgen = isNaN( v ),
          isFinalIdx   = i === inputs.length - 1

      if( !lastNumberIsUgen && !isNumberUgen ) {
        lastNumber = lastNumber - v
        out += lastNumber
        return
      }else{
        needsParens = true
        out += `${lastNumber} - ${v}`
      }

      if( !isFinalIdx ) out += ' - ' 
    })

    out += '\n'

    returnValue = [ this.name, out ]

    gen.memo[ this.name ] = this.name

    return returnValue
  }

}

module.exports = ( ...args ) => {
  let sub = Object.create( proto )

  Object.assign( sub, {
    id:     gen.getUID(),
    inputs: args
  })
       
  sub.name = 'sub' + sub.id

  return sub
}

},{"./gen.js":107}],145:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'switch',

  gen() {
    let inputs = gen.getInputs( this ), out

    if( inputs[1] === inputs[2] ) return inputs[1] // if both potential outputs are the same just return one of them
    
    out = `  var ${this.name}_out = ${inputs[0]} === 1 ? ${inputs[1]} : ${inputs[2]}\n`

    gen.memo[ this.name ] = `${this.name}_out`

    return [ `${this.name}_out`, out ]
  },

}

module.exports = ( control, in1 = 1, in2 = 0 ) => {
  let ugen = Object.create( proto )
  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ control, in1, in2 ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":107}],146:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'t60',

  gen() {
    let out,
        inputs = gen.getInputs( this ),
        returnValue

    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ 'exp' ]: isWorklet ? 'Math.exp' : Math.exp })

      out = `  var ${this.name} = ${ref}exp( -6.907755278921 / ${inputs[0]} )\n\n`
     
      gen.memo[ this.name ] = out
      
      returnValue = [ this.name, out ]
    } else {
      out = Math.exp( -6.907755278921 / inputs[0] )

      returnValue = out
    }    

    return returnValue
  }
}

module.exports = x => {
  let t60 = Object.create( proto )

  t60.inputs = [ x ]
  t60.name = proto.basename + gen.getUID()

  return t60
}

},{"./gen.js":107}],147:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'tan',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'tan': isWorklet ? 'Math.tan' : Math.tan })

      out = `${ref}tan( ${inputs[0]} )` 

    } else {
      out = Math.tan( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let tan = Object.create( proto )

  tan.inputs = [ x ]
  tan.id = gen.getUID()
  tan.name = `${tan.basename}{tan.id}`

  return tan
}

},{"./gen.js":107}],148:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'tanh',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'tanh': isWorklet ? 'Math.tan' : Math.tanh })

      out = `${ref}tanh( ${inputs[0]} )` 

    } else {
      out = Math.tanh( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let tanh = Object.create( proto )

  tanh.inputs = [ x ]
  tanh.id = gen.getUID()
  tanh.name = `${tanh.basename}{tanh.id}`

  return tanh
}

},{"./gen.js":107}],149:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' ),
    lt      = require( './lt.js' ),
    accum   = require( './accum.js' ),
    div     = require( './div.js' )

module.exports = ( frequency=440, pulsewidth=.5 ) => {
  let graph = lt( accum( div( frequency, 44100 ) ), pulsewidth )

  graph.name = `train${gen.getUID()}`

  return graph
}


},{"./accum.js":77,"./div.js":98,"./gen.js":107,"./lt.js":115}],150:[function(require,module,exports){
'use strict'

const AWPF = require( './external/audioworklet-polyfill.js' ),
      gen  = require( './gen.js' ),
      data = require( './data.js' )

let isStereo = false

const utilities = {
  ctx: null,
  buffers: {},
  isStereo:false,

  clear() {
    if( this.workletNode !== undefined ) {
      this.workletNode.disconnect()
    }else{
      this.callback = () => 0
    }
    this.clear.callbacks.forEach( v => v() )
    this.clear.callbacks.length = 0

    this.isStereo = false

    if( gen.graph !== null ) gen.free( gen.graph )
  },

  createContext( bufferSize = 2048 ) {
    const AC = typeof AudioContext === 'undefined' ? webkitAudioContext : AudioContext
    
    // tell polyfill global object and buffersize
    AWPF( window, bufferSize )

    const start = () => {
      if( typeof AC !== 'undefined' ) {
        this.ctx = new AC({ latencyHint:.0125 })

        gen.samplerate = this.ctx.sampleRate

        if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
          window.removeEventListener( 'touchstart', start )
        }else{
          window.removeEventListener( 'mousedown', start )
          window.removeEventListener( 'keydown', start )
        }

        const mySource = utilities.ctx.createBufferSource()
        mySource.connect( utilities.ctx.destination )
        mySource.start()
      }
    }

    if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
      window.addEventListener( 'touchstart', start )
    }else{
      window.addEventListener( 'mousedown', start )
      window.addEventListener( 'keydown', start )
    }

    return this
  },

  createScriptProcessor() {
    this.node = this.ctx.createScriptProcessor( 1024, 0, 2 )
    this.clearFunction = function() { return 0 }
    if( typeof this.callback === 'undefined' ) this.callback = this.clearFunction

    this.node.onaudioprocess = function( audioProcessingEvent ) {
      var outputBuffer = audioProcessingEvent.outputBuffer;

      var left = outputBuffer.getChannelData( 0 ),
          right= outputBuffer.getChannelData( 1 ),
          isStereo = utilities.isStereo

     for( var sample = 0; sample < left.length; sample++ ) {
        var out = utilities.callback()

        if( isStereo === false ) {
          left[ sample ] = right[ sample ] = out 
        }else{
          left[ sample  ] = out[0]
          right[ sample ] = out[1]
        }
      }
    }

    this.node.connect( this.ctx.destination )

    return this
  },

  // remove starting stuff and add tabs
  prettyPrintCallback( cb ) {
    // get rid of "function gen" and start with parenthesis
    // const shortendCB = cb.toString().slice(9)
    const cbSplit = cb.toString().split('\n')
    const cbTrim = cbSplit.slice( 3, -2 )
    const cbTabbed = cbTrim.map( v => '      ' + v ) 
    
    return cbTabbed.join('\n')
  },

  createParameterDescriptors( cb ) {
    // [{name: 'amplitude', defaultValue: 0.25, minValue: 0, maxValue: 1}];
    let paramStr = ''

    //for( let ugen of cb.params.values() ) {
    //  paramStr += `{ name:'${ugen.name}', defaultValue:${ugen.value}, minValue:${ugen.min}, maxValue:${ugen.max} },\n      `
    //}
    for( let ugen of cb.params.values() ) {
      paramStr += `{ name:'${ugen.name}', automationRate:'k-rate', defaultValue:${ugen.defaultValue}, minValue:${ugen.min}, maxValue:${ugen.max} },\n      `
    }
    return paramStr
  },

  createParameterDereferences( cb ) {
    let str = cb.params.size > 0 ? '\n      ' : ''
    for( let ugen of cb.params.values() ) {
      str += `const ${ugen.name} = parameters.${ugen.name}[0]\n      `
    }

    return str
  },

  createParameterArguments( cb ) {
    let  paramList = ''
    for( let ugen of cb.params.values() ) {
      paramList += ugen.name + '[i],'
    }
    paramList = paramList.slice( 0, -1 )

    return paramList
  },

  createInputDereferences( cb ) {
    let str = cb.inputs.size > 0 ? '\n' : ''
    for( let input of  cb.inputs.values() ) {
      str += `const ${input.name} = inputs[ ${input.inputNumber} ][ ${input.channelNumber} ]\n      `
    }

    return str
  },


  createInputArguments( cb ) {
    let  paramList = ''
    for( let input of cb.inputs.values() ) {
      paramList += input.name + '[i],'
    }
    paramList = paramList.slice( 0, -1 )

    return paramList
  },
      
  createFunctionDereferences( cb ) {
    let memberString = cb.members.size > 0 ? '\n' : ''
    let memo = {}
    for( let dict of cb.members.values() ) {
      const name = Object.keys( dict )[0],
            value = dict[ name ]

      if( memo[ name ] !== undefined ) continue
      memo[ name ] = true

      memberString += `      const ${name} = ${value}\n`
    }

    return memberString
  },

  createWorkletProcessor( graph, name, debug, mem=44100*10 ) {
    //const mem = MemoryHelper.create( 4096, Float64Array )
    const cb = gen.createCallback( graph, mem, debug )
    const inputs = cb.inputs

    // get all inputs and create appropriate audioparam initializers
    const parameterDescriptors = this.createParameterDescriptors( cb )
    const parameterDereferences = this.createParameterDereferences( cb )
    const paramList = this.createParameterArguments( cb )
    const inputDereferences = this.createInputDereferences( cb )
    const inputList = this.createInputArguments( cb )   
    const memberString = this.createFunctionDereferences( cb )

    // change output based on number of channels.
    const genishOutputLine = cb.isStereo === false
      ? `left[ i ] = memory[0]`
      : `left[ i ] = memory[0];\n\t\tright[ i ] = memory[1]\n`

    const prettyCallback = this.prettyPrintCallback( cb )

    /***** begin callback code ****/
    // note that we have to check to see that memory has been passed
    // to the worker before running the callback function, otherwise
    // it can be passed too slowly and fail on occassion

    const workletCode = `
class ${name}Processor extends AudioWorkletProcessor {

  static get parameterDescriptors() {
    const params = [
      ${ parameterDescriptors }      
    ]
    return params
  }
 
  constructor( options ) {
    super( options )
    this.port.onmessage = this.handleMessage.bind( this )
    this.initialized = false
  }

  handleMessage( event ) {
    if( event.data.key === 'init' ) {
      this.memory = event.data.memory
      this.initialized = true
    }else if( event.data.key === 'set' ) {
      this.memory[ event.data.idx ] = event.data.value
    }else if( event.data.key === 'get' ) {
      this.port.postMessage({ key:'return', idx:event.data.idx, value:this.memory[event.data.idx] })     
    }
  }

  process( inputs, outputs, parameters ) {
    if( this.initialized === true ) {
      const output = outputs[0]
      const left   = output[ 0 ]
      const right  = output[ 1 ]
      const len    = left.length
      const memory = this.memory ${parameterDereferences}${inputDereferences}${memberString}

      for( let i = 0; i < len; ++i ) {
        ${prettyCallback}
        ${genishOutputLine}
      }
    }
    return true
  }
}
    
registerProcessor( '${name}', ${name}Processor)`

    
    /***** end callback code *****/


    if( debug === true ) console.log( workletCode )

    const url = window.URL.createObjectURL(
      new Blob(
        [ workletCode ], 
        { type: 'text/javascript' }
      )
    )

    return [ url, workletCode, inputs, cb.params, cb.isStereo ] 
  },

  registeredForNodeAssignment: [],
  register( ugen ) {
    if( this.registeredForNodeAssignment.indexOf( ugen ) === -1 ) {
      this.registeredForNodeAssignment.push( ugen )
    }
  },

  playWorklet( graph, name, debug=false, mem=44100 * 60 ) {
    utilities.clear()

    const [ url, codeString, inputs, params, isStereo ] = utilities.createWorkletProcessor( graph, name, debug, mem )

    const nodePromise = new Promise( (resolve,reject) => {
   
      utilities.ctx.audioWorklet.addModule( url ).then( ()=> {
        const workletNode = new AudioWorkletNode( utilities.ctx, name, { outputChannelCount:[ isStereo ? 2 : 1 ] })

        workletNode.callbacks = {}
        workletNode.onmessage = function( event ) {
          if( event.data.message === 'return' ) {
            workletNode.callbacks[ event.data.idx ]( event.data.value )
            delete workletNode.callbacks[ event.data.idx ]
          }
        }

        workletNode.getMemoryValue = function( idx, cb ) {
          this.workletCallbacks[ idx ] = cb
          this.workletNode.port.postMessage({ key:'get', idx: idx })
        }
        
        workletNode.port.postMessage({ key:'init', memory:gen.memory.heap })
        utilities.workletNode = workletNode

        utilities.registeredForNodeAssignment.forEach( ugen => ugen.node = workletNode )
        utilities.registeredForNodeAssignment.length = 0

        // assign all params as properties of node for easier reference 
        for( let dict of inputs.values() ) {
          const name = Object.keys( dict )[0]
          const param = workletNode.parameters.get( name )
      
          Object.defineProperty( workletNode, name, {
            set( v ) {
              param.value = v
            },
            get() {
              return param.value
            }
          })
        }

        for( let ugen of params.values() ) {
          const name = ugen.name
          const param = workletNode.parameters.get( name )
          ugen.waapi = param 
          // initialize?
          param.value = ugen.defaultValue

          Object.defineProperty( workletNode, name, {
            set( v ) {
              param.value = v
            },
            get() {
              return param.value
            }
          })
        }

        if( utilities.console ) utilities.console.setValue( codeString )

        workletNode.connect( utilities.ctx.destination )

        resolve( workletNode )
      })

    })

    return nodePromise
  },
  
  playGraph( graph, debug, mem=44100*10, memType=Float32Array ) {
    utilities.clear()
    if( debug === undefined ) debug = false
          
    this.isStereo = Array.isArray( graph )

    utilities.callback = gen.createCallback( graph, mem, debug, false, memType )
    
    if( utilities.console ) utilities.console.setValue( utilities.callback.toString() )

    return utilities.callback
  },

  loadSample( soundFilePath, data ) {
    const isLoaded = utilities.buffers[ soundFilePath ] !== undefined

    let req = new XMLHttpRequest()
    req.open( 'GET', soundFilePath, true )
    req.responseType = 'arraybuffer' 
    
    let promise = new Promise( (resolve,reject) => {
      if( !isLoaded ) {
        req.onload = function() {
          var audioData = req.response

          utilities.ctx.decodeAudioData( audioData, (buffer) => {
            data.buffer = buffer.getChannelData(0)
            utilities.buffers[ soundFilePath ] = data.buffer
            resolve( data.buffer )
          })
        }
      }else{
        setTimeout( ()=> resolve( utilities.buffers[ soundFilePath ] ), 0 )
      }
    })

    if( !isLoaded ) req.send()

    return promise
  }

}

utilities.clear.callbacks = []

module.exports = utilities

},{"./data.js":93,"./external/audioworklet-polyfill.js":102,"./gen.js":107}],151:[function(require,module,exports){
'use strict'

/*
 * many windows here adapted from https://github.com/corbanbrook/dsp.js/blob/master/dsp.js
 * starting at line 1427
 * taken 8/15/16
*/ 

const windows = module.exports = { 
  bartlett( length, index ) {
    return 2 / (length - 1) * ((length - 1) / 2 - Math.abs(index - (length - 1) / 2)) 
  },

  bartlettHann( length, index ) {
    return 0.62 - 0.48 * Math.abs(index / (length - 1) - 0.5) - 0.38 * Math.cos( 2 * Math.PI * index / (length - 1))
  },

  blackman( length, index, alpha ) {
    let a0 = (1 - alpha) / 2,
        a1 = 0.5,
        a2 = alpha / 2

    return a0 - a1 * Math.cos(2 * Math.PI * index / (length - 1)) + a2 * Math.cos(4 * Math.PI * index / (length - 1))
  },

  cosine( length, index ) {
    return Math.cos(Math.PI * index / (length - 1) - Math.PI / 2)
  },

  gauss( length, index, alpha ) {
    return Math.pow(Math.E, -0.5 * Math.pow((index - (length - 1) / 2) / (alpha * (length - 1) / 2), 2))
  },

  hamming( length, index ) {
    return 0.54 - 0.46 * Math.cos( Math.PI * 2 * index / (length - 1))
  },

  hann( length, index ) {
    return 0.5 * (1 - Math.cos( Math.PI * 2 * index / (length - 1)) )
  },

  lanczos( length, index ) {
    let x = 2 * index / (length - 1) - 1;
    return Math.sin(Math.PI * x) / (Math.PI * x)
  },

  rectangular( length, index ) {
    return 1
  },

  triangular( length, index ) {
    return 2 / length * (length / 2 - Math.abs(index - (length - 1) / 2))
  },

  // parabola
  welch( length, _index, ignore, shift=0 ) {
    //w[n] = 1 - Math.pow( ( n - ( (N-1) / 2 ) ) / (( N-1 ) / 2 ), 2 )
    const index = shift === 0 ? _index : (_index + Math.floor( shift * length )) % length
    const n_1_over2 = (length - 1) / 2 

    return 1 - Math.pow( ( index - n_1_over2 ) / n_1_over2, 2 )
  },
  inversewelch( length, _index, ignore, shift=0 ) {
    //w[n] = 1 - Math.pow( ( n - ( (N-1) / 2 ) ) / (( N-1 ) / 2 ), 2 )
    let index = shift === 0 ? _index : (_index + Math.floor( shift * length )) % length
    const n_1_over2 = (length - 1) / 2

    return Math.pow( ( index - n_1_over2 ) / n_1_over2, 2 )
  },

  parabola( length, index ) {
    if( index <= length / 2 ) {
      return windows.inversewelch( length / 2, index ) - 1
    }else{
      return 1 - windows.inversewelch( length / 2, index - length / 2 )
    }
  },

  exponential( length, index, alpha ) {
    return Math.pow( index / length, alpha )
  },

  linear( length, index ) {
    return index / length
  }
}

},{}],152:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js'),
    floor= require('./floor.js'),
    sub  = require('./sub.js'),
    memo = require('./memo.js')

let proto = {
  basename:'wrap',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        signal = inputs[0], min = inputs[1], max = inputs[2],
        out, diff

    //out = `(((${inputs[0]} - ${this.min}) % ${diff}  + ${diff}) % ${diff} + ${this.min})`
    //const long numWraps = long((v-lo)/range) - (v < lo);
    //return v - range * double(numWraps);   
    
    if( this.min === 0 ) {
      diff = max
    }else if ( isNaN( max ) || isNaN( min ) ) {
      diff = `${max} - ${min}`
    }else{
      diff = max - min
    }

    out =
` var ${this.name} = ${inputs[0]}
  if( ${this.name} < ${this.min} ) ${this.name} += ${diff}
  else if( ${this.name} > ${this.max} ) ${this.name} -= ${diff}

`

    return [ this.name, ' ' + out ]
  },
}

module.exports = ( in1, min=0, max=1 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    min, 
    max,
    uid:    gen.getUID(),
    inputs: [ in1, min, max ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./floor.js":104,"./gen.js":107,"./memo.js":119,"./sub.js":144}],153:[function(require,module,exports){
'use strict';

var MemoryHelper = {
  create: function create() {
    var size = arguments.length <= 0 || arguments[0] === undefined ? 4096 : arguments[0];
    var memtype = arguments.length <= 1 || arguments[1] === undefined ? Float32Array : arguments[1];

    var helper = Object.create(this);

    Object.assign(helper, {
      heap: new memtype(size),
      list: {},
      freeList: {}
    });

    return helper;
  },
  alloc: function alloc(amount) {
    var idx = -1;

    if (amount > this.heap.length) {
      throw Error('Allocation request is larger than heap size of ' + this.heap.length);
    }

    for (var key in this.freeList) {
      var candidateSize = this.freeList[key];

      if (candidateSize >= amount) {
        idx = key;

        this.list[idx] = amount;

        if (candidateSize !== amount) {
          var newIndex = idx + amount,
              newFreeSize = void 0;

          for (var _key in this.list) {
            if (_key > newIndex) {
              newFreeSize = _key - newIndex;
              this.freeList[newIndex] = newFreeSize;
            }
          }
        }
        
        break;
      }
    }
    
    if( idx !== -1 ) delete this.freeList[ idx ]

    if (idx === -1) {
      var keys = Object.keys(this.list),
          lastIndex = void 0;

      if (keys.length) {
        // if not first allocation...
        lastIndex = parseInt(keys[keys.length - 1]);

        idx = lastIndex + this.list[lastIndex];
      } else {
        idx = 0;
      }

      this.list[idx] = amount;
    }

    if (idx + amount >= this.heap.length) {
      throw Error('No available blocks remain sufficient for allocation request.');
    }
    return idx;
  },
  free: function free(index) {
    if (typeof this.list[index] !== 'number') {
      throw Error('Calling free() on non-existing block.');
    }

    this.list[index] = 0;

    var size = 0;
    for (var key in this.list) {
      if (key > index) {
        size = key - index;
        break;
      }
    }

    this.freeList[index] = size;
  }
};

module.exports = MemoryHelper;

},{}],154:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],155:[function(require,module,exports){
// A library of seedable RNGs implemented in Javascript.
//
// Usage:
//
// var seedrandom = require('seedrandom');
// var random = seedrandom(1); // or any seed.
// var x = random();       // 0 <= x < 1.  Every bit is random.
// var x = random.quick(); // 0 <= x < 1.  32 bits of randomness.

// alea, a 53-bit multiply-with-carry generator by Johannes Baagøe.
// Period: ~2^116
// Reported to pass all BigCrush tests.
var alea = require('./lib/alea');

// xor128, a pure xor-shift generator by George Marsaglia.
// Period: 2^128-1.
// Reported to fail: MatrixRank and LinearComp.
var xor128 = require('./lib/xor128');

// xorwow, George Marsaglia's 160-bit xor-shift combined plus weyl.
// Period: 2^192-2^32
// Reported to fail: CollisionOver, SimpPoker, and LinearComp.
var xorwow = require('./lib/xorwow');

// xorshift7, by François Panneton and Pierre L'ecuyer, takes
// a different approach: it adds robustness by allowing more shifts
// than Marsaglia's original three.  It is a 7-shift generator
// with 256 bits, that passes BigCrush with no systmatic failures.
// Period 2^256-1.
// No systematic BigCrush failures reported.
var xorshift7 = require('./lib/xorshift7');

// xor4096, by Richard Brent, is a 4096-bit xor-shift with a
// very long period that also adds a Weyl generator. It also passes
// BigCrush with no systematic failures.  Its long period may
// be useful if you have many generators and need to avoid
// collisions.
// Period: 2^4128-2^32.
// No systematic BigCrush failures reported.
var xor4096 = require('./lib/xor4096');

// Tyche-i, by Samuel Neves and Filipe Araujo, is a bit-shifting random
// number generator derived from ChaCha, a modern stream cipher.
// https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf
// Period: ~2^127
// No systematic BigCrush failures reported.
var tychei = require('./lib/tychei');

// The original ARC4-based prng included in this library.
// Period: ~2^1600
var sr = require('./seedrandom');

sr.alea = alea;
sr.xor128 = xor128;
sr.xorwow = xorwow;
sr.xorshift7 = xorshift7;
sr.xor4096 = xor4096;
sr.tychei = tychei;

module.exports = sr;

},{"./lib/alea":156,"./lib/tychei":157,"./lib/xor128":158,"./lib/xor4096":159,"./lib/xorshift7":160,"./lib/xorwow":161,"./seedrandom":162}],156:[function(require,module,exports){
// A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
// http://baagoe.com/en/RandomMusings/javascript/
// https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
// Original work is under MIT license -

// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.



(function(global, module, define) {

function Alea(seed) {
  var me = this, mash = Mash();

  me.next = function() {
    var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32
    me.s0 = me.s1;
    me.s1 = me.s2;
    return me.s2 = t - (me.c = t | 0);
  };

  // Apply the seeding algorithm from Baagoe.
  me.c = 1;
  me.s0 = mash(' ');
  me.s1 = mash(' ');
  me.s2 = mash(' ');
  me.s0 -= mash(seed);
  if (me.s0 < 0) { me.s0 += 1; }
  me.s1 -= mash(seed);
  if (me.s1 < 0) { me.s1 += 1; }
  me.s2 -= mash(seed);
  if (me.s2 < 0) { me.s2 += 1; }
  mash = null;
}

function copy(f, t) {
  t.c = f.c;
  t.s0 = f.s0;
  t.s1 = f.s1;
  t.s2 = f.s2;
  return t;
}

function impl(seed, opts) {
  var xg = new Alea(seed),
      state = opts && opts.state,
      prng = xg.next;
  prng.int32 = function() { return (xg.next() * 0x100000000) | 0; }
  prng.double = function() {
    return prng() + (prng() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
  };
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

function Mash() {
  var n = 0xefc8249d;

  var mash = function(data) {
    data = String(data);
    for (var i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      var h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }
    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  };

  return mash;
}


if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.alea = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);



},{}],157:[function(require,module,exports){
// A Javascript implementaion of the "Tyche-i" prng algorithm by
// Samuel Neves and Filipe Araujo.
// See https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  // Set up generator function.
  me.next = function() {
    var b = me.b, c = me.c, d = me.d, a = me.a;
    b = (b << 25) ^ (b >>> 7) ^ c;
    c = (c - d) | 0;
    d = (d << 24) ^ (d >>> 8) ^ a;
    a = (a - b) | 0;
    me.b = b = (b << 20) ^ (b >>> 12) ^ c;
    me.c = c = (c - d) | 0;
    me.d = (d << 16) ^ (c >>> 16) ^ a;
    return me.a = (a - b) | 0;
  };

  /* The following is non-inverted tyche, which has better internal
   * bit diffusion, but which is about 25% slower than tyche-i in JS.
  me.next = function() {
    var a = me.a, b = me.b, c = me.c, d = me.d;
    a = (me.a + me.b | 0) >>> 0;
    d = me.d ^ a; d = d << 16 ^ d >>> 16;
    c = me.c + d | 0;
    b = me.b ^ c; b = b << 12 ^ d >>> 20;
    me.a = a = a + b | 0;
    d = d ^ a; me.d = d = d << 8 ^ d >>> 24;
    me.c = c = c + d | 0;
    b = b ^ c;
    return me.b = (b << 7 ^ b >>> 25);
  }
  */

  me.a = 0;
  me.b = 0;
  me.c = 2654435769 | 0;
  me.d = 1367130551;

  if (seed === Math.floor(seed)) {
    // Integer seed.
    me.a = (seed / 0x100000000) | 0;
    me.b = seed | 0;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 20; k++) {
    me.b ^= strseed.charCodeAt(k) | 0;
    me.next();
  }
}

function copy(f, t) {
  t.a = f.a;
  t.b = f.b;
  t.c = f.c;
  t.d = f.d;
  return t;
};

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.tychei = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);



},{}],158:[function(require,module,exports){
// A Javascript implementaion of the "xor128" prng algorithm by
// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  me.x = 0;
  me.y = 0;
  me.z = 0;
  me.w = 0;

  // Set up generator function.
  me.next = function() {
    var t = me.x ^ (me.x << 11);
    me.x = me.y;
    me.y = me.z;
    me.z = me.w;
    return me.w ^= (me.w >>> 19) ^ t ^ (t >>> 8);
  };

  if (seed === (seed | 0)) {
    // Integer seed.
    me.x = seed;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 64; k++) {
    me.x ^= strseed.charCodeAt(k) | 0;
    me.next();
  }
}

function copy(f, t) {
  t.x = f.x;
  t.y = f.y;
  t.z = f.z;
  t.w = f.w;
  return t;
}

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xor128 = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);



},{}],159:[function(require,module,exports){
// A Javascript implementaion of Richard Brent's Xorgens xor4096 algorithm.
//
// This fast non-cryptographic random number generator is designed for
// use in Monte-Carlo algorithms. It combines a long-period xorshift
// generator with a Weyl generator, and it passes all common batteries
// of stasticial tests for randomness while consuming only a few nanoseconds
// for each prng generated.  For background on the generator, see Brent's
// paper: "Some long-period random number generators using shifts and xors."
// http://arxiv.org/pdf/1004.3115v1.pdf
//
// Usage:
//
// var xor4096 = require('xor4096');
// random = xor4096(1);                        // Seed with int32 or string.
// assert.equal(random(), 0.1520436450538547); // (0, 1) range, 53 bits.
// assert.equal(random.int32(), 1806534897);   // signed int32, 32 bits.
//
// For nonzero numeric keys, this impelementation provides a sequence
// identical to that by Brent's xorgens 3 implementaion in C.  This
// implementation also provides for initalizing the generator with
// string seeds, or for saving and restoring the state of the generator.
//
// On Chrome, this prng benchmarks about 2.1 times slower than
// Javascript's built-in Math.random().

(function(global, module, define) {

function XorGen(seed) {
  var me = this;

  // Set up generator function.
  me.next = function() {
    var w = me.w,
        X = me.X, i = me.i, t, v;
    // Update Weyl generator.
    me.w = w = (w + 0x61c88647) | 0;
    // Update xor generator.
    v = X[(i + 34) & 127];
    t = X[i = ((i + 1) & 127)];
    v ^= v << 13;
    t ^= t << 17;
    v ^= v >>> 15;
    t ^= t >>> 12;
    // Update Xor generator array state.
    v = X[i] = v ^ t;
    me.i = i;
    // Result is the combination.
    return (v + (w ^ (w >>> 16))) | 0;
  };

  function init(me, seed) {
    var t, v, i, j, w, X = [], limit = 128;
    if (seed === (seed | 0)) {
      // Numeric seeds initialize v, which is used to generates X.
      v = seed;
      seed = null;
    } else {
      // String seeds are mixed into v and X one character at a time.
      seed = seed + '\0';
      v = 0;
      limit = Math.max(limit, seed.length);
    }
    // Initialize circular array and weyl value.
    for (i = 0, j = -32; j < limit; ++j) {
      // Put the unicode characters into the array, and shuffle them.
      if (seed) v ^= seed.charCodeAt((j + 32) % seed.length);
      // After 32 shuffles, take v as the starting w value.
      if (j === 0) w = v;
      v ^= v << 10;
      v ^= v >>> 15;
      v ^= v << 4;
      v ^= v >>> 13;
      if (j >= 0) {
        w = (w + 0x61c88647) | 0;     // Weyl.
        t = (X[j & 127] ^= (v + w));  // Combine xor and weyl to init array.
        i = (0 == t) ? i + 1 : 0;     // Count zeroes.
      }
    }
    // We have detected all zeroes; make the key nonzero.
    if (i >= 128) {
      X[(seed && seed.length || 0) & 127] = -1;
    }
    // Run the generator 512 times to further mix the state before using it.
    // Factoring this as a function slows the main generator, so it is just
    // unrolled here.  The weyl generator is not advanced while warming up.
    i = 127;
    for (j = 4 * 128; j > 0; --j) {
      v = X[(i + 34) & 127];
      t = X[i = ((i + 1) & 127)];
      v ^= v << 13;
      t ^= t << 17;
      v ^= v >>> 15;
      t ^= t >>> 12;
      X[i] = v ^ t;
    }
    // Storing state as object members is faster than using closure variables.
    me.w = w;
    me.X = X;
    me.i = i;
  }

  init(me, seed);
}

function copy(f, t) {
  t.i = f.i;
  t.w = f.w;
  t.X = f.X.slice();
  return t;
};

function impl(seed, opts) {
  if (seed == null) seed = +(new Date);
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (state.X) copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xor4096 = impl;
}

})(
  this,                                     // window object or global
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);

},{}],160:[function(require,module,exports){
// A Javascript implementaion of the "xorshift7" algorithm by
// François Panneton and Pierre L'ecuyer:
// "On the Xorgshift Random Number Generators"
// http://saluc.engr.uconn.edu/refs/crypto/rng/panneton05onthexorshift.pdf

(function(global, module, define) {

function XorGen(seed) {
  var me = this;

  // Set up generator function.
  me.next = function() {
    // Update xor generator.
    var X = me.x, i = me.i, t, v, w;
    t = X[i]; t ^= (t >>> 7); v = t ^ (t << 24);
    t = X[(i + 1) & 7]; v ^= t ^ (t >>> 10);
    t = X[(i + 3) & 7]; v ^= t ^ (t >>> 3);
    t = X[(i + 4) & 7]; v ^= t ^ (t << 7);
    t = X[(i + 7) & 7]; t = t ^ (t << 13); v ^= t ^ (t << 9);
    X[i] = v;
    me.i = (i + 1) & 7;
    return v;
  };

  function init(me, seed) {
    var j, w, X = [];

    if (seed === (seed | 0)) {
      // Seed state array using a 32-bit integer.
      w = X[0] = seed;
    } else {
      // Seed state using a string.
      seed = '' + seed;
      for (j = 0; j < seed.length; ++j) {
        X[j & 7] = (X[j & 7] << 15) ^
            (seed.charCodeAt(j) + X[(j + 1) & 7] << 13);
      }
    }
    // Enforce an array length of 8, not all zeroes.
    while (X.length < 8) X.push(0);
    for (j = 0; j < 8 && X[j] === 0; ++j);
    if (j == 8) w = X[7] = -1; else w = X[j];

    me.x = X;
    me.i = 0;

    // Discard an initial 256 values.
    for (j = 256; j > 0; --j) {
      me.next();
    }
  }

  init(me, seed);
}

function copy(f, t) {
  t.x = f.x.slice();
  t.i = f.i;
  return t;
}

function impl(seed, opts) {
  if (seed == null) seed = +(new Date);
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (state.x) copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xorshift7 = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);


},{}],161:[function(require,module,exports){
// A Javascript implementaion of the "xorwow" prng algorithm by
// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  // Set up generator function.
  me.next = function() {
    var t = (me.x ^ (me.x >>> 2));
    me.x = me.y; me.y = me.z; me.z = me.w; me.w = me.v;
    return (me.d = (me.d + 362437 | 0)) +
       (me.v = (me.v ^ (me.v << 4)) ^ (t ^ (t << 1))) | 0;
  };

  me.x = 0;
  me.y = 0;
  me.z = 0;
  me.w = 0;
  me.v = 0;

  if (seed === (seed | 0)) {
    // Integer seed.
    me.x = seed;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 64; k++) {
    me.x ^= strseed.charCodeAt(k) | 0;
    if (k == strseed.length) {
      me.d = me.x << 10 ^ me.x >>> 4;
    }
    me.next();
  }
}

function copy(f, t) {
  t.x = f.x;
  t.y = f.y;
  t.z = f.z;
  t.w = f.w;
  t.v = f.v;
  t.d = f.d;
  return t;
}

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xorwow = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);



},{}],162:[function(require,module,exports){
/*
Copyright 2019 David Bau.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

(function (global, pool, math) {
//
// The following constants are related to IEEE 754 limits.
//

var width = 256,        // each RC4 output is 0 <= x < 256
    chunks = 6,         // at least six RC4 outputs for each double
    digits = 52,        // there are 52 significant digits in a double
    rngname = 'random', // rngname: name for Math.random and Math.seedrandom
    startdenom = math.pow(width, chunks),
    significance = math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1,
    nodecrypto;         // node.js crypto module, initialized at the bottom.

//
// seedrandom()
// This is the seedrandom function described above.
//
function seedrandom(seed, options, callback) {
  var key = [];
  options = (options == true) ? { entropy: true } : (options || {});

  // Flatten the seed string or build one from local entropy if needed.
  var shortseed = mixkey(flatten(
    options.entropy ? [seed, tostring(pool)] :
    (seed == null) ? autoseed() : seed, 3), key);

  // Use the seed to initialize an ARC4 generator.
  var arc4 = new ARC4(key);

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.
  var prng = function() {
    var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
        d = startdenom,                 //   and denominator d = 2 ^ 48.
        x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };

  prng.int32 = function() { return arc4.g(4) | 0; }
  prng.quick = function() { return arc4.g(4) / 0x100000000; }
  prng.double = prng;

  // Mix the randomness into accumulated entropy.
  mixkey(tostring(arc4.S), pool);

  // Calling convention: what to return as a function of prng, seed, is_math.
  return (options.pass || callback ||
      function(prng, seed, is_math_call, state) {
        if (state) {
          // Load the arc4 state from the given state if it has an S array.
          if (state.S) { copy(state, arc4); }
          // Only provide the .state method if requested via options.state.
          prng.state = function() { return copy(arc4, {}); }
        }

        // If called as a method of Math (Math.seedrandom()), mutate
        // Math.random because that is how seedrandom.js has worked since v1.0.
        if (is_math_call) { math[rngname] = prng; return seed; }

        // Otherwise, it is a newer calling convention, so return the
        // prng directly.
        else return prng;
      })(
  prng,
  shortseed,
  'global' in options ? options.global : (this == math),
  options.state);
}

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
function ARC4(key) {
  var t, keylen = key.length,
      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) {
    s[i] = i++;
  }
  for (i = 0; i < width; i++) {
    s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
    s[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  (me.g = function(count) {
    // Using instance members instead of closure state nearly doubles speed.
    var t, r = 0,
        i = me.i, j = me.j, s = me.S;
    while (count--) {
      t = s[i = mask & (i + 1)];
      r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
    }
    me.i = i; me.j = j;
    return r;
    // For robust unpredictability, the function call below automatically
    // discards an initial batch of values.  This is called RC4-drop[256].
    // See http://google.com/search?q=rsa+fluhrer+response&btnI
  })(width);
}

//
// copy()
// Copies internal state of ARC4 to or from a plain object.
//
function copy(f, t) {
  t.i = f.i;
  t.j = f.j;
  t.S = f.S.slice();
  return t;
};

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
function flatten(obj, depth) {
  var result = [], typ = (typeof obj), prop;
  if (depth && typ == 'object') {
    for (prop in obj) {
      try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
    }
  }
  return (result.length ? result : typ == 'string' ? obj : obj + '\0');
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
function mixkey(seed, key) {
  var stringseed = seed + '', smear, j = 0;
  while (j < stringseed.length) {
    key[mask & j] =
      mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
  }
  return tostring(key);
}

//
// autoseed()
// Returns an object for autoseeding, using window.crypto and Node crypto
// module if available.
//
function autoseed() {
  try {
    var out;
    if (nodecrypto && (out = nodecrypto.randomBytes)) {
      // The use of 'out' to remember randomBytes makes tight minified code.
      out = out(width);
    } else {
      out = new Uint8Array(width);
      (global.crypto || global.msCrypto).getRandomValues(out);
    }
    return tostring(out);
  } catch (e) {
    var browser = global.navigator,
        plugins = browser && browser.plugins;
    return [+new Date, global, plugins, global.screen, tostring(pool)];
  }
}

//
// tostring()
// Converts an array of charcodes to a string
//
function tostring(a) {
  return String.fromCharCode.apply(0, a);
}

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to interfere with deterministic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math.random(), pool);

//
// Nodejs and AMD support: export the implementation as a module using
// either convention.
//
if ((typeof module) == 'object' && module.exports) {
  module.exports = seedrandom;
  // When in node.js, try using crypto package for autoseeding.
  try {
    nodecrypto = require('crypto');
  } catch (ex) {}
} else if ((typeof define) == 'function' && define.amd) {
  define(function() { return seedrandom; });
} else {
  // When included as a plain script, set up Math.seedrandom global.
  math['seed' + rngname] = seedrandom;
}


// End anonymous scope, and pass initial values.
})(
  // global: `self` in browsers (including strict mode and web workers),
  // otherwise `this` in Node and other environments
  (typeof self !== 'undefined') ? self : this,
  [],     // pool: entropy pool starts empty
  Math    // math: package containing random, pow, and seedrandom
);

},{"crypto":73}],163:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

'use strict';

// Generate an internal UID to make the regexp pattern harder to guess.
var UID                 = Math.floor(Math.random() * 0x10000000000).toString(16);
var PLACE_HOLDER_REGEXP = new RegExp('"@__(F|R|D|M|S)-' + UID + '-(\\d+)__@"', 'g');

var IS_NATIVE_CODE_REGEXP = /\{\s*\[native code\]\s*\}/g;
var IS_PURE_FUNCTION = /function.*?\(/;
var IS_ARROW_FUNCTION = /.*?=>.*?/;
var UNSAFE_CHARS_REGEXP   = /[<>\/\u2028\u2029]/g;

var RESERVED_SYMBOLS = ['*', 'async'];

// Mapping of unsafe HTML and invalid JavaScript line terminator chars to their
// Unicode char counterparts which are safe to use in JavaScript strings.
var ESCAPED_CHARS = {
    '<'     : '\\u003C',
    '>'     : '\\u003E',
    '/'     : '\\u002F',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029'
};

function escapeUnsafeChars(unsafeChar) {
    return ESCAPED_CHARS[unsafeChar];
}

module.exports = function serialize(obj, options) {
    options || (options = {});

    // Backwards-compatibility for `space` as the second argument.
    if (typeof options === 'number' || typeof options === 'string') {
        options = {space: options};
    }

    var functions = [];
    var regexps   = [];
    var dates     = [];
    var maps      = [];
    var sets      = [];

    // Returns placeholders for functions and regexps (identified by index)
    // which are later replaced by their string representation.
    function replacer(key, value) {
        if (!value) {
            return value;
        }

        // If the value is an object w/ a toJSON method, toJSON is called before
        // the replacer runs, so we use this[key] to get the non-toJSONed value.
        var origValue = this[key];
        var type = typeof origValue;

        if (type === 'object') {
            if(origValue instanceof RegExp) {
                return '@__R-' + UID + '-' + (regexps.push(origValue) - 1) + '__@';
            }

            if(origValue instanceof Date) {
                return '@__D-' + UID + '-' + (dates.push(origValue) - 1) + '__@';
            }

            if(origValue instanceof Map) {
                return '@__M-' + UID + '-' + (maps.push(origValue) - 1) + '__@';
            }

            if(origValue instanceof Set) {
                return '@__S-' + UID + '-' + (sets.push(origValue) - 1) + '__@';
            }
        }

        if (type === 'function') {
            return '@__F-' + UID + '-' + (functions.push(origValue) - 1) + '__@';
        }

        return value;
    }

    function serializeFunc(fn) {
      var serializedFn = fn.toString();
      if (IS_NATIVE_CODE_REGEXP.test(serializedFn)) {
          throw new TypeError('Serializing native function: ' + fn.name);
      }

      // pure functions, example: {key: function() {}}
      if(IS_PURE_FUNCTION.test(serializedFn)) {
          return serializedFn;
      }

      // arrow functions, example: arg1 => arg1+5
      if(IS_ARROW_FUNCTION.test(serializedFn)) {
          return serializedFn;
      }

      var argsStartsAt = serializedFn.indexOf('(');
      var def = serializedFn.substr(0, argsStartsAt)
        .trim()
        .split(' ')
        .filter(function(val) { return val.length > 0 });

      var nonReservedSymbols = def.filter(function(val) {
        return RESERVED_SYMBOLS.indexOf(val) === -1
      });

      // enhanced literal objects, example: {key() {}}
      if(nonReservedSymbols.length > 0) {
          return (def.indexOf('async') > -1 ? 'async ' : '') + 'function'
            + (def.join('').indexOf('*') > -1 ? '*' : '')
            + serializedFn.substr(argsStartsAt);
      }

      // arrow functions
      return serializedFn;
    }

    var str;

    // Creates a JSON string representation of the value.
    // NOTE: Node 0.12 goes into slow mode with extra JSON.stringify() args.
    if (options.isJSON && !options.space) {
        str = JSON.stringify(obj);
    } else {
        str = JSON.stringify(obj, options.isJSON ? null : replacer, options.space);
    }

    // Protects against `JSON.stringify()` returning `undefined`, by serializing
    // to the literal string: "undefined".
    if (typeof str !== 'string') {
        return String(str);
    }

    // Replace unsafe HTML and invalid JavaScript line terminator chars with
    // their safe Unicode char counterpart. This _must_ happen before the
    // regexps and functions are serialized and added back to the string.
    if (options.unsafe !== true) {
        str = str.replace(UNSAFE_CHARS_REGEXP, escapeUnsafeChars);
    }

    if (functions.length === 0 && regexps.length === 0 && dates.length === 0 && maps.length === 0 && sets.length === 0) {
        return str;
    }

    // Replaces all occurrences of function, regexp, date, map and set placeholders in the
    // JSON string with their string representations. If the original value can
    // not be found, then `undefined` is used.
    return str.replace(PLACE_HOLDER_REGEXP, function (match, type, valueIndex) {
        if (type === 'D') {
            return "new Date(\"" + dates[valueIndex].toISOString() + "\")";
        }

        if (type === 'R') {
            return regexps[valueIndex].toString();
        }

        if (type === 'M') {
            return "new Map(" + serialize(Array.from(maps[valueIndex].entries()), options) + ")";
        }

        if (type === 'S') {
            return "new Set(" + serialize(Array.from(sets[valueIndex].values()), options) + ")";
        }

        var fn = functions[valueIndex];

        return serializeFunc(fn);
    });
}

},{}],164:[function(require,module,exports){
/*
 * Generated by PEG.js 0.10.0.
 *
 * http://pegjs.org/
 */

"use strict";

function peg$subclass(child, parent) {
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
}

function peg$SyntaxError(message, expected, found, location) {
  this.message  = message;
  this.expected = expected;
  this.found    = found;
  this.location = location;
  this.name     = "SyntaxError";

  if (typeof Error.captureStackTrace === "function") {
    Error.captureStackTrace(this, peg$SyntaxError);
  }
}

peg$subclass(peg$SyntaxError, Error);

peg$SyntaxError.buildMessage = function(expected, found) {
  var DESCRIBE_EXPECTATION_FNS = {
        literal: function(expectation) {
          return "\"" + literalEscape(expectation.text) + "\"";
        },

        "class": function(expectation) {
          var escapedParts = "",
              i;

          for (i = 0; i < expectation.parts.length; i++) {
            escapedParts += expectation.parts[i] instanceof Array
              ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1])
              : classEscape(expectation.parts[i]);
          }

          return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
        },

        any: function(expectation) {
          return "any character";
        },

        end: function(expectation) {
          return "end of input";
        },

        other: function(expectation) {
          return expectation.description;
        }
      };

  function hex(ch) {
    return ch.charCodeAt(0).toString(16).toUpperCase();
  }

  function literalEscape(s) {
    return s
      .replace(/\\/g, '\\\\')
      .replace(/"/g,  '\\"')
      .replace(/\0/g, '\\0')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
  }

  function classEscape(s) {
    return s
      .replace(/\\/g, '\\\\')
      .replace(/\]/g, '\\]')
      .replace(/\^/g, '\\^')
      .replace(/-/g,  '\\-')
      .replace(/\0/g, '\\0')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
  }

  function describeExpectation(expectation) {
    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
  }

  function describeExpected(expected) {
    var descriptions = new Array(expected.length),
        i, j;

    for (i = 0; i < expected.length; i++) {
      descriptions[i] = describeExpectation(expected[i]);
    }

    descriptions.sort();

    if (descriptions.length > 0) {
      for (i = 1, j = 1; i < descriptions.length; i++) {
        if (descriptions[i - 1] !== descriptions[i]) {
          descriptions[j] = descriptions[i];
          j++;
        }
      }
      descriptions.length = j;
    }

    switch (descriptions.length) {
      case 1:
        return descriptions[0];

      case 2:
        return descriptions[0] + " or " + descriptions[1];

      default:
        return descriptions.slice(0, -1).join(", ")
          + ", or "
          + descriptions[descriptions.length - 1];
    }
  }

  function describeFound(found) {
    return found ? "\"" + literalEscape(found) + "\"" : "end of input";
  }

  return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
};

function peg$parse(input, options) {
  options = options !== void 0 ? options : {};

  var peg$FAILED = {},

      peg$startRuleFunctions = { pattern: peg$parsepattern },
      peg$startRuleFunction  = peg$parsepattern,

      peg$c0 = function(value) {
        let out = value
        if( options.enclose === true && value.type !== 'group' ) {
          out = { type:'group', values:[ value ] }
        }
        
        return out
      },
      peg$c1 = function(_valuesstart, _valuesend) {
        _valuesend.unshift( _valuesstart )
        const values = _valuesend

        let out
        
        if( values.type === undefined ) {
          // getting nested arrays with feet...
          out = {
            values:Array.isArray( values[0] ) ? values[0] : values,
            type:'group' 
          }
        }else{
          out = values
          out.type = 'group'
        }
       
        addLoc( out, location() )

        return out
      },
      peg$c2 = peg$otherExpectation("group"),
      peg$c3 = "[",
      peg$c4 = peg$literalExpectation("[", false),
      peg$c5 = "]",
      peg$c6 = peg$literalExpectation("]", false),
      peg$c7 = function(values) {
        const out = {
          values,
          type:'group' 
        }
        
        return addLoc( out, location() ) 
      },
      peg$c8 = peg$otherExpectation("term"),
      peg$c9 = function(body) {return body},
      peg$c10 = "(",
      peg$c11 = peg$literalExpectation("(", false),
      peg$c12 = ",",
      peg$c13 = peg$literalExpectation(",", false),
      peg$c14 = ")",
      peg$c15 = peg$literalExpectation(")", false),
      peg$c16 = function(value, pulses, slots, rotation) {
        const result = {
          type:'bjorklund',
          pulses, 
          slots, 
          value,
          'rotation': rotation.length > 0 ? rotation[ 0 ] : null
        }
       
        const withLoc = addLoc( result, location() ) 
        //withLoc.value.uid = withLoc.uid
        return withLoc
      },
      peg$c17 = function(body) { return body },
      peg$c18 = "?",
      peg$c19 = peg$literalExpectation("?", false),
      peg$c20 = function(value) {
        const out = { type:'degrade', value }
        return out
        //return addLoc( out, location() )
      },
      peg$c21 = "*",
      peg$c22 = peg$literalExpectation("*", false),
      peg$c23 = function(value, rate) {
        const r =  { type:'speed', rate, value }

        if( options.addLocations === true ) {
          r.location = {
            start:value.location.start,
            end: rate.location.end
          }
        }
        
        return r 
      },
      peg$c24 = "/",
      peg$c25 = peg$literalExpectation("/", false),
      peg$c26 = function(value, rate) {
        /*const r =  { type:'slow', rate, value }*/

        //if( options.addLocations === true ) {
        //  r.location = {
        //    start:value.location.start,
        //    end: rate.location.end
        //  }
        //}
        //const group = value.type === 'group'
        //  ? value
        const group = { type:'group', values:[ value ] }

        const onestep = {
          type:'onestep',
          values:[ group ]
        }

        for( let i = 0; i < rate.value - 1; i++ ) {
          group.values.push({ type:'rest' })
        }

        addLoc( onestep, location() )
        return onestep
        /*return r */
      },
      peg$c27 = "{",
      peg$c28 = peg$literalExpectation("{", false),
      peg$c29 = "}",
      peg$c30 = peg$literalExpectation("}", false),
      peg$c31 = function(left, right) {
        const result = { 
          'left':{
            type:'group',
            values:left
          }, 
          'right':{
            type:'group',
            values:right,
          },
          type: 'polymeter' 
        }

        addLoc( result.left, location() )
        addLoc( result.right, location() )
        addLoc( result, location() )

        return result
      },
      peg$c32 = "~",
      peg$c33 = peg$literalExpectation("~", false),
      peg$c34 = function() {
       return { type:'rest' }
      },
      peg$c35 = function(start, end) {
        const out = {
          type:'group',
          values: start.map( grp => grp[0] )
        }
        out.values.push( end )

        return addLoc( out, location() )
      },
      peg$c36 = function(value) {
        return value
      },
      peg$c37 = function(body, end) {
        const values = body.map( val => val[0] )

        values.push( end )

        const result = {
          type: 'layers',
          values
        }

        return addLoc( result, location() )
      },
      peg$c38 = "<",
      peg$c39 = peg$literalExpectation("<", false),
      peg$c40 = ">",
      peg$c41 = peg$literalExpectation(">", false),
      peg$c42 = function(body, end) {
        const onestep = {
          type:'onestep',
          values:[body]
        }

        if( end !== null ) {
          onestep.values.push( end )
        }

        return addLoc( onestep, location() )
      },
      peg$c43 = peg$otherExpectation("word"),
      peg$c44 = /^[letter number]/,
      peg$c45 = peg$classExpectation(["l", "e", "t", "t", "e", "r", " ", "n", "u", "m", "b", "e", "r"], false, false),
      peg$c46 = function(value) { 
        return addLoc( { type:typeof value, value, }, location() )
      },
      peg$c47 = function(l) {
        return addLoc( { type:'string', value:text().trim() }, location() )
      },
      peg$c48 = /^[^ [\] {} () \t\n\r '*' '\/' '.' '~' '?' ',' '>' '<' ]/,
      peg$c49 = peg$classExpectation([" ", "[", "]", " ", "{", "}", " ", "(", ")", " ", "\t", "\n", "\r", " ", "'", "*", "'", " ", "'", "/", "'", " ", "'", ".", "'", " ", "'", "~", "'", " ", "'", "?", "'", " ", "'", ",", "'", " ", "'", ">", "'", " ", "'", "<", "'", " "], true, false),
      peg$c50 = function(value) {
        return addLoc( {type:'string', value }, location() )
      },
      peg$c51 = ".",
      peg$c52 = peg$literalExpectation(".", false),
      peg$c53 = "-",
      peg$c54 = peg$literalExpectation("-", false),
      peg$c55 = /^[0-9]/,
      peg$c56 = peg$classExpectation([["0", "9"]], false, false),
      peg$c57 = function() {
        return addLoc( { type:'number', value:+text().trim() }, location() )
      },
      peg$c58 = peg$otherExpectation("whitespace"),
      peg$c59 = /^[ \t\n\r ]/,
      peg$c60 = peg$classExpectation([" ", "\t", "\n", "\r", " "], false, false),

      peg$currPos          = 0,
      peg$savedPos         = 0,
      peg$posDetailsCache  = [{ line: 1, column: 1 }],
      peg$maxFailPos       = 0,
      peg$maxFailExpected  = [],
      peg$silentFails      = 0,

      peg$resultsCache = {},

      peg$result;

  if ("startRule" in options) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
    }

    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }

  function text() {
    return input.substring(peg$savedPos, peg$currPos);
  }

  function location() {
    return peg$computeLocation(peg$savedPos, peg$currPos);
  }

  function expected(description, location) {
    location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

    throw peg$buildStructuredError(
      [peg$otherExpectation(description)],
      input.substring(peg$savedPos, peg$currPos),
      location
    );
  }

  function error(message, location) {
    location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

    throw peg$buildSimpleError(message, location);
  }

  function peg$literalExpectation(text, ignoreCase) {
    return { type: "literal", text: text, ignoreCase: ignoreCase };
  }

  function peg$classExpectation(parts, inverted, ignoreCase) {
    return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
  }

  function peg$anyExpectation() {
    return { type: "any" };
  }

  function peg$endExpectation() {
    return { type: "end" };
  }

  function peg$otherExpectation(description) {
    return { type: "other", description: description };
  }

  function peg$computePosDetails(pos) {
    var details = peg$posDetailsCache[pos], p;

    if (details) {
      return details;
    } else {
      p = pos - 1;
      while (!peg$posDetailsCache[p]) {
        p--;
      }

      details = peg$posDetailsCache[p];
      details = {
        line:   details.line,
        column: details.column
      };

      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }

        p++;
      }

      peg$posDetailsCache[pos] = details;
      return details;
    }
  }

  function peg$computeLocation(startPos, endPos) {
    var startPosDetails = peg$computePosDetails(startPos),
        endPosDetails   = peg$computePosDetails(endPos);

    return {
      start: {
        offset: startPos,
        line:   startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line:   endPosDetails.line,
        column: endPosDetails.column
      }
    };
  }

  function peg$fail(expected) {
    if (peg$currPos < peg$maxFailPos) { return; }

    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }

    peg$maxFailExpected.push(expected);
  }

  function peg$buildSimpleError(message, location) {
    return new peg$SyntaxError(message, null, null, location);
  }

  function peg$buildStructuredError(expected, found, location) {
    return new peg$SyntaxError(
      peg$SyntaxError.buildMessage(expected, found),
      expected,
      found,
      location
    );
  }

  function peg$parsepattern() {
    var s0, s1;

    var key    = peg$currPos * 28 + 0,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parsefeet();
    if (s1 === peg$FAILED) {
      s1 = peg$parselist();
      if (s1 === peg$FAILED) {
        s1 = peg$parseterm();
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c0(s1);
    }
    s0 = s1;

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parselist() {
    var s0, s1, s2, s3, s4, s5;

    var key    = peg$currPos * 28 + 1,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 !== peg$FAILED) {
      s2 = peg$parseterm();
      if (s2 !== peg$FAILED) {
        s3 = peg$parse_();
        if (s3 !== peg$FAILED) {
          s4 = [];
          s5 = peg$parseterm();
          if (s5 !== peg$FAILED) {
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$parseterm();
            }
          } else {
            s4 = peg$FAILED;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c1(s2, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsegroup() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    var key    = peg$currPos * 28 + 2,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 91) {
        s2 = peg$c3;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c4); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parse_();
        if (s3 !== peg$FAILED) {
          s4 = [];
          s5 = peg$parseterm();
          if (s5 !== peg$FAILED) {
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$parseterm();
            }
          } else {
            s4 = peg$FAILED;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 93) {
                s6 = peg$c5;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c6); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                if (s7 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c7(s4);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c2); }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseterm() {
    var s0, s1, s2;

    var key    = peg$currPos * 28 + 3,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$parseeuclid();
    if (s1 === peg$FAILED) {
      s1 = peg$parsespeed();
      if (s1 === peg$FAILED) {
        s1 = peg$parseslow();
        if (s1 === peg$FAILED) {
          s1 = peg$parsedegrade();
          if (s1 === peg$FAILED) {
            s1 = peg$parselayer();
            if (s1 === peg$FAILED) {
              s1 = peg$parsenumber();
              if (s1 === peg$FAILED) {
                s1 = peg$parseletters();
                if (s1 === peg$FAILED) {
                  s1 = peg$parsepolymeter();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parsegroup();
                    if (s1 === peg$FAILED) {
                      s1 = peg$parseletter();
                      if (s1 === peg$FAILED) {
                        s1 = peg$parserest();
                        if (s1 === peg$FAILED) {
                          s1 = peg$parseonestep();
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c9(s1);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c8); }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseeuclid() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15;

    var key    = peg$currPos * 28 + 4,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsenoteuclid();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 40) {
          s3 = peg$c10;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c11); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseterm();
            if (s5 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 44) {
                s6 = peg$c12;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c13); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseterm();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parse_();
                    if (s9 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 41) {
                        s10 = peg$c14;
                        peg$currPos++;
                      } else {
                        s10 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c15); }
                      }
                      if (s10 === peg$FAILED) {
                        s10 = null;
                      }
                      if (s10 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 44) {
                          s11 = peg$c12;
                          peg$currPos++;
                        } else {
                          s11 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c13); }
                        }
                        if (s11 === peg$FAILED) {
                          s11 = null;
                        }
                        if (s11 !== peg$FAILED) {
                          s12 = peg$parse_();
                          if (s12 !== peg$FAILED) {
                            s13 = [];
                            s14 = peg$parseterm();
                            while (s14 !== peg$FAILED) {
                              s13.push(s14);
                              s14 = peg$parseterm();
                            }
                            if (s13 !== peg$FAILED) {
                              s14 = peg$parse_();
                              if (s14 !== peg$FAILED) {
                                if (input.charCodeAt(peg$currPos) === 41) {
                                  s15 = peg$c14;
                                  peg$currPos++;
                                } else {
                                  s15 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$c15); }
                                }
                                if (s15 === peg$FAILED) {
                                  s15 = null;
                                }
                                if (s15 !== peg$FAILED) {
                                  peg$savedPos = s0;
                                  s1 = peg$c16(s2, s5, s8, s13);
                                  s0 = s1;
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsenoteuclid() {
    var s0, s1, s2;

    var key    = peg$currPos * 28 + 5,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parsegroup();
    if (s1 === peg$FAILED) {
      s1 = peg$parsenumber();
      if (s1 === peg$FAILED) {
        s1 = peg$parseword();
        if (s1 === peg$FAILED) {
          s1 = peg$parseletters();
          if (s1 === peg$FAILED) {
            s1 = peg$parseletter();
            if (s1 === peg$FAILED) {
              s1 = peg$parserest();
              if (s1 === peg$FAILED) {
                s1 = peg$parseonestep();
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c17(s1);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsedegrade() {
    var s0, s1, s2;

    var key    = peg$currPos * 28 + 6,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parsenotdegrade();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 63) {
        s2 = peg$c18;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c19); }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c20(s1);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsenotdegrade() {
    var s0;

    var key    = peg$currPos * 28 + 7,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$parsenumber();
    if (s0 === peg$FAILED) {
      s0 = peg$parsespeed();
      if (s0 === peg$FAILED) {
        s0 = peg$parseslow();
        if (s0 === peg$FAILED) {
          s0 = peg$parseeuclid();
          if (s0 === peg$FAILED) {
            s0 = peg$parsegroup();
            if (s0 === peg$FAILED) {
              s0 = peg$parseletter();
              if (s0 === peg$FAILED) {
                s0 = peg$parseonestep();
              }
            }
          }
        }
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsespeed() {
    var s0, s1, s2, s3, s4, s5, s6;

    var key    = peg$currPos * 28 + 8,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parsenotspeed();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 42) {
          s3 = peg$c21;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c22); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsenotspeed();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse_();
              if (s6 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c23(s1, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsenotspeed() {
    var s0, s1, s2;

    var key    = peg$currPos * 28 + 9,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parseeuclid();
    if (s1 === peg$FAILED) {
      s1 = peg$parsepolymeter();
      if (s1 === peg$FAILED) {
        s1 = peg$parsenumber();
        if (s1 === peg$FAILED) {
          s1 = peg$parselayer();
          if (s1 === peg$FAILED) {
            s1 = peg$parseletters();
            if (s1 === peg$FAILED) {
              s1 = peg$parsegroup();
              if (s1 === peg$FAILED) {
                s1 = peg$parseletter();
                if (s1 === peg$FAILED) {
                  s1 = peg$parserest();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parseonestep();
                  }
                }
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c17(s1);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseslow() {
    var s0, s1, s2, s3, s4, s5, s6;

    var key    = peg$currPos * 28 + 10,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parsenotslow();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 47) {
          s3 = peg$c24;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c25); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsenotslow();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse_();
              if (s6 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c26(s1, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsenotslow() {
    var s0, s1, s2;

    var key    = peg$currPos * 28 + 11,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parseeuclid();
    if (s1 === peg$FAILED) {
      s1 = peg$parsepolymeter();
      if (s1 === peg$FAILED) {
        s1 = peg$parsenumber();
        if (s1 === peg$FAILED) {
          s1 = peg$parselayer();
          if (s1 === peg$FAILED) {
            s1 = peg$parseletters();
            if (s1 === peg$FAILED) {
              s1 = peg$parsegroup();
              if (s1 === peg$FAILED) {
                s1 = peg$parseletter();
                if (s1 === peg$FAILED) {
                  s1 = peg$parserest();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parseonestep();
                  }
                }
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c17(s1);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsepolymeter() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;

    var key    = peg$currPos * 28 + 12,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 123) {
        s2 = peg$c27;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c28); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parse_();
        if (s3 !== peg$FAILED) {
          s4 = [];
          s5 = peg$parseterm();
          if (s5 !== peg$FAILED) {
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$parseterm();
            }
          } else {
            s4 = peg$FAILED;
          }
          if (s4 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 44) {
              s5 = peg$c12;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c13); }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse_();
              if (s6 !== peg$FAILED) {
                s7 = [];
                s8 = peg$parseterm();
                if (s8 !== peg$FAILED) {
                  while (s8 !== peg$FAILED) {
                    s7.push(s8);
                    s8 = peg$parseterm();
                  }
                } else {
                  s7 = peg$FAILED;
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse_();
                  if (s8 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 125) {
                      s9 = peg$c29;
                      peg$currPos++;
                    } else {
                      s9 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c30); }
                    }
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parse_();
                      if (s10 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c31(s4, s7);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parserest() {
    var s0, s1;

    var key    = peg$currPos * 28 + 13,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 126) {
      s1 = peg$c32;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c33); }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c34();
    }
    s0 = s1;

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsefeet() {
    var s0, s1, s2;

    var key    = peg$currPos * 28 + 14,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parsefoot();
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsefoot();
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsenotfoot();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c35(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsefoot() {
    var s0, s1, s2, s3;

    var key    = peg$currPos * 28 + 15,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parsenotfoot();
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsenotfoot();
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsedot();
      if (s2 !== peg$FAILED) {
        s3 = peg$parse_();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c36(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsenotfoot() {
    var s0;

    var key    = peg$currPos * 28 + 16,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$parselist();
    if (s0 === peg$FAILED) {
      s0 = peg$parsedegrade();
      if (s0 === peg$FAILED) {
        s0 = peg$parsepolymeter();
        if (s0 === peg$FAILED) {
          s0 = peg$parserest();
          if (s0 === peg$FAILED) {
            s0 = peg$parsespeed();
            if (s0 === peg$FAILED) {
              s0 = peg$parseslow();
              if (s0 === peg$FAILED) {
                s0 = peg$parseeuclid();
                if (s0 === peg$FAILED) {
                  s0 = peg$parsenumber();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parseletter();
                    if (s0 === peg$FAILED) {
                      s0 = peg$parseletters();
                      if (s0 === peg$FAILED) {
                        s0 = peg$parseword();
                        if (s0 === peg$FAILED) {
                          s0 = peg$parseonestep();
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parselayer() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    var key    = peg$currPos * 28 + 17,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 91) {
        s2 = peg$c3;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c4); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parse_();
        if (s3 !== peg$FAILED) {
          s4 = [];
          s5 = peg$currPos;
          s6 = peg$parsenotlayer();
          if (s6 !== peg$FAILED) {
            s7 = peg$parse_();
            if (s7 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 44) {
                s8 = peg$c12;
                peg$currPos++;
              } else {
                s8 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c13); }
              }
              if (s8 !== peg$FAILED) {
                s9 = peg$parse_();
                if (s9 !== peg$FAILED) {
                  s6 = [s6, s7, s8, s9];
                  s5 = s6;
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
          if (s5 !== peg$FAILED) {
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$currPos;
              s6 = peg$parsenotlayer();
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                if (s7 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 44) {
                    s8 = peg$c12;
                    peg$currPos++;
                  } else {
                    s8 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c13); }
                  }
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parse_();
                    if (s9 !== peg$FAILED) {
                      s6 = [s6, s7, s8, s9];
                      s5 = s6;
                    } else {
                      peg$currPos = s5;
                      s5 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            }
          } else {
            s4 = peg$FAILED;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parsenotlayer();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse_();
              if (s6 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 93) {
                  s7 = peg$c5;
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c6); }
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse_();
                  if (s8 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c37(s4, s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsenotlayer() {
    var s0, s1, s2;

    var key    = peg$currPos * 28 + 18,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parsespeed();
    if (s1 === peg$FAILED) {
      s1 = peg$parseslow();
      if (s1 === peg$FAILED) {
        s1 = peg$parselist();
        if (s1 === peg$FAILED) {
          s1 = peg$parsenumber();
          if (s1 === peg$FAILED) {
            s1 = peg$parseletters();
            if (s1 === peg$FAILED) {
              s1 = peg$parseeuclid();
              if (s1 === peg$FAILED) {
                s1 = peg$parsepolymeter();
                if (s1 === peg$FAILED) {
                  s1 = peg$parsegroup();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parseletter();
                    if (s1 === peg$FAILED) {
                      s1 = peg$parserest();
                      if (s1 === peg$FAILED) {
                        s1 = peg$parseonestep();
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c17(s1);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseonestep() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    var key    = peg$currPos * 28 + 19,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 60) {
      s1 = peg$c38;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c39); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsenotonestep();
        if (s3 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s4 = peg$c12;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c13); }
          }
          if (s4 === peg$FAILED) {
            s4 = null;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parsenotonestep();
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse_();
              if (s6 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 62) {
                  s7 = peg$c40;
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c41); }
                }
                if (s7 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c42(s3, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsenotonestep() {
    var s0, s1, s2;

    var key    = peg$currPos * 28 + 20,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parselist();
    if (s1 === peg$FAILED) {
      s1 = peg$parseeuclid();
      if (s1 === peg$FAILED) {
        s1 = peg$parsepolymeter();
        if (s1 === peg$FAILED) {
          s1 = peg$parseword();
          if (s1 === peg$FAILED) {
            s1 = peg$parsegroup();
            if (s1 === peg$FAILED) {
              s1 = peg$parsenumber();
              if (s1 === peg$FAILED) {
                s1 = peg$parseletter();
                if (s1 === peg$FAILED) {
                  s1 = peg$parserest();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parselayer();
                  }
                }
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c17(s1);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseword() {
    var s0, s1, s2, s3, s4;

    var key    = peg$currPos * 28 + 21,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = [];
      if (peg$c44.test(input.charAt(peg$currPos))) {
        s4 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c45); }
      }
      if (s4 !== peg$FAILED) {
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          if (peg$c44.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c45); }
          }
        }
      } else {
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        s2 = input.substring(s2, peg$currPos);
      } else {
        s2 = s3;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parse_();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c46(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c43); }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseletters() {
    var s0, s1, s2, s3;

    var key    = peg$currPos * 28 + 22,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parseletter();
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseletter();
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parse_();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c47(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseletter() {
    var s0, s1, s2;

    var key    = peg$currPos * 28 + 23,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$currPos;
    if (peg$c48.test(input.charAt(peg$currPos))) {
      s2 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c49); }
    }
    if (s2 !== peg$FAILED) {
      s1 = input.substring(s1, peg$currPos);
    } else {
      s1 = s2;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c50(s1);
    }
    s0 = s1;

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsedot() {
    var s0;

    var key    = peg$currPos * 28 + 24,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    if (input.charCodeAt(peg$currPos) === 46) {
      s0 = peg$c51;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c52); }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsequestion() {
    var s0;

    var key    = peg$currPos * 28 + 25,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    if (input.charCodeAt(peg$currPos) === 63) {
      s0 = peg$c18;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c19); }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsenumber() {
    var s0, s1, s2, s3, s4, s5, s6;

    var key    = peg$currPos * 28 + 26,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 45) {
      s1 = peg$c53;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c54); }
    }
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = [];
      if (peg$c55.test(input.charAt(peg$currPos))) {
        s4 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c56); }
      }
      if (s4 !== peg$FAILED) {
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          if (peg$c55.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c56); }
          }
        }
      } else {
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 46) {
          s4 = peg$c51;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c52); }
        }
        if (s4 !== peg$FAILED) {
          s5 = [];
          if (peg$c55.test(input.charAt(peg$currPos))) {
            s6 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c56); }
          }
          while (s6 !== peg$FAILED) {
            s5.push(s6);
            if (peg$c55.test(input.charAt(peg$currPos))) {
              s6 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c56); }
            }
          }
          if (s5 !== peg$FAILED) {
            s3 = [s3, s4, s5];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 === peg$FAILED) {
        s2 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 46) {
          s3 = peg$c51;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c52); }
        }
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = [];
          if (peg$c55.test(input.charAt(peg$currPos))) {
            s5 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c56); }
          }
          if (s5 !== peg$FAILED) {
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              if (peg$c55.test(input.charAt(peg$currPos))) {
                s5 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c56); }
              }
            }
          } else {
            s4 = peg$FAILED;
          }
          if (s4 !== peg$FAILED) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c57();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parse_() {
    var s0, s1;

    var key    = peg$currPos * 28 + 27,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    peg$silentFails++;
    s0 = [];
    if (peg$c59.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c60); }
    }
    while (s1 !== peg$FAILED) {
      s0.push(s1);
      if (peg$c59.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c60); }
      }
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c58); }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }


    const addLocations = options.addLocations
   
    let uid = 0
    const addLoc = function( value, location ) {
      if( addLocations === true ) {
        value.location = location
      }
      
      if( options.addUID === true ) {
        value.uid = uid++
      }

      return value
    }


  peg$result = peg$startRuleFunction();

  if (peg$result !== peg$FAILED && peg$currPos === input.length) {
    return peg$result;
  } else {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }

    throw peg$buildStructuredError(
      peg$maxFailExpected,
      peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
      peg$maxFailPos < input.length
        ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
        : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
    );
  }
}

module.exports = {
  SyntaxError: peg$SyntaxError,
  parse:       peg$parse
};

},{}],165:[function(require,module,exports){
const parse = require('../dist/tidal.js').parse
const query = require('./queryArc.js' ).queryArc
const Fraction = require( 'fraction.js' )

/* The Pattern object is used to parse a pattern
 * a single time and then query it repeatedly, assuming
 * different start and end times for each query. A priority
 * queue is used to sort the events... 
*/
const Pattern = ( patternString, opts ) => {
  if( typeof patternString !== 'string' )
    throw 'You must provide a string to generate the pattern from'

  let __data
  try{
    __data = parse( patternString, opts )
  }catch( e ) {
    throw `We were unable to parse the pattern ${patternString}. ${e.toString()}`
  }

  const ptrn = {
    __rawString: patternString,
    __data,

    events: null,

    __sort( a,b ) { return a.arc.start.compare( b.arc.start ) },
    query( start, duration ) {
      if( typeof start !== 'object' ) start = Fraction( start )
      if( typeof duration !== 'object' ) duration = Fraction( duration )

      ptrn.events = query( 
        ptrn.__data, 
        start,
        duration 
      )
      .sort( ptrn.__sort )

      return ptrn.events
    },

    print() {
      if( ptrn.events !== null ) {
        ptrn.events.forEach( v => 
          console.log( 
            `${v.arc.start.toFraction()} - ${v.arc.end.toFraction()}: [ ${v.value.toString()} ]` 
          ) 
        )
      }else{
        console.log( 'No events have been generated from the pattern; have you queried it yet?' )
      }
    }
  }

  return ptrn
}

module.exports = Pattern

},{"../dist/tidal.js":164,"./queryArc.js":166,"fraction.js":75}],166:[function(require,module,exports){
const Fraction = require( 'fraction.js' )
const util     = require( 'util' )
const bjork    = require( 'bjork' ) 
const log      = util.inspect
const srand    = require( 'seedrandom' )

const rnd = function( phase ) {
  //console.log( 'phase', phase.toFraction() )
  return new srand( phase.toFraction() )()
}

/* queryArc
 *
 * Generates events for provided pattern, starting at
 * an initial phase, subdivides queries in individual 
 * cycles if duration of query is greater than 1 cycle.
 * Filters events outside of the the intended range. 
 * Remaps events to be relative to the initial phase.
 */
const queryArc = function( pattern, phase, duration ) {
  const start         = phase.clone(),
        end           = start.add( duration ),
        // get phase offset if scheduling begins in middle of event arc
        adjustedPhase = adjustPhase( phase, getPhaseIncr( pattern ), end )

  let eventList

  // if we're querying an arc that is less than or equal to one cycle in length..
  if( duration.valueOf() <= 1 ) {
    eventList = processPattern( 
      pattern, 
      duration, 
      adjustedPhase, 
      null, 
      null, 
      false//shouldRemap( pattern ) 
    )
  }else{
    // for longer arcs we need to query one cycle at a time
    eventList = []
    let count = 0
    for( let i = adjustedPhase.valueOf(); i < adjustedPhase.add( duration ).valueOf(); i++ ) {
      eventList = eventList.concat( 
        processPattern( 
          pattern, 
          Fraction(1),
          adjustedPhase.add( count++ ), 
          null, 
          null, 
          false
        )
      )
    }
  }

  // prune any events that fall before our start phase or after our end phase
  eventList = eventList.filter( evt => {
    return (evt.arc.start.valueOf() >= start.valueOf() 
        && evt.arc.start.valueOf()  <  end.valueOf() ) 
  })
  // remap events to make their arcs relative to initial phase argument
  .map( evt => {
    evt.arc.start = evt.arc.start.sub( start )
    evt.arc.end   = evt.arc.end.sub( start )
    return evt
  })
 
  //console.log( 'eventList:', log(eventList,{depth:4}) )
  return eventList
}

// if an event is found that represents a pattern (as opposed to a constant) this function
// is called to query the pattern and map any generated events to the appropriate timespan
const processPattern = ( pattern, duration, phase, phaseIncr=null, override = null, shouldRemapArcs=false ) => {
  //if( phaseIncr !== null ) debugger
  const state = []
  state.phase = phase
  let events = handlers[ pattern.type ]( 
    state, 
    pattern, 
    /*shouldReset( pattern ) === true ? Fraction(0) :*/ phase.clone(), 
    // XXX this is confusing. we are getting around a problem
    // with polymeters where duplicate events are generated by
    // not passing a phaseIncr... it's not needed since there's an
    // override. But this doesn't seem like correct way to solve
    // this problem and will probably cause future problems...
    phaseIncr !== null ? duration.div( phaseIncr ) : duration, 
    override 
  )

  // if needed, remap arcs for events
  if( shouldRemapArcs === true ) {
    if( phaseIncr === null ) phaseIncr = getPhaseIncr( pattern )
    events = events.map( v => ({
      value: v.value,
      arc: getMappedArc( v.arc, phase.clone(), phaseIncr )
    }) )
  }
 
  return events 
}
// placeholder for potentially adding more goodies (parent arc etc.) later
const Arc = ( start, end ) => ({ start, end })

const shouldNotRemap = ['polymeter', 'onestep']
const shouldRemap = pattern => shouldNotRemap.indexOf( pattern.type ) === -1

// XXX seems like getMappedArc should be changed to what onestep and group are now using?
// would that change work with how getMappedArc is used in processPattern?

// map arc time values to appropriate durations
const getMappedArc = ( arc, phase, phaseIncr ) => {
  let mappedArc
  
  if( phase.mod( phaseIncr ).valueOf() !== 0 ) {
    mappedArc = Arc( 
      arc.start.mul( phaseIncr ).add( phase ), 
      arc.end.mul( phaseIncr ).add( phaseIncr.mod( phase ) ) 
    )
  }else{
    mappedArc = Arc( 
      arc.start.mul( phaseIncr ).add( phase ), 
      arc.end.mul( phaseIncr ).add( phase ) 
    )
  }
  
  return mappedArc
}

// if initial phase is in the middle of an arc, advance to the end by calculating the difference
// between the current phase and the start of the next arc, and increasing phase accordingly.
const adjustPhase = ( phase, phaseIncr, end ) => phase.valueOf() === 0 
  ? Fraction(0) 
  : phase.sub( phase.mod( phaseIncr ) )

// check to see if phase should advance to next event, or, if next event is too far in the future, to the
// end of the current duration being requested.
const advancePhase = ( phase, phaseIncr, end ) => phase + phaseIncr <= end ? phase.add( phaseIncr ) : end 

// calculate the duration of the current event being processed.
const calculateDuration = ( phase, phaseIncr, end ) => phase + phaseIncr <= end ? phaseIncr : end.sub( phase )

// get an index number for a pattern for a particular phase
const getIndex = ( pattern, phase ) => {
  let idx = 0
  if( pattern.options !== undefined ) {
    if( pattern.options.overrideIncr === true ) {
      idx = phase.div( pattern.options.incr ).mod( pattern.values.length ).floor()
    }
  }else{
    // default list behavior
    idx = phase.mul( Fraction( pattern.values.length ) ).mod( pattern.values.length ).floor()
  }

  return idx.valueOf()
}

// in addition to 'fast', phase resets are also necessary when indexing subpatterns,
// which are currently arrays with no defined .type property, hence the inclusion of
// undefined in the array below
const shouldResetPhase = [ 'repeat', undefined, 'group', 'layers' ] 

// XXX does these need to look at all parents recursively? Right now we're only using one generation...
const shouldReset = pattern => {
  const reset = shouldResetPhase.indexOf( pattern.type ) > -1 
  const parent = pattern.parent !== undefined && shouldResetPhase.indexOf( pattern.parent.type ) > -1

  return reset && parent
}

// I assume this will need to be a switch on pattern.type in the future...
const getPhaseIncr = pattern => {
  let incr

  switch( pattern.type ) {
    case 'polymeter': incr = Fraction( 1, pattern.left.values.length ); break;
    case 'number': case 'string': incr = Fraction( 1 ); break;
    case 'onestep': incr = null; break;
    default:
      if( pattern.values === undefined ){
        incr = Fraction(1)
      } else {
        incr = Fraction( 1, pattern.values.length )
        //let len = 0
        //pattern.values.forEach( v => len += v.type === 'slow' ? v.rate.value : 1 )
        //incr = Fraction( 1, len ) 
      }
      break;

  }

  return incr
}

const handlers = {
  rest( state ) { return state },

  // standard lists e.g. '0 1 2 3' or '[0 1 2]'
  group( state, pattern, phase, duration, overrideIncr=null ) {
    const start     = phase.clone(),
          end       = start.add( duration ),
          phaseIncr = overrideIncr === null 
            ? getPhaseIncr( pattern ) 
            : overrideIncr
          
    let eventList = []

    //console.log( 
    //  'type:',  pattern.type, 
    //  'phase:', phase.toFraction(),
    //  'incr:',  phaseIncr.toFraction(),
    //  'dur:',   duration.toFraction()
    //)
    
    while( phase.compare( end ) < 0 ) {
      // if pattern is a list, read using current phase, else read directly
      const member = Array.isArray( pattern.values ) === true 
        ? pattern.values[ getIndex( pattern, phase ) ] 
        : pattern.value

      // get duration of current event being processed
      const dur = calculateDuration( phase, phaseIncr, end )

      // if value is not a numeric or string constant (if it's a pattern)...
      if( member === undefined || (isNaN( member.value ) && typeof member.value !== 'string') ) {
        // query the pattern and remap time values appropriately 
        if( member !== undefined ) member.parent = pattern
        //console.log( 'processing ', pattern.type, member.type, dur.toFraction(),  phaseIncr.toFraction() )
        const events = processPattern( 
          member, 
          Fraction(1), 
          //member.type !== 'slow' ? Fraction(0) : phase.clone(), 
          Fraction(0),
          null, //getPhaseIncr(member),
          null, 
          false//shouldRemap( member )
        )
        .map( evt => {
          evt.arc.start = evt.arc.start.mul( dur ).add( phase )
          evt.arc.end   = evt.arc.end.mul( dur ).add( phase )
          return evt
        })

        eventList = eventList.concat( events )
      }else{
        // XXX shouldn't we just process all patterns???
        // member does not need further processing, so add to event list
        const evt = { 
          value:member.value, 
          arc:Arc( phase, phase.add( dur ) ),
        }
        if( member.uid !== undefined ) evt.uid = member.uid 

        eventList.push( evt )
      }

      // assuming we are starting / ending at a regular phase increment value...
      
      if( phase.mod( phaseIncr ).valueOf() === 0 ) {
        phase = advancePhase( phase, phaseIncr, end )
      }else{
        // advance phase to next phase increment
        phase = phase.add( phaseIncr.sub( phase.mod( phaseIncr ) ) ) 
      }
    }

    // prune any events that fall before our start phase or after our end phase
    eventList = eventList.filter( evt => {
      return evt.arc.start.valueOf() >= start.valueOf() && evt.arc.start.valueOf() < end.valueOf()
    })
   
    return state.concat( eventList )
  },

  bjorklund( state, pattern, phase, duration ) {
    const onesAndZeros = bjork( pattern.pulses.value, pattern.slots.value )
    let rotation = pattern.rotation !== null ? pattern.rotation.value : 0
    
    // rotate right
    if( rotation > 0 ) {
      while( rotation > 0 ) {
        const right = onesAndZeros.pop()
        onesAndZeros.unshift( right )
        rotation--
      }
    } else if( rotation < 0 ) {
      // rotate left
      while( rotation < 0 ) {
        const left = onesAndZeros.shift()
        onesAndZeros.push( left )
        rotation++
      }
    }
    
    const slotDuration = duration.div( pattern.slots.value )
    const valueIsValue = pattern.value.type === 'number' || pattern.value.type === 'string'

    const events = onesAndZeros.map( ( shouldInclude, i, arr ) => {
      let evt
      // don't process unless an actual event will be included...
      if( shouldInclude === 1 ) {
        const startPhase = phase.add( slotDuration.mul( i ) )
        evt = {
          shouldInclude,
          // XXX is there a case where we should use more than 
          // the first value by querying the value pattern?
          value:valueIsValue ? pattern.value : processPattern( pattern.value, slotDuration, startPhase )[0].value,
          arc:Arc( startPhase, startPhase.add( slotDuration ) ) 
        }
      }else{
        evt = { shouldInclude }
      }

      return evt
    })
    .filter( evt => {
      let shouldInclude = evt.shouldInclude

      // needed to pass tests and is also cleaner...
      delete evt.shouldInclude
      return shouldInclude === 1
    })

    events.forEach( evt => {
      evt.uid = pattern.value.uid
      state.push( evt ) 
    })
    
    return state
  },

  onestep( state, pattern, phase, duration ) {
    pattern.values.forEach( group => {
      // initialize, then increment. this assumes that the pattern will be parsed once,
      // and then the resulting data structure will be queried repeatedly, enabling the use
      // of state.
      group.count = group.count === undefined ? 0 : group.count + 1

      const subpattern = group.values[ group.count % group.values.length ]
      const dur = duration.valueOf() <= 1 ? Fraction(1) : duration 
      const durDiff = duration.mul( dur ) 

      const events = processPattern( 
        subpattern, 
        dur,
        Fraction(0), 
        null,
        null,null,true
      ).map( evt => {
        evt.arc.start = evt.arc.start.mul( duration ).add( phase )
        evt.arc.end = evt.arc.end.mul( duration ).add( phase )

        return evt
      })  

      state.push( ...events )
    })

    return state
  },

  number( state, pattern, phase, duration ) {
    //if( phase.valueOf() === 0 ) {
      const evt = { arc:Arc( phase, phase.add( duration ) ), value:pattern.value }
      if( pattern.uid !== undefined ) evt.uid = pattern.uid
      state.push(evt)
    //}
    return state 
  },

  string( state, pattern, phase, duration ) {
    const evt = { arc:Arc( phase, phase.add( duration ) ), value:pattern.value }
    if( pattern.uid !== undefined ) evt.uid = pattern.uid
    state.push(evt)
    return state 
  },

  degrade( state, pattern, phase, duration ) {
    // attempt to seed random... rnd( state.phase )
    const rnum = Math.random()
    //console.log( 'rnd:', rnum, state.phase.toFraction() )
    if( rnum > .5 ) {
      const evt = { 
        arc:Arc( phase, phase.add( duration ) ), 
        value:pattern.value.value
      }

      //console.log( 'adding', evt )

      if( pattern.uid !== undefined ) evt.uid = pattern.uid

      state.push( evt )
    }

    return state 
  },

  polymeter( state, pattern, phase, duration ) {
    pattern.left.parent = pattern.right.parent = pattern

    const incr  = Fraction( 1, pattern.left.values.length )
    const left  = processPattern( pattern.left, duration, phase.clone(), duration, incr, false )

    pattern.right.options = { overrideIncr: true, incr }
    const right = processPattern( pattern.right, duration, phase.clone(), duration, incr, false ) 

    return state.concat( left ).concat( right )
  },

  layers( state, pattern, phase, duration ) {
    //pattern.left.parent = pattern.right.parent = pattern
    for( const group of pattern.values ) {
      const incr = getPhaseIncr( group )
      const events = processPattern( group, duration.clone(), phase.clone(), duration, null, false)
      // not sure why excess events are generated, but they need to be filtered...
      .filter( evt => 
        evt.arc.start.valueOf() >= phase.valueOf() 
        && evt.arc.start.valueOf() < phase.add( duration ).valueOf()
      )
      
      //console.log( 'group:', util.inspect( group, { depth:3 }) )
      //console.log( 'state:', util.inspect( events, { depth:3 }))
      state = state.concat( events )
    }

    return state
  },

  slow( state, pattern, phase, duration ) {
    const speed = pattern.rate.value

    let events
    //if( phase.valueOf() % speed === 0 ) {
      // XXX why do we need this edge case?
      const phaseDiff = phase.sub( phase.div( speed ) )

      if( pattern.value.type !== 'layers' ) {
        //events = queryArc(
        //  pattern.value,
        //  phase.div( speed ),
        //  duration.div( speed )
        //)
        //console.log( duration, phase, speed )
        //events = processPattern(
        //  pattern.value,
        //  duration.mul( speed ),
        //  phase.div( speed )
        //)       
        events = queryArc(
          pattern.value,
          Fraction(0),
          duration.div( speed ) 
        ).map( evt => {
          const diff = evt.arc.end.sub( evt.arc.start )
          evt.arc.start = evt.arc.start.add( phase )
          evt.arc.end   = evt.arc.start.add( duration.mul( speed ) ).add( phase )
          //console.log( diff, duration.mul( speed ), evt.arc.start, evt.arc.end )
          return evt
        })
      }else{
        events = handlers.layers( state, pattern.value, phase.div( speed ), duration.div( speed ) )
      }

      //console.log( log( events, { depth:3 }), phase.add( duration ).toFraction() )
      //if( pattern.value.type === 'group' ) {
      //  events = events.map( evt => {
      //    evt.arc.start = evt.arc.start.mul( speed )
      //    evt.arc.end   = evt.arc.end.mul( speed )
      //    return evt
      //  })
      //}
      //events = events.map( evt => {
      //  evt.arc.start = evt.arc.start.add( phaseDiff )
      //  evt.arc.end   = evt.arc.end.add( phaseDiff )
      //  //evt.arc.start = evt.arc.start.add( phase )
      //  //evt.arc.end   = evt.arc.end.add( phase )
      //  return evt
      //})
      //.filter( evt => evt.arc.start.valueOf() < phase.add( duration ).valueOf() )
    //}
    //console.log( 'slow:', log( events, { depth:3 }), phase.add( duration ).toFraction() )

    if( events !== undefined ) state = state.concat( events )

    return state
  },

//const processPattern = ( pattern, duration, phase, phaseIncr=null, override = null, shouldRemapArcs=true ) => {
  speed( state, pattern, phase, duration ) {
    // the general process of increasing the speed of a pattern is to query
    // for a longer duration according to the speed, and the scale the resulting
    // events.
    
    // following explanation from yaxu for how subpatterns work with rates...
    // https://talk.lurk.org/channel/tidal?msg=z5ck73H9EvxQwMqq6 
    // re: pattern a*[2 4 8]
    // "Anyway what happens in this kind of situation is that it splits the cycle in three, 
    // each a window on what would have happened if you'd have sped things up by the given number
    // so for the first third you'd get a third of two a's
    // for the second third you'd get the second third of four a's..."
    
    const speed = pattern.rate.value
    const events = queryArc(
      pattern.value,
      Fraction(0),
      duration.mul( speed ) 
    ).map( evt => {
      evt.arc.start = evt.arc.start.div( speed ).add( phase )
      evt.arc.end   = evt.arc.end.div( speed ).add( phase )
      return evt
    })

    // XXX account for having a speeds pattern!!!!
    /*
    
    const incr = Fraction(1, speeds.length)
    const speeds = queryArc( pattern.rate, Fraction(0), Fraction(1) )

    for( let i = 0; i < speeds.length; i++ ) {
      let speed = speeds[ i ].value

      if( pattern.operator === '*' ) {
        //events = queryArc( 
        //  pattern.value,
        //  phase.clone(), //Fraction( 0 ), 
        //  Fraction( speed ).mul( duration )
        //)
        events = processPattern(
          pattern.value,
          duration.mul( speed ),
          phase.clone()//Fraction( speed ).mul( duration )
          //phase.clone() 
        )
          
        // remap events to correct time spans
        .map( evt => {
          evt.arc.start = evt.arc.start.div( speed )//.add( phase )
          evt.arc.end   = evt.arc.end.div( speed )//.add( phase )
          return evt
        })
        //.filter( evt => 
        //  evt.arc.start.compare( incr.mul( i ) ) >= 0 
        //    && evt.arc.start.compare( incr.mul( i+1 ) ) < 0 
        //))
        // add to previous events
        .concat( events )
      }else{
        speed = 1/speed
        //console.log( 'phase:', phase.mul( speed ) )
        events = processPattern( 
          pattern.value, 
          duration.mul( Fraction( speed ) ), 
          phase.mul( speed ),
          getPhaseIncr( pattern ).mul( speed ), null, false
        )
        //console.log( 'events:', log( events, { depth:4 } ) )
        // remap events to correct time spans
        events.map( evt => {
          if( evt.arc.start.valueOf() !== 0 ) {
            // XXX I don't know why this is necessary but it gets rid of a off-by-one error
            evt.arc.start = evt.arc.start.sub( phase.div( 1/speed ) )
          }

          // also, does the event length need to be adjusted? might as well...
          //console.log( 'end:', evt.arc.end.toFraction(), phase.toFraction(), speed )
          evt.arc.end = evt.arc.end.mul( 1/speed )//.mul( 1/speed )
          //evt.arc.end.sub( phase.div( 1/speed ) ).add( 1/speed - 1)

          return evt
        })
        // remove events don't fall in the current window
        .filter( evt => 
          evt.arc.start.compare( incr.mul(i) ) >= 0 && 
          evt.arc.start.compare( incr.mul(i+1) ) <= 0 
        )
        // add to previous events
        .concat( events )
      }
    }*/

    //console.log( 'events:', log( events, { depth:4 }) )
    return state.concat( events )
  },
}

module.exports.queryArc = queryArc

},{"bjork":72,"fraction.js":75,"seedrandom":155,"util":169}],167:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],168:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],169:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":168,"_process":154,"inherits":167}]},{},[35])(35)
});
class GibberishProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {}

  constructor( options ) {
    super( options )
    
    Gibberish = global.Gibberish
    Gibberish.ctx = { sampleRate }
    Gibberish.genish.hasWorklet = false
    Gibberish.preventProxy = true
    Gibberish.init( undefined, undefined, 'processor' )
    Gibberish.preventProxy = false
    Gibberish.debug = false 
    Gibberish.processor = this

    this.port.onmessage = this.handleMessage.bind( this )
    this.queue = []
    Gibberish.ugens = this.ugens = new Map()

    // XXX ridiculous hack to get around processor not having a worklet property
    Gibberish.worklet = { ugens: this.ugens }

    this.ugens.set( Gibberish.id, Gibberish )

    this.messages = []
  }

  replaceProperties( obj ) {
    if( Array.isArray( obj ) ) {
      const out = []
      for( let i = 0; i < obj.length; i++ ){
        const prop = obj[ i ]
        if( prop === null ) continue
        //console.log( 'PROP:', prop )
        if( typeof prop === 'object' && prop.id !== undefined ) {
          let objCheck = this.ugens.get( prop.id )

          if( objCheck !== undefined ) {
            out[ i ] = prop.prop !== undefined ? objCheck[ prop.prop ] : objCheck

            if( prop.prop !== undefined ) console.log( 'got a ssd.out', prop, objCheck )
          }else{
            out[ i ]= prop
          }
        }else{
          if( prop === null ) continue

          if( typeof prop === 'object' && prop.action === 'wrap' ) {
            out[ i  ] = prop.value.bind( null, ...this.replaceProperties( prop.args ) )
          }else if( Array.isArray( prop ) ) {
            out[ i ] = this.replaceProperties( prop )
          }else{
            out[ i ] = prop
          }
        }
      }

      return out
    }else{
      const properties = obj
      for( let key in properties) {
        let prop = properties[ key ]
        if( typeof prop === 'object' && prop !== null && prop.id !== undefined ) {
          let objCheck = this.ugens.get( prop.id )
          if( objCheck !== undefined ) {
            properties[ key ] = objCheck
          } 
        }else if( Array.isArray( prop ) ) {
          properties[ key ] = this.replaceProperties( prop )
        }else{
          if( typeof prop === 'object' && prop !== null && prop.action === 'wrap' ) {
            properties[ key ] = prop.value()
          }
        }
      } 
      return properties
    }
    return obj
  }

  // playback delayed messages and clear the queue
  playQueue() {
    // must set delay property to false!!! otherwise the message
    // will be delayed continually...
    this.queue.forEach( m => { m.data.delay = false; this.handleMessage( m ) } )
    this.queue.length = 0
  }

  handleMessage( event ) {
    if( event.data.delay === true ) {
      // we want to delay this message for some time in the future,
      // for example, when forcing code to execute at the start of the next
      // measure. playQueue will trigger all messages in the queue
      this.queue.push( event )

      return
    }

    if( event.data.address === 'add' ) {
      const rep = event.data
      let constructor = Gibberish

      let properties = this.replaceProperties(  eval( '(' + rep.properties + ')' ) )
      //console.log( 'properties:', properties )

      let ugen

      // if object is not a gibberish ugen...
      if( properties.nogibberish ) {
        ugen = properties
      }else{
        for( let i = 0; i < rep.name.length; i++ ) { constructor = constructor[ rep.name[ i ] ] }

        properties.id = rep.id
        
        ugen = properties.isop === true || properties.isPattern === true ? constructor( ...properties.inputs ) :  constructor( properties )

        if( properties.isPattern ) {
          for( let key in properties ) {
            if( key !== 'input' && key !== 'isPattern' ) {
              ugen[ key ] = properties[ key ]
            }
          }
        }
      }
      
      if( rep.post ) {
        ugen[ rep.post ]()
      }

      //console.log( 'adding ugen:', ugen.id, ugen, rep )
      this.ugens.set( rep.id, ugen )

      ugen.id = rep.id
      initialized = true

    }else if( event.data.address === 'method' ) {
      //if( event.data.name === 'clear' )
        //console.log( event.data.address, event.data.name, event.data.args, this.ugens )

      const dict = event.data
      const obj  = this.ugens.get( dict.object )

      if( obj === undefined || typeof obj[ dict.name ] !== 'function' ) return
      // for edge case when serialized functions are being passed to method calls
      if( dict.functions === true ) {
        obj[ dict.name ]( eval( '(' + dict.args + ')' ) ) 
      }else{
        obj[ dict.name ]( ...dict.args.map( Gibberish.proxyReplace ) ) 
      }
    }else if( event.data.address === 'property' ) {
      // XXX this is the exact same as the 'set' key... ugh.
      const dict = event.data
      const obj  = this.ugens.get( dict.object )
      let value = dict.value
      if( typeof dict.value === 'object' && dict.value !== null && dict.value.id !== undefined ) {
        value = this.ugens.get( dict.value.id )
      }
      obj[ dict.name ] = value

    }else if( event.data.address === 'print' ) {
      const dict = event.data
      const obj  = this.ugens.get( dict.object ) 
      console.log( 'printing:', dict.object, obj )
    }else if( event.data.address === 'printProperty' ) {
      const dict = event.data
      const obj  = this.ugens.get( dict.object )
      console.log( 'printing:', obj[ dict.name ] )    
    }else if( event.data.address === 'set' ) {
      const dict = event.data
      const obj = this.ugens.get( dict.object )
      let value = dict.value
      if( typeof dict.value === 'object' && dict.value !== null && dict.value.id !== undefined ) {
        value = this.ugens.get( dict.value.id )
      }
      obj[ dict.name ] = value
    }else if( event.data.address === 'copy' ) {
      const target = this.ugens.get( event.data.id )

      if( target === undefined ) {
        // this should only occur when a buffer is loaded prior to a delayed instantiation. for example,
        // if gibber starts downloading a file, on beat two and is finished by beat three, the next measure
        // will not have occurred yet, meaning a delayed sampler instantiation will not yet have occurred.
        // in this case, we wait until the next measure boundary.
        this.queue.push( event )
      }else{
        target.data.onload( event.data.buffer )
      }
    }else if( event.data.address === 'callback' ) {
      console.log( Gibberish.callback.toString() )
    }else if( event.data.address === 'addConstructor' ) {
      const wrapper = eval( '(' + event.data.constructorString + ')' )
      Gibberish[ event.data.name ] = wrapper( Gibberish, Gibberish.genish )
    }else if( event.data.address === 'addMethod' ) {
      const target = this.ugens.get( event.data.id )

      if( target[ event.data.key ] === undefined ) {
        target[ event.data.key ] = eval( '(' + event.data.function + ')' )
        //console.log( 'adding method:', target, event.data.key )
      }
    }else if( event.data.address === 'monkeyPatch' ) {
      const target = this.ugens.get( event.data.id )
      if( target['___'+event.data.key] === undefined ) {
        target[ '___' + event.data.key ] = target[ event.data.key ]
        target[ event.data.key ] = eval( '(' + event.data.function + ')' )
        //console.log( 'monkey patch:', target, event.data.key )
      }
    }else if( event.data.address === 'dirty' ) {
      const obj = this.ugens.get( event.data.id )
      Gibberish.dirty( obj )
    }else if( event.data.address === 'initialize' ) {
      initialized = true
    }else if( event.data.address === 'addToProperty' ) {
      const dict = event.data
      const obj  = this.ugens.get( dict.object )
      obj[ dict.name ][ dict.key ] = dict.value
    }else if( event.data.address === 'addObjectToProperty' ) {
      const dict = event.data
      const obj  = this.ugens.get( dict.object )
      obj[ dict.name ][ dict.key ] = this.ugens.get( dict.value )
    }else if( event.data.address === 'messages' ) {
      console.log( 'messages:', this.messages )
    }else if( event.data.address === 'eval' ) {
      eval( event.data.code )
    }
  }

  process(inputs, outputs, parameters) {
    if( initialized === true ) {
      const gibberish = Gibberish
      const scheduler = gibberish.scheduler
      let   callback  = this.callback
      let   ugens     = gibberish.callbackUgens 

      this.messages.length = 0
      // XXX is there some way to optimize this out?
      if( callback === undefined && gibberish.graphIsDirty === false ) return true

      let callbacklength = gibberish.blockCallbacks.length

      if( callbacklength !== 0 ) {
        for( let i=0; i< callbacklength; i++ ) {
          gibberish.blockCallbacks[ i ]()
        }

        // can't just set length to 0 as callbacks might be added during for loop,
        // so splice pre-existing functions
        gibberish.blockCallbacks.splice( 0, callbacklength )
      }

      const output = outputs[ 0 ]
      const len = outputs[0][0].length
      for (let i = 0; i < len; ++i) {
        scheduler.tick()

        if( gibberish.graphIsDirty ) {
          const oldCallback = callback
          const oldUgens = ugens.slice(0)
          const oldNames = gibberish.callbackNames.slice(0)

          let cb
          try{
            cb = gibberish.generateCallback()
          } catch(e) {
            console.log( 'callback error:', e )

            cb = oldCallback
            gibberish.callbackUgens = oldUgens
            gibberish.callbackNames = oldNames
            gibberish.dirtyUgens.length = 0
            gibberish.graphIsDirty = false
          } finally {
            ugens = gibberish.callbackUgens
            this.callback = callback = cb
            this.port.postMessage({ address:'callback', code:cb.toString() }) 
          } 
        }
        const out = callback.apply( null, ugens )

        output[0][ i ] = out[0]
        output[1][ i ] = out[1] 
      }
      if( ugens.length > 1 ) {
        for( let i = 1; i < ugens.length - 1; i++ ) {
          const ugen = ugens[ i ]
          if( ugen.out !== undefined ) {
            this.messages.push( ugen.id, 'output', ugen.out[ 0 ] )
          }
        }
      }     
      if( this.messages.length > 0 ) {
        this.port.postMessage({ 
          address:'state', 
          messages:this.messages 
        })
      }
    }
   
    // make sure this is always returned or the callback ceases!!!
    return true
  }
}
global.Gibberish.workletProcessor = GibberishProcessor 
           registerProcessor( 'gibberish', global.Gibberish.workletProcessor );
