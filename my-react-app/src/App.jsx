  import React, { useState } from 'react';
  import './App.css';

  function App() {
    const [connected, setConnected] = useState(false);
    const [bleServer, setBleServer] = useState(null);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [selectedLights, setSelectedLights] = useState(1); // State for selected number of lights
    const [timer, setTimer] = useState(0);
    const [mode, setMode] = useState(0);

    const connectToDevice = async () => {
      try {
        const device = await navigator.bluetooth.requestDevice({
          filters: [{ services: ['0000ffe0-0000-1000-8000-00805f9b34fb'] }],
        });
        const server = await device.gatt.connect();
        setBleServer(server);
        setConnected(true);
      } catch (err) {
        setError(err.message);
      }
    };

    const handleChange = (event) => {
      setMessage(event.target.value);
    };

    const handleDropdownChange = (event) => {
      setSelectedLights(parseInt(event.target.value)); // Update selected number of lights
    };

    const handleTimerChange = (event) => {
      setTimer(parseInt(event.target.value));
    };
    
    const handleModeChange = (mode) =>{
      setMode(mode);
    };

    const sendCommand = async (command) => {
      if (bleServer && bleServer.connected) {
        try {
          const service = await bleServer.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
          const characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
          const combinedMessage = JSON.stringify([`${mode}`, " " + message, `${selectedLights}`, `${timer}`]);
          await characteristic.writeValue(new TextEncoder().encode(combinedMessage)); 
          console.log(combinedMessage);
        } catch (err) {
          setError(err.message);
        }
      }
    };

    return (
      <div id ="wrapper">
      <h1>Welcome to Bloom Clock</h1>
      <div>
        <div id ="modeWrapper"> 
            <button className = "modeButton" onClick={() => handleModeChange(1)}>
            Chime and Time
          </button>

          <button className = "modeButton" onClick={() => handleModeChange(2)}>
            Time Banking
          </button>

          <button className = "modeButton" onClick={() => handleModeChange(3)}>
            Task Setter
          </button>

        </div>


        <div id="descProgWrapper">
          <div id = "desc">
              <h3>Chime Mode: Set your clock to chime at a certain interval, and choose whether or not you want to set a timer.</h3>
          </div>

          <div id = "prog">
                <button className= "blackButton" onClick={connectToDevice} disabled={connected}>
                  {connected ? 'Connected' : 'Connect'}
                </button>
              
            
              {/* <select value={selectedLights} onChange={handleDropdownChange}>
                {[...Array(12)].map((_, index) => (
                  <option key={index + 1} value={index + 1}>{index + 1}</option>
                ))}
              </select> */}
              
              {/* <input type="text" value={message} onChange={handleChange} /> */}
              <p>I want to set a timer for:</p>
              <select id ="timerDuration" value={timer} onChange={handleTimerChange}>
                {[...Array(60)].map((_, index) => (
                  <option key={index } value={index +1}>{index+1}</option>
                ))}
              </select>
              <p>minutes</p>

              <button className="blackButton" onClick={sendCommand} disabled={!connected}>
                Start Clock
              </button>
              
              {error && <p>Error: {error}</p>}

          </div>

        </div>
        

        
      </div>
      </div>
    );
  }

  export default App;
