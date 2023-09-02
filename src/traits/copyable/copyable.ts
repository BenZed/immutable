import { isShapeOf, isFunc } from '@benzed/types'
import { trait } from '@benzed/traits'

//// Symbol ////

const $$copy = Symbol('=')

//// Main ////

@trait
abstract class Copyable {
    /**
     * Symbolic key used to implement the copy method.
     */
    static readonly copy: typeof $$copy = $$copy

    static readonly is = isShapeOf<Copyable>({
        [$$copy]: isFunc
    })

    /**
     * Copy an object from a given object's prototype.
     * No constructor logic applied or non-prototypal properties
     * transferred.
     */
    static createFromProto<T extends object>(object: T): T {
        return Object.create(object.constructor.prototype)
    }

    abstract [$$copy](): this
}

//// Exports ////

export default Copyable

export { Copyable, $$copy }
