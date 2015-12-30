'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _stream = require('stream');

var _stream2 = _interopRequireDefault(_stream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function finished(resolve, reject) {
  var streamCount = 0;
  var activeStreams = 0;
  this.on("added", function () {
    streamCount += 1;
    activeStreams += 1;
  });
  this.on("done", function () {
    activeStreams -= 1;
    if (activeStreams < 0) reject("Multiple end/flush events on one or more streams.");
    if (activeStreams === 0) resolve(streamCount);
  });
  this.on("error", function (error) {
    reject(error);
  });
}

function catchEnding(streamObj) {
  var event = "";
  if (typeof streamObj._events.end !== "undefined") {
    event = "end";
  } else if (typeof streamObj._events.finish !== "undefined") {
    event = "finish";
  } else {
    throw new Error("Unidentified stream type");
  }
  streamObj.on(event, this.emit.bind(this, "done"));
}

var TransformGroup = (function (_EventEmitter) {
  _inherits(TransformGroup, _EventEmitter);

  function TransformGroup() {
    _classCallCheck(this, TransformGroup);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TransformGroup).call(this));

    _this._finished = new Promise(finished.bind(_this));
    return _this;
  }

  _createClass(TransformGroup, [{
    key: 'add',
    value: function add(streams) {
      var _this2 = this;

      if (Array.isArray(streams)) {
        streams.forEach(function (streamObj) {
          _this2.emit("added");
          catchEnding.call(_this2, streamObj);
          streamObj.on("error", _this2.emit.bind(_this2, "error"));
        });
      } else {
        this.emit("added");
        catchEnding.call(this, streams);
        streams.on("error", this.emit.bind(this, "error"));
      }
      return this._finished;
    }
  }]);

  return TransformGroup;
})(_events.EventEmitter);

exports.default = TransformGroup;