# 1. POST Request: Create a plain text fragment to be deleted later
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`This is a fragment to be deleted.`

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
jsonpath "$.fragment.size" == 33

[Captures]
location: header "Location"
id: jsonpath "$.fragment.id"

# 2. DELETE Request: Delete the fragment by ID
DELETE {{location}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
status == 200
jsonpath "$.status" == "ok"

# 3. GET Request: Try to retrieve the deleted fragment by ID
GET {{location}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404

[Asserts]
status == 404
jsonpath "$.status" == "error"

# 4. GET Request: Try to retrieve the deleted fragment metadata by ID
GET {{location}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404

[Asserts]
status == 404
jsonpath "$.status" == "error"
