&nbsp;

<!--- NavBar --->
<div style="text-align: right">
  <span>
    <a style="text-align: right; text-decoration: none; color: var(--fg);" href="https://docs.alantechnologies.com">
      <b>Docs</b>
    </a>
  </span>
  &nbsp;
  &nbsp;
  <span>
    <a style="text-align: right; text-decoration: none; color: var(--fg);" href="https://docs.alantechnologies.com">
      <b>Blog</b>
    </a>
  </span>
  &nbsp;
  &nbsp;
  <span>
    <a style="text-align: right; text-decoration: none; color: var(--fg);" href="https://github.com/alantech">
      <b>Github</b>
    </a>
  </span>
</div>

&nbsp;

<center>
  <img src="alan-logo.png" alt="drawing" width="180"/>
  <h1 style="color: var(--title);">The Alan Programming Language</h1>
</center>

&nbsp;

`alan` has predictable execution by not allowing unbounded loops nor recursion.
The `alan` compiler and runtime apply the possible parallelism in the users' code without the need for concurrent or asynchronous programming.
Learn more about `alan` through our [blog](), [documentation](https://docs.alantechnologies.com), or [source code](https://github.com/alantech).

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

<table style="width: 100%;">
<tr>
<th></th>
<th></th>
</tr>
<tr>
<td>

```rust,ignore
/* ALAN */

int foo() {
int result = 4;
return result;
}
```

</td>
<td>

```javascript
/* NODE.JS */

int foo() {
int x = 4;
return x;
}
```

</td>
</tr>
</table>

<table style="width: 100%;">
<tr>
<th></th>
<th></th>
</tr>
<tr>
<td>

```go
/* GOLANG */

int foo() {
int result = 4;
return result;
}
```

</td>
<td>

```java
/* JAVA */

int foo() { 
int x = 4;
return x;
}
```

</td>
</tr>
</table>

## About us

We are a team of developers based in the Bay Area, CA that got tired of re-writing software products as they scaled.
Please reach out on [Discord](https://discord.gg/XatB9we) or email us at hello at alantechnologies dot com.