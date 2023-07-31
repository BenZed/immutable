import { Traits } from '@benzed/traits'
import { assign, pick } from '@benzed/types'

import { expect, describe, it } from '@jest/globals'

import { Stateful } from './stateful'
import { Structural } from './structural'

//// Setup ////

class Vector extends Traits(Structural) {
    constructor(
        readonly x = 0,
        readonly y = 0
    ) {
        super()
    }

    get [Structural.state]() {
        return pick(this, 'x', 'y')
    }

    set [Structural.state](value) {
        assign(this, value)
    }
}

class Shape extends Traits(Structural) {
    constructor(
        readonly color = 'black',
        readonly position = new Vector()
    ) {
        super()
    }

    get [Stateful.state]() {
        return pick(this, 'color', 'position')
    }

    set [Stateful.state](value) {
        assign(this, value)
    }
}

//// Tests ////

describe('Struct.copy', () => {
    it('creates an immutably copied object', () => {
        const v1 = new Vector(2, 2)
        const v2 = v1[Structural.copy]()
        expect(v1).not.toBe(v2)
        expect(v1).toEqual(v2)
    })
})

describe('Struct.equals', () => {
    it('returns true if two stateful objects of the same type have equal states', () => {
        const v1 = new Vector(2, 2)
        const v2 = new Vector(2, 2)
        const v3 = new Vector(3, 3)

        expect(v1[Structural.equals](v2)).toBe(true)
        expect(v1[Structural.equals](v3)).toBe(false)
    })
})

describe('Struct.get', () => {
    it('get deep state', () => {
        const shape = new Shape('blue', new Vector(1, 2))

        const state = shape[Stateful.state]
        expect(state).toEqual({
            color: 'blue',
            position: new Vector(1, 2)
        })

        const deepState = Structural.get(shape)
        expect(deepState).toEqual({
            color: 'blue',
            position: {
                x: 1,
                y: 2
            }
        })
    })

    it('get at path', () => {
        const shape = new Shape('grey', new Vector(10, 10))

        const position = Structural.get(shape, 'position')
        expect(position).toEqual({ x: 10, y: 10 })

        const x = Structural.get(shape, 'position', 'x')
        expect(x).toEqual(10)
    })

    it('throws at invalid paths', () => {
        const shape = new Shape('grey', new Vector(10, 10))
        expect(() => Structural.get(shape, 'ace')).toThrow('Invalid state')
        expect(() => Structural.get(shape, 'ace', 'base')).toThrow(
            'Invalid state'
        )
    })
})

describe('Struct.set', () => {
    it('set deep state', () => {
        const shape = new Shape('green', new Vector(0, 0))

        Structural.set(shape, {
            color: 'red',
            position: { x: 2 }
        })

        expect(shape.color).toBe('red')
        expect(shape.position).toEqual(new Vector(2, 0))
    })

    it('set deep state at path', () => {
        const shape = new Shape('red', new Vector(5, 5))

        Structural.set(shape, 'color', 'orange')
        expect(shape.color).toBe('orange')

        Structural.set(shape, 'position', { x: 10 })
        expect(shape.position).toBeInstanceOf(Vector)
        expect(shape.position.x).toBe(10)

        Structural.set(shape, 'position', 'y', 7)
        expect(shape.position).toBeInstanceOf(Vector)
        expect(shape.position.y).toBe(7)
    })
})

describe('Struct.create', () => {
    it('creates an immutably copied object with a modified state', () => {
        const v1 = new Vector(2, 2)
        const v2 = Structural.create(v1, new Vector(3, 3))
        expect(v1).not.toBe(v2)
        expect(v1).toEqual(new Vector(2, 2))
        expect(v2).toEqual(new Vector(3, 3))
    })

    it('state can be applied deeply', () => {
        const shape = new Shape('turquoise', new Vector(10, 10))

        const shape2 = Structural.create(shape, { position: { y: 5 } })
        expect(shape2).not.toBe(shape)

        expect(Structural.get(shape2)).toEqual({
            color: 'turquoise',
            position: {
                x: 10,
                y: 5
            }
        })
    })

    it('nested state can be applied deeply', () => {
        const shape = new Shape('orange', new Vector(10, 10))

        const shape2 = Structural.create(shape, 'position', { x: 2 })

        expect(shape2).not.toBe(shape)
        expect(Structural.get(shape2)).toEqual({
            color: 'orange',
            position: {
                x: 2,
                y: 10
            }
        })
    })
})

describe('Struct.update', () => {
    it('creates an immutably copied object with a modified state via update function', () => {
        const v1 = new Vector(2, 2)
        const v2 = Structural.update(v1, 'x', v => v + 1)
        expect(v1).not.toBe(v2)
        expect(v1).toEqual(new Vector(2, 2))
        expect(v2).toEqual(new Vector(3, 2))

        const v3 = Structural.update(v1, v => new Vector(v.x * 5, v.x * 5))
        expect(v3).toEqual(new Vector(10, 10))
    })

    it('works on deep states', () => {
        const cube1 = new Shape('grey', new Vector(10, 10))

        const cube2 = Structural.update(cube1, 'position', 'x', v => v + 10)

        expect(cube2).toEqual({
            color: 'grey',
            position: { x: 20, y: 10 }
        })
    })
})
