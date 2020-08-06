&nbsp;

<center>
  <img src="alan-logo.png" alt="drawing" width="180"/>
  <h1 style="color: var(--title);">The Alan Programming Language</h1>
</center>

&nbsp;

The `alan` compiler and runtime apply the possible parallelism in the users' code without the need for concurrent or asynchronous programming.`alan` enforces predictable execution by **only** allowing loops and recursion that is guaranteed to halt (e.g. no `while (true) {}` loops).

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
      <li class="carousel__slide">
        <pre class="code-border"><code class="language-javascript">
  /* ALAN */
  const authUsers = Auth.getAllUsers()
  const dbUsers = Store.getAllUsers()
  const crmUsers = Crm.getAllUsers()
        </code></pre>
        <pre class="code-border"><code class="language-javascript">
  /* NODE.JS */
  const [authUsers, dbUsers, crmUsers] = await Promise.all([
    Auth.getAll(),
    Store.getAllUsers(),
    Crm.getAllUsers()
  ]);
        </code></pre>
      </li>
      <li class="carousel__slide">
        <pre class="code-border"><code class="language-javascript">
  /* ALAN */
  const authUsers = Auth.getAllUsers()
  const dbUsers = Store.getAllUsers()
  const crmUsers = Crm.getAllUsers()
        </code></pre>
        <pre class="code-border"><code class="language-javascript">
  /* NODE.JS */
  const [authUsers, dbUsers, crmUsers] = await Promise.all([
    Auth.getAll(),
    Store.getAllUsers(),
    Crm.getAllUsers()
  ]);
        </code></pre>
      </li>
      <li class="carousel__slide">
        <pre class="code-border"><code class="language-javascript">
  /* ALAN */
  const authUsers = Auth.getAllUsers()
  const dbUsers = Store.getAllUsers()
  const crmUsers = Crm.getAllUsers()
        </code></pre>
        <pre class="code-border"><code class="language-javascript">
  /* NODE.JS */
  const [authUsers, dbUsers, crmUsers] = await Promise.all([
    Auth.getAll(),
    Store.getAllUsers(),
    Crm.getAllUsers()
  ]);
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