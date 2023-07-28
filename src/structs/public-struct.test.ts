import { PublicStruct } from './public-struct'

import { test, expect } from '@jest/globals'

import { Structural } from '../traits'
 
//// Tests ////

const vector = new class Vector extends PublicStruct {
    readonly x: number = 0
    readonly y: number = 0
}

const edge = new class Edge extends PublicStruct {
    readonly a = vector
    readonly b = vector 
}

test('get', () => {
    const vstate = Structural.get(vector)
    expect(vstate).toEqual(vector.get())

    const estate = Structural.get(edge)
    expect(estate).toEqual(edge.get())
})

test('get deep', () => {

    expect(vector.get('x')).toBe(0)
    expect(edge.get('a')).toEqual({ x: 0, y: 0 })
    expect(edge.get('a', 'x')).toBe(0) 

}) 

test('apply', () => {

    const vector2 = vector.create({ x: 100 })
    expect(vector2.get()).toEqual({ x: 100, y: 0 })

    const edge2 = edge.create({ a: vector2 })
    expect(edge2.get()).toEqual({ a: { x: 100, y: 0 }, b: { x: 0, y: 0 }})
})

test('apply deep', () => {
    const edge3 = edge.create('a', 'x', 50)
    expect(edge3.get()).toEqual({ a: { x: 50, y: 0 }, b: { x: 0, y: 0 }})
})

test('copy', () => {
    expect(edge.copy()).not.toBe(edge)
    expect(edge.copy()).toEqual(edge)
})

test('equals', () => {
    expect(edge.equals(edge.copy())).toBe(true)
    expect(edge.equals(edge.create('a', 'x', 50 ))).not.toBe(true)
})