import TransformGroup from '../index.js';

import fs             from 'fs'
import test           from 'tape'
import DevNullStream  from 'dev-null-stream'

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
  let tgroup = new TransformGroup()
  let streams = [
    fs.createWriteStream(`${__dirname}/lib/temp1`),
    fs.createWriteStream(`${__dirname}/lib/temp3`)
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
})

test('mixed group', function (t) {
})

test('not all streams end', function (t) {
})

test('multiple adds and promises', function (t) {
})
