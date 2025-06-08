import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import './App.css';

const defaultPythonCode = `# Write your Python code here\nprint("Hello from Python!")`;
const defaultCppCode = `// Write your C++ code here
#include <iostream>
#include <string>
#include <vector>

int main() {
    std::cout << "Hello from C++!" << std::endl;
    return 0;
}`;

function App() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(defaultPythonCode);
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

  useEffect(() => {
     if (language === 'python') {
         const currentEditorValue = editorRef.current?.getValue();
         if (currentEditorValue === defaultCppCode || code === defaultCppCode) {
              setCode(defaultPythonCode);
         } else if (currentEditorValue) {
             setCode(currentEditorValue); // Keep user's python code if they switch back
         } else {
             setCode(defaultPythonCode);
         }
     } else if (language === 'cpp') {
         const currentEditorValue = editorRef.current?.getValue();
         if (currentEditorValue === defaultPythonCode || code === defaultPythonCode) {
             setCode(defaultCppCode);
         } else if (currentEditorValue) {
             setCode(currentEditorValue); // Keep user's C++ code if they switch back
         } else {
             setCode(defaultCppCode);
         }
     }
 }, [language]); // Removed 'code' from dependency array to avoid loops with setCode


  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    // Set initial code in editor based on selected language
    editor.setValue(language === 'python' ? defaultPythonCode : defaultCppCode);
  }

  function handleEditorChange(value, event) {
    setCode(value || ''); // Keep local code state up-to-date, but editor is source of truth on submit
  }

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setOutput(''); 
    // The useEffect will handle setting the default code for the new language
    // if current code is the default of the old language.
    // The editorRef's value will be updated by Monaco directly through its 'value' prop.
  };

  const handleSubmit = async () => {
    if (!editorRef.current) return;
    const currentCodeFromEditor = editorRef.current.getValue();

    setIsLoading(true);
    setOutput('');

    try {
      const response = await axios.post(`${API_BASE_URL}/compile`, {
        language: language,
        code: currentCodeFromEditor,
        stdin: stdin,
      });
      
      let resultText = `Exit Code: ${response.data.exit_code}\n\n`;
      if (response.data.success) {
        resultText += `Output:\n${response.data.stdout || '(No standard output)'}`;
        if (response.data.stderr) {
            resultText += `\n\nStderr:\n${response.data.stderr}`;
        }
      } else {
        resultText += `Error/Stderr:\n${response.data.stderr || response.data.error || 'Unknown error'}`;
        if (response.data.stdout) {
            resultText += `\n\nStdout (before error):\n${response.data.stdout}`;
        }
      }
      setOutput(resultText);

    } catch (err) {
      let errorMsg = 'An error occurred while trying to compile your code.';
      if (err.response && err.response.data) {
        if (err.response.data.detail) {
            errorMsg = `Error: ${err.response.data.detail}`;
        } else if (err.response.data.error || err.response.data.stderr) {
            errorMsg = `Server Error: ${err.response.data.error || err.response.data.stderr}`;
        }
      } else if (err.request) {
        errorMsg = 'Could not connect to the compilation server. Please check if it is running.';
      } else {
        errorMsg = `Client-side error: ${err.message}`;
      }
      setOutput(`Error:\n${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>CodePod</h1>
        <div className="controls">
          <label htmlFor="language-select">Language: </label>
          <select id="language-select" value={language} onChange={handleLanguageChange}>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>
          <button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </header>

      <div className="main-content">
        <div className="editor-pane">
          <Editor
            height="calc(100vh - 220px)"
            language={language === 'cpp' ? 'cpp' : 'python'}
            theme="vs-dark"
            value={code} // This makes the editor controlled by the 'code' state
            onMount={handleEditorDidMount}
            onChange={handleEditorChange}
            options={{
              selectOnLineNumbers: true,
              minimap: { enabled: true },
              fontSize: 14,
              wordWrap: "on"
            }}
          />
        </div>
        
        <div className="io-pane">
          <div className="stdin-container">
            <h3>Standard Input (stdin)</h3>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Enter input for your program here..."
              rows={8}
            />
          </div>
          <div className="output-container">
            <h3>Output / Result</h3>
            <pre className={`console-output ${output.toLowerCase().includes("error:") || output.toLowerCase().includes("compilation error:") ? 'error-text' : ''}`}>
              {isLoading ? 'Executing...' : (output || 'Output will appear here...')}
            </pre>
          </div>
        </div>
      </div>

      <footer className="App-footer">
        <p><strong>Disclaimer:</strong> Code execution is a simplified example. For production, ensure robust sandboxing.</p>
      </footer>
    </div>
  );
}

export default App;