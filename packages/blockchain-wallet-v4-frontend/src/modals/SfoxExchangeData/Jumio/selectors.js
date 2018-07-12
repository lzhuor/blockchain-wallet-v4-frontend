import { selectors } from 'data'
import { lift } from 'ramda'
import { createDeepEqualSelector } from 'services/ReselectHelper'

export const getData = createDeepEqualSelector(
  [
    selectors.core.walletOptions.getOptions,
    selectors.core.kvStore.buySell.getJumioToken,
    selectors.core.kvStore.buySell.getJumioId
  ],
  (optionsR, tokenR, idR) => {
    const transform = (options, token, id) => {
      return {
        options,
        token,
        id
      }
    }
    return lift(transform)(optionsR, tokenR, idR)
  }
)
