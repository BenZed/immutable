import { Comparable } from './comparable'

import { it, expect, describe } from '@jest/globals'
import { Trait } from '@benzed/traits'

import equals from './equals'

//// Tests ////

describe('Comparable trait', () => {

    class Box {
        constructor(public width: number, public height: number, public depth: number) {}

        get volume() {
            return this.width * this.height * this.depth 
        }

        equals(other: unknown) {
            return other instanceof Box &&
                other.width === this.width &&
                other.height === this.height &&
                other.depth === this.depth
        }
    }

    class Sphere {
        constructor(public radius: number) {}

        get volume() {
            return 4 / 3 * Math.PI * this.radius ** 3 
        }

        [Comparable.equals](other: unknown): other is this {
            return other instanceof Sphere &&
                other.radius === this.radius
        }
    }

    class Triangle extends Trait.use(Comparable) {
        constructor(public a: number, public b: number, public c: number) {
            super()
        }

        get perimeter() {
            return this.a + this.b + this.c 
        }

        [Comparable.equals](other: unknown): other is this {
            return other instanceof Triangle &&
                other.a === this.a &&
                other.b === this.b &&
                other.c === this.c
        }
    }

    it('compares objects with a custom equals method', () => {
        expect(equals(new Box(2, 3, 4), new Box(2, 3, 4))).toBe(true)
        expect(equals(new Box(1, 3, 4), new Box(2, 3, 4))).toBe(false)
        expect(equals(new Box(2, 3, 4), new Box(1, 3, 4))).toBe(false)

        expect(equals(new Sphere(2), new Sphere(2))).toBe(true)
        expect(equals(new Sphere(1), new Sphere(2))).toBe(false)
        expect(equals(new Sphere(2), new Sphere(1))).toBe(false)

        expect(equals(new Triangle(3, 4, 5), new Triangle(3, 4, 5))).toBe(true)
        expect(equals(new Triangle(1, 2, 3), new Triangle(3, 4, 5))).toBe(false)
        expect(equals(new Triangle(3, 4, 5), new Triangle(1, 2, 3))).toBe(false)
    })

    it('compares objects by their values', () => {
        class Person extends Trait.use(Comparable) {
            constructor(public name: string, public age: number) {
                super()
            }
    
            [Comparable.equals](other: unknown): other is this {
                return other instanceof Person && this.name === other.name && this.age === other.age
            }
        }
    
        const person1 = new Person('Alice', 25)
        const person2 = new Person('Alice', 25)
        const person3 = new Person('Bob', 30)
    
        expect(equals(person1, person2)).toBe(true)
        expect(equals(person1, person3)).toBe(false)
        expect(equals(person1, person1)).toBe(true)
    })
    
    it('compares using the equals symbolic property key', () => {
        class Foo extends Trait.use(Comparable) {
            value: string
    
            constructor(value: string) {
                super()
                this.value = value
            }

            [Comparable.equals](other: unknown): other is this {
                return other instanceof Foo && this.value === other.value
            }
        }
    
        const foo1 = new Foo('hello')
        const foo2 = new Foo('hello')
        const foo3 = new Foo('world')

        expect(equals(foo1, foo2)).toBe(true)
        expect(equals(foo1, foo3)).toBe(false)
        expect(equals(foo1, foo1)).toBe(true)
    })
})
