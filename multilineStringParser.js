const fs = require("fs");

var text = `
## API to create a channel

### Connect to user
Parameters
<!-- - type (optional,type=String, default : "messaging"),
  - available types : "commerce","gaming","livestream","messaging" and "team"
- name (optional,type=String, default : logged_user-user_id if not provided)
- image (optional,type=String (url/base64 encoded string), default: null)
- color (optional,type=String, default=Null) -->
- user_id (required,type=Array, atleast one member id(String) to connect )
   - eg. user_id : ["1","2"]

Response 
A successful response will give channel id in reponse , use that ```id``` as ```channel_id``` 
e.g. 
1. If a logged in user ```user_id = 1``` creates a channel with  ```user_id = 2``` , the req body shall look like as below

req 
```
{
    "user_id" = ["2"]
}
```
response
```
{
    "status": 200,
    "message": "success",
    "data":{
        "channel": {
            "id": "1-2",
             "type": "messaging",
             "cid": "messaging:1-2",
             ...
            
        }
        ...
    }
}
```
as you can see above channel created with  ```channel_id =  "1-2" ```
Note : If channel already exists between the following user it won't be created again. You can check API ```get channel by id```

### Connect to admin of project
Parameters
<!-- - type (optional,type=String, default : "messaging")
  - available types : "commerce","gaming","livestream","messaging" and "team"
- name (optional,type=String, default : project_id-logged_user-user_id if not provided)
- image (optional,type=String (url/base64 encoded string), default: null)
- color (optional,type=String, default=Null) -->
- project_id (required,type=Int, project id  to connect )
  - eg. project_id : 87

Response 
A successful response will give channel id in reponse , use that ```id``` as ```channel_id``` 
e.g. 
1. If a logged in user ```user_id = 4``` creates a channel with project id = 87 whose admin is ```user_id = 1``` , the req body shall look like as below

req 
```
{
    "project_id" : 87
}
```
response
```
{
    "status": 200,
    "message": "success",
    "data":{
        "channel": {
            "id": "p_87_1-4",
             "type": "messaging",
             "cid": "messaging:p_87_1-4",
             ...
            
        }
        ...
    }
}
```
as you can see above channel created with  ```channel_id =  "p_87_1-4" ``` format ```p_{project_id}_{user_ids.join('-').sort()}```

Note : If channel already exists between the following user it won't be created again. You can check API ```get channel by id```

`;
const data = JSON.stringify(text);
fs.writeFileSync("text", data);
decodeURIComponent("http%3A%2F%2Fmain-dev.blkqa.com%2F");