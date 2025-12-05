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
  Wifi
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const FLIGHT_MODES = ['GUIDED', 'STABILIZE', 'LOITER', 'RTL', 'LAND'];

function AntiDroneTestBed() {
  // View state
  const [currentView, setCurrentView] = useState<'dashboard' | 'map'>('dashboard');
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
      setTargetDistance(prev => Math.max(0, prev - Math.random() * 3));
      setClosingVelocity(prev => Math.max(0, Math.min(50, prev + (Math.random() - 0.5) * 2)));
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

      // Update Signal History Chart
      setSignalHistory(prev => {
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        const newValue = 90 + Math.random() * 10; // Mock signal strength
        const newHistory = [...prev, { time: timeStr, value: newValue }];
        return newHistory.slice(-20); // Keep last 20 points
      });

      // Update interceptor position (move towards target)
      setInterceptorPos(prev => {
        const newTrail = [...interceptorTrail, prev].slice(-30);
        setInterceptorTrail(newTrail);
        
        const dx = targetPos.x - prev.x;
        const dy = targetPos.y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 10) {
          const speed = 3;
          return {
            x: prev.x + (dx / distance) * speed,
            y: prev.y + (dy / distance) * speed
          };
        }
        return prev;
      });
      
      // Update target position (moving in pattern)
      setTargetPos(prev => {
        const newTrail = [...targetTrail, prev].slice(-30);
        setTargetTrail(newTrail);
        
        const time = Date.now() / 1000;
        return {
          x: 600 + Math.cos(time * 0.2) * 100,
          y: 200 + Math.sin(time * 0.3) * 80
        };
      });
      
      // Update headings
      const dx = targetPos.x - interceptorPos.x;
      const dy = targetPos.y - interceptorPos.y;
      setInterceptorHeading(Math.atan2(dy, dx) * (180 / Math.PI));
      setTargetHeading(prev => (prev + 2) % 360);
      
      // Calculate time to intercept
      const dist = Math.sqrt(dx * dx + dy * dy);
      setTimeToIntercept(dist / (closingVelocity || 1));
      setAltitudeDiff(Math.abs(Math.random() * 30 - 15));
    }, 1000 / 30); // 30 FPS

    return () => clearInterval(interval);
  }, [simulationPaused, interceptorPos, targetPos, closingVelocity, interceptorTrail, targetTrail]);

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
    
    const distance = Math.sqrt(
      Math.pow(targetPos.x - interceptorPos.x, 2) + 
      Math.pow(targetPos.y - interceptorPos.y, 2)
    );

    return (
      <div className="fixed inset-0 bg-slate-950 z-50 overflow-hidden">
        {/* Map Header */}
        <div className="absolute top-0 left-0 right-0 bg-slate-900 border-b border-cyan-900 p-4 z-10 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Map className="w-8 h-8 text-cyan-400" />
              <div>
                <h2 className="text-2xl font-bold text-cyan-400 tracking-tight">TACTICAL MAP</h2>
                <p className="text-sm text-slate-400 font-mono">LIVE FEED // SECTOR 7G</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setCurrentView('dashboard')}
                variant="outline"
                className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-cyan-400"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                DASHBOARD
              </Button>
              <div className={`w-3 h-3 rounded-full ${systemOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'} ring-4 ring-slate-900/50`}></div>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-24 left-4 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-4 space-y-4 z-10 w-48 shadow-xl">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Map Configuration</div>
          
          {/* Tracking Mode */}
          <div className="space-y-1">
            <Button
              onClick={() => setTrackingMode('interceptor')}
              variant="outline"
              size="sm"
              className={`w-full justify-start ${trackingMode === 'interceptor' ? 'bg-cyan-900/50 border-cyan-700 text-cyan-100' : 'border-slate-700'}`}
            >
              <Crosshair className="w-3 h-3 mr-2" />
              Interceptor
            </Button>
            <Button
              onClick={() => setTrackingMode('target')}
              variant="outline"
              size="sm"
              className={`w-full justify-start ${trackingMode === 'target' ? 'bg-red-900/50 border-red-700 text-red-100' : 'border-slate-700'}`}
            >
              <Target className="w-3 h-3 mr-2" />
              Target
            </Button>
            <Button
              onClick={() => setTrackingMode('both')}
              variant="outline"
              size="sm"
              className={`w-full justify-start ${trackingMode === 'both' ? 'bg-purple-900/50 border-purple-700 text-purple-100' : 'border-slate-700'}`}
            >
              <Maximize2 className="w-3 h-3 mr-2" />
              Global
            </Button>
          </div>

          <Separator className="bg-slate-700" />
          
          <div className="flex justify-between items-center gap-2">
            <Button
                onClick={() => setMapZoom(prev => Math.max(0.5, prev - 0.25))}
                variant="outline"
                size="sm"
                className="flex-1 bg-slate-800"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
            <Button
                onClick={() => setMapZoom(prev => Math.min(3, prev + 0.25))}
                variant="outline"
                size="sm"
                 className="flex-1 bg-slate-800"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
          </div>

          <Button
            onClick={() => setSimulationPaused(!simulationPaused)}
            variant="outline"
            className={`w-full ${simulationPaused ? 'bg-green-900/50 border-green-700 text-green-400' : 'bg-slate-800 border-slate-700'}`}
          >
            {simulationPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
            {simulationPaused ? 'RESUME' : 'PAUSE'}
          </Button>
        </div>

        {/* Live Stats Overlay */}
        <div className="absolute top-24 right-4 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-4 space-y-3 z-10 w-72 shadow-xl">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Engagement Telemetry</div>
          
          <div className="space-y-3 text-sm font-mono">
            <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded border border-slate-800">
              <span className="text-slate-400">RANGE</span>
              <span className="font-bold text-cyan-400 text-lg">{(distance * 0.5).toFixed(0)}m</span>
            </div>
            <div className="flex justify-between items-center p-1">
              <span className="text-slate-400">CLOSING VEL</span>
              <span className="font-bold text-yellow-400">{closingVelocity.toFixed(1)} m/s</span>
            </div>
            <div className="flex justify-between items-center p-1">
              <span className="text-slate-400">T-INTERCEPT</span>
              <span className="font-bold text-orange-400">{timeToIntercept.toFixed(1)} s</span>
            </div>
            <div className="flex justify-between items-center p-1">
              <span className="text-slate-400">ALT DELTA</span>
              <span className="font-bold">{altitudeDiff.toFixed(1)} m</span>
            </div>
          </div>
        </div>

        {/* Compass */}
        <div className="absolute bottom-8 right-8 bg-slate-900/90 border border-slate-800 rounded-full p-4 z-10 shadow-lg">
          <div className="relative w-24 h-24">
            <Compass className="w-24 h-24 text-slate-600" />
            <div className="absolute inset-0 flex items-center justify-center transform" style={{ transform: `rotate(${-interceptorHeading}deg)`}}>
                <div className="w-0.5 h-12 bg-cyan-500 absolute top-2 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xs font-bold text-cyan-400 bg-slate-900 px-1">N</div>
            </div>
          </div>
        </div>

        {/* Main Map Canvas */}
        <div className="absolute inset-0 flex items-center justify-center pt-0 bg-[#050b14]">
          <svg
            ref={svgRef}
            width={mapWidth}
            height={mapHeight}
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            className="border-0 rounded-lg"
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
                  <stop offset="0%" stopColor="rgba(6,182,212,0.05)" />
                  <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />
            <rect width={mapWidth} height={mapHeight} fill="url(#grid-major)" />

            {/* Engagement zones */}
            <circle
              cx={interceptorPos.x}
              cy={interceptorPos.y}
              r="150"
              fill="url(#radar-sweep)"
              stroke="rgba(6, 182, 212, 0.2)"
              strokeWidth="1"
            />
             <circle
              cx={interceptorPos.x}
              cy={interceptorPos.y}
              r="300"
              fill="none"
              stroke="rgba(6, 182, 212, 0.1)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />

            {/* Target Threat Zone */}
            <circle
              cx={targetPos.x}
              cy={targetPos.y}
              r="80"
              fill="rgba(239, 68, 68, 0.05)"
              stroke="rgba(239, 68, 68, 0.3)"
              strokeWidth="1"
              strokeDasharray="2,2"
            />

            {/* Intercept trajectory line */}
            <line
              x1={interceptorPos.x}
              y1={interceptorPos.y}
              x2={targetPos.x}
              y2={targetPos.y}
              stroke="rgba(234, 179, 8, 0.4)"
              strokeWidth="1"
              strokeDasharray="5,5"
            />

            {/* Target trail */}
            <polyline
              points={targetTrail.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="rgba(239, 68, 68, 0.4)"
              strokeWidth="2"
            />

            {/* Interceptor trail */}
            <polyline
              points={interceptorTrail.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="rgba(6, 182, 212, 0.5)"
              strokeWidth="2"
            />

            {/* Target drone */}
            <g transform={`translate(${targetPos.x}, ${targetPos.y}) rotate(${targetHeading})`}>
              <line x1="0" y1="0" x2="40" y2="0" stroke="rgba(239, 68, 68, 0.6)" strokeWidth="2" />
              <path d="M -10 -10 L 10 0 L -10 10 Z" fill="rgb(239, 68, 68)" />
              <circle r="15" fill="none" stroke="rgb(239, 68, 68)" strokeWidth="1" opacity="0.5" />
            </g>

            {/* Interceptor drone */}
            <g transform={`translate(${interceptorPos.x}, ${interceptorPos.y}) rotate(${interceptorHeading})`}>
              <line x1="0" y1="0" x2="50" y2="0" stroke="rgba(6, 182, 212, 0.6)" strokeWidth="2" />
              <path d="M -15 -10 L 15 0 L -15 10 Z" fill="rgb(6, 182, 212)" />
              
              {/* Complex HUD Reticle around drone */}
              <circle r="30" fill="none" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1" />
              <path d="M 35 0 L 40 0 M -35 0 L -40 0 M 0 35 L 0 40 M 0 -35 L 0 -40" stroke="cyan" strokeWidth="2" />
            </g>
          </svg>
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
          <Button 
            onClick={() => setCurrentView('map')} 
            className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(8,145,178,0.5)]"
          >
            <Map className="w-4 h-4 mr-2" />
            TACTICAL MAP
          </Button>
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
      {currentView === 'dashboard' ? <DashboardView /> : <MapView />}
    </div>
  );
}

export default AntiDroneTestBed;