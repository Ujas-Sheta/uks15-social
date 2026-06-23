import { useEffect, useRef } from "react";
import * as THREE from "three";

const AmbientScene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      58,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);
    const ribbonGroup = new THREE.Group();
    scene.add(ribbonGroup);

    const palette = ["#16a34a", "#22c55e", "#14b8a6", "#f59e0b", "#38bdf8"];

    palette.forEach((color, index) => {
      const geometry = new THREE.TorusKnotGeometry(0.65 + index * 0.08, 0.018, 120, 10);
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.22,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set((index - 2) * 2.5, index % 2 ? -2.1 : 1.9, -index * 0.4);
      mesh.rotation.set(index * 0.7, index * 0.4, index * 0.2);
      group.add(mesh);
    });

    Array.from({ length: 4 }).forEach((_, index) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-8, -2 + index * 1.4, -2),
        new THREE.Vector3(-3, 2.2 - index * 0.4, -1),
        new THREE.Vector3(1.5, -1.4 + index * 0.3, -2.4),
        new THREE.Vector3(8, 1.2 - index * 0.8, -1.2),
      ]);
      const geometry = new THREE.TubeGeometry(curve, 90, 0.012, 8, false);
      const material = new THREE.MeshBasicMaterial({
        color: palette[index],
        transparent: true,
        opacity: 0.16,
      });
      const ribbon = new THREE.Mesh(geometry, material);
      ribbon.rotation.z = index * 0.08;
      ribbonGroup.add(ribbon);
    });

    const particles = new THREE.Points(
      new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 220 }, () => {
          const x = (Math.random() - 0.5) * 18;
          const y = (Math.random() - 0.5) * 11;
          const z = (Math.random() - 0.5) * 7;
          return new THREE.Vector3(x, y, z);
        })
      ),
      new THREE.PointsMaterial({
        color: "#22c55e",
        size: 0.04,
        transparent: true,
        opacity: 0.34,
      })
    );
    scene.add(particles);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    let animationId;
    const animate = () => {
      animationId = window.requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      group.rotation.y += 0.0024;
      group.rotation.x = Math.sin(time * 0.35) * 0.11;
      ribbonGroup.rotation.y = Math.sin(time * 0.18) * 0.08;
      ribbonGroup.position.y = Math.sin(time * 0.22) * 0.18;
      particles.rotation.y -= 0.001;
      particles.rotation.x = Math.sin(time * 0.12) * 0.04;
      renderer.render(scene, camera);
    };

    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      group.children.forEach((child) => {
        child.geometry.dispose();
        child.material.dispose();
      });
      ribbonGroup.children.forEach((child) => {
        child.geometry.dispose();
        child.material.dispose();
      });
      particles.geometry.dispose();
      particles.material.dispose();
    };
  }, []);

  return <div className="uks-ambient-scene" ref={mountRef} aria-hidden="true" />;
};

export default AmbientScene;
