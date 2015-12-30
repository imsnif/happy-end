import { EventEmitter } from 'events'
import stream from 'stream'

function finished (resolve, reject) {
  let streamCount   = 0
  let activeStreams = 0
  this.on("added", () => {
    streamCount += 1
    activeStreams += 1
  })
  this.on("done", () => {
    activeStreams -= 1
    if (activeStreams < 0) reject("Multiple end/flush events on one or more streams.")
    if (activeStreams === 0) {
      resolve(streamCount)
    }
  })
}

function catchEnding(streamObj) {
  let event = ""
  if (streamObj instanceof stream.Readable) event = "end"
  if (streamObj instanceof stream.Writable) event = "finish"
  streamObj.on(event, this.emit.bind(this, "done"))
}

export default class TransformGroup extends EventEmitter {
  constructor() {
    super()
    this._finished = new Promise(finished.bind(this))
  }
  add(streams) {
    streams.forEach((streamObj) => {
      this.emit("added")
      catchEnding.call(this, streamObj)
    })
    return this._finished
  }
}
