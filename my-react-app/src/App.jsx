import React, { useState, useEffect } from 'react';

function App() {
  const [bleCharacteristic, setBleCharacteristic] = useState(null);

  useEffect(() => {
    const connectArduino = async () => {
      try {
        const device = await navigator.bluetooth.requestDevice({
          filters: [{ services: ['0000ffe0-0000-1000-8000-00805f9b34fb'] }],
        });

        const server = await device.gatt.connect();
        const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        const characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');

        setBleCharacteristic(characteristic);
      } catch (error) {
        console.error('Bluetooth error:', error);
      }
    };

    connectArduino();

    // Cleanup function (disconnect from Bluetooth on component unmount)
    return () => {
      if (bleCharacteristic) {
        bleCharacteristic.service.device.gatt.disconnect();
      }
    };
  }, []); // Empty dependency array to run the effect only once on component mount

  const sendCommand = async (command) => {
    if (bleCharacteristic) {
      const encoder = new TextEncoder('utf-8');
      await bleCharacteristic.writeValue(encoder.encode(command));
    }
  };

  const handleNeopixelAnimation = async () => {
    await sendCommand('A'); // Send command to turn on Neopixel animation
  };

  const handleLcdMessage = async () => {
    await sendCommand('B'); // Send command to display message on LCD
  };

  return (
    <div>
      <button onClick={handleNeopixelAnimation}>Start Neopixel Animation</button>
      <button onClick={handleLcdMessage}>Display Message on LCD</button>
    </div>
  );
}

export default App;
