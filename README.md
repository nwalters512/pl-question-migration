# pl-question-migration

A utility for migrating PrairieLearn questions. This will replace self-closing
tags with proper open/close tags, and will replace any element names with
underscores with their dashed name equivalent. Example:

```
<pl_file_download file_name="exam1-cube.sh" directory="clientFilesQuestion" label="Download exam1-cube" />
```

 will become:

 ```
<pl-file-download file_name="exam1-cube.sh" directory="clientFilesQuestion" label="Download exam1-cube"></pl-file-download>
```

If you've decided to fork one of PrairieLearn's elements and it has the same name
as one of the existing elements, then it will be skipped when doing tag
conversions. For example, if you have an `elements/pl_question_panel` element
in your course, then `pl_question_panel` will not be converted to `pl-question-panel`.

### Usage

Clone this repository and run `npm install` to install all dependencies.

To convert an entire course:

```sh
node index.js --course ~/path/to/your/course
```

To convert just a single question:

```sh
node index.js --question ~/path/to/your/course/questions/question
```
