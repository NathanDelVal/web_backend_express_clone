const Canvas = require("canvas");

const { degrees, PDFDocument, rgb, StandardFonts } = require("pdf-lib");

module.exports = {
  async imageToPdf(pdfBuffer) {
    const img = new Canvas.Image();
    img.src = pdfBuffer;
    console.log("!!!!!!!!!!!!! ", img.width, img.height, "pdf");
    const canvas = Canvas.createCanvas(img.width, img.height, "pdf");
    const context = canvas.getContext("2d");
    context.drawImage(img, 0, 0, img.width, img.height);
    return canvas.toBuffer();
  },

  async modifyPdf(PDFBuffer, ImageBuffer) {
    var pdfDoc = null;
    
    if (!PDFBuffer) {
      // Create a new PDFDocument
      pdfDoc = await PDFDocument.create();
      // Add a blank page to the document
      //page = pdfDoc.addPage([550, 750]);
      pdfDoc.addPage([550, 750]);
      //await pdfDoc.save()
    }

    if (PDFBuffer) {
      // PDFBuffer = An existing PDF document
      // Load a PDFDocument from the existing PDF bytes
      pdfDoc = await PDFDocument.load(PDFBuffer);
    }

    // Embed the Helvetica font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Get the first page of the document
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    console.log("pages ->>>>", pages);
    console.log("lastpage ->", pages[pages]);
    //const lastPage = pages[pages];

    // ImageBuffer = JPEG image
    const jpgImage = await pdfDoc.embedJpg(ImageBuffer);
    const jpgDims = jpgImage.scale(0.25);

    // Get the width and height of the first page
    const { width, height } = firstPage.getSize();
    /*  
   firstPage.drawText('This text was added with JavaScript!', {
       x: 5,
       y: height / 2 + 300,
       size: 50,
       font: helveticaFont,
       color: rgb(0.95, 0.1, 0.1),
       rotate: degrees(-45),
     }); 
     */

    // Add a blank page to the document

    firstPage.drawImage(jpgImage, {
      x: firstPage.getWidth() / 2 - jpgDims.width / 2,
      y: firstPage.getHeight() / 2 - jpgDims.height / 2,
      width: jpgDims.width,
      height: jpgDims.height,
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // Trigger the browser to download the PDF document
    download(pdfBytes, "pdf-lib_modification_example.pdf", "application/pdf");
  },
};
