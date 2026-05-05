import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import earthVertexShader from './shaders/earth/vertex.glsl'
import earthFragmentShader from './shaders/earth/fragment.glsl'
import atVertexShader from './shaders/earth/atver.glsl'
import atFragmentShader from './shaders/earth/atfrag.glsl'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// IMPORT TỪ CÁC MODULE
import { latLonToVector3 } from './data/math.js'
import { buttonData, gameState, foodModels, foodData } from './data/constants.js'
import { AudioController } from './data/Audio.js'
import { initUI, openFoodModalHTML } from './UI.js' 
import { initGameSystem } from './game/MiniGame.js'
// -------------------------------
// BASE & VARIABLES
export let isFocusing = false // Export để UI có thể can thiệp nếu cần
export const targetRotation = new THREE.Vector2()
const ROTATE_SPEED = 0.08
const EPS = 0.001

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
const textureLoader = new THREE.TextureLoader()
// -------------------------------
// CAMERA & CONTROLS
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.set(12, 5, 4)
scene.add(camera)

export const controls = new OrbitControls(camera, canvas)
window.controls = controls;
controls.enableDamping = true
// Đánh thức UI
initUI(controls);
// Khởi tạo Game
initGameSystem((matchedFood) => {
    gameState[matchedFood] = true;
    spawnFoodModel(matchedFood);
});
// Render
const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)
renderer.setClearColor(0x000000, 0)
// -------------------------------
// ENVIRONMENT (EARTH, ATMOSPHERE, STARS)
const earthGroup = new THREE.Group()
scene.add(earthGroup)
// Bầu trời sao
const starCount = 3000
const starPositions = new Float32Array(starCount * 3)
for (let i = 0; i < starCount * 3; i++) {
    starPositions[i] = (Math.random() - 0.5) * 300
}
const starGeometry = new THREE.BufferGeometry()
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({ size: 1, color: 0x999999 })
)
scene.add(stars)
// Trái đất (Sử dụng Shader)
const earthTexture = textureLoader.load('/earth/2dmap.jpg')
earthTexture.colorSpace = THREE.SRGBColorSpace
const earth = new THREE.Mesh(
    new THREE.SphereGeometry(2, 64, 64),
    new THREE.ShaderMaterial({
        vertexShader: earthVertexShader,
        fragmentShader: earthFragmentShader,
        uniforms: {
            uStyTexture: new THREE.Uniform(earthTexture)
        }
    })
)
earthGroup.add(earth)
// Khí quyển (Sử dụng Shader)
const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(2, 64, 64),
    new THREE.ShaderMaterial({
        vertexShader: atVertexShader,
        fragmentShader: atFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    })
)
atmosphere.scale.set(1.1, 1.1, 1.1)
earthGroup.add(atmosphere)
// -------------------------------
// NÚT BẤM TRÊN TRÁI ĐẤT
const globeButtons = []

buttonData.forEach(data => {
    const texture = textureLoader.load(data.img);
    const geometry = new THREE.PlaneGeometry(0.7, 0.7); 
    
    const material = new THREE.MeshBasicMaterial({
        map: texture, 
        transparent: true, 
        depthTest: true, 
        //Hạ alphaTest xuống 0 để khi opacity = 0 nó không bị lỗi biến mất khỏi hệ thống click
        alphaTest: 0 
    });
    const iconMesh = new THREE.Mesh(geometry, material);
    
    const pos = latLonToVector3(data.lat, data.lon, 2.015);
    iconMesh.position.copy(pos);
    iconMesh.lookAt(pos.clone().multiplyScalar(2));
    
    iconMesh.userData.model = data.model;
    iconMesh.userData.bg = data.bg;
    iconMesh.userData.foodKey = data.key; 
    
    earthGroup.add(iconMesh);
    globeButtons.push(iconMesh);
});
export function hideUnlockedButton(unlockedFoodKey) {
    globeButtons.forEach(btn => {
        if (btn.userData.foodKey === unlockedFoodKey) {
            // 2. TÀNG HÌNH NHƯNG VẪN BẤM ĐƯỢC
            btn.material.opacity = 0; 
        }
    });
}
// -------------------------------
// SPAWN FOOD (KHI THẮNG MINIGAME)
const foodGroup = new THREE.Group();
earthGroup.add(foodGroup);
const loader = new GLTFLoader();
const loadedFoods = {}; 

// Export hàm này để minigame.js có thể gọi sau khi nấu ăn thành công
export function spawnFoodModel(food) {
  const path = foodModels[food];
  if (!path) return;

  if (loadedFoods[food]) {
    foodGroup.remove(loadedFoods[food]);
  }

  loader.load(path, (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.3, 0.3, 0.3);
    model.position.set(0, 2.1, 0);
    //foodGroup.add(model);
    loadedFoods[food] = model;
  });
}
// -------------------------------
// RAYCASTER (XỬ LÝ CLICK)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let currentModelBg = '';

window.addEventListener('click', (event) => {
    // Bỏ qua nếu đang click vào UI (ID/Class có thể điều chỉnh theo HTML thực tế)
    if (event.target.closest('#desktopUI') || 
        event.target.closest('#musicPanel') ||
        event.target.closest('.appModal') ||
        event.target.closest('.modal')) {
        return;
    }
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(globeButtons);
    if (intersects.length > 0) {
        const clickedSprite = intersects[0].object;
        const foodKey = clickedSprite.userData.foodKey; 
        const modelPath = clickedSprite.userData.model;
        
        if (foodKey && gameState[foodKey] === false) {
            alert("Món ăn này chưa được mở khóa. Hãy chơi mini-game!");
            return;
        }
        // Gọi hàm từ audio.js và ui.js
        if (AudioController && AudioController.playOpen) {
            AudioController.playOpen();
        }
        if(typeof openFoodModalHTML === 'function') {
            // Lấy dữ liệu trực tiếp từ object foodData
            const currentFoodInfo = foodData[foodKey];
            openFoodModalHTML(foodKey, currentFoodInfo);
        }
        currentModelBg = clickedSprite.userData.bg; 
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.setProperty('--modal-bg', `url('${currentModelBg}')`);
        }
        requestAnimationFrame(() => {
            initModal3D(modelPath);
        });
    }
});
// -------------------------------
// MODAL 3D VIEWER
let modalScene, modalCamera, modalRenderer, modalAnimationId, modalControls;
let isModalInitialized = false; 
const modalModelCache = {}; 
let currentModalModel = null; 

function initModal3D(modelPath) {
    const container = document.getElementById('modelContainer');
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    if (!isModalInitialized) {
        modalScene = new THREE.Scene();
        modalCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        modalCamera.position.set(0, 1, 3);
        
        modalRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        modalRenderer.setSize(width, height);
        modalRenderer.domElement.style.width = '100%';
        modalRenderer.domElement.style.height = '100%';
        modalRenderer.domElement.style.outline = 'none';
        
        container.appendChild(modalRenderer.domElement);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 2);
        dirLight.position.set(10, 10, 10);
        modalScene.add(dirLight);
        modalScene.add(new THREE.AmbientLight(0xffffff, 0.4));
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
        hemiLight.position.set(0, 20, 0);
        modalScene.add(hemiLight);
        
        modalControls = new OrbitControls(modalCamera, modalRenderer.domElement);
        modalControls.enableDamping = true;
        modalControls.minPolarAngle = Math.PI / 2.5; 
        modalControls.maxPolarAngle = Math.PI / 2.5; 

        isModalInitialized = true; 
    }
    
    if (currentModalModel) modalScene.remove(currentModalModel);
    if (modalAnimationId) cancelAnimationFrame(modalAnimationId);
    
    const playAnimation = (model) => {
        currentModalModel = model;
        modalScene.add(model);
        const animate = () => {
            modalAnimationId = requestAnimationFrame(animate);
            if (currentModalModel) currentModalModel.rotation.y += 0.01;
            modalControls.update();
            modalRenderer.render(modalScene, modalCamera);
        };
        animate();
    };
    
    if (modalModelCache[modelPath]) {
        playAnimation(modalModelCache[modelPath]);
    } else {
        const modelConfig = {
            '/food/spag.glb': {scale: 5, position: { x: 0, y: 0, z: 0 }},
            '/food/tako.glb': {scale: 50, position: { x: 0, y: 0, z: 0 }},
            '/food/empanada.glb': {scale: 0.05, position: { x: -1, y: 2, z: 0 }},
            '/food/padthai.glb': {scale: 3, position: { x: 0, y: 0, z: 0 }},
            '/food/burrito.glb': {scale: 2, position: { x: 0, y: 0, z: 0 }}
        };
        loader.load(modelPath, (gltf) => {
            const model = gltf.scene;
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center); 
            const config = modelConfig[modelPath];
            
            if (config) {
                model.scale.setScalar(config.scale);
                model.position.add(new THREE.Vector3(config.position.x, config.position.y, config.position.z));
            } else {
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2 / maxDim;
                model.scale.setScalar(scale);
            }
            modalModelCache[modelPath] = model; 
            playAnimation(model);
        });
    }
}

function preloadAllModalModels() {
    const modelConfig = {
        '/food/spag.glb': {scale: 7, position: { x: 0, y: 0, z: 0 }},
        '/food/tako.glb': {scale: 50, position: { x: 0, y: 0, z: 0 }},
        '/food/empanada.glb': {scale: 0.05, position: { x: -1, y: 2, z: 0 }},
        '/food/padthai.glb': {scale: 3, position: { x: 0, y: 0, z: 0 }},
        '/food/burrito.glb': {scale: 2, position: { x: 0, y: 0, z: 0 }}
    };
    for (const path in modelConfig) {
        loader.load(path, (gltf) => {
            const model = gltf.scene;
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center); 
            const config = modelConfig[path];
            model.scale.setScalar(config.scale);
            model.position.add(new THREE.Vector3(config.position.x, config.position.y, config.position.z));
            modalModelCache[path] = model; 
        });
    }
}
preloadAllModalModels();
//////STICKYNOTE
const n = document.getElementById("note")
let drag = false, x, y
n.onmousedown = e => {
  drag = true
  x = e.clientX - n.offsetLeft
  y = e.clientY - n.offsetTop
}
onmousemove = e => {
  if (!drag) return
  n.style.left = e.clientX - x + "px"
  n.style.top = e.clientY - y + "px"
}
onmouseup = () => drag = false
// -------------------------------
// RESIZE & ANIMATION LOOP
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

function updateRotation() {
    if (!isFocusing) return;
    const dy = targetRotation.y - earthGroup.rotation.y
    const dx = targetRotation.x - earthGroup.rotation.x
    earthGroup.rotation.y += dy * ROTATE_SPEED
    earthGroup.rotation.x += dx * ROTATE_SPEED
    if (Math.abs(dy) < EPS && Math.abs(dx) < EPS) {
        earthGroup.rotation.y = targetRotation.y
        earthGroup.rotation.x = targetRotation.x
        isFocusing = false
    }
}

function tick() {
    updateRotation()
    controls.update()
    earthGroup.rotation.y += 0.0015
    stars.rotation.y += 0.0002
    stars.rotation.x += 0.0001
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}
tick()