# Where Does The Work Belong In The Data Divide?

**8 September 2021 | Luis F. De Pombo, Alejandro Guillen, Colton Donnelly, David Ellis**

In backend applications, separation of data storage and compute is the gold standard. Whether you're using Go on AWS Lambda, or Ruby-on-Rails on Heroku, or Perl and C++ CGI scripts on your own server in a rack you rented at Peak Hosting, your application layer doesn't maintain any responsibility for the storage of the data it is working with. Instead, you have a database cluster, whether it's DynamoDB, or Cassandra, or PostgreSQL. One of these applications is deployed to be in charge your data.

Your application is "stateless" and your databases "only" store and retrieve data. You don't write distributed compute code because it's hard to get right and will make things more difficult to follow.

Except regardless of any of the possible combinations of application layer and database described, you already *are* writing distributed compute for any but the most trivial of cases. We'll use Javascript and SQL as the compute and query languages for the following examples as they are commonly understood (any web development requires familiarity with Javascript, and most databases use a dialect or derivative of SQL).

Suppose you were writing some sort of trip-managing application and you wanted to show a user a list of their own trips ordered from most recent to least. It is highly unlikely that you wrote it like this:

```js
const trips = await query(`select * from trips;`);
const userTripsInOrder = trips
  .filter((t) => t.userId === userId)
  .map((t) => ({
    type: t.type,
    price: t.price,
    serviceProvider: t.serviceProvider,
    origin: {
      lat: t.originLat,
      lng: t.originLng,
      time: new Date(t.startTime),
    },
    destination: {
      lat: t.destLat,
      lng: t.destLng,
      time: new Date(t.endTime),
    },
  })
  .sort((a, b) => a.origin.time - b.origin.time);
```

It's more likely you would write something like:

```js
const userTripsInOrder = await query(`
  select * from trips
  where trips.userId == $0
  order by trips.startTime desc;
`, [userId]);
const outputUserTripsInOrder = userTripsInOrder.map((t) => ({
  type: t.type,
  price: t.price,
  serviceProvider, t.serviceProvider,
  origin: {
    lat: t.originLat,
    lng: t.originLng,
    time: new Date(t.startTime),
  },
  destination: {
    lat: t.destLat,
    lng: t.destLng,
    time: new Date(t.endTime),
  },
});
```

There's actually *more* lines of code in the second form than the first, but it looks "right" in a way the first doesn't. They both accomplish the exact same goal, but why is the first one wrong and the second one right?

The primary issue is data transfer. The first one gets every trip record in the database and loads it into your application, then it filters out the data it doesn't need, then it transforms the singular row into a nested object and finally sorts them so the latest time is on top. The second one tells the database to filter the trips and provide them in latest-first ordering, and then you transform them into nested objects for consumption in your application.

You have now pushed the filter and sorting computation to the database instead of doing it in your application. You have written distributed compute code and it wasn't scary! You have merged computation and data storage into the same layer!

Without any other information, this is also causing the database to scan the entire table and apply the filter to each row. It would only be able to immmediately rule out data if you also instructed the database to construct an index  on the `userId` column (B-Tree or Hash would work here). Conceptually, that index would be an object of arrays, where the keys are the various values of `userId` and the values are the row numbers of each record, and the database is mutating these indexes on each change to the table in question, and is more computational work pushed to the database with the intent of minimizing the total amount of work assuming the table is queried more often than it is mutated divided by the size of the table, so it *very* quickly becomes worthwhile even for infrequently-queried tables if the table size is massive.

Now, suppose you want to show the user some notable locations near their destination while they're on their trip. You have a destination lat and lng, and you also have your notable places in a table. You only want to show the 4 closest locations as you don't want to overwhelm the user, but unfortunately that isn't a maximum, the UX designer wants *exactly* four to fit into the square set aside for it in the client-side application. Since the destination may end up being far away from the locations in your table, you have to compute the haversine distance between the user and the locations, sort by that, and then slice the first four from the list.

```js
const degsToRads = (deg) => Math.PI / 180 * deg;
const haversine = (origin, dest) => Math.acos(
  Math.sin(degsToRads(origin.lat)) * Math.sin(degsToRads(dest.lat)) +
  Math.cos(degsToRads(origin.lat)) * Math.cos(degsToRads(dest.lat)) * Math.cos(degsToRads(dest.lng - origin.lng))
);
const notablePlaces = await query(`select * from notablePlaces`);
const relevantPlaces = notablePlaces
  .map((p) => ({
    name: p.name,
    img: p.img,
    desc: p.desc,
    distance: haversine({
      lat: p.lat,
      lng: p.lng,
    }, {
      lat: trip.destLat,
      lng: trip.destLng,
    }),
  }))
  .sort((a, b) => b.distance - a.distance)
  .slice(0, 4);
```

Most SQL dialects let you do math to create virtual columns that you can select on and then sort on the output of these virtual columns. Some require you to use inner select statements if you want to do sorting, some do not. But if you simply translated the degrees to radians and haversine function into SQL, besides being more verbose as most do not allow defining functions in the select statement (so everywhere `degsToRads` is called in the example above, you will have to inline the statements) it actually doesn't reduce the amount of computation that needs to be done; the database will have to perform the haversine calculation on all rows in the database to then sort and let you select the `top(4)` from.

Since the total amount of data that is being transmitted is reduced, this may seem like a win, but if you are using a classic vertically-scaled database, this computation needing to be applied to the entire table on each query may put a lot of load on the database that you can't afford, while your horizontally-scalable application layer could be easily increased to handle the increased traffic. Here is a case where reducing the amount of data transferred to the application layer can *decrease* reliability of the application. (If you have a collection of read-followers attached to the read/write-main database, you can mitigate that, at the cost of eventual consistency on the data in question, but it's still quite inefficient.)

Cleverness is necessary to reduce the amount of data transferred and also not overwhelm the server. With some probing queries on the application side, we can constrain the query while still making sure we return 4 results for the UI.

```js
const degsToRads = (deg) => Math.PI / 180 * deg;
const haversine = (origin, dest) => Math.acos(
  Math.sin(degsToRads(origin.lat)) * Math.sin(degsToRads(dest.lat)) +
  Math.cos(degsToRads(origin.lat)) * Math.cos(degsToRads(dest.lat)) * Math.cos(degsToRads(dest.lng - origin.lng))
);
let bbox = 0.1;
for (; (await query(`
  select count(*) from notablePlaces
  where notablePlaces.lat < $0 + $2
  and notablePlaces.lat > $0 - $2
  and notablePlaces.lng < $1 + $2
  and notablePlaces.lng > $1 - $2
`, [trip.destLat, trip.destLng, bbox]))[0].count < 4; bbox *= 2) {}
const closeNotablePlaces = await query(`
  select * from notablePlaces
  where notablePlaces.lat < $0 + $2
  and notablePlaces.lat > $0 - $2
  and notablePlaces.lng < $1 + $2
  and notablePlaces.lng > $1 - $2
`, [trip.destLat, trip.destLng, bbox]);
const relevantPlaces = closeNotablePlaces
  .map((p) => ({
    name: p.name,
    img: p.img,
    desc: p.desc,
    distance: haversine({
      lat: p.lat,
      lng: p.lng,
    }, {
      lat: trip.destLat,
      lng: trip.destLng,
    }),
  }))
  .sort((a, b) => b.distance - a.distance)
  .slice(0, 4);
```

This approach probes mercator-projected squares on the Earth surrounding the destination coordinates for notable locations, where, if there are B-Tree indexes on the `lat` and `lng` columns, will quickly reduce the set of places to consider to only those that are likely candidates for the list, and returns how many were found. If the list is too short, it quadruples the search area (by doubling the bounding box sides) and searches again until it has at least 4 returned records.

Once the probing is complete, it performs the actual query to get the records, performs the mutation, the sorting of this smaller set, and then slicing out the top 4 entries.

Ideally, this logic could be pushed to the database, as well, to eliminate the back-and-forth of request and response during probing, but it is often very difficult, if possible at all, to express this sort of logic in SQL syntaxes. Difficult enough that even when a database does support it, it is often through an extension written in C and loaded into the database, such as PostGIS for PostgreSQL. That's a *very* high barrier to entry for adding efficient computation local to the data in question.

Considerations on data and compute affect both the application layer and the database layer, and the trade-offs can be hard to quantify, as the programming language and model on both sides are very different, so how long rewriting the computational logic from application side to database side or vice-versa will take or how efficient it will be on either side is difficult to predict ahead of time. It's also hard to see when the volume of data transfer to the application layer is the bottleneck and the compute should be pushed into the database layer in the first place, and even harder to tell when that compute will produce a bottleneck in the database itself.

The answer to these questions is often down to developer intuition built up through experience running head-first into each of these bottlenecks in each of these scenarios, but that intuition will always be fuzzy and will bias towards code clarity over ideal performance with complicated logic, and rightly so. Engineering trade-offs, but does it have to be that way?

Let's take our application layer / database layer setup described above, and make two tweaks:

1. The database layer can be scaled horizontally for any given query like our application layer.
2. The database layer can execute the exact same code that our application layer can execute with the same performance characteristics, if desired.

This lets us side-step the "too much compute on the database layer negatively impacts other queries" problem and sidestep the "how do I rewrite this for the database and how well will it perform" when we don't need to rewrite at all. Then the main question becomes "where do I put this computation to minimize the total latency to respond to the user?"

Minimizing latency when dealing with data stored in a cluster is the simplest problem to be abstracted and doable with current languages, but often very awkward and difficult to do. In a situation where a request comes in to node N1 but the relevant data is located on node N2, there are two possible choices to make:

1. Request the relevant data from N2 to N1, then execute the code using the relevant data from the request and return the result.
2. Grab the relevant data from the request to N1 and push it and the code to execute to N2, then execute the code and push the result from N2 back to N1.

Option 1 is taken the vast majority of the time because your distributed data is often in a distinct cluster (a database) from your request/response application layer, and doing the compute within the database is made difficult by needing to be written in another language from your main application language, requiring a context switch, and often made further difficult by this language primarily being a query language, likely SQL, and being awkward or impossible to represent the computation desired, as described above.

But if that cost to you was zero, because your programming language could determine when one path or the other was the optimal choice, what would the actual switching point be? Let's write these two options out as equations on the total response latency:

```
Toption1 = Tdata + Texecute
Toption2 = Tclosure + Texecute + Tresult
```

Where `Tdata` is the time to transmit the raw data from N2 to N1, `Tclosure` is the time to transmit the relevant metadata for the execution from N1 to N2, `Tresult` is the time to transmit the output result from N2 to N1, and `Texecute` is the time required to perform the relevant computation, which we assumed to be identical earlier.

Therefore, choose Option 2 when:

```
Tclosure + Tresult < Tdata
```

When the total data to compute on is more than the metadata from the request and the size out the output payload, then it makes sense to push the compute to the remote machine, otherwise it makes sense to pull the data from that node and perform the computation locally.

A handshaking protocol between the two nodes while negotating whether or not the data or the closure will be transmitted can be performed to make the sizes of those two payloads known and the decision automatic (assuming symmetric bandwidth between the two nodes). But wait, what about `Tresult`? You have to perform the computation to know which choice is correct, right?

While true in a general case, there are a few ways that the uncertainty can be reduced. First, in a statically-typed language, types that are constant in size (unitary types like `int`, `float`, and `bool`, or compount struct types composed only of those types or other struct types similarly composed) have a compile-time known size, and the exact sizing of `Tresult` can be known ahead of time. If a variable-length type is included, such as `Array` or `string`, then prediction becomes more difficult without also tracing the origin of the data in question. If `Tdata` was of type `Array<T>` and `Tresult` is of type `Array<U>`, and the type was due to something like `data.filter(filterFn).map(mapFn)`, then it is known that the length of the output `Array<U>` is less than or equal to the `Array<T>`. Then if the `len(Array<T>) * sizeof(U) < len(Array<T>) * sizeof(T) + sizeof(closureData)`, you are similarly guaranteed that the computation should be pushed to the remote end.

There will still be cases where explicit determination of which node to perform the computation is not possible. But with some reasonable assumptions, we can create an approximate solution that can produce a solution that will choose the correct execution location most of the time. The input data is from the closure and remote data pieces, and so the entropy, `E`, of the output result should not exceed that. Of course it is possible to create highly compressible data that still fits in that definition, but assuming the compressibility is approximately the same and the bandwidth is symmetric between the nodes, we don't have to worry about entropy and just consider time. Therefore, `Tresult <= Tdata + Tclosure`, with the total range for `Tresult` being between `[0..Tdata + Tclosure]`. The exact distribution of times for `Tresult` depends on the use-case, but is likely a normal-ish distribution with a low average and a long tail when considered in bulk across many different queries for many different remote executions, due to the [Central Limit Theorem](https://en.wikipedia.org/wiki/Central_limit_theorem). Therefore if we instead go with a conservative linear distribution, we overestimate the expected entropy of the output result somewhat while also simplifying the math and define `Tresult = (Tdata + Tclosure) / 2`, we can substitute this back into our original inequality and get:

```
Tclosure + (Tdata + Tclosure) / 2 < Tdata
(3/2) * Tclosure < (1/2) * Tdata
3 * Tclosure < Tdata
```

This approximation will likely bias towards local execution when remote execution would have been the better bet, but generally when the stakes are low and the impact of one choice or the other has a low variance in the output latencies. And for static languages we can produce exact results in many circumstances (first by the type system, and later with a more intelligent compiler proving relations between `Tresult` and `Tdata`). All of this analysis depends on being able to ship identically-behaving code between the nodes, and becomes considerably more difficult if the code in question must be rewritten in another language for the data storage side of things, hence why it has tended to be done on an adhoc, "squeaky wheel gets the grease" manner, and only when a developer has a "hunch" that it will pay off.

Alan is capable of this sort of automatic determination of where to run logic related to remote data. The `@std/datastore` standard library in Alan provides an interface for storing any data structure you desire in a Document DB way, and the Alan Virtual Machine (AVM) coordinates a cluster of processes in daemon mode using a RendezvousHash-like structure. You can query `datastore` for the values and pull them locally, providing an eventually-consistent experience useful for places where memcache would have been used, except slightly better as it preferentially queries nodes in the same cloud region when possible, so latency in a multi-region deployment is usually equivalent to a single-region cluster.

However, the more interesting feature is acquiring a `ref`erence or `mut`able reference to the record in `datastore`, and then providing a closure function to perform some operation on it (possibly mutating the original value) and returning the result of your closure. The AVM is able to determine whether it should pull the data locally to perform the computation or push the compute and closure variables to the primary node in charge of the data and return only the result.

The syntax is concise:

```ln
const moreThan20 = namespace('some-namespace')
  .ref('some-int-array')
  .closure(fn (arr: Array<int64>) = arr.filter(fn (n: int64) = n > 20));
```

This is something like `select n from some-namespace.some-int-array where n > 20`, and this particular example would run remotely, as the closure itself is nothing, and `3 * 0 = 0`. There is no index on `n` in this example (and an index might be just as liable to slow down this operation with the extra checks) but assuming there was an index of type `Array<KeyVal<int64, Array<int64>>>` that is sorted by the keys, which are the values of `n` and the values are the indexes in the int array where `n` is that value, then for a very large array, this could be faster:

```ln
const moreThan20 = namespace('some-namespace')
  .ref('some-int-array-index')
  .closure(fn (idx: Array<KeyVal<int64, Array<int64>>>) {
    const rows = idx
      .filter(fn (kv: KeyVal<int64, Array<int64>>) = kv.key > 20)
      .map(fn (kv: KeyVal<int64, Array<int64>>) = kv.val)
      .reduce(fn (rows: Array<int64>, curr: Array<in64>) = rows.concat(curr), new Array<int64> []);
    return namespace('some-namespace')
      .ref('some-int-array')
      .closure(fn (arr: Array<int64>) = rows.map(fn (row: int64) = arr[row] || 0));
  });
```

We trigger a remote execution on the index, remove the index records outside of our "where clause", and then take the values of the index and concatenate them together to produce an array of relevant indexes. Then because this remote execution is happening on any node with the exact same capabilities, we can internally trigger a remote execution on the actual data in question, pushing the array of indexes to the remote node (or pulling the remote array locally and computing here, we don't actually care and the runtime will figure out which is optimal during the remote execution handshake), and then we simply map the indexes to the value in the actual array of data.

We can further optimize this code by making the index an actual user type that includes metadata about the table of data, such as it's total length and the length of the index array and switch between the first formulation and the second when the overhead of the second formulation makes sense, and then we could wrap this up in a more generic function, so we just have to write something like:

```ln
const moreThan20 = select('some-namespace', 'some-int-array').where(fn (n: int64) = n > 20);
```

and now we have something that functions very much like Cassandra. (Tables in a distributed database but no joins.) However, we *can* do joins. Let's assume one table is defined as:

```ln
type MyValues {
  val: int64,
  descId: int64,
}
```

and `descId` is the index into a table of string descriptions. If you define a type:

```ln
type MyJoinedValues {
  val: int64,
  description: string,
}
```

then something like

```ln
const moreThan20 = select('some-namespace', 'my-values').where(fn (rec: MyValues) = rec.val > 20);
const withDescriptions = namespace('some-namespace')
  .ref('my-descriptions')
  .closure(fn (descs: Array<string>) = moreThan20
    .map(fn (rec: Array<MyValues>) = new MyJoinedValues {
      val: rec.val,
      description: descs[rec.descId] || '',
    }));
```

will select out the records we're interested in and then construct the joined records either where the descriptions are stored, or pull the descriptions over to do the joining locally, depending on which requires more bandwidth in the cluster.

We now have the bones of a real SQL database with indexes and joins that works in a distributed cluster. We're missing important things like storage to disk, transactions, and a familiar SQL syntax, but those can be added on with polish. And we further gain the flexibility to simply use the same language we're already developing for querying, so that haversine calculation for the nearest relevant locations can be written plainly, and the runtime can decide which side of the divide it makes more sense to do it.

It may even change that decision automatically for you as you increase the number of relevant locations in your database. You did not need to rewrite your logic in another language, you did not need to notice worsening performance in that query as prior assumptions no longer hold before potentially addressing it.

There are many features of Alan like this that make developing your software better, from [runtime exception guards for everything but out-of-memory issues](https://github.com/alantech/alan/blob/main/rfcs/004%20-%20Runtime%20Error%20Elimination%20RFC.md) to keep your backend server running without major outages, [install-time access controls on modules to prevent third party libraries from accessing parts of the standard library they don't need](https://github.com/alantech/alan/blob/main/rfcs/020%20-%20Dependencies%20permissions%20RFC.md), to the planned automatic parallelization of array-based operations when the linear compute time vs the scatter-gather parallel compute time tradeoff makes sense that cannot be replicated in languages without the controls on Turing completeness that Alan has.

But this remote execution feature is replicable in other languages in a way that the other examples are not, and Alan is not yet production ready while other languages... are. With a [consistent hash](https://en.wikipedia.org/wiki/Consistent_hashing) or [rendezvous hash](https://en.wikipedia.org/wiki/Rendezvous_hashing) ring established between the nodes in the deployment and a private [RPC](https://en.wikipedia.org/wiki/Remote_procedure_call) mechanism they can share, you can send messages to the node that should "own" a given key. A mechanism to designate backup nodes (which falls out of Rendezvous Hashing's structure, btw) and automated push or pull of data associated with a key improves the resilience (but is not strictly necessary if you believe your cluster will never have an outage...) can be built on that.

Finally you can recreate remote execution somewhat similarly to what Alan is capable of, but since the vast majority of languages with closures do not provide a programmatic way to access or iterate on said closures, you can only do so with "pure-ish" functions, that only use compile-time constants and other functions. This fits in well with `static` methods on classes like in Java or Javascript. However, writing your code in such a way will always be inelegant, with more boilerplate and less clear ordering. The best we can think of there is:

```js
class MoreThan20 extends RemoteExec {
  static async run(idx) {
    const rows = idx
      .filter((kv) => kv.key > 20)
      .map((kv) => kv.val)
      .reduce((rows, curr) => rows.concat(curr), []);
    return await new RowToVal('some-namespace').ref('some-int-array').call(rows);
  }
}
class RowToVal extends RemoteExecWith {
  static run(rows, arr) {
    return rows.map((row) => arr[row] || 0);
  }
}
const moreThan20 = await new MoreThan20('some-namespace').ref('some-int-array-index').call();
```

The initial filtering query is split in two, with the first class that is defined and with the final constant that `await`s for the result. The class defined in the middle and used by the first class performs the actual record lookup, reproducing the earlier example of querying an indexed array with a where-like clause, but had to extend a different base class to get the desired behavior of being able to pass in an argument from the calling side versus not needing to with the first class.

If you're willing to risk some confusion on what is and is not allowed within the callback function, you can get something much closer to the original Alan code:

```js
const moreThan20 = await namespace('some-namespace')
  .ref('some-int-array-index')
  .run(async (idx) => {
    const rows = idx
      .filter((kv) => kv.key > 20)
      .map((kv) => kv.val)
      .reduce((rows, curr) => rows.concat(curr), []);
    return await namespace('some-namespace')
      .ref('some-int-array')
      .using(rows)
      .run((arr, rows) => rows.map((row) => arr[row] || 0));
  });
```

Any variables you want to use must be passed as arguments to the potentially-remote function now passed to a `run` method instead of a `closure` method, where each extra argument is declared with a `using` method call beforehand. This keeps things clean, but there are no safeguards against using a closure argument that will not be set as expected. Instead of language-level guarantees and principle-of-least-surprise consistency, we lose some consistency in closure function behavior for clarity in what the code is doing.

However, it should be possible to prevent people who don't understand this from causing invalid calculations in production by way of a source linting tool that detects closure variable usage that isn't top-level function/class/constant usage, reimposing "language-level" guarantees. This requires a framework that is integrated into your build process (for the linting) and your deployment process (for the consistent or rendezvous hash ring membership), but should be doable in any programming language, and can help improve the performance of many codebases without significantly impacting the clarity of intent.
