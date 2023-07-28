/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-this-alias */

import {
    isIterable, 
    isArrayLike, 
    isObject, 
    GenericObject,
    each
} from '@benzed/util'
import Comparable from './comparable'

//// Helper ////

function equalArrayLikes(left: ArrayLike<unknown>, right: ArrayLike<unknown>): boolean {

    if (left.length !== right.length)
        return false

    for (const index of each.indexOf(left)) {
        if (!equals(left[index], right[index]))
            return false
    }

    return true
}

function equalObject(left: GenericObject, right: GenericObject): boolean {

    const { keyOf } = each

    const keys = new Set(each(keyOf(left), keyOf(right)))

    for (const key of keys) {
        if (!equals(left[key], right[key]))
            return false
    }

    return true
}

//// Main ////

function equals<T>(left: T, right: unknown): right is T {
    if (Object.is(left, right))
        return true

    const isLeftComparable = Comparable.is(left)
    if (isLeftComparable)
        return left[Comparable.equals](right)

    const isRightComparable = Comparable.is(right)
    if (isRightComparable)
        return right[Comparable.equals](left)

    if (!isObject(left) || !isObject(right))
        return false

    if (left.constructor !== right.constructor)
        return false 

    if (left instanceof WeakMap || left instanceof WeakSet)
        return false

    if (left instanceof RegExp || left instanceof Date)
        return left.toString() === right.toString()

    if (isArrayLike(left))
        return equalArrayLikes(left, right as typeof left)
    
    if (isIterable(left)) {
        return equalArrayLikes(
            [...left], 
            [...right as typeof left]
        )
    }

    return equalObject(left as GenericObject, right as GenericObject)
}

//// Exports ////

export default equals

export {
    equals
}