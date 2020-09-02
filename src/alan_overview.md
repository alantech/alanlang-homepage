# An Overview of Alan

**16 August 2020 | Luis F. De Pombo, David Ellis**

Programming languages are useful not only for what they allow, but what they prevent. That is the key separation between a language and a framework. For good or for ill, a framework can be sidestepped by its users while a language can't.

This overview of Alan will emphasize just as much what it prevents you from doing as what it provides to you. We believe our blend of features and omissions is what general purpose computing needs in the multicore era.

## What Alan Provides

Alan is a natively-parallel, statically-compiled, type-inferred, evented language with a familiar syntax and many compile-time and run-time safety guarantees.

### Implicitly Parallel

Alan's compiler and runtime automatically recognizes and exploits the parallelism inherent to the computations expressed by some of the language's constructs and automatically managing IO and compute threadpools.

**Parallelism over events** is accomplished via the static event system baked into the language:

```rust,ignore
on http.connection fn (conn: http.Connection) {
  let res: http.Request = conn.res
  res.body("Hello, World!").status(200).send()
}
```

Independent connections to the HTTP server are scheduled onto the event loop and the compute threadpool pulls them from the queue and executes them in parallel.

**Parallelism over arrays** if the array is large enough and the inner function given to it is pure, each of these steps will run in parallel, utilizing all of the CPU cores on the machine:

```rust,ignore
someLargeArray
  .filter(fn (val: SomeType): bool = val > someDefaultVal)
  .map(fn (val: SomeType): float64 = val.innerNumber * 3.14159)
  .reducePar(fn (acc: float64, cur: float64): float64 = acc + cur)
  .print()
```

The developer needs to know when to use `reducePar` vs `reduce`. It would be great to have auto-parallelism on `reduce` like every other array operation, but that would require the compiler to be able to prove commutative/associative properties on closures. 

**IO Concurrency** is accomplished by eagerly running IO-bound opcodes within the runtime based on the dependency graph of statements:

```rust,ignore
const data: Result<string> = http.get("https://someurl.com/csvfile.csv")
const datacsv: Array<Array<int64>> = (data || '').split('\n').map(fn (row: string): Array<int64> = row.split(',').map(toInt64))
const data2: Result<string>  = http.get("https://someotherdatasource.org/othercsvfile.csv")
const data2csv: Array<Array<int64>> = (data2 || '').split('\n').map(fn (row: string): Array<int64> = row.split(',').map(toInt64))
// Compare the data...
```

The Alan runtime will see that the two URL fetches do not depend on each other and can run in parallel, so they will be hoisted to the top of the function call, executed in parallel, and the function execution continues after they return, minimizing overall latency and scheduling costs.

### Statically Compiled Benefits and Compile-Time Safety

Alan has a multi-stage compiler with two compile targets: It's own native AGC bytecode format to be run by its native runtime, and Javascript to allow running in Node.js or the browser.

This will make it possible to make full-stack web applications in Alan that can also be ejected to Javascript if you no longer wish to develop in Alan. ("Will" because the cross-compiler's primary focus has been on correctness, not legibility, of the generated Javascript, but that will improve over time. Also because Alan bindings to Web APIs have not yet been written.)

Being statically compiled brings lots of benefits (and a few drawbacks) to the table. Primarily, the compiler can spot and prevent many classes of trivial errors from getting into production, but at the expense of requiring a compilation step between checking the changes made to your code.

However, Alan takes the safety guarantees to a higher level:

* **No `undefined` variables, ever:** In Alan, `let` or `const` declared variables *must* be given an initial value. Potentially missing data can be represented with a `Maybe<T>` type, but then the compiler will force checking for the presence of actual data or providing a default value if not present. Downstream logic can be assured that the type they are working with is real.
* **Most runtime errors impossible:** Out of memory errors are impossible to avoid, but other issues, such as divide-by-zero, integer under/overflow, array out-of-bounds accesses, etc, are not possible in Alan. Actions that could have runtime errored in other languages are converted into `Result<T>` types that have to be checked for an error condition and/or have a default value provided instead. (The default set of math operators return `Result`-wrapped values and can accept such values in place of raw integers or floats, but there is also a second set of math operators copying Rust's [saturating arithmetic](https://doc.rust-lang.org/std/intrinsics/fn.saturating_add.html) mechanism that always works on raw integers or floats, and will produce predictable but potentially unexpected values when a runtime error would have been reached, otherwise.)
* **Deadlocks, Livelocks, and other multithreading issues impossible:** There is no explicit multithreading in Alan. The compiler determines what code you have written is safely parallelizable does this for you. As Alan's compiler and runtime become more intelligent, more code will become parallelized, but with most array operations already being parallelizable as well as all events, the majority of the parallelization possibilities are already covered.
* **No shared, mutable state:** Alan defers all such responsibility to databases and caching systems that have had decades of work behind them and many tradeoffs between different mechanisms. We may revisit this if we can bring something to the table here with a significant advantage and minimal downsides in the future, however.

### Third-Party Module Permission System

Beyond direct code and syntax safety guarantees, Alan also provides safety mechanisms on third-party modules. Alan's module resolution mechanism includes built-in support for [defining mocks](https://docs.alan-lang.org/module_testing.html) and, more importantly, [defining mutations](https://docs.alan-lang.org/module_mutation.html) of existing modules. This mechanism can be used to deny third party libraries access to parts of the standard library you are not comfortable with. By simply creating a `modules` directory within the third-party dependency and then defining an `std/app.ln` file that re-exports non-functional versions of the types, functions, and events of the original standard library, you can prevent that library from being able to use standard library features you would not expect them to have access to. For instance, if you have imported a very popular utility library for, say, curve fitting. You would not expect it to want to have access to your filesystem or creating a child process, so you could inject nonfunctional mocks of `@std/fs` and `@std/cmd`.

This causes the third party code to be compiled without the opcodes it needs to access that functionality at all, providing a defense-in-depth that can be applied along with standard auditing, package signing, and CVE reporting on open source projects. Making this behavior easy-to-use automatically through the package management system is a project goal that will provide users of Alan a layer of security no other project approaches.

### Memory Management

Most safety in Alan is tackled at compile-time, where it belongs, so you can write code that handles it and it doesn't cause an issue in production. But one major piece that is handled by the runtime for you is memory allocation, access, and deallocation, and Alan does so without GC pauses.

Languages that handle memory management for you, like Java or Python, tend to be more productive languages to work in, with the cost of a Garbage Collector periodically pausing your code to find and clean up unused memory. Languages without that, like C or C++, require extra cognitive overhead to manage it, but tend to be faster and have a lower memory footprint.

In Alan, memory is allocated at the beginning of an event handler's run for all "stack-like" variables (basic constants and variables in the handler and all functions it uses) while "heap-like" variables (arrays and user types) are allocated as needed to the size needed at runtime over the course of the event handler's run. This memory is "owned" by the handler so the event handler is the memory's "lifetime" and after the event handler has finished executing all memory associated with that handler is finally freed in a way that does not affect any other event handlers running on other threads (only if the CPU is truly single-core would there be a noticeable pause).

This "coarse memory ownership model" allows all code written in Alan to not have to worry about memory allocation and deallocation as if it had a Garbage Collector, but without the GC pause issue.

### Type Inferred

Alan's type inference is capable of automatically inferring all function return types and all variable assignment types, only requiring function arguments to be typed. Once [this RFC](https://github.com/alantech/alan/blob/main/rfcs/006%20-%20Automatic%20Argument%20Interfaces%20RFC.md) is implemented, it will be capable enough that *all* of the examples above do not need their types explicitly written out. The following would also work:

```rust,ignore
on http.connection fn (conn) {
  let res = conn.res
  res.body("Hello, World!").status(200).send()
}
```

```rust,ignore
someLargeArray
  .filter(fn (val) = val > someDefaultVal)
  .map(fn (val) = val.innerNumber * 3.14159)
  .reduce(fn (acc, cur) = acc + cur)
  .print()
```

```rust,ignore
const data = http.get("https://someurl.com/csvfile.csv")
const datacsv = (data || '').split('\n').map(fn (row) = row.split(',').map(toInt64))
const data2 = http.get("https://someotherdatasource.org/othercsvfile.csv")
const data2csv = (data2 || '').split('\n').map(fn (row) = row.split(',').map(toInt64))
// Compare the data...
```

This allows you to be as concise or as explicit as you need to be, with very dynamic-looking code in a static language possible.

## What Alan Removes

Any engineering endeavour is a balance of trade-offs, and some things must be removed to make room for all of the advantages laid out above.

Most languages tend to make a similar set of trade-offs, with the largest "axis" of trade-offs being on how static or dynamic the type system is, with C and Rust being far on the static side, Python and Lisp being dynamically typed but static once the variable is defined, and Perl and Javascript being fully dynamically typed where variables can be reassigned with new types and values can be implicitly casted between types. Alan has come down hard on the static typing side like Rust, but with a (soon-to-be) complete type inference system, as well, which we believe can help you "have your cake and eat it, too."

Other trade-offs that Alan makes are significantly outside of the regular trade-offs that most languages make.

### Parallel Computation and the Problem of Turing-Completeness

You may have noticed something missing from the examples above. Classic control flow! While there is `if`, there is no `while`, `do-while`, `for`, `until`, etc. You may be thinking "with functions and if statements, I can use recursive calls to reconstruct these tools!" [Well yes, but actually no.](https://media1.tenor.com/images/332e49d59e1571201639e28cc4371b60/tenor.gif) The Alan compiler detects and fails on any direct recursive function calls, preventing this from occurring.

This means that the functions that *you can write* in Alan are not [Turing Complete](https://en.wikipedia.org/wiki/Turing_completeness), they are simply dependency graphs of operations to perform, meaning that any call to them is *guaranteed* to Halt. To iterate over an array, you must use one of the built-in array functions to do so, passing it a closure function to perform the logic per iteration, and the runtime has strong guarantees that this operation will not hold the thread forever. In fact, for anything not IO-bound, the runtime should be able to *predict* how much time it will take with these properties and could schedule work appropriately around it.

Should this array iteration be parallelized or not? That depends on the cost to scatter the array to multiple threads and the cost to gather the results back to the original thread versus the cost to execute the specified operations on each element of the array. Any combination of array size and closure operation is going to have a different set of thresholds between staying in 1 core versus 2, 3, 4, etc, and that threshold would also vary based on *how many other tasks* are running at the same time. Will it spend the scatter and gather penalty only to be queued and obliterate any potential performance gains from parallelization?

The Alan runtime does not yet do this, but the constraints of the language mean it is only a matter of time before it does, and allow the runtime to make performance decisions that no framework is capable of today, because it is able to "reason" about the behavior of your code to a much greater degree.

The problem with the classic control flow constructs is their Turing completeness. Even "trivial" fragments of code involving them are unpredictable. Consider the following snippet of C code:

```c
while (node) {
  printf(node->data);
  node = node->child;
}
```

This code appears to iterate through a linked list and print all of the data in it to stdout. It appears to be equivalent to a simple `someArray.each(print)`. But what if this was the line just before this block of code:

```c
node.child = &node;
```

Now the `while` loop is an infinite loop and it will [never halt](https://en.wikipedia.org/wiki/Halting_problem). It "isn't the while loop's fault," you may be thinking, the data is corrupt! That's the unfortunate point. The algorithms and the actual data structures together determine the running time and whether it will halt or not, and knowing that answer is necessary to parallelize automatically without accidentally causing performance regressions in some situations.

And so Alan intentionally controls the base algorithms and data structures, to make the automatic parallelism possible and to prevent runaway code from taking everything down with it. While it is true that there are questions that can never be answered, a language that prevents you from ever asking them means that you'll always be able to answer a request from your own user.

Finally, we do have [a proposal to mostly restore these classic control flow tools](https://github.com/alantech/alan/blob/main/rfcs/007%20-%20Sequential%20Algorithms%20RFC.md) for the few problems that truly need them and cannot be cleanly solved with the functional tools provided, but must be provided a limit value on the number of iterations (that the runtime will eventually use to determine the expected execution time for planning purposes) to still guarantee halting, and are intentionally discouraged due to all of the deoptimizations they cause. This includes looping and recursion constructs as well as generator functions.

### A Static Event System

Most languages do not bake an event loop into the language, with Javascript being a major exception. Others use a message passing system to named processes (Erlang, Go). None that we're aware of require the collection of events to be statically defined at compile time.

Alan makes this choice. This constrains the dynamism problem which makes the potential parallelization planner simpler  as it can know the total list of all event types and sources for those events. But this also makes possible another behavior in the compiler: massive function inlining. The Alan runtime does not have the concept of a function, it has collections of dependency graphs for each event it can process.

The entire function call graph has been squashed together per event, making each of them like a mini-process using the runtime to communicate with each other, and allowing the compiler to automatically squash duplicate constants and (in the future) pre-compute as much of the graph as possible at compile-time.

This decision should give Alan code a performance boost at runtime at the cost of compile time and code size (inlined code used in multiple event handlers has to be duplicated).

## Summary

Alan is not just another mixed-mode imperative/functional language with a slightly different syntactic skin. Through a delibrate and uncommon set of trade-off decisions, Alan can guarantee that you will have no uncontrolled runtime errors and that where possible it will parallelize your code, and in the future it will be able to do so without any explicitly defined types and without accidental performance regressions versus executing single-threaded.

These trade-offs have been chosen to minimize the amount of "unusual" patterns of logic so it doesn't get in your way, especially if you already write code in the recommended idiomatic forms of Typescript, Rust, etc. They are significant trade-offs, however. No unmanaged looping or recursion is allowed, and Alan functions are, on their own, not Turing complete, but we believe we have skimmed "close enough" to Turing completeness to maintain the vast majority of the utility involved but without many of the downsides.