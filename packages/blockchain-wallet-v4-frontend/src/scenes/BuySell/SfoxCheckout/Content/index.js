import React from 'react'
import { actions } from 'data'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { getBase, getData, getErrors, getQuote, getSellQuote, getTrades, getPayment, getJumioStatus } from './selectors'
import Success from './template.success'
import Loading from 'components/BuySell/Loading'
import { path, prop } from 'ramda'
import Failure from 'components/BuySell/Failure'

class SfoxCheckout extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = { buttonStatus: false }
  }
  componentDidMount () {
    this.props.sfoxDataActions.fetchTrades()
    this.props.sfoxDataActions.fetchProfile()
    this.props.sfoxDataActions.sfoxFetchAccounts()
    this.props.sfoxDataActions.fetchQuote({quote: { amt: 1e8, baseCurrency: 'BTC', quoteCurrency: 'USD' }})
    this.props.sfoxDataActions.fetchSellQuote({quote: { amt: 1e8, baseCurrency: 'BTC', quoteCurrency: 'USD' }})
    this.props.sfoxActions.initializePayment()
    this.props.modalActions.showModal('JumioPrompt') // will need logic for this to show / not show
  }

  componentDidUpdate (prevProps) {
    const prev = prevProps.data.getOrElse()
    const props = this.props.data.getOrElse()
    if (prop('profile', prev) !== prop('profile', props)) {
      this.props.sfoxActions.getJumio()
    }
  }

  componentWillUnmount () {
    this.props.sfoxActions.disableSiftScience()
  }

  render () {
    const { data, modalActions, sfoxActions, sfoxDataActions, payment, orderState, formActions, siftScienceEnabled, jumioStatus } = this.props
    const { handleTrade, fetchQuote, refreshQuote, refreshSellQuote, fetchSellQuote } = sfoxDataActions
    const { sfoxNotAsked } = sfoxActions
    const { showModal } = modalActions
    const { change } = formActions

    const busy = orderState.cata({
      Success: () => false,
      Failure: (err) => err,
      Loading: () => true,
      NotAsked: () => false
    })

    return data.cata({
      Success: (value) => <Success {...this.props}
        value={value}
        handleTrade={handleTrade}
        showModal={showModal}
        fetchBuyQuote={(quote) => fetchQuote({ quote, nextAddress: value.nextAddress })}
        fetchSellQuote={(quote) => fetchSellQuote({ quote })}
        refreshBuyQuote={() => refreshQuote()}
        refreshSellQuote={() => refreshSellQuote()}
        submitBuyQuote={(quote) => { sfoxActions.submitQuote(quote); this.setState({ busy: true }) }}
        submitSellQuote={(quote) => { sfoxActions.submitSellQuote(quote); this.setState({ busy: true }) }}
        busy={busy}
        payment={payment}
        clearTradeError={() => sfoxNotAsked()}
        changeTab={tab => change('buySellTabStatus', 'status', tab)}
        disableButton={() => this.setState({ buttonStatus: false })}
        enableButton={() => this.setState({ buttonStatus: true })}
        buttonStatus={this.state.buttonStatus}
        siftScienceEnabled={siftScienceEnabled}
        jumioStatus={jumioStatus}
      />,
      Failure: (error) => <Failure error={error} />,
      Loading: () => <Loading />,
      NotAsked: () => <div>Not Asked</div>
    })
  }
}

const mapStateToProps = state => ({
  base: getBase(state),
  data: getData(state),
  buyQuoteR: getQuote(state),
  sellQuoteR: getSellQuote(state),
  trades: getTrades(state),
  errors: getErrors(state),
  payment: getPayment(state),
  jumioStatus: getJumioStatus(state),
  orderState: path(['sfoxSignup', 'sfoxBusy'], state),
  siftScienceEnabled: path(['sfoxSignup', 'siftScienceEnabled'], state)
})

const mapDispatchToProps = dispatch => ({
  modalActions: bindActionCreators(actions.modals, dispatch),
  sfoxActions: bindActionCreators(actions.modules.sfox, dispatch),
  sfoxDataActions: bindActionCreators(actions.core.data.sfox, dispatch),
  sendBtcActions: bindActionCreators(actions.components.sendBtc, dispatch),
  formActions: bindActionCreators(actions.form, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(SfoxCheckout)
