'use strict'

const t = require('tap')
const test = t.test
const FindMyWay = require('../')

test('the router is an object with methods', t => {
  t.plan(3)

  const findMyWay = FindMyWay()

  t.is(typeof findMyWay.on, 'function')
  t.is(typeof findMyWay.lookup, 'function')
  t.is(typeof findMyWay.find, 'function')
})

test('register a route', t => {
  t.plan(1)
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test', () => {
    t.ok('inside the handler')
  })

  findMyWay.lookup({ method: 'GET', url: '/test' }, null)
})

test('default route', t => {
  t.plan(1)

  const findMyWay = FindMyWay({
    defaultRoute: () => {
      t.ok('inside the default route')
    }
  })

  findMyWay.lookup({ method: 'GET', url: '/test' }, null)
})

test('async handler', t => {
  t.plan(1)

  const findMyWay = FindMyWay({
    async: true
  })

  findMyWay.on('GET', '/test', (req, res, params) => {
    t.ok('inside async handler')
  })

  findMyWay.lookup({ method: 'GET', url: '/test' }, null)
})

test('parametric route', t => {
  t.plan(1)
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test/:id', (req, res, params) => {
    t.is(params.id, 'hello')
  })

  findMyWay.lookup({ method: 'GET', url: '/test/hello' }, null)
})

test('multiple parametric route', t => {
  t.plan(2)
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test/:id', (req, res, params) => {
    t.is(params.id, 'hello')
  })

  findMyWay.on('GET', '/other-test/:id', (req, res, params) => {
    t.is(params.id, 'world')
  })

  findMyWay.lookup({ method: 'GET', url: '/test/hello' }, null)
  findMyWay.lookup({ method: 'GET', url: '/other-test/world' }, null)
})

test('multiple parametric route with the same prefix', t => {
  t.plan(2)
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test/:id', (req, res, params) => {
    t.is(params.id, 'hello')
  })

  findMyWay.on('GET', '/test/:id/world', (req, res, params) => {
    t.is(params.id, 'world')
  })

  findMyWay.lookup({ method: 'GET', url: '/test/hello' }, null)
  findMyWay.lookup({ method: 'GET', url: '/test/world/world' }, null)
})

test('nested parametric route', t => {
  t.plan(2)
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test/:hello/test/:world', (req, res, params) => {
    t.is(params.hello, 'hello')
    t.is(params.world, 'world')
  })

  findMyWay.lookup({ method: 'GET', url: '/test/hello/test/world' }, null)
})

test('nested parametric route with same prefix', t => {
  t.plan(3)
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test', (req, res, params) => {
    t.ok('inside route')
  })

  findMyWay.on('GET', '/test/:hello/test/:world', (req, res, params) => {
    t.is(params.hello, 'hello')
    t.is(params.world, 'world')
  })

  findMyWay.lookup({ method: 'GET', url: '/test' }, null)
  findMyWay.lookup({ method: 'GET', url: '/test/hello/test/world' }, null)
})

test('long route', t => {
  t.plan(1)
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/abc/def/ghi/lmn/opq/rst/uvz', (req, res, params) => {
    t.ok('inside long path')
  })

  findMyWay.lookup({ method: 'GET', url: '/abc/def/ghi/lmn/opq/rst/uvz' }, null)
})

test('long parametric route', t => {
  t.plan(3)
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/abc/:def/ghi/:lmn/opq/:rst/uvz', (req, res, params) => {
    t.is(params.def, 'def')
    t.is(params.lmn, 'lmn')
    t.is(params.rst, 'rst')
  })

  findMyWay.lookup({ method: 'GET', url: '/abc/def/ghi/lmn/opq/rst/uvz' }, null)
})

test('long parametric route with common prefix', t => {
  t.plan(9)
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/', (req, res, params) => {
    throw new Error('I shoul not be here')
  })

  findMyWay.on('GET', '/abc', (req, res, params) => {
    throw new Error('I shoul not be here')
  })

  findMyWay.on('GET', '/abc/:def', (req, res, params) => {
    t.is(params.def, 'def')
  })

  findMyWay.on('GET', '/abc/:def/ghi/:lmn', (req, res, params) => {
    t.is(params.def, 'def')
    t.is(params.lmn, 'lmn')
  })

  findMyWay.on('GET', '/abc/:def/ghi/:lmn/opq/:rst', (req, res, params) => {
    t.is(params.def, 'def')
    t.is(params.lmn, 'lmn')
    t.is(params.rst, 'rst')
  })

  findMyWay.on('GET', '/abc/:def/ghi/:lmn/opq/:rst/uvz', (req, res, params) => {
    t.is(params.def, 'def')
    t.is(params.lmn, 'lmn')
    t.is(params.rst, 'rst')
  })

  findMyWay.lookup({ method: 'GET', url: '/abc/def' }, null)
  findMyWay.lookup({ method: 'GET', url: '/abc/def/ghi/lmn' }, null)
  findMyWay.lookup({ method: 'GET', url: '/abc/def/ghi/lmn/opq/rst' }, null)
  findMyWay.lookup({ method: 'GET', url: '/abc/def/ghi/lmn/opq/rst/uvz' }, null)
})

test('wildcard', t => {
  t.plan(1)
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test/*', (req, res, params) => {
    t.is(params['*'], 'hello')
  })

  findMyWay.lookup({ method: 'GET', url: '/test/hello' }, null)
})

test('find should return the route', t => {
  t.plan(1)
  const findMyWay = FindMyWay()
  const fn = () => {}

  findMyWay.on('GET', '/test', fn)

  t.deepEqual(findMyWay.find('GET', '/test'), { handler: fn, params: {}, store: null })
})

test('find should return the route with params', t => {
  t.plan(1)
  const findMyWay = FindMyWay()
  const fn = () => {}

  findMyWay.on('GET', '/test/:id', fn)

  t.deepEqual(findMyWay.find('GET', '/test/hello'), { handler: fn, params: { id: 'hello' }, store: null })
})

test('find should return a null handler if the route does not exist', t => {
  t.plan(1)
  const findMyWay = FindMyWay()

  // t.deepEqual(findMyWay.find('GET', '/test'), { handler: null, params: [], store: null })
  t.deepEqual(findMyWay.find('GET', '/test'), null)
})
