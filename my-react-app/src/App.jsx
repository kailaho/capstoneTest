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
    const [activeMode, setActiveMode] = useState(null);
    const [sound, setSound] = useState(null);
    const [chimeTime, setChimeTime] = useState(0);

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
      setActiveMode(mode);
    };

    const handleChimeTime = (event) => {
      setChimeTime(parseInt(event.target.value));
    };

    const handleSoundChange = (value) => {
      setSound(value);
      console.log("sound value:" + value);
    };

    const sendCommand = async (command) => {
      if (bleServer && bleServer.connected) {
        try {
          const service = await bleServer.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
          const characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
          const combinedMessage = JSON.stringify([`${mode}`, " " + message, `${selectedLights}`, `${timer}`, `${sound}`, `${chimeTime}`]);
          await characteristic.writeValue(new TextEncoder().encode(combinedMessage)); 
          console.log(combinedMessage);
        } catch (err) {
          setError(err.message);
        }
      }
    };

    const renderMode = () => {
      switch(mode){
        case 1: 
          return(
            <>
              <div id = "desc">
              <h3>Chime Mode: Set your clock to chime at a certain interval, and choose whether or not you want to set a timer.</h3>
          </div>

          <div id = "prog">
                <button className= "blackButton" onClick={connectToDevice} disabled={connected}>
                  {connected ? 'Connected' : 'Connect to Clock'}
                </button>

              <p>I want to set a timer for:</p>
              <select id ="timerDuration" value={timer} onChange={handleTimerChange}>
                <option value="0"></option>
                {[...Array(60)].map((_, index) => (
                  <option key={index } value={index +1}>{index+1}</option>
                ))}
              </select>
              <p>minutes</p>

              <div className="radioWrapper">
              <label>
                <input className ="radioButton" type="radio" value="1" checked={sound=== 1} onChange={() => handleSoundChange(1)} />
                Sound On
              </label>

              <label>
                <input className = "radioButton" type="radio" value="0" checked={sound === 0} onChange={() => handleSoundChange(0)} />
                Sound Off
              </label>

              <label>
                <input className = "radioButton" type="radio" value="2" checked={sound === 2} onChange={() => handleSoundChange(2)} />
                Chime at end of timer only
              </label>


              </div>

              {sound === 1 && (
              <div id="chimeWrapper">
                <p>Chime every: </p>
                <select id="chimeFreq" value={chimeTime} onChange={handleChimeTime}>
                  <option value="0"></option>
                  {[...Array(60)].map((_, index) => (
                    <option key={index} value={index + 1}>{index + 1}</option>
                  ))}
                </select>
                <p>minutes</p>
              </div>
            )}

              <button className="blackButton" onClick={sendCommand} disabled={!connected}>
                Start Clock
              </button>
              
              {error && <p>Error: {error}</p>}

          </div>
            </>
          );
        case 2:
          return(
            <h2>Mode 2</h2>
          );
        case 3:
          return(
            <h2>Mode 3</h2>
          );

        case 4:
          return(
            <h2>Mode 4</h2>
          );
        default:
          return null;
      };
    };

    return (
      <div id ="wrapper">
      <h1>Welcome to Bloom Clock</h1>
      <div>
        <div id ="modeWrapper"> 
          <p id="selectMode">Select a mode to begin: </p>
          <button
              className={activeMode === 1 ? 'modeButton active' : 'modeButton'}
              onClick={() => handleModeChange(1)}
            >
              Chime and Time
            </button>
            <button
              className={activeMode === 2 ? 'modeButton active' : 'modeButton'}
              onClick={() => handleModeChange(2)}
            >
              Time Banking
            </button>
            <button
              className={activeMode === 3 ? 'modeButton active' : 'modeButton'}
              onClick={() => handleModeChange(3)}
            >
              Task Setter
            </button>
            <button
              className={activeMode === 4 ? 'modeButton active' : 'modeButton'}
              onClick={() => handleModeChange(4)}
            >
              Sequential Timer
            </button>

        </div>


        <div id="descProgWrapper">
          {renderMode()}
        </div>
        

        
      </div>
      </div>
    );
  }

  export default App;
