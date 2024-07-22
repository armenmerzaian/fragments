# Tests that unauthorized posting throws a 401 error

POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:invalid_password
`This is a fragment!`

# 1. We expect to get back an HTTP 201
HTTP/1.1 401

[Asserts]
header "Content-Type" contains "application/json"
header "Content-Type" contains "utf-8"

status == 401

jsonpath "$.error" exists
jsonpath "$.error.message" isString
jsonpath "$.error.message" contains "Unauthorized"
jsonpath "$.status" == "error"
