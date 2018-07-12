import React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import { Button, HeartbeatLoader, Link, Text } from 'blockchain-info-components'
import { Remote } from 'blockchain-wallet-v4/src'
import { prop } from 'ramda'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px 10px;
  border: ${props => `1px solid ${props.theme['gray-1']}`}
`

const JumioStatus = ({ status }) => {
  return (
    <Container>
      jumio status: {status}
    </Container>
  )
}

export default JumioStatus
