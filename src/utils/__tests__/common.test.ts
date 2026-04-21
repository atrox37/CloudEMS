import { describe, expect, it } from 'vitest'
import { arrayToObjectByKey, removeEmpty } from '../common'

describe('common.ts', () => {
  describe('removeEmpty', () => {
    it('removes only null, empty string, and undefined values', () => {
      const source = {
        id: 1,
        emptyString: '',
        nullable: null,
        missing: undefined,
        zero: 0,
        disabled: false,
        tags: [],
      }

      expect(removeEmpty(source)).toEqual({
        id: 1,
        zero: 0,
        disabled: false,
        tags: [],
      })
    })

    it('returns an empty object for non-object input', () => {
      expect(removeEmpty(null as never)).toEqual({})
      expect(removeEmpty('invalid' as never)).toEqual({})
    })
  })

  describe('arrayToObjectByKey', () => {
    it('indexes items by the provided key', () => {
      const rows = [
        { code: 'A', value: 1 },
        { code: 'B', value: 2 },
      ]

      expect(arrayToObjectByKey(rows, 'code')).toEqual({
        A: { code: 'A', value: 1 },
        B: { code: 'B', value: 2 },
      })
    })

    it('ignores items with nullish keys and keeps the last duplicate key', () => {
      const rows = [
        { code: 'A', value: 1 },
        { code: undefined, value: 2 },
        { code: 'A', value: 3 },
        { code: null, value: 4 },
      ]

      expect(arrayToObjectByKey(rows, 'code')).toEqual({
        A: { code: 'A', value: 3 },
      })
    })

    it('returns an empty object when input is not an array', () => {
      expect(arrayToObjectByKey(null as never, 'code' as never)).toEqual({})
    })
  })
})
