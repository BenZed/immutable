import { Traits } from '@benzed/traits'
import { assign, omit } from '@benzed/types'
import { NamesOf } from '@benzed/each'

import { PublicStructural, Structural } from '../traits'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

/**
 * State preset for a public structural objects.
 * Any property is considered state, as long as it isn't a immutable interface method, or
 * a built-in object method.
 */
export type PublicStructState<T extends object> = Pick<
    T,
    Exclude<
        NamesOf<T>,
        'toString' | 'valueOf' | 'copy' | 'equals' | 'get' | 'apply'
    >
>

//// PublicStruct ////

/**
 * A PublicStruct implements the PublicStructural interface, and treats
 * everything except public immutability methods (and toString, valueOf)
 * as state.
 */
export abstract class PublicStruct extends Traits(PublicStructural) {
    get [Structural.state](): PublicStructState<this> {
        return omit(
            this,
            'toString',
            'valueOf',
            'get',
            'apply',
            'copy',
            'equals'
        ) as PublicStructState<this>
    }

    protected set [Structural.state](state: PublicStructState<this>) {
        assign(this, state)
    }
}
