from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
import subprocess
import tempfile
import os
import uuid
import shutil

router = APIRouter()

class CodeInput(BaseModel):
    language: str
    code: str
    stdin: str = ""

def run_code_unsafely(language: str, code: str, stdin_data: str = ""):
    temp_dir = tempfile.mkdtemp(prefix="code_pod_exec_")
    result = {"stdout": "", "stderr": "", "error": "", "exit_code": 0, "combined_output": ""}
    unique_id = str(uuid.uuid4().hex[:8])

    try:
        if language == "python":
            script_path = os.path.join(temp_dir, f"script_{unique_id}.py")
            with open(script_path, "w", encoding='utf-8') as f:
                f.write(code)
            
            process = subprocess.Popen(
                ["python3", script_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=temp_dir,
                encoding='utf-8'
            )
            stdout, stderr = process.communicate(input=stdin_data, timeout=15)
            result["stdout"] = stdout
            result["stderr"] = stderr
            result["exit_code"] = process.returncode

        elif language == "cpp":
            source_path = os.path.join(temp_dir, f"program_{unique_id}.cpp")
            executable_name = f"program_{unique_id}"
            executable_path = os.path.join(temp_dir, executable_name)
            
            with open(source_path, "w", encoding='utf-8') as f:
                f.write(code)

            compile_process = subprocess.Popen(
                ["g++", source_path, "-o", executable_path, "-std=c++17", "-Wall"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=temp_dir,
                encoding='utf-8'
            )
            compile_stdout, compile_stderr = compile_process.communicate(timeout=15)

            if compile_process.returncode != 0:
                result["stderr"] = f"Compilation Error:\n{compile_stdout}{compile_stderr}"
                result["exit_code"] = compile_process.returncode
                result["combined_output"] = result["stderr"]
                # shutil.rmtree(temp_dir, ignore_errors=True) # Clean up temp dir
                return result

            run_process = subprocess.Popen(
                [executable_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=temp_dir,
                encoding='utf-8'
            )
            stdout, stderr = run_process.communicate(input=stdin_data, timeout=15)
            result["stdout"] = stdout
            result["stderr"] = stderr
            result["exit_code"] = run_process.returncode
        else:
            result["error"] = "Unsupported language"
            result["exit_code"] = 1
            
    except subprocess.TimeoutExpired:
        result["stderr"] = "Execution timed out after 15 seconds."
        result["error"] = "Timeout"
        result["exit_code"] = -1
    except Exception as e:
        result["error"] = f"An unexpected error occurred: {str(e)}"
        result["stderr"] = str(e)
        result["exit_code"] = 1
    finally:
        if result["stdout"] and result["stderr"]:
            result["combined_output"] = f"Stdout:\n{result['stdout']}\nStderr:\n{result['stderr']}"
        elif result["stdout"]:
            result["combined_output"] = result["stdout"]
        elif result["stderr"]:
            result["combined_output"] = result["stderr"]
        elif result["error"]:
             result["combined_output"] = result["error"]
        
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)
        
    return result

@router.post("/compile", summary="Compile and run code")
async def compile_code_endpoint(payload: CodeInput = Body(...)):
    if not payload.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty.")
    if payload.language not in ["python", "cpp"]:
        raise HTTPException(status_code=400, detail="Unsupported language. Only 'python' or 'cpp' are supported.")

    execution_result = run_code_unsafely(payload.language, payload.code, payload.stdin)
    
    is_success = execution_result["exit_code"] == 0
    if execution_result["error"] and execution_result["error"] != "Timeout":
         is_success = False

    return {
        "stdout": execution_result["stdout"],
        "stderr": execution_result["stderr"],
        "combined_output": execution_result["combined_output"],
        "error": execution_result["error"],
        "exit_code": execution_result["exit_code"],
        "success": is_success
    }