/*const service = await bleDevice.gatt.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        const characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb' */

        import React, { useState } from 'react';

        function App() {
          const [connected, setConnected] = useState(false);
          const [bleServer, setBleServer] = useState(null); // Changed state to store GATT server
          const [error, setError] = useState(null);
          const [message, setMessage] = useState('');
        
          const connectToDevice = async () => {
            try {
              const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['0000ffe0-0000-1000-8000-00805f9b34fb'] }],
              });
              const server = await device.gatt.connect();
              setBleServer(server); // Store the GATT server instead of the device
              setConnected(true);
            } catch (err) {
              setError(err.message);
            }
          };

          const handleChange = (event) => {
            setMessage(event.target.value);
          };
        
          const sendCommand = async (command) => {
            if (bleServer && bleServer.connected) {
              try {
                const service = await bleServer.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
                const characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
                await characteristic.writeValue(new TextEncoder().encode(" " + message));
                console.log(message);
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
              <input type="text" value={message} onChange={handleChange} />
              <button onClick={sendCommand} disabled={!connected}>
                Send Message
              </button>
              
              {error && <p>Error: {error}</p>}
            </div>
          );
        }
        
        export default App;
        