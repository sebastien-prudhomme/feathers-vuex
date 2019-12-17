/*
eslint
@typescript-eslint/explicit-function-return-type: 0,
@typescript-eslint/no-explicit-any: 0,
@typescript-eslint/no-empty-function: 0
*/
import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'
Vue.use(VueCompositionApi)

import jsdom from 'jsdom-global'
import { assert } from 'chai'
import feathersVuex, { FeathersVuex } from '../../src/index'
import { feathersRestClient as feathersClient } from '../fixtures/feathers-client'
import useFind from '../../src/useFind'
import Vuex from 'vuex'
// import { shallowMount } from '@vue/test-utils'
import { computed, isRef } from '@vue/composition-api'
jsdom()
require('events').EventEmitter.prototype._maxListeners = 100

Vue.use(Vuex)
Vue.use(FeathersVuex)

function makeContext() {
  const { makeServicePlugin, BaseModel } = feathersVuex(feathersClient, {
    serverAlias: 'useFind'
  })

  class Instrument extends BaseModel {
    public static modelName = 'Instrument'
  }

  const serviceName = 'instruments'
  const store = new Vuex.Store({
    plugins: [
      makeServicePlugin({
        Model: Instrument,
        service: feathersClient.service(serviceName)
      })
    ]
  })
  return { store, Instrument, BaseModel, makeServicePlugin }
}

describe('use/find', function() {
  it('returns correct default data', function() {
    const { Instrument } = makeContext()

    const instrumentParams = computed(() => {
      return {
        query: {},
        paginate: false
      }
    })
    const instrumentsData = useFind({
      model: Instrument,
      params: instrumentParams
    })

    const {
      debounceTime,
      error,
      haveBeenRequestedOnce,
      haveLoadedOnce,
      isFindPending,
      isLocal,
      items,
      latestQuery,
      paginationData,
      qid
    } = instrumentsData

    assert(isRef(debounceTime))
    assert(debounceTime.value === null)

    assert(isRef(error))
    assert(error.value === null)

    assert(isRef(haveBeenRequestedOnce))
    assert(haveBeenRequestedOnce.value === true)

    assert(isRef(haveLoadedOnce))
    assert(haveLoadedOnce.value === false)

    assert(isRef(isFindPending))
    assert(isFindPending.value === true)

    assert(isRef(isLocal))
    assert(isLocal.value === false)

    assert(isRef(items))
    assert(Array.isArray(items.value))
    assert(items.value.length === 0)

    assert(isRef(latestQuery))
    assert(latestQuery.value === null)

    assert(isRef(paginationData))
    assert.deepStrictEqual(paginationData.value, {
      defaultLimit: null,
      defaultSkip: null
    })

    assert(isRef(qid))
    assert(qid.value === 'default')
  })

  it('allows passing {lazy:true} to not query immediately', function() {
    const { Instrument } = makeContext()

    const instrumentParams = computed(() => {
      return {
        query: {},
        paginate: false
      }
    })
    const instrumentsData = useFind({
      model: Instrument,
      params: instrumentParams,
      lazy: true
    })
    const { haveBeenRequestedOnce } = instrumentsData

    assert(isRef(haveBeenRequestedOnce))
    assert(haveBeenRequestedOnce.value === false)
  })

  it('params can return null to prevent the query', function() {
    const { Instrument } = makeContext()

    const instrumentParams = computed(() => {
      return null
    })
    const instrumentsData = useFind({
      model: Instrument,
      params: instrumentParams,
      lazy: true
    })
    const { haveBeenRequestedOnce } = instrumentsData

    assert(isRef(haveBeenRequestedOnce))
    assert(haveBeenRequestedOnce.value === false)
  })

  it('allows using `local: true` to prevent API calls from being made', function() {
    const { Instrument } = makeContext()

    const instrumentParams = computed(() => {
      return {
        query: {}
      }
    })
    const instrumentsData = useFind({
      model: Instrument,
      params: instrumentParams,
      local: true
    })
    const { haveBeenRequestedOnce, find } = instrumentsData

    assert(isRef(haveBeenRequestedOnce))
    assert(haveBeenRequestedOnce.value === false, 'no request during init')

    find()

    assert(haveBeenRequestedOnce.value === false, 'no request after find')
  })
})
