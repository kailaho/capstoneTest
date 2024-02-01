import React, { useState } from 'react';

function App() {
    const [device, setDevice] = useState(null);

    const connectToDevice = async () => {
        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['a8a1eba9-c5e2-4282-99d0-9ff851b5f7f4'] }],
            });
            
            console.log("line 12");
            const server = await device.gatt.connect();
            console.log("line 14");
            const service = await server.getPrimaryService('a8a1eba9-c5e2-4282-99d0-9ff851b5f7f4');
            console.log("line 16");
            const characteristic = await service.getCharacteristic('a8a1eba9-c5e2-4282-99d0-9ff851b5f7f4');
            console.log("line 18");

            setDevice({
                device,
                characteristic,
            });
        } catch (error) {
            console.error('Error connecting to BLE device:', error);
        }
    };

    const sendCommand = async (command) => {
        if (device && device.characteristic) {
            await device.characteristic.writeValue(new TextEncoder().encode(command));
        }
    };

    return (
        <div className="App">
            <h1>BLE Control App</h1>
            <button onClick={connectToDevice}>Connect to BLE Device</button>
            <button onClick={() => sendCommand('1')}>LED On</button>
            <button onClick={() => sendCommand('0')}>LED Off</button>
        </div>
    );
}

export default App;