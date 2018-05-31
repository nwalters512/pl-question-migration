const path = require('path');
const fs = require('fs-extra');
const htmlparser = require('htmlparser2');
const domutils = require('domutils');
const domSerializer = require('dom-serializer');

const replaceTags = (node, tagMap) => {
  if (node.type === 'tag') {
    if (node.name in tagMap) {
      node.name = tagMap[node.name]
    }
  }
  if (node.children) {
    node.children = node.children.map(child => replaceTags(child, tagMap));
  }
  return node;
}

module.exports = async (dir, tagMap) => {
  const questionPath = path.join(dir, 'question.html');
  if (!(await fs.pathExists(questionPath))) {
    console.log(`Skipping ${dir}`);
    return;
  }

  const contents = await fs.readFile(questionPath, 'utf8');

  let dom = await new Promise((resolve, reject) => {
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

  if (tagMap) {
    dom = dom.map(node => replaceTags(node, tagMap));
  }

  await fs.writeFile(questionPath, domSerializer(dom));

  console.log(`Successfully converted ${questionPath}`);
}
