# Introducing the Alan Programming Language

<center><img src="./alan-logo.png" width="33%" /></center>

`alan` is a natively-parallel, statically-compiled, type-inferred language with a familiar syntax and many compile-time and run-time safety guarantees.

Alan's purpose is to provide a programming language that can be easy to pick up while having solid performance that can scale with you and your project until you reach the very extremes of cluster computing needs.

## Natively Parallel

It accomplishes this by encouraging the use of parallelizable constructs and automatically managing IO and compute threadpools.

**Coarse parallelism** is accomplished via the event system baked into the language:

```rust
on http.connection fn (req: http.Request, res: http.Response) {
  res.body("Hello, World!").status(200).send()
}
```

Independent connections to the HTTP server are scheduled onto the event loop and the compute threadpool pulls them from the queue and executes them in parallel.

**Fine parallelism** is accomplished through array operations being natively-parallel by default:

```rust
someLargeArray
  .filter(fn (val: SomeType): bool = val > someDefaultVal)
  .map(fn (val: SomeType): float64 = val.innerNumber * 3.14159)
  .each(print)
```

If the array is large enough and the inner function given to it is pure, each of these steps will run in parallel, utilizing all of the CPU cores on the machine.

**Concurrency** is accomplished with special IO-flagged opcodes within the runtime:

```rust
const data: Result<string> = curl("https://someurl.com/csvfile.csv")
const datacsv: Array<Array<int64>> = (data || '').split('\n').map(fn (row: string): Array<int64> = row.split(',').map(toInt64))
const data2: Result<string>  = curl("https://someotherdatasource.org/othercsvfile.csv")
const data2csv: Array<Array<int64>> = (data2 || '').split('\n').map(fn (row: string): Array<int64> = row.split(',').map(toInt64))
// Compare the data...
```

The Alan runtime will see that the two URL fetches do not depend on each other and can run in parallel, so they will be hoisted to the top of the function call, executed in parallel, and the function execution continues after they return, minimizing overall latency and scheduling costs.

## Type Inferred

Alan's type inference is capable enough that *all* of the examples above do not need their types explicitly written out. The following would also have worked:

```rust
on http.connection fn (req, res) {
  res.body("Hello, World!").status(200).send()
}
```

```rust
someLargeArray
  .filter(fn (val) = val > someDefaultVal)
  .map(fn (val) = val.innerNumber * 3.14159)
  .each(print)
```

```rust
const data = curl("https://someurl.com/csvfile.csv")
const datacsv = (data || '').split('\n').map(fn (row) = row.split(',').map(toInt64))
const data2 = curl("https://someotherdatasource.org/othercsvfile.csv")
const data2csv = (data2 || '').split('\n').map(fn (row) = row.split(',').map(toInt64))
// Compare the data...
```

This allows you to be as concise or as explicit as you need to be, with very dynamic-looking code in a static language possible.

## Statically Compiled Benefits and Compile-Time Safety

Alan has a multi-stage compiler with two compile targets: It's own native AGC bytecode format to be run by its native runtime, and Javascript to allow running in Node.js or the browser.

This will make it possible to make full-stack web applications in Alan that can also be ejected to Javascript if you no longer wish to develop in Alan. ("Will" because the cross-compiler's primary focus has been on correctness, not legibility, of the generated Javascript, but that will improve over time. Also because Alan bindings to Web APIs have not yet been written.

Being statically compiled brings lots of benefits (and a few drawbacks) to the table. Primarily, the compiler can spot and prevent many classes of trivial errors from getting into production, but at the expense of requiring a compilation step between checking the changes made to your code.

However, Alan takes the safety guarantees to a higher level:

* **No `undefined` variables, ever:** In Alan, `let` or `const` declared variables *must* be given an initial value. Potentially missing data can be represented with a `Maybe<T>` type, but then the compiler will force checking for the presence of actual data or providing a default value if not present. Downstream logic can be assured that the type they are working with is real.
* **Most runtime errors impossible:** Out of memory errors are impossible to avoid, but other issues, such as divide-by-zero, integer under/overflow, array out-of-bounds accesses, etc, are not possible in Alan. Actions that could have runtime errored in other languages are converted into `Result<T>` types that have to be checked for an error condition and/or have a default value provided instead. (The default set of math operators return `Result`-wrapped values and can accept such values in place of raw integers or floats, but there is also a second set of math operators copying Rust's [saturating arithmetic](https://doc.rust-lang.org/std/intrinsics/fn.saturating_add.html) mechanism that always works on raw integers or floats, and will produce predictable but potentially unexpected values when a runtime error would have been reached, otherwise.)
* **Deadlocks, Livelocks, and other multithreading issues impossible:** There is no explicit multithreading in Alan. The compiler determines what code you have written is safely parallelizable does this for you. As Alan's compiler and runtime become more intelligent, more code will become parallelized, but with most array operations already being parallelizable as well as all events, the majority of the parallelization possibilities are already covered.
* **No shared, mutable state:** Alan defers all such responsibility to databases and caching systems that have had decades of work behind them and many tradeoffs between different mechanisms. We may revisit this if we can bring something to the table here with a significant advantage and minimal downsides in the future, however.
* **Infinite loops impossible:** Classic imperative flow-control tools like `while`, `do-while`, and `for` make parallelization efforts incredibly difficult and encourages outer-scope mutation that then makes it impossible. They can also be implemented syntactically correctly but logically incorrectly such that they will loop infinitely, which seriously impacts runtime reliability. In Alan, these flow-controls are discouraged by being isolated to a standard library and implemented with a nonstandard syntax, but are sometimes the only way to express an algorithm. However, in Alan you must also specify a maximum number of iterations allowed to guarantee that they will halt, though perhaps with an error. This makes actually doing the "right thing" with respect to potential infinite loops required, but also easier than the traditional syntax. Furthermore, classic functional flow-control via recursive functions is similarly banned in Alan without proper wrapping to guarantee eventual halting.
* **Third-Party Module Permission System:** Alan's module system has been designed with several goals in mind, including making it easier to use your own code in your project as easily as third-party dependencies, and making mocking a first-class citizen, but the biggest gain is the standard library permission system possible through it. It is possible to prevent third party code from having access to standard libraries that it should not or you do not want it to have through the module system to a more precise degree than Deno (which is project-wide access controls only). Each third-party module can be restricted to a different set of standard libraries, allowing for defense-in-depth in case of hostile takeover of said libraries.

## Runtime Safety

Most safety in Alan is tackled at compile-time, where it belongs, so you can write code that handles it and it doesn't cause an issue in production. But one major piece that is handled by the runtime for you is memory allocation, access, and deallocation.

Languages that handle memory management for you, like Java or Python, tend to be more productive languages to work in, with the cost of a Garbage Collector periodically pausing your code to find and clean up unused memory. Languages without that, like C or C++, require extra cognitive overhead to manage it, but tend to be faster and have a lower memory footprint.

Rust's memory ownership model is very interesting because you can write code that kinda looks like Java but get C++-level performance out of it, and it also allows Rust's compiler to make sure that you don't have use-after-free runtime errors (unless you intentionally go `unsafe` in Rust), but the drawback is you have to understand a memory ownership model of what functions own what memory, what the lifetime of that memory is, and when you can successfully allow functions to "borrow" that memory versus taking over ownership.

Alan's runtime has done something a bit in-between Rust's memory ownership model and a GC model. In Alan, memory is allocated at the beginning of an event handler's run for all "stack-like" variables (basic constants and variables in the handler and all functions it uses) while "heap-like" variables (arrays and user types) are allocated as needed to the size needed at runtime over the course of the event handler's run. This memory is "owned" by the handler so the event handler is the memory's "lifetime" and after the event handler has finished executing all memory associated with that handler is finally freed in a way that does not affect any other event handlers running on other threads (only if the CPU is truly single-core would there be a noticeable pause).

This "coarse memory ownership model" allows all code written in Alan to not have to worry about memory allocation and deallocation as if it had a Garbage Collector, but without the GC pause issue. However, it also means that the peak memory consumption in Alan will be higher than equivalent programs in Rust similar to garbage collected languages.

## Alan's Target Audience

The primary use-case we see Alan fitting well in is backend business logic where performance does matter, but clarity of code and ease of refactoring matters more. Alan's automatic parallelization and IO concurrency means you don't have to contort your code to exploit multiple cores and sockets simultaneously. It's type inference means you can rapidly prototype solutions and then shore them up with fixed, clear types within the same codebase and without a performance penalty. It's emphasis on safety and turning potential runtime errors into compile-time checks means you can be more sure that your production deploys will work (as long as you have enough memory).

Alan is:

* *Faster* than **Python**
* *Safer* than **Java**
* *Easier* than **Rust**
* *More Concurrent* than **Node.js**
* *More Expressive* than **Go**
* *More Secure* than **Deno**

And we believe over time the runtime can challenge the performance of most compiled languages.

A secondary use-case in the browser exists so Alan can be full-stack, allowing the teams to use just one language for their work. These teams will benefit from the safety and security of Alan, though without the performance or concurrency pieces. (As WebAssembly advances, however, this may change.)

We also see the browser use-case as a way to keep Alan general purpose and a good option for all developers by making sure the needs of this community are also addressed.

As Alan matures, we hope to stretch it to cover greater and greater use-cases and reach greater and greater computational scale, so you never feel the need to rewrite your code.