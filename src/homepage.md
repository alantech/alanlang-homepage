&nbsp;

<center>
  <img src="alan-logo.png" alt="drawing" width="180"/>
  <h1 style="color: var(--title);">The Alan Programming Language</h1>
</center>

&nbsp;

The `alan` compiler and runtime apply the possible parallelism in the users' code without the need for concurrent or asynchronous programming.
`alan` enforces predictable execution by not allowing unbounded loops nor recursion.

&nbsp;

<center>
  <button onclick="window.location.href='https://github.com/alantech/alan'" class="cta-button">Download Alan</button>
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

&nbsp;

<center>
  <button onclick="window.location.href='https://github.com/alantech/alan'" class="cta-button">Download Alan</button>
</center>

## About us

We are a team of developers based in the Bay Area, CA that got tired of re-writing software products as they scaled.
Please reach out on [Discord](https://discord.gg/XatB9we) or email us at hello at alantechnologies dot com.