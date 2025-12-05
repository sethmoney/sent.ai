import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Badge,
  Alert,
  AlertTitle,
  AlertDescription,
  Separator
} from './components/ui';
import {
  Shield,
  AlertTriangle,
  Radio,
  Battery,
  Navigation,
  Gauge,
  Target,
  Zap,
  Lock,
  Unlock,
  Activity,
  Satellite,
  Power,
  Map,
  Maximize2,
  Play,
  Pause,
  Crosshair,
  Compass,
  ZoomIn,
  ZoomOut,
  LayoutDashboard,
  Terminal,
  Signal,
  Wind,
  Wifi,
  Video,
  Eye,
  Cross,
  Search
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const FLIGHT_MODES = ['GUIDED', 'STABILIZE', 'LOITER', 'RTL', 'LAND'];

// --- Interception Visualizer Component ---
const VisualizerView = ({ setCurrentView }: { setCurrentView: (view: 'dashboard' | 'map' | 'visualizer') => void }) => {
  // Simulation State
  const [distance, setDistance] = useState(400); // meters
  const [azimuth, setAzimuth] = useState(45); // degrees
  const [elevation, setElevation] = useState(20); // degrees relative to horizon
  const [closingSpeed, setClosingSpeed] = useState(15); // m/s
  const [status, setStatus] = useState('SEARCHING'); // SEARCHING, TRACKING, LOCKING, INTERCEPTING
  const [history, setHistory] = useState<{d: number, a: number}[]>([]);
  
  // Visual config
  const radarRadius = 140;
  const maxRange = 500; // max display range in meters

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setDistance(prev => {
        const newDist = prev - (closingSpeed / 10); // Simple time step
        
        // State Machine based on distance
        if (newDist > 350) setStatus('SEARCHING');
        else if (newDist > 200) setStatus('TRACKING');
        else if (newDist > 100) setStatus('LOCKING');
        else if (newDist > 10) setStatus('INTERCEPTING');
        else return 400; // Reset simulation loop
        
        return newDist;
      });

      // Simulate relative movement (Target trying to evade or spiral)
      setAzimuth(prev => (prev + 0.5) % 360);
      setElevation(prev => prev + (Math.sin(Date.now() / 1000) * 0.5));
      setClosingSpeed(prev => Math.min(45, Math.max(10, prev + (Math.random() - 0.5))));

      // Add to trail history
      setHistory(prev => {
        const newPoint = { d: distance, a: azimuth };
        const newHistory = [...prev, newPoint];
        if (newHistory.length > 20) newHistory.shift();
        return newHistory;
      });

    }, 100);

    return () => clearInterval(interval);
  }, [distance, azimuth, closingSpeed]);

  // Helper to convert Polar to Cartesian for SVG
  const polarToCartesian = (dist: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    const scale = radarRadius / maxRange;
    return {
      x: radarRadius + (dist * scale * Math.cos(angleInRadians)),
      y: radarRadius + (dist * scale * Math.sin(angleInRadians))
    };
  };

  const targetPos = polarToCartesian(distance, azimuth);

  // Calculate dynamic colors based on threat level
  const getStatusColor = () => {
    switch (status) {
      case 'SEARCHING': return 'text-slate-400 border-slate-400';
      case 'TRACKING': return 'text-yellow-400 border-yellow-400';
      case 'LOCKING': return 'text-orange-500 border-orange-500';
      case 'INTERCEPTING': return 'text-red-500 border-red-500';
      default: return 'text-cyan-500 border-cyan-500';
    }
  };

  const getStatusHex = () => {
    switch (status) {
      case 'SEARCHING': return '#94a3b8';
      case 'TRACKING': return '#facc15';
      case 'LOCKING': return '#f97316';
      case 'INTERCEPTING': return '#ef4444';
      default: return '#06b6d4';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-mono">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-500 flex items-center gap-2">
            <Crosshair className="animate-spin" style={{ animationDuration: '3s' }} /> 
            TACTICAL INTERCEPT VISUALIZER
          </h1>
          <p className="text-xs text-slate-500 mt-1">REAL-TIME THREAT ASSESSMENT & VECTORING</p>
        </div>
        <div className="flex items-center gap-4">
            <div className={`px-4 py-2 border rounded ${getStatusColor()} animate-pulse font-bold`}>
            STATUS: {status}
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentView('dashboard')}>
                    <LayoutDashboard className="w-4 h-4 mr-2" /> DASHBOARD
                </Button>
                 <Button variant="outline" size="sm" onClick={() => setCurrentView('map')}>
                    <Map className="w-4 h-4 mr-2" /> MAP
                </Button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT PANEL: MAIN RADAR */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-4 relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-4 left-4 text-xs text-cyan-500">
            RADAR: ACTIVE<br/>
            RANGE: {maxRange}m
          </div>

          <div className="flex justify-center items-center h-[500px] w-full">
            <svg width="400" height="400" className="overflow-visible">
              {/* Radar Grid */}
              <circle cx={radarRadius} cy={radarRadius} r={radarRadius} fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
              <circle cx={radarRadius} cy={radarRadius} r={radarRadius * 0.75} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx={radarRadius} cy={radarRadius} r={radarRadius * 0.5} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx={radarRadius} cy={radarRadius} r={radarRadius * 0.25} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
              
              {/* Crosshairs */}
              <line x1={radarRadius} y1="0" x2={radarRadius} y2={radarRadius*2} stroke="#1e293b" strokeWidth="1" />
              <line x1="0" y1={radarRadius} x2={radarRadius*2} y2={radarRadius} stroke="#1e293b" strokeWidth="1" />

              {/* Sweeping Radar Line */}
              <line 
                x1={radarRadius} y1={radarRadius} 
                x2={radarRadius} y2="0" 
                stroke="rgba(6, 182, 212, 0.5)" 
                strokeWidth="2"
                className="origin-center animate-[spin_4s_linear_infinite]"
              />

              {/* Target Trail */}
              {history.map((h, i) => {
                const pos = polarToCartesian(h.d, h.a);
                return (
                  <circle 
                    key={i} 
                    cx={pos.x} 
                    cy={pos.y} 
                    r="2" 
                    fill={getStatusHex()} 
                    opacity={i / history.length * 0.5} 
                  />
                );
              })}

              {/* Connection Line (Vector) */}
              <line 
                x1={radarRadius} 
                y1={radarRadius} 
                x2={targetPos.x} 
                y2={targetPos.y} 
                stroke={getStatusHex()} 
                strokeWidth="1" 
                strokeDasharray="2 2"
                opacity="0.6"
              />

              {/* The Target */}
              <g transform={`translate(${targetPos.x}, ${targetPos.y})`}>
                <circle r="6" fill={getStatusHex()} className="animate-pulse" />
                <circle r="12" fill="none" stroke={getStatusHex()} opacity="0.5" className="animate-ping" />
                <text x="15" y="-15" fill={getStatusHex()} fontSize="10" fontFamily="monospace">
                  TGT-01
                </text>
                <text x="15" y="-5" fill="white" fontSize="10" fontFamily="monospace">
                  {distance.toFixed(0)}m
                </text>
              </g>

              {/* The Interceptor (Self) */}
              <g transform={`translate(${radarRadius}, ${radarRadius})`}>
                <polygon points="0,-10 -8,8 8,8" fill="#3b82f6" />
                <circle r="4" fill="#60a5fa" className="animate-pulse" />
              </g>

            </svg>
          </div>

          {/* Radar Overlay Info */}
          <div className="absolute bottom-4 right-4 text-right">
             <div className="text-2xl font-bold text-slate-100">{azimuth.toFixed(1)}°</div>
             <div className="text-xs text-slate-500">REL BEARING</div>
          </div>
        </div>

        {/* RIGHT PANEL: TELEMETRY & VERTICAL PROFILE */}
        <div className="space-y-6">
          
          {/* HUD Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Target className="w-3 h-3" /> DISTANCE
              </div>
              <div className={`text-2xl font-bold ${distance < 100 ? 'text-red-500' : 'text-slate-100'}`}>
                {distance.toFixed(1)} <span className="text-sm text-slate-500">m</span>
              </div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Wind className="w-3 h-3" /> CLOSING V
              </div>
              <div className="text-2xl font-bold text-slate-100">
                {closingSpeed.toFixed(1)} <span className="text-sm text-slate-500">m/s</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Navigation className="w-3 h-3" /> ELEVATION
              </div>
              <div className="text-2xl font-bold text-slate-100">
                {elevation.toFixed(1)}°
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Zap className="w-3 h-3" /> SIGNAL
              </div>
              <div className="text-2xl font-bold text-green-500">
                98 <span className="text-sm text-slate-500">%</span>
              </div>
            </div>
          </div>

          {/* Vertical Profile (Side View) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-64 relative overflow-hidden">
            <div className="absolute top-2 left-4 text-xs text-slate-500">VERTICAL PROFILE</div>
            
            <svg width="100%" height="100%" viewBox="0 0 300 150" className="mt-4">
              {/* Grid Lines */}
              <line x1="0" y1="140" x2="300" y2="140" stroke="#334155" strokeWidth="2" /> {/* Ground */}
              <line x1="0" y1="75" x2="300" y2="75" stroke="#1e293b" strokeDasharray="4 4" />
              
              {/* Interceptor (Fixed on left) */}
              <g transform="translate(30, 80)">
                 <polygon points="-5,0 5,0 0,-15" fill="#3b82f6" />
                 <text x="-15" y="20" fill="#3b82f6" fontSize="10">HOME</text>
                 {/* Projection Line */}
                 <line x1="0" y1="0" x2="200" y2="-40" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" opacity="0.3" />
              </g>

              {/* Target (Moves based on distance and elevation) */}
              {/* Mapping: X moves left as distance decreases. Y moves based on elevation angle */}
              <g transform={`translate(${30 + (distance * 0.5)}, ${80 - (elevation * 2)})`}>
                 <polygon points="-5,-5 5,-5 0,5" fill={getStatusHex()} />
                 <text x="-10" y="-10" fill={getStatusHex()} fontSize="10">TGT</text>
              </g>

              {/* Connecting Vector */}
              <line 
                x1="30" y1="80" 
                x2={30 + (distance * 0.5)} y2={80 - (elevation * 2)} 
                stroke={getStatusHex()} 
                strokeWidth="1" 
                opacity="0.5"
              />
            </svg>
            
            <div className="absolute bottom-2 right-4 text-xs text-slate-600">
              SCALE: 1:100
            </div>
          </div>

          {/* Action Logs */}
          <div className="bg-black/40 rounded p-4 font-mono text-xs space-y-2 h-40 overflow-hidden border border-slate-800/50">
             <div className="text-slate-500 mb-2 border-b border-slate-800 pb-1">SYSTEM LOGS</div>
             <div className="text-green-500">[{new Date().toLocaleTimeString()}] OPTICAL SENSORS ACTIVE</div>
             <div className="text-cyan-500">[{new Date().toLocaleTimeString()}] RADAR SWEEP... ACQUIRED</div>
             {status === 'LOCKING' && <div className="text-orange-500 animate-pulse">[{new Date().toLocaleTimeString()}] TARGET LOCK ACQUIRED</div>}
             {status === 'INTERCEPTING' && <div className="text-red-500 font-bold">[{new Date().toLocaleTimeString()}] INTERCEPT VECTOR CALCULATED</div>}
          </div>

        </div>
      </div>
    </div>
  );
};

// --- Drone HUD Component ---
const DroneHUD = ({ 
  targetDistance, 
  lockStatus, 
  relativeBearing, 
  altitude, 
  speed,
  pitch
}: {
  targetDistance: number;
  lockStatus: string;
  relativeBearing: number;
  altitude: number;
  speed: number;
  pitch: number;
}) => {
  // Determine target visibility in FOV (Field of View assumed ~60 degrees)
  const isVisible = Math.abs(relativeBearing) < 40;
  // Map relative bearing (-30 to 30) to screen position (0 to 100%)
  // 50% is center. 
  const targetX = 50 + (relativeBearing / 40) * 50; 
  // Map pitch to Y position somewhat
  const targetY = 50 + (pitch / 20) * 10;
  
  // Size inversely proportional to distance
  const targetSize = Math.max(10, Math.min(120, 1500 / Math.max(1, targetDistance)));
  
  const getStatusColor = () => {
    switch(lockStatus) {
      case 'LOCKED': return 'text-red-500 border-red-500 stroke-red-500';
      case 'ACQUIRING': return 'text-yellow-400 border-yellow-400 stroke-yellow-400';
      case 'INTERCEPTED': return 'text-red-600 border-red-600 stroke-red-600';
      default: return 'text-green-500 border-green-500 stroke-green-500';
    }
  };
  
  const colorClass = getStatusColor();
  const strokeColor = lockStatus === 'LOCKED' || lockStatus === 'INTERCEPTED' ? '#ef4444' : (lockStatus === 'ACQUIRING' ? '#facc15' : '#22c55e');

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden rounded-lg border border-slate-700 shadow-2xl">
      {/* Background / Horizon Artificial Horizon */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 opacity-50"></div>
      
      {/* Digital Grid Overlay */}
      <div className="absolute inset-0 opacity-10" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)', 
             backgroundSize: '40px 40px',
             perspective: '500px'
           }}>
      </div>

      {/* Target Box */}
      {isVisible && targetDistance > 0 && lockStatus !== 'INTERCEPTED' && (
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75 ease-linear"
          style={{ 
            left: `${Math.min(95, Math.max(5, targetX))}%`, 
            top: `${targetY}%`,
            width: `${targetSize}px`,
            height: `${targetSize}px`
          }}
        >
          {/* Target Reticle SVG */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]">
            <path d="M0,0 L25,0 M0,0 L0,25 M100,0 L75,0 M100,0 L100,25 M0,100 L0,75 M0,100 L25,100 M100,100 L75,100 M100,100 L100,75" 
                  fill="none" stroke={strokeColor} strokeWidth="4" />
             {(lockStatus === 'LOCKED' || lockStatus === 'ACQUIRING') && (
               <>
                 <line x1="50" y1="0" x2="50" y2="20" stroke={strokeColor} strokeWidth="2" />
                 <line x1="50" y1="100" x2="50" y2="80" stroke={strokeColor} strokeWidth="2" />
                 <line x1="0" y1="50" x2="20" y2="50" stroke={strokeColor} strokeWidth="2" />
                 <line x1="100" y1="50" x2="80" y2="50" stroke={strokeColor} strokeWidth="2" />
                 {lockStatus === 'LOCKED' && <circle cx="50" cy="50" r="5" fill={strokeColor} className="animate-ping" />}
               </>
             )}
          </svg>
          
          {/* Target Data Label */}
          <div className={`absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono font-bold bg-black/50 px-1 rounded ${colorClass.split(' ')[0]}`}>
             TGT-{(targetDistance).toFixed(0)}m
          </div>
        </div>
      )}

      {/* Interception Explosion Effect */}
      {lockStatus === 'INTERCEPTED' && (
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-red-500 rounded-full animate-ping opacity-50"></div>
            <div className="absolute text-red-500 font-bold text-2xl animate-pulse bg-black/50 px-4 py-2 rounded border border-red-500">
               NEUTRALIZED
            </div>
         </div>
      )}

      {/* Center Fixed Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg width="60" height="60" viewBox="0 0 60 60">
           <circle cx="30" cy="30" r="2" fill="rgba(6,182,212,0.8)" />
           <line x1="0" y1="30" x2="20" y2="30" stroke="rgba(6,182,212,0.5)" strokeWidth="1" />
           <line x1="40" y1="30" x2="60" y2="30" stroke="rgba(6,182,212,0.5)" strokeWidth="1" />
           <line x1="30" y1="0" x2="30" y2="20" stroke="rgba(6,182,212,0.5)" strokeWidth="1" />
           <line x1="30" y1="40" x2="30" y2="60" stroke="rgba(6,182,212,0.5)" strokeWidth="1" />
        </svg>
      </div>

      {/* HUD Telemetry Overlay */}
      <div className="absolute top-2 left-2 text-[10px] font-mono text-green-400 space-y-0.5 bg-black/20 p-1 rounded backdrop-blur-[1px]">
         <div className={`font-bold ${colorClass.split(' ')[0]}`}>STS: {lockStatus}</div>
         <div>ALT: {altitude.toFixed(0)}m</div>
         <div>SPD: {speed.toFixed(1)}m/s</div>
         <div>HDG: 045°</div>
      </div>
      
       <div className="absolute top-2 right-2 text-[10px] font-mono text-green-400 bg-black/20 p-1 rounded backdrop-blur-[1px]">
         <div className="flex items-center gap-1"><Video className="w-3 h-3" /> CAM-1 [LIVE]</div>
         <div className="text-right text-xs mt-1">{new Date().toLocaleTimeString()}</div>
      </div>
      
      {/* Bottom Scale */}
      <div className="absolute bottom-4 left-10 right-10 h-4 border-t border-slate-500/30 flex justify-between px-2">
         {[...Array(9)].map((_, i) => (
            <div key={i} className="h-2 w-0.5 bg-slate-500/50 relative">
               {i === 4 && <div className="absolute -top-3 -left-1 text-[8px] text-cyan-400">0</div>}
            </div>
         ))}
      </div>
    </div>
  )
}

function AntiDroneTestBed() {
  // View state
  const [currentView, setCurrentView] = useState<'dashboard' | 'map' | 'visualizer'>('dashboard');
  const [mapView, setMapView] = useState<'2d' | '3d'>('2d');
  const [trackingMode, setTrackingMode] = useState<'interceptor' | 'target' | 'both'>('both');
  const [simulationPaused, setSimulationPaused] = useState(false);
  const [mapZoom, setMapZoom] = useState(1);
  
  // State management
  const [flightMode, setFlightMode] = useState('GUIDED');
  const [altitude, setAltitude] = useState(50);
  const [targetDistance, setTargetDistance] = useState(250);
  const [closingVelocity, setClosingVelocity] = useState(15);
  const [batteryVoltage, setBatteryVoltage] = useState(22.4);
  const [batteryPercent, setBatteryPercent] = useState(85);
  const [satellites, setSatellites] = useState(12);
  const [isArmed, setIsArmed] = useState(true);
  const [systemOnline, setSystemOnline] = useState(true);
  const [motors, setMotors] = useState([75, 78, 72, 76]);
  const [encryptionActive, setEncryptionActive] = useState(true);
  const [authenticated, setAuthenticated] = useState(true);
  const [messageIntegrity, setMessageIntegrity] = useState(100);
  const [networkLatency, setNetworkLatency] = useState(12);
  const [dataRate, setDataRate] = useState(98.5);
  const [linkQuality, setLinkQuality] = useState(95);

  const [gpsLat, setGpsLat] = useState(34.0522);
  const [gpsLon, setGpsLon] = useState(-118.2437);
  
  // Historical data for charts
  const [signalHistory, setSignalHistory] = useState<{time: string, value: number}[]>([]);
  
  // Map-specific state
  const [interceptorPos, setInterceptorPos] = useState({ x: 200, y: 400 });
  const [targetPos, setTargetPos] = useState({ x: 600, y: 200 });
  const [interceptorHeading, setInterceptorHeading] = useState(45);
  const [targetHeading, setTargetHeading] = useState(225);
  const [interceptorTrail, setInterceptorTrail] = useState<{x: number, y: number}[]>([]);
  const [targetTrail, setTargetTrail] = useState<{x: number, y: number}[]>([]);
  const [timeToIntercept, setTimeToIntercept] = useState(16.7);
  const [altitudeDiff, setAltitudeDiff] = useState(15);
  
  // Advanced Simulation State
  const [lockStatus, setLockStatus] = useState<'SEARCHING' | 'ACQUIRING' | 'LOCKED' | 'INTERCEPTED'>('SEARCHING');
  const [relativeBearing, setRelativeBearing] = useState(0);
  const [sensorSweepAngle, setSensorSweepAngle] = useState(0);

  const [logs, setLogs] = useState([
    { time: '14:32:15', event: 'System initialized', type: 'info' },
    { time: '14:32:18', event: 'GPS lock acquired (12 satellites)', type: 'success' },
    { time: '14:32:22', event: 'Telemetry link established', type: 'success' },
    { time: '14:32:25', event: 'Interceptor armed and ready', type: 'success' },
  ]);

  // Simulate real-time data updates
  useEffect(() => {
    if (simulationPaused) return;
    
    const interval = setInterval(() => {
      // Basic telemetry jitter
      setAltitude(prev => Math.max(0, Math.min(500, prev + (Math.random() - 0.5) * 5)));
      setBatteryVoltage(prev => Math.max(18, prev - Math.random() * 0.01));
      setBatteryPercent(prev => Math.max(0, prev - Math.random() * 0.05));
      setSatellites(prev => Math.max(8, Math.min(15, prev + Math.floor(Math.random() * 3 - 1))));
      setMotors([
        75 + Math.random() * 10,
        78 + Math.random() * 10,
        72 + Math.random() * 10,
        76 + Math.random() * 10
      ]);
      
      setNetworkLatency(prev => Math.max(5, Math.min(50, prev + (Math.random() - 0.5) * 3)));
      setDataRate(prev => Math.max(90, Math.min(100, prev + (Math.random() - 0.5) * 1)));
      setLinkQuality(prev => Math.max(80, Math.min(100, prev + (Math.random() - 0.5) * 2)));
      
      setGpsLat(prev => prev + (Math.random() - 0.5) * 0.00001);
      setGpsLon(prev => prev + (Math.random() - 0.5) * 0.00001);

      // Radar Sweep
      setSensorSweepAngle(prev => (prev + 10) % 360);

      // Update Signal History Chart
      setSignalHistory(prev => {
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        const newValue = 90 + Math.random() * 10; // Mock signal strength
        const newHistory = [...prev, { time: timeStr, value: newValue }];
        return newHistory.slice(-20); // Keep last 20 points
      });

      // --- Drone Physics & Logic ---

      let newInterceptorPos = { ...interceptorPos };
      let newTargetPos = { ...targetPos };
      let status = lockStatus;

      // 1. Move Target (Pattern)
      const time = Date.now() / 1000;
      if (status !== 'INTERCEPTED') {
          newTargetPos = {
            x: 600 + Math.cos(time * 0.2) * 150,
            y: 350 + Math.sin(time * 0.3) * 100
          };
      }
      setTargetPos(newTargetPos);
      setTargetTrail(prev => [...prev, newTargetPos].slice(-50));
      setTargetHeading(prev => (prev + 2) % 360);

      // 2. Calculate Geometry
      const dx = newTargetPos.x - newInterceptorPos.x;
      const dy = newTargetPos.y - newInterceptorPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      setTargetDistance(dist);

      // 3. Move Interceptor
      if (status !== 'INTERCEPTED') {
          // Determine speed based on mode
          let speed = 4; // Cruising
          if (dist < 150) speed = 6; // Chase
          if (dist < 50) speed = 8; // Terminal

          // Move towards target
          if (dist > 10) {
            newInterceptorPos = {
                x: newInterceptorPos.x + (dx / dist) * speed,
                y: newInterceptorPos.y + (dy / dist) * speed
            };
          }
          
          setClosingVelocity(speed * 3); // Scale for display
      } else {
         setClosingVelocity(0);
      }

      setInterceptorPos(newInterceptorPos);
      setInterceptorTrail(prev => [...prev, newInterceptorPos].slice(-50));

      // 4. Calculate Heading & Relative Bearing for HUD
      const angleToTargetRad = Math.atan2(dy, dx);
      const angleToTargetDeg = angleToTargetRad * (180 / Math.PI); // -180 to 180
      
      // Smooth heading update
      setInterceptorHeading(angleToTargetDeg); 

      // Relative bearing is always 0 if we are perfectly tracking, 
      // but lets add some noise/lag to simulate camera movement
      const noise = status === 'LOCKED' ? 0 : Math.sin(time * 2) * 10;
      setRelativeBearing(noise);

      // 5. Update Lock Status
      if (dist < 10) {
         if (status !== 'INTERCEPTED') {
             status = 'INTERCEPTED';
             addLog("TARGET INTERCEPTED SUCCESSFULLY", "success");
         }
      } else if (dist < 80) {
         status = 'LOCKED';
         if (lockStatus !== 'LOCKED') addLog("Target Lock Acquired", "warning");
      } else if (dist < 250) {
         status = 'ACQUIRING';
      } else {
         status = 'SEARCHING';
      }
      setLockStatus(status);
      
      // Calculate time to intercept
      setTimeToIntercept(dist / (closingVelocity || 1));
      setAltitudeDiff(Math.abs(Math.random() * 30 - 15));

      // Reset Simulation Loop for Demo
      if (status === 'INTERCEPTED' && Math.random() > 0.95) {
         // Respawn logic
         setInterceptorPos({ x: 100, y: 100 });
         setTargetPos({ x: 800, y: 600 });
         setLockStatus('SEARCHING');
         setInterceptorTrail([]);
         setTargetTrail([]);
         addLog("Simulation Reset - New Target Detected", "info");
      }

    }, 1000 / 30); // 30 FPS

    return () => clearInterval(interval);
  }, [simulationPaused, interceptorPos, targetPos, closingVelocity, interceptorTrail, targetTrail, lockStatus]);

  const addLog = (event: string, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ time, event, type }, ...prev.slice(0, 9)]);
  };

  const handleEmergencyStop = () => {
    if (window.confirm('⚠️ EMERGENCY STOP - This will immediately halt all operations. Continue?')) {
      setIsArmed(false);
      setFlightMode('LAND');
      setSimulationPaused(true);
      addLog('EMERGENCY STOP ACTIVATED', 'warning');
    }
  };

  const handleModeChange = (mode: string) => {
    setFlightMode(mode);
    addLog(`Flight mode changed to ${mode}`, 'info');
  };

  const handleArmToggle = (armed: boolean) => {
    if (armed && !window.confirm('⚠️ ARM SYSTEM - Are you sure you want to arm the system?')) {
      return;
    }
    setIsArmed(armed);
    addLog(armed ? 'System ARMED' : 'System DISARMED', armed ? 'warning' : 'info');
  };

  // Map View Component
  const MapView = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const mapWidth = 1000;
    const mapHeight = 700;
    
    // Calculate sensor cone points
    const coneLength = 300;
    const fov = 40 * (Math.PI / 180); // 40 degrees FOV in radians
    const headingRad = interceptorHeading * (Math.PI / 180);
    
    const coneLeftX = interceptorPos.x + Math.cos(headingRad - fov/2) * coneLength;
    const coneLeftY = interceptorPos.y + Math.sin(headingRad - fov/2) * coneLength;
    const coneRightX = interceptorPos.x + Math.cos(headingRad + fov/2) * coneLength;
    const coneRightY = interceptorPos.y + Math.sin(headingRad + fov/2) * coneLength;

    return (
      <div className="fixed inset-0 bg-slate-950 z-50 overflow-hidden flex flex-col">
        {/* Map Header */}
        <div className="bg-slate-900 border-b border-cyan-900 p-3 z-10 shadow-lg flex justify-between items-center px-6">
          <div className="flex items-center gap-4">
            <Map className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="text-xl font-bold text-cyan-400 tracking-tight leading-none">TACTICAL MAP</h2>
              <div className="flex items-center gap-2">
                 <p className="text-[10px] text-slate-400 font-mono">LIVE FEED // SECTOR 7G</p>
                 {lockStatus === 'LOCKED' && <Badge variant="destructive" className="text-[10px] h-4">ENGAGING</Badge>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setCurrentView('dashboard')}
              variant="outline"
              size="sm"
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-cyan-400"
            >
              <LayoutDashboard className="w-3 h-3 mr-2" />
              DASHBOARD
            </Button>
             <Button
              onClick={() => setCurrentView('visualizer')}
              variant="outline"
              size="sm"
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-cyan-400"
            >
              <Crosshair className="w-3 h-3 mr-2" />
              INTERCEPT VIZ
            </Button>
            <div className={`w-3 h-3 rounded-full ${systemOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'} ring-4 ring-slate-900/50`}></div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative bg-[#050b14] overflow-hidden">
          
          {/* Map Controls (Floating Left) */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-3 w-40 shadow-xl space-y-2">
              <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">View Mode</div>
              <Button
                onClick={() => setTrackingMode('interceptor')}
                variant="outline"
                size="sm"
                className={`w-full justify-start h-7 text-xs ${trackingMode === 'interceptor' ? 'bg-cyan-900/50 border-cyan-700 text-cyan-100' : 'border-slate-700'}`}
              >
                <Crosshair className="w-3 h-3 mr-2" /> Interceptor
              </Button>
              <Button
                onClick={() => setTrackingMode('target')}
                variant="outline"
                size="sm"
                className={`w-full justify-start h-7 text-xs ${trackingMode === 'target' ? 'bg-red-900/50 border-red-700 text-red-100' : 'border-slate-700'}`}
              >
                <Target className="w-3 h-3 mr-2" /> Target
              </Button>
              
              <div className="flex gap-1 mt-2">
                 <Button size="sm" variant="outline" className="flex-1 h-7 bg-slate-800 border-slate-700" onClick={() => setMapZoom(z => Math.max(0.5, z - 0.2))}>
                    <ZoomOut className="w-3 h-3" />
                 </Button>
                 <Button size="sm" variant="outline" className="flex-1 h-7 bg-slate-800 border-slate-700" onClick={() => setMapZoom(z => Math.min(3, z + 0.2))}>
                    <ZoomIn className="w-3 h-3" />
                 </Button>
              </div>
            </div>
          </div>

          {/* DRONE HUD Overlay (Bottom Right Picture-in-Picture) */}
          <div className="absolute bottom-4 right-4 z-20 w-80 h-56 shadow-2xl border-2 border-slate-800 rounded-lg overflow-hidden bg-black transition-all hover:scale-105 hover:border-cyan-500/50">
             <DroneHUD 
                targetDistance={targetDistance}
                lockStatus={lockStatus}
                relativeBearing={relativeBearing}
                altitude={altitude}
                speed={closingVelocity}
                pitch={0}
             />
          </div>

          {/* Telemetry Bar (Top Center) */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur px-6 py-2 rounded-full border border-slate-800 flex items-center gap-8 z-10 shadow-lg">
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400">RANGE</span>
                <span className="font-mono font-bold text-lg text-white">{(targetDistance).toFixed(0)}<span className="text-xs text-slate-500 ml-0.5">m</span></span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400">T-INT</span>
                <span className={`font-mono font-bold text-lg ${timeToIntercept < 5 ? 'text-red-500 animate-pulse' : 'text-orange-400'}`}>
                   {timeToIntercept.toFixed(1)}<span className="text-xs text-slate-500 ml-0.5">s</span>
                </span>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400">STATUS</span>
                <span className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${
                   lockStatus === 'LOCKED' ? 'bg-red-900/50 text-red-200 border border-red-800' : 
                   lockStatus === 'ACQUIRING' ? 'bg-yellow-900/50 text-yellow-200 border border-yellow-800' :
                   lockStatus === 'INTERCEPTED' ? 'bg-white text-black animate-pulse' : 
                   'bg-cyan-900/30 text-cyan-200'
                }`}>
                   {lockStatus}
                </span>
             </div>
          </div>

          {/* Compass */}
          <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-800 rounded-full p-2 z-10 shadow-lg w-16 h-16 flex items-center justify-center">
            <div className="relative w-full h-full">
               <Compass className="w-full h-full text-slate-600" />
               <div className="absolute inset-0 flex items-center justify-center transform transition-transform duration-300" style={{ transform: `rotate(${-interceptorHeading}deg)`}}>
                  <div className="w-0.5 h-6 bg-cyan-500 absolute top-1 rounded-full shadow-[0_0_5px_cyan]"></div>
               </div>
            </div>
          </div>

          {/* SVG Map Layer */}
          <div className="w-full h-full flex items-center justify-center">
            <svg
              ref={svgRef}
              width={mapWidth}
              height={mapHeight}
              viewBox={`0 0 ${mapWidth} ${mapHeight}`}
              className="w-full h-full"
              style={{ transform: `scale(${mapZoom})`, transition: 'transform 0.3s ease-out' }}
            >
              {/* Background Grids */}
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(6, 182, 212, 0.05)" strokeWidth="1"/>
                </pattern>
                <pattern id="grid-major" width="200" height="200" patternUnits="userSpaceOnUse">
                  <path d="M 200 0 L 0 0 0 200" fill="none" stroke="rgba(6, 182, 212, 0.1)" strokeWidth="1"/>
                </pattern>
                <radialGradient id="radar-sweep" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0%" stopColor="rgba(6,182,212,0.1)" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="rgba(6, 182, 212, 0.5)" />
                </marker>
              </defs>

              <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />
              <rect width={mapWidth} height={mapHeight} fill="url(#grid-major)" />

              {/* Sensor Sweep Animation around Interceptor */}
              <circle cx={interceptorPos.x} cy={interceptorPos.y} r="250" fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="1" strokeDasharray="4,4" />
              <path 
                d={`M ${interceptorPos.x} ${interceptorPos.y} L ${interceptorPos.x + 250 * Math.cos(sensorSweepAngle * Math.PI/180)} ${interceptorPos.y + 250 * Math.sin(sensorSweepAngle * Math.PI/180)} A 250 250 0 0 1 ${interceptorPos.x + 250 * Math.cos((sensorSweepAngle+30) * Math.PI/180)} ${interceptorPos.y + 250 * Math.sin((sensorSweepAngle+30) * Math.PI/180)} Z`}
                fill="url(#radar-sweep)"
                opacity="0.5"
              />

              {/* Sensor FOV Cone (Visual Field) */}
              <path 
                 d={`M ${interceptorPos.x} ${interceptorPos.y} L ${coneLeftX} ${coneLeftY} A ${coneLength} ${coneLength} 0 0 1 ${coneRightX} ${coneRightY} Z`}
                 fill={lockStatus === 'LOCKED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(6, 182, 212, 0.05)'}
                 stroke={lockStatus === 'LOCKED' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(6, 182, 212, 0.2)'}
                 strokeWidth="1"
              />

              {/* Intercept Prediction Vector */}
              <line
                x1={interceptorPos.x}
                y1={interceptorPos.y}
                x2={targetPos.x}
                y2={targetPos.y}
                stroke={lockStatus === 'LOCKED' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(234, 179, 8, 0.3)'}
                strokeWidth={lockStatus === 'LOCKED' ? 2 : 1}
                strokeDasharray={lockStatus === 'LOCKED' ? 'none' : '5,5'}
              />

              {/* Trails */}
              <polyline
                points={targetTrail.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="rgba(239, 68, 68, 0.4)"
                strokeWidth="2"
              />
              <polyline
                points={interceptorTrail.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="rgba(6, 182, 212, 0.5)"
                strokeWidth="2"
              />

              {/* TARGET DRONE */}
              <g transform={`translate(${targetPos.x}, ${targetPos.y}) rotate(${targetHeading})`}>
                {/* Target Highlight Ring */}
                {lockStatus !== 'SEARCHING' && (
                   <circle r="30" fill="none" stroke="rgba(239,68,68,0.5)" strokeWidth="1" strokeDasharray="2,2" className="animate-pulse" />
                )}
                <line x1="0" y1="0" x2="40" y2="0" stroke="rgba(239, 68, 68, 0.6)" strokeWidth="2" />
                <path d="M -10 -10 L 10 0 L -10 10 Z" fill="rgb(239, 68, 68)" />
                {lockStatus === 'INTERCEPTED' && (
                    <circle r="40" fill="white" className="animate-ping" opacity="0.8" />
                )}
              </g>

              {/* INTERCEPTOR DRONE */}
              <g transform={`translate(${interceptorPos.x}, ${interceptorPos.y}) rotate(${interceptorHeading})`}>
                <line x1="0" y1="0" x2="50" y2="0" stroke="rgba(6, 182, 212, 0.6)" strokeWidth="2" />
                <path d="M -15 -10 L 15 0 L -15 10 Z" fill="rgb(6, 182, 212)" />
                
                {/* Complex HUD Reticle around drone */}
                <circle r="40" fill="none" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="1" />
                <path d="M 45 0 L 50 0 M -45 0 L -50 0 M 0 45 L 0 50 M 0 -45 L 0 -50" stroke="cyan" strokeWidth="2" />
              </g>

            </svg>
          </div>
        </div>
      </div>
    );
  };

  // Dashboard View Component
  const DashboardView = () => (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 overflow-y-auto">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="bg-cyan-900/20 p-2 rounded-lg border border-cyan-800">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">SENTINEL<span className="text-cyan-500">.AI</span></h1>
            <p className="text-xs text-slate-400 font-mono tracking-wider">ANTI-DRONE DEFENSE SYSTEM V2.4</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
             <span className="text-xs text-slate-500 uppercase">System Status</span>
             <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${systemOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                <span className={`font-mono font-bold ${systemOnline ? 'text-green-500' : 'text-red-500'}`}>
                    {systemOnline ? 'OPERATIONAL' : 'OFFLINE'}
                </span>
             </div>
          </div>
          <div className="flex gap-2">
             <Button 
                onClick={() => setCurrentView('map')} 
                className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(8,145,178,0.5)]"
            >
                <Map className="w-4 h-4 mr-2" />
                TACTICAL MAP
            </Button>
            <Button 
                onClick={() => setCurrentView('visualizer')} 
                variant="outline"
                className="bg-slate-800 hover:bg-slate-700 text-cyan-400 border-cyan-700"
            >
                <Crosshair className="w-4 h-4 mr-2" />
                INTERCEPT VIZ
            </Button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        
        {/* Left Column: Flight Instruments */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
                <Navigation className="w-4 h-4 mr-2 text-cyan-500" /> FLIGHT DATA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-xs text-slate-500 block">ALTITUDE</span>
                  <span className="text-2xl font-mono font-bold text-white">{altitude.toFixed(0)}<span className="text-sm text-slate-500 ml-1">m</span></span>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-xs text-slate-500 block">SPEED</span>
                  <span className="text-2xl font-mono font-bold text-white">22<span className="text-sm text-slate-500 ml-1">m/s</span></span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>BATTERY VOLTAGE</span>
                  <span className={batteryPercent < 30 ? 'text-red-400' : 'text-green-400'}>{batteryVoltage.toFixed(1)}V</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${batteryPercent < 30 ? 'bg-red-500' : 'bg-green-500'}`} 
                    style={{ width: `${batteryPercent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                    <Battery className="w-4 h-4 text-slate-500" />
                    <span className="font-mono text-sm">{batteryPercent.toFixed(0)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
             <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
                    <Satellite className="w-4 h-4 mr-2 text-purple-500" /> GNSS STATUS
                </CardTitle>
             </CardHeader>
             <CardContent>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                         <div className="flex space-x-0.5">
                            {[1,2,3,4].map(i => <div key={i} className="w-1 h-3 bg-green-500 rounded-sm" />)}
                         </div>
                         <span className="text-sm font-mono text-green-400">3D FIX</span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">SATS: {satellites}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                    <div className="bg-slate-950 px-2 py-1 rounded">LAT: {gpsLat.toFixed(6)}</div>
                    <div className="bg-slate-950 px-2 py-1 rounded">LON: {gpsLon.toFixed(6)}</div>
                </div>
             </CardContent>
          </Card>
        </div>

        {/* Center Column: Mission & Security (Wider) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Key Metrics Row */}
           <div className="grid grid-cols-3 gap-4">
              <Card className="bg-slate-900/50 border-slate-800">
                 <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-slate-500 mb-1">TARGET DISTANCE</span>
                    <span className="text-3xl font-bold font-mono text-cyan-400">{(targetDistance).toFixed(0)}m</span>
                 </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-slate-800">
                 <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-slate-500 mb-1">INTERCEPT TIME</span>
                    <span className="text-3xl font-bold font-mono text-orange-400">{timeToIntercept.toFixed(1)}s</span>
                 </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-slate-800">
                 <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-slate-500 mb-1">THREAT LEVEL</span>
                    <span className="text-3xl font-bold font-mono text-red-500 animate-pulse">HIGH</span>
                 </CardContent>
              </Card>
           </div>

           {/* Security & Network Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border-slate-800">
                 <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
                       <Lock className="w-4 h-4 mr-2 text-green-500" /> SECURITY LAYER
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-sm text-slate-300">Link Encryption (AES-256)</span>
                       {encryptionActive ? <Lock className="w-4 h-4 text-green-500" /> : <Unlock className="w-4 h-4 text-red-500" />}
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-sm text-slate-300">Auth Signature</span>
                       <Badge variant="outline" className="text-green-400 border-green-900 bg-green-900/20">VERIFIED</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-sm text-slate-300">Msg Integrity</span>
                       <span className="font-mono text-green-400">{messageIntegrity}%</span>
                    </div>
                 </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                 <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
                       <Wifi className="w-4 h-4 mr-2 text-cyan-500" /> C2 LINK STATUS
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-2">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">SIGNAL STRENGTH</span>
                        <span className="text-cyan-400 font-mono">{linkQuality}%</span>
                    </div>
                    <div className="h-16 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={signalHistory}>
                                <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} dot={false} isAnimationActive={false} />
                                <YAxis domain={[0, 100]} hide />
                            </LineChart>
                         </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between text-xs border-t border-slate-800 pt-2 mt-2">
                       <div className="text-center">
                          <div className="text-slate-500">LATENCY</div>
                          <div className="text-white font-mono">{networkLatency.toFixed(0)}ms</div>
                       </div>
                       <div className="text-center">
                          <div className="text-slate-500">DATA RATE</div>
                          <div className="text-white font-mono">{dataRate.toFixed(1)}kb/s</div>
                       </div>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>

        {/* Right Column: Motor Status & Controls */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                 <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-yellow-500" /> PROPULSION
                 </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="grid grid-cols-2 gap-4">
                    {motors.map((val, idx) => (
                       <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-400">
                             <span>M{idx + 1}</span>
                             <span>{val.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-yellow-500" 
                                style={{ width: `${val}%` }} 
                             />
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                 <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
                    <Terminal className="w-4 h-4 mr-2 text-slate-300" /> SYSTEM CONTROL
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <span className="text-xs text-slate-500 font-bold">FLIGHT MODE</span>
                    <Select value={flightMode} onValueChange={handleModeChange}>
                       <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Mode" />
                       </SelectTrigger>
                       <SelectContent>
                          {FLIGHT_MODES.map(mode => (
                             <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                          ))}
                       </SelectContent>
                    </Select>
                 </div>

                 <Separator />

                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">MASTER ARM</span>
                    <Switch checked={isArmed} onCheckedChange={handleArmToggle} />
                 </div>

                 <Button 
                    variant="destructive" 
                    className="w-full animate-pulse font-bold"
                    onClick={handleEmergencyStop}
                 >
                    <AlertTriangle className="w-4 h-4 mr-2" /> EMERGENCY STOP
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Bottom Panel: Logs */}
      <Card className="bg-slate-900/50 border-slate-800">
         <CardHeader className="py-3">
            <CardTitle className="text-xs font-mono text-slate-400">EVENT LOGS</CardTitle>
         </CardHeader>
         <CardContent className="h-48 overflow-y-auto">
            <div className="space-y-2 font-mono text-sm">
               {logs.map((log, i) => (
                  <div key={i} className="flex gap-4 border-b border-slate-800/50 pb-1 last:border-0">
                     <span className="text-slate-500 w-20 shrink-0">{log.time}</span>
                     <span className={`${
                        log.type === 'warning' ? 'text-red-400' :
                        log.type === 'success' ? 'text-green-400' :
                        'text-cyan-100'
                     }`}>
                        {log.type === 'warning' && '[WARN] '}
                        {log.type === 'success' && '[OK] '}
                        {log.type === 'info' && '[INFO] '}
                        {log.event}
                     </span>
                  </div>
               ))}
            </div>
         </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="bg-slate-950 min-h-screen font-sans selection:bg-cyan-500/30">
      {currentView === 'dashboard' ? <DashboardView /> : 
       currentView === 'map' ? <MapView /> : 
       <VisualizerView setCurrentView={setCurrentView} />
      }
    </div>
  );
}

export default AntiDroneTestBed;