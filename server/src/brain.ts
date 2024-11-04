import fs from 'fs';
import path from 'path';
import { Perceptron } from './perceptron';
import { UUID } from 'crypto';

interface IBrain {

}

export class Brain {
    private neurons: Perceptron[] = [];
    constructor() {
        this.loadNeurons();
    }
    protected loadNeurons() {
        if (process.env.data === undefined) throw Error(`Env variable data is undefined`);
        const dir_content = fs.readdirSync(path.join(process.env.data));
        const neurons = dir_content.filter( file => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}.json$/gm.test(file));
        neurons.forEach(v => this.neurons.push(new Perceptron(v.split(".")[0] as UUID)));
    }
}