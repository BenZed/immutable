import { Traits } from '@benzed/traits'
import { assign, GenericObject } from '@benzed/types'
import { Stateful, Structural } from '../traits'

//// Types ////

interface RecordStructConstructor {
    new <K extends string | symbol | number, V>(
        record: Record<K, V>
    ): RecordStruct<K, V>
}

interface RecordStructState<K extends string | symbol | number, V>
    extends Structural {
    [Stateful.state]: Record<K, V>
}

type RecordStruct<K extends string | symbol | number, V> = Record<K, V> &
    RecordStructState<K, V>

//// Main ////

/**
 * Quite simply, a structural record.
 */
const RecordStruct = class RecordStruct extends Traits(Structural) {
    constructor(record: GenericObject) {
        super()
        assign(this, record)
    }

    get [Structural.state](): object {
        return { ...this }
    }

    set [Structural.state](value: object) {
        Object.assign(this, value)
    }
} as RecordStructConstructor

//// Exports ////

export default RecordStruct

export { RecordStruct }
