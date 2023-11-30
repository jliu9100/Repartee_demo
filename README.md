## Task
1. User submit API_KEY(String) and model_id(INT) to authenticate the server.

- a. If API key is invalid, return HTTP authentication failure error
- b. If successful, Returns the org_id(INT), from server  and JWT token.(need display on demo)

2. User input PROMPT(String) and RESPONSE(String) and submit to the server via HTTPS by Clicking "Submit Hallucination" button.

- a. Calls "POST Hallucination" restfulAPI.
Server will get encryrption_key(INT) based on the org_id and encrypt the PROMPT and RESPONSE.
- b. Server will "Insert Hallucination" backend API to insert all the data into the Hallucination table.

3. User can display the inserted Hallucination data by click “display Hallucination”.
- a. Call “GET Hallucination" restfulAPI.
Server will get decryrption_key(INT) based on the org_id and decrypt the PROMPT and RESPONSE.
- b. Server will return the Hallucination table to the client

NOTE: encryrption_key(INT)/decryrption_key(INT) are public/private key pair that is generated separately in advance and stored in the DB via org_id.