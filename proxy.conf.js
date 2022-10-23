const zlib = require('zlib');

const PROXY_CONFIG = {
  "/api": {
    "target": "https://turboservice.ru/skrytye-stati/ZNR",
    "changeOrigin": true,
    "secure": false,
    "logLevel": "debug",
    "selfHandleResponse": true,
    "onProxyRes": function (proxyRes, req, res) {
      //proxyRes.removeHeader('Origin'); //With this, bye bye to the “Invalid CORS” error message 

      let originalBody = Buffer.from([]);
      proxyRes.on('data', data => { originalBody = Buffer.concat([originalBody, data]); });
      proxyRes.on('end', () => {
        let bodyString = zlib.gunzipSync(originalBody).toString('utf8');
        console.log('proxy');
        console.log(bodyString);
        let str = "<a class=\"btn popupTrigger\" data-popup=\"popup-contact\" href=\"#\">оставить заявку<\/a>"; //<a class="btn popupTrigger" data-popup="popup-contact" href="#">оставить заявку</a>
        bodyString = bodyString.replace(str, "<app-root><\/app-root> " + str);


        let str1 = "<base href=\"https:\/\/turboservice.ru\/\">";
        //bodyString = bodyString.replace(str1, "<base href=\" \/\">")
           //const objectToModify = JSON.parse(bodyString);
        
        //console.log(objectToModify);

        //objectToModify.modification = 'Mickey Mouse';
        //res.end(JSON.stringify(objectToModify));
        res.end(bodyString);

      });
    }
  }
};
module.exports = PROXY_CONFIG;



/*
{
  "/proxy": {
    "target": "https://turboservice.ru/skrytye-stati/ZNR",
      "secure": false,
        "changeOrigin": true,
          "logLevel": "debug",
            "onProxyRes": (proxyRes, req, res) => {
              let originalBody = Buffer.from([]);


            }
  }
}
*/

 //if (pr.headers['set-cookie']) {
      //  const cookies = pr.headers['set-cookie'].map(cookie =>
      //    cookie.replace(/;(\ )*secure/gi, '')
      //  );
      //  pr.headers['set-cookie'] = cookies;
      //}
