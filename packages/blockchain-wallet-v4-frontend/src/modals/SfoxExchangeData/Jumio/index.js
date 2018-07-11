import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions } from 'data'
import { getData } from './selectors'
import Failure from 'components/BuySell/Failure'

class JumioContainer extends Component {
  constructor (props) {
    super(props)

    this.state = {}
  }

  render () {
    const { data } = this.props

    return data.cata({
      Success: (value) => <div>Jumio Component</div>,
      Failure: (msg) => <Failure error={msg} />,
      Loading: () => <div>Loading...</div>,
      NotAsked: () => <div />
    })
  }
}

const mapStateToProps = (state) => ({
  data: getData(state)
})

const mapDispatchToProps = (dispatch) => ({
  formActions: bindActionCreators(actions.form, dispatch),
  sfoxFrontendActions: bindActionCreators(actions.modules.sfox, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(JumioContainer)
