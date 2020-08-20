# Why we created Alan

**14 August 2020 | David Ellis, Luis F. De Pombo**

We created a programming language to let us, as software engineers, write concurrent algorithms and business logic without having to explicitly program how it should be parallelized. Languages that handle memory management for you, like Java or Python, tend to be more productive languages to work on than ones that leave it up to the user like C or C++. We hope that Alan will be the most productive language in the multiprocessor era.

## Implicit parallelization over arrays, events and IO

Alan is implicitly parallel because its compiler and runtime recognizes and exploits opportunities for parallelization across the computing resources available without being told to do so. This results in nimbler codebases that are as performant as their multithreaded counterparts that use threads, actors, channels, locks, futures, promises etc.

## Race conditions and most runtime errors impossible

Out of memory errors are impossible to avoid, but other issues, such as deadlocks, livelocks, undefined variables, divide-by-zero, integer under/overflow, array out-of-bounds accesses, etc, are not possible in Alan. This makes Alan codebases easier to maintain and develop in because most errors are caught at compile time.

## Module system supports third party permissions and mocks

Alan's module resolution mechanism includes built-in support for defining mocks to make testing easier. The same mechanism allows you to prevent third party dependencies from having access to standard libraries that they should not have access to. This third party permissioning is more precise than Deno, which has project-wide access controls only.

## No GC pauses

Alan’s runtime manages memory allocation, access, and deallocation for you like Java, Python, Go or Javascript. However, Alan’s static event system and memory ownership model does so without GC pauses.

## Join Us

Why the name? Alan is not Turing-Complete, but it is named in honor of Alan Turing. We knew that the language could not be fully Turing-Complete in order to make it implicitly parallel. But most importantly, we find great inspiration in the magnitude of Alan Turing's intellectual contributions.

There is still a ways to go for Alan to become a worthy abstraction to automatically scale software, but if you are moved by the vision please try it out, give us your feedback and help us shape it. If you wish to learn more about the details and philosophy of Alan, please read An Overview of Alan.

## Join us

There is still a ways to go for Alan to become a worthy abstraction to automatically scale software, but if you are moved by the vision please try it out, give us your feedback and help us shape it. If you wish to learn more about the details and philosphy of Alan, please read [An Overview of Alan](./alan_overview.md).