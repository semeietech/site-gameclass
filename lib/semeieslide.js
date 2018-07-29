function semeieSlide({ CANVAS, NEXT, PREV }, idSlide, config) { 
    // controle da posição atual
    var index = 0;
    
    // htmls strings
    var htmlSlider = {
      buttons: {
        [PREV]: `<button id="${PREV}"> < </button>`,
        [NEXT]: `<button id="${NEXT}"> > </button>`,
      },
      [CANVAS]: `<div id="${CANVAS}">NOSSO CANVAS</div>`,
      templates: [
        {
          type: "imageAndHeader",
          render: ({
            imgUrl,
            title,
            shortText,
            longText,
          }) => `
            <div id="${this.type}">
              ${getIMG(imgUrl)}
              <span class="slider-span-text">
                <h1>${title}</h1>
                <p>${shortText}</p>
              </span>
            </div>
         `
        }
      ]
      
    };
    
    // helpers functions
    function writeSlide(slide) {
      /*
      essa função entende os tipos de slides que inserimos
      no sliderConfig, atualmente podemos usar
      o tipo html e imagem.
      */
      switch(slide.type){
        case 'image':
          return getIMG(slide.data)
        case 0:
        case 'imageAndHeader':
          return htmlSlider.templates[0].render(slide.data)
        default:
          return slide.data;
      }
    };
    function writeOn(element) {
      /*
      Essa função é bem simples recebe um elemento
      na primeira invocao, e na segunda invocao recebe
      a string e se é um texto e dai usa nossos amigos
      innerText e innerHtml
      */
      return (string, isText) => {
        if (isText) {
          return element.innerText = string;
        }
        return element.innerHTML = string;
      };
    };
    function getIMG(imgUrl) {
      /*
      essa funcao apenas insere a url da imagem
      e devolve dentro de uma tag
      */
      return `<img src="${imgUrl}" />`;
    }
    function writeSliderOn(sliderCanvas, isText) {
      /*
      outra vez uma funcao invocada em duas partes,
      na primeira recebe o elemento cavnas, que vai ser
      usado nna funcao writeOn e então recebe o index
      do slide a ser escrito 
      */
      return indexOfSlider => writeOn(sliderCanvas)(
          writeSlide(config.slides[indexOfSlider]),
          isText,
        );
    }
    
    // parent element
    var slideSection = document.getElementById(idSlide);
    
    // boilerplate do slider: Botoes e canvas
    writeOn(slideSection)(`
      <span class="slide-buttons">
        ${htmlSlider.buttons[PREV]}
        ${htmlSlider.buttons[NEXT]}
      </span>
        ${htmlSlider[CANVAS]}
    `);
    
    // botoes
    var prev = document.getElementById(PREV);
    var next = document.getElementById(NEXT);
    
    // canvas
    var canvas = document.getElementById(CANVAS);
    var writeSlideOnCanvas = writeSliderOn(canvas);
    
    // eventos dos botoes
    next.onclick = function(){
      /*
      Pequeno check para sabe se o slider atual é o ultimo
      se for mandamos de volta para o inicio
      */
      if(index === config.slides.length - 1){
        index = 0;
      }else{
         index = index + 1;
      }
      return writeSlideOnCanvas(index);
    };
    prev.onclick = function(){
      /*
      Pequeno check para sabe se o slider atual é o primeiro
      se for mandamos direto para o ultimo
      */
      if(index === 0){
        index = config.slides.length - 1;
      }else{
        index = index - 1;
      }
      return writeSlideOnCanvas(index);
    };
    
    // slider inicial
    return writeSlideOnCanvas(index);
  }
  