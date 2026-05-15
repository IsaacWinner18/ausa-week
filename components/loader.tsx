"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  color: string;
};

type Galaxy = {
  x: number;
  y: number;
  size: number;
  rotation: number;
  speed: number;
};

type Planet = {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
};

type LoaderProps = {
  speedMultiplier?: number;
  className?: string;
};

export default function Loader({
  speedMultiplier = 1,
  className = "",
}: LoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const starsRef = useRef<Star[]>([]);
  const galaxiesRef = useRef<Galaxy[]>([]);
  const planetsRef = useRef<Planet[]>([]);
  const speedMultiplierRef = useRef(speedMultiplier);

  useEffect(() => {
    speedMultiplierRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const initScene = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      starsRef.current = [];
      galaxiesRef.current = [];
      planetsRef.current = [];

      const starCount = window.innerWidth < 768 ? 500 : 1000;
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width - canvas.width / 2,
          y: Math.random() * canvas.height - canvas.height / 2,
          z: Math.random() * canvas.width,
          size: 0.5 + Math.random(),
          speed: 5 + Math.random() * 10,
          color: `hsl(${Math.random() * 60 + 200}, 100%, ${70 + Math.random() * 30}%)`,
        });
      }

      const galaxyCount = window.innerWidth < 768 ? 2 : 3;
      for (let i = 0; i < galaxyCount; i++) {
        galaxiesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 80 + Math.random() * 120,
          rotation: Math.random() * Math.PI * 2,
          speed: 0.2 + Math.random() * 0.3,
        });
      }

      const planetCount = window.innerWidth < 768 ? 1 : 2;
      for (let i = 0; i < planetCount; i++) {
        planetsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 20 + Math.random() * 30,
          speed: 0.5 + Math.random(),
          color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        });
      }
    };

    const drawGalaxy = (galaxy: Galaxy) => {
      ctx.save();
      ctx.translate(galaxy.x, galaxy.y);
      ctx.rotate(galaxy.rotation);
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.size);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
      gradient.addColorStop(0.2, "rgba(100, 100, 255, 0.6)");
      gradient.addColorStop(0.4, "rgba(50, 50, 150, 0.4)");
      gradient.addColorStop(1, "rgba(0, 0, 50, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, galaxy.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawPlanet = (planet: Planet) => {
      ctx.fillStyle = planet.color;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.size + 3, 0, Math.PI * 2);
      ctx.stroke();
    };

    const animateSpace = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const currentSpeedMultiplier = speedMultiplierRef.current;

      galaxiesRef.current.forEach((galaxy) => {
        galaxy.rotation += 0.001 * currentSpeedMultiplier;
        drawGalaxy(galaxy);
      });

      planetsRef.current.forEach((planet) => {
        planet.x += planet.speed * currentSpeedMultiplier;
        if (planet.x > canvas.width + planet.size) {
          planet.x = -planet.size;
        }
        drawPlanet(planet);
      });

      starsRef.current.forEach((star) => {
        star.z -= star.speed * currentSpeedMultiplier;

        if (star.z <= 0) {
          star.z = canvas.width;
          star.x = Math.random() * canvas.width - centerX;
          star.y = Math.random() * canvas.height - centerY;
        }

        const factor = 200 / star.z;
        const x = star.x * factor + centerX;
        const y = star.y * factor + centerY;
        const size = star.size * factor;

        ctx.beginPath();
        ctx.fillStyle = star.color;
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        const tailLength =
          (window.innerWidth < 768 ? 20 : 40) *
          (1 - star.z / canvas.width) *
          currentSpeedMultiplier;

        ctx.beginPath();
        ctx.strokeStyle = star.color;
        ctx.lineWidth = size / 2;
        ctx.moveTo(x, y);
        ctx.lineTo(
          x - ((x - centerX) * tailLength) / 100,
          y - ((y - centerY) * tailLength) / 100,
        );
        ctx.stroke();
      });

      animationRef.current = requestAnimationFrame(animateSpace);
    };

    const handleResize = () => {
      initScene();
    };

    initScene();
    animateSpace();
    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className={`relative h-screen w-full overflow-hidden bg-black ${className}`}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
