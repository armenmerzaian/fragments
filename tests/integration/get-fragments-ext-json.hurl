# 1. POST Request: Create a JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{
  "name": "John Doe",
  "age": 30,
  "email": "john.doe@example.com"
}

HTTP/1.1 201

[Asserts]
header "Content-Type" contains "application/json"
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"

status == 201

jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 72

[Captures]
location: header "Location"
id: jsonpath "$.fragment.id"

# 2. GET Request: Retrieve the fragment as JSON (no conversion)
GET {{location}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
status == 200
header "Content-Type" == "application/json"
jsonpath "$.name" == "John Doe"
jsonpath "$.age" == 30
jsonpath "$.email" == "john.doe@example.com"

# 3. GET Request: Retrieve the fragment with .yaml extension (convert to YAML)
GET {{location}}.yaml
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
status == 200
header "Content-Type" contains "yaml"
body contains "name: John Doe"
body contains "age: 30"
body contains "email: john.doe@example.com"

# 4. GET Request: Retrieve the fragment with .yml extension (convert to YAML)
GET {{location}}.yml
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
status == 200
header "Content-Type" contains "yaml"
body contains "name: John Doe"
body contains "age: 30"
body contains "email: john.doe@example.com"
