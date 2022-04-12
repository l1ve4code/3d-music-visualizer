declare const planeMeshParameters: ({
    rotation: {
        x: number;
        y?: undefined;
    };
    scale: number;
    position: {
        x: number;
        y: number;
        z: number;
    };
} | {
    rotation: {
        y: number;
        x?: undefined;
    };
    scale: number;
    position: {
        x: number;
        y: number;
        z: number;
    };
})[];
export default planeMeshParameters;
