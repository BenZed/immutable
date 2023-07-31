import { isShape, isFunc } from '@benzed/types'
import { trait } from '@benzed/traits'

//// Symbol ////

const $$equals = Symbol('==')

//// Main ////

@trait
abstract class Comparable {
    /**
     * Symbolic key used to implement the compare method.
     */
    static readonly equals: typeof $$equals = $$equals

    static readonly is = isShape<Comparable>({
        [$$equals]: isFunc
    });

    abstract [$$equals](other: unknown): other is this
}

//// Exports ////

export default Comparable

export { Comparable, $$equals }
