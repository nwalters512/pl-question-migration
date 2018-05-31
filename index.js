const fs = require('fs-extra');

const convertQuestion = require('./convert-question');

const args = require('yargs')
  .version(false)
  .option('course', {
    description: 'The course to convert',
  })
  .option('question', {
    description: 'The question to convert',
  })
  .help().argv;

if (!args.course && !args.question) {
  console.log('You must specify either a course or a question');
  process.exit(1);
}

if (args.course && args.question) {
  console.log('You cannot specify specify both a course and a question');
  process.exit(1);
}

if (args.question) {
  // We only have to convert a single question
  convertQuestion(args.question).then(() => {
    console.log(`Successfully converted ${args.question}`);
  }).catch((e) => {
    console.error(`Error converting ${args.question}`, e)
  })
}
