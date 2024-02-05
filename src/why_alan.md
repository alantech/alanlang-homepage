# Why we created Alan

**14 August 2020 | David Ellis, Luifer De Pombo**

We created a programming language to be able to write concurrent algorithms and business logic without having to explicitly program how it should be parallelized. Alan makes people more productive by managing IO and computational parallelism for them in the same way languages from the 90s like Java and Python made people more productive, when compared to C or C++, by managing memory for them.

Why the name? Alan is named in honor of Alan Turing. We find great inspiration in the magnitude of his intellectual contributions.

#### Implicit parallelization over arrays, events and IO

Alan is [implicitly parallel](./alan_overview.html#implicitly-parallel) because its compiler and runtime exploits opportunities for parallelization across the computing resources available without being told to do so. We have [constrained the language a bit](./alan_overview.html#parallel-computation-and-the-problem-of-turing-completeness) to provide better opportunities to do this. This results in nimbler codebases than those built with languages or frameworks that use parallel programming constructs such as threads, actors, channels, locks, futures, promises etc.

#### No race conditions and fewer runtime errors

Deadlocks, livelocks, undefined variables, divide-by-zero, integer under/overflow, array out-of-bounds access, etc, are not possible in Alan. Only out-of-memory errors persist, but they are impossible to avoid. This makes Alan codebases easier to maintain and develop in because [runtime errors are nearly always caught at compile time](./alan_overview.html#statically-compiled-benefits-and-compile-time-safety).

#### Granular third party permissions

Alan's module resolution mechanism, with mocking built-in, allows you to [prevent specific third-party dependencies from having access to  specific standard libraries](./alan_overview.html#third-party-module-permission-system) that they should not have access to.

#### No GC pauses

Alan’s runtime manages memory allocation, access, and deallocation for you like Java, Python, or Javascript. However, Alan’s static event system and [automatic event-oriented memory model](./alan_overview.html#memory-management) does so without garbage collector pauses.

#### Join Us

There is still a ways to go for Alan to become a worthy abstraction to automatically parallelize software, but if you are moved by the vision please try it out, give us your feedback and help us shape it.
