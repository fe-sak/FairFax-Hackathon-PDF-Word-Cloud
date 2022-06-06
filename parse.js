import fs from 'fs';
import PDFParser from 'pdf2json';
import 'dotenv/config';
import blackList from './blackListedWords.js';

const pdfParser = new PDFParser(this, 1);

pdfParser.on('pdfParser_dataError', (errData) => console.error(errData.parserError));

pdfParser.on('pdfParser_dataReady', (pdfData) => {
  const rawTXT = pdfParser.getRawTextContent();
  fs.writeFileSync('./parsed/raw.txt', rawTXT);

  const words = rawTXT.split(' ');
  const filteredWords = words.filter((word) => word.length > 3);

  const wordCount = {};
  for (const word of filteredWords) {
    if (wordCount[word]) {
      wordCount[word] = wordCount[word] + 1;
    } else wordCount[word] = 1;
  }

  const sortable = [];
  for (const word in wordCount) {
    sortable.push([word, wordCount[word]]);
  }

  const filtered = sortable.filter(
    (wordCount) =>
      blackList.find(
        (blackListed) => wordCount[0].toLocaleLowerCase().indexOf(blackListed.toLocaleLowerCase()) !== -1
      ) === undefined
  );

  filtered.sort(function (a, b) {
    return b[1] - a[1];
  });

  const firstHundred = filtered.slice(0, 99);

  fs.writeFileSync('./parsed/wordCloud.txt', JSON.stringify(firstHundred));
});

pdfParser.loadPDF(process.env.PDF_PATH);
