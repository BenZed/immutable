import { trait } from '@benzed/traits'
import { assign, isKeyed, isObject, isString } from '@benzed/types'

import { define } from '@benzed/util'
import { each } from '@benzed/each'

//// Symbol ////

const $$state = Symbol('state')

//// Types ////

type StateOf<T extends Stateful> = T[typeof $$state]

//// Main ////

/**
 * Stateful trait allows custom logic for getting/setting
 * an object's state.
 */
@trait
abstract class Stateful {
    /**
     * Set the state of an object using the State trait
     */
    static set<T extends Stateful>(object: T, state: StateOf<T>): void {
        const descriptor = each.defined
            .descriptorOf(object)
            .find(([k]) => k === Stateful.state)?.[1]

        if (descriptor?.writable || descriptor?.set) object[$$state] = state
        else if (isObject(state)) {
            // This isn't really a good place for this, but it's very convenient,
            // what with all the name setting that's done on Callable objects.
            if ('name' in state && isString(state.name))
                define.named(state.name, object)

            assign(object, state)
        } else throw new Error(`State ${state} is invalid.`)
    }

    /**
     * Get the state of an object using the State trait
     */
    static get<T extends Stateful>(object: T): StateOf<T> {
        return object[$$state]
    }

    static readonly is: (input: unknown) => input is Stateful = isKeyed($$state)

    /**
     * The symbolic key for the state accessor trait users need
     * to implement
     */
    static readonly state: typeof $$state = $$state

    //// Stateful ////

    abstract get [$$state](): unknown

    protected abstract set [$$state](input: unknown)
}

export { Stateful, StateOf, $$state }
