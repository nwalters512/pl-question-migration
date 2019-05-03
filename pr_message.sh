cat <<-\EOF
Hello! 👋 

This automated pull request is being submitted as part of an effort to migrate all PrairieLearn content to a new question renderer that will allow for more sophisticated features, including nesting PrairieLearn elements.

## What is different in the new renderer?

In the old (current default) question renderer, PrairieLearn tags are allowed to be self closing. That means this would be valid:

```html
<pl-external-grading-results />
```

However, the new renderer uses an HTML parser that only allows tags to be self-closing if they're explicitly defined as such by the HTML specification. That means that all PL elements, even empty ones, must include an explicit closing tag:

```html
<pl-external-grading-results></pl-external-grading-results>
```

## What is included in this pull request?

This pull request contains the results of running [an automated script](https://github.com/nwalters512/pl-question-migration) on all of your course questions. First and foremost, the script attempts to fix any invalid self-closing tags in your questions. It does this by replacing your question text with the version that is seen by the current parser. This means that your question will be unambiguously interpreted by the new renderer the same way that it currently is.

*However*, some questions already contain invalid HTML with issues similar to the following:

* mismatched tags (`<h1>Hello!</h2>`)
* missing tags (`<div><p>testing</div>`)
* unquoted attributes (`<pl-multiple-choice answers-name=description>`)

The migration script will fix these, but it might do so in a way that results in semantically incorrect HTML. You should manually review (and possibly correct) all changes suggested by this pull request before merging.

If applicable, this pull request also changes your element names and attributes from `snake_case` to `kebab-case` for better compatibility with HTML syntax highlighters and to reflect convention from [Web Components](https://www.webcomponents.org/).

## What actions do I have to take?

You should review the changes in this pull request, *manually fix any of them as appropriate*, and then merge this pull request and sync it to PrairieLearn. You should do this **no later than 26 August 2019**, as we will be disabling the old renderer at that time.

If your course uses any kind of custom build system to generate questions, you should ensure that this build system emits valid HTML and that the source files for your questions contain valid HTML.

Once you've completed the migration, please reply to [this GitHub issue](https://github.com/PrairieLearn/PrairieLearn/issues/1492) to indicate that it is complete so that a PrairieLearn developer can track the progress of this process.

## What if I have questions?

You can reach out to the PrairieLearn developers over Slack or reply to [this GitHub issue](https://github.com/PrairieLearn/PrairieLearn/issues/1492) with any questions or concerns you may have. We're here to help make this transition as smooth as possible!
EOF
