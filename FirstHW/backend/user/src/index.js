let express = require('express');
let app = express();

const SERVER_NAME = process.env.SERVER_NAME || "Who I am?";

app.get('/api/users/whois', (request, response) => {

    return response.status(200).json({
       serverName: SERVER_NAME
    });

})

app.listen(80, () => {
    console.log("http server started");
});