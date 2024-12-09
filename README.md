# Christmas Dance Party

An interactive 3D Christmas scene featuring an animated character dancing to Christmas music.

## Setup Instructions

1. Project Structure
   Create the following folder structure:
   ```
   christmas-dance-party/
   ├── index.html
   ├── main.js
   ├── models/
   │   └── character.glb    # Add your 3D model here
   └── audio/
       └── christmas-song.mp3    # Add your music file here
   ```

2. Required Files
   - Add a GLTF/GLB format 3D model to the `models` folder
   - Add MP3 format Christmas music to the `audio` folder

3. Running the Project
   - Due to browser security restrictions, you need to serve the files through a local web server
   - You can use Python's built-in server:
     ```
     python -m http.server
     ```
   - Or use any other local development server
   - Open your browser and navigate to `http://localhost:8000`

## Customization

### 3D Model
- Replace `models/character.glb` with your own GLTF/GLB model
- Adjust the model scale and position in `main.js`:
  ```javascript
  model.scale.set(0.5, 0.5, 0.5); // Modify scale values
  model.position.y = 0; // Adjust height position
  ```

### Music
- Replace `audio/christmas-song.mp3` with your preferred Christmas music
- Update the audio source in `main.js`:
  ```javascript
  audioElement.src = 'audio/your-song-name.mp3';
  ```

### Scene Customization
- Modify the background color in `main.js`:
  ```javascript
  scene.background = new THREE.Color(0x2a446a); // Change color code
  ```
- Adjust lighting intensity:
  ```javascript
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Modify intensity
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Modify intensity
  ```

### Controls
- The scene includes orbit controls for camera movement:
  - Left click and drag to rotate
  - Right click and drag to pan
  - Scroll to zoom

## Features
- 3D animated character with dance animations
- Christmas music playback controls
- Multiple dance animations (if available in the model)
- Responsive design
- Shadow-enabled rendering
- Orbit controls for scene navigation

## Requirements
- Modern web browser with WebGL support
- Local web server for development
- 3D model in GLTF/GLB format with animations
- Christmas music in MP3 format 