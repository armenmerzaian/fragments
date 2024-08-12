# 1. POST Request: Create a plain text fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`This is a plain text fragment.`

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
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 30

[Captures]
location: header "Location"
id: jsonpath "$.fragment.id"

# 2. GET Request: Retrieve all fragments (IDs only)
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
status == 200
jsonpath "$.status" == "ok"
jsonpath "$.fragments" includes {{id}}

# 3. GET Request: Retrieve all fragments with full metadata
GET http://localhost:8080/v1/fragments?expand=1
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
status == 200
jsonpath "$.status" == "ok"
jsonpath "$.fragments" exists

# 4. GET Request: Retrieve specific fragment by ID
GET {{location}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
status == 200
header "Content-Type" == "text/plain"
body == "This is a plain text fragment."

# 5. GET Request: Retrieve specific fragment metadata by ID
GET {{location}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
status == 200
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{id}}"
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 30
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
