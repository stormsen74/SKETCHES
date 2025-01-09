import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

const Container = styled.div`
  position: absolute;
  display: ${({ $visible }) => ($visible ? 'flex' : 'none')};
  flex-direction: column;
  align-items: center;
  color: #f0f0f0;
  font-family: Arial, sans-serif;
  width: 100vw;
  height: 100svh;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1;
  padding-bottom: 20px;
`

const Title = styled.h1`
  font-size: 24px;
  margin: 20px;
`

const Selector = styled.div`
  display: grid;
  gap: 10px;
  width: 80%;
  max-width: 1200px;
  margin-top: 20px;

  grid-template-columns: repeat(1, 1fr);

  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
`

const SketchButton = styled.button`
  padding: 12px;
  border-radius: 8px;
  background-color: #333;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid transparent;
  transition: box-shadow 0.3s ease, background-color 0.3s ease;

  &:hover {
    background-color: #555;
    border: 1px solid wheat;
    box-shadow: 0px 0px 4px rgba(255, 255, 255, 0.3);
  }
`

const SketchInfo = styled.span`
  font-size: 14px;
  color: #aaa;
`

const ToggleButton = styled.button`
  position: fixed;
  top: 20px;
  left: 20px;
  padding: 10px 15px;
  background-color: #333;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  z-index: 10;
  transition: transform 0.2s ease, background-color 0.3s ease;

  &:hover {
    background-color: #555;
  }

  &:active {
    transform: scale(0.95);
  }
`

export default function UILayer({ sketches, sketch, handleSelectSketch }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (sketch) {
      setVisible(false)
    }
  }, [sketch])
  const toggleVisibility = () => {
    setVisible(!visible)
  }

  return (
    <>
      <ToggleButton onClick={toggleVisibility}>{visible ? 'Hide UI' : 'Show UI'}</ToggleButton>
      <Container $visible={visible}>
        <Title>Select a Sketch</Title>
        <Selector>
          {sketches.map((item, index) => (
            // <SketchButton key={index} onClick={() => handleSelectSketch(item.component)}>
            <SketchButton
              key={index}
              onClick={() => (window.location.href = `/${item.name.replace(/\s+/g, '-').toLowerCase()}`)}
            >
              {item.name}
              <SketchInfo>({item.type})</SketchInfo>
            </SketchButton>
          ))}
        </Selector>
      </Container>
    </>
  )
}
