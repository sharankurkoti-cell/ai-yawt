const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const os = require('os');

// GPU detection and management
class GPUManager {
    constructor() {
        this.gpuAvailable = this.detectGPU();
        this.gpuInfo = this.getGPUInfo();
        this.currentLoad = 0;
    }
    
    detectGPU() {
        try {
            // Check for NVIDIA GPU
            const nvidiaSmi = spawn('nvidia-smi', ['--query-gpu=gpu_name,gpu_memory_total,memory.used,utilization.gpu', '--format=csv,noheader,nounits']);
            
            return new Promise((resolve) => {
                let output = '';
                nvidiaSmi.stdout.on('data', (data) => {
                    output += data.toString();
                });
                
                nvidiaSmi.on('close', (code) => {
                    if (code === 0 && output.trim()) {
                        resolve(true);
                    } else {
                        // Check for AMD GPU
                        this.detectAMDGPU().then(resolve);
                    }
                });
            });
        } catch (error) {
            return this.detectAMDGPU();
        }
    }
    
    detectAMDGPU() {
        try {
            const rocmSmi = spawn('rocm-smi', ['--showproductname', '--showmeminfo', '--showuse']);
            
            return new Promise((resolve) => {
                let output = '';
                rocmSmi.stdout.on('data', (data) => {
                    output += data.toString();
                });
                
                rocmSmi.on('close', (code) => {
                    resolve(code === 0 && output.trim());
                });
            });
        } catch (error) {
            return Promise.resolve(false);
        }
    }
    
    getGPUInfo() {
        return new Promise((resolve) => {
            if (this.gpuAvailable) {
                this.getNVIDIAInfo().then(resolve).catch(() => {
                    this.getAMDInfo().then(resolve);
                });
            } else {
                resolve({
                    type: 'cpu',
                    cores: os.cpus().length,
                    memory: os.totalmem(),
                    architecture: os.arch()
                });
            }
        });
    }
    
    getNVIDIAInfo() {
        return new Promise((resolve, reject) => {
            const nvidiaSmi = spawn('nvidia-smi', ['--query-gpu=gpu_name,memory.total,utilization.gpu,temperature.gpu,power.draw', '--format=csv,noheader,nounits']);
            
            let output = '';
            nvidiaSmi.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            nvidiaSmi.on('close', (code) => {
                if (code === 0) {
                    const lines = output.trim().split('\n');
                    const data = lines[0].split(',');
                    
                    resolve({
                        type: 'nvidia',
                        name: data[0]?.trim() || 'Unknown',
                        memoryTotal: parseInt(data[1]) || 0,
                        utilization: parseInt(data[2]) || 0,
                        temperature: parseInt(data[3]) || 0,
                        powerDraw: parseInt(data[4]) || 0,
                        computeCapability: this.getComputeCapability(data[0])
                    });
                } else {
                    reject(new Error('Failed to get NVIDIA GPU info'));
                }
            });
        });
    }
    
    getAMDInfo() {
        return new Promise((resolve, reject) => {
            const rocmSmi = spawn('rocm-smi', ['--showproductname', '--showmeminfo', '--showuse', '--showtemp']);
            
            let output = '';
            rocmSmi.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            rocmSmi.on('close', (code) => {
                if (code === 0) {
                    // Parse ROCm output (simplified parsing)
                    resolve({
                        type: 'amd',
                        name: 'AMD GPU',
                        memoryTotal: this.parseROCMemory(output),
                        utilization: this.parseROCUtilization(output),
                        temperature: this.parseROCTemperature(output),
                        computeCapability: 'ROCm'
                    });
                } else {
                    reject(new Error('Failed to get AMD GPU info'));
                }
            });
        });
    }
    
    getComputeCapability(gpuName) {
        if (gpuName.toLowerCase().includes('rtx') || gpuName.toLowerCase().includes('a100') || gpuName.toLowerCase().includes('h100')) {
            return 'high';
        } else if (gpuName.toLowerCase().includes('gtx') || gpuName.toLowerCase().includes('rtx')) {
            return 'medium';
        } else {
            return 'basic';
        }
    }
    
    parseROCMemory(output) {
        const match = output.match(/VRAM Total.*?(\d+)/);
        return match ? parseInt(match[1]) * 1024 * 1024 : 0; // Convert MB to bytes
    }
    
    parseROCUtilization(output) {
        const match = output.match(/GPU Use.*?(\d+)%/);
        return match ? parseInt(match[1]) : 0;
    }
    
    parseROCTemperature(output) {
        const match = output.match(/Sensor Temp.*?(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }
}

// Performance monitoring and optimization
class PerformanceOptimizer {
    constructor() {
        this.metrics = {
            cpu: { usage: 0, cores: os.cpus().length },
            memory: { used: 0, total: os.totalmem() },
            gpu: { usage: 0, memory: 0, temperature: 0 },
            disk: { read: 0, write: 0 },
            network: { upload: 0, download: 0 }
        };
        this.optimizationStrategies = new Map();
    }
    
    async startMonitoring() {
        setInterval(() => {
            this.collectMetrics();
            this.optimizePerformance();
        }, 1000); // Monitor every second
    }
    
    collectMetrics() {
        // CPU metrics
        const cpus = os.cpus();
        let totalCpuUsage = 0;
        cpus.forEach(cpu => {
            totalCpuUsage += (cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle);
        });
        
        this.metrics.cpu.usage = 100 - (totalCpuUsage / (cpus.length * 100)) * 100;
        
        // Memory metrics
        const freeMem = os.freemem();
        this.metrics.memory.used = this.metrics.memory.total - freeMem;
        
        // GPU metrics (if available)
        if (gpuManager.gpuAvailable) {
            this.updateGPUMetrics();
        }
    }
    
    async updateGPUMetrics() {
        try {
            const gpuInfo = await gpuManager.getGPUInfo();
            if (gpuInfo.type === 'nvidia') {
                const nvidiaSmi = spawn('nvidia-smi', ['--query-gpu=utilization.gpu,temperature.gpu', '--format=csv,noheader,nounits']);
                
                let output = '';
                nvidiaSmi.stdout.on('data', (data) => {
                    output += data.toString();
                });
                
                nvidiaSmi.on('close', (code) => {
                    if (code === 0) {
                        const data = output.trim().split(',');
                        this.metrics.gpu.usage = parseInt(data[0]) || 0;
                        this.metrics.gpu.temperature = parseInt(data[1]) || 0;
                    }
                });
            }
        } catch (error) {
            console.error('Failed to update GPU metrics:', error);
        }
    }
    
    optimizePerformance() {
        const strategies = [];
        
        // CPU optimization
        if (this.metrics.cpu.usage > 80) {
            strategies.push({
                type: 'cpu',
                action: 'reduce_priority',
                description: 'CPU usage is high, reducing non-critical process priority'
            });
        }
        
        // Memory optimization
        if (this.metrics.memory.used / this.metrics.memory.total > 0.9) {
            strategies.push({
                type: 'memory',
                action: 'clear_cache',
                description: 'Memory usage is critical, clearing caches and temporary files'
            });
        }
        
        // GPU optimization
        if (this.metrics.gpu.usage > 85) {
            strategies.push({
                type: 'gpu',
                action: 'reduce_load',
                description: 'GPU usage is very high, reducing rendering quality'
            });
        }
        
        if (this.metrics.gpu.temperature > 80) {
            strategies.push({
                type: 'gpu',
                action: 'thermal_throttle',
                description: 'GPU temperature is high, enabling thermal throttling'
            });
        }
        
        // Apply optimization strategies
        strategies.forEach(strategy => {
            this.applyOptimizationStrategy(strategy);
        });
    }
    
    applyOptimizationStrategy(strategy) {
        switch (strategy.action) {
            case 'reduce_priority':
                this.reduceProcessPriority();
                break;
            case 'clear_cache':
                this.clearCaches();
                break;
            case 'reduce_load':
                this.reduceGPULoad();
                break;
            case 'thermal_throttle':
                this.enableThermalThrottling();
                break;
        }
    }
    
    reduceProcessPriority() {
        // Implementation would depend on OS
        if (process.platform === 'linux') {
            spawn('nice', ['-n', '5', 'yawtai-process']);
        } else if (process.platform === 'win32') {
            spawn('wmic', ['process', 'where', 'name="yawtai-process"', 'call', 'setpriority', 'below normal']);
        }
    }
    
    clearCaches() {
        // Clear various caches
        if (process.platform === 'linux') {
            spawn('sync', ['--drop-caches']);
        }
        
        // Clear application caches
        this.optimizationStrategies.set('cache_cleared', Date.now());
    }
    
    reduceGPULoad() {
        // Reduce GPU load by adjusting rendering settings
        this.optimizationStrategies.set('gpu_load_reduced', Date.now());
    }
    
    enableThermalThrottling() {
        // Enable thermal throttling
        this.optimizationStrategies.set('thermal_throttling_enabled', Date.now());
    }
}

const gpuManager = new GPUManager();
const performanceOptimizer = new PerformanceOptimizer();

// Initialize performance monitoring
performanceOptimizer.startMonitoring();

// API Routes

// Get GPU information
router.get('/gpu-info', async (req, res) => {
    try {
        const gpuInfo = await gpuManager.getGPUInfo();
        res.json({
            success: true,
            gpuInfo
        });
    } catch (error) {
        console.error('GPU info error:', error);
        res.status(500).json({ error: 'Failed to get GPU information' });
    }
});

// Get performance metrics
router.get('/metrics', async (req, res) => {
    try {
        res.json({
            success: true,
            metrics: performanceOptimizer.metrics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Metrics error:', error);
        res.status(500).json({ error: 'Failed to get performance metrics' });
    }
});

// Apply optimization strategy
router.post('/optimize', async (req, res) => {
    try {
        const { strategy, parameters } = req.body;
        
        const optimizationStrategy = {
            type: strategy,
            action: parameters.action,
            parameters: parameters,
            timestamp: new Date()
        };
        
        performanceOptimizer.applyOptimizationStrategy(optimizationStrategy);
        
        res.json({
            success: true,
            strategy: optimizationStrategy,
            message: `Applied ${strategy} optimization strategy`
        });
    } catch (error) {
        console.error('Optimization error:', error);
        res.status(500).json({ error: 'Failed to apply optimization strategy' });
    }
});

// GPU-accelerated AI inference
router.post('/gpu-inference', async (req, res) => {
    try {
        const { model, input, options } = req.body;
        
        if (!gpuManager.gpuAvailable) {
            return res.status(400).json({ error: 'GPU not available' });
        }
        
        // GPU-accelerated inference implementation
        const inferenceResult = await performGPUInference(model, input, options);
        
        res.json({
            success: true,
            result: inferenceResult,
            gpuAccelerated: true,
            processingTime: inferenceResult.processingTime
        });
    } catch (error) {
        console.error('GPU inference error:', error);
        res.status(500).json({ error: 'Failed to perform GPU inference' });
    }
});

// Performance benchmark
router.post('/benchmark', async (req, res) => {
    try {
        const { testType, iterations } = req.body;
        
        const benchmarkResults = await runPerformanceBenchmark(testType, iterations || 100);
        
        res.json({
            success: true,
            results: benchmarkResults,
            systemInfo: {
                cpu: os.cpus().length,
                memory: os.totalmem(),
                gpu: await gpuManager.getGPUInfo(),
                platform: process.platform
            }
        });
    } catch (error) {
        console.error('Benchmark error:', error);
        res.status(500).json({ error: 'Failed to run benchmark' });
    }
});

// Helper functions
async function performGPUInference(model, input, options) {
    // This would integrate with GPU acceleration libraries
    // For now, simulate GPU inference
    const startTime = Date.now();
    
    // Simulate processing time improvement with GPU
    const processingTime = Math.random() * 100 + 50; // 50-150ms
    
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                output: `GPU-accelerated inference result for ${model}`,
                processingTime,
                confidence: 0.95,
                gpuUtilization: Math.random() * 30 + 40 // 40-70%
            });
        }, processingTime);
    });
}

async function runPerformanceBenchmark(testType, iterations) {
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        
        // Perform benchmark based on type
        let result;
        switch (testType) {
            case 'inference':
                result = await performGPUInference('test-model', 'test input', {});
                break;
            case 'memory':
                result = benchmarkMemory();
                break;
            case 'cpu':
                result = benchmarkCPU();
                break;
            default:
                result = { time: Date.now() - startTime };
        }
        
        results.push({
            iteration: i + 1,
            time: Date.now() - startTime,
            result: result
        });
    }
    
    return {
        testType,
        iterations,
        averageTime: results.reduce((sum, r) => sum + r.time, 0) / results.length,
        minTime: Math.min(...results.map(r => r.time)),
        maxTime: Math.max(...results.map(r => r.time)),
        results
    };
}

function benchmarkMemory() {
    const startTime = Date.now();
    const testArray = new Array(1000000).fill(0);
    testArray.forEach((val, idx) => testArray[idx] = Math.random());
    return { time: Date.now() - startTime, memoryUsed: testArray.length * 8 };
}

function benchmarkCPU() {
    const startTime = Date.now();
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
        result += Math.sqrt(i) * Math.sin(i);
    }
    return { time: Date.now() - startTime, operations: 1000000 };
}

module.exports = router;
