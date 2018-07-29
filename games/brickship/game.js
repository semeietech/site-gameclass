const {
  combine,
  rotate,
  collider,
  draw,
  removeNil,
} = composerFactory('combine', 'collider', 'rotate', 'draw', 'removeNil')
const screen = screenFactory(20, 10)
////////
const square = {
    shape: [
      [1,1],
      [1,1],
    ],
    anchor: [0, 0],
  }
const shoot = {
  shape:[
   [1]
  ],
  anchor:[0, 0],
}
const ship = {
    shape: [
      [1,1,1],
      [1,1,1],
      [1,1,1],
      [0,1,0],
      [1,1,1],
      [1,0,1],
      [1,0,1],
    ],
    anchor: [3, 1],
  }
const ship2 = {
    shape: [
      [1,1,1],
      [1,1,1],
      [1,0,1],
    ],
    anchor: [1, 1],
  }
function starshipGame(
{// dependencies
   draw,
   removeNil,
   screen,
   combine,
   rotate,
   controlsFactory,
   collider,
},
   ship, 
   enemie,
   shoot,
   begin,
   fn, // binded function
 ) {
  const controls = controlsFactory(
  {
    name: 'shoot',
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
  name: 'right',
  type:'keydown',
  key:'right'
},
  {
  name:'left',
  type:'keydown',
  key:'left',
  
  }
)
  
  this.updated_score = 0
  this.updated_level = 0
  this.degrees = 0
  this.step = 0
  this.multiple = 10
  this.column_pos = 5
  this.line_pos = 16
  this.posy = Math.random() * 9
  this.posx = 0
  this.caixadedisparos = []

  const isEnd = (player, enemie) => {
   if(collider(
     player,
     enemie) || this.posx > 19){
     bateu = true
     Object.assign(this, fn(false, fn))// reestarting the game
   } else {
     this.bateu = false
   }
  }
  const drawScore = function(valor){
    draw('pontosatuais',valor)
  }
  const drawLevel = function(valor){
    draw('numero',valor)
  }
  const nivel = () => {
    if(this.updated_score % 50 === 0) {
      this.updated_level = this.updated_level + 1;
      this.multiple = this.multiple - 1
   }
  }
  const enemieAttack = () => {
    if (this.step % this.multiple === 0) {
      if (this.posx < 19 && this.bateu === false) {
        this.posx = this.posx + 2
      }
     if(this.posx > 19) this.updated_score = 0 
    } 
  
  }
  const getlimit = (valor) => {
    switch (this.degrees){
      case 0:
        return this.line_pos - valor
      case 180:
        return this.line_pos + valor
      case 90:
        return this.column_pos + valor
      case -90:
        return this.column_pos - valor
    }
      
  }
  const fire = (disparo, target) => {
       if(collider(
         [shoot, [this.d_line = this.d_line - 1, this.d_column]]
         ,target)) {
         this.acertou = true
         this.disparo = false
         nivel()
       }
  
    return disparo
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
  
  if (begin) {
    
  controls.shoot(() => {
    if(!this.disparo){
      this.caixadedisparos.push([
        shoot,
        [
          this.line_pos - 2,
          this.column_pos
        ],
        [
          getlimit(10),// limite
         this.degrees 
       
        ]
      ])
      this.disparo = true
    }
    
  })
  controls.up(() => {
    this.degrees = 0
    if(this.line_pos > 0){
      this.line_pos = this.line_pos - 1}
  })
  controls.down(() => {
    this.degrees = 180
   if(this.line_pos < 18){this.line_pos = this.line_pos + 1}
  })
  controls.left(() => {
    this.degrees = -90
    if (this.column_pos > 0) {
      this.column_pos = this.column_pos - 1}
  })
  controls.right(() => {
    this.degrees = 90
    if(this.column_pos < 16)
    { this.column_pos = this.column_pos + 1}
  })
  }
 

  this.draw = () => {
      drawScore(this.updated_score)
      drawLevel(this.updated_level)
      this.caixadedisparos.forEach(
          (disparo) => {
            const getnewpos = ([piece,[line,column],[limit,degree]]) => {
              switch (degree){
                case 0:
                  return [line - 1,column]
                case 180:
                  return [(line + 1),column]
                case 90:
                  return [line, (column + 1)]
                case -90:
                  return [line, column - 1]
              }
            }
            const isOutLimit = ([piece,[line,column],[limit,degree]]) => {
              switch (degree){
                case 0:
                  return line > limit
                case 180:
                  return line < limit
                case 90:
                  return column < limit
                case -90:
                  return column > limit
              }
            }
            const newPos = getnewpos(disparo)
            
            if (isOutLimit(disparo) && 
               !this.caixadedisparos.some((outroDisparo) => collider(
                   [disparo[0], newPos],
                   outroDisparo))
               ) {
              disparo[1] = newPos
            } else {
              this.disparo = false
            }
            
          }
        )
      //enemieAttack()
      ++this.step
      isEnd(
        [ship, [this.line_pos, this.column_pos]],
        inimigo()
      )
      return screen(combine(...removeNil(
        [rotate(ship, this.degrees), [this.line_pos, this.column_pos]],
        inimigo(),
        // (this.disparo &&
        //  fire([enemie, [this.posx, this.posy]])
        // ),
        ...this.caixadedisparos.map((disparo) => {
          return fire(disparo, [enemie, [this.posx, this.posy]])
          })
      )
      ))
  } 
  
  return this
}

const Game = starshipGame.bind(
  {},
  // this is the empty obj for the game
  {
    draw,
    removeNil,
    screen,
    combine,
    rotate,
    controlsFactory,
    collider,
 },
 ship,
 square,
 shoot
)

const game = Game(true, Game)
// this is the first caller of game, it is calling it-self

setInterval(function() {
    game.draw()
}, 50) 
