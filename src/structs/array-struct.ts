import { assign, Func, nil, omit } from '@benzed/types'

import { adjacent, shuffle } from '@benzed/array'
import { Traits } from '@benzed/traits'
import { each } from '@benzed/each'

import { PublicStructural, Stateful, Structural } from '../traits'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper Types ////

type ArrayMethodNames = keyof {
    [K in keyof Array<unknown> as Array<unknown>[K] extends Func
        ? K
        : never]: never
}

type ArrayParams<T, M extends ArrayMethodNames> = Parameters<Array<T>[M]>

//// Helper ////

const ArrayMethods = Array.prototype

function applyArrayState<
    T,
    S extends ArrayStruct<T>,
    M extends (this: ArrayLike<T>, ...args: any) => any
>(
    arrayStruct: S,
    method: M,
    args: Parameters<M>,
    stateFromReturnValue = false
): S {
    // create an array like out of the struct state, adding a mutable length property
    const arrayLike = { ...arrayStruct, length: arrayStruct.length }

    // apply the method to the arrayLike
    const result = method.apply(arrayLike, args)

    // convert the array like back into a state
    const state = stateFromReturnValue ? result : omit(arrayLike, 'length')

    // clone struct and apply state
    const newArrayStruct = Object.create(arrayStruct.constructor.prototype)
    Structural.set(newArrayStruct, state)
    return newArrayStruct
}

//// Main ////

/**
 * An ArrayStruct implements a subset of the Array's methods, with the caveat that
 * none of the methods mutate the original array.
 */
class ArrayStruct<T> extends Traits(PublicStructural) implements Iterable<T> {
    readonly [index: number]: T

    constructor(...items: T[]) {
        super()

        let index = 0
        for (const item of items) (this as any)[index++] = item
    }

    //// Interface ////

    get length(): number {
        return each.nameOf(this).count()
    }

    at(index: number): T | nil {
        return this[index < 0 ? index + this.length : index]
    }

    /**
     * Retrieve a new array struct
     * with the given item pushed onto the end
     */
    push(...items: ArrayParams<T, 'push'>): this {
        return applyArrayState(this, ArrayMethods.push, items)
    }

    /**
     * Retrieve a new array struct with
     * it's last item popped off
     */
    pop(): this {
        return applyArrayState(this, ArrayMethods.pop, [])
    }

    /**
     * Retrieve a new array struct with shift parameters applied
     */
    shift(): this {
        return applyArrayState(this, ArrayMethods.shift, [])
    }

    /**
     * Retrieve a new array struct with unshift parameters applied
     */
    unshift(): this {
        return applyArrayState(this, ArrayMethods.shift, [])
    }

    /**
     * Retrieve a new sorted array struct
     */
    sort(...sortArgs: ArrayParams<T, 'sort'>): this {
        return applyArrayState(this, ArrayMethods.sort, sortArgs)
    }

    /**
     * Retrieve a new reversed array struct
     */
    reverse(): this {
        return applyArrayState(this, ArrayMethods.reverse, [])
    }

    /**
     * Retrieve a new array struct with the splice arguments applied
     */
    splice(...spliceArgs: ArrayParams<T, 'splice'>): this {
        return applyArrayState(this, ArrayMethods.splice, spliceArgs)
    }

    /**
     * Retrieve a new reversed array struct with slice arguments applied
     */
    slice(...sliceArgs: ArrayParams<T, 'slice'>): this {
        return applyArrayState(this, ArrayMethods.slice, sliceArgs, true)
    }

    /**
     * Retrieve a new reversed array struct with map arguments applied
     */
    map(...mapArgs: ArrayParams<T, 'map'>): this {
        return applyArrayState(this, ArrayMethods.map, mapArgs, true)
    }

    /**
     * Retrieve a new reversed array struct with filter arguments applied
     */
    filter(...filterArgs: ArrayParams<T, 'filter'>): this {
        return applyArrayState(this, ArrayMethods.filter, filterArgs, true)
    }

    /**
     * Retrieve a new reversed array struct with concat arguments applied
     */
    concat(...concatArgs: ArrayParams<T, 'concat'>): this {
        return applyArrayState(this, ArrayMethods.concat, concatArgs, true)
    }

    /**
     * Retrieve a new reversed array struct with concat arguments applied
     */
    copyWithin(...copyWithinArgs: ArrayParams<T, 'copyWithin'>): this {
        return applyArrayState(this, ArrayMethods.copyWithin, copyWithinArgs)
    }

    join(...joinArgs: ArrayParams<T, 'join'>): string {
        return ArrayMethods.join.apply(this, joinArgs)
    }

    // random(...randomArgs: Parameters<typeof random>): this {
    //     return applyArrayState(this, random, randomArgs)
    // }

    shuffle(...shuffleArgs: Parameters<typeof shuffle>): this {
        return applyArrayState(this, shuffle, shuffleArgs)
    }

    adjacent(...adjacentArgs: Parameters<typeof adjacent>): this {
        return applyArrayState(this, adjacent, adjacentArgs)
    }

    // TODO reduce
    // TODO reduceRight
    // TODO entries
    // TODO values
    // TODO every
    // TODO some
    // TODO fill
    // TODO find
    // TODO findIndex
    // TODO findLast
    // TODO findLastIndex
    // TODO flat
    // TODO flatMap
    // TODO forEach
    // TODO includes
    // TODO indexOf
    // TODO keys
    // TODO lastIndexOf
    // TODO get
    // TODO applyIn
    // TODO copy
    // TODO equals

    // TODO custom: unique, random, pluck
    toArray(): T[] {
        return [...this]
    }

    //// Iterable ////

    *[Symbol.iterator](): Iterator<T> {
        for (const index of each.indexOf(this)) yield this[index]
    }

    //// State ////

    get [Stateful.state](): { [index: number]: T } {
        return { ...this }
    }

    set [Stateful.state](state: { [index: number]: T }) {
        assign(this, state)
    }
}

//// Export ////

export default ArrayStruct

export { ArrayStruct }
