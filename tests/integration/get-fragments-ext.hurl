# 1. POST Request: Create a Markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
`# This is a markdown fragment`

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
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 29

[Captures]
location: header "Location"
id: jsonpath "$.fragment.id"

# 2. GET Request: Retrieve the fragment with .md extension (should return as markdown)
GET {{location}}.md
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
status == 200
header "Content-Type" == "text/markdown"
body == "# This is a markdown fragment"

# 3. GET Request: Retrieve the fragment with .html extension (should convert to HTML)
GET {{location}}.html
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
status == 200
header "Content-Type" == "text/html"
body == "<h1>This is a markdown fragment</h1>"

# 4. GET Request: Retrieve the fragment with .txt extension (should convert to plain text)
GET {{location}}.txt
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
status == 200
header "Content-Type" == "text/plain"
body == "# This is a markdown fragment"

# 5. POST Request: Create a plain text fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`This is a plain text fragment.`

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

# 6. GET Request: Retrieve the plain text fragment with .txt extension (should return as plain text)
GET {{location}}.txt
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
status == 200
header "Content-Type" == "text/plain"
body == "This is a plain text fragment."
