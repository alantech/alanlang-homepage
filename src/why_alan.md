# Why we created Alan

In short, to decouple what your software does from how it scales.

Software engineers multiply their power by working on top of abstractions. But the abstractions of existing libraries, frameworks, operating systems, languages, etc, are leaky, and leaky particularly in ways that make scaling difficult.

It's a common refrain that a software startup builds a prototype, gets some traction, polishes it up to a fairly complete offering, and then forward progress slows down substantially as the success of the product attracts so many users that the engineering team can't keep up with their software falling apart under the strain.

Sometimes this lasts for so long that the startup reaches a point of near-zero forward progress that takes a lot of resources to come out of. The engineering organization of the company never fully recovers from all the technical debt even if it has finally built new infrastructure to support itself. This new infrastructure can sometimes be too tailored to the exact state of the product so that it cannot easily expand to new product needs.

As software engineers, we got tired of managing and re-writing software as it scaled. We wanted an abstraction to let us focus on the business logic and algorithms. So we built Alan. Alan is a natively-parallel, statically-compiled, type-inferred language with a familiar syntax and many compile-time and run-time safety guarantees. Alan's purpose is to provide a programming language that can be easy to pick up (it looks very similar Typescript) while having solid performance that can scale with you and your project while completely decoupling what your software does from how it scales.

The most ubiquitous abstractions to scale code: Functions/Lambdas managed by Serverless computing and Containers managed by Kubernetes are both relatively new and just the tip of the iceberg in terms of enabling automatic scale. They require users to do things in specific ways. In particular, all software must be stateless or bad things will happen. Furthermore, code within a function, or container, is not scaled for you. 

When we worked on Dynamic Pricing at Uber, we needed to run algorithms from Data Scientists on large-scale geospatial data within massive arrays. To get the performance to do this in realtime, we built a framework for massively parallel operations on layers of immutable arrays encapsulating the algorithms in question. Alan has automatic array-level parallelism that would allow the code in question to look essentially identical to the Data Scientists' prototypes. 

Most of the backends of the startups we worked at are consistently firing requests to multiple external APIs. Being able to fire these requests concurrently, when possible, is key to the performance. We found ourselves often composing complex execution graphs from promises in Node.js or futures in Java and Golang. We built the Alan compiler and runtime so it could parallelize your code without concurrent or asynchronous programming (threads, promises, goroutines, channels, etc). This would allow the code in question to look like blocking, declarative Python but run concurrently behind the scenes.

Why the name? Alan is not Turing-Complete, but it is named in honor of Alan Turing. We knew that the language could not be Turing-Complete in order to to have predictable execution by *only* allowing iteration and recursion that is guaranteed to halt. But most importantly, we find great inspiration in the magnitude of Alan Turing's intellectual contributions.

There is still a ways to go for Alan to become a worthy abstraction to automatically scale software, but if you are moved by the vision please try it out, give us your feedback and help us shape it.