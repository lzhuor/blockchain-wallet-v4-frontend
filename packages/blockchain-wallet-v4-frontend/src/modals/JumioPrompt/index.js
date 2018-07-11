import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { bindActionCreators, compose } from 'redux'
import { actions } from 'data'
import modalEnhancer from 'providers/ModalEnhancer'
import { Button, Text, Modal, ModalHeader, ModalBody } from 'blockchain-info-components'
import { FormattedMessage } from 'react-intl'

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 20px;
`
const ButtonWrapper = styled.div`
  margin-right: 25px;
`

class JumioPrompt extends React.PureComponent {
  render () {
    const { close, modalActions } = this.props
    return (
      <Modal size='large' position={this.props.position} total={this.props.total}>
        <ModalHeader onClose={close}>
          <Text>
            <FormattedMessage id='modals.jumioprompt.header' defaultMessage='Speed Up Your Bitcoin Purchase' />
          </Text>
        </ModalHeader>
        <ModalBody>
          <Text weight={300}>
            <FormattedMessage id='modals.jumioprompt.body1' defaultMessage='By verifying your identity, your limit will be higher and you will get your bitcoin faster!' />
          </Text>
          <ButtonRow>
            <ButtonWrapper>
              <Button width='100px' onClick={close} nature='empty'>
                <FormattedMessage id='modals.jumioprompt.close' defaultMessage='No Thanks' />
              </Button>
            </ButtonWrapper>
            <Button width='100px' onClick={() => modalActions.showModal('SfoxExchangeData', { step: 'jumio' })} nature='primary'>
              <FormattedMessage id='modals.jumioprompt.dothat' defaultMessage="Let's do it!" />
            </Button>
          </ButtonRow>
        </ModalBody>
      </Modal>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  modalActions: bindActionCreators(actions.modals, dispatch)
})

const enhance = compose(
  modalEnhancer('JumioPrompt'),
  connect(null, mapDispatchToProps)
)

export default enhance(JumioPrompt)
