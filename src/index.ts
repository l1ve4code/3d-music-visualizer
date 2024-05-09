import * as THREE from "three";
import shaders from "./shaders";
import planeMeshParameters from "./planeMeshParameters";


function init(audio: HTMLAudioElement, container: HTMLElement | Window = document.body) {
    const uniforms = {
        u_time: {
            type: "f",
            value: 2.0,
        },
        u_amplitude: {
            type: "f",
            value: 4.0,
        },
        u_data_arr: {
            type: "float[64]",
            value: new Uint8Array(),
        },
    };

    const audioContext = new window.AudioContext();

    const source = audioContext.createMediaElementSource(audio);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 1024;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    _initThree();


    function _initThree() {
        const isWindow = container instanceof Window;
        const _container = isWindow ? document.body : container;
        const width = isWindow ? window.innerWidth : container.clientWidth;
        const height = isWindow ? window.innerHeight : container.clientHeight;
        const scene = new THREE.Scene();

    
        const ambientLight = new THREE.AmbientLight(0xaaaaaa);
        ambientLight.castShadow = false;
    
        const spotLight = new THREE.SpotLight(0xffffff, );
        spotLight.intensity = 0.9;
        spotLight.position.set(-10, 40, 20);
        spotLight.castShadow = true;
    
        const camera = new THREE.PerspectiveCamera(
            85,
            width / height,
            1,
            1000
        );
        camera.position.z = 80;
    
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearAlpha(0);
    
        const canvas = renderer.domElement;
        canvas.style.opacity = "1";
        canvas.style.transition = "opacity 0.4s";
        _container.appendChild(canvas);

        const planeGeometry = new THREE.PlaneGeometry(64, 64, 64, 64);
        const planeMaterial = new THREE.ShaderMaterial({
            vertexShader: shaders.vertex,
            fragmentShader: shaders.fragment,
            uniforms: uniforms,
            wireframe: true
        });
    
        let planeMeshArray = [];
    
        planeMeshParameters.forEach(item => {
            const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    
            if(item.rotation.x == undefined) {
                planeMesh.rotation.y = item.rotation.y;
            } else {
                planeMesh.rotation.x = item.rotation.x;
            }
    
            planeMesh.scale.x = item.scale;
            planeMesh.scale.y = item.scale;
            planeMesh.scale.z = item.scale;
            planeMesh.position.x = item.position.x;
            planeMesh.position.y = item.position.y;
            planeMesh.position.z = item.position.z;
    
            planeMeshArray.push(planeMesh)
            scene.add(planeMesh);
        });
    
        scene.add(ambientLight);
        scene.add(spotLight);
    

        const render = () => {
            analyser.getByteFrequencyData(dataArray);
            uniforms.u_data_arr.value = dataArray;
            camera.rotation.z += 0.001;
            renderer.render(scene, camera);
        }


        let idRequestAnimationFrame = 0;
        let idTimeout: NodeJS.Timeout;
        let animate = () => {
            idRequestAnimationFrame = requestAnimationFrame(animate);
            render();
        }
        audio.addEventListener("play", () => {
            canvas.style.opacity = "1";
            clearTimeout(idTimeout);
            animate();
            audioContext.resume();
        });
        audio.addEventListener("pause", () => {
            canvas.style.opacity = "0";
            idTimeout = setTimeout(() => cancelAnimationFrame(idRequestAnimationFrame), 400);
        });
        window.addEventListener("resize", () => {
            const width = isWindow ? window.innerWidth : container.clientWidth;
            const height = isWindow ? window.innerHeight : container.clientHeight;
            console.log(width, height);
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            canvas.width = width;
            canvas.height = height;
        });
    }
}

module.exports = {
    init
}