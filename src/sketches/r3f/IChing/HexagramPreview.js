import styled from 'styled-components'

const Container = styled.div`
  //width: 500px;
  position: absolute;
  //right: 0;
  //top: 0;
  transform-origin: top center;
  transform: scale(0.75);
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 20px 10px 20px;
`

const LineWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  width: 300px;
  height: 10px;
  margin: 5px 0;
  //border: 1px solid crimson;
`

const SegmentHalf = styled.div`
  width: 45%;
  height: 100%;
  background-color: ${props => (props.show ? '#000' : 'rgba(255,255,255,0.25)')};
`

const SegmentFull = styled.div`
  width: 100%;
  height: 100%;
  background-color: #000000;
`

const ChangeIndicator = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #000000;
  right: -15px;
`

function Line({ line }) {
  const yang = (line && line.value === 1) || false
  const ying = (line && line.value === 0) || false
  const changing = (line && line.changing) || false
  return (
    <LineWrapper>
      {yang ? (
        <SegmentFull />
      ) : (
        <>
          <SegmentHalf show={ying ? ying.toString() : undefined} />
          <SegmentHalf show={ying ? ying.toString() : undefined} />
        </>
      )}
      {changing && <ChangeIndicator />}
    </LineWrapper>
  )
}

export default function HexagramPreview({ hexagramLines }) {
  return (
    <Container>
      <Line line={hexagramLines[5]} />
      <Line line={hexagramLines[4]} />
      <Line line={hexagramLines[3]} />
      <Line line={hexagramLines[2]} />
      <Line line={hexagramLines[1]} />
      <Line line={hexagramLines[0]} />
    </Container>
  )
}
