import { Trait } from '@benzed/traits'
import { describe, test, expect } from '@jest/globals'

import { Copyable } from './copyable'

class Person extends Trait.use(Copyable) {
    constructor(public name: string, public age: number) {
        super()
    }

    [Copyable.copy](): this {
        return new Person(this.name, this.age) as this
    }
}

class Product extends Trait.use(Copyable) {

    constructor(public name: string, public price: number) {
        super()
    }

    [Copyable.copy](): this {
        return new Product(this.name, this.price) as this
    }
}

//// Tests ////

describe('Copyable.is', () => {
    test('returns true for copyable objects', () => {
        expect(Copyable.is(new Person('Alice', 30))).toBe(true)
        expect(Copyable.is(new Product('Shoes', 49.99))).toBe(true)
    })

    test('returns false for non-copyable objects', () => {
        expect(Copyable.is({})).toBe(false)
        expect(Copyable.is(42)).toBe(false)
        expect(Copyable.is('foo')).toBe(false)
        expect(Copyable.is(true)).toBe(false)
    })
})

describe('Copyable.copy', () => {
    test('returns a deep copy of an object', () => {
        class Example extends Trait.use(Copyable) {
            constructor(
                public prop1: string, 
                public prop2: number,
                public prop3: { nestedProp: boolean }
            ) {
                super()
            }

            [Copyable.copy](): this {
                return new Example(this.prop1, this.prop2, { nestedProp: this.prop3.nestedProp }) as this
            }
        }

        const original = new Example('test', 123, { nestedProp: true })
        const copy = original[Copyable.copy]()

        expect(copy).toEqual(original)
        expect(copy).not.toBe(original)
        expect(copy.prop3).not.toBe(original.prop3)
    })
})