// Called after form input is processed
function startConnect() {
    // Generate a random client ID
    clientID = "clientID-" + parseInt(Math.random() * 100);

    // Fetch the hostname/IP address and port number from the form
    host = "test.mosquitto.org";
    port = "8080";

    // Print output for the user in the messages div
    document.getElementById("messages").innerHTML += '<span>Connecting to: ' + host + ' on port: ' + port + '</span><br/>';
    document.getElementById("messages").innerHTML += '<span>Using the following client value: ' + clientID + '</span><br/>';

    // Initialize new Paho client connection
    client = new Paho.MQTT.Client(host, Number(port), clientID);

    // Set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    // Connect the client, if successful, call onConnect function
    client.connect({ 
        onSuccess: onConnect,
    });
}

// Called when the client connects
function onConnect() {
    // Fetch the MQTT topic from the form
    topic = "DAFern/Weatherman";

    // Print output for the user in the messages div
    document.getElementById("messages").innerHTML += '<span>Subscribing to: ' + topic + '</span><br/>';

    // Subscribe to the requested topic
    client.subscribe(topic);
}

// Called when the client loses its connection
function onConnectionLost(responseObject) {
    console.log("onConnectionLost: Connection Lost");
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost: " + responseObject.errorMessage);
    }
}

// Called when a message arrives
function onMessageArrived(message) {
    console.log("onMessageArrived: " + message.payloadString);
    document.getElementById("messages").innerHTML += '<span>Topic: ' + message.destinationName + '  | ' + message.payloadString + '</span><br/>';
    updateScroll(); // Scroll to bottom of window
    MessageToData(message.payloadString);
}

// Called when the disconnection button is pressed
function startDisconnect() {
    client.disconnect();
    document.getElementById("messages").innerHTML += '<span>Disconnected</span><br/>';
    updateScroll(); // Scroll to bottom of window
}

// Updates #messages div to auto-scroll
function updateScroll() {
    var element = document.getElementById("messages");
    element.scrollTop = element.scrollHeight;
}

// Receives Message and edits the string to fit the visualization
function MessageToData(textdata){

// RegExp Pattern to filter the string
let timePattern = /Time online: [0-9.]+/ig;
let HTUPattern = /Humid  [0-9.]+/ig;
let MBEPattern = /Press [0-9.]+/ig;
let TMPPattern = /TempC  [0-9.]+/ig;

// Filter out the spezific sensor data
let MBEData = textdata.match(MBEPattern);
let TMPData = textdata.match(TMPPattern);
let timeData = textdata.match(timePattern);
let HTUData = textdata.match(HTUPattern);

// Correct the formatting
let MBEDatafin = MBEData[0].match(/[0-9.]+/);
let TMPDatafin = TMPData[2].match(/[0-9.]+/);
let timeDatafin = timeData[0].match(/[0-9.]+/);
let HTUDatafin = HTUData[0].match(/[0-9.]+/);


// Replace old data with new data
document.getElementById("TemperaturID").innerHTML = TMPDatafin[0] + "°C";
document.getElementById("LuftfeuchtigkeitID").innerHTML = HTUDatafin[0] + "%";
document.getElementById("LuftdruckID").innerHTML = MBEDatafin[0] + "mbar";
document.getElementById("OnlineZeit").innerHTML = timeDatafin + "s";
}

//Determines Taupunkt
function taupunkt(t, r) {
      
    // Konstanten
    var mw = 18.016; // Molekulargewicht des Wasserdampfes (kg/kmol)
    var gk = 8314.3; // universelle Gaskonstante (J/(kmol*K))
    var t0 = 273.15; // Absolute Temperatur von 0 °C (Kelvin)
    var tk = t + t0; // Temperatur in Kelvin
     
    var a, b;
    if (t >= 0) {
      a = 7.5;
      b = 237.3;
    } else {
      a = 7.6;
      b = 240.7;
    }
     
    // Sättigungsdampfdruck in hPa
    var sdd = 6.1078 * Math.pow(10, (a*t)/(b+t));
     
    // Dampfdruck in hPa
    var dd = sdd * (r/100);
     
    // Wasserdampfdichte bzw. absolute Feuchte in g/m3
    var af = Math.pow(10,5) * mw/gk * dd/tk;
     
    // v-Parameter
    var v = Math.log10(dd/6.1078);
     
    // Taupunkttemperatur (°C)
    var tt = (b*v) / (a-v);
    return { tt: tt, af: af, dd: dd };  
  }