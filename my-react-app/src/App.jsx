import React, { useState, useEffect } from 'react';
import './App.css';
import logo from '/logo2.png';
import fillerImg from '/fillerImg5.jpg';
import instructions from '/pamphlet2.png';


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
  const [rewardStr, setRewardStr] = useState('');
  const [showReward, setShowReward] = useState(false);
  const [showSteps, setShowSteps] = useState(0);
  const [story, setStory] = useState(false);

  useEffect(() => {
    // Cleanup function
    return () => {
      if (bleServer && bleServer.connected) {
        bleServer.disconnect();
        setConnected(false);
      }
    };
  }, [bleServer]);

 const handleStory = (value) => {
  setStory(value);
 }
  const getCurrentTime = () => {
    // Get the current time as milliseconds since midnight
    const  now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = now.getMinutes();
    
    // Construct the time string in HH:MM:SS format
    const currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return currentTime;
  };

  const connectToDevice = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['0000ffe0-0000-1000-8000-00805f9b34fb'] }],
      });
      const server = await device.gatt.connect();
      setBleServer(server);
      setConnected(true);
      // const currentTime = getCurrentTime();
      // sendCommand("9," + `${currentTime}`);
      // console.log("sent: " + currentTime);
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
    setShowReward(value == 1);
  };

  const handleCustomRewardChange= (event) => {
    setRewardStr(event.target.value);
    
  };

  const handleCustomReward = async (value) => {
    try {
      if (bleServer && bleServer.connected) {
        const service = await bleServer.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        const characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
        const rewardMode = [9];
        const rewardModeByte = new Uint8Array(rewardMode);
        await characteristic.writeValue(rewardModeByte);
        console.log(rewardModeByte);
        await characteristic.writeValue(new TextEncoder().encode('%'));
        await characteristic.writeValue(new TextEncoder().encode(value + '#'));
        console.log(value);
        
      } else {
        throw new Error('Bluetooth device is not connected.');
      }
    } catch (err) {
      setError(err.message);
    }
       
  };

  const handleTroubleshoot = (value) => {
    setShowSteps(value);
  };


  const handleSoundChange = (value) => {
    setSoundMode(value);
  };

  const handleBankTaskChange = (value) => {
    setBankTask(value);
  }

  const handleStartColor = (color) => {
    setColorSet(true);
    const newColor1 = startColor;
    const newColor2 = endColor;
    const r1 = parseInt(newColor1.substring(1, 3), 16);
    const g1 = parseInt(newColor1.substring(3, 5), 16);
    const b1 = parseInt(newColor1.substring(5, 7), 16);
    const r2 = parseInt(newColor2.substring(1, 3), 16);
    const g2 = parseInt(newColor2.substring(3, 5), 16);
    const b2 = parseInt(newColor2.substring(5, 7), 16);
    const color1 = [8, r1, g1, b1, r2, g2, b2];
    const colorBytes = new Uint8Array(color1);
    sendArray(colorBytes);
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

  const sendCommand2 = async (array, string) => {
    try {
      if (bleServer && bleServer.connected) {
        const service = await bleServer.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        const characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
        
        await characteristic.writeValue(array);
        console.log(array);
        await characteristic.writeValue(new TextEncoder().encode('%'));
        await characteristic.writeValue(new TextEncoder().encode(string + '#'));
        console.log(string);
        
      } else {
        throw new Error('Bluetooth device is not connected.');
      }
    } catch (err) {
      setError(err.message);
    }
  };


  const sendArray = async (array) => {
    try {
      if (bleServer && bleServer.connected) {
        const service = await bleServer.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        const characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
        
        await characteristic.writeValue(array);
        console.log(array);
        
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
          await characteristic.writeValue( new TextEncoder().encode(message1));
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
        //await characteristic.writeValue(new TextEncoder().encode(14));
        
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

  const sendTasks2 = async () => {
    console.log("in sendTasks");
    if (bleServer && bleServer.connected) {
      try {
        const service = await bleServer.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        const characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
        
       
        const timeArr = [5];
        timeArr[0] = 2;
        timeArr[1] = reward;
        timeArr[2] = soundMode;
         for (let i = 0; i < 3; i++){
            timeArr[i + 3] = tasks[i].time;
        }

        const timeArrBytes = new Uint8Array(timeArr);
        await characteristic.writeValue(timeArrBytes);
        console.log(timeArrBytes);
        await characteristic.writeValue(new TextEncoder().encode("%"));
        console.log("%");
        await characteristic.writeValue(new TextEncoder().encode(tasks[0].task));
        console.log(tasks[0].task);
        await characteristic.writeValue(new TextEncoder().encode("," + tasks[1].task));
        console.log(tasks[1].task);
        await characteristic.writeValue(new TextEncoder().encode("," + tasks[2].task + "#"));
        console.log(tasks[2].task);
        
        
        //await characteristic.writeValue(taskBytes);
        console.log("here");
        
        
        
        //await characteristic.writeValue(timeArrBytes);
        //console.log(taskBytes);
        
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

  const serializeArray = (array) => {
    const byteArray =  new Uint8Array(array.length * 2);
    for(let i = 0; i < array.length; i++){
        const item = array[i];
        let start = i * 2;

        if(typeof item === 'string'){
          byteArray[start] = 0;
          byteArray[start +1] = item.length;
          for(let j = 0; j < item.length; j++){
            byteArray[start + j + 2] = item.charCodeAt(j);
          }
        } else if(typeof item === 'number'){
          byteArray[start] = 1;
          byteArray[start + 1] = item;
        }
    }

    return byteArray;
  }


  const renderMode = () => {
    switch(mode){
      case 1: 
      const chimeTimeSettings = [mode, timer, soundMode, chimeTime, reward];
      const chimeTimeBytes= new Uint8Array(chimeTimeSettings);
      
        return(
          <>
            
            <div id="desc">
              <h2>Chime and Time Mode</h2>
              <h3>Set a simple timer with the option to add sound or reward a point at the end of the timer.</h3>
            </div>

            {/* <div id="prog"> */}
            <div className="prog" id="connectWrapper">
            <h3 id="titleColor"><span className="stepNumber">1</span> Connect</h3>
              <button className="blackButton" onClick={connectToDevice} disabled={connected}>
                {connected ? 'Connected' : 'Connect to Clock'}
              </button>
              {error && <p>Error: {error}</p>}
              </div>
              
              {/* <button className="blackButton" onClick={resetConnection}>
                {connected ? 'Reconnected' : 'Reconnect to Clock'}
              </button> */}
              
            
            
            <div id= "colorWrapper">
            
        <div id="chooseColorsWrapper">
        <h3 id="titleColor"><span className="stepNumber">2</span> Color Customization</h3>
        <div className="chooseColorGroup">
          <input
            type="radio"
            id="defaultColors"
            value="default"
            checked={!useCustomColors}
            onChange={() => setUseCustomColors(false)}
          />
          <label htmlFor="defaultColors">Default Colors</label>
        </div>

        <div className="chooseColorGroup">
          <input
            type="radio"
            id="chooseColors"
            value="custom"
            checked={useCustomColors}
            onChange={() => setUseCustomColors(true)}
          />
          <label htmlFor="chooseColors">Choose Colors</label>
        </div>

      </div>

      {useCustomColors && (
        <>
         <div id="selectColorsWrapper">
          <div className='selectColor'>
         <label>Start Color: </label>
         <input type="color" value={startColor} onChange={(e) => setStartColor(e.target.value)} />
          </div>

          <div className='selectColor'>
         <label>End Color: </label>
         <input type="color" value={endColor} onChange={(e) => setEndColor(e.target.value)} />
         </div>
       </div>
       <button id="setColorsButton" onClick={() => handleStartColor(startColor, endColor)} >
          {colorSet ? "Set" : "Color Set"}
         </button>
         <p id="colorNote">Brighter and more saturated colors tend to look better!</p>
        </>
      )}
      
      </div>

      
      <div className="prog" >
            <h3 id="titleColor"><span className="stepNumber">3</span> Timer Settings</h3>
            <div id="timerSetFlex">
            
              <p>I want to set a timer for</p>
              <select id="timerDuration" value={timer} onChange={handleTimerChange}>
                <option value="0"></option>
                {[...Array(60)].map((_, index) => (
                  <option key={index} value={index + 1}>{index + 1}</option>
                ))}
              </select>
              <p>minutes</p>
            </div>

              <div className="radioWrapper">
                <label>
                  <input type="radio" value="1" checked={soundMode === 1} onChange={() => handleSoundChange(1)} />
                  Interval Chime
                </label>
                {soundMode === 1 && (
                <div id="chimeWrapper" className="miniFlex">
                  <p className="taskSetterItem">Chime every </p>
                  <select id="chimeFreq" className="taskSetterItem" value={chimeTime} onChange={handleChimeTime}>
                    <option value="0"></option>
                    {[...Array(60)].map((_, index) => (
                      <option key={index} value={index + 1}>{index + 1}</option>
                    ))}
                  </select>
                  <p>minutes</p>
                </div>
              )}
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
                  <input type="radio" value="0" checked={reward === 0} onChange={() => handleRewardChange(0)} />
                  Skip reward
                </label>
              <label>
                  <input type="radio" value="1" checked={reward === 1} onChange={() => handleRewardChange(1)} />
                  Reward point at end of timer
                </label>
                
                {showReward && (
                  <div className = "miniFlex">
                    <div>
                    <input type = "text" 
                           value ={rewardStr}
                           onChange = {handleCustomRewardChange}
                           maxLength={17}
                           placeholder='Enter custom reward'>
                          
                    </input>
                    <p id="charLeft">Characters left: {17 - rewardStr.length}</p>
                    </div>
                    <button id = "setColorsButton" onClick={() => handleCustomReward(rewardStr)}>Change Reward</button>
                  </div>
                )}

              
              
  
              <button className="blackButton" onClick={() => sendArray(chimeTimeBytes)} disabled={!connected}>
                Start Timer
              </button>
              
              
            {/* </div> */}
            </div>
          </>
        );
      case 2:
        
        return (
          <>
          <div id="desc">
              <h2>Task Setter</h2>
              <h3>Set a series of up to 3 tasks for your child to complete in sequence. Each task gets it's own amount of time and starts when the button on the timer is pressed.</h3>
            </div>

            
            <div className="prog" id="connectWrapper">
            <h3 id="titleColor"><span className="stepNumber">1</span> Connect</h3>
              <button className="blackButton" onClick={connectToDevice} disabled={connected}>
                {connected ? 'Connected' : 'Connect to Clock'}
              </button>
              {error && <p>Error: {error}</p>}
              </div>

              <div id= "colorWrapper">
            
            <div id="chooseColorsWrapper">
            <h3 id="titleColor"><span className="stepNumber">2</span> Color Customization</h3>
            <div className="chooseColorGroup">
              <input
                type="radio"
                id="defaultColors"
                value="default"
                checked={!useCustomColors}
                onChange={() => setUseCustomColors(false)}
              />
              <label htmlFor="defaultColors">Default Colors</label>
            </div>
    
            <div className="chooseColorGroup">
              <input
                type="radio"
                id="chooseColors"
                value="custom"
                checked={useCustomColors}
                onChange={() => setUseCustomColors(true)}
              />
              <label htmlFor="chooseColors">Choose Colors</label>
            </div>
    
          </div>
          
    
          {useCustomColors && (
            <>
             <div id="selectColorsWrapper">
              <div className='selectColor'>
             <label>Start Color: </label>
             <input type="color" value={startColor} onChange={(e) => setStartColor(e.target.value)} />
              </div>
    
              <div className='selectColor'>
             <label>End Color: </label>
             <input type="color" value={endColor} onChange={(e) => setEndColor(e.target.value)} />
             </div>
           </div>
           <button id="setColorsButton" onClick={() => handleStartColor(startColor, endColor)} >
              {colorSet ? "Colors Set" : "Set Colors"}
             </button>
             <p id="colorNote">Brighter and more saturated colors tend to look better!</p>
            </>
          )}
          
          </div>

            <div className="prog">
            <h3 id="titleColor"><span className="stepNumber">3</span> Timer Settings</h3>
              {tasks.map((task, index) => (
                <div id="taskSetterWrapper"key={index}>
                  <p className="taskSetterItem">Task: </p>
                  <input className="taskSetterItem" type="text" value={task.description} maxLength={17} onChange={(e) => handleChangeTask(index, e.target.value)} />                
                  <p className="taskSetterItem">Time:</p>
                  <select className="taskSetterItem"value={task.time} onChange={(e) => handleTaskTimer(e, index)}>
                  <option value="0"></option>
                    {[...Array(60)].map((_, index) => (
                      <option key={index} value={index + 1}>{index + 1} min</option>
                    ))}
                  </select>
                </div>
              ))}

              <div className="radioWrapper">
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
                  <input type="radio" value="0" checked={reward === 0} onChange={() => handleRewardChange(0)} />
                  Skip reward
                </label>
              <label id="pushLabel">
                  <input type="radio" value="1" checked={reward === 1} onChange={() => handleRewardChange(1)} />
                  Reward point at end of task sequence
                </label>
                
                {showReward && (
                  <div className = "miniFlex">
                    <div>
                    <input type = "text" 
                           value ={rewardStr}
                           onChange = {handleCustomRewardChange}
                           maxLength={17}
                           placeholder='Enter custom reward'>
                          
                    </input>
                    <p id="charLeft">Characters left: {17 - rewardStr.length}</p>
                    </div>
                    <button id = "setColorsButton" onClick={() => handleCustomReward(rewardStr)}>Change Reward</button>
                  </div>
                )}

                        

              <button className="blackButton" onClick={sendTasks2} disabled={!connected}>
                Start Timer
              </button>
              </div>
              
              
            

           
          </>
        );
      case 3:
        const negativeTimeSettings = [mode, timer, soundMode, chimeTime, reward];
        const negBytes = new Uint8Array(negativeTimeSettings);
        return(
          <>
            <div id="desc">
            <h2>Negative Time</h2>
              <h3>Help convey the idea that time continues to pass, even if the timer has stopped or a task is incomplete. Once the timer is up, the time starts to count back up and counts the added time.</h3>
            </div>
            <div className="prog" id="connectWrapper">
            <h3 id="titleColor"><span className="stepNumber">1</span> Connect</h3>
              <button className="blackButton" onClick={connectToDevice} disabled={connected}>
                {connected ? 'Connected' : 'Connect to Clock'}
              </button>
              {error && <p>Error: {error}</p>}
              </div>

              <div id= "colorWrapper">
            
            <div id="chooseColorsWrapper">
            <h3 id="titleColor"><span className="stepNumber">2</span> Color Customization</h3>
            <div className="chooseColorGroup">
              <input
                type="radio"
                id="defaultColors"
                value="default"
                checked={!useCustomColors}
                onChange={() => setUseCustomColors(false)}
              />
              <label htmlFor="defaultColors">Default Colors</label>
            </div>
    
            <div className="chooseColorGroup">
              <input
                type="radio"
                id="chooseColors"
                value="custom"
                checked={useCustomColors}
                onChange={() => setUseCustomColors(true)}
              />
              <label htmlFor="chooseColors">Choose Colors</label>
            </div>
    
          </div>
    
          {useCustomColors && (
            <>
             <div id="selectColorsWrapper">
              <div className='selectColor'>
             <label>Start Color: </label>
             <input type="color" value={startColor} onChange={(e) => setStartColor(e.target.value)} />
              </div>
    
              <div className='selectColor'>
             <label>End Color: </label>
             <input type="color" value={endColor} onChange={(e) => setEndColor(e.target.value)} />
             </div>
           </div>
           <button id="setColorsButton" onClick={() => handleStartColor(startColor, endColor)} >
              {colorSet ? "Colors Set" : "Set Colors"}
             </button>
             <p id="colorNote">Brighter and more saturated colors tend to look better!</p>
            </>
          )}
          
          </div>

          <div className="prog">
          <h3 id="titleColor"><span className="stepNumber">3</span> Timer Settings</h3>

              <div className="miniFlex">
              <p>I want to set a timer for:</p>
              <select id="timerDuration" value={timer} onChange={handleTimerChange}>
                <option value="0"></option>
                {[...Array(60)].map((_, index) => (
                  <option key={index} value={index + 1}>{index + 1}</option>
                ))}
              </select>
              <p>minutes</p>
              </div>

              <div className="radioWrapper">
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
                <div id="chimeWrapper" className="miniFlex">
                  <p className="taskSetterItem">Chime every </p>
                  <select className="taskSetterItem" id="chimeFreq" value={chimeTime} onChange={handleChimeTime}>
                    <option value="0"></option>
                    {[...Array(60)].map((_, index) => (
                      <option key={index} value={index + 1}>{index + 1}</option>
                    ))}
                  </select>
                  <p>minutes</p>
                </div>
              )}
              
              <label>
                  <input type="radio" value="0" checked={reward === 0} onChange={() => handleRewardChange(0)} />
                  Skip reward
                </label>
              <label id="pushLabel">
                  <input type="radio" value="1" checked={reward === 1} onChange={() => handleRewardChange(1)} />
                  Reward point at end of task sequence
                </label>
                
                {showReward && (
                  <div className = "miniFlex">
                    <div>
                    <input type = "text" 
                           value ={rewardStr}
                           onChange = {handleCustomRewardChange}
                           maxLength={17}
                           placeholder='Enter custom reward'>
                          
                    </input>
                    <p id="charLeft">Characters left: {17 - rewardStr.length}</p>
                    </div>
                    <button id = "setColorsButton" onClick={() => handleCustomReward(rewardStr)}>Change Reward</button>
                  </div>
                )}
  
              <button className="blackButton" onClick={() => sendArray(negBytes)} disabled={!connected}>
                Start Timer
              </button>
            </div>
              
              
          </>
        );
      case 4:
        const timeBankingSettings = [mode, timer, soundMode, reward];
        const byteArr =  new Uint8Array(4);
        for(let i = 0; i <4; i++){
          byteArr[i] = timeBankingSettings[i];
        }
        // for(let i = 0; i < byteArr.length; i++){
        //   console.log("in case 4");
        //   console.log(mode, timer, soundMode, chimeTime, bankTask);
        //   console.log(byteArr[i]);
        // }
        
        
        return (<>
          <div id="desc">
              <h2>Time Banking</h2>
              <h3>Set a timer and a task to complete. The timer is started by pushing the button, and can be stopped once the task is complete by pushing the button again. Option to reward points for saved time.</h3>
          </div>

          <div className="prog" id="connectWrapper">
            <h3 id="titleColor"><span className="stepNumber">1</span> Connect</h3>
              <button className="blackButton" onClick={connectToDevice} disabled={connected}>
                {connected ? 'Connected' : 'Connect to Clock'}
              </button>
              {error && <p>Error: {error}</p>}
              </div>

              <div id= "colorWrapper">
            
            <div id="chooseColorsWrapper">
            <h3 id="titleColor"><span className="stepNumber">2</span> Color Customization</h3>
            <div className="chooseColorGroup">
              <input
                type="radio"
                id="defaultColors"
                value="default"
                checked={!useCustomColors}
                onChange={() => setUseCustomColors(false)}
              />
              <label htmlFor="defaultColors">Default Colors</label>
            </div>
    
            <div className="chooseColorGroup">
              <input
                type="radio"
                id="chooseColors"
                value="custom"
                checked={useCustomColors}
                onChange={() => setUseCustomColors(true)}
              />
              <label htmlFor="chooseColors">Choose Colors</label>
            </div>
    
          </div>
    
          {useCustomColors && (
            <>
             <div id="selectColorsWrapper">
              <div className='selectColor'>
             <label>Start Color: </label>
             <input type="color" value={startColor} onChange={(e) => setStartColor(e.target.value)} />
              </div>
    
              <div className='selectColor'>
             <label>End Color: </label>
             <input type="color" value={endColor} onChange={(e) => setEndColor(e.target.value)} />
             </div>
           </div>
           <button id="setColorsButton" onClick={() => handleStartColor(startColor, endColor)} >
              {colorSet ? "Colors Set" : "Set Colors"}
             </button>
             <p id="colorNote">Brighter and more saturated colors tend to look better!</p>
            </>
          )}
          
          </div>


         <div className="prog">
          <h3 id="titleColor"><span className="stepNumber">3</span> Timer Settings</h3>
            
            <div>
            <label id="bankTask">Task: </label>
            <input 
              type="text" 
              id="bankTask" 
              maxLength={17} 
              onChange={(e) => handleBankTaskChange(e.target.value)} 
            />
          </div>

          <div className="miniFlex">
            <p>This task should take:</p>
            <select id="timerDuration" value={timer} onChange={handleTimerChange}>
              <option value="0"></option>
              {[...Array(60)].map((_, index) => (
                <option key={index} value={index + 1}>{index + 1}</option>
              ))}
            </select>
            <p>minutes</p>
            </div>
            
                
            <div className="radioWrapper">
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
                  <input type="radio" value="0" checked={reward === 0} onChange={() => handleRewardChange(0)} />
                  Skip reward
                </label>           

              <label id="pushLabel">
                  <input type="radio" value="1" checked={reward === 1} onChange={() => handleRewardChange(1)} />
                  Reward point at end of task sequence
                </label>
                
                {showReward && (
                  <div className = "miniFlex">
                    <div>
                    <input type = "text" 
                           value ={rewardStr}
                           onChange = {handleCustomRewardChange}
                           maxLength={17}
                           placeholder='Enter custom reward'>
                          
                    </input>
                    <p id="charLeft">Characters left: {17 - rewardStr.length}</p>
                    </div>
                    <button id = "setColorsButton" onClick={() => handleCustomReward(rewardStr)}>Change Reward</button>
                  </div>
                )}
            

            <button className="blackButton" onClick={() => sendCommand2(byteArr, bankTask)} disabled={!connected}>
              Start Timer
            </button>
            
        </div>
        </>);

      case 5:
        return(
          <>
          <div id="welcomeContact"
          >
          
          <h3><span id = "gettingStarted" className = "makeBold">Instructions and Troubleshooting Tips</span></h3>
          <img id="pamphlet" alt="instruction pamphlet" src={instructions}/>
          <div id="instructions">
          <h3 id="instructionh3">Bluetooth Instructions:</h3>
          <ul>
          <li><span className="makeBold">Step 1:</span> After plugging in the timer, wait for the "Welcome to Shine Time" message on the screen, chime, and the rainbow lights. This means you're ready to pair!</li>
            <li><span className="makeBold">Step 2:</span> Ensure the WebBluetooth API on your browser (automatically included with Chrome and Edge)</li>
            <li><span className="makeBold">Step 3:</span> Connect to the clock. A Web Bluetooth API window will pop up asking for permission. The name of the connection is "DSD Tech". It may take a minute to load, so please be patient!</li>
            <li><span className="makeBold">Step 4:</span> Click "Start Timer" to send your customizations and settings to the timer.</li>
          </ul>
          <h3 id="troubleTitle">Troubleshooting:</h3>
          <div id="troubleshoot">
            <div className="troubleCard">
              <p><span value= "1" onClick = {() => handleTroubleshoot(1)} className="faq">GATT error, no connection, or disconnected</span></p>
              {showSteps === 1 && (
                <p>Refresh the page and try again. If this does not work, unplug the timer, then refresh the page. Plug the timer in again and wait for the rainbow lights, then try connecting again.</p>
              )}
            </div>
            <div className="troubleCard">
              <p><span value= "2" onClick = {() => handleTroubleshoot(2)} className="faq">Customized colors are not showing up correctly</span></p>
              {showSteps === 2 && (
                <p>Wait roughly 30 seconds and then try to send the colors again. If not, follow the same stres for no connection.</p>
              )}
            </div>
            <div className="troubleCard">
              <p><span value= "3" onClick={() => handleTroubleshoot(3)}className="faq">Timer is unresponsive, time is incorrect, or screen is displaying gibberish</span></p>
              {showSteps === 3 && (
                <p>Wait roughly 30 seconds, and try to send the customization again. If it's not working, try to follow the same steps for no connection.</p>
              )}
            </div>
          </div>
          <p className="contact">Contact or request a new mode: kaila.ho@colorado.edu. Image Courtesy of insung yoon via Unsplash</p>
          </div>
          
          </div>
          </>
        );
      default:
        return(
          <>
          <div id="welcomeContact"
          >
          <div id="welcomeImgWrapper"style={{
              backgroundImage: `url(${fillerImg})`,
              backgroundSize: '100%',
              backgroundPosition: 'center',}}>
          <h3 id="welcomeStatement">ShineTime is an <span className="makeBold">innovative tool for time management </span>geared towards <span className="makeBold">children with ADHD</span>. This website is a <span className="makeBold">portal</span> that allows you to <span className="makeBold">set different modes</span> on the ShineTime timer based on your <span className="makeBold">time management goals</span>. Each mode is research-based and meant to help children with ADHD <span className="makeBold">celebrate their different way of understanding time</span> while helping them accomplish tasks. 
          </h3>
          

          </div>
          <div id="storyCanvas">
          <button id ="storyButton" onClick={() => handleStory(true)}>
            <span className = "makeBold">The Story Behind ShineTime ▼</span>
          </button>
          {story &&(
              <p id="story">
              This product is inspired by the power of assistive technology to help users in their every day lives and a passion for creating tools for children with learning disabilities. The journey of this product focused largely on designing with, not for, a community that could benefit from its functionality and was an amazing opportunity to collaborate closely with a community of families navigating the challenges and unique perspectives posed by ADHD. The aim was to create a timer that wasn't just functional but also visually appealing, providing an engaging way for children to engage with time and task management without the distraction of screen-based solutions. The intention is that a parent could customize a timer experience for their child with functionality ranging from task setting to auditory feedback which then would help them see time passing in an engaging and tailored manner. Through various modes, parents can guide their children to better understand the concept of time in ways tailored to their unique learning styles with the goal of celebrating their distinctive perception of time.</p>
            )} 
          </div>
          <h3><span id = "gettingStarted" className = "makeBold">Getting Started</span></h3>
          <img id="pamphlet" alt="instruction pamphlet" src={instructions}/>
          <div id="instructions">
          <h3 id="instructionh3">Bluetooth Instructions:</h3>
          <ul>
          <li><span className="makeBold">Step 1:</span> After plugging in the timer, wait for the "Welcome to Shine Time" message on the screen, chime, and the rainbow lights. This means you're ready to pair!</li>
            <li><span className="makeBold">Step 2:</span> Ensure the WebBluetooth API on your browser (automatically included with Chrome and Edge)</li>
            <li><span className="makeBold">Step 3:</span> Connect to the clock. A Web Bluetooth API window will pop up asking for permission. The name of the connection is "DSD Tech". It may take a minute to load, so please be patient!</li>
            <li><span className="makeBold">Step 4:</span> Click "Start Timer" to send your customizations and settings to the timer.</li>
          </ul>
          <h3 id="troubleTitle">Troubleshooting:</h3>
          <div id="troubleshoot">
            <div className="troubleCard">
              <p><span value= "1" onClick = {() => handleTroubleshoot(1)} className="faq">GATT error, no connection, or disconnected</span></p>
              {showSteps === 1 && (
                <p>Refresh the page and try again. If this does not work, unplug the timer, then refresh the page. Plug the timer in again and wait for the rainbow lights, then try connecting again.</p>
              )}
            </div>
            <div className="troubleCard">
              <p><span value= "2" onClick = {() => handleTroubleshoot(2)} className="faq">Customized colors are not showing up correctly</span></p>
              {showSteps === 2 && (
                <p>Wait roughly 30 seconds and then try to send the colors again. If not, follow the same stres for no connection.</p>
              )}
            </div>
            <div className="troubleCard">
              <p><span value= "3" onClick={() => handleTroubleshoot(3)}className="faq">Timer is unresponsive, time is incorrect, or screen is displaying gibberish</span></p>
              {showSteps === 3 && (
                <p>Wait roughly 30 seconds, and try to send the customization again. If it's not working, try to follow the same steps for no connection.</p>
              )}
            </div>
          </div>
          <p className="contact">Contact or request a new mode: kaila.ho@colorado.edu. Image Courtesy of insung yoon via Unsplash</p>
          </div>
          
          </div>
          </>
        );
    }
  };

  return (
    <>
    <div id="wrapper">
      <div id="topBar">
        <div id="titleLogo">
          <h1>Welcome to ShineTime</h1>
          <img id="logo" src={logo} alt="Logo: Orange and Yellow Sun"/>
        </div>
        
          

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
          <button id="help"
            className={activeMode === 5 ? 'modeButton active' : 'modeButton'}
            onClick={() => handleModeChange(5)}
          >
            ?
          </button>
          
        </div>

    
    </div>

        <div id="descProgWrapper">
          {renderMode()}
        </div>
        
      
    </div>
    {/* <p id="contact">Contact or request a new mode: kaila.ho@colorado.edu</p> */}
    </>
  );
}

export default App;