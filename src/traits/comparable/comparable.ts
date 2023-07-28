import { isShape, isFunc, AnyTypeGuard } from '@benzed/util'
import { Trait } from '@benzed/traits'

//// Symbol ////

const $$equals = Symbol('==')

//// Main ////

abstract class Comparable extends Trait {

    /**
     * Symbolic key used to implement the compare method.
     */
    static readonly equals: typeof $$equals = $$equals

    static override readonly is: (input: unknown) => input is Comparable = isShape({
        [$$equals]: isFunc
    }) as AnyTypeGuard 

    abstract [$$equals](other: unknown): other is this 

}

//// Exports ////

export default Comparable

export {
    Comparable
}