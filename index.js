#! /usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { filterAsync } = require('node-filter-async');

const convertQuestion = require('./convert-question');

const tagMap = {
  'pl_answer_panel': 'pl-answer-panel',
  'pl_checkbox': 'pl-checkbox',
  'pl_code': 'pl-code',
  'pl_external_grader_results': 'pl-external-grader-results',
  'pl_figure': 'pl-figure',
  'pl_file_download': 'pl-file-download',
  'pl_file_editor': 'pl-file-editor',
  'pl_file_preview': 'pl-file-preview',
  'pl_file_upload': 'pl-file-upload',
  'pl_integer_input': 'pl-integer-input',
  'pl_matrix_input': 'pl-matrix-input',
  'pl_matrix_output': 'pl-matrix-output',
  'pl_multiple_choice': 'pl-multiple-choice',
  'pl_number_input': 'pl-number-input',
  'pl_question_panel': 'pl-question-panel',
  'pl_submission_panel': 'pl-submission-panel',
  'pl_symbolic_input': 'pl-symbolic-input',
  'pl_threejs': 'pl-threejs',
  'pl_variable_score': 'pl-variable-score',
  'pl_answer': 'pl-answer',
  'pl_threejs_stl': 'pl-threejs-stl',
  'pl_threejs_txt': 'pl-threejs-txt',
};

const getTagMapForCourse = async (courseDir) => {
  const newTagMap = { ...tagMap };
  try {
    const elementsPath = path.join(courseDir, 'elements');
    const elementList = await fs.readdir(elementsPath);
    const filteredElementList = await filterAsync(elementList, async (element) => {
      const questionPath = path.join(elementsPath, element);
      try {
        const stats = await fs.stat(questionPath);
        return stats.isDirectory();
      } catch (e) {
        return false;
      }
    });
    for (element of filteredElementList) {
      if (element in newTagMap) {
        console.log(`Course has overridden ${element}; skipping tag conversion`);
        delete newTagMap[element];
      }
    }
  } catch (e) {
    console.log('Could not read course element directory; skipping');
  }
  return newTagMap;
}

const getQuestionsForCourse = async (courseDir) => {
  const questionsPath = path.join(courseDir, 'questions');
  const questionDirs = await fs.readdir(questionsPath)
  return await filterAsync(questionDirs, async (question) => {
    const questionPath = path.join(questionsPath, question)
    try {
      const stats = await fs.stat(questionPath);
      return stats.isDirectory();
    } catch (e) {
      console.error(`Error reading ${questionPath}; skipping`, e);
      return false;
    }
  });
}


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
  });
}

if (args.course) {
  // We have an entire course to convert
  (async () => {
    // First, let's determine if a course has forked any of our elements
    // into their own course. If they have, we shouldn't convert that tag for
    // them
    const courseTagMap = await getTagMapForCourse(args.course);

    const questionsPath = path.join(args.course, 'questions');
    let questions;
    try {
      questions = await getQuestionsForCourse(args.course);
    } catch (e) {
      console.error(`Error reading ${questionDirs}`, e);
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < questions.length; i++) {
      const questionPath = path.join(questionsPath, questions[i]);
      try {
        const converted = await convertQuestion(questionPath, courseTagMap);
        if (converted) successCount++;
      } catch (e) {
        console.error(`Error converting ${questionPath}`, e);
        errorCount++;
      }
    }

    console.log(`Out of ${questions.length} questions, ${successCount} were migrated successfully and ${errorCount} errored.`)
  })();
}
