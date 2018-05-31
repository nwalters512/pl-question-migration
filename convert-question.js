const path = require('path');
const fs = require('fs-extra');
const htmlparser = require('htmlparser2');
const domutils = require('domutils');

module.exports = async (dir) => {
  const questionPath = path.join(dir, 'question.html');
  if (!(await fs.pathExists(questionPath))) {
    console.log(`${questionPath} does not exist; skipping`);
    return;
  }

  const contents = await fs.readFile(questionPath, 'utf8');

  const dom = await new Promise((resolve, reject) => {
    const handler = new htmlparser.DomHandler((error, parsedDom) => {
      if (error) return reject(error);
      return resolve(parsedDom);
    });
    const parser = new htmlparser.Parser(handler, {
      recognizeSelfClosing: true,
    });
    parser.write(contents);
    parser.end();
  });

  await fs.writeFile(questionPath, domutils.getOuterHTML(dom));
}
