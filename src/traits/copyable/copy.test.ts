import { copy } from './copy'

import Copyable from './copyable'

import { describe, it, expect } from '@jest/globals'

/* eslint-disable @typescript-eslint/no-explicit-any */ 

it('is a function', () => {  
    expect(typeof copy).toEqual('function')
})

describe('copies primitives', () => {  

    const primitives = [ 
        null, undefined, 1, -1, 0, Infinity,
        -Infinity, true, false, 'some-string-value', ''
    ]

    for (const value of primitives) {
        it(`works on ${value === '' ? '""' : value}`, () =>
            expect(copy(value)).toEqual(value)
        )
    }

    it('works on NaN', () => {
        expect(Number.isNaN(copy(NaN))).toEqual(true)
    })

    it('works on RegExp', () => {
        const regexp = /\d/
        expect(copy(regexp)).toEqual(regexp)
    })

    it('ignores Symbols', () => {
        const symbol = Symbol('new symbol')
        expect(copy(symbol)).toBe(symbol)
    })

    it('works on Dates', () => {
        const date1 = new Date()
        const date2 = copy(date1)
        expect(date2.getTime()).toEqual(date1.getTime())
        expect(date2).not.toBe(date1)
    })

    it('looks for copy methods on functions before returning them mutably', () => {
        const one = (() => 'one') as any
        one[Copyable.copy] = () => 1

        expect(copy(one)).toEqual(1)
    })
})

describe('copies generic objects', () => {

    it('works on plain objects', () => {
        const obj = { key: 'value' }
        const obj2 = copy(obj)

        expect(obj2).toEqual(obj)
        expect(obj2).not.toBe(obj)
    })

    it('is recursive', () => {

        const obj = {
            foo: {
                bar: true
            }
        }

        const obj2 = copy(obj)

        expect(obj2.foo).not.toBe(obj.foo)
        expect(obj).toEqual(obj2)
    })

    it('allows duplicate references', () => {

        const passenger = { passenger: true }
        const bus = {
            type: 'bus',
            p1: passenger,
            p2: passenger,
            p3: passenger
        }

        const bus2 = copy(bus)

        expect(bus2).toEqual(bus)
    })

    it('handles duplicate references in arrays', () => {
        const array: any[] = []
        array.push(array)

        expect(() => copy(array)).not.toThrow()
    }) 

    it('array sub-object undefined value bug', () => {

        const array = [{
            delay: undefined,
            brand: 'cool'
        }]

        const array2 = copy(array)
        expect(array2).toEqual(array)
        expect(array2).not.toBe(array)
    })

})

describe('copies iterables', () => {

    it('arrays', () => {
        const arr = [1, 2, 3, 4, 5]
        const arr2 = copy(arr)

        expect(arr2).toEqual(arr)
        expect(arr2).not.toBe(arr)
    })

    it('arrays with one length', () => {
        const arrOfZero = [5]
        expect(copy(arrOfZero))
            .toEqual([5])
    })

    it('arrays recursively', () => {

        const arr = [{ foo: false }, 1, 2, 3, 4]
        const arr2 = copy(arr)

        expect(arr2[0]).toEqual(arr[0])
        expect(arr2[0]).not.toBe(arr[0])

    }) 

    describe('typed arrays', () => {
        for (const TypedArray of [
            Int8Array,
            Uint8Array,
            Uint8ClampedArray,
            Int16Array,
            Uint16Array,
            Int32Array,
            Uint32Array,
            Float32Array,
            Float64Array
        ]) {
            it(`works on ${TypedArray.name}`, () => {
                const opt = new TypedArray([1, 2, 4, 8, 16])
                const opt2 = copy(opt)
                expect(opt2).toEqual(opt)
                expect(opt2).not.toBe(opt)
                expect(opt2).toBeInstanceOf(TypedArray)
            })
        }

    })

    it('buffers', () => {
        const buffer = Buffer.from([0, 1, 2, 3, 4, 5])
        const buffer2 = copy(buffer) 
        expect(buffer2).toEqual(buffer)
        expect(buffer2).toBeInstanceOf(Buffer)
        expect(buffer2).not.toBe(buffer)
    })

    it('sets', () => { 

        const set = new Set([1, 2, 3, 4, 5])
        const set2 = copy(set)

        expect(set2).toBeInstanceOf(Set)
        expect(set2).toEqual(set)

    })

    it('sets recursively', () => {

        const set = new Set([{ foo: false }, 2, 3, 4, 5])
        const set2 = copy(set)

        expect(set2).toBeInstanceOf(Set)
        expect(set2).toEqual(set)
        expect([...set2][0]).not.toBe([...set][0])

    })

    it('maps', () => {

        const map = new Map([['one', 1], ['two', 2]])
        const map2 = copy(map)

        expect(map2).toBeInstanceOf(Map)
        expect(map2).toEqual(map)

    })

    it('maps recursively', () => {

        const map = new Map<any, any>([['one', { foo: false }], ['two', 2]])
        const map2 = copy(map)

        expect(map2).toBeInstanceOf(Map)
        expect(map2).toEqual(map)
        expect(map2.get('one')).not.toBe(map.get('one'))

    })

    it('weak collections return themselves', () => {
        // due to the nature of weak collections, we cannot get a list of objects
        // inside of them, so they just return themselves

        const map = new WeakMap()
        const map2 = copy(map)
        expect(map2).toBe(map)

        const set = new WeakSet()
        const set2 = copy(set)
        expect(set2).toBe(set)
    })

})

describe('handles non-standard classes with no copy implementation', () => {

    it('I mean, within reason', () => {
        class Foo {
            constructor(readonly bar: string) {}
        }

        const foo1 = new Foo('hey')
        const foo2 = copy(foo1)

        expect(foo2).toBeInstanceOf(Foo)
        expect(foo2.bar).toEqual(foo1.bar)

    })

})

describe('handles objects created outside the prototype chain', () => {
    it('Object.create(null)', () => {
        const hash = Object.create(null)
        hash.one = 1

        expect(copy(hash)).not.toBe(hash)
        expect(copy(hash)).toEqual(hash)
    })
})
