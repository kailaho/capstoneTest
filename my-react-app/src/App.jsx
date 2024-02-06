import React, { useState, useEffect } from 'react';

function App() {
  const [bleDevice, setBleDevice] = useState(null);
  const [lightsOn, setLightsOn] = useState(false);
  const [message, setMessage] = useState('');
  const [lcdMessage, setLcdMessage] = useState('');

  useEffect(() => {
    if ('bluetooth' in navigator) {
      navigator.bluetooth.requestDevice({
        filters: [{ services: ['uuid'] }]
      })
      .then(device => {
        setBleDevice(device);
      })
      .catch(error => {
        console.error('Bluetooth error:', error);
      });
    } else {
      console.error('Web Bluetooth API is not supported in this browser.');
    }
  }, []);

  const connectToDevice = async () => {
    try {
      const server = await bleDevice.gatt.connect();
      const service = await server.getPrimaryService('<Your BLE Service UUID>');
      const characteristic = await service.getCharacteristic('<Your BLE Characteristic UUID>');

      // Write '1' to turn on lights
      await characteristic.writeValue(new TextEncoder().encode('1'));
      setLightsOn(true);
    } catch (error) {
      console.error('Error connecting to device:', error);
    }
  };

  const sendLCDMessage = async () => {
    try {
      const server = await bleDevice.gatt.connect();
      const service = await server.getPrimaryService('<Your BLE Service UUID>');
      const characteristic = await service.getCharacteristic('<Your BLE Characteristic UUID>');

      // Write message to display on LCD
      await characteristic.writeValue(new TextEncoder().encode(message));
      setLcdMessage(message);
    } catch (error) {
      console.error('Error sending LCD message:', error);
    }
  };

  return (
    <div>
      <button onClick={connectToDevice}>Connect to Device</button>
      <button onClick={sendLCDMessage}>Send LCD Message</button>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <p>LCD Message: {lcdMessage}</p>
    </div>
  );
}

export default App;
