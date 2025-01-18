import TextEditor from "./TextEditor";
import {BrowserRouter,
        Routes,
        Route,
        Navigate} from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid'; //to generate random id for new documents

function App() {
  return(
    <BrowserRouter>
      <Routes>

        <Route path="/" exact element={<Navigate to={ `/documents/${uuidV4()}` } />} />

        <Route path="/documents/:id" element={<TextEditor/>} />

      </Routes>
    </BrowserRouter>
  )
}

export default App;
