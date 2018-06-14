const path = require('path');
const fs = require('fs-extra');
const htmlparser = require('htmlparser2');
const domutils = require('domutils');
const domSerializer = require('dom-serializer');

const replaceTags = (node, tagMap) => {
  if (node.type === 'tag') {
    if (node.name in tagMap) {
      node.name = tagMap[node.name]
      node.attribs = Object.keys(node.attribs).reduce((acc, curr) => {
        const newName= curr.replace(/_/g, '-');
        acc[newName] = node.attribs[curr];
        return acc;
      }, {});
    }
  }
  if (node.children) {
    node.children = node.children.map(child => replaceTags(child, tagMap));
  }
  return node;
}

/**
 * Returns true if conversion occurred, false otherwise.
 */
module.exports = async (dir, tagMap) => {
  try {
    const questionInfoPath = path.join(dir, 'info.json');
    const questionInfo = await fs.readJson(questionInfoPath);
    if (!questionInfo.type || questionInfo.type !== 'v3') {
      // We can skip this question; we only want to convert v3 questions
      return false;
    }
  } catch (e) {
    console.log(`Skipping ${dir} (no info.json found)`);
    return false;
  }

  const questionPath = path.join(dir, 'question.html');
  if (!(await fs.pathExists(questionPath))) {
    console.log(`Skipping ${dir} (no question.html found)`);
    return false;
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
  return true;
}
