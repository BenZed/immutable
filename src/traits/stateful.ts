import { Trait } from '@benzed/traits'
import { AnyTypeGuard, assign, define, each, isKeyed, isObject, isString } from '@benzed/util'

//// Sybol ////

const $$state = Symbol('state')

//// Types ////

type StateOf<T extends Stateful> = T[typeof $$state]

//// Main ////

/**
 * Stateful trait allows custom logic for getting/setting
 * an object's state.
 */
abstract class Stateful extends Trait {

    /**
     * Set the state of an object using the State trait
     */
    static set<T extends Stateful>(object: T, state: StateOf<T>): void {
        const descriptor = each
            .defined
            .descriptorOf(object)
            .find(([k]) => k === Stateful.state)?.[1]

        if (descriptor?.writable || descriptor?.set)
            object[$$state] = state
        else if (isObject(state)) {
            
            // This isn't really a good place for this, but it's very convenent,
            // what with all the name setting that's done on Callable objects.
            if ('name' in state && isString(state.name))
                define.named(state.name, object)
            
            assign(object, state)
            
        } else 
            throw new Error(`State ${state} is invalid.`)

    }

    /**
     * Get the state of an object using the State trait
     */
    static get<T extends Stateful>(object: T): StateOf<T> {
        return object[$$state]
    }

    static override readonly is: (input: unknown) => input is Stateful = 
        isKeyed($$state) as AnyTypeGuard

    /**
     * The symbolic key for the state accessor trait users need 
     * to implement
     */
    static readonly state: typeof $$state = $$state

    //// Stateful ////

    abstract get [$$state](): unknown

    protected abstract set [$$state](input: unknown)

}

export {
    Stateful,
    StateOf
}