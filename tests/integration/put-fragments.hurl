# 1. POST a new JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{ "key": "initial value" }

# 2. Confirm 201 status and capture Location and id
HTTP/1.1 201
[Captures]
fragment_url: header "Location"
fragment_id: jsonpath "$.fragment.id"

[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"

# 3. GET the fragment metadata
GET {{fragment_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment" exists
jsonpath "$.fragment.size" == 26
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.id" == {{fragment_id}}
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString

# 4. PUT to update the fragment
PUT {{fragment_url}}
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{ "key": "updated value" }

HTTP/1.1 200

# 5. GET the updated fragment metadata
GET {{fragment_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment" exists
jsonpath "$.fragment.size" == 26
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.id" == {{fragment_id}}
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
