import TransformGroup from '../index.js';

import fs             from 'fs'
import test           from 'tape'
import DevNullStream  from 'dev-null-stream'
import through        from 'through2'

test('read stream group', function (t) {
  t.plan(1)
  let tgroup = new TransformGroup()
  let streams = [
    fs.createReadStream(`${__dirname}/lib/sample1.txt`),
    fs.createReadStream(`${__dirname}/lib/sample2.txt`),
  ]
  streams.forEach((stream) => {
    stream.pipe(new DevNullStream())
  })
  let finished = tgroup.add(streams)
  finished.then((number) => {
    t.equal(2, number)
  }).catch((reason) => {
    t.fail(reason)
  })
})

test('write stream group', function (t) {
  t.plan(1)
  let tgroup = new TransformGroup()
  let streams = [
    fs.createWriteStream(`${__dirname}/lib/temp1`),
    fs.createWriteStream(`${__dirname}/lib/temp1`)
  ]
  streams.forEach((stream) => {
    fs.createReadStream(`${__dirname}/lib/sample1.txt`).pipe(stream)
  })
  let finished = tgroup.add(streams)
  finished.then((number) => {
    fs.unlink(`${__dirname}/lib/temp1`, (err) => {
      if (err) t.fail(err)
      t.equal(2, number)
    })
  }).catch((reason) => {
    fs.unlink(`${__dirname}/lib/temp1`, (err) => {
      if (err) t.fail(err)
      t.fail(reason)
    })
  })
})

test('transform stream group', function (t) {
  t.plan(1)
  function push (buf, enc, cb) {
    this.push(buf)
    cb()
  }
  let tgroup = new TransformGroup()
  let streams = [
    through(push),
    through(push)
  ]
  streams.forEach((stream) => {
    fs.createReadStream(`${__dirname}/lib/sample1.txt`)
      .pipe(stream)
      .pipe(fs.createWriteStream(`${__dirname}/lib/temp`))
  })
  let finished = tgroup.add(streams)
  finished.then((number) => {
    fs.unlink(`${__dirname}/lib/temp`, (err) => {
      if (err) t.fail(err)
      t.equal(2, number)
    })
  }).catch((reason) => {
    fs.unlink(`${__dirname}/lib/temp`, (err) => {
      if (err) t.fail(err)
      t.fail(reason)
    })
  })
})

test('mixed group', function (t) {
  t.plan(1)
  let read = fs.createReadStream(`${__dirname}/lib/sample1.txt`)
  let transform = through(function push (buf, enc, cb) {
    this.push(buf)
    cb()
  })
  let write = fs.createWriteStream(`${__dirname}/lib/temp`)
  let tgroup = new TransformGroup()
  read.pipe(transform).pipe(write)
  let finished = tgroup.add([read, transform, write])
  finished.then((number) => {
    fs.unlink(`${__dirname}/lib/temp`, (err) => {
      if (err) t.fail(err)
      t.equal(3, number)
    })
  }).catch((reason) => {
    fs.unlink(`${__dirname}/lib/temp`, (err) => {
      if (err) t.fail(err)
      t.fail(reason)
    })
  })
})

test('error', function (t) {
  t.plan(1)
  function push (buf, enc, cb) {
    cb("I have erred!")
  }
  let tgroup = new TransformGroup()
  let streams = [
    through(push),
    through(push)
  ]
  streams.forEach((stream) => {
    fs.createReadStream(`${__dirname}/lib/sample1.txt`)
      .pipe(stream)
      .pipe(fs.createWriteStream(`${__dirname}/lib/temp`))
  })
  let finished = tgroup.add(streams)
  finished.then((number) => {
    fs.unlink(`${__dirname}/lib/temp`, (err) => {
      t.fail("Did not receive error")
    })
  }).catch((reason) => {
    fs.unlink(`${__dirname}/lib/temp`, (err) => {
      t.equal(reason, "I have erred!")
    })
  })
})

test('multiple adds and promises', function (t) {
  t.plan(3)
  function resolved (number) {
    t.equal(number, 3)
  }
  function rejected (reason) {
    t.fail(reason)
  }
  function push (buf, enc, cb) {
    this.push(buf)
    cb()
  }

  let tgroup   = new TransformGroup()
  let stream1  = fs.createReadStream(`${__dirname}/lib/sample1.txt`)
  let promise1 = tgroup.add(stream1)
  let stream2  = through(push)
  let promise2 = tgroup.add(stream2)
  let stream3  = fs.createWriteStream(`${__dirname}/lib/temp`)
  let promise3 = tgroup.add(stream3)

  stream1.pipe(stream2).pipe(stream3);
  [ promise1, promise2, promise3].forEach((promise) => {
    promise.then(resolved).catch(rejected)
  })
})
