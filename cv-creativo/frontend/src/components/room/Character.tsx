import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, type Group } from "three";
import { WAYPOINTS, type Waypoint } from "@/lib/room";
import { Box } from "./primitives";

interface Target {
  pos: Vector3;
  yaw: number | null; // null = face the walking direction
  sit: number;
  lie: number;
  walk: boolean;
}

const SKIN = "#F2C29B";
const HOODIE = "#22A35A";
const PANTS = "#7A4B2A";
const SHOE = "#16A34A";
const SOLE = "#F8FAFC";
const HAIR = "#4A2C1D";

const approach = (cur: number, target: number, step: number) =>
  cur < target ? Math.min(target, cur + step) : Math.max(target, cur - step);

function angleDiff(a: number, b: number) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export default function Character({ station }: { station: Waypoint }) {
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const legL = useRef<Group>(null);
  const legR = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const armR = useRef<Group>(null);
  const head = useRef<Group>(null);
  const st = useRef({
    pos: new Vector3(...station.pos),
    yaw: station.rotY,
    sit: station.sit,
    lie: station.lie,
    queue: [] as Target[],
    id: station.id,
    phase: 0,
    swing: 0,
  });

  // New station → stand up, walk over, settle into the new pose.
  useEffect(() => {
    const s = st.current;
    if (s.id === station.id) return;
    const from = WAYPOINTS.find((w) => w.id === s.id) ?? station;
    s.queue = [
      { pos: new Vector3(from.approach[0], 0, from.approach[1]), yaw: from.rotY, sit: 0, lie: 0, walk: false },
      { pos: new Vector3(station.approach[0], 0, station.approach[1]), yaw: null, sit: 0, lie: 0, walk: true },
      { pos: new Vector3(...station.pos), yaw: station.rotY, sit: station.sit, lie: station.lie, walk: false },
    ];
    s.id = station.id;
  }, [station]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    const s = st.current;
    const t = s.queue[0];
    let moving = false;
    if (t) {
      const d = t.pos.clone().sub(s.pos);
      const dist = d.length();
      if (dist > 0.001) {
        moving = true;
        const heading = Math.atan2(d.x, d.z);
        s.pos.addScaledVector(d.multiplyScalar(1 / dist), Math.min(dist, (t.walk ? 1.4 : 0.9) * dt));
        if (t.yaw === null) s.yaw += angleDiff(s.yaw, heading) * Math.min(1, dt * 8);
      } else {
        s.pos.copy(t.pos);
      }
      if (t.yaw !== null) s.yaw += angleDiff(s.yaw, t.yaw) * Math.min(1, dt * 5);
      s.sit = approach(s.sit, t.sit, dt * 1.6);
      s.lie = approach(s.lie, t.lie, dt * 1.2);
      const yawOk = t.yaw === null || Math.abs(angleDiff(s.yaw, t.yaw)) < 0.03;
      if (!moving && s.sit === t.sit && s.lie === t.lie && yawOk) s.queue.shift();
    }

    const walking = moving && !!t?.walk;
    s.swing += ((walking ? 1 : 0) - s.swing) * Math.min(1, dt * 6);
    if (walking) s.phase += dt * 9;
    const sw = Math.sin(s.phase) * 0.6 * s.swing;
    const time = state.clock.elapsedTime;
    const idle = !t;

    if (root.current) {
      root.current.position.set(s.pos.x, s.pos.y + Math.abs(Math.sin(s.phase)) * 0.05 * s.swing, s.pos.z);
      root.current.rotation.y = s.yaw;
    }
    if (body.current) body.current.rotation.x = -s.lie * (Math.PI / 2);
    const legBase = -s.sit * (Math.PI / 2);
    if (legL.current) legL.current.rotation.x = legBase + sw;
    if (legR.current) legR.current.rotation.x = legBase - sw;

    const typing = idle && s.id === "chair";
    const reading = idle && s.id === "shelf";
    const playing = idle && s.id === "ball";
    let armBaseL = 0;
    let armBaseR = 0;
    if (typing) {
      armBaseL = -1.2 + Math.sin(time * 16) * 0.07;
      armBaseR = -1.2 + Math.cos(time * 14) * 0.07;
    } else if (reading) {
      armBaseL = armBaseR = -1.0;
    } else if (playing) {
      armBaseL = -0.3 + Math.sin(time * 3) * 0.5;
      armBaseR = -0.3 - Math.sin(time * 3) * 0.5;
    }
    if (armL.current) armL.current.rotation.x = armBaseL - sw;
    if (armR.current) armR.current.rotation.x = armBaseR + sw;
    if (head.current) {
      head.current.rotation.y = idle && !typing ? Math.sin(time * 0.6) * 0.35 : 0;
      head.current.rotation.x = reading || typing ? 0.25 : 0;
    }
  });

  return (
    <group ref={root}>
      <group ref={body}>
        {/* legs */}
        <group ref={legL} position={[-0.13, 0.6, 0]}>
          <Box size={[0.2, 0.55, 0.22]} position={[0, -0.27, 0]} color={PANTS} />
          <Box size={[0.24, 0.05, 0.32]} position={[0, -0.58, 0.04]} color={SOLE} />
          <Box size={[0.22, 0.07, 0.29]} position={[0, -0.52, 0.04]} color={SHOE} />
          <Box size={[0.225, 0.02, 0.12]} position={[0, -0.5, 0.06]} color={SOLE} />
        </group>
        <group ref={legR} position={[0.13, 0.6, 0]}>
          <Box size={[0.2, 0.55, 0.22]} position={[0, -0.27, 0]} color={PANTS} />
          <Box size={[0.24, 0.05, 0.32]} position={[0, -0.58, 0.04]} color={SOLE} />
          <Box size={[0.22, 0.07, 0.29]} position={[0, -0.52, 0.04]} color={SHOE} />
          <Box size={[0.225, 0.02, 0.12]} position={[0, -0.5, 0.06]} color={SOLE} />
        </group>
        {/* torso */}
        <Box size={[0.52, 0.62, 0.3]} position={[0, 0.9, 0]} color={HOODIE} />
        <Box size={[0.3, 0.12, 0.02]} position={[0, 0.8, 0.16]} color="#86EFAC" />
        {/* arms */}
        <group ref={armL} position={[-0.34, 1.15, 0]}>
          <Box size={[0.15, 0.5, 0.17]} position={[0, -0.24, 0]} color={HOODIE} />
          <Box size={[0.13, 0.1, 0.14]} position={[0, -0.53, 0]} color={SKIN} />
        </group>
        <group ref={armR} position={[0.34, 1.15, 0]}>
          <Box size={[0.15, 0.5, 0.17]} position={[0, -0.24, 0]} color={HOODIE} />
          <Box size={[0.13, 0.1, 0.14]} position={[0, -0.53, 0]} color={SKIN} />
        </group>
        {/* head */}
        <group ref={head} position={[0, 1.21, 0]}>
          <Box size={[0.46, 0.44, 0.42]} position={[0, 0.25, 0]} color={SKIN} />
          <Box size={[0.5, 0.14, 0.46]} position={[0, 0.5, -0.01]} color={HAIR} />
          <Box size={[0.5, 0.3, 0.1]} position={[0, 0.34, -0.2]} color={HAIR} />
          <Box size={[0.06, 0.08, 0.02]} position={[-0.1, 0.28, 0.215]} color="#111827" />
          <Box size={[0.06, 0.08, 0.02]} position={[0.1, 0.28, 0.215]} color="#111827" />
          <Box size={[0.08, 0.04, 0.02]} position={[-0.16, 0.18, 0.212]} color="#FDA4AF" />
          <Box size={[0.08, 0.04, 0.02]} position={[0.16, 0.18, 0.212]} color="#FDA4AF" />
        </group>
      </group>
    </group>
  );
}
