import React, { useState, useEffect } from 'react';
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
  const [tasks, setTasks] = useState(Array.from({ length: 3 }, () => ({task:'', time: 0})));
  const [bankTask, setBankTask] = useState('');
  const [reward, setReward] = useState(0);
  const [steadyColor, setSteadyColor] = useState('#ffffff');
  const [startColor, setStartColor] = useState('#ffffff');
  const [endColor, setEndColor] = useState('#ffffff');
  const [useCustomColors, setUseCustomColors] = useState(false);
  const [colorSet, setColorSet] = useState(false);

  useEffect(() => {
    // Cleanup function
    return () => {
      if (bleServer && bleServer.connected) {
        bleServer.disconnect();
        setConnected(false);
      }
    };
  }, [bleServer]);

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

  const handleRewardChange = (value) => {
    setReward(value);
  };
  const handleSoundChange = (value) => {
    setSoundMode(value);
  };

  const handleBankTaskChange = (value) => {
    setBankTask(value);
  }

  const handleStartColor = (startColor, endColor) => {
    setColorSet(true);
    const newColor1 = startColor;
    const newColor2 = endColor;
    const r1 = parseInt(newColor1.substring(1, 3), 16);
    const g1 = parseInt(newColor1.substring(3, 5), 16);
    const b1 = parseInt(newColor1.substring(5, 7), 16);
    const r2 = parseInt(newColor2.substring(1, 3), 16);
    const g2 = parseInt(newColor2.substring(3, 5), 16);
    const b2 = parseInt(newColor2.substring(5, 7), 16);
    const colorMessage1 = ("8," + `${r1}`+ "," + `${g1}` + "," + `${b1}` + ",");
    const colorMessage2 = (`${r2}`+ "," + `${g2}` + "," + `${b2}`);
    console.log(colorMessage1);
    console.log(colorMessage2);
    sendSequentially(colorMessage1, colorMessage2);
  };

  

  const sendCommand = async (message) => {
    try {
      if (bleServer && bleServer.connected) {
        const service = await bleServer.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        const characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
        await characteristic.writeValue(new TextEncoder().encode(message));
        console.log(message);
      } else {
        throw new Error('Bluetooth device is not connected.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // const sendJsonArrays = async () => {
  //   try {
  //     const tasksData = tasks.map(task => ({ description: task.task, time: task.time }));
      
  //     for (const task of tasksData) {
  //       const jsonString = JSON.stringify([2, task.description, task.time]);
  //       await sendCommand(jsonString + ';'); // Add a delimiter ';' after each JSON array
  //     }
  //   } catch (err) {
  //     setError(err.message);
  //   }
  // };
  

  const sendSequentially = async (message1, message2) =>{
    console.log("in sendSequentially");
    if (bleServer && bleServer.connected) {
      try {
        const service = await bleServer.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        const characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
        
        // Iterate over each task and send it individually
        console.log(message1);
          await characteristic.writeValue(new TextEncoder().encode(message1 ));
          console.log(message2);
          await characteristic.writeValue(new TextEncoder().encode(message2));
        
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
    console.log("in sendTasks");
    if (bleServer && bleServer.connected) {
      try {
        const service = await bleServer.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        const characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
        
        
        for (let i = 0; i < tasks.length; i++) {
          const taskToSend = ( "2" + "," + tasks[i].task + "," + `${tasks[i].time}` + ",");
          console.log("Sending task:", taskToSend); // Add this line for logging
          await characteristic.writeValue(new TextEncoder().encode(taskToSend));
        }
        await characteristic.writeValue(new TextEncoder().encode(`${reward}`));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const resetConnection = () => {
    if (bleServer && bleServer.connected) {
      bleServer.disconnect();
      setConnected(false);
      setBleServer(null);
    }
    connectToDevice();
  };



  const renderMode = () => {
    switch(mode){
      case 1: 
      const chimeTimeSettings = (`${mode}` + "," + `${timer}` + "," + `${soundMode}` + "," +`${chimeTime}` + "," + `${reward}`);
        return(
          <>
            <div id="desc">
              <h3>Chime Mode: Set your clock to chime at a certain interval, and choose whether or not you want to set a timer.</h3>
            </div>

            <div id="prog">
              <button className="blackButton" onClick={connectToDevice} disabled={connected}>
                {connected ? 'Connected' : 'Connect to Clock'}
              </button>
              {/* <button className="blackButton" onClick={resetConnection}>
                {connected ? 'Reconnected' : 'Reconnect to Clock'}
              </button> */}

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

              <label>
                  <input type="radio" value="1" checked={reward === 1} onChange={() => handleRewardChange(1)} />
                  Reward point at end of timer
                </label>

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

              <label>
                  <input type="radio" value="1" checked={reward === 1} onChange={() => handleRewardChange(1)} />
                  Reward point at end of task sequence
                </label>

                        

              <button className="blackButton" onClick={sendTasks} disabled={!connected}>
                Start Clock
              </button>
              
              {error && <p>Error: {error}</p>}
            </div>
          </>
        );
      case 3:
        const negativeTimeSettings = (`${mode}` + "," + `${timer}`+ "," + `${soundMode}`+ "," + `${chimeTime}`);
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
        const timeBankingSettings = (`${mode}` + "," + `${timer}` + "," + `${soundMode}` + "," + `${chimeTime}`);
        const timeBankingTask = ("," + bankTask);
        return (<>
          <div id="desc">
            <h3>Time Banking: Set a task for your child and how much time the task should take. They hit the button to begin, and when they are done, they push the button again. Whatever time is remaining gets added to their time bank as a reward!</h3>
          </div>

          <div id="prog">
            <button className="blackButton" onClick={connectToDevice} disabled={connected}>
              {connected ? 'Connected' : 'Connect to Clock'}
            </button>

            <div>
            <label id="bankTask">Task: </label>
            <input 
              type="text" 
              id="bankTask" 
              maxLength={32} 
              onChange={(e) => handleBankTaskChange(e.target.value)} 
            />
          </div>


            <p>This task should take:</p>
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
            

            <button className="blackButton" onClick={() => sendSequentially(timeBankingSettings, timeBankingTask)} disabled={!connected}>
              Start Clock
            </button>
            
            {error && <p>Error: {error}</p>}
          </div>
        </>);
      default:
        return null;
    }
  };

  return (
    <div id="wrapper">
      
      <h1>Welcome to ShineTime</h1>
      <div>
      <div>
        <input
          type="radio"
          id="defaultColors"
          value="default"
          checked={!useCustomColors}
          onChange={() => setUseCustomColors(false)}
        />
        <label htmlFor="defaultColors">Default Colors</label>

        <input
          type="radio"
          id="chooseColors"
          value="custom"
          checked={useCustomColors}
          onChange={() => setUseCustomColors(true)}
        />
        <label htmlFor="chooseColors">Choose Colors</label>
      </div>

      {useCustomColors && (
         <div>
         <label>Start Color: </label>
         <input type="color" value={startColor} onChange={(e) => setStartColor(e.target.value)} />
       
         <label>End Color: </label>
         <input type="color" value={endColor} onChange={(e) => setEndColor(e.target.value)} />

       <button className="blackButton" onClick={() => handleStartColor(startColor, endColor)} >
          {colorSet ? "Colors Set" : "Set Colors"}
         </button>

         <p>Brighter and more saturated colors tend to look better!</p>
       
    
       </div>
        
      )}

      
    </div>
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