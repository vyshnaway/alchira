import FN from "./parse.js";

console.log(
  FN.CSSBulkScanner([
    // {
    //   stamp: "$",
    //   filePath: "filePath",
    //   metaFront: "metaFront",
    //   content: `
    // .font-display { font-family: 'Display-Font'; font-weight: 700; }
    // .font-heading { font-family: 'Heading-Font'; font-weight: 500; }
    // .font-heading-bold { font-family: 'Heading-Font'; font-weight: 900; }
    // .font-body { font-family: 'Body-Font'; font-weight: 400; }
    // .font-caption { font-family: 'Caption-Font'; font-weight: 300; }
    // .font-button { font-family: 'Button-Font'; font-weight: 600; }
    // .font-link { font-family: 'Link-Font'; font-weight: 500; }
    // .font-monospace { font-family: 'Monospace-Font'; font-weight: 400; }

    // .f-bold { font-weight: 700;}
    // .f-italic { font-style: italic;}
    // .f-underline { text-decoration: underline;}
    // .f-uppercase { text-transform: uppercase;}
    // .f-lowercase { text-transform: lowercase;}
    // .f-capitalize { text-transform: capitalize;}

    // font-family: 'Display-Font';
    // src: url('https://fonts.gstatic.com/s/robotoflex/v28/WAey_0cCgjNeHW6pW66nwa9r3wRzp02x.woff2') format('woff2'),
    //     url('https://fonts.gstatic.com/s/robotoflex/v28/WAey_0cCgjNeHW6pW66nwa9r3wRzp02x.woff') format('woff');
    // font-weight: 700;
    // font-style: normal;
    // font-display: swap;

    // @font-face {
    //     font-family: 'Heading-Font';
    //     src: url('https://fonts.gstatic.com/s/robotoflex/v28/WAey_0cCgjNeHW6pW66nwa9r3wRzp02x.woff2') format('woff2'),
    //         url('https://fonts.gstatic.com/s/robotoflex/v28/WAey_0cCgjNeHW6pW66nwa9r3wRzp02x.woff') format('woff');
    //     font-weight: 500;
    //     font-style: normal;
    //     font-display: swap;
    // }
    // `,
    // },
  ]),
);
