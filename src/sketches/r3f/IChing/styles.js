import styled, { css } from 'styled-components'

export const WrapperUI = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  pointer-events: none;
`
export const Buttons = styled.div`
  position: absolute;
  margin-bottom: 10px;
  bottom: 0;
`

const noSelect = css`
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`

export const Button = styled.div`
  position: relative;
  text-align: center;
  text-transform: uppercase;
  background-color: #181818;
  padding: 10px 15px;
  margin: 5px;
  color: gray;
  pointer-events: ${props => (props.disabled ? 'none' : 'all')};
  cursor: pointer;
  border-radius: 3px;
  border: 1px solid #c3c3c3;
  opacity: ${props => (props.disabled ? 0.4 : 1)};
  transition: all 0.3s ease-out;
  width: 200px;
  ${noSelect}
`
