Server-rendered (Reparo Blinder) copy of the ff-qa quick-order widget, step 2, for each platform category.
Find: <div class="flex items-start flex-col md:flex-row">
Replace: contents of <category id>.html
Route: /*/c<category id>
Regenerate when a category gains/loses a service type (ff-main v7 re-renders over it either way).
