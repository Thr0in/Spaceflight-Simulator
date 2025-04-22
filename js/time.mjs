export class Time {
    constructor() {
        this.time = 0; // Time in milliseconds
        this.warpFactor = 1; // Warp factor (1x speed)
        this.lastTimestamp = Date.now();
    }

    setWarpFactor(warpFactor) {
        this.updateTimeStamp();
        this.warpFactor = warpFactor;
    }

    getWarpFactor() {
        return this.warpFactor;
    }

    getTime() {
        return this.time;
    }

    updateTimeStamp() {
        const currentRealTime = Date.now();
        const deltaRealTime = currentRealTime - this.lastTimestamp;
        const deltaGameTime = deltaRealTime * this.warpFactor;
        this.lastTimestamp = currentRealTime;
        this.time += deltaGameTime;
        //console.log(currentRealTime, deltaRealTime, deltaGameTime, this.time);

    }
}