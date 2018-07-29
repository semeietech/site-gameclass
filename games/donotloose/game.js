const drawScore = function(valor){
  draw('score',valor)
}
const drawLevel = function(valor){
  draw('level',valor)
}
//
const { combine, traceStraigthLine, collider, draw } = composerFactory('combine','traceStraigthLine', 'collider','draw')
const screen = screenFactory(20, 10)
const controls = controlsFactory(
  {
    name: 'rotate',
    type: 'keydown',
    key: 'space',
  },
  {
    name: 'start',
    type: 'keydown',
    key: 'enter',
  },
  {
    name: 'up',
    type: 'keydown',
    key: 'up',
  },
  {
  name: 'down',
  type: 'keydown',
  key: 'down',
 },
  {
  name: 'left',
  type:'keydown',
  key:'left'
 },
  {
  name: 'right',
  type:'keydown',
   key:'right'
  }
)
// logica 
const square = {
    shape: [
      [1,1],
      [1,1],
    ],
    anchor: [0, 0],
  }
const ship = {
    shape: [
      [0,1,0],
      [1,1,1],
      [1,0,1]
    ],
    anchor: [0, 1],
  }
const shoot = {
  shape:[
   [1]
  ],
  anchor:[0, 0],
}
function removeNil(...values) {
  console.log({values, filter: values.filter((value) => !!value ? true : false)})
  return values.filter((value) => !!value ? true : false)
}
function starshipGame(
   screen,
   combine,
   controls,
   collider,
   ship, 
   enemie,
   shoot,
   score,
   level,
   
 ) {
  this.updated_score = score || 0
  this.updated_level = level || 0
  this.disparo
  this.acertou
  this.bateu
  this.d_line
  this.d_column
  this.firstline
  this.step = 0
  this.multiple = 10
  drawLevel(this.updated_level)
  drawScore(this.updated_score)
  
  this.column_pos = 5
  this.line_pos = 16
  this.posy = (Math.random() * 9)
  this.posx = (0)
  const nivel = () => {
    if(this.updated_score % 50 === 0) {
      this.updated_level = this.updated_level + 1;
      this.multiple = this.multiple - 1
   }
  }
  controls.rotate(() => {
    console.log('ROTATE')
    if(!this.disparo){
      this.d_line = this.line_pos
    this.d_column = this.column_pos
    this.disparo = true
    }
    
  })
  controls.up(() => {
    if(this.line_pos > 13){
      this.line_pos = this.line_pos - 1}
  })
  controls.down(() => {
    console.log('DOWN')
   if(this.line_pos < 18){this.line_pos = this.line_pos + 1}
  })
  controls.left(() => { 
    console.log('LEFT')
    if (this.column_pos > 1) {
      this.column_pos = this.column_pos - 1}
  })
  controls.right(() => {
    if(this.column_pos < 8){ this.column_pos = this.column_pos + 1}
  })
  const isEnd = (player, enemie) => {
   if(collider(
     player,
     enemie) || this.posx > 19){
     bateu = true
     Object.assign(this, starshipGame(
       screen,
       combine,
       controls,
       collider,
       ship, 
       enemie,
       shoot))
   } else {
     this.bateu = false
   }
   
 }

const enemieAttack = () => {
  if(this.step % this.multiple === 0) {
    if(this.posx < 19 && this.bateu === false) {
    this.posx = this.posx + 2
  }
   if(this.posx > 19) this.updated_score = 0 
  }
  
 }
  //setInterval(enemieAttack, 1000)
  const fire = (target) => {
       if (this.d_line < 2) {
         this.disparo = false
       }
       if(collider(
         [shoot, [this.d_line = this.d_line - 1, this.d_column]]
         ,target)) {
         this.acertou = true
         this.disparo = false
         nivel()
       }
  
    return [shoot, [this.d_line = this.d_line - 1, this.d_column]]
  } 
  const inimigo = () => {
      if(this.acertou){
          this.acertou = false
          this.posy = (Math.random() * 9)
          this.posx = 0
        this.updated_score = this.updated_score + 10
      } else {
        return [enemie, [this.posx, this.posy]]
        
      }
  }
 
  
  return {
    draw: () => {
      drawScore(this.updated_score)
      drawLevel(this.updated_level)
      enemieAttack()
      ++this.step
      console.log(this.step)
      isEnd(
        [ship, [this.line_pos, this.column_pos]],
        inimigo()
      )
      return screen(combine(...removeNil(
        [ship, [this.line_pos,this.column_pos]],
        inimigo(),
        (this.disparo &&
         fire([enemie, [this.posx, this.posy]])
        ) 
      )
      ))
    } ,
  }
}
const game = starshipGame(screen, combine, controls, collider, ship, square, shoot )
setInterval(function() {
    game.draw()
}, 50) 

