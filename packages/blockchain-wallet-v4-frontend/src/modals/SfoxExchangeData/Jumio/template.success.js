import React from 'react'
import styled from 'styled-components'

const JumioContainer = styled.div`
  width: 100%;
  height: 100%;
`
const JumioIFrame = styled.iframe`
  width: 90%;
  height: 500px;
`

const Jumio = (value) => {
  const { options, token, id } = value
  const jumioUrl = `http://localhost:8081/wallet-helper/jumio/#/key/${token}`
  console.log('jump success template', jumioUrl, value, token, options, id)
  return (
    <JumioContainer>
      <JumioIFrame
        src={jumioUrl}
        sandbox='allow-same-origin allow-scripts allow-forms allow-popups'
        scrolling='no'
        id='jumio'
      />
    </JumioContainer >
  )
}

export default Jumio
