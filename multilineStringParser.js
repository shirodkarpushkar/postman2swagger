const fs = require("fs");

var text = `

## API for sending email messages.

### Connect to user
Parameters
- user_id (required, type= Int ,  id of user)
- subject (optional, type= String, subject of email )
- message (optional, type= String, body of email, can contain html as well )
- important (optional, type= Boolean, default=false, mark email important )
- attachments (optional, type= Array, attachment in files and images if any  )
 -  a single object may of attachment Array can contain
   - type    : the MIME type of the attachment
   - name    : the file name of the attachment
   - content : the content of the attachment as a base64-encoded string


- images (optional, type= Array, can contain embedded images  of message )
 -  a single object may of attachment Array can contain
   - type    : the MIME type of the attachment
   - name    : the file name of the attachment
   - content : the content of the attachment as a base64-encoded string

### Connect to the admin of project
Parameters
- project_id (required, type= Int ,  id of project)
- subject (optional, type= String, subject of email )
- message (optional, type= String, body of email, can contain html as well )
- important (optional, type= Boolean, default=false, mark email important )
- attachments (optional, type= Array, attachment in files and images if any  )
 -  a single object may of attachment Array can contain
   - type    : the MIME type of the attachment
   - name    : the file name of the attachment
   - content : the content of the attachment as a base64-encoded string


- images (optional, type= Array, can contain embedded images  of message )
 -  a single object may of attachment Array can contain
   - type    : the MIME type of the attachment
   - name    : the file name of the attachment
   - content : the content of the attachment as a base64-encoded string


`;
const data = JSON.stringify(text);
fs.writeFileSync("text", data);


