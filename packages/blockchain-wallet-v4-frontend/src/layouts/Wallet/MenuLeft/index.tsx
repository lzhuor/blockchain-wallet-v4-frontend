import { bindActionCreators } from 'redux'
import { connect, ConnectedProps } from 'react-redux'
import React from 'react'

import { actions } from 'data'
import { ExtractSuccess } from 'core/types'
import { getData } from './selectors'
import Failure from './template.failure'
import Loading from './template.loading'
import MenuLeft from './template.success'

class MenuLeftContainer extends React.PureComponent<Props> {
  render () {
    const { data } = this.props

    return data.cata({
      Success: val => <MenuLeft {...val} {...this.props} />,
      Loading: () => <Loading />,
      NotAsked: () => <Loading />,
      Failure: () => <Failure />
    })
  }
}

const mapStateToProps = state => ({
  data: getData(state)
})

const mapDispatchToProps = dispatch => ({
  modalActions: bindActionCreators(actions.modals, dispatch),
  analyticsActions: bindActionCreators(actions.analytics, dispatch)
})

const connector = connect(mapStateToProps, mapDispatchToProps)

export type SuccessStateType = ExtractSuccess<ReturnType<typeof getData>>

export type Props = ConnectedProps<typeof connector>

export default connector(MenuLeftContainer)
