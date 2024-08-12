# 1. POST Request: Create a YAML fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/yaml
[BasicAuth]
user1@email.com:password1
```
name: John Doe
age: 99```

# 1. We expect to get back an HTTP 201
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
jsonpath "$.fragment.type" == "application/yaml"
jsonpath "$.fragment.size" == 22

[Captures]
url: header "Location"

# 2. Try to GET the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
header "Content-Type" contains "application/yaml"
header "Content-Length" == "22"

status == 200

body == "name: John Doe\nage: 99"
