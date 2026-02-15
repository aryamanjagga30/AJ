// WEBSITEV14 - Character at -2.05 + LAMP.GLB (6x)
// ===== MOBILE DETECTION =====
function isMobileDevice() {
    const isSmallScreen = window.innerWidth < 1024;
    const isMobileUA = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
    const isTablet = /ipad|tablet/i.test(navigator.userAgent.toLowerCase());
    const isLargeTablet = isTablet && window.innerWidth >= 1024;
    
    return (isSmallScreen || isMobileUA) && !isLargeTablet;
}

const IS_MOBILE = isMobileDevice();

// Mobile camera animation and UI
if (IS_MOBILE) {
    console.log('📱 Mobile mode active, waiting for avatar...');
    
    let mobileAnimated = false;
    let checkCount = 0;
    
    // Check every 100ms if avatar has loaded
    const mobileAnimationCheck = setInterval(() => {
        checkCount++;
        
        if (avatar) {
            console.log('✅ Avatar found, starting camera animation...');
            mobileAnimated = true;
            clearInterval(mobileAnimationCheck);
            
            // Wait a bit after loading screen disappears
            setTimeout(() => {
                console.log('🎬 Animating camera...');
                
                // Camera pan animation (from starting position to scene 2)
                gsap.to(camera.position, {
                    x: -2,
                    y: 0.3,
                    z: 2.5,
                    duration: 2.5,
                    ease: 'power2.inOut',
                    onUpdate: () => camera.lookAt(0, 1.5, 0),
                    onComplete: () => {
                        console.log('✅ Camera animation complete, showing UI...');
                        
                        // Show mobile UI after camera animation
                        const mobileView = document.getElementById('mobile-view');
                        const logo = document.querySelector('.mobile-logo');
                        const message = document.querySelector('.mobile-message');
                        
                        if (mobileView) mobileView.classList.add('show');
                        
                        setTimeout(() => {
                            if (logo) logo.classList.add('animate');
                            if (message) message.classList.add('animate');
                        }, 100);
                    }
                });
            }, 800);
        }
        
        // Stop checking after 50 attempts (5 seconds)
        if (checkCount > 50) {
            console.log('❌ Avatar not found after 5 seconds');
            clearInterval(mobileAnimationCheck);
        }
    }, 100);
    
    // Disable section navigation on mobile
    document.querySelectorAll('[data-section]').forEach(el => {
        el.style.pointerEvents = 'none';
    });
}





// ===== ORIGINAL V14 CODE CONTINUES BELOW =====


const canvas = document.getElementById('webgl');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: true,
    powerPreference: 'high-performance'
});


renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
renderer.physicallyCorrectLights = true;


let frameCount = 0;
let lastTime = performance.now();
const fpsCounter = document.querySelector('.fps-counter');


function updateFPS() {
    frameCount++;
    const currentTime = performance.now();
    if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        fpsCounter.textContent = `${fps} FPS`;
        fpsCounter.style.color = fps >= 55 ? '#00d4aa' : fps >= 30 ? '#ffaa00' : '#ff0000';
        frameCount = 0;
        lastTime = currentTime;
    }
}


// Sky
scene.background = new THREE.Color(0x0a1528);
const skyGeo = new THREE.SphereGeometry(450, 32, 32);
const skyMat = new THREE.ShaderMaterial({
    uniforms: {
        topColor: { value: new THREE.Color(0x0a1020) },
        bottomColor: { value: new THREE.Color(0x1a2840) }
    },
    vertexShader: `
        varying float vY;
        void main() {
            vY = normalize(position).y;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        varying float vY;
        void main() {
            gl_FragColor = vec4(mix(bottomColor, topColor, max(vY, 0.0)), 1.0);
        }
    `,
    side: THREE.BackSide
});
const sky = new THREE.Mesh(skyGeo, skyMat);
scene.add(sky);


const ambient = new THREE.AmbientLight(0x506070, 0.65);
scene.add(ambient);


const moonRim = new THREE.DirectionalLight(0x5080c0, 0.45);
moonRim.position.set(-25, 50, -20);
moonRim.castShadow = false;
scene.add(moonRim);


// Grass
const groundGeo = new THREE.PlaneGeometry(250, 250, 120, 120);


const grassCanvas = document.createElement('canvas');
grassCanvas.width = 1024;
grassCanvas.height = 1024;
const ctx = grassCanvas.getContext('2d');


ctx.fillStyle = '#2a3820';
ctx.fillRect(0, 0, 1024, 1024);


for (let i = 0; i < 15000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const len = Math.random() * 2.8 + 1;
    const greenVal = 35 + Math.random() * 30;
    ctx.strokeStyle = `rgba(${greenVal * 0.65}, ${greenVal}, ${greenVal * 0.75}, ${0.5 + Math.random() * 0.4})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * len, y - len * 2.2);
    ctx.stroke();
}


const grassTexture = new THREE.CanvasTexture(grassCanvas);
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(20, 20);


const groundMat = new THREE.MeshStandardMaterial({
    map: grassTexture,
    roughness: 0.88,
    metalness: 0,
    color: 0x3a4828
});


const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2;
ground.receiveShadow = true;


const pos = ground.geometry.attributes.position.array;
for (let i = 0; i < pos.length; i += 3) {
    const x = pos[i];
    const y = pos[i + 1];
    const noise = Math.sin(x * 0.07) * Math.cos(y * 0.07) * 1.1;
    const random = (Math.random() - 0.5) * 0.35;
    pos[i + 2] = noise + random;
}
ground.geometry.attributes.position.needsUpdate = true;
ground.geometry.computeVertexNormals();
scene.add(ground);


// LAMP - lamp.glb SCALED 6x
const lampGroup = new THREE.Group();
let lampModel = null;


// Load lamp.glb
const lampLoader = new THREE.GLTFLoader();
lampLoader.load(
    'lamp.glb',
    (gltf) => {
        lampModel = gltf.scene;

        // SCALE IT 6x
        lampModel.scale.set(4, 4, 4);

        // POSITION IT UP
        lampModel.position.y = 4.25;

        lampModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        lampGroup.add(lampModel);
        console.log('✅ Lamp.glb loaded - Scale: 6x, Y: 10');
    },
    (xhr) => console.log(`⏳ Lamp: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`),
    (err) => console.error('❌ Lamp failed:', err)
);


// Glow spheres at top (y = 9.3)
const innerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 16, 16),
    new THREE.MeshBasicMaterial({
        color: 0xffffee,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
    })
);
innerGlow.position.y = 6.25;
lampGroup.add(innerGlow);


const midGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 16, 16),
    new THREE.MeshBasicMaterial({
        color: 0xffdd99,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending
    })
);
midGlow.position.y = 6.25;
lampGroup.add(midGlow);


const outerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(1.6, 16, 16),
    new THREE.MeshBasicMaterial({
        color: 0xffbb66,
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending
    })
);
outerGlow.position.y = 6.25;
lampGroup.add(outerGlow);


// Spotlight
const charLight = new THREE.SpotLight(0xffaa33, 125, 32, Math.PI / 3, 0.5, 1.6);
charLight.position.set(0, 9.3, 5);
charLight.target.position.set(0, 1, 0);
charLight.castShadow = true;
charLight.shadow.mapSize.width = 2048;
charLight.shadow.mapSize.height = 2048;
charLight.shadow.bias = -0.0002;
charLight.shadow.radius = 6;
scene.add(charLight.target);
lampGroup.add(charLight);


const groundLight = new THREE.PointLight(0xffaa33, 95, 35, 1.8);
groundLight.position.set(0, 9.3, 0);
groundLight.castShadow = false;
lampGroup.add(groundLight);


lampGroup.position.set(3, -2, 6);
lampGroup.rotation.y = -0.6;
scene.add(lampGroup);


const groundFlood = new THREE.SpotLight(0xffbb44, 75, 25, Math.PI / 1.8, 0.95, 1.5);
groundFlood.position.set(3, 6, 6);
groundFlood.target.position.set(0, -2, 0);
groundFlood.castShadow = false;
scene.add(groundFlood);
scene.add(groundFlood.target);


const fillLight = new THREE.SpotLight(0x5588cc, 12, 22, Math.PI / 3, 0.8);
fillLight.position.set(-7, 5, 6);
fillLight.target.position.set(0, 1, 0);
fillLight.castShadow = false;
scene.add(fillLight);
scene.add(fillLight.target);


// Stars
const starsGeo = new THREE.BufferGeometry();
const starVerts = [];
for (let i = 0; i < 5000; i++) {
    starVerts.push(
        (Math.random() - 0.5) * 700,
        Math.random() * 350 + 70,
        (Math.random() - 0.5) * 700
    );
}
starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));


const starCanvas = document.createElement('canvas');
starCanvas.width = 32;
starCanvas.height = 32;
const starCtx = starCanvas.getContext('2d');
const starGrad = starCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
starGrad.addColorStop(0, 'rgba(255,255,255,1)');
starGrad.addColorStop(0.4, 'rgba(230,235,255,0.7)');
starGrad.addColorStop(1, 'rgba(200,210,255,0)');
starCtx.fillStyle = starGrad;
starCtx.fillRect(0, 0, 32, 32);


const stars = new THREE.Points(
    starsGeo,
    new THREE.PointsMaterial({
        size: 2.0,
        map: new THREE.CanvasTexture(starCanvas),
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    })
);
scene.add(stars);


scene.fog = new THREE.FogExp2(0x0a1528, 0.007);


camera.position.set(0, 4, 14);
camera.lookAt(0, 1, 0);


const cameraPositions = [
    { pos: { x: 0, y: 4, z: 14 }, look: { x: 0, y: 1.2, z: 0 } },
    { pos: { x: -2, y: 0.3, z: 2.5 }, look: { x: 0, y: 1.5, z: 0 } },
    { pos: { x: 0, y: 5, z: 18 }, look: { x: 0, y: 1, z: 0 } },
    { pos: { x: 0, y: -1, z: 8 }, look: { x: 0, y: 2, z: 0 } }
];


let avatar = null;
let mixer = null;
const loader = new THREE.GLTFLoader();
const timestamp = Date.now();
const modelURL = `jagga.glb?v=${timestamp}&r=${Math.random()}`;


console.log('🔄 Loading:', modelURL);


loader.load(
    modelURL,
    (gltf) => {
        avatar = gltf.scene;
        avatar.scale.set(2.25, 2.25, 2.25);
        avatar.position.set(0, -2.07, 0);
        avatar.rotation.y = 0;


        avatar.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });


        if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(avatar);
            gltf.animations.forEach((clip) => {
                mixer.clipAction(clip).play();
            });
        }


        scene.add(avatar);
        console.log('✅ Avatar loaded at y:-2.05');


        document.getElementById('loading-screen').classList.add('hidden');
    },
    (xhr) => console.log(`⏳ ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`),
    (err) => {
        console.error('❌ Failed:', err);
        document.getElementById('loading-screen').classList.add('hidden');
    }
);


let currentSection = 0;
const sections = document.querySelectorAll('.section');
const totalSections = sections.length;
let isAnimating = false;


sections[0].classList.add('active');


function goToSection(index) {
    if (index < 0 || index >= totalSections || isAnimating) return;


    isAnimating = true;
    currentSection = index;


    sections.forEach((s, i) => s.classList.toggle('active', i === index));
    document.querySelector('.progress-bar').style.width = ((index + 1) / totalSections * 100) + '%';


    const pos = cameraPositions[index];


    gsap.to(camera.position, {
        x: pos.pos.x,
        y: pos.pos.y,
        z: pos.pos.z,
        duration: 1.8,
        ease: 'power3.inOut',
        onUpdate: () => camera.lookAt(pos.look.x, pos.look.y, pos.look.z),
        onComplete: () => { isAnimating = false; }
    });
}


let scrollTimeout;
window.addEventListener('wheel', (e) => {
    if (isAnimating) return;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        if (e.deltaY > 0 && currentSection < totalSections - 1) {
            goToSection(currentSection + 1);
        } else if (e.deltaY < 0 && currentSection > 0) {
            goToSection(currentSection - 1);
        }
    }, 50);
}, { passive: true });


document.querySelectorAll('[data-section]').forEach(el => {
    el.addEventListener('click', (e) => {
        e.preventDefault();
        goToSection(parseInt(el.getAttribute('data-section')));
    });
});


window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') goToSection(currentSection + 1);
    if (e.key === 'ArrowUp') goToSection(currentSection - 1);
});


const clock = new THREE.Clock();


function animate() {
    requestAnimationFrame(animate);


    const delta = clock.getDelta();
    const time = Date.now();


    if (mixer) mixer.update(delta);


    if (avatar) {
        avatar.position.y = -2.05 + Math.sin(time * 0.0002) * 0.01;
    }


    if (charLight) {
        charLight.intensity = 125 + Math.sin(time * 0.005) * 6;
    }


    if (groundLight) {
        groundLight.intensity = 95 + Math.sin(time * 0.005) * 5;
    }


    if (groundFlood) {
        groundFlood.intensity = 75 + Math.sin(time * 0.005) * 4;
    }


    if (innerGlow) {
        innerGlow.material.opacity = 0.5 + Math.sin(time * 0.004) * 0.06;
    }


    updateFPS();
    renderer.render(scene, camera);
}
animate();


window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


console.log('🎬 V14 - Character at y:-2.05 + LAMP.GLB (6x, Y:10)');
