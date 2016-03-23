# How to contribute

## Submitting changes

Please send a [GitHub Pull Request to mattmaynes](https://github.com/mattmaynes/observable-js/compare)
with a clear list of what you've done (read more about
[pull requests](http://help.github.com/pull-requests/)). When you send a pull
request, please include a Jasmine test to confirm the change is successful.
Please ensure that total test coverage is equal to or greater than the current
master coverage. Please follow the coding conventions (below) and make sure all
of your commits are atomic (one feature per commit).

Always write a clear log message for your commits. One-line messages are fine
for small changes, but bigger changes should look like this:

    $ git commit -m "A brief summary of the commit
    >
    > A paragraph describing what changed and its impact."

## Testing

All public features need an associated Jasmine test specification. Tests are
run using Karma and run in PhantomJS. To run the test suite ensure that you
have installed all the project dependencies using `npm install`. The test
scripts can be run with `npm test`.

## Coding conventions

These coding conventions are optimized for consistency and readability:

* Indentation should be a full tab (4 spaces)
* ALWAYS put spaces after list items and method parameters (`[1, 2, 3]`
, not `[1,2,3]`), around operators (`x += 1`, not `x+=1`), and around
hash arrows
* Use standard documentation [@tags](http://usejsdoc.org)
* Comment code where you use non-standard syntax
* Use spaces between names parenthesis `function () { if (...) { ... } }`
* Strive for *functional* over *imperative*
* Use *map-reduce* over *recursion* over *loops* (no stinking loops!)
* Use *camelCase* for functions and variables (but try to avoid it)

