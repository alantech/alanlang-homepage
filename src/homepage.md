&nbsp;

<center>
  <img src="alan-logo.png" alt="drawing" width="180"/>
  <h1 style="color: var(--title);">The Alan Programming Language</h1>
</center>

<div class="row">
  <div class="column">
    <center>
      <img src="implicit-parallel.png" alt="drawing" width="120"/>
    </center>
    <h3 style="margin-top:0;">Implicitly parallel across events, arrays and IO</h3>
    Alan recognizes and exploits opportunities for parallelization without parallel programming (threads, channels, futures, locks, etc.)
  </div>
  <div class="column">
    <center>
      <img src="runtime-safety.png" alt="drawing" width="120"/>
    </center>
    <h3 style="margin-top:0;">No race conditions and fewer runtime errors</h3>
    Deadlocks, livelocks, undefined variables, divide-by-zero, integer under/overflow, array out-of-bounds access, etc, are not possible in Alan.
  </div>
  <div class="column">
    <center>
      <img src="permissions.png" alt="drawing" width="120"/>
    </center>
    <h3 style="margin-top:0;">Granular third party permissions</h3>
    Alan's module resolution mechanism allows you to prevent third party dependencies from having access to standard libraries that they should not have access to.
  </div>
</div>

&nbsp;

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

<a id="run-playground" onclick="analytics.track('RunPlayground');" class="cta-button">Run this code</a>

## Compare Alan

<center>
  <div class="tabs-container">
    <div class="tabs effect">        
      <input type="radio" id="tab-1" name="tab-effect" checked="checked">
      <span class="tab-indicator"></span>
      <input type="radio" id="tab-2" name="tab-effect">
      <span class="tab-indicator"></span>
      <input type="radio" id="tab-3" name="tab-effect">
      <span class="tab-indicator"></span>
      <!-- tab-content -->
      <div class="tab-content">
        <section id="tab-go">
          <pre class="code-border alan"><code class="language language-alan">
  /* ALAN runs array operations in parallel
  utilizing all the available CPU cores
  if the array is large enough
  and the inner function given to it is pure. */
  fn sumMaybeConcurrent(nums: Array&lt;int&gt;): int {
    return nums.reducePar(fn (accum: int, val: int): int = accum + val)
  }
          </code></pre>
          <pre class="code-border"><code class="language language-golang">
  /* GOLANG
  https://play.golang.org/p/yB7gR3r09ZU
  */
  func sum(nums []int, out chan int) {
    var sum int
    for _, num := range nums {
      sum += num
    }
    out <- sum
  }
  func sumConcurrent(numbers []int) int {
    threads := runtime.NumCPU() - 1
    out := make(chan int)
    stride := len(numbers) / threads
    for i := 0; i < threads; i++ {
      go sum(numbers[i*stride:(i*stride)+stride], out)
    }
    go sum(numbers[threads*stride:len(numbers)], out)
    var s int
    for i := 0; i <= threads; i++ {
      s += <-out
    }
    return s
  }
          </code></pre>
        </section>
        <section id="tab-java">
        <pre class="code-border alan"><code class="language language-alan">
  /* ALAN */
  fn fetchAndSum(urls: Array&lt;string&gt;): int {
    return urls
      .map(fn (url: string): int {
        const website = http.get(url) || http.none
        return toString(website.body).length()
      })
      .reducePar(fn (accum: int, val: int): int = accum + val)
  }
        </code></pre>
        <pre class="code-border"><code class="language language-java">
  /* JAVA */
  Integer fetchAndSum(String...urls) {
    var sum = CompletableFuture.completedFuture(0);
    try {
      return Stream
            .of(urls)
            .parallel()
            .map(url -> httpClient
                .sendAsync(request(url), BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenApply(String::length))
            .reduce(sum, (prev, curr) -> prev
                .thenCombine(curr, (p, c) -> p + c))
            .get();
    } catch(Exception e){
      System.out.println(e.toString());
      return 0;
    }
  }
        </code></pre>
        </section>
        <section id="tab-js">
                  <pre class="code-border alan"><code class="language language-alan">
  /* ALAN automatically executes IO concurrently when possible */
  fn getValidUids() {
    const authUids = Auth.getAllUsers().map(fn (u: AuthUser): int = u.id)
    const dbUids = Store.getAllUsers().map(fn (u: User): int = u.uid)
    const crmUids = Crm.getAllUsers().map(fn (u: CrmUser): int = u.uid)
    return authUids.filter(fn (v: int): bool = dbUids.has(v) && crmUids.has(v))
  }
        </code></pre>
        <pre class="code-border"><code class="language language-javascript">
  /* NODE.JS equivalent */
  async function getValidUids() {
    const [authUsers, dbUsers, crmUsers] = await Promise.all([
      Auth.getAll(),
      Store.getAllUsers(),
      Crm.getAllUsers()
    ]);
    const authUids = authUsers.map(u => u['id']);
    const dbUids = dbUsers.map(u => u['uid']);
    const crmUids = crmUsers.map(u => u['uid']);
    return authUids.filter(v => dbUids.includes(v) && crmUids.includes(v))
  }
        </code></pre>
        </section>
      </div>
    </div>
  </div>
</center>

&nbsp;

<center>
  <a href="https://docs.alan-lang.org/getting_started.html" onclick="analytics.track('DownloadCTA');" class="cta-button">Get Started</a>
</center>

## Contact

Please reach out on [Discord](https://discord.gg/XatB9we), [Reddit](https://www.reddit.com/r/alanlang) or email us at hello at alantechnologies dot com.