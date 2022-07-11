import { useEffect, useState } from "react"
import useInterval from "use-interval";

type BoardType = {
  boardSize: number
  blockSize: number
  aceleration: number
}

type PointType = {
  x: number
  y: number
}

type FruitType = {
  x: number
  y: number
  correct: boolean
}
const Board = () => {
  const boardSize = 25;
  const blockSize = 20;
  const aceleration = 3;

  return (
  <div className="bg-white shadow-2xl shadow-black rounded-sm" style={{ 
    width: `${blockSize*boardSize}px`,
    height: `${blockSize*boardSize}px`,
    backgroundImage: `linear-gradient(45deg, #EEE 25%, transparent 25%), linear-gradient(-45deg, #EEE 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #EEE 75%), linear-gradient(-45deg, transparent 75%, #EEE 75%)`,
    backgroundSize: `${blockSize*2}px ${blockSize*2}px`,
    backgroundPosition: `0 0, 0 ${blockSize}px, ${blockSize}px -${blockSize}px, -${blockSize}px 0px`,
  }}>
    <Snake boardSize={boardSize} blockSize={blockSize} aceleration={aceleration}></Snake>
  </div>
  )
}

let direction = 'right';
const setDirection = (newDirection: string) => {
  direction = newDirection;
}
let isPlaying = true;
const setIsPlaying = (newIsPlaying: boolean) => {
  isPlaying = newIsPlaying;
}
const toggleIsPlaying = () => {
  isPlaying = !isPlaying;
}

const Snake = (props:BoardType) => {
  const snakeInitialValue = [{
    x: 3,
    y: Math.floor(props.boardSize/2),
  },{
    x: 2,
    y: Math.floor(props.boardSize/2),
  },{
    x: 1,
    y: Math.floor(props.boardSize/2),
  },{
    x: 0,
    y: Math.floor(props.boardSize/2),
  }]

  const [snake, setSnake] = useState<PointType[]>([...snakeInitialValue])
  const [walls, setWalls] = useState<PointType[]>([])
  const [fruits, setFruits] = useState<FruitType[]>([])
  const [speed, setSpeed] = useState<number>(1)
  const [score, setScore] = useState<number>(0)
  const [record, setRecord] = useState<number>(0)

  const handleKey = (e:KeyboardEvent) => {
    const key = e.key;

    switch (key) {
      case 'ArrowLeft':
        if (direction === 'right') break
        if (direction === 'left') {
          moveSnake()
        }
        setDirection('left')
        break;
      case 'ArrowRight':
        if (direction === 'left') break
        if (direction === 'right') {
          moveSnake()
        }
        setDirection('right')
        break;
      case 'ArrowUp':
        if (direction === 'down') break
        if (direction === 'up') {
          moveSnake()
        }
        setDirection('up') 
        break;
      case 'ArrowDown':
        if (direction === 'up') break
        if (direction === 'down') {
          moveSnake()
        }
        setDirection('down')
        break;
      case ' ':
        toggleIsPlaying()
        break;
    }
  }

  const moveSnake = () => {
    if (!isPlaying) return;

    setSnake(currentSnake => {

      let x = currentSnake[0].x;
      let y = currentSnake[0].y;
  
      switch (direction) {
        case 'up':
          y = currentSnake[0].y-1 < 0 ? props.boardSize-1 : currentSnake[0].y-1;
          break;
        case 'down':
          y = currentSnake[0].y+1 >= props.boardSize ? 0 : currentSnake[0].y+1;
          break;
        case 'left':
          x = currentSnake[0].x-1 < 0 ? props.boardSize-1 : currentSnake[0].x-1;
          break;
        case 'right':
          x = currentSnake[0].x+1 >= props.boardSize ? 0 : currentSnake[0].x+1;
          break;
      }
  
      let newSnake = [...currentSnake];

      newSnake.unshift({x, y})

      // Scored
      if (newSnake.some(block => fruits.some(fruit => fruit.correct && fruit.x == block.x && fruit.y == block.y))) {
        addScore()
        setSpeed(currentSpeed => currentSpeed + 1)
        refreshFruits(score);
      } else {
        newSnake.pop()
      }

      // Game over - wrong fruit
      if ([...newSnake.slice(0, -2)].some(block => fruits.some(fruit => !fruit.correct && fruit.x == block.x && fruit.y == block.y))) {
        console.warn('Game over: wrong fruit')
        initGame();
        return [...snakeInitialValue]
      }
  
      // Game over - wall crash
      if ([...newSnake.slice(0, -2)].some(block => walls.some(wall => wall.x == block.x && wall.y == block.y))) {
        console.warn('Game over: wall crash')
        initGame();
        return [...snakeInitialValue]
      }
  
      // Game over - self crash
      if (currentSnake.some(block => block.x === x && block.y === y)) {
        console.warn('Game over: self crash')
        initGame();
        return [...snakeInitialValue]
      }
      
      return newSnake;
    })
  }

  const addScore = () => {
    setScore(currentScore => {
      const newScore = currentScore + 1;
      if (newScore % 3 === 0) setWalls(currentWalls => [...currentWalls, createWall()])
      setRecord(currentRecord => currentRecord < newScore ? newScore : currentRecord)
      return newScore
    })
  }

  const createWall = () => {
    let newWall = {x: 0, y: 0}
    const blockedAxios = snake[0]
    do {
      newWall = {
        x: Math.floor(Math.random() * (props.boardSize-1)) + 1,
        y: Math.floor(Math.random() * (props.boardSize-1)) + 1,
      }  
    } while (snake.some(block => block.x === newWall.x && block.y === newWall.y) 
      || walls.some(block => block.x === newWall.x && block.y === newWall.y) 
      || fruits.some(block => block.x === newWall.x && block.y === newWall.y) 
      || newWall.x === blockedAxios.x 
      || newWall.y === blockedAxios.y)
    return(newWall);
  }

  const createFruit = (newFruits: FruitType[]) => {
    let newFruit = {
      x: 0, 
      y: 0, 
      correct: true,
    }
    const blockedAxios = snake[0]
    do {
      newFruit = {
        x: Math.floor(Math.random() * (props.boardSize-1)) + 1,
        y: Math.floor(Math.random() * (props.boardSize-1)) + 1,
        correct: newFruits.length === 0,
      }  
    } while (snake.some(block => block.x === newFruit.x && block.y === newFruit.y) 
      || newFruits.some(block => block.x === newFruit.x && block.y === newFruit.y) 
      || walls.some(block => block.x === newFruit.x && block.y === newFruit.y) 
      || newFruit.x === blockedAxios.x 
      || newFruit.y === blockedAxios.y)
    return(newFruit);
  }

  const refreshFruits = (refScore: number) => {
    setFruits([]);

    const fruitsLength = Math.floor((refScore)/5) + 2
    let newFruits = [];

    for (let i=0; i<fruitsLength; i++) {
      const newFruit = createFruit(newFruits)
      newFruits.push(newFruit)
    }
    setFruits(newFruits);

  }

  const initGame = () => {
    setScore(0)
    setSpeed(1)
    refreshFruits(0);
    setWalls([]);
    setDirection('right')
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKey);

    refreshFruits(0);

    return () => {
      document.removeEventListener('keydown', handleKey);
    }
  }, [])

  useInterval(() => {
    moveSnake()
  }, 200-(props.aceleration*speed));

  return (
    <div className="relative">
      <div className="absolute -top-12 text-4xl text-white w-full text-center flex justify-between">
        <div>
          Score: <strong>{score}</strong>
        </div>
        <div>
          Record: <strong>{record}</strong>
        </div>
      </div>

      <div>
        {snake.map((block, i) => {
          const top = props.blockSize * block.y;
          const left = props.blockSize * block.x;
          const opacity = 1.2 - (i / (snake.length) / 100 * 100);

          return (
            <div 
              key={i}
              className={`bg-green-800 border-[1px] absolute rounded`}
              style={{top: `${top}px`, left: `${left}px`, width: `${props.blockSize}px`, height: `${props.blockSize}px`, opacity: opacity}}
            ></div>
          )
        })}
      </div>

      {fruits.map((fruit, i) => 
        <div 
          key={`fruit${i}`}
          className="absolute" 
          style={{top: `${props.blockSize * fruit.y}px`, left: `${props.blockSize * fruit.x}px`, width: `${props.blockSize}px`, height: `${props.blockSize}px`}}
        >
          {fruit.correct ? 
            <div>
              <div className="bg-green-600 rounded-full absolute animate-ping h-full w-full"></div>
              <div className="bg-green-500 rounded-full absolute h-full w-full"></div>
            </div>
          :
            <div>
              <div className="bg-red-600 rounded-full absolute animate-ping h-full w-full"></div>
              <div className="bg-red-500 rounded-full absolute h-full w-full"></div>
            </div>
          }

        </div>
      )}

      {walls.map((wall, i) => 
        <div 
          key={`wall${i}`}
          className="absolute bg-gray-700" 
          style={{top: `${props.blockSize * wall.y}px`, left: `${props.blockSize * wall.x}px`, width: `${props.blockSize}px`, height: `${props.blockSize}px`}}
        ></div>
      )}

    </div>
  )
}

export default Board
