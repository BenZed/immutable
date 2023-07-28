import { isShape, isFunc, AnyTypeGuard } from '@benzed/util'
import { Traits } from '@benzed/traits'

//// Symbol ////

const $$copy = Symbol('=')

//// Main ////

abstract class Copyable extends Traits {

    /**
     * Symbolic key used to implement the copy method.
     */
    static readonly copy: typeof $$copy = $$copy

    /**
     * Copy an object from a given object's prototype.
     * No constructor logic applied or non-prototypal properties
     * transferred.
     */
    static createFromProto<T extends object>(object: T): T {
        return Object.create(object.constructor.prototype)
    }

    static override readonly is: (input: unknown) => input is Copyable = isShape({
        [$$copy]: isFunc
    }) as AnyTypeGuard

    abstract [$$copy](): this 

}

//// Exports ////

export default Copyable

export {
    Copyable
}