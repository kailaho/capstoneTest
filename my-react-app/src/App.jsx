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
  const [chimeTime, setChimeTime] = useState(0);
  const [soundMode, setSoundMode] = useState(2); // Default to sound on
  const [tasks, setTasks] = useState(Array.from({ length: 5 }, () => ({task:'', time: 0})));

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
    setSoundMode(value);
  };

  const sendCommand = async (combinedMessage) => {
    if (bleServer && bleServer.connected) {
      try {
        const service = await bleServer.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        const characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
        await characteristic.writeValue(new TextEncoder().encode(combinedMessage)); 
        console.log(combinedMessage);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleChangeTask = (index, value) => {
    const newTasks = [...tasks];
    newTasks[index].task = value; // Assign directly since value is the task description
    setTasks(newTasks);
  };

  const handleTaskTimer = (event, index) => {
    const newTasks = [...tasks];
    newTasks[index].time = parseInt(event.target.value);
    setTasks(newTasks);
  };
  // Function to send tasks sequentially
  const sendTasks = async () => {
    if (bleServer && bleServer.connected) {
      try {
        const service = await bleServer.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        const characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
        
        // Iterate over each task and send it individually
        for (let i = 0; i < tasks.length; i++) {
          const taskToSend = JSON.stringify([2, tasks[i].task, tasks[i].time]);
          console.log("Sending task:", taskToSend); // Add this line for logging
          await characteristic.writeValue(new TextEncoder().encode(taskToSend));
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const renderMode = () => {
    switch(mode){
      case 1: 
      const chimeTimeSettings = JSON.stringify([`${mode}`, `${timer}`, `${soundMode}`, `${chimeTime}`]);
        return(
          <>
            <div id="desc">
              <h3>Chime Mode: Set your clock to chime at a certain interval, and choose whether or not you want to set a timer.</h3>
            </div>

            <div id="prog">
              <button className="blackButton" onClick={connectToDevice} disabled={connected}>
                {connected ? 'Connected' : 'Connect to Clock'}
              </button>

              <p>I want to set a timer for:</p>
              <select id="timerDuration" value={timer} onChange={handleTimerChange}>
                <option value="0"></option>
                {[...Array(60)].map((_, index) => (
                  <option key={index} value={index + 1}>{index + 1}</option>
                ))}
              </select>
              <p>minutes</p>

              <div className="radioWrapper">
                <label>
                  <input type="radio" value="1" checked={soundMode === 1} onChange={() => handleSoundChange(1)} />
                  Sound On
                </label>
                <label>
                  <input type="radio" value="2" checked={soundMode === 2} onChange={() => handleSoundChange(2)} />
                  Sound Off
                </label>
                <label>
                  <input type="radio" value="3" checked={soundMode === 3} onChange={() => handleSoundChange(3)} />
                  End of Timer Only
                </label>
                <label>
                  <input type="radio" value="4" checked={soundMode === 4} onChange={() => handleSoundChange(4)} />
                  With each petal
                </label>
              </div>

              {soundMode === 1 && (
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
              
  
              <button className="blackButton" onClick={() => sendCommand(chimeTimeSettings)} disabled={!connected}>
                Start Clock
              </button>
              
              {error && <p>Error: {error}</p>}
            </div>
          </>
        );
      case 2:
        
        return (
          <>
          <div id="desc">
              <h3>Task Setter: Set a series of up to 5 tasks for your child to complete in sequence.</h3>
            </div>

            <div id="prog">
              <button className="blackButton" onClick={connectToDevice} disabled={connected}>
                {connected ? 'Connected' : 'Connect to Clock'}
              </button>

              {tasks.map((task, index) => (
                <div key={index}>
                  <input type="text" value={task.description} maxLength={32} onChange={(e) => handleChangeTask(index, e.target.value)} />
                  <select value={task.time} onChange={(e) => handleTaskTimer(e, index)}>
                  <option value="0"></option>
                    {[...Array(60)].map((_, index) => (
                      <option key={index} value={index + 1}>{index + 1} min</option>
                    ))}
                  </select>
                </div>
              ))}

                        

              <button className="blackButton" onClick={sendTasks} disabled={!connected}>
                Start Clock
              </button>
              
              {error && <p>Error: {error}</p>}
            </div>
          </>
        );
      case 3:
        const negativeTimeSettings = JSON.stringify([`${mode}`, `${timer}`, `${soundMode}`, `${chimeTime}`]);
        return(
          <>
            <div id="desc">
              <h3>Negative Time: Help your child understand the concept of "negative time" or the idea that time continues to pass, even if they don't finish a task in the time alotted.</h3>
            </div>

            <div id="prog">
              <button className="blackButton" onClick={connectToDevice} disabled={connected}>
                {connected ? 'Connected' : 'Connect to Clock'}
              </button>

              <p>I want to set a timer for:</p>
              <select id="timerDuration" value={timer} onChange={handleTimerChange}>
                <option value="0"></option>
                {[...Array(60)].map((_, index) => (
                  <option key={index} value={index + 1}>{index + 1}</option>
                ))}
              </select>
              <p>minutes</p>

              <div className="radioWrapper">
                <label>
                  <input type="radio" value="1" checked={soundMode === 1} onChange={() => handleSoundChange(1)} />
                  Sound On
                </label>
                <label>
                  <input type="radio" value="2" checked={soundMode === 2} onChange={() => handleSoundChange(2)} />
                  Sound Off
                </label>
                <label>
                  <input type="radio" value="3" checked={soundMode === 3} onChange={() => handleSoundChange(3)} />
                  End of Timer Only
                </label>
                <label>
                  <input type="radio" value="4" checked={soundMode === 4} onChange={() => handleSoundChange(4)} />
                  With each petal
                </label>
              </div>

              {soundMode === 1 && (
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
              
  
              <button className="blackButton" onClick={() => sendCommand(negativeTimeSettings)} disabled={!connected}>
                Start Clock
              </button>
              
              {error && <p>Error: {error}</p>}
            </div>
          </>
        );
      case 4:
        return <h2>Mode 4</h2>;
      default:
        return null;
    }
  };

  return (
    <div id="wrapper">
      <h1>Welcome to Bloom Clock</h1>
      <div>
        <div id="modeWrapper"> 
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
            Task Setter
          </button>
          <button
            className={activeMode === 3 ? 'modeButton active' : 'modeButton'}
            onClick={() => handleModeChange(3)}
          >
            Negative Time
          </button>
          <button
            className={activeMode === 4 ? 'modeButton active' : 'modeButton'}
            onClick={() => handleModeChange(4)}
          >
            Time Banking
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