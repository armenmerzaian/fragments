# Tests that posting an unsupported Content-Type throws a 415 error

POST http://localhost:8080/v1/fragments
Content-Type: application/msword
[BasicAuth]
user1@email.com:password1
`This is a fragment!`

# 1. We expect to get back an HTTP 201
HTTP/1.1 415

[Asserts]
header "Content-Type" contains "application/json"
header "Content-Type" contains "utf-8"
# Verify that the response status is 415
status == 415
# Check for an error message in the response body
jsonpath "$.error" exists
jsonpath "$.error.message" isString
