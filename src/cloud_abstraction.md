# An ideal cloud native abstraction

Distributed and parallel computing are necessary in modern mobile and web applications. We need to leverage multiple cores or multiple machines to speed up business backend software or to run it at a large scale. The infrastructure for serving the web and responding to user queries in realtime are not single-threaded programs running on a laptop but rather collections of processes that communicate with one another in the cloud via HTTPS. Running code across many machines in the cloud is the new status quo.

Software engineers multiply their power by working on top of abstractions. But the abstractions of existing developer tools — libraries, frameworks, operating systems, languages, etc, are leaky, and leaky particularly in ways that make scaling in the cloud difficult. A program written using a robust or ideal **cloud native abstraction** should completely manage IO and computational parallelism for the developer such that the program can run single threaded on one laptop or across multiple cores and machines in the cloud without any operational complexity (extra deployment configuration or maintenance), extra code (frameworks or vendor APIs) or constraints (delayed execution, limited runtime, ephemeral connections, etc). A program written on such an abstraction would automatically scale the infrastructure up or down according to the business needs without having to spend additional engineering or devop cycles as the business grows— developers should be able to focus only on what the software does and not how it runs. 

Here is a survey of the developer tools, programming languages and frameworks, that offer something close to an ideal cloud-native abstraction as defined above:

### Go

Go is often referred as a cloud native programming language because it offers first class concurrency primitives like goroutines and channels to easily manage multicore and distributed programs. However, a cloud native abstraction suggests a hardline tradeoff between control and convenience akin to the way languages from the 90s like Java and Python made developers more productive, when compared to C or C++, by managing memory for them.  Golang makes concurrency and parallelism easier to manage, but still leaves the burden on the developer to manage it which increases the surface area for developer mistakes despite the small grammar of the language.

### Containers + Kubernetes


### Serverless + FaaS

### Ray

### Alan