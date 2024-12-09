// Scene variables
let scene, camera, renderer, clock, controls;
let currentAnimationIndex = 0;
const santaModels = {
    modern: [],
    salsa: []
};
const mixers = new Map();
let spotLights = [];
let discoBall;
let snowParticles;
let cactus;
let cactusMixer;
let treeLights = [];
let lasers = [];

// Audio setup
let audioContext, audioSource, analyser;
const audioElement = new Audio();
audioElement.src = './audio/Holiday House.mp3';
audioElement.loop = true;

// Constants
const SANTA_SCALE = 0.3;
const GROUND_SIZE = 20;
const SPAWN_INTERVAL = 5000;
const MAX_SANTAS_PER_TYPE = 15;
const SNOW_COUNT = 2000;
const SNOW_SPEED = 0.05;
const LASER_COLORS = [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff, 0xffff00];
const MAX_LASERS = 4;
const CENTER_RADIUS = 3;

// Add snow globe variables
let snowGlobe;
let snowGlobeBase;

// Add snow accumulation variables at the top with other variables
let snowAccumulationMesh;
let accumulatedSnowHeight = 0;
const MAX_SNOW_HEIGHT = 0.2;
const SNOW_ACCUMULATION_RATE = 0.0001;

// Add to variables at top
const cacti = [];
const MAX_CACTI = 4;
const CACTUS_SPAWN_INTERVAL = 8000;

// Add cloud variables at the top
let cloudParticles = [];
const CLOUD_COUNT = 20;

function createSnowParticles() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    
    for (let i = 0; i < SNOW_COUNT; i++) {
        vertices.push(
            Math.random() * GROUND_SIZE * 3 - GROUND_SIZE * 1.5,
            Math.random() * 30,
            Math.random() * GROUND_SIZE * 3 - GROUND_SIZE * 1.5
        );
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const snowMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.2,
        transparent: true,
        opacity: 0.8,
        map: new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKhSURBVFiF7ZdNSFRRFMd/580MhX2QhESRJFEULWoVtHHTqlbRJooIsgjaRBQkodGiRRC0axEYBEUQFULQJghaxKIPEBIlszYt+hAhszxTRNM7Le4dzp3nzPBmxgGhP1zePe/+z/+ce+695z4xxqCqU4F7wDTgvTFmt1Pdx8Q0FRFpBPYD1UAn0KKqb0VkuqqOqOr8f+aAqm4FDgLfgYuq2qOq80RkPzADOPLPHFDVrcBBIAVcVNUeVZ0LHAZmAodUdZuIHBeRKhHxJ8yBQPo+IA1cCqQ/AhwBaoAjqjpXVdtEZKaq+qraqKrNIuKNuwPzgCxwHLigqj0i8gFoALYAR1W1DmgD5gA+0AgsE5EvQAswCegWkR8j6sCQZwNxoA7oBrqAJ8aYn6o6CzgFbAZ2GGMeqGoTcBtYYYx5rqqLgRvAbWPM5nF1QEQagVYgDZwzxvSo6mzgNLAJaDHGPFDVRcBNoNkY81xVlwLXgLvGmI3j5oCI7AJOAv3AOWNMr6rWAmeAjcB2Y8xDVV0CXAU2GGNeqOpy4DJwzxizYVwcUNXdwAmgDzirqr2qWgecBdYD24wxj1R1KXAFWGuMeamqK4A24L4xZv2YHQikvwWcCKQ/B6wD2owxT1R1GXAZWGOMeaWqK4E24KExZt2YHAikvwF0AGeNMX2qWg+cB9YAbcaYp6q6HOgE1hhjXqvqKqAdeGSMWTtqB1S1BbgO/ALOG2P6VHUBcAFYDWw1xjxT1ZVBzFXGmDeq2gBcAh4bY9aMygFV3QNcA34C54wxH1V1IXARaAK2GGOeq+oq4CKwyhjzVlUbgQ7giTGmeVQOAKjqXqAT+AGcMcZ8UtVFQYxVwGZjzAtVbQjOrzTGvFPVJqATeGqMWR01/hdU6m6qx8j9UAAAAABJRU5ErkJggg=='),
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    snowParticles = new THREE.Points(geometry, snowMaterial);
    scene.add(snowParticles);
}

function createSnowyGround() {
    const floorSize = GROUND_SIZE * 1.4;
    const segments = 32;
    
    // Create main snowy ground
    const groundGeometry = new THREE.PlaneGeometry(floorSize, floorSize, segments, segments);
    const vertices = groundGeometry.attributes.position.array;
    
    // Create natural snow variations with lower height
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 2];
        const distanceFromCenter = Math.sqrt(x * x + z * z);
        
        // Base snow height with reduced height
        vertices[i + 1] = (Math.sin(x * 2) * Math.cos(z * 2) * 0.05) + 
                         (Math.random() * 0.1);
        
        // Add deeper snow patches with smooth transitions
        if (Math.random() < 0.1) {
            const patchSize = Math.random() * 0.15 + 0.1;
            vertices[i + 1] += Math.max(0, patchSize - (distanceFromCenter * 0.1));
        }
        
        // Clear dance area more thoroughly
        if (distanceFromCenter < GROUND_SIZE * 0.3) {
            const factor = Math.min(distanceFromCenter / (GROUND_SIZE * 0.3), 1);
            vertices[i + 1] *= factor * 0.3;
        }

        // Add higher snow at edges
        if (distanceFromCenter > GROUND_SIZE * 0.6) {
            const edgeFactor = (distanceFromCenter - GROUND_SIZE * 0.6) / (GROUND_SIZE * 0.4);
            vertices[i + 1] += edgeFactor * 0.2;
        }
    }

    const snowMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.8,
        clearcoat: 0.3,
        clearcoatRoughness: 0.4,
        emissive: 0x666666,
        emissiveIntensity: 0.2
    });

    const ground = new THREE.Mesh(groundGeometry, snowMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create realistic snow drifts
    const createSnowDrift = (x, z, scale, rotation) => {
        const driftGeometry = new THREE.SphereGeometry(1, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        const drift = new THREE.Mesh(driftGeometry, snowMaterial);
        drift.position.set(x, -0.1, z);
        drift.rotation.y = rotation;
        drift.scale.set(scale.x, scale.y * 0.7, scale.z);
        scene.add(drift);

        // Add overlapping smaller drifts for natural look
        const detailCount = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < detailCount; i++) {
            const detailGeometry = new THREE.SphereGeometry(0.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
            const detail = new THREE.Mesh(detailGeometry, snowMaterial);
            const offset = {
                x: (Math.random() - 0.5) * scale.x * 0.8,
                z: (Math.random() - 0.5) * scale.z * 0.8
            };
            detail.position.set(
                x + offset.x,
                -0.1 + Math.random() * 0.15,
                z + offset.z
            );
            detail.rotation.y = Math.random() * Math.PI * 2;
            detail.scale.set(
                Math.random() * 0.8 + 0.6,
                (Math.random() * 0.4 + 0.3) * 0.7,
                Math.random() * 0.8 + 0.6
            );
            scene.add(detail);
        }
    };

    // Create main snow drifts around the perimeter
    const driftCount = 24;
    for (let i = 0; i < driftCount; i++) {
        const angle = (i / driftCount) * Math.PI * 2;
        const radius = floorSize * (0.42 + Math.random() * 0.08);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const scale = {
            x: 2.5 + Math.random() * 1.5,
            y: 0.8 + Math.random() * 0.4,
            z: 2.5 + Math.random() * 1.5
        };
        createSnowDrift(x, z, scale, angle + Math.random() * Math.PI * 0.5);
    }

    // Add sparkles
    const sparkleCount = 2500;
    const sparkleGeometry = new THREE.BufferGeometry();
    const sparklePositions = [];

    for (let i = 0; i < sparkleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (floorSize / 1.8);
        const height = Math.random() * 0.15;
        sparklePositions.push(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
    }

    sparkleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(sparklePositions, 3));

    const sparkleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
    scene.add(sparkles);

    // Store sparkles for animation
    sparkles.userData.initialPositions = [...sparklePositions];
    scene.userData.snowSparkles = sparkles;
}

function createClubLights() {
    // Add colored spotlights
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
    const height = 10;
    const radius = GROUND_SIZE / 2;

    for (let i = 0; i < colors.length; i++) {
        const angle = (i / colors.length) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const spotLight = new THREE.SpotLight(colors[i], 2);
        spotLight.position.set(x, height, z);
        spotLight.angle = Math.PI / 6;
        spotLight.penumbra = 0.3;
        spotLight.decay = 1;
        spotLight.distance = 25;
        spotLight.castShadow = true;
        
        spotLight.target.position.set(0, 0, 0);
        scene.add(spotLight.target);
        scene.add(spotLight);
        spotLights.push(spotLight);
    }

    // Add disco ball
    const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const ballMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shininess: 100,
        specular: 0xffffff
    });
    discoBall = new THREE.Mesh(ballGeometry, ballMaterial);
    discoBall.position.set(0, 8, 0);
    scene.add(discoBall);

    // Add point lights around disco ball
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const light = new THREE.PointLight(0xffffff, 0.3, 10);
        light.position.set(
            Math.cos(angle) * 0.5 + discoBall.position.x,
            discoBall.position.y,
            Math.sin(angle) * 0.5 + discoBall.position.z
        );
        scene.add(light);
    }

    // Create laser projector at center
    const projectorGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 8);
    const projectorMaterial = new THREE.MeshPhongMaterial({
        color: 0x333333,
        shininess: 50
    });
    const projector = new THREE.Mesh(projectorGeometry, projectorMaterial);
    projector.position.set(0, 7, 0); // Position below disco ball
    scene.add(projector);

    // Add laser beams from projector
    const laserGeometry = new THREE.CylinderGeometry(0.02, 0.02, 15, 8);
    const laserMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < MAX_LASERS; i++) {
        const laser = new THREE.Mesh(laserGeometry, laserMaterial.clone());
        laser.material.color.setHex(LASER_COLORS[Math.floor(Math.random() * LASER_COLORS.length)]);
        
        // Position at projector
        laser.position.copy(projector.position);
        
        // Initial rotation
        const angle = (i / MAX_LASERS) * Math.PI * 2;
        laser.rotation.z = Math.PI / 4; // Initial upward angle
        laser.rotation.y = angle;
        
        laser.userData.rotationSpeed = 0.02 + Math.random() * 0.03;
        laser.userData.moveSpeed = 0.5 + Math.random() * 0.5;
        laser.userData.timeOffset = Math.random() * Math.PI * 2;
        laser.userData.baseY = projector.position.y;
        
        scene.add(laser);
        lasers.push(laser);
    }
}

function createBasicLights() {
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x111111, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}

function loadCactus(x, z) {
    if (cacti.length >= MAX_CACTI) {
        return;
    }

    const loader = new THREE.GLTFLoader();
    loader.load('./models/dancing_cactus.glb', (gltf) => {
        const cactusModel = gltf.scene;
        cactusModel.scale.set(1.2, 1.2, 1.2);
        cactusModel.position.set(x, 0, z);
        cactusModel.rotation.y = Math.random() * Math.PI * 2;
        
        cactusModel.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        
        scene.add(cactusModel);
        cacti.push(cactusModel);
        
        const mixer = new THREE.AnimationMixer(cactusModel);
        if (gltf.animations.length > 0) {
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
        }
        mixers.set(cactusModel, mixer);
    });
}

function createChristmasDecorations() {
    // Create Christmas trees around the perimeter
    const treeGeometry = new THREE.ConeGeometry(1, 2, 8);
    const treeMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x006400,
        shininess: 30,
        emissive: 0x003200
    });
    
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = GROUND_SIZE / 2 - 1;
        
        const tree = new THREE.Mesh(treeGeometry, treeMaterial);
        tree.position.set(
            Math.cos(angle) * radius,
            1,
            Math.sin(angle) * radius
        );
        tree.castShadow = true;
        scene.add(tree);

        // Add tree lights
        const redLight = new THREE.PointLight(0xff0000, 0.5, 3);
        const greenLight = new THREE.PointLight(0x00ff00, 0.5, 3);
        
        redLight.position.set(
            Math.cos(angle) * radius,
            1.5,
            Math.sin(angle) * radius
        );
        greenLight.position.set(
            Math.cos(angle) * radius,
            2,
            Math.sin(angle) * radius
        );

        scene.add(redLight);
        scene.add(greenLight);
        
        treeLights.push({
            red: redLight,
            green: greenLight,
            phase: i * Math.PI / 4
        });

        // Add presents under each tree
        createPresents(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
}

function createPresents(x, z) {
    const presentColors = [0xff0000, 0x00ff00, 0xffd700, 0x4169e1];
    const presentSizes = [[0.4, 0.4, 0.4], [0.3, 0.5, 0.3], [0.5, 0.3, 0.5]];
    
    for (let i = 0; i < 3; i++) {
        const presentGeometry = new THREE.BoxGeometry(...presentSizes[i]);
        const presentMaterial = new THREE.MeshPhongMaterial({
            color: presentColors[Math.floor(Math.random() * presentColors.length)],
            shininess: 50,
            emissive: 0x111111
        });
        
        const present = new THREE.Mesh(presentGeometry, presentMaterial);
        present.position.set(
            x + (Math.random() - 0.5) * 0.8,
            presentSizes[i][1] / 2,
            z + (Math.random() - 0.5) * 0.8
        );
        present.rotation.y = Math.random() * Math.PI * 2;
        present.castShadow = true;
        present.receiveShadow = true;
        scene.add(present);

        // Add ribbon
        const ribbonGeometry = new THREE.BoxGeometry(
            presentSizes[i][0] + 0.05,
            presentSizes[i][1] + 0.05,
            0.05
        );
        const ribbonMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 100,
            emissive: 0x222222
        });
        const ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
        ribbon.position.copy(present.position);
        ribbon.rotation.copy(present.rotation);
        ribbon.castShadow = true;
        scene.add(ribbon);
    }
}

function createSnowGlobe() {
    // Create the glass dome - make it closer to dance floor size
    const domeRadius = GROUND_SIZE * 0.7; // Reduced from 1.2 to 0.7
    const domeGeometry = new THREE.SphereGeometry(domeRadius, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.2,
        roughness: 0.1,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.0,
        side: THREE.DoubleSide
    });
    
    snowGlobe = new THREE.Mesh(domeGeometry, domeMaterial);
    snowGlobe.position.y = 0;
    snowGlobe.castShadow = true;
    snowGlobe.receiveShadow = true;
    scene.add(snowGlobe);

    // Create the base - adjusted for new size
    const baseHeight = 1.5; // Reduced from 2 to 1.5
    const baseTopRadius = domeRadius * 1.1;
    const baseBottomRadius = baseTopRadius * 1.2;
    const baseGeometry = new THREE.CylinderGeometry(baseTopRadius, baseBottomRadius, baseHeight, 64);
    const baseMaterial = new THREE.MeshPhongMaterial({
        color: 0x4a4a4a,
        shininess: 100,
        specular: 0x333333,
        emissive: 0x111111
    });
    
    snowGlobeBase = new THREE.Mesh(baseGeometry, baseMaterial);
    snowGlobeBase.position.y = -baseHeight / 2;
    snowGlobeBase.castShadow = true;
    snowGlobeBase.receiveShadow = true;
    scene.add(snowGlobeBase);

    // Add decorative ring at the base of the dome
    const ringGeometry = new THREE.TorusGeometry(domeRadius * 1.01, 0.15, 16, 100); // Reduced ring thickness
    const ringMaterial = new THREE.MeshPhongMaterial({
        color: 0x808080,
        shininess: 100,
        specular: 0x444444
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0;
    scene.add(ring);

    // Add snow particles that bounce off the dome
    const snowCount = SNOW_COUNT * 1.5; // Adjusted snow density
    const snowGeometry = new THREE.BufferGeometry();
    const snowPositions = [];
    const snowVelocities = [];
    
    for (let i = 0; i < snowCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radius = Math.random() * domeRadius * 0.9; // Keep snow slightly away from dome walls
        
        snowPositions.push(
            radius * Math.sin(phi) * Math.cos(theta),
            Math.abs(radius * Math.cos(phi)),
            radius * Math.sin(phi) * Math.sin(theta)
        );
        
        // Store velocity for each particle - adjusted for smaller space
        snowVelocities.push(
            (Math.random() - 0.5) * 0.03, // Reduced from 0.05
            -Math.random() * 0.08 - 0.03,  // Reduced from 0.1
            (Math.random() - 0.5) * 0.03   // Reduced from 0.05
        );
    }
    
    snowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(snowPositions, 3));
    
    const snowMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.08, // Reduced from 0.1
        transparent: true,
        opacity: 0.8,
        map: new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKhSURBVFiF7ZdNSFRRFMd/580MhX2QhESRJFEULWoVtHHTqlbRJooIsgjaRBQkodGiRRC0axEYBEUQFULQJghaxKIPEBIlszYt+hAhszxTRNM7Le4dzp3nzPBmxgGhP1zePe/+z/+ce+695z4xxqCqU4F7wDTgvTFmt1Pdx8Q0FRFpBPYD1UAn0KKqb0VkuqqOqOr8f+aAqm4FDgLfgYuq2qOq80RkPzADOPLPHFDVrcBBIAVcVNUeVZ0LHAZmAodUdZuIHBeRKhHxJ8yBQPo+IA1cCqQ/AhwBaoAjqjpXVdtEZKaq+qraqKrNIuKNuwPzgCxwHLigqj0i8gFoALYAR1W1DmgD5gA+0AgsE5EvQAswCegWkR8j6sCQZwNxoA7oBrqAJ8aYn6o6CzgFbAZ2GGMeqGoTcBtYYYx5rqqLgRvAbWPM5nF1QEQagVYgDZwzxvSo6mzgNLAJaDHGPFDVRcBNoNkY81xVlwLXgLvGmI3j5oCI7AJOAv3AOWNMr6rWAmeAjcB2Y8xDVV0CXAU2GGNeqOpy4DJwzxizYVwcUNXdwAmgDzirqr2qWgecBdYD24wxj1R1KXAFWGuMeamqK4A24L4xZv2YHQikvwWcCKQ/B6wD2owxT1R1GXAZWGOMeaWqK4E24KExZt2YHAikvwF0AGeNMX2qWg+cB9YAbcaYp6q6HOgE1hhjXqvqKqAdeGSMWTtqB1S1BbgO/ALOG2P6VHUBcAFYDWw1xjxT1ZVBzFXGmDeq2gBcAh4bY9aMygFV3QNcA34C54wxH1V1IXARaAK2GGOeq+oq4CKwyhjzVlUbgQ7giTGmeVQOAKjqXqAT+AGcMcZ8UtVFQYxVwGZjzAtVbQjOrzTGvFPVJqATeGqMWR01/hdU6m6qx8j9UAAAAABJRU5ErkJggg=='),
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    const snowParticlesInGlobe = new THREE.Points(snowGeometry, snowMaterial);
    scene.add(snowParticlesInGlobe);
    
    // Store velocities and dome radius for animation
    snowParticlesInGlobe.userData.velocities = snowVelocities;
    snowParticlesInGlobe.userData.domeRadius = domeRadius;
    scene.userData.snowGlobeParticles = snowParticlesInGlobe;
}

function createSnowAccumulation() {
    const floorSize = GROUND_SIZE;
    const segments = 48;
    
    // Create accumulation geometry
    const accumulationGeometry = new THREE.PlaneGeometry(floorSize, floorSize, segments, segments);
    const snowMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.8,
        clearcoat: 0.3,
        clearcoatRoughness: 0.4,
        transparent: true,
        opacity: 0,
        emissive: 0x666666,
        emissiveIntensity: 0.2
    });

    snowAccumulationMesh = new THREE.Mesh(accumulationGeometry, snowMaterial);
    snowAccumulationMesh.rotation.x = -Math.PI / 2;
    snowAccumulationMesh.position.y = -0.099; // Slightly above base snow
    snowAccumulationMesh.receiveShadow = true;
    scene.add(snowAccumulationMesh);
}

// Function to load a Santa model
function loadSanta(x, z, type) {
    if (santaModels[type].length >= MAX_SANTAS_PER_TYPE) {
        return;
    }

    const modelPath = type === 'modern' ? './models/character.glb' : './models/santa_salsa.glb';
    const loader = new THREE.GLTFLoader();
    loader.load(modelPath, (gltf) => {
        const model = gltf.scene;
        model.scale.set(SANTA_SCALE, SANTA_SCALE, SANTA_SCALE);
        model.position.set(x, 0, z);
        model.rotation.y = Math.random() * Math.PI * 2;
        
        model.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        
        scene.add(model);
        santaModels[type].push(model);

        const santaMixer = new THREE.AnimationMixer(model);
        mixers.set(model, santaMixer);

        if (gltf.animations.length > 0) {
            const action = santaMixer.clipAction(gltf.animations[0]);
            action.play();
        }
    });
}

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioSource = audioContext.createMediaElementSource(audioElement);
        analyser = audioContext.createAnalyser();
        
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);

        audioElement.volume = 0.5;
        
        // Add button event listeners
        document.getElementById('playMusic').addEventListener('click', () => {
            audioContext.resume().then(() => {
                audioElement.play().catch(error => {
                    console.log("Audio playback failed:", error);
                });
            });
        });
        
        document.getElementById('pauseMusic').addEventListener('click', () => {
            audioElement.pause();
        });
    }
}

// Initialize audio on first click
document.addEventListener('click', () => {
    initAudio();
    audioElement.play().catch(error => {
        console.log("Audio playback failed:", error);
    });
}, { once: true });

function createClouds() {
    // Create cloud material
    const cloudMaterial = new THREE.MeshLambertMaterial({
        color: 0x999999,
        transparent: true,
        opacity: 0.4,
        depthWrite: false
    });

    // Create several cloud layers
    for (let i = 0; i < CLOUD_COUNT; i++) {
        // Create random cloud shapes using merged geometries
        const cloudGeometry = new THREE.SphereGeometry(1.5, 8, 8);
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        
        // Position clouds randomly in the upper part of the snow globe
        const angle = Math.random() * Math.PI * 2;
        const radiusFromCenter = Math.random() * (GROUND_SIZE * 0.8);
        const height = 5 + Math.random() * 10;
        
        cloud.position.set(
            Math.cos(angle) * radiusFromCenter,
            height,
            Math.sin(angle) * radiusFromCenter
        );
        
        // Random rotation and scale for variety
        cloud.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        const scale = 1 + Math.random() * 2;
        cloud.scale.set(scale, scale * 0.6, scale);
        
        // Store for animation
        cloudParticles.push({
            mesh: cloud,
            rotationSpeed: (Math.random() - 0.5) * 0.002,
            moveSpeed: 0.2 + Math.random() * 0.3
        });
        
        scene.add(cloud);
    }
}

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Add denser fog for cloudy atmosphere
    scene.fog = new THREE.FogExp2(0x666666, 0.025);

    // Setup camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 15);

    // Setup renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Setup controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 5;
    controls.maxDistance = 30;

    // Create scene elements
    createBasicLights();
    createSnowyGround();
    createSnowAccumulation();
    createClubLights();
    createSnowParticles();
    createChristmasDecorations();
    createClouds();
    createSnowGlobe();

    // Initialize animation clock
    clock = new THREE.Clock();

    // Load initial models with reduced counts
    const initialCactiCount = 2;
    const cactusRadius = CENTER_RADIUS - 1;
    for (let i = 0; i < initialCactiCount; i++) {
        const angle = (i / initialCactiCount) * Math.PI * 2;
        const x = Math.cos(angle) * cactusRadius;
        const z = Math.sin(angle) * cactusRadius;
        loadCactus(x, z);
    }

    // Load initial Santas with reduced count
    const initialSantaCount = 2;
    const initialRadius = CENTER_RADIUS + 2;
    for (let i = 0; i < initialSantaCount; i++) {
        const angle = (i / initialSantaCount) * Math.PI * 2;
        const x = Math.cos(angle) * initialRadius;
        const z = Math.sin(angle) * initialRadius;
        loadSanta(x, z, i % 2 === 0 ? 'modern' : 'salsa');
    }

    // Start spawning additional cacti
    setInterval(() => {
        const angle = Math.random() * Math.PI * 2;
        const radius = CENTER_RADIUS - 1 + Math.random() * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        loadCactus(x, z);
    }, CACTUS_SPAWN_INTERVAL);

    // Start spawning additional Santas
    setInterval(() => {
        const angle = Math.random() * Math.PI * 2;
        const radius = CENTER_RADIUS + 2 + Math.random() * 3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        loadSanta(x, z, Math.random() < 0.5 ? 'modern' : 'salsa');
    }, SPAWN_INTERVAL);

    // Add click handler to start audio
    document.addEventListener('click', initAudio, { once: true });

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();
    
    // Update all mixers every frame for smooth animation
    mixers.forEach(mixer => mixer.update(delta));
    
    // Animate clouds
    cloudParticles.forEach(cloud => {
        cloud.mesh.rotation.y += cloud.rotationSpeed;
        
        // Add gentle floating motion
        cloud.mesh.position.y += Math.sin(time * cloud.moveSpeed) * 0.003;
        
        // Fade opacity based on position for edge blending
        const distanceFromCenter = Math.sqrt(
            cloud.mesh.position.x * cloud.mesh.position.x +
            cloud.mesh.position.z * cloud.mesh.position.z
        );
        
        const maxDistance = GROUND_SIZE * 0.8;
        const opacity = 0.4 * (1 - (distanceFromCenter / maxDistance));
        cloud.mesh.material.opacity = Math.max(0.1, opacity);
    });
    
    // Optimize snow animation
    if (snowParticles) {
        const positions = snowParticles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 9) {
            positions[i + 1] -= SNOW_SPEED;
            
            if (positions[i + 1] < 0) {
                positions[i + 1] = 30;
                positions[i] = Math.random() * GROUND_SIZE * 3 - GROUND_SIZE * 1.5;
                positions[i + 2] = Math.random() * GROUND_SIZE * 3 - GROUND_SIZE * 1.5;
            }
        }
        snowParticles.geometry.attributes.position.needsUpdate = true;
    }
    
    // Optimize sparkle updates
    if (scene.userData.snowSparkles && time % 0.5 < 0.25) {
        const sparkles = scene.userData.snowSparkles;
        sparkles.material.opacity = (Math.sin(time * 2) * 0.2 + 0.4);
    }

    // Rotate disco ball continuously
    if (discoBall) {
        discoBall.rotation.y += delta * 0.5;
    }

    // Animate spotlights continuously
    spotLights.forEach((light, index) => {
        const angle = time * 0.5 + (index * Math.PI / 2);
        light.position.x = Math.cos(angle) * (GROUND_SIZE / 2);
        light.position.z = Math.sin(angle) * (GROUND_SIZE / 2);
        light.target.position.x = Math.cos(angle + Math.PI) * (GROUND_SIZE / 4);
        light.target.position.z = Math.sin(angle + Math.PI) * (GROUND_SIZE / 4);
    });

    // Animate lasers continuously
    lasers.forEach((laser) => {
        laser.rotation.y += laser.userData.rotationSpeed;
        const wave = Math.sin(time * laser.userData.moveSpeed + laser.userData.timeOffset) * 0.5;
        laser.rotation.z = Math.PI / 4 + wave;
        
        if (Math.random() < 0.01) {
            laser.material.color.setHex(LASER_COLORS[Math.floor(Math.random() * LASER_COLORS.length)]);
        }
    });
    
    // Update controls and render
    controls.update();
    renderer.render(scene, camera);
}

// Initialize the application
init();
animate();