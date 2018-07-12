import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions } from 'data'
import { getData } from './selectors'
import Failure from 'components/BuySell/Failure'
import Success from './template.success'

class JumioContainer extends Component {
  constructor (props) {
    super(props)

    this.state = {}
    this.initJumio = this.initJumio.bind(this)
    this.getJumio = this.getJumio.bind(this)
  }

  componentWillUnmount () {
    this.props.sfoxActions.getJumio()
  }

  initJumio () {
    this.props.sfoxActions.initializeJumio()
  }

  getJumio () {
    this.props.sfoxActions.getJumio()
  }

  render () {
    const { data } = this.props

    return data.cata({
      Success: (value) => <Success {...value} initJumio={this.initJumio} getJumio={this.getJumio} />,
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
  sfoxActions: bindActionCreators(actions.modules.sfox, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(JumioContainer)
