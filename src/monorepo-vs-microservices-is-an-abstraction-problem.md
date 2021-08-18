# Monorepo vs Microservices is an Abstraction Problem

**16 August 2021 | Luis F. De Pombo, Alejandro Guillen, Colton Donnelly, David Ellis**

Like Vim vs Emacs, Static vs Dynamic Languages, and Tabs vs Spaces, it seems like a Monorepo vs Microservices will forever be debated by software engineers, with both sides having valid points and the choice ending up more due to preference than anything else. The cycle of point and counterpoint often looks like:

1. Everyone starts with a monorepo, as you always start with a singular codebase to work with, and the complexity is still small overall. Likely a simple horizontally-scaled application layer on top of a vertically-scaled database layer.
2. Compute heavy tasks start to negatively impact the response times of database-bound requests. The first potential monorepo vs microservice debate can happen here, as a separately deployed service for compute heavy jobs can make use of a language or framework that is designed for such tasks, but often the existing language has some option for background task running, and rewriting this code would distract from other work that can be done, so using the background task library and deploying both application clusters from the same repo wins out.
3. Latency-sensitive endpoints start impacting the architecture of the application layer. If the latency-sensitive piece is mostly read-bound, a cache layer is added either above the latency-sensitive endpoint, or between the application layer and the database layer, or both. If the latency-sensitive piece is write-bound, scaling up the database layer is often the first tack taken. If the latency-sensitive piece is both read-and-write bound in a kind of state machine way, either pushing this logic to the client-side or bolting on a second database (often NoSQL) dedicated to this small part of the application logic is done. This is the second point where breaking out into microservices may be debated, as the additional complexity in the request-handling for these endpoints can negatively impact development velocity on the "regular" endpoints as there may be extra "ceremony" to endpoint development that most of the developers do not care about and potentially don't fully understand, especially if homegrown with ill-defined terminology and separation-of-concerns.
4. Testing and deployment times continue to rise for monorepos. Only certain developers are trusted with managing a release as it has become complicated with many different things to monitor simultaneously and this monitoring process constantly in flux as new features are added. Developers trying to add one new feature into the monorepo are hit with very long iteration cycles as the test suite takes a very long time to complete and local testing has possibly stopped working because no one was officially in charge of it and getting high priority features and showstopping bugs fixed in production took precedence. Breaking up the monorepo to make test and deploy cycles shorter is brought up by those in favor of microservices, while proponents of the monorepo argue that improving test and making individual subsystems separately deployable avoids the complexities of multiple repos.

At this point, it often devolves into a point and counterpoint between the two parties. The proponents of microservices arguing that separately deployable and testable code is already essentially microservices, but by being in the same repo, code changes that are impossible to migrate to but pass tests are possible. Eg, services A and B are both changed simultaneously to A' and B' and the test suite passes, but if you deploy service A -> A' first, it cannot interact with service B, and if you deploy B' first, it cannot interact with A, and since you can't deploy both services absolutely simultaneously, you're now going to cause a temporary outage. The proponents of monorepo argue that you can enforce that service mocks in the test suite cannot be changed at the same time code in the service is changed, so you can have the test suite enforce that the new code can talk to the old services and force the consideration of the migration path.

Or perhaps it came down to different teams needing differing versions of a vendored library, with the microservices side arguing improved development velocity when the scope of impact for their team's needs isn't the entire company, and the monorepo side arguing that there may be unexpected interactions between differing versions of the same library, or difficulty performing security analysis, etc, and the microservices side counter-argues that proper schema enforcement would prevent the interaction issue and a simple for loop wrapping the security scanner handing it each service repo in the git server would solve the latter, etc.

Whatever the reasoning, the two camps both make solid arguments and have solid technical solutions for either approach, and the choice for one or the other tends to follow a balance of the past decisions and current preferences of the "key" members of the engineering team that can convince most of the other engineers and management above them to take one path or the other.

But is this actually the case? Let's take a look at the vendored library example more closely. Some of you saw that example and accepted it without question, while others of you were probably completely unfamiliar with it. For those of you coming from a C/C++ background, where each project must define their own way to vendor third party libraries because the build toolchain doesn't even consider the possibility, you likely saw this as a policy decision in the engineering org and the microservice proponents intentionally ignoring the alternative of allowing per-project vendored libraries within the monorepo. If you came from a Python or Java background, you likely saw this as entirely a technical issue, as dependencies are a list and you *can't* vendor multiple versions of the same library without jumping through hoops of `$PATH` munging or library name rewriting (and rewriting invocations in all other code using the version with the rewritten name). And if you came from a Node.js background you didn't understand it at all because your singular project probably has multiple versions of [ajv](https://www.npmjs.com/package/ajv) in your dependency tree and you don't even know *why*.

Dependency version conflict is or is not an issue for large-scale monorepos depending on the particular abstraction the programming language used in the monorepo chose for third party libraries. No abstraction leaves the decision up to the team, but also gives the team more work (both real and bikeshedding), while the wrong abstraction forces your hand on your software organization.

We believe that all of the problems that causes one to migrate from a monorepo to microservices are due to problems in the abstractions of the languages used to write backend production code, that a new language can resolve these abstractions, and that a new language is *required* for some of these abstraction issues as the foundation of these languages does not fit with the reality they operate in.

Minimizing latency when dealing with data stored in a cluster is the simplest problem to be abstracted and doable with current languages, but often very awkward and difficult to do. In a situation where a request comes in to node N1 but the relevant data is located on node N2, there are two possible choices to make:

1. Request the relevant data from N2 to N1, then execute the code using the relevant data from the request and return the result.
2. Grab the relevant data from the request to N1 and push it and the code to execute to N2, then execute the code and push the result from N2 back to N1.

Option 1 is taken the vast majority of the time because your distributed data is often in a distinct cluster (a database) from your request/response application layer, and doing the compute within the database is made difficult by needing to be written in another language from your main application language, requiring a context switch, and often made further difficult by this language primarily being a query language, likely SQL, and being awkward or impossible to represent the computation desired.

Even when the database supports the same language as your application, it often also has a differing set of standard libraries, making code reuse difficult if even possible. But option 2 is *often* the right choice when you have a complex computation you need to perform on a large amount of data that you can't just filter away, and so going through that pain when the execution time of option 1 is orders of magnitude more than option 2 is an optimization stable projects go through when traffic volume increases and the engineering cost to make that optimization becomes justifiable.

But if that cost to you was zero, because your programming language could determine when one path or the other was the optimal choice, what would the actual switching point be? Let's write these two options out as equations on the total response latency:

```
Toption1 = Tdata + Texecute
Toption2 = Tclosure + Texecute + Tresult
```

Where `Tdata` is the time to transmit the raw data from N2 to N1, `Tclosure` is the time to transmit the relevant metadata for the execution from N1 to N2, `Tresult` is the time to transmit the output result from N2 to N1, and `Texecute` is the time required to perform the relevant computation, assumed to be identical on both sides here (but not the case when the execution has to be rewritten in a different language).

Therefore, choose Option 2 when:

```
Tclosure + Tresult < Tdata
```

When the total data to compute on is more than the metadata from the request and the size out the output payload, then it makes sense to push the compute to the remote machine, otherwise it makes sense to pull the data from that node and perform the computation locally.

A handshaking protocol between the two nodes while negotating whether or not the data or the closure will be transmitted can be performed to make the sizes of those two payloads known and the decision automatic (assuming symmetric bandwidth between the two nodes). But wait, what about `Tresult`? You have to perform the computation to know which choice is correct, right?

While true in a general case, there are a few ways that the uncertainty can be reduced. First, in a statically-typed language, types that are constant in size (unitary types like `int`, `float`, and `bool`, or compount struct types composed only of those types or other struct types similarly composed) have a compile-time known size, and the exact sizing of `Tresult` can be known ahead of time. If a variable-length type is included, such as `Array` or `string`, then prediction becomes more difficult without also tracing the origin of the data in question. If `Tdata` was of type `Array<T>` and `Tresult` is of type `Array<U>`, and the type was due to something like `data.filter(filterFn).map(mapFn)`, then it is known that the length of the output `Array<U>` is less than or equal to the `Array<T>`. Then if the `len(Array<T>) * sizeof(U) < len(Array<T>) * sizeof(T) + sizeof(closureData)`, you are similarly guaranteed that the computation should be pushed to the remote end.

There will still be cases where explicit determination of which side to perform the computation is not possible. But with some reasonable assumptions, we can create an approximate solution that can produce a solution that will choose the correct execution location most of the time. The input data is from the closure and remote data pieces, and so the entropy, `E`, of the output result should not exceed that. Of course it is possible to create highly compressible data that still fits in that definition, but assuming the compressibility is approximately the same and the bandwidth is symmetric between the nodes, we don't have to worry about entropy and just consider time. Therefore, `Tresult <= Tdata + Tclosure`, with the total range for `Tresult` being between `[0..Tdata + Tclosure]`. The exact distribution of times for `Tresult` depends on the use-case, but is likely a normal-ish distribution with a low average and a long tail when considered in bulk across many different queries for many different remote executions, due to the [Central Limit Theorem](https://en.wikipedia.org/wiki/Central_limit_theorem). Therefore if we instead go with a conservative linear distribution, we overestimate the expected entropy of the output result somewhat while also simplifying the math and define `Tresult = (Tdata + Tclosure) / 2`, which we can substitute this back into our original inequality and get:

```
Tclosure + (Tdata + Tclosure) / 2 < Tdata
(3/2) * Tclosure < (1/2) * Tdata
```

This approximation will likely bias towards local execution when remote execution would have been the better bet, but generally when the stakes are low and the impact of one choice or the other has a low variance in the output latencies. And for static languages we can produce exact results in many circumstances (first by the type system, and later with a more intelligent compiler proving relations between `Tresult` and `Tdata`). All of this analysis depends on being able to ship identically-behaving code between the nodes, and becomes considerably more difficult if the code in question must be rewritten in another language for the data storage side of things, hence why it has tended to be done on an adhoc, "squeaky wheel gets the grease" manner, and only when a developer has a "hunch" that it will pay off.

There are other reasons why one would perform remote execution, though. If the data in question is too large to fit into the memory of a single node, splitting it across multiple nodes and performing all analysis of it via remote execution allows computation that would otherwise need to be awkwardly rewritten in a streaming style with disk backing (and potentially much slower, too). And in a computationally intensive problem, if the work can be parallelized, it *may* make sense to do so. There are multiple levels of parallelization decisions:

1. Don't parallelize even if its possible.
2. Parallelize across multiple CPU cores on the same node.
3. Parallelize across multiple nodes in the same datacenter.
4. Parallelize across multiple nodes in multiple datacenters.

For the exact same parallelizable code, all four permutations are valid to consider, depending on the size of the payload an the execution time of the parallelizable unit.

Where `n` is the number of executions to perform in total, `m` is the number of CPU cores on a given node (assuming all nodes are equal), `o` is the number of nodes in a datacenter (assuming all datacenters have an equal number of nodes) and `p` is the number of datacenters:

```
Tlocal = n * TexecutionUnit
Tcores = TscatterThread + (n / m) * TexecutionUnit + TgatherThread
ToneDatacenter = TscatterDatacenter + (n / m / o) * TexecutionUnit + TgatherDatacenter
TallDatacenters = TscatterAll + (n / m / o / p) * TexecutionUnit + TgatherAll
```

Where the `scatter` and `gather` times are a function of both the bandwidth between the threads/nodes/datacenters, the number of executions to perform, and the size of each unit of data for the input (scatter) and output (gather). Because the data necessary to perform a computation in a parallel execution consists of some unique data per computation and some shared data per computation, there is also value in making sure that the shared data is transmitted only once per actual CPU core doing work. This makes the total definitions of `scatter` and `gather` complex:

```
Tlocal = n * TexecutionUnit
Tcores = TcopyInputClosureData + (n / m) * TcopyParallelData + (n / m) * TexecutionUnit + (n / m) * TcopyParallelOutput
ToneDatacenter = TcopyInputClosureDataToOtherNodes + (n / o) * TcopyParallelDataToOtherNodes + (n / m / o) * TexecutionUnit + (n / o) * TcopyParallelOutputFromOtherNodes
TallDatacenters = TcopyInputClosureDatatoOtherDatacneters + (n / p) * TcopyParallelDataToOtherDatacenters + (n / m / o / p) * TexecutionUnit + (n / p) * TcopyParallelOutputFromOtherDatacenters
```

Where it is assumed the bandwidth between threads is greater than between nodes in the same datacenter is greater than between datacenters.

As before, the size of the output impacts the choice here, and as before the type system and compiler can help here. If the choice is delayed to execution time, though, and constrained to smaller operations, such as purely a `map` operation on an array, it is simple to compute the amount of data to be generated by the output and solid estimates on transfer time.

What is different here is that `TexecutionUnit` doesn't fall out of the comparison as it did with "simple" remote execution. It is a vital component of deciding which level of parallelization should be taken, determining the smallest of `Tlocal`, `Tcores`, `ToneDatacenter` and `TallDatacenters` depends on the size and shape of the cluster as well as the size of the data, how finely it is diced up, and how long it takes to perform the transformation on any particular unit of the parallelizable data.

And, as you may know, Turing complete code cannot provide any guarantees on execution time; they may not even halt. [The Turing-Completeness Problem](./the-turing-completeness-problem.md) is a problem for most languages, but if you constrain the code that you are executing in parallel to a directed acyclic graph, then minimum and maximum execution times can be computed, and this can be used, with a similar averaging assumption, to make the parallelization decision decidable.

When you can have good estimates on execution time for any given unit of work, you now also have enough information to produce a fair scheduler that tries to minimize the standard deviation in the runtime of any particular execution task. Simply put, if you have a task that takes 15 seconds and another that takes 10ms, the 10ms task should take priority over the 15 second task even if it needs to halt it entirely as 15.01 seconds is immaterial to user expectations if they expected 15, but a dramatic 1,501x slower time the other way around. Effectively using the total run time as a prioritization. A mechanism like this would cause the entire server to slow down roughly proportionally for each task, rather than penalize the lightest workloads at the expense of the heaviest.

Once you have something that can decide where to execute your workload based on where the data is located and how parallelizable the work is, and does a good job of keeping resource utilization fair in a resource-constrained environment, you no longer run into any of the performance-related pain points where a microservice architecture may be considered. Pain points with testing should also be minimized as the test suite would automatically parallelize itself for you, though care to allow users to specify the tests they're interested in for local development would still be the biggest benefit there.

That leaves the last two reasons that may be used in favor of microservices: vendoring different library versions and invalid code changes to on upgrades of parts of your cluster out of sync but the test suite not catching this. The former is simple: the language should simply adopt the dependency graph mechanism of dependency abstraction. The latter can also be simple: if you can have all of these "disparate" parts of your backend actually stay in the same codebase as the same singular deployment artifact, then it becomes impossible to get into such an invalid cluster state because you *do* basically Blue-Green deploy the entirety of production.

And you don't even give it a thought that you do.
