# TypeBox Dense Reference

JSON Schema Type Builder with Static Type Resolution for TypeScript

## Install

```bash
npm install typebox
# or
import { Type } from 'https://deno.land/x/typebox/src/typebox.ts'
```

## Core Concepts

TypeBox creates in-memory JSON Schema objects that infer as TypeScript types. Schemas compose like TypeScript types, validatable at runtime via standard JSON Schema.

```typescript
import { Type } from 'typebox'
import { Value } from 'typebox/value'
import { Compile } from 'typebox/compile'

const T = Type.Object({
  x: Type.Number(),
  y: Type.Number(),
  z: Type.Number()
})

type T = Type.Static<typeof T>
```

## Value Module - Functional Operations

### Core Functions

**Value.Check(schema, value): boolean**
Returns true/false without throwing

**Value.Parse(schema, value): T**
Kitchen sink: Clone → Clean → Default → Convert → Decode → Assert
Throws on validation failure

**Value.Assert(schema, value): asserts value**
Type guard, throws if invalid

**Value.Convert(schema, value): value**
Type coercion (e.g., "true" → true, "42" → 42)

**Value.Clone(value): value**
Deep structural clone

**Value.Clean(schema, value): value**
Remove properties not in schema

**Value.Default(schema, value): value**
Apply default values from schema

**Value.Decode(schema, value): T**
Run transform decode pipeline

**Value.Encode(schema, value): U**
Run transform encode pipeline

### Functional Pipeline Patterns

```typescript
const pipeline = (schema, value) => 
  Value.Decode(schema,
    Value.Clean(schema,
      Value.Default(schema,
        Value.Convert(schema,
          Value.Clone(value)))))

const parsed = Value.Parse(T, data)

const custom = (schema, value) => {
  const cloned = Value.Clone(value)
  const cleaned = Value.Clean(schema, cloned)
  const converted = Value.Convert(schema, cleaned)
  return Value.Assert(schema, converted), converted
}
```

### Structural Operations

**Value.Diff(source, target): Edit[]**
Structural difference

**Value.Patch(source, edits): value**
Apply edits from Diff

**Value.Hash(value): number**
FNV1A-32 hash

**Value.Equal(left, right): boolean**
Deep equality

**Value.Cast(schema, value): T**
Coerce value to schema (best effort)

**Value.Mutate(target, value): void**
Deep mutable assignment, preserves references

## Compile Module - JIT Validation

High-performance JIT compiler for schemas. Optimized for both fast compilation and validation.

```typescript
import { Compile } from 'typebox/compile'

const C = Compile(Type.Object({
  x: Type.Number(),
  y: Type.Number()
}))

C.Check(value)
C.Parse(value)
C.Encode(value)
C.Decode(value)
```

## Transform Types - Encode/Decode

Transform types work with Encode/Decode for type conversion between JSON and JavaScript constructs.

```typescript
const DateFromNumber = Type.Transform(Type.Number())
  .Decode(value => new Date(value))
  .Encode(value => value.getTime())

const decoded = Value.Decode(DateFromNumber, 0)
const encoded = Value.Encode(DateFromNumber, decoded)

type Decoded = Type.StaticDecode<typeof DateFromNumber>
type Encoded = Type.StaticEncode<typeof DateFromNumber>
```

### Complex Transform

```typescript
const JsonString = Type.Transform(Type.String())
  .Decode(value => JSON.parse(value))
  .Encode(value => JSON.stringify(value))

const T = Type.Object({ data: JsonString })
const decoded = Value.Decode(T, { data: '{"key": 123}' })
const encoded = Value.Encode(T, decoded)
```

## Type Builders

### Primitives

```typescript
Type.String({ minLength: 1, maxLength: 100, pattern: '^[a-z]+$', format: 'email' })
Type.Number({ minimum: 0, maximum: 100, multipleOf: 5 })
Type.Integer({ exclusiveMinimum: 0 })
Type.Boolean()
Type.Null()
Type.Literal('value' | 42 | true)
Type.Any()
Type.Unknown()
Type.Never()
Type.Void()
```

### Composite Types

```typescript
Type.Object({
  x: Type.Number(),
  y: Type.Optional(Type.String())
}, { additionalProperties: false })

Type.Array(Type.Number(), { minItems: 1, maxItems: 10, uniqueItems: true })

Type.Tuple([Type.String(), Type.Number()])

Type.Union([Type.String(), Type.Number()])

Type.Intersect([
  Type.Object({ x: Type.Number() }),
  Type.Object({ y: Type.String() })
])

Type.Record(Type.String(), Type.Number())

Type.Partial(Type.Object({ x: Type.Number() }))

Type.Required(Type.Object({ x: Type.Optional(Type.Number()) }))

Type.Pick(T, ['x', 'y'])

Type.Omit(T, ['z'])
```

### Advanced Types

```typescript
Type.Ref(T)

Type.Recursive(Self => Type.Object({
  id: Type.String(),
  children: Type.Array(Self)
}))

Type.TemplateLiteral('user-${string}-${number}')
Type.TemplateLiteral([Type.Literal('user-'), Type.String(), Type.Literal('-'), Type.Number()])

Type.Enum({ A: 1, B: 2 })

Type.Const({ x: 1, y: 2 })

Type.Awaited(Type.Promise(Type.Number()))

Type.Uint8Array()
```

## Functional Composition Patterns

### Composing Schemas

```typescript
const Point = Type.Object({
  x: Type.Number(),
  y: Type.Number()
})

const Point3D = Type.Intersect([
  Point,
  Type.Object({ z: Type.Number() })
])

const OptionalPoint = Type.Partial(Point)

const RequiredFields = Type.Pick(Point3D, ['x', 'y'])
```

### Higher-Order Type Functions

```typescript
const Nullable = <T extends TSchema>(schema: T) =>
  Type.Union([schema, Type.Null()])

const WithId = <T extends TSchema>(schema: T) =>
  Type.Intersect([
    Type.Object({ id: Type.String() }),
    schema
  ])

const Paginated = <T extends TSchema>(item: T) =>
  Type.Object({
    items: Type.Array(item),
    total: Type.Number(),
    page: Type.Number()
  })

const User = Type.Object({ name: Type.String() })
const NullableUser = Nullable(User)
const UserWithId = WithId(User)
const PaginatedUsers = Paginated(User)
```

### Validation Pipeline

```typescript
const validate = <T extends TSchema>(schema: T) => (value: unknown): Type.Static<T> => {
  const cleaned = Value.Clean(schema, value)
  const converted = Value.Convert(schema, cleaned)
  if (!Value.Check(schema, converted)) {
    throw new Error('Validation failed')
  }
  return converted
}

const parseUser = validate(Type.Object({
  name: Type.String(),
  age: Type.Number()
}))

const user = parseUser({ name: "Alice", age: "30" })
```

### Compose Validators

```typescript
const withDefaults = <T extends TSchema>(schema: T) => (value: unknown) =>
  Value.Default(schema, value)

const withConversion = <T extends TSchema>(schema: T) => (value: unknown) =>
  Value.Convert(schema, value)

const withCleaning = <T extends TSchema>(schema: T) => (value: unknown) =>
  Value.Clean(schema, value)

const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x)

const processor = <T extends TSchema>(schema: T) =>
  pipe(
    withDefaults(schema),
    withConversion(schema),
    withCleaning(schema),
    v => (Value.Assert(schema, v), v)
  )
```

## Error Handling

```typescript
import { ValueError } from 'typebox/value'

try {
  Value.Assert(schema, value)
} catch (error) {
  if (error instanceof ValueError) {
    for (const err of error.Errors()) {
      console.log({
        path: err.path,
        message: err.message,
        value: err.value,
        schema: err.schema
      })
    }
  }
}

const formatErrors = (errors: ValueError[]) =>
  errors.map(err => `${err.path}: ${err.message}`)
```

## Performance Optimization

```typescript
const C = Compile(schema)

for (const item of largeDataset) {
  C.Check(item)
}

const optimizedParse = (schema, value) => {
  const converted = Value.Convert(schema, value)
  const cleaned = Value.Clean(schema, converted)
  return Value.Assert(schema, cleaned), cleaned
}
```

## Custom Formats & Types

```typescript
import { FormatRegistry, TypeRegistry, Kind } from 'typebox'

FormatRegistry.Set('uuid', value => 
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
)

const Uuid = Type.String({ format: 'uuid' })

TypeRegistry.Set('Email', (schema, value) =>
  typeof value === 'string' && /@/.test(value)
)

const Email = { [Kind]: 'Email' } as TSchema
```

## Script - TypeScript Syntax Parser

```typescript
import { Type } from 'typebox'

const T = Type.Script(`{
  x: number,
  y: string,
  z: boolean
}`)

const S = Type.Script({ T }, `{
  [K in keyof T]: T[K] | null
}`)

type S = Type.Static<typeof S>
```

## Common Patterns

### Environment Config

```typescript
const EnvSchema = Type.Object({
  DATABASE_URL: Type.String({ default: 'postgres://localhost' }),
  PORT: Type.Number({ default: 8080 }),
  DEBUG: Type.Boolean({ default: false })
})

const loadEnv = (env: Record<string, string>) => {
  const converted = Value.Convert(EnvSchema, env)
  const defaulted = Value.Default(EnvSchema, converted)
  return Value.Parse(EnvSchema, defaulted)
}
```

### API Response

```typescript
const ApiResponse = <T extends TSchema>(data: T) =>
  Type.Union([
    Type.Object({
      success: Type.Literal(true),
      data
    }),
    Type.Object({
      success: Type.Literal(false),
      error: Type.String()
    })
  ])

const UserResponse = ApiResponse(Type.Object({ name: Type.String() }))
```

### Recursive Types

```typescript
const TreeNode = Type.Recursive(Self =>
  Type.Object({
    value: Type.Number(),
    left: Type.Optional(Self),
    right: Type.Optional(Self)
  })
)

type TreeNode = Type.Static<typeof TreeNode>
```

## Key Differences from Zod

- TypeBox generates JSON Schema (interoperable)
- Separate Check/Parse/Convert operations (composable)
- JIT compilation for high performance
- Transform encode/decode pipeline
- Draft 3-2020-12 JSON Schema compliance
