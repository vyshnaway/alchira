import fn from "./1.atomic.js"

console.log(fn(`
    .font-display { font-family: 'Display-Font'; font-weight: 700; }
    .font-heading { font-family: 'Heading-Font'; font-weight: 500; }
    .font-heading-bold { font-family: 'Heading-Font'; font-weight: 900; }
    .font-body { font-family: 'Body-Font'; font-weight: 400; }
    .font-caption { font-family: 'Caption-Font'; font-weight: 300; }
    .font-button { font-family: 'Button-Font'; font-weight: 600; }
    .font-link { font-family: 'Link-Font'; font-weight: 500; }
    .font-monospace { font-family: 'Monospace-Font'; font-weight: 400; }

    .f-bold { font-weight: 700;}
    .f-italic { font-style: italic;}
    .f-underline { text-decoration: underline;}
    .f-uppercase { text-transform: uppercase;}
    .f-lowercase { text-transform: lowercase;}
    .f-capitalize { text-transform: capitalize;}

    .fs-1 { font-size: 1rem; }   
    .fs-2 { font-size: 2rem; }   
    .fs-3 { font-size: 3rem; }   
    .fs-4 { font-size: 4rem; }   
    .fs-5 { font-size: 5rem; }   
    .fs-6 { font-size: 6rem; }   
    .fs-8 { font-size: 8rem; }   
    .fs-10 { font-size: 10rem; } 
    .fs-12 { font-size: 12rem; } 

    .fw-normal { font-weight: normal; }
    .fw-bold { font-weight: bold; }
    .fw-100 { font-weight: 100; }
    .fw-200 { font-weight: 200; }
    .fw-300 { font-weight: 300; }
    .fw-400 { font-weight: 400; }
    .fw-500 { font-weight: 500; }
    .fw-600 { font-weight: 600; }
    .fw-700 { font-weight: 700; }
@font-face fgt {
    font-family: 'Display-Font';
    src: url('https://fonts.gstatic.com/s/robotoflex/v28/WAey_0cCgjNeHW6pW66nwa9r3wRzp02x.woff2') format('woff2'),
        url('https://fonts.gstatic.com/s/robotoflex/v28/WAey_0cCgjNeHW6pW66nwa9r3wRzp02x.woff') format('woff');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
}

/* Heading Fonts */
@font-face {
    font-family: 'Heading-Font';
    src: url('https://fonts.gstatic.com/s/robotoflex/v28/WAey_0cCgjNeHW6pW66nwa9r3wRzp02x.woff2') format('woff2'),
        url('https://fonts.gstatic.com/s/robotoflex/v28/WAey_0cCgjNeHW6pW66nwa9r3wRzp02x.woff') format('woff');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
}
`, "$", "456"))