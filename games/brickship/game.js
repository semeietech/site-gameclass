const {
    combine,
    rotate,
    collider,
    draw,
    removeNil,
  } = composerFactory('combine', 'collider', 'rotate', 'draw', 'removeNil')
  const screen = screenFactory(20, 10)
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
     controls,
     collider,
  },
     ship, 
     enemie,
     shoot,
     fn, // binded function
   ) {
    
    this.updated_score = 0
    this.updated_level = 0
    this.degrees = 0
    this.step = 0
    this.multiple = 10
    this.column_pos = 5
    this.line_pos = 16
    this.posy = Math.random() * 9
    this.posx = 0
  
    const isEnd = (player, enemie) => {
     if(collider(
       player,
       enemie) || this.posx > 19){
       bateu = true
       Object.assign(this, fn(fn))// reestarting the game
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
   
    controls.shoot(() => {
      if(!this.disparo){
        this.d_line = this.line_pos
      this.d_column = this.column_pos + 1
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
      if(this.column_pos < 12){ this.column_pos = this.column_pos + 1}
    })
  
    this.draw = () => {
        drawScore(this.updated_score)
        drawLevel(this.updated_level)
        //enemieAttack()
        ++this.step
        isEnd(
          [ship, [this.line_pos, this.column_pos]],
          inimigo()
        )
        return screen(combine(...removeNil(
          [rotate(ship, this.degrees), [this.line_pos, this.column_pos]],
          inimigo(),
          (this.disparo &&
           fire([enemie, [this.posx, this.posy]])
          ) 
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
      controls,
      collider,
   },
   ship,
   square,
   shoot
  )
  
  const game = Game(Game)
  // this is the first caller of game, it is calling it-self
  
  setInterval(function() {
      game.draw()
  }, 50) 
  