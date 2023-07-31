import {
    AnyTypeGuard,
    GenericObject,
    Infer,
    isIntersection,
    isObject,
    isShape
} from '@benzed/types'

import { each } from '@benzed/each'

import Traits from '@benzed/traits'

import { Stateful, StateOf } from './stateful'

import { equals, Comparable } from './comparable'
import { copy, Copyable } from './copyable'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper Types ////

type _ToState<T extends object> = T extends Stateful ? StateOf<T> : T

type _DeepState<T> = T extends object
    ? Infer<
          {
              [K in keyof _ToState<T>]: _ToState<T>[K] extends Stateful
                  ? _DeepState<_ToState<T>[K]>
                  : _ToState<T>[K]
          },
          object
      >
    : T

type _PartialDeepState<T> = T extends object
    ? Infer<
          {
              [K in keyof _ToState<T>]?: _ToState<T>[K] extends Stateful
                  ? _PartialDeepState<_ToState<T>[K]>
                  : _ToState<T>[K]
          },
          object
      >
    : T

type _StateAtPath<T, P extends unknown[]> = P extends [infer P1, ...infer Pr]
    ? P1 extends keyof T
        ? _StateAtPath<T[P1], Pr>
        : never
    : _DeepState<T>

type _StructAtPath<T, P extends unknown[]> = P extends [infer P1, ...infer Pr]
    ? P1 extends keyof T
        ? _StructAtPath<T[P1], Pr>
        : never
    : T extends Structural
    ? T
    : _DeepState<T>

type _PartialStateAtPath<T, P extends unknown[]> = P extends [
    infer P1,
    ...infer Pr
]
    ? P1 extends keyof T
        ? _PartialStateAtPath<T[P1], Pr>
        : never
    : _PartialDeepState<T>

//// Types ////

type StructStatePath = PropertyKey[]

type StructStateApply<
    T extends Structural,
    P extends StructStatePath = []
> = _PartialStateAtPath<StateOf<T>, P>

type StructStateUpdate<T extends Structural, P extends StructStatePath = []> = (
    prev: _StructAtPath<T, P>
) => _PartialStateAtPath<StateOf<T>, P>

type StructState<
    T extends Structural,
    P extends StructStatePath = []
> = _StateAtPath<StateOf<T>, P>

//// Main ////

/**
 * A Structural object is an immutable stateful object with static methods
 * for deeply getting and setting state.
 */
abstract class Structural extends Traits.merge(Stateful, Copyable, Comparable) {
    /**
     * Get a sub struct from a struct
     */
    static getStruct<T extends Structural, P extends StructStatePath>(
        struct: T,
        ...path: P
    ): _StructAtPath<T, P> {
        let state = struct[Stateful.state]

        // resolve state at path
        for (const subPath of path) {
            if (!isObject(state) || !(subPath in state))
                throw new Error(`Invalid state at path: ${String(subPath)}`)

            state = state[subPath as keyof typeof state]
        }

        // get nested states
        if (isObject(state) && !this.is(state)) {
            //                  ^ unless the current state IS a struct.
            for (const key of each.keyOf(state)) {
                const value = state[key]
                if (this.is(value)) state[key] = this.get(value) as typeof value
            }
        }

        return state as _StructAtPath<T, P>
    }

    /**
     * Given a struct, resolve the state of that struct by recursively
     * resolving the state of any nested sub structs.
     */
    static get<T extends Structural, P extends StructStatePath>(
        struct: T,
        ...path: P
    ): StructState<T, P> {
        const structAtPath = this.getStruct(struct, ...path)

        return (
            Stateful.is(structAtPath) ? this.get(structAtPath) : structAtPath
        ) as StructState<T, P>
    }

    /**
     * Given a struct and a state update, apply the state by
     * updating any sub structures with their appropriate nested
     * object state.
     */
    static set<T extends Structural, P extends StructStatePath>(
        struct: T,
        ...params: readonly [...P, StructStateApply<T, P>]
    ): void {
        const [newStateAtPath, ...path] = [...params].reverse() as [
            StructStateApply<T, P>,
            ...P
        ]

        // resolve state from path and endpoint
        let partialState = newStateAtPath as GenericObject
        for (const subPath of path) partialState = { [subPath]: partialState }

        const state = Stateful.get(struct)

        // deep set state, triggering nested struct state setters
        for (const key of each.keyOf(partialState)) {
            const prevKey = key as keyof typeof state
            if (
                prevKey in state &&
                this.is(state[prevKey]) &&
                !this.is(partialState[key])
            ) {
                partialState[key] = this.create(
                    (state as any)[prevKey],
                    partialState[key] // <- shut up, ts
                )
            }
        }

        Stateful.set(struct, { ...state, ...partialState })
    }

    /**
     * Create a structure from an original and a new state
     */
    static create<T extends Structural, P extends StructStatePath>(
        original: T,
        ...params: [...P, StructStateApply<T, P>]
    ): T {
        const clone = copy(original)
        this.set(clone, ...params)
        return clone
    }

    /**
     * Update a structure from an original and a new state
     */
    static update<T extends Structural, P extends StructStatePath>(
        original: T,
        ...params: [...P, StructStateUpdate<T, P>]
    ): T {
        const [update, ...path] = params.reverse() as [
            StructStateUpdate<T, P>,
            ...P
        ]
        path.reverse() // undo that ------^

        const prev = this.getStruct(original, ...path)
        return this.create(original, ...(path as P), update(prev))
    }

    static override is: (input: unknown) => input is Structural =
        isIntersection(
            Comparable.is,
            Copyable.is as AnyTypeGuard,
            isShape({
                [Stateful.state]: isObject
            })
        )

    //// Copyable ////

    abstract get [Stateful.state](): object

    abstract set [Stateful.state](state: object)

    /**
     * A struct assumes the only logic in the constructor is
     * setting state.
     *
     * Extensions that break this convention will have to
     * override this copy method in order to account for them.
     */
    [Copyable.copy](): this {
        const clone = Copyable.createFromProto(this)

        Stateful.set(clone, copy(this[Stateful.state]))
        return clone
    }

    //// Comparable ////

    /**
     * If another Struct has the same constructor and
     * a value equal state, it's considered equal.
     */
    [Comparable.equals](other: unknown): other is this {
        return (
            Structural.is(other) &&
            other.constructor === this.constructor &&
            equals(other[Stateful.state], this[Stateful.state])
        )
    }
}

//// Exports ////

export default Structural

export {
    Structural,
    StructState,
    StructStateApply,
    StructStateUpdate,
    StructStatePath
}
