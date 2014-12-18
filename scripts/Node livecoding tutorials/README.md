These tutorials have been adapted from the [Gibber][] tutorials. As such, tutorial numbers 7 ("Audio Input, Sampling, and Looping"), and 8 ("Freesound") will *not* work under Node.js - the Node/web-audio/speaker combination doesn't have access to local client audio input hardware (`Input` and `Sampler` modules), nor does it have the ability to access remote URIs as required by `Drums`[^1] and `Freesound`.

[Gibber]: http://gibber.mat.ucsb.edu
[^1]: The examples have all been updated to use the synthesized `EDrums` instead.
