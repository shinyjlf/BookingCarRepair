const zlib = require('zlib');

const PROXY_CONFIG_0 = {
  "/proxy": {
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

        let searchString = "<a class=\"btn popupTrigger\" data-popup=\"popup-contact\" href=\"#\">оставить заявку<\/a>"; //<a class="btn popupTrigger" data-popup="popup-contact" href="#">оставить заявку</a>
        let modalHtml1 = "<a class=\"btn popupTrigger\" id=\"myBtn750954\" href=\"#\">Запись в автосервис<\/a><div id=\"myModal750954\" class=\"popup active\" style=\"display:none\"><div class=\"modal750954-content\">" +
          "<div class=\"modal750954-header\"><span class=\"close750954\">&times;<\/span><h2>Запись в автосервис<\/h2><\/div><div class=\"modal750954-body\">";
        let iframe = "<iframe id=\"avtoServiceBookingFrame\" title=\"Запись в автосервис\" width=\"100%\" height=\"740px\" src=\"http:\/\/localhost:4200\/\" ><\/iframe>";
        let modalHtml2 = "<\/div><\/div><\/div >"; //<div class=\"modal750954-footer\"><h3><\/h3><\/div>
        bodyString = bodyString.replace(searchString, modalHtml1 + iframe + modalHtml2 + searchString);

        searchString = "<\/head>";
        let script = "<script type=\"text\/javascript\" src=\"http:\/\/localhost:4200\/assets\/modal.js\"><\/script>";
        let css = "<link rel=\"stylesheet\" href=\"http:\/\/localhost:4200\/assets\/modal.css\" type=\"text\/css\">";
        bodyString = bodyString.replace(searchString, script + css + searchString);


       


        //let str1 = "<base href=\"https:\/\/turboservice.ru\/\">";
       // bodyString = bodyString.replace(str1, "<base href=\"https:\/\/localhost:4200\/proxy\/\">")
           //const objectToModify = JSON.parse(bodyString);
        
        //console.log(objectToModify);

        //objectToModify.modification = 'Mickey Mouse';
        //res.end(JSON.stringify(objectToModify));
        res.end(bodyString);

      });
    }
  }
};


module.exports = PROXY_CONFIG_0;

