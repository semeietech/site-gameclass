function screenFactory(linesNumber, colunsNumber, prefixer) {
  let frame
  const prefix = prefixer || ''
  function parseIds(frame) {
    return frame.reduce(
      (ids, line, il) => [
        ...ids,
        ...line.reduce(
          (ids, col, ic) => col ? [...ids,  '#' + prefix + 'l' + il + 'p' + ic ] : ids,
          '',
        ),
      ],
      [],
    ).join(', ')
  }

  function queryPixels(parsedIds) {
    return document.querySelectorAll(parsedIds)
  }

  function writePixel(pixel) {
    return (pixel.style.opacity = 1, pixel)
  }
  
  function erasePixel(pixel) {
    return (pixel.style.opacity = null, pixel)
  }
  
  function renderHTML() {
    const pixel = id => `<div class="pixel" id="${id}"></div>`;
    const linha = id => child => `<div class="linha" id="${id}">${child}</div>`;
    return true
  }
  
  function write() {
     const ids = parseIds(frame)
     const pixels = queryPixels(ids);
        pixels.forEach(writePixel);
     return '200'
   }
  
  function erase() {
     const ids = parseIds(frame);
     const pixels = queryPixels(ids);
        pixels.forEach(erasePixel);
     return '200';
   }
  
  function unmount(id) {
    return document.getElementById(id).innerHtml(renderHTML())
  }
  
  function mount(id) {
    return document.getElementById(id).innerHtml(renderHTML())
  }
  
  function display(frames, idForRemount, keepBoth) {
     if (idForRemount) {
       if (!keepBoth) {
         unmount()
       }
       mount(idForRemount)
     }

     if (frame) {
      erase();
     }
     frame = frames;
     return write();
   }
    
  return display
}

function composerFactory(...tools) {
  function removeNil(...values) {
    return values.filter((value) => !!value ? true : false)
  }
  function traceLines(grid, linePos) {
    if (grid.length < linePos) {
      return traceLines([...grid, []], linePos)
    }
    return grid
  }
  function traceColuns(line, colunPos) {
    if (line.length < colunPos) {
      return traceColuns([...line, 0], colunPos)
    }
    return line
  }
  function traceStraigthLine([lineOrigin, colunOrigin], [lineDest, colunDest]) {
    function trace(destination, isDiagonal, array) {
        const lines = array || []
        function traceColun(dest, coluns){
          const line = [
            ...(coluns || []), 
            isDiagonal ? 
              lines.length === (coluns || []).length ? 1 : 0 :
              1
    ]

          if (line.length < dest) {
            return traceColun(dest, line)
          }
          return line
        }
        const grid = [...lines, traceColun(destination[1])]
        return grid.length < destination[0] ?
          trace(destination, isDiagonal, grid) :
          grid
    }
    const relativeDest = [
      lineDest - lineOrigin,
      colunDest - colunOrigin,
    ]
    
    const isDiagonal = relativeDest[0] === relativeDest[1]
    console.log({ isDiagonal, relativeDest })
    return trace(relativeDest, isDiagonal)
  }
  function rotate(piece, degrees) {
    const diff = piece.shape[0].length - piece.shape.length
    function exchangeLinesAndColuns(shape, degrees){
      function reverseArr(input) {
          var ret = new Array();
          for(var i = input.length-1; i >= 0; i--) {
              ret.push(input[i]);
          }
          return ret;
      }
      function rotate90(shape, reverse) {
        return (reverse ? reverseArr(shape) : shape).reduce(
          (lines, line) => {
            line.forEach((colun, index) => {
              if(lines[index] && lines[index].length) {
                lines[index].push(colun)
              } else {
                lines[index] = [colun]
              }
            })
           return lines
          }, [])
      }
       if (degrees === 180) {
         return reverseArr(shape)
       }
       if (degrees === -90){
          return rotate90(shape)
        
        }
       if (degrees === 90) {
          return rotate90(shape, true)
        }
       return shape
    }
    function getNewAnchorPoint([line, collumn], degrees) {
      if (diff && degrees === (90 || -90)) {
          return [
            collumn,
            line
          ]
      }
      return [line, collumn]
    }
    return {
      shape: exchangeLinesAndColuns(piece.shape, degrees),
      anchor: getNewAnchorPoint(piece.anchor, degrees)
    }
    
  }
  function combine(...pieces) {
    function getRelativePosition(piece) {
      const [{ anchor }, position] = piece
      const [linePos, colunPos] = position
      const [anchorLine, anchorColun] = anchor
      const lineRelative = parseInt(linePos) - parseInt(anchorLine)
      const colunRelative = parseInt(colunPos) - parseInt(anchorColun)
      return [lineRelative, colunRelative]
    }
    function mergeColuns(gridColuns, shapeColuns) {
      if (gridColuns.length > shapeColuns.length){
         return gridColuns.reduce(
        (coluns, gridColun, index) =>  gridColun ? [...coluns, gridColun] :
        shapeColuns[index] ? [...coluns, shapeColuns[index]] : [...coluns, 0],
        [],
      )
      }
      return shapeColuns.reduce(
        (coluns, shapeColun, index) =>  shapeColun ? [...coluns, shapeColun] :
        gridColuns[index] ? [...coluns, gridColuns[index]] : [...coluns, 0],
        [],
      )
    }
    function mergeLine(lineGrid, lineShape, colPos){
      const untouchedColuns = lineGrid.slice(0, colPos)
      const touchedColuns = lineGrid.slice(colPos)
      const lineMerged = [
        ...untouchedColuns,
        ...mergeColuns(touchedColuns, lineShape)
      ]
      return lineMerged
    }
    function merge(grid, shape, [linePos, colunPos], index) {
      const indexLine = index || 0
      const relativeLine = parseInt(linePos) + parseInt(indexLine)
      const lineToMerge = grid[relativeLine] || []
      const beforeLines = grid.slice(0, relativeLine)

      const linesAfter = grid.slice(relativeLine + 1)
      const mergedGrid = [
        ...beforeLines,
        mergeLine(traceColuns(lineToMerge, colunPos), shape[indexLine], colunPos),
        ...linesAfter

      ]
      if (indexLine < shape.length - 1) {  
          return merge(mergedGrid, shape, [linePos, colunPos], (indexLine + 1))
      }
      return mergedGrid // startTracing colun
    }
    function placePieceOnGrid(grid, piece) {
      const relativePos = getRelativePosition(piece)
      return merge(
        traceLines(grid, relativePos[0]),// line position
        piece[0].shape, // shape
        relativePos,
      )
    }
    return pieces.reduce(placePieceOnGrid, [])
  }
  function collider(...pieces) {
    function getValueFromShape(acc, shape) {
      return shape.reduce(
          (lineAcc, line) => line.reduce((bitAcc, bit) => bitAcc + (bit || 0), lineAcc),
        acc,
      )
    }
    const collidedShape = getValueFromShape(0, combine(...pieces))
    const sumShape = pieces.map(([{shape}]) => shape).reduce(getValueFromShape, 0)
    return collidedShape < sumShape
  }
  function raytrace(complexCoast, { origin, direction, distance }) {
    // create piece collider
    function parseDiretion(value){
      if (typeof value !== 'number') {
        switch(value) {
          case 'N':
            return 0
          case 'NL':
          case 'NE':
            return 1
          case 'L':
            return 2
          case 'LS':
          case 'SE':
            return 3
          case 'S':
            return 4
          case 'SO':
            return 5
          case 'O':
            return 6
          case 'NO':
          case 'ON':
            return 7
          default:
            throw Error('Invalid Direction')
        }
      }
      return value
    }
    function buildLine([line, colun], parsedDirection, distance, coast) {
      function calcLength(parsedDirection, distance, complexCoast) {
        if (parsedDirection % 2 === 0) {
          return distance
        }
        return (distance / (complexCoast || 1))
      }
      function getDestination([line, colun], parsedDirection, length) {
        function parseLine(line, direction, length) {
          return direction === (6 || 2) ?
            line :
            direction === (1 || 7 || 0) ?
              line - length :
              line + length
        }
        function parseColun(colun, direction, length) {
          return direction === (0 || 4) ?
            colun :
            direction === (5 || 6 || 7) ?
              colun - length :
              colun + length
        }

        return [
          parseLine(line, parsedDirection, length),
          parseColun(colun, parsedDirection, length),
        ]
      }
      const length = calcLength(parsedDirection, distance, complexCoast)
      const destination = getDestination([line, colun], parsedDirection, length)
      const shape = traceStraigthLine([line, colun], destination)
      return {
        shape,
        anchor: [0, 0]
      }
    }
    const lineTraced = buildLine(origin, parseDiretion(direction), distance, complexCoast)
    return (...pieces) => collider(...pieces, [lineTraced, origin])
  }
  function draw(classname, value){
    document.querySelector(`.${classname}`).innerText=value
  }
  const composerTools = {
    traceLines,
    traceColuns,
    traceStraigthLine,
    combine,
    collider,
    rotate,
    raytrace,
    draw,
    removeNil,
  }
  return tools.reduce((obj, key) => Object.assign(obj, {
      [key.alias || key]:composerTools[key.source || key],
    }), {})
}

function controlsFactory(...configs) {
  const KEYS = {
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    space: 32,
    enter: 13,
    esc: 27,
  }
  
  function addListner(type) {
    return (handler) => window.addEventListener(type, handler, false)
  }
  
  function removeListner(type) {
    return (handler) => window.removeEventListener(type, handler, false)
  }
  
  function keyEvent(key) {
    return (fn) => (console.log('key', key, fn), (...args) => ( console.log('@k'), args[0].keyCode == key && fn(...args)) )
  }
  
  const events = configs.reduce((evts, {name, type, key}) => Object.assign({
    [name]: {
      type,
      handler: keyEvent(KEYS[key])
    }
  }, evts), {})
  console.log('evnts', events)
  return Object.assign(
    {
      remove: (name, fn) => removeListner(events[name].type)(events[name].handler(fn)),
      add: (name, fn) => addListner(events[name].type)(events[name].handler(fn))
    },
    Object.keys(events).reduce(
      (alias, name) => Object.assign(
         {[name]: (fn) => addListner(events[name].type)(events[name].handler(fn))},
         alias,
      ),
    {},
   ),
  )
  // gestures
  // screen buttons
}