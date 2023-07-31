import { ArrayStruct } from './array-struct'
import { RecordStruct } from './record-struct'

import { describe, test, expect } from '@jest/globals'

import {
    equals,
    PublicStructural,
    Stateful,
    StructState,
    Structural
} from '../traits'

//// Setup ////

const data = [1, 2, 3, 4, 5]

const array = new ArrayStruct(...data)

//// Tests ////

test('public structural methods', () => {
    expect(PublicStructural.is(array)).toBe(true)
})

test('get State', () => {
    const state = Stateful.get(array)

    expect(state).toEqual({
        0: 1,
        1: 2,
        2: 3,
        3: 4,
        4: 5
    })

    expect(state).toEqual({ ...array })

    expect(array.get()).toEqual(state)
})

test('create', () => {
    const array2 = Structural.create(array, [5, 4, 3, 2, 1, 0])

    expect(Structural.get(array2)).toEqual({
        '0': 5,
        '1': 4,
        '2': 3,
        '3': 2,
        '4': 1,
        '5': 0
    })

    expect(array.create([5, 4, 3, 2, 1, 0])).toEqual(array2)
})

test('deep create', () => {
    const array2 = Structural.create(array, 0, 100)

    expect(Structural.get(array2)).toEqual({
        0: 100,
        1: 2,
        2: 3,
        3: 4,
        4: 5
    })

    expect(array2.create(0, 100)).toEqual(array2)
})

test('deep nested create', () => {
    const array = new ArrayStruct(
        new RecordStruct({
            foo: 0,
            bar: 'yes'
        }),

        new RecordStruct({
            foo: 'bar',
            bar: 10
        })
    )

    const array2 = Structural.create(array, 0, 'bar', 100)

    expect(Structural.get(array2)).toEqual({
        0: {
            bar: 100,
            foo: 0
        },
        1: {
            bar: 10,
            foo: 'bar'
        }
    })

    expect(array.create(0, 'bar', 100)).toEqual(array2)
})

test('copy', () => {
    expect(array.copy()).toEqual(array)
})

test('equals', () => {
    expect(array.copy().equals(array)).toBe(true)
})

test('iterable', () => {
    expect([...array]).toEqual(data)
})

describe('array interface', () => {
    test('length', () => {
        expect(array.length).toBe(data.length)
    })

    test('at', () => {
        expect(array.at(0)).toEqual(data.at(0))
        expect(array.at(-1)).toEqual(data.at(-1))
        expect(array.at(data.length)).toEqual(data.at(data.length))
    })

    test('push', () => {
        const arrayPlus1 = array.push(6)
        expect(Stateful.get(arrayPlus1)).toEqual({
            0: 1,
            1: 2,
            2: 3,
            3: 4,
            4: 5,
            5: 6
        })

        expect(arrayPlus1).not.toBe(array)
        expect(arrayPlus1).toHaveLength(6)
    })

    test('pop', () => {
        const arrayMinus1 = array.pop()
        expect(Stateful.get(arrayMinus1)).toEqual({
            0: 1,
            1: 2,
            2: 3,
            3: 4
        })

        expect(arrayMinus1).not.toBe(array)
        expect(arrayMinus1).toHaveLength(4)
    })

    test('shift', () => {
        const arrayMinus1 = array.shift()
        expect(Stateful.get(arrayMinus1)).toEqual({
            0: 2,
            1: 3,
            2: 4,
            3: 5
        })

        expect(arrayMinus1).not.toBe(array)
        expect(arrayMinus1).toHaveLength(4)
    })

    test('sort', () => {
        const arraySorted = array.shift().push(array[0]).sort()

        expect(equals(array, arraySorted)).toBe(true)
        expect(array).not.toBe(arraySorted)
    })

    test('reverse', () => {
        const arrayReversed = array.reverse()
        expect(Stateful.get(arrayReversed)).toEqual({
            0: 5,
            1: 4,
            2: 3,
            3: 2,
            4: 1
        })
        expect(array).not.toBe(arrayReversed)
    })

    test('splice', () => {
        const arraySpliced = array.splice(1, 1)
        expect(Stateful.get(arraySpliced)).toEqual({
            0: 1,
            1: 3,
            2: 4,
            3: 5
        })
        expect(array).not.toBe(arraySpliced)
    })

    test('slice', () => {
        const arraySliced = array.slice(1, 3)
        expect(Stateful.get(arraySliced)).toEqual({
            0: 2,
            1: 3
        })
        expect(array).not.toBe(arraySliced)
    })

    test('map', () => {
        const arrayMapped = array.map(i => i * 2)
        expect(Stateful.get(arrayMapped)).toEqual({
            0: 2,
            1: 4,
            2: 6,
            3: 8,
            4: 10
        })
        expect(array).not.toBe(arrayMapped)
    })

    test('filter', () => {
        const arrayFiltered = array.filter(i => i < 2)
        expect(Stateful.get(arrayFiltered)).toEqual({ 0: 1 })
        expect(array).not.toBe(arrayFiltered)
    })
})
