import "./db";
import "./models/Video";
import app from "./server";

const PORT = 4000;

//listen to server
const handleListening = () => 
    console.log(`Server listening on port http://localhost:${PORT}`);

app.listen(PORT, handleListening);