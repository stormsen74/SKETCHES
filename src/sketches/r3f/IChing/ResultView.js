import styled from 'styled-components'
import { Button } from './styles.js'
import { useEffect, useState } from 'react'
import { TRIGRAM } from './trigram.js'
import { HEXAGRAM } from './hexagram.js'

const ResultWrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  //text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  opacity: ${props => (props.show ? 1 : 0)};
  flex-direction: column;
  transition: opacity 0.4s ease-in;
`

const ResultNow = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  //border: 1px solid red;
`

const Sign = styled.div`
  font-size: 60px;
  font-weight: bold;
`

const Meaning = styled.div`
  font-size: 25px;
`

const Hexagram = styled.div`
  font-size: 150px;
  line-height: 165px;
`

const Divider = styled.div`
  width: 100%;
  height: 0.5px;
  background-color: black;
`
const TrigramWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const Trigram = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-top: 20px;
`

const TrigramText = styled.div`
  font-size: 14px;
`

const TrigramSign = styled.div`
  font-size: 30px;
`

const TrigramMeaning = styled.div`
  font-size: 16px;
  font-weight: bold;
`

export const ResultButton = styled.div`
  position: relative;
  text-align: center;
  text-transform: uppercase;
  background-color: #dddddd;
  padding: 5px 10px;
  margin: 25px 5px 10px 5px;
  color: #1d1d1d;
  pointer-events: ${props => (props.disabled ? 'none' : 'all')};
  cursor: pointer;
  border-radius: 3px;
  border: 1px solid #1d1d1d;
  opacity: ${props => (props.disabled ? 0.4 : 1)};
`

const defaultHexagram = {
  sequence: '110000',
  number: 19,
  meaning_de: 'Die Annäherung',
  sign: '臨',
  unicode: '䷒',
}

const defaultTrigram = {
  sequence: '110',
  id: 8,
  meaning_de: 'See',
  sign: '澤',
  unicode: '☱',
}

// https://tarotsmith.com/symbolism/iching/scriptures1to8/
// http://www2.unipr.it/~deyoung/I_Ching_Wilhelm_Translation.html#1

export default function ResultView({ show, hexagramLines, handleRestart }) {
  const [hexagram, setHexagram] = useState(defaultHexagram)
  const [hexagramCorresponding, setHexagramCorresponding] = useState(null)
  const [trigramTop, setTrigramTop] = useState(defaultTrigram)
  const [trigramBottom, setTrigramBottom] = useState(defaultTrigram)
  const [trigramTopCorresponding, setTrigramTopCorresponding] = useState(defaultTrigram)
  const [trigramBottomCorresponding, setTrigramBottomCorresponding] = useState(defaultTrigram)
  const [hasCorresponding, setHasCorresponding] = useState(false)
  const [showCorresponding, setShowCorresponding] = useState(false)

  const evaluateResult = () => {
    let sequence = ''
    let sequenceCorresponding = ''
    let trigramBottom = ''
    let trigramTop = ''
    let trigramBottomCorresponding = ''
    let trigramTopCorresponding = ''

    for (let i = 0; i < hexagramLines.length; i++) {
      const value = hexagramLines[i].value
      const changing = hexagramLines[i].changing
      sequence += value
      sequenceCorresponding += !changing ? value : value === 1 ? 0 : 1

      if (i <= 2) {
        trigramBottom += value
        trigramBottomCorresponding += !changing ? value : value === 1 ? 0 : 1
      } else if (i > 2) {
        trigramTop += value
        trigramTopCorresponding += !changing ? value : value === 1 ? 0 : 1
      }
    }

    setHasCorresponding(sequence !== sequenceCorresponding)
    const result = HEXAGRAM.find(o => o.sequence === sequence)
    const resultCorresponding = HEXAGRAM.find(o => o.sequence === sequenceCorresponding)
    setHexagram(result)
    setHexagramCorresponding(resultCorresponding)

    const resultTrigramBottom = TRIGRAM.find(o => o.sequence === trigramBottom)
    const resultTrigramTop = TRIGRAM.find(o => o.sequence === trigramTop)
    const resultTrigramBottomCorresponding = TRIGRAM.find(o => o.sequence === trigramBottomCorresponding)
    const resultTrigramTopCorresponding = TRIGRAM.find(o => o.sequence === trigramTopCorresponding)
    setTrigramBottom(resultTrigramBottom)
    setTrigramTop(resultTrigramTop)
    setTrigramBottomCorresponding(resultTrigramBottomCorresponding)
    setTrigramTopCorresponding(resultTrigramTopCorresponding)
  }

  useEffect(() => {
    hexagramLines && hexagramLines.length === 6 && evaluateResult()
  }, [hexagramLines])

  return (
    <ResultWrapper show={+show}>
      {!showCorresponding && (
        <ResultNow>
          <Sign> {hexagram?.sign}</Sign>
          <Meaning>
            <span>{hexagram?.number + '. '}</span>
            {hexagram?.meaning_de}
          </Meaning>
          <Hexagram>{hexagram?.unicode}</Hexagram>
          <Divider />
          <TrigramWrapper>
            <Trigram>
              <TrigramText>top</TrigramText>
              <TrigramSign>{trigramTop?.unicode}</TrigramSign>
              <TrigramMeaning>{trigramTop?.meaning_de}</TrigramMeaning>
            </Trigram>
            <Trigram>
              <TrigramText>bottom</TrigramText>
              <TrigramSign>{trigramBottom?.unicode}</TrigramSign>
              <TrigramMeaning>{trigramBottom?.meaning_de}</TrigramMeaning>
            </Trigram>
          </TrigramWrapper>
        </ResultNow>
      )}
      {showCorresponding && (
        <ResultNow>
          <Sign> {hexagramCorresponding?.sign}</Sign>
          <Meaning>
            <span>{hexagramCorresponding?.number + '. '}</span>
            {hexagramCorresponding?.meaning_de}
          </Meaning>
          <Hexagram>{hexagramCorresponding?.unicode}</Hexagram>
          <Divider />
          <TrigramWrapper>
            <Trigram>
              <TrigramText>top</TrigramText>
              <TrigramSign>{trigramTopCorresponding?.unicode}</TrigramSign>
              <TrigramMeaning>{trigramTopCorresponding?.meaning_de}</TrigramMeaning>
            </Trigram>
            <Trigram>
              <TrigramText>bottom</TrigramText>
              <TrigramSign>{trigramBottomCorresponding?.unicode}</TrigramSign>
              <TrigramMeaning>{trigramBottomCorresponding?.meaning_de}</TrigramMeaning>
            </Trigram>
          </TrigramWrapper>
        </ResultNow>
      )}
      {hasCorresponding && (
        <ResultButton
          onClick={() => {
            setShowCorresponding(!showCorresponding)
          }}
        >
          {!showCorresponding ? 'show related' : 'show original'}
        </ResultButton>
      )}
      <Button style={{ position: 'absolute', bottom: 0 }} onClick={handleRestart}>
        restart
      </Button>
    </ResultWrapper>
  )
}
