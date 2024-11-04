import { randomUUID, UUID } from "crypto";
import path from "path";
import fs from 'fs';
import { EventEmitter } from "stream";

interface IPerceptron {
    name: string;
    SCount: number;
    ANames: Array<string>;
    W: Array<Array<number>>;
    RBounds: Array<number>;
    learnCount: number;
}

export class Perceptron {
    id: UUID;
    data: IPerceptron;
    constructor(_id?: UUID, data?: IPerceptron) {
        if (_id === undefined) {
            this.id = randomUUID();
            if (data === undefined) throw new Error(`Can't create new perceptron without data`);
            this.data = data;
            this.savePerceptronData();
        } else {
            this.id = _id;
            const data = this.loadPerceptronData();
            if (data === undefined) throw Error(`Unable load Perceptron '${_id}'`);
            this.data = data;
        }
    }

    protected savePerceptronData() {
        if (process.env.data === undefined) throw Error(`Env variable data is undefined`);
        fs.writeFileSync(path.join(process.env.data, `${this.id}.json`), JSON.stringify(this.data, null, 4));
    }
    protected loadPerceptronData(): IPerceptron | undefined {
        const removeJSONComments = (json: string) => {
            return json.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m);
        }

        try {
            if (process.env.data === undefined) throw Error(`Env variable data is undefined`);
            let data = fs.readFileSync(path.join(process.env.data, `${this.id}.json`), "utf-8");
            console.log(`Perceptron '${this.id}' loaded`);
            return JSON.parse(removeJSONComments(data.toString()));
        } catch (err: any) {
            console.error(`Controller not started - ${err.message}`);
        }
    }
    onSChanged(SNumber: number, value: number) {

    }
    makeSynapse(SNumber: number, ev: EventEmitter) {
        ev.on('change', this.onSChanged.bind(this, SNumber));
    }
}