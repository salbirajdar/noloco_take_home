# Dublin Bikes API

## How to run

```
npm install
npm run dev
```

Runs on http://localhost:3000

## Endpoints

`GET /schema` - returns the derived schema

`POST /data` - returns filtered data

`GET /data/:id` - returns a single station by its Station id

### Filtering

```
curl -X POST http://localhost:3000/data \
  -H "Content-Type: application/json" \
  -d '{"where": {"availableBikes": {"gt": 20}}}'
```

Supported operators: `eq`, `gt`, `lt`. Multiple fields can be combined in `where` (AND logic).

### Sorting and pagination

```
curl -X POST http://localhost:3000/data \
  -H "Content-Type: application/json" \
  -d '{"orderBy": {"field": "availableBikes", "direction": "desc"}, "limit": 10, "offset": 0}'
```

### Single station

```
curl http://localhost:3000/data/5
```

## Example requests

```bash
# get the derived schema
curl -s http://localhost:3000/schema | python3 -m json.tool

# all data, no filters
curl -s -X POST http://localhost:3000/data -H "Content-Type: application/json" -d '{}'

# stations with more than 20 available bikes
curl -s -X POST http://localhost:3000/data -H "Content-Type: application/json" -d '{"where": {"availableBikes": {"gt": 20}}}'

# only CLOSED stations
curl -s -X POST http://localhost:3000/data -H "Content-Type: application/json" -d '{"where": {"status": {"eq": "CLOSED"}}}'

# multiple filters: OPEN stations with more than 30 bike stands
curl -s -X POST http://localhost:3000/data -H "Content-Type: application/json" -d '{"where": {"status": {"eq": "OPEN"}, "bikeStands": {"gt": 30}}}'

# order by available bikes descending, top 3
curl -s -X POST http://localhost:3000/data -H "Content-Type: application/json" -d '{"orderBy": {"field": "availableBikes", "direction": "desc"}, "limit": 3}'

# pagination: page 2 with 5 per page
curl -s -X POST http://localhost:3000/data -H "Content-Type: application/json" -d '{"limit": 5, "offset": 5}'

# single station by id
curl -s http://localhost:3000/data/5

# station not found
curl -s http://localhost:3000/data/999
```

## Technical decisions

- Went with TypeScript + Express since that's what Noloco uses
- Schema inference scans all rows, skips nulls, and picks the most specific type that fits. Falls back to TEXT for mixed types
- Used a cardinality threshold to tell OPTION fields apart from plain TEXT
- The dataset has some messy data (e.g. `banking` is sometimes a string "FALSE", sometimes a boolean) - the type inference handles this by checking all non-null values
- Data is fetched from the remote URL on startup, falls back to a local file if that fails. Cached in memory after first load
- Used lodash `camelCase` for field name normalization as the spec suggested

## Given more time

- Validation on request body
- Tests - especially around schema inference edge cases
- `not` operator for negating filters
- Delete/update endpoints for stations
- Cache the schema instead of recomputing every request
