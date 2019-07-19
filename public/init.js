window.App = {};
    (function()
    {    
        var app = { };

        app.init = function() {

            loadJSONConfig(function(response) {
                
                // Parse JSON string into object
                var jsonConfig = JSON.parse(response);
                App.cloud = jsonConfig.cloudHost;
                //App.cloud = jsonConfig.cloudHostUrl;
                console.log('cloud.host init', App.cloud);  
                //load rest of bundles js app once App.cloud is here
                var script = document.createElement('script');
                script.src = 'js/main.js';

                document.body.appendChild(script);
                return app;    
            });
        }();
    }
    )();  

    function loadJSONConfig(callback) {   
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', 'config.json', true); // Replace 'my_data' with the path to your file
        xobj.onreadystatechange = function () {
              if (xobj.readyState == 4 && (xobj.status == "200" || xobj.status == "0")) {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                callback(xobj.responseText);
              }
        };
        xobj.send(null);  
     }
