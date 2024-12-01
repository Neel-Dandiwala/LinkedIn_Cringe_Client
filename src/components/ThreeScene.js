import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ThreeScene = ({ score }) => {
  const mountRef = useRef(null);
  const BALLS_COUNT = 30;

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Position camera further back to see larger spheres
    camera.position.z = 20;

    // Lighting
    const getLightColors = (score) => {
      if (!score) return [0xedb543, 0xffffff, 0xa655f6];
      if(score < 20) return [0xf45c2c, 0xf97217, 0xee4445];
      if(score < 40) return [0xedb543, 0xf87318, 0xeab309];
      if(score < 60) return [0x7268f5, 0x3b81f6, 0xa754f7];
      if(score < 80) return [0xedb543, 0xee4542, 0xeab309];
      return [0xf76c1a, 0xee4442, 0xf87216];
    }
    const lightColors = getLightColors(score).map(color => new THREE.Color(color));
    const ambientLight = new THREE.AmbientLight(lightColors[0], 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(lightColors[1], 0.8);
    const directionalLight2 = new THREE.DirectionalLight(lightColors[2], 0.8);
    directionalLight.position.set(10, 10, 10);
    directionalLight2.position.set(-10, -10, -10);

    const whiteLight = new THREE.DirectionalLight(0xffffff, 0.3);
    whiteLight.position.set(0, 0, 20);
    scene.add(whiteLight);
    scene.add(directionalLight);
    scene.add(directionalLight2);

    // Load textures
    const textureLoader = new THREE.TextureLoader();
    const textures = {
      love: textureLoader.load('/images/love.jpg'),      // Not cringe
      surprise: textureLoader.load('/images/surprise.jpg'), // Good
      like: textureLoader.load('/images/like.jpg'),      // Neutral
      laugh: textureLoader.load('/images/laugh.jpg'),    // Somewhat cringe
      angry: textureLoader.load('/images/angry.jpg')     // Very cringe
    };

    // Create larger emoji spheres
    const DAMPING = 0.98; // Add damping to slow down movement
    const COLLISION_ELASTICITY = 0.5; // Reduce bounce strength
    const SPHERE_RADIUS = 3;
    const INITIAL_VELOCITY_SCALE = 0.1;
    const BOUNDARY = {
      left: -20,
      right: 20,
      top: 20,
      bottom: -20,
      front: -5,
      back: 5
    }
    const spheres = [];
    const spherePositions = [];
    for(let i = 0; i < BALLS_COUNT; i++) {
      spherePositions.push({
        x: Math.random() * 40 - 20,
        y: Math.random() * 40 - 20,
        z: Math.random() * 10 - 5
      });
    }

    // Create all emoji spheres
    const activeTextures = (score) => {
      if(!score) return [textures.love, textures.like, textures.laugh, textures.surprise, textures.angry];
      if(score < 20) return [textures.love];
      if(score < 40) return [textures.surprise];
      if(score < 60) return [textures.like];
      if(score < 80) return [textures.laugh];
      return [textures.angry];
    }
    for(let i = 0; i < BALLS_COUNT; i++) {
      const texture = activeTextures(score)[i % activeTextures(score).length];
      const geometry = new THREE.SphereGeometry(SPHERE_RADIUS, 32, 32); // Larger radius (3 instead of 1.2)
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0.1,
        roughness: 0.1,
        
      });

      const sphere = new THREE.Mesh(geometry, material);
      const pos = spherePositions[i];
      sphere.position.set(pos.x, pos.y, pos.z);
      
      sphere.userData = {
        velocity: new THREE.Vector3((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.1),
        mass: 0.5,
        type: i,
        frequencies: {
          x: Math.random() * 0.002 + 0.001,
          y: Math.random() * 0.002 + 0.001,
          z: Math.random() * 0.001 + 0.0005
        },
        directions: {
          x: Math.random() < 0.5 ? 1 : -1,
          y: Math.random() < 0.5 ? 1 : -1,
          z: Math.random() < 0.5 ? 1 : -1
        },
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.002,
          y: (Math.random() - 0.5) * 0.002
        },
        timeOffset: Math.random() * 1000,
        initialY: pos.y,
        floatSpeed: 0.001 + Math.random() * 0.001,
        floatOffset: Math.random() * Math.PI * 2
      };

      scene.add(sphere);
      spheres.push(sphere);
    }

    const checkCollisions = () => {
      for(let i = 0; i < spheres.length; i++) {
        const sphereA = spheres[i];
        if(sphereA.position.x - SPHERE_RADIUS < BOUNDARY.left || sphereA.position.x + SPHERE_RADIUS > BOUNDARY.right) {
          sphereA.userData.velocity.x *= -0.8;
        }
        if(sphereA.position.y - SPHERE_RADIUS < BOUNDARY.bottom || sphereA.position.y + SPHERE_RADIUS > BOUNDARY.top) {
          sphereA.userData.velocity.y *= -0.8;
        }
        if(sphereA.position.z - SPHERE_RADIUS < BOUNDARY.front || sphereA.position.z + SPHERE_RADIUS > BOUNDARY.back) {
          sphereA.userData.velocity.z *= -0.8;
        }

        for(let j = i + 1; j < spheres.length; j++) {
          const sphereB = spheres[j];
          const dx = sphereB.position.x - sphereA.position.x;
          const dy = sphereB.position.y - sphereA.position.y;
          const dz = sphereB.position.z - sphereA.position.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < SPHERE_RADIUS * 2) {
            // Calculate collision normal
            const nx = dx / distance;
            const ny = dy / distance;
            const nz = dz / distance;
            const overlap = (SPHERE_RADIUS * 2 - distance) * 0.5;
            sphereA.position.x -= nx * overlap;
            sphereA.position.y -= ny * overlap;
            sphereA.position.z -= nz * overlap;
            sphereB.position.x += nx * overlap;
            sphereB.position.y += ny * overlap;
            sphereB.position.z += nz * overlap;

            // Calculate relative velocity
            const dvx = sphereB.userData.velocity.x - sphereA.userData.velocity.x;
            const dvy = sphereB.userData.velocity.y - sphereA.userData.velocity.y;
            const dvz = sphereB.userData.velocity.z - sphereA.userData.velocity.z;

            // Calculate impulse
            const impulse = (dvx * nx + dvy * ny + dvz * nz) * COLLISION_ELASTICITY;

            // Apply impulse
            sphereA.userData.velocity.x += nx * impulse;
            sphereA.userData.velocity.y += ny * impulse;
            sphereA.userData.velocity.z += nz * impulse;
            sphereB.userData.velocity.x -= nx * impulse;
            sphereB.userData.velocity.y -= ny * impulse;
            sphereB.userData.velocity.z -= nz * impulse;
          }
        }
        sphereA.userData.velocity.multiplyScalar(DAMPING);
      }
    }

    // Create curved shapes (matching image)
    const createCurvedShape = (color) => {
      const geometry = new THREE.CylinderGeometry(0.4, 0.4, 15, 32, 1, true);
      const material = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
      });
      return new THREE.Mesh(geometry, material);
    };

    // Add two main curved shapes from image
    const curvedShapes = [];
    const shape1 = createCurvedShape(0xff69b4); // Pink
    shape1.position.set(-10, 0, -10);
    shape1.rotation.set(0.5, 0.5, -0.3);
    // scene.add(shape1);
    // curvedShapes.push(shape1);

    const shape2 = createCurvedShape(0x40E0D0); // Teal
    shape2.position.set(10, 0, -10);
    shape2.rotation.set(-0.3, -0.5, 0.5);
    // scene.add(shape2);
    // curvedShapes.push(shape2);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      checkCollisions();

      // Gentle floating animation for spheres
      spheres.forEach((sphere) => {
        

        sphere.userData.velocity.x += Math.sin(time + sphere.userData.timeOffset) * 0.002;
        sphere.userData.velocity.y += Math.cos(time + sphere.userData.timeOffset) * 0.002;
        sphere.userData.velocity.z += Math.sin(time * 0.5 + sphere.userData.timeOffset) * 0.001;
    

        sphere.rotation.y += 0.01
        sphere.rotation.x += sphere.userData.rotationSpeed.x;
        sphere.position.add(sphere.userData.velocity);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (object.material.map) object.material.map.dispose();
          object.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, [score]); // Added score dependency

  return <div ref={mountRef} className="absolute inset-0 -z-10" />;
};

export default ThreeScene;