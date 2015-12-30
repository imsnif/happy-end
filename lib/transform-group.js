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
    if (activeStreams === 0) resolve(streamCount)
  })
  this.on("error", (error) => {
    reject(error)
  })
}

function catchEnding(streamObj) {
  let event = ""
  if (typeof streamObj._events.end !== "undefined") {
    event = "end"
  } else if (typeof streamObj._events.finish !== "undefined") {
    event = "finish"
  } else {
    throw new Error("Unidentified stream type")
  }
  streamObj.on(event, this.emit.bind(this, "done"))
}

export default class TransformGroup extends EventEmitter {
  constructor() {
    super()
    this._finished = new Promise(finished.bind(this))
  }
  add(streams) {
    if (Array.isArray(streams)) {
      streams.forEach((streamObj) => {
        this.emit("added")
        catchEnding.call(this, streamObj)
        streamObj.on("error", this.emit.bind(this, "error"))
      })
    } else {
      this.emit("added")
      catchEnding.call(this, streams)
      streams.on("error", this.emit.bind(this, "error"))
    }
    return this._finished
  }
}
