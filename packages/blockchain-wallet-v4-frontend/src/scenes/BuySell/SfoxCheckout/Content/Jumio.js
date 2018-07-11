import React from 'react'
import styled from 'styled-components'
import { path } from 'ramda'
import { connect } from 'react-redux'
import { actions } from 'data'
import { bindActionCreators } from 'redux'

const JumioContainer = styled.div`
  width: 100%;
  height: 100%;
`
const JumioIFrame = styled.iframe`
  width: 90%;
  height: 500px;
`

class Jumio extends React.Component {
  constructor (props) {
    super(props)

    this.state = { enabled: false }
  }

  componentDidMount () {
    console.log('kick off startEnhancedVerification')
    this.props.sfoxDataActions.startEnhancedVerification()
  }

  render () {
    console.log('v4 JUMIO', this.props)
    return (
      <JumioContainer>
        <JumioIFrame
          src='http://localhost:8081/wallet-helper/jumio/#/key/123456'
          sandbox='allow-same-origin allow-scripts allow-forms allow-popups'
          scrolling='no'
          id='jumio'
        />
      </JumioContainer>
    )
  }
}

const mapStateToProps = state => ({
  options: path(['walletOptionsPath', 'domains', 'walletHelper'], state)
})

const mapDispatchToProps = dispatch => ({
  sfoxDataActions: bindActionCreators(actions.core.data.sfox, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(Jumio)
