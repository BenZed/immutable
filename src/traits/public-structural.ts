import { AnyTypeGuard, isFunc, isIntersection, isShape } from '@benzed/types'
import { equals } from './comparable'

import { copy } from './copyable'
import Structural, {
    StructState,
    StructStateApply,
    StructStateUpdate,
    StructStatePath
} from './structural'

/**
 * A PublicStructural extends the Structural trait
 * adding a number of instance methods to carry out
 * immutable operations.
 */
export abstract class PublicStructural extends Structural {
    static override is: (input: unknown) => input is PublicStructural =
        isIntersection(
            Structural.is,
            isShape({
                get: isFunc,
                create: isFunc,
                update: isFunc,
                copy: isFunc,
                equals: isFunc as AnyTypeGuard
            })
        )

    //// Public Immutability Interface ////

    get<P extends StructStatePath>(...path: P): StructState<this, P> {
        return Structural.get(this, ...path)
    }

    create<P extends StructStatePath>(
        ...pathAndState: [...path: P, state: StructStateApply<this, P>]
    ): this {
        return Structural.create(this, ...pathAndState)
    }

    update<P extends StructStatePath>(
        ...pathAndUpdate: [...path: P, state: StructStateUpdate<this, P>]
    ): this {
        return Structural.update(this, ...pathAndUpdate)
    }

    copy(): this {
        return copy(this)
    }

    equals(other: unknown): other is this {
        return equals(this, other)
    }
}
