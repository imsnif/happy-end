import TransformGroup from '../index.js';

import fs from 'fs';
import test from 'tape';

test('read stream group', function (t) {
  t.plan(1)
  let tgroup = new TransformGroup()
  let finished = tgroup.add([ 
    fs.createReadStream('./lib/sample.txt'),
    fs.createReadStream('./lib/sample2.txt')
  ])
  finished.then((number) => {
    t.equal(2, number)
  }).catch((reason) => {
    t.fail(reason)
  })
})

test('write stream group', function (t) {
  t.end()
})

test('transform stream group', function (t) {
})

test('mixed group', function (t) {
})

test('multiple adds and promises', function (t) {
})
