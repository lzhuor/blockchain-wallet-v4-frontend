import React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import { Button, Text } from 'blockchain-info-components'
import { path } from 'ramda'

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`
const JumioIFrame = styled.iframe`
  width: 80%;
  height: 450px;
  border-width: 1px;
  border-style: solid;
  border-color: ${props => props.theme['gray-1']};
`
const ButtonContainer = styled.div``

const Jumio = value => {
  const { options, token, id, initJumio, getJumio } = value
  const walletHelperRoot = path(['domains', 'walletHelper'], options)
  const jumioUrl = `${walletHelperRoot}/wallet-helper/jumio/#/key/${token}`
  console.log('jumio success template', jumioUrl, value, token, id)
  return (
    <Container>
      <JumioIFrame
        src={jumioUrl}
        sandbox='allow-same-origin allow-scripts allow-forms allow-popups'
        scrolling='yes'
        id='jumio'
      />
      <ButtonContainer>
        <Button nature='primary' onClick={initJumio}>
          <Text weight={300} size='14px' color='white'>
            <FormattedMessage
              id='sfoxexchangedata.verify.jumio.startverification'
              defaultMessage='Start Verification'
            />
          </Text>
        </Button>
        <Button onClick={getJumio}>get jumio status</Button>
      </ButtonContainer>
    </Container>
  )
}

export default Jumio
