const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const { exec } = require("child_process");
const vm = require('vm');
const app = express();
const port = 3000;

app.use(bodyParser.text());

// Enable CORS for all routes
app.use(cors());
// Middleware to parse JSON bodies
app.use(express.json());

// Define your routes
app.post("/", (req, res) => {
  // Return the request body
  res.json(req.body);
});
app.get("/", (req, res) => {
  // Return the request body
  res.json("hello from express");
});

// Endpoint to execute Windows cmd commands
app.post("/execute", (req, res) => {
  try {
    console.log(req.body.command);
    const command = req.body.command;
    if (!command || typeof command !== "string") {
      throw new Error("Command is missing or invalid.");
    }
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing command:', error);
        res.status(400).send(error.message); // Send error message to the client
        return; // Exit the function to prevent further execution
      }
      if (stderr) {
        console.error('stderr Error executing command:', stderr);
        res.status(400).send(stderr); // Send stderr to the client
        return; // Exit the function to prevent further execution
      }
      console.log(stdout);
      res.send(stdout);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).send(error.message); // Send error message to the client
  }
});

//////////////////////////run code
app.post('/runcode', (req, res) => {
  const code = req.body;

  // Create a sandboxed context for code execution
  const sandbox = {
    console: {
      log: (...args) => {
        res.write(`Console Output: ${args.join(' ')}\n`);
      }
    },
    result: null
  };

  // Execute the code in a sandbox
  try {
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);
    // res.send(`Execution Result: ${sandbox.result}`);
    res.send(`Execution Result:  `);
  } catch (err) {
    res.status(500).send(`Error occurred during execution: ${err.message}\n${err.stack}`);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

///test the api from any website cors is working
/* 
fetch('http://localhost:3000', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ message: 'Hello from client!' })
})
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Response from server:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
*/
