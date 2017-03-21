## 2.1.0 (3/21/2017)

Adds Rails-style yaml compatibility

Minor change: no longer performs diffing - writes files either way

## 2.0.0 (3/16/2017)

Breaks compatibility with Node 5.12.0 for ease of maintenance. New features like
Object constructing/destructuring are much appreciated.

### Config

- `path` and `output` consolidated as `dir`
- `type` renamed to `format`
