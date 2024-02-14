import React, { useState } from 'react';

function App() {
  const [connected, setConnected] = useState(false);
  const [bleServer, setBleServer] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedLights, setSelectedLights] = useState(1); // State for selected number of lights
  const [timer, setTimer] = useState(0);

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

  const sendCommand = async (command) => {
    if (bleServer && bleServer.connected) {
      try {
        const service = await bleServer.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        const characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
        const combinedMessage = JSON.stringify([" " + message, `${selectedLights}`, `${timer}`]);
        await characteristic.writeValue(new TextEncoder().encode(combinedMessage)); 
        console.log(combinedMessage);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div>
      <button onClick={connectToDevice} disabled={connected}>
        {connected ? 'Connected' : 'Connect'}
      </button>
      <br />
      <select value={selectedLights} onChange={handleDropdownChange}>
        {[...Array(12)].map((_, index) => (
          <option key={index + 1} value={index + 1}>{index + 1}</option>
        ))}
      </select>
      <p>What message do you want to send?</p>
      <input type="text" value={message} onChange={handleChange} />
      <p>Timer duration:</p>
      <select value={timer} onChange={handleTimerChange}>
        {[...Array(60)].map((_, index) => (
          <option key={index + 1} value={index + 1}>{index + 1}</option>
        ))}
      </select>
      <p>minutes</p>
      <button onClick={sendCommand} disabled={!connected}>
        Start Clock
      </button>
      
      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default App;
