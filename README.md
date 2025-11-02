Project Title Image Processing Software for Serial Number Identification

# Project Introduction

This project is a **React** and **Django** based web application with a separated front-end and back-end architecture.  
The front-end is built with React, while the back-end uses Django to provide API support, aiming to create an efficient and scalable web service.

## Tech Stack

- Frontend: React, JavaScript, HTML, CSS  
- Backend: Django, Django REST framework  
- Database: SQLite  
- Image Processing: OpenCV (for image processing)  
- OCR Engine: Local open-source model (requires further evaluation)  
  - PaddleOCR  

## Project Structure

```
├── frontend/      # React frontend project directory
├── backend/       # Django backend project directory
├── docs/          # Project documentation directory
  ├── images.zip  # Test images
└── README.md      # Project documentation file
```

## Quick Start

### 1. Clone the Project

```bash
git clone <project_url>
cd <project_directory>
```

### 2. Install Dependencies
1. Install Python 3.9.2. https://www.python.org/downloads/release/python-392   
2. Install the latest version of Node.js  
3. Follow the tutorial below to download and install Nginx, then replace the `nginx.conf` file in the Nginx installation directory under the `conf` folder.  
https://nginx.org/  

### 3. Notes
After multiple experiments, we found that Python 3.9.2 is the most stable version for running the project, while other versions tend to cause various runtime issues. 

If user unsure the version of python，the code below would help!
python --version

If user want to use conda to create the python 3.9.2 environment, the methods below would help!
1. Open Anaconda Prompt
2. conda create -n py392 python=3.9.2
3. conda activate py392
4. conda init powershell (if user use vscode with PowerShell not able to use conda command)

### 4. Create Python Virtual Environment and Start Backend
pip version must be 20.2.3. code to apply: 
```
python -m pip install pip==20.2.3
```

Activate the virtual environment:
```bash
py -3.9 -m venv myenv
myenv\Scripts\activate
```

Then, run the following command in Windows PowerShell:
```bash
./start.ps1
```

This will automatically complete the environment update and start both the backend and frontend.

The frontend runs on `http://localhost:3000`, and the backend runs on `http://localhost:8000`.

# Project Screenshot
![](./docs/preview.jpeg)
