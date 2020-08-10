&nbsp;

<center>
  <img src="alan-logo.png" alt="drawing" width="180"/>
  <h1 style="color: var(--title);">The Alan Programming Language</h1>
</center>

&nbsp;

The `alan` compiler and runtime can parallelize your code without concurrent or asynchronous programming (threads, promises, channels, etc) by only allowing iteration and recursion that is guaranteed to halt (e.g. no `while (true) {}` loops)

&nbsp;

<center>
  <button onclick="window.location.href='https://docs.alan-lang.org/#installation'" class="cta-button">Download Alan</button>
</center>

## Try Alan

<table style="width: 100%;">
<tr>
<th></th>
<th></th>
</tr>
<tr>
<td>

```rust,editable,ignore,mdbook-runnable
import @std/app

on app.start {
  app.print("Hello, World!")
  emit app.exit 0
}
```

</td>
</table>

## Compare Alan

<center>
  <div class="carousel-container">
    <ul class="carousel my-carousel carousel--thumb">
      <input class="carousel__activator" type="radio" id="1" name="thumb" checked="checked"/>
      <input class="carousel__activator" type="radio" id="2" name="thumb"/>
      <input class="carousel__activator" type="radio" id="3" name="thumb"/>
      <div class="carousel__controls">
        <label class="carousel__control carousel__control--backward" for="3"></label>
        <label class="carousel__control carousel__control--forward" for="2"></label>
      </div>
      <div class="carousel__controls">
        <label class="carousel__control carousel__control--backward" for="1"></label>
        <label class="carousel__control carousel__control--forward" for="3"></label>
      </div>
      <div class="carousel__controls">
        <label class="carousel__control carousel__control--backward" for="2"></label>
        <label class="carousel__control carousel__control--forward" for="1"></label>
      </div>
      <li class="carousel__slide"><!-- Fake for weird CSS reasons --></li>
      <li class="carousel__slide">
        <pre class="code-border"><code class="language-javascript">
  /* ALAN automatically executes IO in parallel when possible */
  fn getValidUids() {
    const authUids = Auth.getAllUsers().map(fn (u: AuthUser) = u.id)
    const dbUsers = Store.getAllUsers().map(fn (u: User) = u.uid)
    const crmUsers = Crm.getAllUsers().map(fn (u: CrmUser) = u.uid)
    const validUids = authUids.filter(v => dbUids.has(v) && crmUids.has(v))
  }
        </code></pre>
        <pre class="code-border"><code class="language-javascript">
  /* NODE.JS equivalent */
  async function getValudUids() {
    const [authUsers, dbUsers, crmUsers] = await Promise.all([
      Auth.getAll(),
      Store.getAllUsers(),
      Crm.getAllUsers()
    ]);
    const authUids = authUsers.map(u => u['id']);
    const dbUids = dbUsers.map(u => u['uid']);
    const crmUids = crmUsers.map(u => u['uid']);
    const validUids = authUids.filter(v => dbUids.includes(v) && crmUids.includes(v))
  }
        </code></pre>
      </li>
      <li class="carousel__slide">
        <pre class="code-border"><code class="language-golang">
  /* ALAN automatically executes CPU operations in parallel when sensible */
  fn sumMaybeConcurrent(nums: Array&lt;int&gt;): int {
    return nums.reduce(fn (accum: int, val: int): int = accum + val)
  }
        </code></pre>
        <pre class="code-border"><code class="language-golang">
  /* GOLANG */
  func sumConcurrent(numbers []int) int {
    var v int64
    totalNumbers := len(numbers)
    goroutines := runtime.NumCPU()
    lastGoroutine := goroutines - 1
    stride := totalNumbers / goroutines
    var wg sync.WaitGroup
    wg.Add(goroutines)
    for g := 0; g < goroutines; g++ {
      go func(g int) {
        start := g * stride
        end := start + stride
        if g == lastGoroutine {
          end = totalNumbers
        }
        var lv int
        for _, n := range numbers[start:end] {
          lv += n
        }
        atomic.AddInt64(&v, int64(lv))
        wg.Done()
      }(g)
    }
    wg.Wait()
    return int(v)
  }
        </code></pre>
      </li>
      <li class="carousel__slide">
        <pre class="code-border"><code class="language-golang">
  /* ALAN */
  fn fetchAndSum(urls: Array&lt;string&gt;): int {
    return nums
      .map(fn (url: string) = http.get(url).body.toString().length)
      .reduce(fn (accum: int, val: int): int = accum + val)
  }
        </code></pre>
        <pre class="code-border"><code class="language-java">
  /* JAVA */
  CompletableFuture<Integer> fetchAndSum(String...urls) {
    return Stream
      .of(urls)
      .parallel()
      .map(url -> httpClient
        .sendAsync(request(url), BodyHandlers.ofString()) // 1 - Fetch the url
        .thenApply(HttpResponse::body)                    // 2 - Read the body
        .thenApply(String::length)                        // 3 – Get body’s length
        .whenComplete((l, err) -> out.printf("=======> from %s\n", url)))
      .reduce(sum, (prev, curr) -> prev
        .thenCombine(curr, (p, c) -> p + c));             // 4 - Sum lengths
  }
        </code></pre>
      </li>
      <div class="carousel__indicators">
        <label class="carousel__indicator" for="1"></label>
        <label class="carousel__indicator" for="2"></label>
        <label class="carousel__indicator" for="3"></label>
      </div>
    </ul>
  </div>
</center>

&nbsp;

<center>
  <button onclick="window.location.href='https://docs.alan-lang.org/#installation'" class="cta-button">Download Alan</button>
</center>

## About us

We are a team of developers based in the Bay Area, CA that got tired of re-writing software products as they scaled.
Please reach out on [Discord](https://discord.gg/XatB9we) or email us at hello at alantechnologies dot com.