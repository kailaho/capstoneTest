import React, { useState } from 'react';

function App() {
  const [bleCharacteristic, setBleCharacteristic] = useState(null);

  const connectArduino = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['0000ffe0-0000-1000-8000-00805f9b34fb'] }],
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
      const characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');

      setBleCharacteristic(characteristic);
      sendCommand('C'); // Notify Arduino that the connection is established
    } catch (error) {
      console.error('Bluetooth error:', error);
    }
  };

  const sendCommand = async (command) => {
    if (bleCharacteristic) {
      const encoder = new TextEncoder('utf-8');
      await bleCharacteristic.writeValue(encoder.encode(command));
    }
  };

  const handleConnect = async () => {
    await connectArduino();
  };

  const handleLcdMessage = async () => {
    await sendCommand('M'); // Send command to display message on LCD
  };

  const handleNeopixelControl = async () => {
    await sendCommand('N'); // Send command to control Neopixel lights
  };

  return (
    <div>
      <h1>Bluetooth Control App</h1>
      <button onClick={handleConnect}>Connect to HM-10</button>
      <button onClick={handleLcdMessage}>Display Message on LCD</button>
      <button onClick={handleNeopixelControl}>Control Neopixel Lights</button>
    </div>
  );
}

export default App;
