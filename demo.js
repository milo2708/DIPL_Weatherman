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

function MessageToData(textdata){
let timePattern = /Time online: [0-9.]+/ig;
let HTUPattern = /Humid [0-9.]+/ig;
let MBEPattern = /Press [0-9.]+/ig;
let TMPPattern = /TempC [0-9.]+/ig;

let MBEData = textdata.match(MBEPattern);
let TMPData = textdata.match(TMPPattern);
let timeData = textdata.match(timePattern);
let HTUData = textdata.match(HTUPattern);


document.getElementById("TemperaturID").innerHTML = TMPData + "°C";
document.getElementById("LuftfeuchtigkeitID").innerHTML = HTUData + "%";
document.getElementById("LuftdruckID").innerHTML = MBEData[0] + "mbar";
document.getElementById("OnlineZeit").innerHTML = timeData + "s";
}
//Topic: DAFern/Weatherman | Time online: 626 HTU21D: tempC 23.08 humid 42.11 MBE280: tempC 23.73 tempF 74.71 humid 45.34 Press 957.41 Altm 538.55 Altf 1553.63 TMP117: tempC 23.51 tempF 74.31